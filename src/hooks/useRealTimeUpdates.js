import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

export const useRealTimeUpdates = (userId, callbacks = {}) => {
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    if (!userId) return;

    // Clean up existing subscriptions
    subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    subscriptionsRef.current = [];

    // Subscribe to appointments changes
    if (callbacks.onAppointmentChange) {
      const appointmentSub = supabase
        .channel('appointments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `owner_id=eq.${userId}`
          },
          (payload) => {
            callbacks.onAppointmentChange(payload);
          }
        )
        .subscribe();

      subscriptionsRef.current.push(appointmentSub);
    }

    // Subscribe to pets changes
    if (callbacks.onPetChange) {
      const petSub = supabase
        .channel('pets')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pets',
            filter: `owner_id=eq.${userId}`
          },
          (payload) => {
            callbacks.onPetChange(payload);
          }
        )
        .subscribe();

      subscriptionsRef.current.push(petSub);
    }

    // Subscribe to medical records changes
    if (callbacks.onMedicalRecordChange) {
      const medicalSub = supabase
        .channel('medical_records')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'medical_records',
            filter: `owner_id=eq.${userId}`
          },
          (payload) => {
            callbacks.onMedicalRecordChange(payload);
          }
        )
        .subscribe();

      subscriptionsRef.current.push(medicalSub);
    }

    // Subscribe to invoices changes
    if (callbacks.onInvoiceChange) {
      const invoiceSub = supabase
        .channel('invoices')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invoices',
            filter: `owner_id=eq.${userId}`
          },
          (payload) => {
            callbacks.onInvoiceChange(payload);
          }
        )
        .subscribe();

      subscriptionsRef.current.push(invoiceSub);
    }

    // Subscribe to payments changes
    if (callbacks.onPaymentChange) {
      const paymentSub = supabase
        .channel('payments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments'
          },
          async (payload) => {
            // Check if this payment belongs to user's invoices
            if (payload.new) {
              const { data: invoice } = await supabase
                .from('invoices')
                .select('owner_id')
                .eq('id', payload.new.invoice_id)
                .single();
              
              if (invoice && invoice.owner_id === userId) {
                callbacks.onPaymentChange(payload);
              }
            }
          }
        )
        .subscribe();

      subscriptionsRef.current.push(paymentSub);
    }

    // Subscribe to vaccinations changes
    if (callbacks.onVaccinationChange) {
      const vaccinationSub = supabase
        .channel('vaccinations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vaccinations',
            filter: `owner_id=eq.${userId}`
          },
          (payload) => {
            callbacks.onVaccinationChange(payload);
          }
        )
        .subscribe();

      subscriptionsRef.current.push(vaccinationSub);
    }

    // Cleanup function
    return () => {
      subscriptionsRef.current.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [userId, callbacks]);

  // Manual cleanup function
  const cleanup = () => {
    subscriptionsRef.current.forEach(sub => sub.unsubscribe());
    subscriptionsRef.current = [];
  };

  return { cleanup };
};