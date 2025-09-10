import { body } from "express-validator";
import {
  validateEmail,
  validatePassword,
  validateStringLength,
} from "../utils/validators";

export const loginValidation = [
  validateEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const registerCompanyValidation = [
  validateStringLength("companyName", 2, 255),
  validateEmail("companyEmail"),
  validateStringLength("firstName", 2, 100),
  validateStringLength("lastName", 2, 100),
  validateEmail("email"),
  validatePassword(),
  body("phone")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Phone number too long"),
  body("domain")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Domain too long"),
];

export const refreshTokenValidation = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  validatePassword("newPassword"),
];

export const createCompanyUserValidation = [
  validateEmail("email"),
  validatePassword(),
  body("companyId")
    .notEmpty()
    .withMessage("Company ID is required")
    .isUUID()
    .withMessage("Company ID must be a valid UUID"),
  validateStringLength("firstName", 2, 100),
  validateStringLength("lastName", 2, 100),
  body("role")
    .optional()
    .isIn(["ADMIN", "MANAGER", "EMPLOYEE"])
    .withMessage("Role must be ADMIN, MANAGER, or EMPLOYEE"),
];
