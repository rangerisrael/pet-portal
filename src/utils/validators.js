// Form validation utilities

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number format';
  }
  return null;
};

export const validatePositiveNumber = (value, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

export const validateDate = (date, fieldName) => {
  if (!date) {
    return `${fieldName} is required`;
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return `${fieldName} cannot be in the past`;
  }
  return null;
};

export const validateAppointmentForm = (formData) => {
  const errors = {};
  
  const requiredFields = {
    pet_id: 'Pet selection',
    appointment_date: 'Appointment date',
    appointment_time: 'Appointment time',
    reason_for_visit: 'Reason for visit'
  };
  
  Object.entries(requiredFields).forEach(([field, label]) => {
    const error = validateRequired(formData[field], label);
    if (error) errors[field] = error;
  });
  
  if (formData.appointment_date) {
    const dateError = validateDate(formData.appointment_date, 'Appointment date');
    if (dateError) errors.appointment_date = dateError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validatePetForm = (formData) => {
  const errors = {};
  
  const nameError = validateRequired(formData.name, 'Pet name');
  if (nameError) errors.name = nameError;
  
  const speciesError = validateRequired(formData.species, 'Species');
  if (speciesError) errors.species = speciesError;
  
  if (formData.weight_kg) {
    const weightError = validatePositiveNumber(formData.weight_kg, 'Weight');
    if (weightError) errors.weight_kg = weightError;
  }
  
  if (formData.emergency_contact_phone) {
    const phoneError = validatePhone(formData.emergency_contact_phone);
    if (phoneError) errors.emergency_contact_phone = phoneError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};