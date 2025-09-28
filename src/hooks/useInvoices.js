import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
// import { logAuditAction } from '../utils/auditLogger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

export const useInvoices = (userId, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createInvoice = async (invoiceData, items) => {
    try {
      setLoading(true);
      setError(null);

      // Calculate totals
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      const taxAmount = (subtotal * (invoiceData.tax_rate || 0)) / 100;
      const totalAmount =
        subtotal + taxAmount - (invoiceData.discount_amount || 0);

      const dataToInsert = {
        ...invoiceData,
        owner_id: userId,
        subtotal_amount: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        balance_due: totalAmount,
        status: "pending",
      };

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([dataToInsert])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = items.map((item) => ({
        ...item,
        invoice_id: invoice.id,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Log audit action
      // await logAuditAction(
      //   userId,
      //   "CREATE",
      //   "invoice",
      //   invoice.id,
      //   null,
      //   { ...dataToInsert, items: itemsToInsert },
      //   `Created invoice #${invoice.invoice_number}`
      // );

      if (onSuccess) onSuccess();
      return { success: true, data: invoice };
    } catch (error) {
      console.error("Error creating invoice:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (invoiceId, invoiceData, items) => {
    try {
      setLoading(true);
      setError(null);

      // Get original data for audit
      const { data: originalData } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();

      // Calculate totals
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      const taxAmount = (subtotal * (invoiceData.tax_rate || 0)) / 100;
      const totalAmount =
        subtotal + taxAmount - (invoiceData.discount_amount || 0);
      const paidAmount = originalData.total_amount - originalData.balance_due;

      const dataToUpdate = {
        ...invoiceData,
        subtotal_amount: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        balance_due: totalAmount - paidAmount,
      };

      // Update invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .update(dataToUpdate)
        .eq("id", invoiceId)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Delete existing items and create new ones
      await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);

      const itemsToInsert = items.map((item) => ({
        ...item,
        invoice_id: invoiceId,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Log audit action
      await logAuditAction(
        userId,
        "UPDATE",
        "invoice",
        invoiceId,
        originalData,
        { ...dataToUpdate, items: itemsToInsert },
        `Updated invoice #${invoice.invoice_number}`
      );

      if (onSuccess) onSuccess();
      return { success: true, data: invoice };
    } catch (error) {
      console.error("Error updating invoice:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      setError(null);

      // Get original data for audit
      const { data: originalData } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();

      // Check if invoice has payments
      const { data: payments } = await supabase
        .from("payments")
        .select("id")
        .eq("invoice_id", invoiceId);

      if (payments && payments.length > 0) {
        throw new Error(
          "Cannot delete invoice with payments. Please void the payments first."
        );
      }

      // Delete invoice items first
      await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);

      // Delete invoice
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);

      if (error) throw error;

      // Log audit action
      await logAuditAction(
        userId,
        "DELETE",
        "invoice",
        invoiceId,
        originalData,
        null,
        `Deleted invoice #${originalData.invoice_number}`
      );

      if (onSuccess) onSuccess();
      return { success: true };
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async (paymentData) => {
    try {
      setLoading(true);
      setError(null);

      // Get invoice details
      const { data: invoice } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", paymentData.invoice_id)
        .single();

      if (!invoice) throw new Error("Invoice not found");

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert([paymentData])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update invoice balance
      const newBalance = invoice.balance_due - paymentData.amount;
      const newStatus = newBalance <= 0 ? "paid" : "partial";

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          balance_due: newBalance,
          status: newStatus,
        })
        .eq("id", paymentData.invoice_id);

      if (updateError) throw updateError;

      // Log audit action
      await logAuditAction(
        userId,
        "CREATE",
        "payment",
        payment.id,
        null,
        paymentData,
        `Recorded payment of ₱${paymentData.amount} for invoice #${invoice.invoice_number}`
      );

      if (onSuccess) onSuccess();
      return { success: true, data: payment };
    } catch (error) {
      console.error("Error recording payment:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
  };
};
