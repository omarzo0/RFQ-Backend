import { Response, NextFunction } from "express";
import { RFQService } from "../services/RFQService";
import { successResponse } from "../../utils/response";
import { CompanyRequest } from "../types/auth";

export class RFQController {
  private rfqService = new RFQService();

  /**
   * GET /api/v1/rfqs
   */
  async getRFQs(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        priority,
        urgency,
        tradeLane,
        tag,
        assignedTo,
        createdBy,
        dateFrom,
        dateTo,
      } = (req as any).query;
      const companyId = req.user.companyId!;

      const rfqs = await this.rfqService.getRFQs(companyId, {
        page: Number(page),
        limit: Number(limit),
        search,
        status,
        priority,
        urgency,
        tradeLane,
        tag,
        assignedTo,
        createdBy,
        dateFrom,
        dateTo,
      });

      successResponse(res, rfqs, "RFQs retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/rfqs/:id
   */
  async getRFQById(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const rfq = await this.rfqService.getRFQById(id, companyId);

      successResponse(res, rfq, "RFQ retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/rfqs
   */
  async createRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const rfqData = req.body;

      const rfq = await this.rfqService.createRFQ(companyId, createdBy, rfqData);

      successResponse(res, rfq, "RFQ created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/rfqs/:id
   */
  async updateRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const rfqData = req.body;

      const rfq = await this.rfqService.updateRFQ(id, companyId, rfqData);

      successResponse(res, rfq, "RFQ updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/rfqs/:id
   */
  async deleteRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      await this.rfqService.deleteRFQ(id, companyId);

      successResponse(res, null, "RFQ deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/rfqs/:id/status
   */
  async updateRFQStatus(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { status } = req.body;

      const rfq = await this.rfqService.updateRFQStatus(id, companyId, status);

      successResponse(res, rfq, "RFQ status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/rfqs/:id/send
   */
  async sendRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { contactIds, emailSubject, emailBody } = req.body;

      const result = await this.rfqService.sendRFQ(
        id,
        companyId,
        contactIds,
        emailSubject,
        emailBody
      );

      successResponse(res, result, "RFQ sent successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/rfqs/:id/close
   */
  async closeRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const rfq = await this.rfqService.closeRFQ(id, companyId);

      successResponse(res, rfq, "RFQ closed successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/rfqs/:id/award
   */
  async awardRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { winningQuoteId, notes } = req.body;

      const rfq = await this.rfqService.awardRFQ(
        id,
        companyId,
        winningQuoteId,
        notes
      );

      successResponse(res, rfq, "RFQ awarded successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/rfqs/:id/recipients
   */
  async getRFQRecipients(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const recipients = await this.rfqService.getRFQRecipients(id, companyId);

      successResponse(res, recipients, "RFQ recipients retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/rfqs/:id/quotes
   */
  async getRFQQuotes(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const quotes = await this.rfqService.getRFQQuotes(id, companyId);

      successResponse(res, quotes, "RFQ quotes retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/rfqs/analytics
   */
  async getRFQAnalytics(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { period, dateFrom, dateTo } = (req as any).query;
      const companyId = req.user.companyId!;

      const analytics = await this.rfqService.getRFQAnalytics(companyId, {
        period,
        dateFrom,
        dateTo,
      });

      successResponse(res, analytics, "RFQ analytics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/rfqs/trade-lanes
   */
  async getTradeLanes(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const tradeLanes = await this.rfqService.getTradeLanes(companyId);

      successResponse(res, tradeLanes, "Trade lanes retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/rfqs/tags
   */
  async getTags(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const tags = await this.rfqService.getTags(companyId);

      successResponse(res, tags, "Tags retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/rfqs/duplicate/:id
   */
  async duplicateRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;

      const rfq = await this.rfqService.duplicateRFQ(id, companyId, createdBy);

      successResponse(res, rfq, "RFQ duplicated successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/rfqs/templates
   */
  async getRFQTemplates(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const templates = await this.rfqService.getRFQTemplates(companyId);

      successResponse(res, templates, "RFQ templates retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/rfqs/templates
   */
  async createRFQTemplate(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const templateData = req.body;

      const template = await this.rfqService.createRFQTemplate(
        companyId,
        createdBy,
        templateData
      );

      successResponse(res, template, "RFQ template created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
}