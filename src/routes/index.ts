import express from "express";
import authRoutes from "./auth";
import analyticsRoutes from "./analytics";
import companyRoutes from "./company";
import rfqRoutes from "./rfqs";
import contactRoutes from "./contacts";
import userRoutes from "./users";
import shippingLineRoutes from "./shipping-lines";
import templateRoutes from "./templates";
import quoteRoutes from "./quotes";
import emailRoutes from "./emails";
import replyIngestionRoutes from "./reply-ingestion";

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/company", companyRoutes);
router.use("/rfqs", rfqRoutes);
router.use("/contacts", contactRoutes);
router.use("/users", userRoutes);
router.use("/shipping-lines", shippingLineRoutes);
router.use("/templates", templateRoutes);
router.use("/quotes", quoteRoutes);
router.use("/emails", emailRoutes);
router.use("/reply-ingestion", replyIngestionRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    message: "RFQ Automation Platform API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      analytics: "/api/v1/analytics",
      company: "/api/v1/company",
      rfqs: "/api/v1/rfqs",
      contacts: "/api/v1/contacts",
      users: "/api/v1/users",
      shippingLines: "/api/v1/shipping-lines",
      templates: "/api/v1/templates",
      quotes: "/api/v1/quotes",
      emails: "/api/v1/emails",
      replyIngestion: "/api/v1/reply-ingestion",
      health: "/health",
    },
    documentation: "/api/docs",
  });
});

export default router;
