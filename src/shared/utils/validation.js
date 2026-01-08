// utils/validation.js

import { toast } from "react-toastify";

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

export const validateNonEmptyText = (value) => {
  if (typeof value !== "string") {
    return { isValid: false, error: "Invalid text value" };
  }

  if (value.trim().length === 0) {
    return { isValid: false, error: "This field cannot be empty" };
  }

  return { isValid: true };
};

export const isStrongPassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-]).{8,}$/;
  return strongPasswordRegex.test(password);
};

export const validatePhoneNumber = (phone) => {
  // strictly digits only
  if (!/^\d+$/.test(phone)) {
    // toast.error("Mobile number must contain only numbers");
    return false;
  }

  // exactly 10 digits
  if (phone.length !== 10) {
    // toast.error("Mobile number must be exactly 10 digits");
    return false;
  }

  return true;
};

export const MAX_FILE_SIZE_MB = 2;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export const sanitizeName = (value = "") => {
  return value
    .replace(/\s+/g, " ")   // collapse multiple spaces
    .trim();                // remove leading/trailing spaces
};

export const isValidName = (value = "") => {
  return NAME_REGEX.test(value);
};

export const isAllowedNameChar = (char) => {
  return /^[A-Za-z ]$/.test(char);
};

const COMMON_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];

export const validateFile = ({
  file,
  allowedExtensions = COMMON_ALLOWED_EXTENSIONS,
  maxSizeBytes = MAX_FILE_SIZE_BYTES,
  errorPrefix = "File"
}) => {
  if (!file) return false;

  const ext = file.name.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    toast.error(
      `${errorPrefix} must be of type: ${allowedExtensions.join(", ").toUpperCase()}`
    );
    return false;
  }

  if (file.size > maxSizeBytes) {
    toast.error(`${errorPrefix} size must be under 2MB`);
    return false;
  }

  return true;
};
export const isValidCollegeName = (value = "") => {
  const trimmed = value.trim();
  return /^[A-Za-z ]+$/.test(trimmed);
};
