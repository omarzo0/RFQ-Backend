import express from "express";
import authRoutes from "./auth";

// Import new admin and company routes
import adminRoutes from "../admin/routes";
import companyRoutes from "../company/routes";

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);

// Mount new admin and company routes
router.use("/admin", adminRoutes);
router.use("/company", companyRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "RFQ Automation Platform API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      admin: "/api/v1/admin",
      company: "/api/v1/company",
      health: "/health",
    },
    documentation: "/api/docs",
  });
});

export default router;
