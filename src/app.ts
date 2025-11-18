// src/app.ts - Main Application Entry Point
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

// Load environment variables FIRST - before ANY other imports
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Debug: Check if environment variables are loaded
console.log("DATABASE_URL loaded:", !!process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

// NOW import other dependencies after environment variables are loaded
import { PrismaClient } from "@prisma/client";
import logger from "./utils/logger";

// Import cron jobs
import "./jobs/trialNotificationCron";
import { startCancelExpiredUpgradesCron } from "./company/jobs/cancelExpiredUpgrades";

// Initialize Prisma AFTER environment variables are loaded
export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" },
  ],
});

// Log slow queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$on("query", (e: any) => {
    if (e.duration > 1000) {
      logger.warn(`Slow query detected: ${e.duration}ms - ${e.query}`);
    }
  });
}

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3001"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Rate limiting
const rateLimitConfig = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "1000"),
  message: {
    error: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(rateLimitConfig);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Import routes
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

// API Routes
app.use("/api/v1", routes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    // Start cron jobs
    startCancelExpiredUpgradesCron();
    logger.info("⏰ Cron jobs started");

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
      logger.info(`📖 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default app;
