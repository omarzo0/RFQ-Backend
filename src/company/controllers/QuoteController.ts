import { Response, NextFunction } from "express";
import { QuoteService } from "../services/QuoteService";
import { successResponse } from "../../utils/response";
import { CompanyRequest } from "../types/auth";

export class QuoteController {
  private quoteService = new QuoteService();

  /**
   * GET /api/v1/quotes
   */
  async getQuotes(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        rfqId,
        contactId,
        shippingLineId,
        status,
        isWinner,
        isAwarded,
        isExpired,
        isVerified,
        source,
        currency,
        marketPosition,
        tags,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = (req as any).query;
      const companyId = req.user!.companyId!;

      const quotes = await this.quoteService.getQuotes(companyId, {
        page: Number(page),
        limit: Number(limit),
        search,
        rfqId,
        contactId,
        shippingLineId,
        status,
        isWinner: isWinner === "true",
        isAwarded: isAwarded === "true",
        isExpired: isExpired === "true",
        isVerified: isVerified === "true",
        source,
        currency,
        marketPosition,
        tags: tags ? tags.split(",") : undefined,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      });

      successResponse(res, quotes, "Quotes retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/:id
   */
  async getQuoteById(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user!.companyId!;

      const quote = await this.quoteService.getQuoteById(id, companyId);

      successResponse(res, quote, "Quote retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/quotes
   */
  async createQuote(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user!.companyId!;
      const createdBy = req.user!.id;
      const quoteData = req.body;

      const quote = await this.quoteService.createQuote(
        companyId,
        createdBy,
        quoteData
      );

      successResponse(res, quote, "Quote created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/quotes/:id
   */
  async updateQuote(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user!.companyId!;
      const quoteData = req.body;

      const quote = await this.quoteService.updateQuote(
        id,
        companyId,
        quoteData
      );

      successResponse(res, quote, "Quote updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/quotes/:id
   */
  async deleteQuote(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user!.companyId!;

      await this.quoteService.deleteQuote(id, companyId);

      successResponse(res, null, "Quote deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/rfq/:rfqId
   */
  async getQuotesByRFQ(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rfqId } = (req as any).params;
      const companyId = req.user!.companyId!;

      const quotes = await this.quoteService.getQuotesByRFQ(rfqId, companyId);

      successResponse(res, quotes, "RFQ quotes retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/quotes/:id/compare
   */
  async compareQuotes(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rfqId } = (req as any).params;
      const companyId = req.user!.companyId!;

      const comparison = await this.quoteService.compareQuotes(
        rfqId,
        companyId
      );

      successResponse(
        res,
        comparison,
        "Quote comparison completed successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/quotes/:id/award
   */
  async awardQuote(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user!.companyId!;
      const awardedBy = req.user!.id;
      const { notes } = req.body;

      const quote = await this.quoteService.awardQuote(
        id,
        companyId,
        awardedBy,
        notes
      );

      successResponse(res, quote, "Quote awarded successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/quotes/:id/reject
   */
  async rejectQuote(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user!.companyId!;
      const { reason } = req.body;

      const quote = await this.quoteService.rejectQuote(id, companyId, reason);

      successResponse(res, quote, "Quote rejected successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/quotes/:id/verify
   */
  async verifyQuote(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user!.companyId!;
      const verifiedBy = req.user!.id;

      const quote = await this.quoteService.verifyQuote(
        id,
        companyId,
        verifiedBy
      );

      successResponse(res, quote, "Quote verified successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/quotes/:id/status
   */
  async updateQuoteStatus(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user!.companyId!;
      const { status } = req.body;

      const quote = await this.quoteService.updateQuoteStatus(
        id,
        companyId,
        status
      );

      successResponse(res, quote, "Quote status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/analytics
   */
  async getQuoteAnalytics(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { period, dateFrom, dateTo, rfqId } = (req as any).query;
      const companyId = req.user!.companyId!;

      const analytics = await this.quoteService.getQuoteAnalytics(companyId, {
        period,
        dateFrom,
        dateTo,
        rfqId,
      });

      successResponse(res, analytics, "Quote analytics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/price-analysis
   */
  async getPriceAnalysis(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rfqId, period, dateFrom, dateTo } = (req as any).query;
      const companyId = req.user!.companyId!;

      const analysis = await this.quoteService.getPriceAnalysis(companyId, {
        rfqId,
        period,
        dateFrom,
        dateTo,
      });

      successResponse(res, analysis, "Price analysis retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/carrier-performance
   */
  async getCarrierPerformance(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { period, dateFrom, dateTo } = (req as any).query;
      const companyId = req.user!.companyId!;

      const performance = await this.quoteService.getCarrierPerformance(
        companyId,
        { period, dateFrom, dateTo }
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
   * GET /api/v1/quotes/market-trends
   */
  async getMarketTrends(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { period, dateFrom, dateTo, route } = (req as any).query;
      const companyId = req.user!.companyId!;

      const trends = await this.quoteService.getMarketTrends(companyId, {
        period,
        dateFrom,
        dateTo,
        route,
      });

      successResponse(res, trends, "Market trends retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/historical-comparison
   */
  async getHistoricalComparison(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rfqId, period } = (req as any).query;
      const companyId = req.user!.companyId!;

      const comparison = await this.quoteService.getHistoricalComparison(
        companyId,
        { rfqId, period }
      );

      successResponse(
        res,
        comparison,
        "Historical comparison retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/rate-optimization
   */
  async getRateOptimization(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { rfqId, route } = (req as any).query;
      const companyId = req.user!.companyId!;

      const optimization = await this.quoteService.getRateOptimization(
        companyId,
        { rfqId, route }
      );

      successResponse(
        res,
        optimization,
        "Rate optimization suggestions retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/tags
   */
  async getQuoteTags(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user!.companyId!;

      const tags = await this.quoteService.getQuoteTags(companyId);

      successResponse(res, tags, "Quote tags retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/currencies
   */
  async getQuoteCurrencies(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user!.companyId!;

      const currencies = await this.quoteService.getQuoteCurrencies(companyId);

      successResponse(
        res,
        currencies,
        "Quote currencies retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/quotes/bulk-import
   */
  async bulkImportQuotes(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user!.companyId!;
      const createdBy = req.user!.id;
      const { quotes } = req.body;

      const result = await this.quoteService.bulkImportQuotes(
        companyId,
        createdBy,
        quotes
      );

      successResponse(res, result, "Quotes imported successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/quotes/:id/duplicate
   */
  async duplicateQuote(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user!.companyId!;
      const createdBy = req.user!.id;
      const { rfqId, contactId } = req.body;

      const quote = await this.quoteService.duplicateQuote(
        id,
        companyId,
        createdBy,
        { rfqId, contactId }
      );

      successResponse(res, quote, "Quote duplicated successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quotes/expired
   */
  async getExpiredQuotes(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 10 } = (req as any).query;
      const companyId = req.user!.companyId!;

      const quotes = await this.quoteService.getExpiredQuotes(companyId, {
        page: Number(page),
        limit: Number(limit),
      });

      successResponse(res, quotes, "Expired quotes retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/quotes/validate
   */
  async validateQuote(
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const quoteData = req.body;

      const validation = await this.quoteService.validateQuote(quoteData);

      successResponse(res, validation, "Quote validation completed");
    } catch (error) {
      next(error);
    }
  }
}
