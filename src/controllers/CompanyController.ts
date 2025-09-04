import { Response, NextFunction } from "express";
import { CompanyService } from "../services/CompanyService";
import { successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types/auth";

export class CompanyController {
  private companyService = new CompanyService();

  /**
   * GET /api/v1/company/profile
   */
  async getCompanyProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const profile = await this.companyService.getCompanyProfile(companyId);

      successResponse(res, profile, "Company profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/company/profile
   */
  async updateCompanyProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const profileData = req.body;

      const profile = await this.companyService.updateCompanyProfile(
        companyId,
        profileData
      );

      successResponse(res, profile, "Company profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/company/logo
   */
  async uploadCompanyLogo(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const logoFile = req.file;

      if (!logoFile) {
        return res.status(400).json({ error: "No logo file provided" });
      }

      const logoUrl = await this.companyService.uploadCompanyLogo(
        companyId,
        logoFile
      );

      successResponse(res, { logoUrl }, "Company logo uploaded successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/user-preferences
   */
  async getUserPreferences(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const preferences = await this.companyService.getUserPreferences(
        companyId
      );

      successResponse(
        res,
        preferences,
        "User preferences retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/company/user-preferences
   */
  async updateUserPreferences(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const preferences = req.body;

      const updatedPreferences =
        await this.companyService.updateUserPreferences(companyId, preferences);

      successResponse(
        res,
        updatedPreferences,
        "User preferences updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/subscription
   */
  async getSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const subscription = await this.companyService.getSubscription(companyId);

      successResponse(
        res,
        subscription,
        "Subscription details retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/company/subscription
   */
  async updateSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const subscriptionData = req.body;

      const subscription = await this.companyService.updateSubscription(
        companyId,
        subscriptionData
      );

      successResponse(res, subscription, "Subscription updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/usage
   */
  async getUsageMetrics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const usage = await this.companyService.getUsageMetrics(companyId);

      successResponse(res, usage, "Usage metrics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/billing-history
   */
  async getBillingHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const history = await this.companyService.getBillingHistory(companyId);

      successResponse(res, history, "Billing history retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/payment-methods
   */
  async getPaymentMethods(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const paymentMethods = await this.companyService.getPaymentMethods(
        companyId
      );

      successResponse(
        res,
        paymentMethods,
        "Payment methods retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/company/payment-methods
   */
  async addPaymentMethod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const paymentMethodData = req.body;

      const paymentMethod = await this.companyService.addPaymentMethod(
        companyId,
        paymentMethodData
      );

      successResponse(
        res,
        paymentMethod,
        "Payment method added successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/company/payment-methods/:id
   */
  async deletePaymentMethod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId!;

      await this.companyService.deletePaymentMethod(companyId, id);

      successResponse(res, null, "Payment method deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/company/payment-methods/:id/default
   */
  async setDefaultPaymentMethod(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId!;

      await this.companyService.setDefaultPaymentMethod(companyId, id);

      successResponse(res, null, "Default payment method updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/billing-settings
   */
  async getBillingSettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const settings = await this.companyService.getBillingSettings(companyId);

      successResponse(res, settings, "Billing settings retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/company/billing-settings
   */
  async updateBillingSettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const settings = req.body;

      const updatedSettings = await this.companyService.updateBillingSettings(
        companyId,
        settings
      );

      successResponse(
        res,
        updatedSettings,
        "Billing settings updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/api-keys
   */
  async getAPIKeys(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const apiKeys = await this.companyService.getAPIKeys(companyId);

      successResponse(res, apiKeys, "API keys retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/company/api-keys
   */
  async createAPIKey(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const userId = req.user.id;
      const keyData = req.body;

      const apiKey = await this.companyService.createAPIKey(
        companyId,
        userId,
        keyData
      );

      successResponse(res, apiKey, "API key created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/company/api-keys/:id
   */
  async revokeAPIKey(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId!;

      await this.companyService.revokeAPIKey(companyId, id);

      successResponse(res, null, "API key revoked successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/webhooks
   */
  async getWebhooks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const webhooks = await this.companyService.getWebhooks(companyId);

      successResponse(res, webhooks, "Webhooks retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/company/webhooks
   */
  async createWebhook(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const userId = req.user.id;
      const webhookData = req.body;

      const webhook = await this.companyService.createWebhook(
        companyId,
        userId,
        webhookData
      );

      successResponse(res, webhook, "Webhook created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/company/webhooks/:id
   */
  async updateWebhook(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId!;
      const webhookData = req.body;

      const webhook = await this.companyService.updateWebhook(
        companyId,
        id,
        webhookData
      );

      successResponse(res, webhook, "Webhook updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/company/webhooks/:id
   */
  async deleteWebhook(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId!;

      await this.companyService.deleteWebhook(companyId, id);

      successResponse(res, null, "Webhook deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/company/integrations
   */
  async getIntegrations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const integrations = await this.companyService.getIntegrations(companyId);

      successResponse(res, integrations, "Integrations retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/company/integrations/:type/connect
   */
  async connectIntegration(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { type } = req.params;
      const companyId = req.user.companyId!;
      const connectionData = req.body;

      const integration = await this.companyService.connectIntegration(
        companyId,
        type,
        connectionData
      );

      successResponse(res, integration, "Integration connected successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/company/integrations/:type/disconnect
   */
  async disconnectIntegration(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { type } = req.params;
      const companyId = req.user.companyId!;

      await this.companyService.disconnectIntegration(companyId, type);

      successResponse(res, null, "Integration disconnected successfully");
    } catch (error) {
      next(error);
    }
  }
}
