export interface CompanyLoginCredentials {
  email: string;
  password: string;
}

export interface CompanyLoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    userType: "COMPANY_USER";
    companyId: string;
    companyName: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface CompanyProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  company: {
    id: string;
    name: string;
    email: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
  };
}

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export interface CompanyDashboardStats {
  totalRFQs: number;
  activeRFQs: number;
  totalQuotes: number;
  totalContacts: number;
  totalShippingLines: number;
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }[];
}

export interface CompanyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    userType: "COMPANY_USER";
    companyId: string;
  };
}
