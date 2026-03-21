import express from "express";
import WarningController, {
  issueWarningValidation,
} from "../controllers/WarningController";
import { authenticate } from "../middleware/auth";
import { standardRateLimit, mutationRateLimit } from "../../middleware/rateLimiter";

const router = express.Router();
const warningController = new WarningController();

// Apply admin authentication to all routes
router.use(authenticate);

// POST /api/v1/admin/warnings - Issue warning
router.post("/", mutationRateLimit, issueWarningValidation, warningController.issueWarning);

// GET /api/v1/admin/warnings - Get all warnings
router.get("/", standardRateLimit, warningController.getAllWarnings);

// GET /api/v1/admin/warnings/stats - Get warning statistics
router.get("/stats", standardRateLimit, warningController.getWarningStats);

// PUT /api/v1/admin/warnings/:id/resolve - Resolve warning
router.put("/:id/resolve", mutationRateLimit, warningController.resolveWarning);

// DELETE /api/v1/admin/warnings/:id - Delete warning
router.delete("/:id", mutationRateLimit, warningController.deleteWarning);

export default router;
