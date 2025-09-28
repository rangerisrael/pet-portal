import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.NEXT_PUBLIC_PET_PORTAL_ANON
);

// Default settings
export const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  currency: 'PHP',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  timezone: 'UTC',
  auto_save: true,
  sound_enabled: true,
  desktop_notifications: true,
  email_frequency: 'immediate'
};

// Setting categories
export const SETTING_CATEGORIES = {
  GENERAL: 'general',
  APPEARANCE: 'appearance',
  NOTIFICATIONS: 'notifications',
  SECURITY: 'security',
  PRIVACY: 'privacy'
};

// Get user preference
export const getUserPreference = async (userId, preferenceKey, defaultValue = null) => {
  try {
    const { data, error } = await supabase.rpc('get_user_preference', {
      p_user_id: userId,
      p_preference_key: preferenceKey
    });

    if (error) {
      console.error('Error getting user preference:', error);
      return defaultValue;
    }

    // If no preference found, return default
    if (!data || Object.keys(data).length === 0) {
      return defaultValue || DEFAULT_SETTINGS[preferenceKey] || null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user preference:', error);
    return defaultValue;
  }
};

// Set user preference
export const setUserPreference = async (userId, preferenceKey, preferenceValue, category = SETTING_CATEGORIES.GENERAL) => {
  try {
    const { error } = await supabase.rpc('set_user_preference', {
      p_user_id: userId,
      p_preference_key: preferenceKey,
      p_preference_value: JSON.stringify(preferenceValue),
      p_category: category
    });

    if (error) {
      console.error('Error setting user preference:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting user preference:', error);
    return false;
  }
};

// Get all user preferences
export const getAllUserPreferences = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }

    // Convert to object format
    const preferences = {};
    data.forEach(pref => {
      preferences[pref.preference_key] = pref.preference_value;
    });

    return preferences;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {};
  }
};

// Set multiple user preferences
export const setMultipleUserPreferences = async (userId, preferences) => {
  try {
    const updates = Object.entries(preferences).map(([key, value]) => ({
      user_id: userId,
      preference_key: key,
      preference_value: value,
      category: getCategoryForPreference(key)
    }));

    const { error } = await supabase
      .from('user_preferences')
      .upsert(updates, { onConflict: 'user_id,preference_key' });

    if (error) {
      console.error('Error setting multiple user preferences:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting multiple user preferences:', error);
    return false;
  }
};

// Get category for preference key
const getCategoryForPreference = (preferenceKey) => {
  const categoryMap = {
    theme: SETTING_CATEGORIES.APPEARANCE,
    language: SETTING_CATEGORIES.GENERAL,
    currency: SETTING_CATEGORIES.GENERAL,
    date_format: SETTING_CATEGORIES.GENERAL,
    time_format: SETTING_CATEGORIES.GENERAL,
    timezone: SETTING_CATEGORIES.GENERAL,
    auto_save: SETTING_CATEGORIES.GENERAL,
    sound_enabled: SETTING_CATEGORIES.GENERAL,
    desktop_notifications: SETTING_CATEGORIES.NOTIFICATIONS,
    email_frequency: SETTING_CATEGORIES.NOTIFICATIONS
  };

  return categoryMap[preferenceKey] || SETTING_CATEGORIES.GENERAL;
};

// Log security event
export const logSecurityEvent = async (userId, eventType, eventData = {}, severity = 'info') => {
  try {
    const { data, error } = await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_event_data: eventData,
      p_severity: severity
    });

    if (error) {
      console.error('Error logging security event:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error logging security event:', error);
    return null;
  }
};

// Get user security events
export const getUserSecurityEvents = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting security events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting security events:', error);
    return [];
  }
};

// Get active user sessions
export const getActiveUserSessions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('login_at', { ascending: false });

    if (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

// Create backup request
export const createBackupRequest = async (userId, requestType = 'full_export') => {
  try {
    const { data, error } = await supabase.rpc('create_backup_request', {
      p_user_id: userId,
      p_request_type: requestType
    });

    if (error) {
      console.error('Error creating backup request:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating backup request:', error);
    return null;
  }
};

// Get backup requests
export const getBackupRequests = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('backup_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting backup requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting backup requests:', error);
    return [];
  }
};

// Export user data
export const exportUserData = async (userId) => {
  try {
    // Get all user-related data
    const [
      profile,
      pets,
      appointments,
      medicalRecords,
      vaccinations,
      invoices,
      payments,
      notifications,
      auditLogs,
      preferences
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('pets').select('*').eq('owner_id', userId),
      supabase.from('appointments').select('*').eq('owner_id', userId),
      supabase.from('medical_records').select('*').eq('owner_id', userId),
      supabase.from('vaccinations').select('*').eq('owner_id', userId),
      supabase.from('invoices').select('*').eq('owner_id', userId),
      supabase.from('payments').select('*, invoices!inner(owner_id)').eq('invoices.owner_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId),
      supabase.from('audit_logs').select('*').eq('user_id', userId),
      getAllUserPreferences(userId)
    ]);

    const exportData = {
      export_info: {
        user_id: userId,
        export_date: new Date().toISOString(),
        version: '1.0'
      },
      profile: profile.data,
      pets: pets.data || [],
      appointments: appointments.data || [],
      medical_records: medicalRecords.data || [],
      vaccinations: vaccinations.data || [],
      invoices: invoices.data || [],
      payments: payments.data || [],
      notifications: notifications.data || [],
      audit_logs: auditLogs.data || [],
      preferences: preferences
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    return null;
  }
};

// Apply theme settings
export const applyThemeSettings = (theme) => {
  const root = document.documentElement;
  
  switch (theme) {
    case 'dark':
      root.classList.add('dark');
      break;
    case 'light':
      root.classList.remove('dark');
      break;
    case 'auto':
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      break;
    default:
      root.classList.remove('dark');
  }
};

// Format date according to user preference
export const formatDateForUser = (date, format = 'MM/DD/YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  switch (format) {
    case 'DD/MM/YYYY':
      return d.toLocaleDateString('en-GB');
    case 'YYYY-MM-DD':
      return d.toISOString().split('T')[0];
    case 'MM/DD/YYYY':
    default:
      return d.toLocaleDateString('en-US');
  }
};

// Format time according to user preference
export const formatTimeForUser = (time, format = '12h') => {
  if (!time) return '';
  
  const t = new Date(`2000-01-01 ${time}`);
  
  switch (format) {
    case '24h':
      return t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    case '12h':
    default:
      return t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
};

// Format currency according to user preference
export const formatCurrencyForUser = (amount, currency = 'PHP') => {
  if (amount === null || amount === undefined) return '';
  
  switch (currency) {
    case 'USD':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    case 'EUR':
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
    case 'PHP':
    default:
      return `₱${parseFloat(amount).toLocaleString()}`;
  }
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return {
    score,
    strength,
    checks,
    suggestions: generatePasswordSuggestions(checks)
  };
};

// Generate password suggestions
const generatePasswordSuggestions = (checks) => {
  const suggestions = [];
  
  if (!checks.length) suggestions.push('Use at least 8 characters');
  if (!checks.uppercase) suggestions.push('Add uppercase letters');
  if (!checks.lowercase) suggestions.push('Add lowercase letters');
  if (!checks.numbers) suggestions.push('Add numbers');
  if (!checks.special) suggestions.push('Add special characters');
  
  return suggestions;
};

// Clean up expired sessions (client-side trigger)
export const cleanupExpiredSessions = async () => {
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_sessions');
    
    if (error) {
      console.error('Error cleaning up sessions:', error);
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return 0;
  }
};

// Settings validation
export const validateSettings = (settings) => {
  const errors = {};
  
  // Validate theme
  if (settings.theme && !['light', 'dark', 'auto'].includes(settings.theme)) {
    errors.theme = 'Invalid theme selection';
  }
  
  // Validate language
  if (settings.language && !['en', 'fil', 'es'].includes(settings.language)) {
    errors.language = 'Invalid language selection';
  }
  
  // Validate currency
  if (settings.currency && !['PHP', 'USD', 'EUR'].includes(settings.currency)) {
    errors.currency = 'Invalid currency selection';
  }
  
  // Validate date format
  if (settings.date_format && !['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(settings.date_format)) {
    errors.date_format = 'Invalid date format selection';
  }
  
  // Validate time format
  if (settings.time_format && !['12h', '24h'].includes(settings.time_format)) {
    errors.time_format = 'Invalid time format selection';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};