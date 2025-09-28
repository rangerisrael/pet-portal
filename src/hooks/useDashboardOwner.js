import { useMemo } from 'react';
import { useDashboard } from './useDashboard';
import { useAppointments } from './useAppointments';
import { usePets } from './usePets';
import { useInvoices } from './useInvoices';
import { useMedicalRecords } from './useMedicalRecords';
import { useNotifications } from './useNotifications';
import { useFilters } from './useFilters';
import { useRealTimeUpdates } from './useRealTimeUpdates';

/**
 * Comprehensive hook for managing dashboard owner functionality
 * Combines all dashboard-related hooks and provides a unified interface
 */
export const useDashboardOwner = () => {
  // Main dashboard state and data
  const dashboard = useDashboard();

  // CRUD operations hooks with callbacks to refresh data
  const appointments = useAppointments(dashboard.user?.id, dashboard.loadAppointments);
  const pets = usePets(dashboard.user?.id, dashboard.loadPets);
  const invoices = useInvoices(dashboard.user?.id, dashboard.loadInvoices);
  const medicalRecords = useMedicalRecords(dashboard.user?.id, dashboard.loadMedicalRecords);
  const notifications = useNotifications(dashboard.user?.id);

  // Filtering hooks for each data type
  const appointmentFilters = useFilters(dashboard.appointments, {
    status: dashboard.filterStatus,
    sortBy: dashboard.sortBy,
    searchTerm: dashboard.searchTerm
  });

  const petFilters = useFilters(dashboard.pets);
  const invoiceFilters = useFilters(dashboard.invoices);
  const medicalRecordFilters = useFilters(dashboard.medicalRecords);

  // Real-time updates
  useRealTimeUpdates(dashboard.user?.id, {
    onAppointmentChange: (payload) => {
      console.log('Appointment changed:', payload);
      dashboard.loadAppointments();
    },
    onPetChange: (payload) => {
      console.log('Pet changed:', payload);
      dashboard.loadPets();
    },
    onInvoiceChange: (payload) => {
      console.log('Invoice changed:', payload);
      dashboard.loadInvoices();
    },
    onMedicalRecordChange: (payload) => {
      console.log('Medical record changed:', payload);
      dashboard.loadMedicalRecords();
    },
    onPaymentChange: (payload) => {
      console.log('Payment changed:', payload);
      dashboard.loadInvoices(); // Reload invoices to update balances
    },
    onVaccinationChange: (payload) => {
      console.log('Vaccination changed:', payload);
      dashboard.loadMedicalRecords();
    }
  });

  // Computed dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalPets = dashboard.pets.length;
    const totalAppointments = dashboard.appointments.length;
    const upcomingAppointments = dashboard.appointments.filter(apt => 
      new Date(apt.appointment_date) >= new Date() && apt.status !== 'cancelled'
    ).length;
    const recentMedicalRecords = dashboard.medicalRecords.filter(record =>
      new Date(record.record_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const pendingInvoices = dashboard.invoices.filter(inv => 
      inv.status === 'pending' || inv.status === 'overdue'
    ).length;
    const totalSpent = dashboard.invoices.reduce((sum, inv) => 
      sum + ((inv.total_amount - inv.balance_due) || 0), 0
    );

    return {
      totalPets,
      totalAppointments,
      upcomingAppointments,
      recentMedicalRecords,
      pendingInvoices,
      totalSpent
    };
  }, [dashboard.pets, dashboard.appointments, dashboard.medicalRecords, dashboard.invoices]);

  // Combined actions for complex operations
  const combinedActions = {
    // Create appointment and optionally create pet if needed
    createAppointmentWithPet: async (appointmentData, petData = null) => {
      try {
        let petId = appointmentData.pet_id;
        
        // Create pet first if needed
        if (petData && !petId) {
          const petResult = await pets.createPet(petData);
          if (!petResult.success) {
            return petResult;
          }
          petId = petResult.data.id;
        }

        // Create appointment
        const appointmentResult = await appointments.createAppointment({
          ...appointmentData,
          pet_id: petId
        });

        return appointmentResult;
      } catch (error) {
        console.error('Error creating appointment with pet:', error);
        return { success: false, error: error.message };
      }
    },

    // Delete pet and all related data
    deletePetWithRelatedData: async (petId) => {
      try {
        // Check for scheduled appointments
        const scheduledAppointments = dashboard.appointments.filter(apt => 
          apt.pet_id === petId && apt.status === 'scheduled'
        );

        if (scheduledAppointments.length > 0) {
          return { 
            success: false, 
            error: 'Cannot delete pet with scheduled appointments. Please cancel appointments first.' 
          };
        }

        // Delete pet (related medical records will be handled by database cascading)
        const result = await pets.deletePet(petId);
        return result;
      } catch (error) {
        console.error('Error deleting pet with related data:', error);
        return { success: false, error: error.message };
      }
    },

    // Complete appointment and create medical record
    completeAppointmentWithRecord: async (appointmentId, medicalRecordData) => {
      try {
        // Update appointment status to completed
        const appointmentResult = await appointments.updateAppointmentStatus(appointmentId, 'completed');
        if (!appointmentResult.success) {
          return appointmentResult;
        }

        // Create medical record if provided
        if (medicalRecordData) {
          const recordResult = await medicalRecords.createMedicalRecord(medicalRecordData);
          if (!recordResult.success) {
            // Rollback appointment status change
            await appointments.updateAppointmentStatus(appointmentId, 'confirmed');
            return recordResult;
          }
        }

        return { success: true };
      } catch (error) {
        console.error('Error completing appointment with record:', error);
        return { success: false, error: error.message };
      }
    }
  };

  // Navigation helpers
  const navigation = {
    goToSection: (section) => {
      dashboard.setActiveSection(section);
    },
    openAppointmentForm: (appointment = null) => {
      if (appointment) {
        dashboard.setSelectedAppointment(appointment);
        dashboard.setShowEditForm(true);
      } else {
        dashboard.setShowCreateForm(true);
      }
    },
    openPetForm: (pet = null) => {
      if (pet) {
        dashboard.setSelectedPet(pet);
        dashboard.setShowEditPetForm(true);
      } else {
        dashboard.setShowPetForm(true);
      }
    },
    openInvoiceForm: (invoice = null) => {
      if (invoice) {
        dashboard.setSelectedInvoice(invoice);
        dashboard.setShowEditInvoice(true);
      } else {
        dashboard.setShowCreateInvoice(true);
      }
    }
  };

  return {
    // Core dashboard data and state
    ...dashboard,
    
    // CRUD operations
    appointments,
    pets,
    invoices,
    medicalRecords,
    notifications,
    
    // Filtering
    appointmentFilters,
    petFilters,
    invoiceFilters,
    medicalRecordFilters,
    
    // Computed stats
    dashboardStats,
    
    // Combined actions
    ...combinedActions,
    
    // Navigation helpers
    navigation,
    
    // Utility functions
    utils: {
      refreshAll: dashboard.refreshDashboard,
      isLoading: dashboard.loading || 
                 appointments.loading || 
                 pets.loading || 
                 invoices.loading || 
                 medicalRecords.loading,
      hasErrors: !!(appointments.error || pets.error || invoices.error || medicalRecords.error)
    }
  };
};