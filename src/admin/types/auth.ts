export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AdminRole;
    isActive: boolean;
    lastLoginAt?: Date;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  domain?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "CANCELED";
  trialEndsAt?: Date;
  emailFooter?: string;
  defaultFollowUpDays?: number;
  autoFollowUpEnabled?: boolean;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string;
}

export interface CompanyListResponse {
  companies: {
    id: string;
    name: string;
    email: string;
    domain?: string;
    phone?: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userCount: number;
    lastActivityAt?: Date;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export enum AdminRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export interface AdminDashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalRFQs: number;
  totalQuotes: number;
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    companyName?: string;
  }[];
}
