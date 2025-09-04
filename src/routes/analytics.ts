import express from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { authenticate } from "../middleware/auth";

const router = express.Router();
const analyticsController = new AnalyticsController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Performance Metrics
router.get(
  "/performance-metrics",
  analyticsController.getPerformanceMetrics.bind(analyticsController)
);

// RFQ Analytics
router.get(
  "/rfq-analytics",
  analyticsController.getRFQAnalytics.bind(analyticsController)
);

// Quote Analytics
router.get(
  "/quote-analytics",
  analyticsController.getQuoteAnalytics.bind(analyticsController)
);

// Carrier Performance
router.get(
  "/carrier-performance",
  analyticsController.getCarrierPerformance.bind(analyticsController)
);

// Contact Engagement
router.get(
  "/contact-engagement",
  analyticsController.getContactEngagement.bind(analyticsController)
);

// Route Performance
router.get(
  "/route-performance",
  analyticsController.getRoutePerformance.bind(analyticsController)
);

// Historical Benchmarking
router.get(
  "/historical-benchmarking",
  analyticsController.getHistoricalBenchmarking.bind(analyticsController)
);

// Cost Analysis
router.get(
  "/cost-analysis",
  analyticsController.getCostAnalysis.bind(analyticsController)
);

// Market Intelligence
router.get(
  "/market-intelligence",
  analyticsController.getMarketIntelligence.bind(analyticsController)
);

// Scheduled Reports
router.get(
  "/scheduled-reports",
  analyticsController.getScheduledReports.bind(analyticsController)
);
router.post(
  "/scheduled-reports",
  analyticsController.createScheduledReport.bind(analyticsController)
);
router.put(
  "/scheduled-reports/:id",
  analyticsController.updateScheduledReport.bind(analyticsController)
);
router.delete(
  "/scheduled-reports/:id",
  analyticsController.deleteScheduledReport.bind(analyticsController)
);

// Custom Reports
router.get(
  "/custom-reports",
  analyticsController.getCustomReports.bind(analyticsController)
);
router.post(
  "/custom-reports",
  analyticsController.createCustomReport.bind(analyticsController)
);
router.put(
  "/custom-reports/:id",
  analyticsController.updateCustomReport.bind(analyticsController)
);
router.delete(
  "/custom-reports/:id",
  analyticsController.deleteCustomReport.bind(analyticsController)
);

// Export Analytics
router.post(
  "/export",
  analyticsController.exportAnalytics.bind(analyticsController)
);

export default router;

