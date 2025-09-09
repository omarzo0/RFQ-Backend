import express from "express";
import healthRoutes from "./health";
import adminRoutes from "../admin/routes";

const router = express.Router();

// Health check route
router.use("/health", healthRoutes);

// Admin routes
router.use("/admin", adminRoutes);

// TODO: Add company routes when TypeScript errors are fixed
// router.use("/company", companyRoutes);

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
      // TODO: Add company endpoints when routes are fixed
    },
    documentation: "/api/docs",
  });
});

export default router;
