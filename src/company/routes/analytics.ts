import express, { Request, Response, NextFunction } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { enforceFeature } from "../middleware/subscriptionLimits";
import { CompanyRequest } from "../types/auth";

const router = express.Router();
const analyticsController = new AnalyticsController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

// Performance Metrics
router.get(
  "/performance-metrics",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getPerformanceMetrics(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// RFQ Analytics
router.get(
  "/rfq-analytics",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getRFQAnalytics(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Quote Analytics
router.get(
  "/quote-analytics",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getQuoteAnalytics(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Carrier Performance
router.get(
  "/carrier-performance",
  enforceFeature("advancedAnalytics"),
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getCarrierPerformance(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Contact Engagement
router.get(
  "/contact-engagement",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getContactEngagement(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Route Performance
router.get(
  "/route-performance",
  enforceFeature("advancedAnalytics"),
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getRoutePerformance(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Historical Benchmarking
router.get(
  "/historical-benchmarking",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getHistoricalBenchmarking(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Cost Analysis
router.get(
  "/cost-analysis",
  enforceFeature("advancedAnalytics"),
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getCostAnalysis(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Market Intelligence
router.get(
  "/market-intelligence",
  enforceFeature("advancedAnalytics"),
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getMarketIntelligence(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Scheduled Reports
router.get(
  "/scheduled-reports",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getScheduledReports(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.post(
  "/scheduled-reports",
  enforceFeature("scheduledReports"),
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.createScheduledReport(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.put(
  "/scheduled-reports/:id",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.updateScheduledReport(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.delete(
  "/scheduled-reports/:id",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.deleteScheduledReport(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Custom Reports
router.get(
  "/custom-reports",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getCustomReports(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.post(
  "/custom-reports",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.createCustomReport(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.put(
  "/custom-reports/:id",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.updateCustomReport(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.delete(
  "/custom-reports/:id",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.deleteCustomReport(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Plan Feature Analytics (usage vs limits + quote feature stats)
router.get(
  "/plan-features",
  (req: Request, res: Response, next: NextFunction) =>
    analyticsController.getPlanFeatureAnalytics(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Export Analytics
router.post("/export",
  enforceFeature("exportReports"),
  (req: Request, res: Response, next: NextFunction) =>
  analyticsController.exportAnalytics(
    req as unknown as CompanyRequest,
    res,
    next
  )
);

export default router;
