import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

export interface CompanyRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    companyId: string;
  };
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends Error {
  public details: any[];

  constructor(message: string, details: any[] = []) {
    super(message);
    this.details = details;
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

export interface NextFunction {
  (err?: any): void;
}
