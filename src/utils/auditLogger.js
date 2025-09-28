import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

// Audit Actions
export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  VIEW: "VIEW",
  EXPORT: "EXPORT",
  PRINT: "PRINT",
};

// Entity Types
export const ENTITY_TYPES = {
  PET: "pet",
  APPOINTMENT: "appointment",
  MEDICAL_RECORD: "medical_record",
  VACCINATION: "vaccination",
  INVOICE: "invoice",
  PAYMENT: "payment",
  USER_PROFILE: "user_profile",
  BILLING_SUMMARY: "billing_summary",
  SYSTEM_SETTING: "system_setting",
};

// Severity Levels
export const SEVERITY_LEVELS = {
  LOW: "low",
  INFO: "info",
  WARNING: "warning",
  HIGH: "high",
  CRITICAL: "critical",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: "appointment_reminder",
  VACCINATION_DUE: "vaccination_due",
  PAYMENT_OVERDUE: "payment_overdue",
  SYSTEM_ALERT: "system_alert",
  AUDIT_ALERT: "audit_alert",
  WELCOME: "welcome",
  INVOICE_GENERATED: "invoice_generated",
  PAYMENT_RECEIVED: "payment_received",
};

// Main audit logging function
export const auditLog = async ({
  action,
  entityType,
  entityId = null,
  entityName = null,
  oldValues = null,
  newValues = null,
  changesSummary = null,
  severity = SEVERITY_LEVELS.INFO,
  metadata = null,
}) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("Audit log attempted without authenticated user");
      return null;
    }

    const { data, error } = await supabase.rpc("create_audit_log", {
      p_user_id: user.id,
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_entity_name: entityName,
      p_old_values: oldValues,
      p_new_values: newValues,
      p_changes_summary: changesSummary,
      p_severity: severity,
      p_metadata: metadata,
    });

    if (error) {
      console.log("Audit log error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.log("Audit log exception:", error);
    return null;
  }
};

// Specific audit functions for common operations
export const auditPetCreation = async (petData) => {
  return auditLog({
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.PET,
    entityId: petData.id,
    entityName: petData.name,
    newValues: petData,
    changesSummary: `Created pet profile for ${petData.name} (${petData.species})`,
    severity: SEVERITY_LEVELS.INFO,
  });
};

export const auditPetUpdate = async (petId, petName, oldData, newData) => {
  const changes = getChanges(oldData, newData);
  return auditLog({
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.PET,
    entityId: petId,
    entityName: petName,
    oldValues: oldData,
    newValues: newData,
    changesSummary: `Updated pet ${petName}: ${changes.join(", ")}`,
    severity: SEVERITY_LEVELS.INFO,
  });
};

export const auditPetDeletion = async (petData) => {
  return auditLog({
    action: AUDIT_ACTIONS.DELETE,
    entityType: ENTITY_TYPES.PET,
    entityId: petData.id,
    entityName: petData.name,
    oldValues: petData,
    changesSummary: `Deleted pet profile for ${petData.name}`,
    severity: SEVERITY_LEVELS.WARNING,
  });
};

export const auditAppointmentCreation = async (appointmentData, petName) => {
  return auditLog({
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.APPOINTMENT,
    entityId: appointmentData.id,
    entityName: `${petName} - ${appointmentData.appointment_type}`,
    newValues: appointmentData,
    changesSummary: `Scheduled ${appointmentData.appointment_type} appointment for ${petName} on ${appointmentData.appointment_date}`,
    severity: SEVERITY_LEVELS.INFO,
  });
};

export const auditAppointmentUpdate = async (
  appointmentId,
  appointmentName,
  oldData,
  newData
) => {
  const changes = getChanges(oldData, newData);
  return auditLog({
    action: AUDIT_ACTIONS.UPDATE,
    entityType: ENTITY_TYPES.APPOINTMENT,
    entityId: appointmentId,
    entityName: appointmentName,
    oldValues: oldData,
    newValues: newData,
    changesSummary: `Updated appointment ${appointmentName}: ${changes.join(
      ", "
    )}`,
    severity: SEVERITY_LEVELS.INFO,
  });
};

export const auditInvoiceCreation = async (invoiceData) => {
  return auditLog({
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.INVOICE,
    entityId: invoiceData.id,
    entityName: `Invoice #${invoiceData.invoice_number}`,
    newValues: invoiceData,
    changesSummary: `Created invoice #${invoiceData.invoice_number} for ₱${invoiceData.total_amount}`,
    severity: SEVERITY_LEVELS.INFO,
  });
};

export const auditInvoicePrint = async (invoiceData) => {
  return auditLog({
    action: AUDIT_ACTIONS.PRINT,
    entityType: ENTITY_TYPES.INVOICE,
    entityId: invoiceData.id,
    entityName: `Invoice #${invoiceData.invoice_number}`,
    changesSummary: `Printed invoice #${invoiceData.invoice_number}`,
    severity: SEVERITY_LEVELS.INFO,
    metadata: { format: "PDF", timestamp: new Date().toISOString() },
  });
};

export const auditPaymentCreation = async (paymentData, invoiceNumber) => {
  return auditLog({
    action: AUDIT_ACTIONS.CREATE,
    entityType: ENTITY_TYPES.PAYMENT,
    entityId: paymentData.id,
    entityName: `Payment for Invoice #${invoiceNumber}`,
    newValues: paymentData,
    changesSummary: `Recorded payment of ₱${paymentData.amount} for invoice #${invoiceNumber} via ${paymentData.payment_method}`,
    severity: SEVERITY_LEVELS.INFO,
  });
};

export const auditUserLogin = async () => {
  return auditLog({
    action: AUDIT_ACTIONS.LOGIN,
    entityType: ENTITY_TYPES.USER_PROFILE,
    changesSummary: "User logged in to the system",
    severity: SEVERITY_LEVELS.INFO,
  });
};

export const auditUserLogout = async () => {
  return auditLog({
    action: AUDIT_ACTIONS.LOGOUT,
    entityType: ENTITY_TYPES.USER_PROFILE,
    changesSummary: "User logged out of the system",
    severity: SEVERITY_LEVELS.INFO,
  });
};

// Notification functions
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = null,
  priority = "normal",
  actionUrl = null,
  expiresAt = null,
}) => {
  try {
    const { data: result, error } = await supabase.rpc("create_notification", {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_message: message,
      p_data: data,
      p_priority: priority,
      p_action_url: actionUrl,
      p_expires_at: expiresAt,
    });

    if (error) {
      console.error("Notification creation error:", error);
      return null;
    }

    return result;
  } catch (error) {
    console.error("Notification creation exception:", error);
    return null;
  }
};

// Get user notifications
export const getUserNotifications = async (
  userId = null,
  limit = 20,
  offset = 0
) => {
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Get notifications error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Get notifications exception:", error);
    return [];
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const { error } = await supabase.rpc("mark_notification_read", {
      notification_uuid: notificationId,
    });

    if (error) {
      console.error("Mark notification read error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Mark notification read exception:", error);
    return false;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId = null) => {
  try {
    const { data, error } = await supabase.rpc(
      "get_unread_notification_count",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("Get unread count error:", error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error("Get unread count exception:", error);
    return 0;
  }
};

// Get recent audit activities
export const getRecentAuditActivities = async (limit = 10, userId = null) => {
  try {
    let query = supabase
      .from("recent_audit_activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Get audit activities error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Get audit activities exception:", error);
    return [];
  }
};

// Helper function to calculate changes between old and new values
const getChanges = (oldData, newData) => {
  const changes = [];

  if (!oldData || !newData) return changes;

  Object.keys(newData).forEach((key) => {
    if (oldData[key] !== newData[key]) {
      if (key === "updated_at" || key === "created_at") return; // Skip timestamp fields

      const fieldName = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      changes.push(
        `${fieldName} changed from "${oldData[key]}" to "${newData[key]}"`
      );
    }
  });

  return changes;
};

// Specific notification creators
export const createAppointmentReminder = async (
  userId,
  appointmentData,
  petName
) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
    title: "Upcoming Appointment",
    message: `Reminder: ${petName} has an appointment scheduled for ${new Date(
      appointmentData.appointment_date
    ).toLocaleDateString()} at ${appointmentData.appointment_time}`,
    priority: "high",
    data: { appointmentId: appointmentData.id, petName },
    actionUrl: "/dashboard/owner#appointments",
  });
};

export const createVaccinationDueNotification = async (
  userId,
  petName,
  vaccinationType,
  dueDate
) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.VACCINATION_DUE,
    title: "Vaccination Due",
    message: `${petName}'s ${vaccinationType} vaccination is due on ${new Date(
      dueDate
    ).toLocaleDateString()}`,
    priority: "high",
    data: { petName, vaccinationType, dueDate },
    actionUrl: "/dashboard/owner#vaccinations",
  });
};

export const createInvoiceGeneratedNotification = async (
  userId,
  invoiceData
) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.INVOICE_GENERATED,
    title: "New Invoice Generated",
    message: `Invoice #${invoiceData.invoice_number} has been generated for ₱${
      invoiceData.total_amount
    }. Due date: ${new Date(invoiceData.due_date).toLocaleDateString()}`,
    priority: "normal",
    data: {
      invoiceId: invoiceData.id,
      invoiceNumber: invoiceData.invoice_number,
    },
    actionUrl: "/dashboard/owner#billing",
  });
};

export const createPaymentReceivedNotification = async (
  userId,
  paymentData,
  invoiceNumber
) => {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
    title: "Payment Received",
    message: `Payment of ₱${paymentData.amount} received for Invoice #${invoiceNumber}`,
    priority: "normal",
    data: {
      paymentId: paymentData.id,
      invoiceNumber,
      amount: paymentData.amount,
    },
    actionUrl: "/dashboard/owner#billing",
  });
};
