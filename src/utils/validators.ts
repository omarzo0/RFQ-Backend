import { body, param, query, ValidationChain } from "express-validator";

// UUID validation
export const validateUUID = (field: string): ValidationChain =>
  param(field).isUUID().withMessage(`${field} must be a valid UUID`);

// Email validation
export const validateEmail = (field: string = "email"): ValidationChain =>
  body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage("Must be a valid email address");

// Password validation
export const validatePassword = (field: string = "password"): ValidationChain =>
  body(field)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    );

// String length validation
export const validateStringLength = (
  field: string,
  min: number = 1,
  max: number = 255
): ValidationChain =>
  body(field)
    .isString()
    .trim()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`);

// Optional string validation
export const validateOptionalString = (
  field: string,
  max: number = 255
): ValidationChain =>
  body(field)
    .optional()
    .isString()
    .trim()
    .isLength({ max })
    .withMessage(`${field} must be less than ${max} characters`);

// Number validation
export const validateNumber = (
  field: string,
  min?: number,
  max?: number
): ValidationChain => {
  let validator = body(field)
    .isNumeric()
    .withMessage(`${field} must be a number`);

  if (min !== undefined) {
    validator = validator.custom((value) => {
      if (parseFloat(value) < min) {
        throw new Error(`${field} must be at least ${min}`);
      }
      return true;
    });
  }

  if (max !== undefined) {
    validator = validator.custom((value) => {
      if (parseFloat(value) > max) {
        throw new Error(`${field} must be at most ${max}`);
      }
      return true;
    });
  }

  return validator;
};

// Date validation
export const validateDate = (field: string): ValidationChain =>
  body(field).isISO8601().toDate().withMessage(`${field} must be a valid date`);

// Array validation
export const validateArray = (
  field: string,
  minItems?: number,
  maxItems?: number
): ValidationChain => {
  let validator = body(field)
    .isArray()
    .withMessage(`${field} must be an array`);

  if (minItems !== undefined) {
    validator = validator
      .isLength({ min: minItems })
      .withMessage(`${field} must have at least ${minItems} items`);
  }

  if (maxItems !== undefined) {
    validator = validator
      .isLength({ max: maxItems })
      .withMessage(`${field} must have at most ${maxItems} items`);
  }

  return validator;
};

// Pagination validation
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
];

// Sort validation
export const validateSort = (allowedFields: string[]) => [
  query("sortBy")
    .optional()
    .isIn(allowedFields)
    .withMessage(`Sort field must be one of: ${allowedFields.join(", ")}`),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];
