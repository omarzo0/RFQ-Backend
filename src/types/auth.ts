import { Request } from "express";

export interface JWTPayload {
  userId: string;
  companyId?: string;
  userType: "admin" | "company_user";
  role: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  companyId?: string;
  userType: "admin" | "company_user";
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
