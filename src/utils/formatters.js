// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date, time) => {
  if (!date) return '';
  const formattedDate = new Date(date).toLocaleDateString();
  if (!time) return formattedDate;
  
  const formattedTime = new Date(`2000-01-01 ${time}`).toLocaleTimeString([], {
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  return `${formattedDate} at ${formattedTime}`;
};

export const formatTime = (time) => {
  if (!time) return '';
  return new Date(`2000-01-01 ${time}`).toLocaleTimeString([], {
    hour: '2-digit', 
    minute: '2-digit'
  });
};

// Currency formatting utilities
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  return `₱${parseFloat(amount).toLocaleString()}`;
};

// Text formatting utilities
export const formatEnumText = (text) => {
  if (!text) return '';
  return text.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Pet age formatting
export const formatPetAge = (ageYears, ageMonths) => {
  const parts = [];
  if (ageYears) parts.push(`${ageYears} years`);
  if (ageMonths) parts.push(`${ageMonths} months`);
  return parts.join(' ');
};

// Status badge helper
export const getStatusClassName = (status, statusColors) => {
  return statusColors[status] || statusColors.default || 'bg-gray-100 text-gray-800';
};