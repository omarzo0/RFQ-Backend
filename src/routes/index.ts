import express from "express";
import authRoutes from "./auth";

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "RFQ Automation Platform API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      health: "/health",
    },
    documentation: "/api/docs",
  });
});

export default router;
