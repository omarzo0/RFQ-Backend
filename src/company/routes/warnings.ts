import express from "express";
import CompanyWarningController from "../controllers/CompanyWarningController";
import { authenticate } from "../middleware/companyAuth";
import { standardRateLimit } from "../../middleware/rateLimiter";

const router = express.Router();
const warningController = new CompanyWarningController();

// Apply company authentication to all routes
router.use(authenticate);
router.use(standardRateLimit);

// GET /api/v1/company/warnings - Get all warnings
router.get("/", warningController.getWarnings);

// GET /api/v1/company/warnings/active-count - Get active warning count
router.get("/active-count", warningController.getActiveCount);

export default router;
