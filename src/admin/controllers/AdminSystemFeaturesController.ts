import { Request, Response } from "express";
import { AdminSystemFeaturesService } from "../services/AdminSystemFeaturesService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class AdminSystemFeaturesController {
  private adminSystemFeaturesService: AdminSystemFeaturesService;

  constructor() {
    this.adminSystemFeaturesService = new AdminSystemFeaturesService();
  }

  /**
   * Create a new system feature
   * POST /api/v1/admin/system-features
   */
  createFeature = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        description,
        category,
        isActive,
        isPremium,
        requiredRole,
        icon,
        route,
        permissions,
      } = req.body;

      // Validate required fields
      if (!name || !description || !category || !requiredRole) {
        res
          .status(400)
          .json(
            errorResponse(
              "Name, description, category, and requiredRole are required",
              400
            )
          );
        return;
      }

      const featureData = {
        name,
        description,
        category,
        isActive: isActive ?? true,
        isPremium: isPremium ?? false,
        requiredRole,
        icon,
        route,
        permissions,
      };

      const newFeature = await this.adminSystemFeaturesService.createFeature(
        featureData
      );

      res
        .status(201)
        .json(
          successResponse(newFeature, "System feature created successfully")
        );
    } catch (error) {
      logger.error("Create feature error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Get all system features
   * GET /api/v1/admin/system-features
   */
  getFeatures = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        isActive,
        isPremium,
        requiredRole,
        search,
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        isPremium:
          isPremium === "true"
            ? true
            : isPremium === "false"
            ? false
            : undefined,
        requiredRole: requiredRole as string,
        search: search as string,
      };

      const featuresData = await this.adminSystemFeaturesService.getFeatures(
        filters
      );

      res
        .status(200)
        .json(
          successResponse(
            featuresData,
            "System features retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get features error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Get feature by ID
   * GET /api/v1/admin/system-features/:id
   */
  getFeatureById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json(errorResponse("Feature ID is required", 400));
        return;
      }

      const feature = await this.adminSystemFeaturesService.getFeatureById(id);

      res
        .status(200)
        .json(
          successResponse(feature, "System feature retrieved successfully")
        );
    } catch (error) {
      logger.error("Get feature by ID error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Update system feature
   * PUT /api/v1/admin/system-features/:id
   */
  updateFeature = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json(errorResponse("Feature ID is required", 400));
        return;
      }

      const updatedFeature =
        await this.adminSystemFeaturesService.updateFeature(id, updateData);

      res
        .status(200)
        .json(
          successResponse(updatedFeature, "System feature updated successfully")
        );
    } catch (error) {
      logger.error("Update feature error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Delete system feature
   * DELETE /api/v1/admin/system-features/:id
   */
  deleteFeature = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json(errorResponse("Feature ID is required", 400));
        return;
      }

      const result = await this.adminSystemFeaturesService.deleteFeature(id);

      res
        .status(200)
        .json(successResponse(result, "System feature deleted successfully"));
    } catch (error) {
      logger.error("Delete feature error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Get features by category
   * GET /api/v1/admin/system-features/category/:category
   */
  getFeaturesByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { category } = req.params;

      if (!category) {
        res.status(400).json(errorResponse("Category is required", 400));
        return;
      }

      const features =
        await this.adminSystemFeaturesService.getFeaturesByCategory(category);

      res
        .status(200)
        .json(
          successResponse(
            features,
            "Features by category retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get features by category error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Get features for company dashboard
   * GET /api/v1/admin/system-features/company/:companyId/dashboard
   */
  getCompanyDashboardFeatures = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId } = req.params;
      const { userRole = "EMPLOYEE" } = req.query;

      if (!companyId) {
        res.status(400).json(errorResponse("Company ID is required", 400));
        return;
      }

      const features =
        await this.adminSystemFeaturesService.getCompanyDashboardFeatures(
          companyId,
          userRole as string
        );

      res
        .status(200)
        .json(
          successResponse(
            features,
            "Company dashboard features retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get company dashboard features error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Toggle company feature
   * POST /api/v1/admin/system-features/:featureId/company/:companyId/toggle
   */
  toggleCompanyFeature = async (req: Request, res: Response): Promise<void> => {
    try {
      const { featureId, companyId } = req.params;
      const { isEnabled } = req.body;

      if (!featureId || !companyId) {
        res
          .status(400)
          .json(errorResponse("Feature ID and Company ID are required", 400));
        return;
      }

      if (typeof isEnabled !== "boolean") {
        res.status(400).json(errorResponse("isEnabled must be a boolean", 400));
        return;
      }

      const result = await this.adminSystemFeaturesService.toggleCompanyFeature(
        companyId,
        featureId,
        isEnabled
      );

      res
        .status(200)
        .json(successResponse(result, "Company feature toggled successfully"));
    } catch (error) {
      logger.error("Toggle company feature error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Get feature statistics
   * GET /api/v1/admin/system-features/statistics
   */
  getFeatureStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics =
        await this.adminSystemFeaturesService.getFeatureStatistics();

      res
        .status(200)
        .json(
          successResponse(
            statistics,
            "Feature statistics retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get feature statistics error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };

  /**
   * Initialize default features
   * POST /api/v1/admin/system-features/initialize
   */
  initializeDefaultFeatures = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result =
        await this.adminSystemFeaturesService.initializeDefaultFeatures();

      res
        .status(200)
        .json(
          successResponse(result, "Default features initialized successfully")
        );
    } catch (error) {
      logger.error("Initialize default features error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(errorResponse("Internal server error", 500));
      }
    }
  };
}
