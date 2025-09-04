import { Response, NextFunction } from "express";
import { AnalyticsService } from "../services/AnalyticsService";
import { successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types/auth";

export class AnalyticsController {
  private analyticsService = new AnalyticsService();

  /**
   * GET /api/v1/analytics/performance-metrics
   */
  async getPerformanceMetrics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const metrics = await this.analyticsService.getPerformanceMetrics(
        companyId,
        startDate as string,
        endDate as string
      );

      successResponse(
        res,
        metrics,
        "Performance metrics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/rfq-analytics
   */
  async getRFQAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const analytics = await this.analyticsService.getRFQAnalytics(
        companyId,
        startDate as string,
        endDate as string
      );

      successResponse(res, analytics, "RFQ analytics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/quote-analytics
   */
  async getQuoteAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const analytics = await this.analyticsService.getQuoteAnalytics(
        companyId,
        startDate as string,
        endDate as string
      );

      successResponse(res, analytics, "Quote analytics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/carrier-performance
   */
  async getCarrierPerformance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const performance = await this.analyticsService.getCarrierPerformance(
        companyId,
        startDate as string,
        endDate as string
      );

      successResponse(
        res,
        performance,
        "Carrier performance retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/contact-engagement
   */
  async getContactEngagement(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const engagement = await this.analyticsService.getContactEngagement(
        companyId,
        startDate as string,
        endDate as string
      );

      successResponse(
        res,
        engagement,
        "Contact engagement retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/route-performance
   */
  async getRoutePerformance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const performance = await this.analyticsService.getRoutePerformance(
        companyId,
        startDate as string,
        endDate as string
      );

      successResponse(
        res,
        performance,
        "Route performance retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/historical-benchmarking
   */
  async getHistoricalBenchmarking(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const benchmarking =
        await this.analyticsService.getHistoricalBenchmarking(
          companyId,
          startDate as string,
          endDate as string
        );

      successResponse(
        res,
        benchmarking,
        "Historical benchmarking retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/cost-analysis
   */
  async getCostAnalysis(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const analysis = await this.analyticsService.getCostAnalysis(
        companyId,
        startDate as string,
        endDate as string
      );

      successResponse(res, analysis, "Cost analysis retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/market-intelligence
   */
  async getMarketIntelligence(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = (req as any).query;
      const companyId = req.user.companyId!;

      const intelligence = await this.analyticsService.getMarketIntelligence(
        companyId,
        startDate as string,
        endDate as string
      );

      successResponse(
        res,
        intelligence,
        "Market intelligence retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/scheduled-reports
   */
  async getScheduledReports(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const reports = await this.analyticsService.getScheduledReports(
        companyId
      );

      successResponse(res, reports, "Scheduled reports retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/analytics/scheduled-reports
   */
  async createScheduledReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const userId = req.user.id;
      const reportData = req.body;

      const report = await this.analyticsService.createScheduledReport(
        companyId,
        userId,
        reportData
      );

      successResponse(
        res,
        report,
        "Scheduled report created successfully",
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/analytics/scheduled-reports/:id
   */
  async updateScheduledReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const reportData = req.body;

      const report = await this.analyticsService.updateScheduledReport(
        id,
        companyId,
        reportData
      );

      successResponse(res, report, "Scheduled report updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/analytics/scheduled-reports/:id
   */
  async deleteScheduledReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      await this.analyticsService.deleteScheduledReport(id, companyId);

      successResponse(res, null, "Scheduled report deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/analytics/custom-reports
   */
  async getCustomReports(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const reports = await this.analyticsService.getCustomReports(companyId);

      successResponse(res, reports, "Custom reports retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/analytics/custom-reports
   */
  async createCustomReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const userId = req.user.id;
      const reportData = req.body;

      const report = await this.analyticsService.createCustomReport(
        companyId,
        userId,
        reportData
      );

      successResponse(res, report, "Custom report created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/analytics/custom-reports/:id
   */
  async updateCustomReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const reportData = req.body;

      const report = await this.analyticsService.updateCustomReport(
        id,
        companyId,
        reportData
      );

      successResponse(res, report, "Custom report updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/analytics/custom-reports/:id
   */
  async deleteCustomReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      await this.analyticsService.deleteCustomReport(id, companyId);

      successResponse(res, null, "Custom report deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/analytics/export
   */
  async exportAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { format, period, metrics } = req.body as any;
      const companyId = req.user.companyId!;

      const exportData = await this.analyticsService.exportAnalytics(
        companyId,
        format,
        period,
        metrics
      );

      // Set appropriate headers for file download
      const filename = `analytics-report-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Type", this.getContentType(format));

      res.send(exportData);
    } catch (error) {
      next(error);
    }
  }

  private getContentType(format: string): string {
    switch (format) {
      case "pdf":
        return "application/pdf";
      case "excel":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "csv":
        return "text/csv";
      default:
        return "application/octet-stream";
    }
  }
}
