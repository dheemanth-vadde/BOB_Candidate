// utils/validation.js

export const validateWithConfirm = (value, confirmValue, options = {}) => {
  const {
    required = false,
    fieldName = "Field",
  } = options;

  const trimmed = value ? String(value).trim() : "";
  const trimmedConfirm = confirmValue ? String(confirmValue).trim() : "";

  // If field is required → value must exist
  if (required && trimmed === "") {
    return { valid: false, message: `${fieldName} is required.` };
  }

  // If field is NOT required and empty → valid (ignore confirm)
  if (!required && trimmed === "") {
    return { valid: true };
  }

  // If confirm value missing when field has data
  if (trimmedConfirm === "") {
    return { valid: false, message: `Confirm ${fieldName.toLowerCase()} is required.` };
  }

  // Must match
  if (trimmed !== trimmedConfirm) {
    return {
      valid: false,
      message: `${fieldName} and Confirm ${fieldName} must match.`,
    };
  }

  return { valid: true };
};

export const validateRequired = (value, fieldName = "Field") => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return {
      valid: false,
      message: `${fieldName} is required.`,
    };
  }

  return { valid: true };
};

export const validateDropdown = (value, options = [], fieldName = "Field") => {
  // Convert to trimmed string safely
  const trimmed = value !== null && value !== undefined ? String(value).trim() : "";

  // Mandatory: must have a selection
  if (trimmed === "") {
    return { valid: false, message: `${fieldName} is required.` };
  }

  // Must match one of the allowed dropdown options
  if (!options.includes(trimmed)) {
    return { 
      valid: false, 
      message: `Invalid ${fieldName.toLowerCase()} selected.` 
    };
  }

  return { valid: true };
};

export const validateConditionalRequired = (
  value,
  condition,
  fieldName = "Field"
) => {
  const trimmed = value ? String(value).trim() : "";

  // If condition is FALSE ⇒ field is NOT required
  if (!condition) {
    return { valid: true };
  }

  // If condition is TRUE ⇒ field becomes required
  if (trimmed === "") {
    return { valid: false, message: `${fieldName} is required.` };
  }

  return { valid: true };
};

export const validateConditionalWithLength = (
  value,
  condition,
  fieldName = "Field",
  maxLength = null
) => {
  const trimmed = value ? String(value).trim() : "";

  // If condition is FALSE ⇒ field not required
  if (!condition) {
    return { valid: true };
  }

  // Condition is TRUE → field becomes required
  if (trimmed === "") {
    return { valid: false, message: `${fieldName} is required.` };
  }

  // Max length check (only if provided)
  if (maxLength !== null && trimmed.length > maxLength) {
    return { 
      valid: false, 
      message: `${fieldName} cannot exceed ${maxLength} characters.` 
    };
  }

  return { valid: true };
};

export const validateConditionalDropdown = (
  value,
  condition,
  options = [],
  fieldName = "Field"
) => {
  const trimmed = value !== null && value !== undefined ? String(value).trim() : "";

  // If condition is FALSE ⇒ field is NOT required
  if (!condition) {
    return { valid: true };
  }

  // Condition TRUE ⇒ dropdown is required
  if (trimmed === "") {
    return { valid: false, message: `${fieldName} is required.` };
  }

  // Must match allowed dropdown values
  if (!options.includes(trimmed)) {
    return { 
      valid: false, 
      message: `Invalid ${fieldName.toLowerCase()} selected.` 
    };
  }

  return { valid: true };
};

export const validateEndDateAfterStart = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: true }; // don't block incomplete input
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: "Invalid date format" };
  }

  if (end < start) {
    return {
      isValid: false,
      error: "End date cannot be before Start date"
    };
  }

  return { isValid: true };
};
