/**
 * Validation helpers for invoice forms.
 * Used alongside React Hook Form.
 */

export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return true;
  },

  email: (value) => {
    if (!value) return true; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Invalid email address';
  },

  phone: (value) => {
    if (!value) return true; // Allow empty
    // Indian phone: 10 digits, optionally with +91 or 0 prefix
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6-9]\d{9}$/;
    return phoneRegex.test(value.replace(/[\s\-]/g, '')) || 'Invalid phone number';
  },

  positiveNumber: (value) => {
    const num = parseFloat(value);
    return (!isNaN(num) && num > 0) || 'Must be a positive number';
  },

  minLength: (min) => (value) => {
    return (value && value.length >= min) || `Must be at least ${min} characters`;
  },

  maxLength: (max) => (value) => {
    return (!value || value.length <= max) || `Must be less than ${max} characters`;
  },
};

/**
 * Validate that at least one service is properly filled.
 * @param {Array} services - Array of service line items
 * @returns {string|true}
 */
export const validateServices = (services) => {
  if (!services || services.length === 0) {
    return 'Add at least one service';
  }

  const hasValidService = services.some(
    (s) => s.description?.trim() && s.rate > 0
  );

  if (!hasValidService) {
    return 'Add at least one service with a description and rate';
  }

  return true;
};
