import express, { Request, Response, NextFunction } from "express";
import { QuoteController } from "../controllers/QuoteController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { enforceTenantIsolation } from "../../middleware/tenantIsolation";
import { CompanyRequest } from "../types/auth";

const router = express.Router();
const quoteController = new QuoteController();

// Apply middleware
router.use(authenticateCompanyUser);
router.use(enforceTenantIsolation);

// Quote Analytics & Intelligence (must come before parameterized routes)
router.get("/analytics", (req: Request, res: Response, next: NextFunction) =>
  quoteController.getQuoteAnalytics(req as unknown as CompanyRequest, res, next)
);
router.get(
  "/price-analysis",
  (req: Request, res: Response, next: NextFunction) =>
    quoteController.getPriceAnalysis(req as unknown as CompanyRequest, res, next)
);
router.get(
  "/carrier-performance",
  (req: Request, res: Response, next: NextFunction) =>
    quoteController.getCarrierPerformance(req as unknown as CompanyRequest, res, next)
);
router.get(
  "/market-trends",
  (req: Request, res: Response, next: NextFunction) =>
    quoteController.getMarketTrends(req as unknown as CompanyRequest, res, next)
);
router.get(
  "/historical-comparison",
  (req: Request, res: Response, next: NextFunction) =>
    quoteController.getHistoricalComparison(req as unknown as CompanyRequest, res, next)
);
router.get(
  "/rate-optimization",
  (req: Request, res: Response, next: NextFunction) =>
    quoteController.getRateOptimization(req as unknown as CompanyRequest, res, next)
);

// Quote Data (must come before parameterized routes)
router.get("/tags", (req: Request, res: Response, next: NextFunction) =>
  quoteController.getQuoteTags(req as unknown as CompanyRequest, res, next)
);
router.get("/currencies", (req: Request, res: Response, next: NextFunction) =>
  quoteController.getQuoteCurrencies(req as unknown as CompanyRequest, res, next)
);

// Special Operations (must come before parameterized routes)
router.get("/expired", (req: Request, res: Response, next: NextFunction) =>
  quoteController.getExpiredQuotes(req as unknown as CompanyRequest, res, next)
);
router.post("/validate", (req: Request, res: Response, next: NextFunction) =>
  quoteController.validateQuote(req as unknown as CompanyRequest, res, next)
);

// Bulk Operations (must come before parameterized routes)
router.post("/bulk-import", (req: Request, res: Response, next: NextFunction) =>
  quoteController.bulkImportQuotes(req as unknown as CompanyRequest, res, next)
);

// Quote CRUD Operations
router.get("/", (req: Request, res: Response, next: NextFunction) =>
  quoteController.getQuotes(req as unknown as CompanyRequest, res, next)
);
router.get("/:id", (req: Request, res: Response, next: NextFunction) =>
  quoteController.getQuoteById(req as unknown as CompanyRequest, res, next)
);
router.post("/", (req: Request, res: Response, next: NextFunction) =>
  quoteController.createQuote(req as unknown as CompanyRequest, res, next)
);
router.put("/:id", (req: Request, res: Response, next: NextFunction) =>
  quoteController.updateQuote(req as unknown as CompanyRequest, res, next)
);
router.delete("/:id", (req: Request, res: Response, next: NextFunction) =>
  quoteController.deleteQuote(req as unknown as CompanyRequest, res, next)
);

// Quote Operations
router.get("/rfq/:rfqId", (req: Request, res: Response, next: NextFunction) =>
  quoteController.getQuotesByRFQ(req as unknown as CompanyRequest, res, next)
);
router.post("/:id/compare", (req: Request, res: Response, next: NextFunction) =>
  quoteController.compareQuotes(req as unknown as CompanyRequest, res, next)
);
router.post("/:id/award", (req: Request, res: Response, next: NextFunction) =>
  quoteController.awardQuote(req as unknown as CompanyRequest, res, next)
);
router.post("/:id/reject", (req: Request, res: Response, next: NextFunction) =>
  quoteController.rejectQuote(req as unknown as CompanyRequest, res, next)
);
router.post("/:id/verify", (req: Request, res: Response, next: NextFunction) =>
  quoteController.verifyQuote(req as unknown as CompanyRequest, res, next)
);
router.put("/:id/status", (req: Request, res: Response, next: NextFunction) =>
  quoteController.updateQuoteStatus(req as unknown as CompanyRequest, res, next)
);

// Bulk Operations
router.post(
  "/:id/duplicate",
  (req: Request, res: Response, next: NextFunction) =>
    quoteController.duplicateQuote(req as unknown as CompanyRequest, res, next)
);

export default router;
