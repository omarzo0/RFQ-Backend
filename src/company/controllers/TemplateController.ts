import { Response, NextFunction } from "express";
import { TemplateService } from "../services/TemplateService";
import { successResponse } from "../../utils/response";
import { CompanyRequest } from "../types/auth";

export class TemplateController {
  private templateService = new TemplateService();

  /**
   * GET /api/v1/templates
   */
  async getTemplates(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        tradeLane,
        language,
        isPublic,
        isActive,
        tags,
        createdBy,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = (req as any).query;
      const companyId = req.user.companyId!;

      const templates = await this.templateService.getTemplates(companyId, {
        page: Number(page),
        limit: Number(limit),
        search,
        category,
        tradeLane,
        language,
        isPublic: isPublic === "true",
        isActive: isActive === "true",
        tags: tags ? tags.split(",") : undefined,
        createdBy,
        sortBy,
        sortOrder,
      });

      successResponse(res, templates, "Templates retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/:id
   */
  async getTemplateById(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const template = await this.templateService.getTemplateById(
        id,
        companyId
      );

      successResponse(res, template, "Template retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates
   */
  async createTemplate(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const templateData = req.body;

      const template = await this.templateService.createTemplate(
        companyId,
        createdBy,
        templateData
      );

      successResponse(res, template, "Template created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/templates/:id
   */
  async updateTemplate(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const templateData = req.body;

      const template = await this.templateService.updateTemplate(
        id,
        companyId,
        templateData
      );

      successResponse(res, template, "Template updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/templates/:id
   */
  async deleteTemplate(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      await this.templateService.deleteTemplate(id, companyId);

      successResponse(res, null, "Template deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/:id/duplicate
   */
  async duplicateTemplate(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const { name, description } = req.body;

      const template = await this.templateService.duplicateTemplate(
        id,
        companyId,
        createdBy,
        { name, description }
      );

      successResponse(res, template, "Template duplicated successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/:id/use
   */
  async useTemplate(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { variables } = req.body;

      const rfqData = await this.templateService.useTemplate(
        id,
        companyId,
        variables
      );

      successResponse(res, rfqData, "Template applied successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/from-rfq/:rfqId
   */
  async createTemplateFromRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rfqId } = (req as any).params;
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const { name, description, category, tags } = req.body;

      const template = await this.templateService.createTemplateFromRFQ(
        rfqId,
        companyId,
        createdBy,
        { name, description, category, tags }
      );

      successResponse(
        res,
        template,
        "Template created from RFQ successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/templates/:id/status
   */
  async updateTemplateStatus(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { isActive } = req.body;

      const template = await this.templateService.updateTemplateStatus(
        id,
        companyId,
        isActive
      );

      successResponse(res, template, "Template status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/templates/:id/default
   */
  async setDefaultTemplate(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const template = await this.templateService.setDefaultTemplate(
        id,
        companyId
      );

      successResponse(res, template, "Default template set successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/categories
   */
  async getTemplateCategories(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const categories = await this.templateService.getTemplateCategories(
        companyId
      );

      successResponse(
        res,
        categories,
        "Template categories retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/languages
   */
  async getTemplateLanguages(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const languages = await this.templateService.getTemplateLanguages();

      successResponse(
        res,
        languages,
        "Template languages retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/tags
   */
  async getTemplateTags(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const tags = await this.templateService.getTemplateTags(companyId);

      successResponse(res, tags, "Template tags retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/trade-lanes
   */
  async getTemplateTradeLanes(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const tradeLanes = await this.templateService.getTemplateTradeLanes(
        companyId
      );

      successResponse(
        res,
        tradeLanes,
        "Template trade lanes retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/analytics
   */
  async getTemplateAnalytics(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { period, dateFrom, dateTo } = (req as any).query;
      const companyId = req.user.companyId!;

      const analytics = await this.templateService.getTemplateAnalytics(
        companyId,
        {
          period,
          dateFrom,
          dateTo,
        }
      );

      successResponse(
        res,
        analytics,
        "Template analytics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/public
   */
  async getPublicTemplates(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        tradeLane,
        language,
        tags,
      } = (req as any).query;

      const templates = await this.templateService.getPublicTemplates({
        page: Number(page),
        limit: Number(limit),
        search,
        category,
        tradeLane,
        language,
        tags: tags ? tags.split(",") : undefined,
      });

      successResponse(
        res,
        templates,
        "Public templates retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/:id/import
   */
  async importPublicTemplate(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;

      const template = await this.templateService.importPublicTemplate(
        id,
        companyId,
        createdBy
      );

      successResponse(
        res,
        template,
        "Public template imported successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/:id/variables
   */
  async getTemplateVariables(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const variables = await this.templateService.getTemplateVariables(
        id,
        companyId
      );

      successResponse(
        res,
        variables,
        "Template variables retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/bulk-import
   */
  async bulkImportTemplates(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const { templates } = req.body;

      const result = await this.templateService.bulkImportTemplates(
        companyId,
        createdBy,
        templates
      );

      successResponse(res, result, "Templates imported successfully");
    } catch (error) {
      next(error);
    }
  }
}

