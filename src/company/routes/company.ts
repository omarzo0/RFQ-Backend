import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { CompanyController } from "../controllers/CompanyController";
import { authenticate } from "../middleware/companyAuth";
import { CompanyRequest } from "../types/auth";

const router = express.Router();
const companyController = new CompanyController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
        error: err.message,
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message,
    });
  } else if (err) {
    // Handle multipart boundary errors
    if (err.message && err.message.includes("Boundary not found")) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request format. Please ensure the request is sent as multipart/form-data.",
        error:
          "Multipart boundary not found. Make sure to use form-data format with proper Content-Type header.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: err.message,
    });
  }
  next();
};

// Apply authentication middleware to all routes
router.use(authenticate);

// Company Profile
router.get("/profile", (req: Request, res: Response, next: NextFunction) =>
  companyController.getCompanyProfile(
    req as unknown as CompanyRequest,
    res,
    next
  )
);
router.put("/profile", (req: Request, res: Response, next: NextFunction) =>
  companyController.updateCompanyProfile(
    req as unknown as CompanyRequest,
    res,
    next
  )
);
router.post(
  "/logo",
  upload.single("logo"),
  handleMulterError,
  (req: Request, res: Response, next: NextFunction) =>
    companyController.uploadCompanyLogo(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// User Preferences
router.get(
  "/user-preferences",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.getUserPreferences(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.put(
  "/user-preferences",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.updateUserPreferences(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Subscription Management
router.get("/subscription", (req: Request, res: Response, next: NextFunction) =>
  companyController.getSubscription(req as unknown as CompanyRequest, res, next)
);
router.put("/subscription", (req: Request, res: Response, next: NextFunction) =>
  companyController.updateSubscription(
    req as unknown as CompanyRequest,
    res,
    next
  )
);

// Usage Metrics
router.get("/usage", (req: Request, res: Response, next: NextFunction) =>
  companyController.getUsageMetrics(req as unknown as CompanyRequest, res, next)
);

// Billing History
router.get(
  "/billing-history",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.getBillingHistory(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Payment Methods
router.get(
  "/payment-methods",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.getPaymentMethods(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.post(
  "/payment-methods",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.addPaymentMethod(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.delete(
  "/payment-methods/:id",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.deletePaymentMethod(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.put(
  "/payment-methods/:id/default",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.setDefaultPaymentMethod(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// Billing Settings
router.get(
  "/billing-settings",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.getBillingSettings(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.put(
  "/billing-settings",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.updateBillingSettings(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

// API Keys
router.get("/api-keys", (req: Request, res: Response, next: NextFunction) =>
  companyController.getAPIKeys(req as unknown as CompanyRequest, res, next)
);
router.post("/api-keys", (req: Request, res: Response, next: NextFunction) =>
  companyController.createAPIKey(req as unknown as CompanyRequest, res, next)
);
router.delete(
  "/api-keys/:id",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.revokeAPIKey(req as unknown as CompanyRequest, res, next)
);

// Webhooks
router.get("/webhooks", (req: Request, res: Response, next: NextFunction) =>
  companyController.getWebhooks(req as unknown as CompanyRequest, res, next)
);
router.post("/webhooks", (req: Request, res: Response, next: NextFunction) =>
  companyController.createWebhook(req as unknown as CompanyRequest, res, next)
);
router.put("/webhooks/:id", (req: Request, res: Response, next: NextFunction) =>
  companyController.updateWebhook(req as unknown as CompanyRequest, res, next)
);
router.delete(
  "/webhooks/:id",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.deleteWebhook(req as unknown as CompanyRequest, res, next)
);

// Integrations
router.get("/integrations", (req: Request, res: Response, next: NextFunction) =>
  companyController.getIntegrations(req as unknown as CompanyRequest, res, next)
);
router.post(
  "/integrations/:type/connect",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.connectIntegration(
      req as unknown as CompanyRequest,
      res,
      next
    )
);
router.delete(
  "/integrations/:type/disconnect",
  (req: Request, res: Response, next: NextFunction) =>
    companyController.disconnectIntegration(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

export default router;
