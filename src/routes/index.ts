import express from "express";
import healthRoutes from "./health";
import adminRoutes from "../admin/routes";

const router = express.Router();

// Health check route
router.use("/health", healthRoutes);

// Admin routes
router.use("/admin", adminRoutes);

// Company routes
import companyRoutes from "../company/routes";
router.use("/company", companyRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "RFQ Automation Platform API",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      admin: {
        auth: "/api/v1/admin/auth",
        dashboard: "/api/v1/admin/dashboard",
        analytics: "/api/v1/admin/analytics",
        management: "/api/v1/admin/management",
        companies: "/api/v1/admin/companies",
      },
      company: {
        auth: "/api/v1/company/auth",
        contacts: "/api/v1/company/contacts",
        tickets: "/api/v1/company/tickets",
        emails: "/api/v1/company/emails",
        quotes: "/api/v1/company/quotes",
        rfqs: "/api/v1/company/rfqs",
        shippingLines: "/api/v1/company/shipping-lines",
        templates: "/api/v1/company/templates",
        users: "/api/v1/company/users",
        analytics: "/api/v1/company/analytics",
        replyIngestion: "/api/v1/company/reply-ingestion",
        payments: "/api/v1/company/payments",
        usage: "/api/v1/company/usage",
        billingOptimization: "/api/v1/company/billing/optimization",
      }
    },
    documentation: "/api/docs",
  });
});

export default router;
