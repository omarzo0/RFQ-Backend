import express from "express";
import { QuoteController } from "../controllers/QuoteController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { enforceTenantIsolation } from "../middleware/tenantIsolation";

const router = express.Router();
const quoteController = new QuoteController();

// Apply middleware
router.use(authenticate);
router.use(enforceTenantIsolation);

// Quote CRUD Operations
router.get("/", authorize(["ADMIN", "MANAGER", "EMPLOYEE"]), (req, res, next) =>
  quoteController.getQuotes(req, res, next)
);
router.get(
  "/:id",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getQuoteById(req, res, next)
);
router.post(
  "/",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.createQuote(req, res, next)
);
router.put(
  "/:id",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.updateQuote(req, res, next)
);
router.delete("/:id", authorize(["ADMIN", "MANAGER"]), (req, res, next) =>
  quoteController.deleteQuote(req, res, next)
);

// Quote Operations
router.get(
  "/rfq/:rfqId",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getQuotesByRFQ(req, res, next)
);
router.post(
  "/:id/compare",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.compareQuotes(req, res, next)
);
router.post("/:id/award", authorize(["ADMIN", "MANAGER"]), (req, res, next) =>
  quoteController.awardQuote(req, res, next)
);
router.post("/:id/reject", authorize(["ADMIN", "MANAGER"]), (req, res, next) =>
  quoteController.rejectQuote(req, res, next)
);
router.post(
  "/:id/verify",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.verifyQuote(req, res, next)
);
router.put("/:id/status", authorize(["ADMIN", "MANAGER"]), (req, res, next) =>
  quoteController.updateQuoteStatus(req, res, next)
);

// Quote Analytics & Intelligence
router.get(
  "/analytics",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getQuoteAnalytics(req, res, next)
);
router.get(
  "/price-analysis",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getPriceAnalysis(req, res, next)
);
router.get(
  "/carrier-performance",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getCarrierPerformance(req, res, next)
);
router.get(
  "/market-trends",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getMarketTrends(req, res, next)
);
router.get(
  "/historical-comparison",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getHistoricalComparison(req, res, next)
);
router.get(
  "/rate-optimization",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getRateOptimization(req, res, next)
);

// Quote Data
router.get(
  "/tags",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getQuoteTags(req, res, next)
);
router.get(
  "/currencies",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getQuoteCurrencies(req, res, next)
);

// Bulk Operations
router.post("/bulk-import", authorize(["ADMIN", "MANAGER"]), (req, res, next) =>
  quoteController.bulkImportQuotes(req, res, next)
);
router.post(
  "/:id/duplicate",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.duplicateQuote(req, res, next)
);

// Special Operations
router.get(
  "/expired",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.getExpiredQuotes(req, res, next)
);
router.post(
  "/validate",
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  (req, res, next) => quoteController.validateQuote(req, res, next)
);

export default router;

