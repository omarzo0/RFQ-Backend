import { Router } from "express";
import { AdminManagementController } from "../controllers/AdminManagementController";
import { authenticateAdmin, requireSuperAdmin } from "../middleware/adminAuth";
import { standardRateLimit, mutationRateLimit } from "../../middleware/rateLimiter";

const router = Router();
const adminManagementController = new AdminManagementController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Admin management routes (only super admins can manage other admins)
router.post(
  "/admins",
  mutationRateLimit,
  requireSuperAdmin,
  adminManagementController.createAdmin
);
router.get("/admins", standardRateLimit, requireSuperAdmin, adminManagementController.getAdmins);
router.get(
  "/admins/:id",
  standardRateLimit,
  requireSuperAdmin,
  adminManagementController.getAdminById
);
router.put(
  "/admins/:id",
  mutationRateLimit,
  requireSuperAdmin,
  adminManagementController.updateAdmin
);
router.delete(
  "/admins/:id",
  mutationRateLimit,
  requireSuperAdmin,
  adminManagementController.deleteAdmin
);
router.post(
  "/admins/:id/restore",
  mutationRateLimit,
  requireSuperAdmin,
  adminManagementController.restoreAdmin
);
router.post(
  "/admins/:id/change-password",
  mutationRateLimit,
  requireSuperAdmin,
  adminManagementController.changeAdminPassword
);
router.get(
  "/admins/:id/activity",
  standardRateLimit,
  requireSuperAdmin,
  adminManagementController.getAdminActivityLogs
);

// Admin statistics (available to all admins)
router.get("/statistics", standardRateLimit, adminManagementController.getAdminStatistics);

export default router;
