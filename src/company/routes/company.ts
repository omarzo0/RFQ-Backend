import express from "express";
import multer from "multer";
import { CompanyController } from "../controllers/CompanyController";
import { authenticate } from "../middleware/auth";

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

// Apply authentication middleware to all routes
router.use(authenticate);

// Company Profile
router.get(
  "/profile",
  companyController.getCompanyProfile.bind(companyController)
);
router.put(
  "/profile",
  companyController.updateCompanyProfile.bind(companyController)
);
router.post(
  "/logo",
  upload.single("logo"),
  companyController.uploadCompanyLogo.bind(companyController)
);

// User Preferences
router.get(
  "/user-preferences",
  companyController.getUserPreferences.bind(companyController)
);
router.put(
  "/user-preferences",
  companyController.updateUserPreferences.bind(companyController)
);

// Subscription Management
router.get(
  "/subscription",
  companyController.getSubscription.bind(companyController)
);
router.put(
  "/subscription",
  companyController.updateSubscription.bind(companyController)
);

// Usage Metrics
router.get("/usage", companyController.getUsageMetrics.bind(companyController));

// Billing History
router.get(
  "/billing-history",
  companyController.getBillingHistory.bind(companyController)
);

// Payment Methods
router.get(
  "/payment-methods",
  companyController.getPaymentMethods.bind(companyController)
);
router.post(
  "/payment-methods",
  companyController.addPaymentMethod.bind(companyController)
);
router.delete(
  "/payment-methods/:id",
  companyController.deletePaymentMethod.bind(companyController)
);
router.put(
  "/payment-methods/:id/default",
  companyController.setDefaultPaymentMethod.bind(companyController)
);

// Billing Settings
router.get(
  "/billing-settings",
  companyController.getBillingSettings.bind(companyController)
);
router.put(
  "/billing-settings",
  companyController.updateBillingSettings.bind(companyController)
);

// API Keys
router.get("/api-keys", companyController.getAPIKeys.bind(companyController));
router.post(
  "/api-keys",
  companyController.createAPIKey.bind(companyController)
);
router.delete(
  "/api-keys/:id",
  companyController.revokeAPIKey.bind(companyController)
);

// Webhooks
router.get("/webhooks", companyController.getWebhooks.bind(companyController));
router.post(
  "/webhooks",
  companyController.createWebhook.bind(companyController)
);
router.put(
  "/webhooks/:id",
  companyController.updateWebhook.bind(companyController)
);
router.delete(
  "/webhooks/:id",
  companyController.deleteWebhook.bind(companyController)
);

// Integrations
router.get(
  "/integrations",
  companyController.getIntegrations.bind(companyController)
);
router.post(
  "/integrations/:type/connect",
  companyController.connectIntegration.bind(companyController)
);
router.delete(
  "/integrations/:type/disconnect",
  companyController.disconnectIntegration.bind(companyController)
);

export default router;

