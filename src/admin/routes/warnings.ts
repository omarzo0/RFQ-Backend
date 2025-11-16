import express from "express";
import WarningController, {
  issueWarningValidation,
} from "../controllers/WarningController";
import { authenticate } from "../middleware/auth";

const router = express.Router();
const warningController = new WarningController();

// Apply admin authentication to all routes
router.use(authenticate);

// POST /api/v1/admin/warnings - Issue warning
router.post("/", issueWarningValidation, warningController.issueWarning);

// GET /api/v1/admin/warnings - Get all warnings
router.get("/", warningController.getAllWarnings);

// GET /api/v1/admin/warnings/stats - Get warning statistics
router.get("/stats", warningController.getWarningStats);

// PUT /api/v1/admin/warnings/:id/resolve - Resolve warning
router.put("/:id/resolve", warningController.resolveWarning);

// DELETE /api/v1/admin/warnings/:id - Delete warning
router.delete("/:id", warningController.deleteWarning);

export default router;
