import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useRescheduleHistory = (appointmentId) => {
  const [rescheduleHistory, setRescheduleHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRescheduleHistory = async () => {
    if (!appointmentId) {
      setRescheduleHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("appointment_reschedules")
        .select(`
          *,
          rescheduled_by_user:rescheduled_by (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(`✅ Loaded ${data?.length || 0} reschedule records for appointment ${appointmentId}`);
      setRescheduleHistory(data || []);
    } catch (error) {
      console.error("Error fetching reschedule history:", error);
      setRescheduleHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescheduleHistory();
  }, [appointmentId]);

  return {
    rescheduleHistory,
    loading,
    refreshHistory: fetchRescheduleHistory,
  };
};