import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues, validationFn) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = useCallback(() => {
    if (validationFn) {
      const validation = validationFn(values);
      setErrors(validation.errors || {});
      return validation.isValid;
    }
    return true;
  }, [values, validationFn]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return false;
    }

    try {
      await onSubmit(values);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validateForm,
    handleSubmit,
    reset
  };
};