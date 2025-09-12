import { Response, NextFunction } from "express";
import { ShippingLineService } from "../services/ShippingLineService";
import { successResponse } from "../../utils/response";
import { CompanyRequest } from "../types/auth";

export class ShippingLineController {
  private shippingLineService = new ShippingLineService();

  /**
   * GET /api/v1/shipping-lines
   */
  async getShippingLines(
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
        tradeLane,
        service,
        tag,
        isCustom,
      } = (req as any).query;
      const companyId = req.user.companyId;

      const shippingLines = await this.shippingLineService.getShippingLines(
        companyId,
        {
          page: Number(page),
          limit: Number(limit),
          search,
          status,
          tradeLane,
          service,
          tag,
          isCustom: isCustom === "true",
        }
      );

      successResponse(
        res,
        shippingLines,
        "Shipping lines retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/shipping-lines/:id
   */
  async getShippingLineById(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId;

      const shippingLine = await this.shippingLineService.getShippingLineById(
        id,
        companyId
      );

      successResponse(
        res,
        shippingLine,
        "Shipping line retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/shipping-lines
   */
  async createShippingLine(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId;
      const createdBy = req.user.id;
      const shippingLineData = req.body;

      const shippingLine = await this.shippingLineService.createShippingLine(
        companyId,
        createdBy,
        shippingLineData
      );

      successResponse(
        res,
        shippingLine,
        "Shipping line created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/shipping-lines/:id
   */
  async updateShippingLine(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId;
      const shippingLineData = req.body;

      const shippingLine = await this.shippingLineService.updateShippingLine(
        id,
        companyId,
        shippingLineData
      );

      successResponse(res, shippingLine, "Shipping line updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/shipping-lines/:id
   */
  async deleteShippingLine(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId;

      await this.shippingLineService.deleteShippingLine(id, companyId);

      successResponse(res, null, "Shipping line deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/shipping-lines/:id/status
   */
  async updateShippingLineStatus(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId;
      const { isActive } = req.body;

      const shippingLine =
        await this.shippingLineService.updateShippingLineStatus(
          id,
          companyId,
          isActive
        );

      successResponse(
        res,
        shippingLine,
        "Shipping line status updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/shipping-lines/:id/archive
   */
  async archiveShippingLine(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId;

      const shippingLine = await this.shippingLineService.archiveShippingLine(
        id,
        companyId
      );

      successResponse(res, shippingLine, "Shipping line archived successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/shipping-lines/:id/restore
   */
  async restoreShippingLine(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId;

      const shippingLine = await this.shippingLineService.restoreShippingLine(
        id,
        companyId
      );

      successResponse(res, shippingLine, "Shipping line restored successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/shipping-lines/trade-lanes
   */
  async getTradeLanes(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId;

      const tradeLanes = await this.shippingLineService.getTradeLanes(
        companyId
      );

      successResponse(res, tradeLanes, "Trade lanes retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/shipping-lines/services
   */
  async getServices(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId;

      const services = await this.shippingLineService.getServices(companyId);

      successResponse(res, services, "Services retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/shipping-lines/tags
   */
  async getTags(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId;

      const tags = await this.shippingLineService.getTags(companyId);

      successResponse(res, tags, "Tags retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/shipping-lines/bulk-import
   */
  async bulkImportShippingLines(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId;
      const createdBy = req.user.id;
      const { shippingLines } = req.body;

      const result = await this.shippingLineService.bulkImportShippingLines(
        companyId,
        createdBy,
        shippingLines
      );

      successResponse(res, result, "Shipping lines imported successfully");
    } catch (error) {
      next(error);
    }
  }
}
