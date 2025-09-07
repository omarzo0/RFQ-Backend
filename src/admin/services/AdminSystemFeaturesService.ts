import { prisma } from "../../app";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";

export interface SystemFeatureCreateData {
  name: string;
  description: string;
  category:
    | "DASHBOARD"
    | "RFQ_MANAGEMENT"
    | "QUOTE_MANAGEMENT"
    | "EMAIL_MANAGEMENT"
    | "ANALYTICS"
    | "USER_MANAGEMENT"
    | "SETTINGS"
    | "INTEGRATIONS";
  isActive: boolean;
  isPremium: boolean;
  requiredRole: "ADMIN" | "MANAGER" | "EMPLOYEE";
  icon?: string;
  route?: string;
  permissions?: string[];
}

export interface SystemFeatureUpdateData {
  name?: string;
  description?: string;
  category?:
    | "DASHBOARD"
    | "RFQ_MANAGEMENT"
    | "QUOTE_MANAGEMENT"
    | "EMAIL_MANAGEMENT"
    | "ANALYTICS"
    | "USER_MANAGEMENT"
    | "SETTINGS"
    | "INTEGRATIONS";
  isActive?: boolean;
  isPremium?: boolean;
  requiredRole?: "ADMIN" | "MANAGER" | "EMPLOYEE";
  icon?: string;
  route?: string;
  permissions?: string[];
}

export interface SystemFeatureFilters {
  page?: number;
  limit?: number;
  category?: string;
  isActive?: boolean;
  isPremium?: boolean;
  requiredRole?: string;
  search?: string;
}

export interface SystemFeatureResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  isPremium: boolean;
  requiredRole: string;
  icon?: string;
  route?: string;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    companyFeatures: number;
  };
}

export class AdminSystemFeaturesService {
  /**
   * Create a new system feature
   */
  async createFeature(data: SystemFeatureCreateData) {
    try {
      const feature = await prisma.systemFeature.create({
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          isActive: data.isActive,
          isPremium: data.isPremium,
          requiredRole: data.requiredRole,
          icon: data.icon,
          route: data.route,
          permissions: data.permissions || [],
        },
      });

      logger.info(`System feature created: ${feature.name}`);

      return feature;
    } catch (error) {
      logger.error("Error creating system feature:", error);
      throw new AppError("Failed to create system feature", 500);
    }
  }

  /**
   * Get all system features with filtering and pagination
   */
  async getFeatures(filters: SystemFeatureFilters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        isActive,
        isPremium,
        requiredRole,
        search,
      } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (category) where.category = category;
      if (isActive !== undefined) where.isActive = isActive;
      if (isPremium !== undefined) where.isPremium = isPremium;
      if (requiredRole) where.requiredRole = requiredRole;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [features, total] = await Promise.all([
        prisma.systemFeature.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                companyFeatures: true,
              },
            },
          },
        }),
        prisma.systemFeature.count({ where }),
      ]);

      return {
        features,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Error getting system features:", error);
      throw new AppError("Failed to get system features", 500);
    }
  }

  /**
   * Get feature by ID
   */
  async getFeatureById(featureId: string) {
    try {
      const feature = await prisma.systemFeature.findUnique({
        where: { id: featureId },
        include: {
          _count: {
            select: {
              companyFeatures: true,
            },
          },
        },
      });

      if (!feature) {
        throw new AppError("System feature not found", 404);
      }

      return feature;
    } catch (error) {
      logger.error("Error getting system feature by ID:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get system feature", 500);
    }
  }

  /**
   * Update system feature
   */
  async updateFeature(featureId: string, data: SystemFeatureUpdateData) {
    try {
      const existingFeature = await prisma.systemFeature.findUnique({
        where: { id: featureId },
      });

      if (!existingFeature) {
        throw new AppError("System feature not found", 404);
      }

      const updatedFeature = await prisma.systemFeature.update({
        where: { id: featureId },
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          isActive: data.isActive,
          isPremium: data.isPremium,
          requiredRole: data.requiredRole,
          icon: data.icon,
          route: data.route,
          permissions: data.permissions,
        },
        include: {
          _count: {
            select: {
              companyFeatures: true,
            },
          },
        },
      });

      logger.info(`System feature updated: ${featureId}`);

      return updatedFeature;
    } catch (error) {
      logger.error("Error updating system feature:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update system feature", 500);
    }
  }

  /**
   * Delete system feature
   */
  async deleteFeature(featureId: string) {
    try {
      const existingFeature = await prisma.systemFeature.findUnique({
        where: { id: featureId },
      });

      if (!existingFeature) {
        throw new AppError("System feature not found", 404);
      }

      // Check if feature is being used by any companies
      const companyFeatureCount = await prisma.companyFeature.count({
        where: { featureId },
      });

      if (companyFeatureCount > 0) {
        throw new ValidationError(
          "Cannot delete feature that is being used by companies"
        );
      }

      await prisma.systemFeature.delete({
        where: { id: featureId },
      });

      logger.info(`System feature deleted: ${featureId}`);

      return { message: "System feature deleted successfully" };
    } catch (error) {
      logger.error("Error deleting system feature:", error);
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      throw new AppError("Failed to delete system feature", 500);
    }
  }

  /**
   * Get features by category
   */
  async getFeaturesByCategory(category: string) {
    try {
      const features = await prisma.systemFeature.findMany({
        where: {
          category: category as any,
          isActive: true,
        },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              companyFeatures: true,
            },
          },
        },
      });

      return features;
    } catch (error) {
      logger.error("Error getting features by category:", error);
      throw new AppError("Failed to get features by category", 500);
    }
  }

  /**
   * Get features for company dashboard
   */
  async getCompanyDashboardFeatures(companyId: string, userRole: string) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          subscriptionPlan: true,
          subscriptionStatus: true,
        },
      });

      if (!company) {
        throw new AppError("Company not found", 404);
      }

      // Get all active features that match the user role
      const features = await prisma.systemFeature.findMany({
        where: {
          isActive: true,
          requiredRole: userRole as any,
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        include: {
          companyFeatures: {
            where: { companyId },
            select: {
              isEnabled: true,
            },
          },
        },
      });

      // Filter features based on subscription plan
      const filteredFeatures = features.filter((feature) => {
        // If it's a premium feature, check if company has premium subscription
        if (
          feature.isPremium &&
          !["professional", "enterprise"].includes(company.subscriptionPlan)
        ) {
          return false;
        }
        return true;
      });

      // Group features by category
      const featuresByCategory = filteredFeatures.reduce((acc, feature) => {
        const category = feature.category;
        if (!acc[category]) {
          acc[category] = [];
        }

        // Check if feature is enabled for this company
        const isEnabled =
          feature.companyFeatures.length > 0
            ? feature.companyFeatures[0].isEnabled
            : true;

        acc[category].push({
          ...feature,
          isEnabled,
        });

        return acc;
      }, {} as any);

      return featuresByCategory;
    } catch (error) {
      logger.error("Error getting company dashboard features:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get company dashboard features", 500);
    }
  }

  /**
   * Enable/disable feature for company
   */
  async toggleCompanyFeature(
    companyId: string,
    featureId: string,
    isEnabled: boolean
  ) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new AppError("Company not found", 404);
      }

      const feature = await prisma.systemFeature.findUnique({
        where: { id: featureId },
      });

      if (!feature) {
        throw new AppError("System feature not found", 404);
      }

      // Check if company has access to this feature based on subscription
      if (
        feature.isPremium &&
        !["professional", "enterprise"].includes(company.subscriptionPlan)
      ) {
        throw new ValidationError(
          "Company does not have access to this premium feature"
        );
      }

      const existingCompanyFeature = await prisma.companyFeature.findUnique({
        where: {
          companyId_featureId: {
            companyId,
            featureId,
          },
        },
      });

      if (existingCompanyFeature) {
        // Update existing
        await prisma.companyFeature.update({
          where: {
            companyId_featureId: {
              companyId,
              featureId,
            },
          },
          data: { isEnabled },
        });
      } else {
        // Create new
        await prisma.companyFeature.create({
          data: {
            companyId,
            featureId,
            isEnabled,
          },
        });
      }

      logger.info(
        `Company feature toggled: ${companyId} - ${featureId} = ${isEnabled}`
      );

      return { message: "Company feature updated successfully" };
    } catch (error) {
      logger.error("Error toggling company feature:", error);
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      throw new AppError("Failed to toggle company feature", 500);
    }
  }

  /**
   * Get feature statistics
   */
  async getFeatureStatistics() {
    try {
      const [
        totalFeatures,
        activeFeatures,
        premiumFeatures,
        featuresByCategory,
        mostUsedFeatures,
      ] = await Promise.all([
        prisma.systemFeature.count(),
        prisma.systemFeature.count({ where: { isActive: true } }),
        prisma.systemFeature.count({ where: { isPremium: true } }),
        prisma.systemFeature.groupBy({
          by: ["category"],
          _count: { category: true },
        }),
        prisma.companyFeature.groupBy({
          by: ["featureId"],
          _count: { featureId: true },
          orderBy: { _count: { featureId: "desc" } },
          take: 10,
        }),
      ]);

      return {
        totalFeatures,
        activeFeatures,
        premiumFeatures,
        featuresByCategory: featuresByCategory.map((item) => ({
          category: item.category,
          count: item._count.category,
        })),
        mostUsedFeatures: mostUsedFeatures.map((item) => ({
          featureId: item.featureId,
          usageCount: item._count.featureId,
        })),
      };
    } catch (error) {
      logger.error("Error getting feature statistics:", error);
      throw new AppError("Failed to get feature statistics", 500);
    }
  }

  /**
   * Initialize default system features
   */
  async initializeDefaultFeatures() {
    try {
      const defaultFeatures = [
        // Dashboard Features
        {
          name: "Dashboard Overview",
          description: "View company dashboard with key metrics and statistics",
          category: "DASHBOARD" as const,
          isActive: true,
          isPremium: false,
          requiredRole: "EMPLOYEE" as const,
          icon: "dashboard",
          route: "/dashboard",
          permissions: ["dashboard:view"],
        },
        {
          name: "Advanced Analytics",
          description: "Access to detailed analytics and reporting",
          category: "DASHBOARD" as const,
          isActive: true,
          isPremium: true,
          requiredRole: "MANAGER" as const,
          icon: "analytics",
          route: "/analytics",
          permissions: ["analytics:view", "reports:generate"],
        },

        // RFQ Management Features
        {
          name: "Create RFQ",
          description: "Create new Request for Quotation",
          category: "RFQ_MANAGEMENT" as const,
          isActive: true,
          isPremium: false,
          requiredRole: "EMPLOYEE" as const,
          icon: "add",
          route: "/rfqs/create",
          permissions: ["rfq:create"],
        },
        {
          name: "RFQ Templates",
          description: "Use and manage RFQ templates",
          category: "RFQ_MANAGEMENT" as const,
          isActive: true,
          isPremium: true,
          requiredRole: "MANAGER" as const,
          icon: "template",
          route: "/rfqs/templates",
          permissions: ["rfq:templates", "rfq:manage"],
        },

        // Quote Management Features
        {
          name: "View Quotes",
          description: "View and manage received quotes",
          category: "QUOTE_MANAGEMENT" as const,
          isActive: true,
          isPremium: false,
          requiredRole: "EMPLOYEE" as const,
          icon: "quote",
          route: "/quotes",
          permissions: ["quote:view"],
        },
        {
          name: "Quote Comparison",
          description: "Compare multiple quotes side by side",
          category: "QUOTE_MANAGEMENT" as const,
          isActive: true,
          isPremium: true,
          requiredRole: "MANAGER" as const,
          icon: "compare",
          route: "/quotes/compare",
          permissions: ["quote:compare"],
        },

        // Email Management Features
        {
          name: "Send Emails",
          description: "Send emails to contacts and shipping lines",
          category: "EMAIL_MANAGEMENT" as const,
          isActive: true,
          isPremium: false,
          requiredRole: "EMPLOYEE" as const,
          icon: "email",
          route: "/emails/send",
          permissions: ["email:send"],
        },
        {
          name: "Email Campaigns",
          description: "Create and manage email campaigns",
          category: "EMAIL_MANAGEMENT" as const,
          isActive: true,
          isPremium: true,
          requiredRole: "MANAGER" as const,
          icon: "campaign",
          route: "/emails/campaigns",
          permissions: ["email:campaigns"],
        },

        // User Management Features
        {
          name: "Manage Users",
          description: "Add, edit, and manage company users",
          category: "USER_MANAGEMENT" as const,
          isActive: true,
          isPremium: false,
          requiredRole: "ADMIN" as const,
          icon: "users",
          route: "/users",
          permissions: ["users:manage"],
        },
        {
          name: "Role Management",
          description: "Manage user roles and permissions",
          category: "USER_MANAGEMENT" as const,
          isActive: true,
          isPremium: true,
          requiredRole: "ADMIN" as const,
          icon: "shield",
          route: "/users/roles",
          permissions: ["roles:manage"],
        },

        // Settings Features
        {
          name: "Company Settings",
          description: "Manage company profile and settings",
          category: "SETTINGS" as const,
          isActive: true,
          isPremium: false,
          requiredRole: "ADMIN" as const,
          icon: "settings",
          route: "/settings/company",
          permissions: ["settings:company"],
        },
        {
          name: "API Management",
          description: "Manage API keys and integrations",
          category: "INTEGRATIONS" as const,
          isActive: true,
          isPremium: true,
          requiredRole: "ADMIN" as const,
          icon: "api",
          route: "/settings/api",
          permissions: ["api:manage"],
        },
      ];

      // Check if features already exist
      const existingFeatures = await prisma.systemFeature.count();

      if (existingFeatures === 0) {
        await prisma.systemFeature.createMany({
          data: defaultFeatures,
        });

        logger.info("Default system features initialized");
      }

      return { message: "Default features initialized successfully" };
    } catch (error) {
      logger.error("Error initializing default features:", error);
      throw new AppError("Failed to initialize default features", 500);
    }
  }
}
