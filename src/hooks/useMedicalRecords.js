import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
// import { logAuditAction } from '../utils/auditLogger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

export const useMedicalRecords = (userId, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMedicalRecord = async (recordData) => {
    try {
      setLoading(true);
      setError(null);

      const dataToInsert = {
        ...recordData,
        owner_id: userId,
      };

      const { data, error } = await supabase
        .from("medical_records")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;

      // Log audit action
      // await logAuditAction(
      //   userId,
      //   'CREATE',
      //   'medical_record',
      //   data.id,
      //   null,
      //   dataToInsert,
      //   `Created medical record for ${recordData.pet_name || 'pet'}`
      // );

      if (onSuccess) onSuccess();
      return { success: true, data };
    } catch (error) {
      console.error("Error creating medical record:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateMedicalRecord = async (recordId, recordData) => {
    try {
      setLoading(true);
      setError(null);

      // Get original data for audit
      const { data: originalData } = await supabase
        .from("medical_records")
        .select("*")
        .eq("id", recordId)
        .single();

      const { data, error } = await supabase
        .from("medical_records")
        .update(recordData)
        .eq("id", recordId)
        .select()
        .single();

      if (error) throw error;

      // Log audit action
      await logAuditAction(
        userId,
        "UPDATE",
        "medical_record",
        recordId,
        originalData,
        recordData,
        "Updated medical record"
      );

      if (onSuccess) onSuccess();
      return { success: true, data };
    } catch (error) {
      console.error("Error updating medical record:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteMedicalRecord = async (recordId) => {
    try {
      setLoading(true);
      setError(null);

      // Get original data for audit
      const { data: originalData } = await supabase
        .from("medical_records")
        .select("*")
        .eq("id", recordId)
        .single();

      const { error } = await supabase
        .from("medical_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      // Log audit action
      await logAuditAction(
        userId,
        "DELETE",
        "medical_record",
        recordId,
        originalData,
        null,
        "Deleted medical record"
      );

      if (onSuccess) onSuccess();
      return { success: true };
    } catch (error) {
      console.error("Error deleting medical record:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const createVaccination = async (vaccinationData) => {
    try {
      setLoading(true);
      setError(null);

      const dataToInsert = {
        ...vaccinationData,
        owner_id: userId,
      };

      const { data, error } = await supabase
        .from("vaccinations")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;

      // Log audit action
      await logAuditAction(
        userId,
        "CREATE",
        "vaccination",
        data.id,
        null,
        dataToInsert,
        `Recorded vaccination: ${vaccinationData.vaccine_name}`
      );

      if (onSuccess) onSuccess();
      return { success: true, data };
    } catch (error) {
      console.error("Error creating vaccination record:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateVaccination = async (vaccinationId, vaccinationData) => {
    try {
      setLoading(true);
      setError(null);

      // Get original data for audit
      const { data: originalData } = await supabase
        .from("vaccinations")
        .select("*")
        .eq("id", vaccinationId)
        .single();

      const { data, error } = await supabase
        .from("vaccinations")
        .update(vaccinationData)
        .eq("id", vaccinationId)
        .select()
        .single();

      if (error) throw error;

      // Log audit action
      await logAuditAction(
        userId,
        "UPDATE",
        "vaccination",
        vaccinationId,
        originalData,
        vaccinationData,
        "Updated vaccination record"
      );

      if (onSuccess) onSuccess();
      return { success: true, data };
    } catch (error) {
      console.error("Error updating vaccination:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteVaccination = async (vaccinationId) => {
    try {
      setLoading(true);
      setError(null);

      // Get original data for audit
      const { data: originalData } = await supabase
        .from("vaccinations")
        .select("*")
        .eq("id", vaccinationId)
        .single();

      const { error } = await supabase
        .from("vaccinations")
        .delete()
        .eq("id", vaccinationId);

      if (error) throw error;

      // Log audit action
      await logAuditAction(
        userId,
        "DELETE",
        "vaccination",
        vaccinationId,
        originalData,
        null,
        "Deleted vaccination record"
      );

      if (onSuccess) onSuccess();
      return { success: true };
    } catch (error) {
      console.error("Error deleting vaccination:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get upcoming vaccination reminders
  const getVaccinationReminders = async (petId) => {
    try {
      const { data, error } = await supabase
        .from("vaccination_details")
        .select("*")
        .eq("pet_id", petId)
        .not("next_due_date", "is", null)
        .gte("next_due_date", new Date().toISOString().split("T")[0])
        .lte(
          "next_due_date",
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        )
        .order("next_due_date", { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error getting vaccination reminders:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    error,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    createVaccination,
    updateVaccination,
    deleteVaccination,
    getVaccinationReminders,
  };
};
