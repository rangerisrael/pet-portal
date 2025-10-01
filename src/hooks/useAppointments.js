import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from 'react-toastify';
import {
  auditAppointmentCreation,
  auditAppointmentUpdate,
} from "@/utils/auditLogger";
import { VetPetShowForm } from "@/utils/global-state/dashboard/vet-owner.glb";
import { VetAppointmentShowForm } from "@/utils/global-state/dashboard/vet-owner.glb";

export const useAppointments = (user, userRole = 'pet-owner') => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setShowPetForm] = VetAppointmentShowForm();

  const fetchAppointments = async () => {
    // For vet-owner, fetch all appointments; for pet-owner, only their own
    if (!user?.id && userRole !== 'vet-owner' && userRole !== 'main-branch') {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let query = supabase.from("appointment_details").select("*");

      // For pet-owner, filter by owner_id
      if (userRole === 'pet-owner' && user?.id) {
        query = query.eq("owner_id", user.id);
        console.log('🔒 Fetching appointments for pet-owner:', user.id);
        console.log('🔍 Pet-owner user object:', user);
      }
      // For main-branch, get branch_id from veterinary_staff table using assigned_id
      else if (userRole === 'main-branch' && user?.id) {
        console.log('🏥 Fetching branch for main-branch user:', user.id);

        // Get staff record to find designated_branch_id
        const { data: staffData, error: staffError } = await supabase
          .from("veterinary_staff")
          .select("designated_branch_id, staff_name")
          .eq("assigned_id", user.id)
          .single();

        if (staffError) {
          console.log('❌ Error fetching staff data:', staffError);
        } else if (staffData?.designated_branch_id) {
          console.log('🏥 Found designated branch:', staffData.designated_branch_id, 'for staff:', staffData.staff_name);
          query = query.eq("branch_id", staffData.designated_branch_id);
        } else {
          console.log('⚠️ No designated branch found for user, showing no appointments');
          setAppointments([]);
          setLoading(false);
          return;
        }
      }
      // For vet-owner, get all appointments
      else if (userRole === 'vet-owner') {
        console.log('👨‍⚕️ Fetching all appointments for vet-owner');
      }

      const { data, error } = await query
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: false });

      if (error) {
        console.log('❌ Error fetching appointments:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} appointments for ${userRole}`);
      console.log('📋 Appointment data:', data);
      setAppointments(data || []);
    } catch (error) {
      console.log("Error fetching appointments:", error);
      console.log("Using empty appointments list (demo mode available)");
      setAppointments([]);
    } finally {
      setLoading(false);
      setShowPetForm(false);
    }
  };

  const createAppointment = async (appointmentData, pets, selectedColor) => {
    if (!user?.id) {
      toast.error("User not authenticated. Please log in to book appointments.");
      return;
    }

    // Validate required fields
    if (!appointmentData.pet_id || !appointmentData.appointment_date || !appointmentData.appointment_time || !appointmentData.reason_for_visit) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if pet already has an active appointment (not completed or cancelled)
    const activeStatuses = ['scheduled', 'confirmed', 'in_progress'];
    const existingActiveAppointments = appointments.filter(
      appointment =>
        appointment.pet_id === appointmentData.pet_id &&
        activeStatuses.includes(appointment.status?.toLowerCase())
    );

    if (existingActiveAppointments.length > 0) {
      const petName = pets?.find(p => p.id === appointmentData.pet_id)?.name || "This pet";
      toast.error(`${petName} already has an active appointment. Please wait for it to be completed or cancelled before scheduling another.`);
      return;
    }

    console.log("Creating appointment with data:", appointmentData);

    try {
      const cleanedData = {
        ...appointmentData,
        estimated_cost:
          appointmentData.estimated_cost === ""
            ? null
            : parseFloat(appointmentData.estimated_cost),
        duration_minutes:
          appointmentData.duration_minutes === ""
            ? 30
            : parseInt(appointmentData.duration_minutes),
        branch_id: appointmentData.branch_id === "" ? null : parseInt(appointmentData.branch_id),
        owner_id: user.id,
        color_code: selectedColor || "#EA580C",
        created_by: user.id,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      };

      // Try database insertion first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("appointments")
            .insert([cleanedData])
            .select();

          if (error) {
            // If database fails, fall back to local mock
            console.log('Database insertion failed, using demo mode:', error);
            throw error;
          }

          await fetchAppointments();

          if (data?.[0]) {
            const petName =
              pets?.find((p) => p.id === appointmentData.pet_id)?.name ||
              "Unknown Pet";
            try {
              await auditAppointmentCreation(data[0], petName);
            } catch (auditError) {
              console.warn('Audit logging failed:', auditError);
            }
            setShowPetForm(false);
          }

          toast.success("Appointment created successfully!");
          return data[0];
        } catch (dbError) {
          console.log('Database error, falling back to demo mode:', dbError);
          // Fall through to mock mode
        }
      }

      // Fallback to mock mode
      const newAppointment = {
        ...cleanedData,
        id: 'appointment-' + Date.now(),
        updated_at: new Date().toISOString(),
        // Add pet and branch info for display
        pet_name: pets?.find((p) => p.id === appointmentData.pet_id)?.name || "Unknown Pet",
        pet_species: pets?.find((p) => p.id === appointmentData.pet_id)?.species || "unknown",
        branch_name: "Demo Branch",
      };

      // Add to local state
      setAppointments(prev => [newAppointment, ...prev]);
      setShowPetForm(false);
      toast.success("Appointment created successfully! (Demo mode)");
      return newAppointment;

    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Error creating appointment: " + error.message);
      throw error;
    }
  };

  const updateAppointment = async (appointmentId, updates, pets) => {
    try {
      const cleanedUpdates = {
        ...updates,
        estimated_cost:
          updates.estimated_cost === ""
            ? null
            : parseFloat(updates.estimated_cost),
        duration_minutes:
          updates.duration_minutes === ""
            ? null
            : parseInt(updates.duration_minutes),
        branch_id: updates.branch_id === "" ? null : parseInt(updates.branch_id),
      };

      const { error } = await supabase
        .from("appointments")
        .update(cleanedUpdates)
        .eq("id", appointmentId);

      if (error) throw error;

      await fetchAppointments();

      const petName =
        pets.find((p) => p.id === updates.pet_id)?.name || "Unknown Pet";
      await auditAppointmentUpdate(appointmentId, updates, petName);

      toast.success("Appointment updated successfully!");
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Error updating appointment: " + error.message);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) throw error;

      await fetchAppointments();
      toast.success("Appointment deleted successfully!");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Error deleting appointment: " + error.message);
    }
  };

  const rescheduleAppointment = async (rescheduleData) => {
    try {
      const {
        appointmentId,
        oldDate,
        oldTime,
        oldBranchId,
        newDate,
        newTime,
        newBranchId,
        reason
      } = rescheduleData;

      // Prepare update data
      const updateData = {
        appointment_date: newDate,
        appointment_time: newTime,
        updated_at: new Date().toISOString(),
      };

      // Only update branch if it's different
      if (newBranchId && newBranchId !== oldBranchId) {
        updateData.branch_id = parseInt(newBranchId);
      }

      // Start a transaction to update appointment and create reschedule record
      const { error: updateError } = await supabase
        .from("appointments")
        .update(updateData)
        .eq("id", appointmentId);

      if (updateError) throw updateError;

      // Create reschedule history record
      const { error: rescheduleError } = await supabase
        .from("appointment_reschedules")
        .insert([{
          appointment_id: appointmentId,
          old_date: oldDate,
          old_time: oldTime,
          new_date: newDate,
          new_time: newTime,
          reason: reason || null,
          rescheduled_by: user.id,
        }]);

      if (rescheduleError) throw rescheduleError;

      await fetchAppointments();
      toast.success("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Error rescheduling appointment: " + error.message);
    }
  };

  const approveAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);

      if (error) throw error;

      await fetchAppointments();
      toast.success("Appointment approved successfully!");
    } catch (error) {
      console.error("Error approving appointment:", error);
      toast.error("Error approving appointment: " + error.message);
    }
  };

  const rejectAppointment = async (appointmentId, reason = null) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId);

      if (error) throw error;

      await fetchAppointments();
      toast.success("Appointment rejected successfully!");
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast.error("Error rejecting appointment: " + error.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Separate effect for real-time subscriptions
  useEffect(() => {
    // Set up real-time subscription for appointments
    if (!user?.id && userRole !== 'vet-owner' && userRole !== 'main-branch') {
      return;
    }

    const setupSubscription = async () => {
      console.log('🔌 Setting up real-time subscription for appointments');

      // For main-branch, get the branch_id first
      let mainBranchId = null;
      if (userRole === 'main-branch' && user?.id) {
        const { data: staffData } = await supabase
          .from("veterinary_staff")
          .select("designated_branch_id")
          .eq("assigned_id", user.id)
          .single();

        mainBranchId = staffData?.designated_branch_id;
        console.log('🏥 Real-time subscription for branch:', mainBranchId);
      }

      const channel = supabase
        .channel('appointment-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'appointments'
        }, (payload) => {
          console.log('🔄 Real-time appointment update:', payload.eventType, payload);

          // Helper function to check if appointment belongs to current context
          const shouldShowAppointment = (appointmentData) => {
            if (userRole === 'pet-owner') {
              return appointmentData.owner_id === user.id;
            } else if (userRole === 'main-branch') {
              // For main-branch, check branch_id
              return appointmentData.branch_id === mainBranchId;
            } else if (userRole === 'vet-owner') {
              return true; // Vet owner sees all
            }
            return false;
          };

          switch (payload.eventType) {
            case 'INSERT':
              if (!shouldShowAppointment(payload.new)) {
                return;
              }
              // Fetch full appointment details to get joined data
              console.log('➕ New appointment detected, refetching...');
              fetchAppointments();
              break;

            case 'UPDATE':
              if (!shouldShowAppointment(payload.new)) {
                return;
              }
              // Fetch full appointment details to get joined data
              console.log('✏️ Appointment updated, refetching...');
              fetchAppointments();
              break;

            case 'DELETE':
              if (!shouldShowAppointment(payload.old)) {
                return;
              }
              console.log('🗑️ Appointment deleted, updating list...');
              setAppointments((oldAppointments) =>
                oldAppointments.filter(item => item.id !== payload.old.id)
              );
              break;

            default:
              break;
          }
        })
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        console.log('🔌 Unsubscribing from appointment changes');
        channel.unsubscribe();
      };
    };

    setupSubscription();
  }, [user?.id, userRole]);

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    rescheduleAppointment,
    approveAppointment,
    rejectAppointment,
    refreshAppointments: fetchAppointments,
  };
};
