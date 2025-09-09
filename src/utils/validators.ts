import { Request, Response, NextFunction } from "express";
import { validationResult, body } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

export const validateEmail = (field = "email") => {
  return body(field)
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail();
};

export const validatePassword = (field = "password") => {
  return body(field)
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    );
};

export const validateStringLength = (
  field: string,
  min: number,
  max: number
) => {
  return body(field)
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters long`)
    .trim();
};
