import { Router } from "express";
import { AdminManagementController } from "../controllers/AdminManagementController";
import { authenticateAdmin, requireSuperAdmin } from "../middleware/adminAuth";

const router = Router();
const adminManagementController = new AdminManagementController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Admin management routes (only super admins can manage other admins)
router.post(
  "/admins",
  requireSuperAdmin,
  adminManagementController.createAdmin
);
router.get("/admins", requireSuperAdmin, adminManagementController.getAdmins);
router.get(
  "/admins/:id",
  requireSuperAdmin,
  adminManagementController.getAdminById
);
router.put(
  "/admins/:id",
  requireSuperAdmin,
  adminManagementController.updateAdmin
);
router.delete(
  "/admins/:id",
  requireSuperAdmin,
  adminManagementController.deleteAdmin
);
router.post(
  "/admins/:id/restore",
  requireSuperAdmin,
  adminManagementController.restoreAdmin
);
router.post(
  "/admins/:id/change-password",
  requireSuperAdmin,
  adminManagementController.changeAdminPassword
);
router.get(
  "/admins/:id/activity",
  requireSuperAdmin,
  adminManagementController.getAdminActivityLogs
);

// Admin statistics (available to all admins)
router.get("/statistics", adminManagementController.getAdminStatistics);

export default router;
