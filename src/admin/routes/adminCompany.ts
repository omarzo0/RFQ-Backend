import { Router } from "express";
import { AdminCompanyController } from "../controllers/AdminCompanyController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminCompanyController = new AdminCompanyController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Dashboard
router.get("/dashboard/stats", adminCompanyController.getDashboardStats);

// Company CRUD operations
router.post(
  "/companies",
  requireAdminOrSuperAdmin,
  adminCompanyController.createCompany
);
router.get("/companies", adminCompanyController.getCompanies);
router.get("/companies/:companyId", adminCompanyController.getCompanyById);
router.put(
  "/companies/:companyId",
  requireAdminOrSuperAdmin,
  adminCompanyController.updateCompany
);
router.delete(
  "/companies/:companyId",
  requireAdminOrSuperAdmin,
  adminCompanyController.deleteCompany
);
router.post(
  "/companies/:companyId/restore",
  requireAdminOrSuperAdmin,
  adminCompanyController.restoreCompany
);

export default router;
