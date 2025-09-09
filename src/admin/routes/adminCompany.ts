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
  "/",
  requireAdminOrSuperAdmin,
  adminCompanyController.createCompany
);
router.get("/", adminCompanyController.getCompanies);
router.get("/:companyId", adminCompanyController.getCompanyById);
router.put(
  "/:companyId",
  requireAdminOrSuperAdmin,
  adminCompanyController.updateCompany
);
router.delete(
  "/:companyId",
  requireAdminOrSuperAdmin,
  adminCompanyController.deleteCompany
);
router.post(
  "/:companyId/restore",
  requireAdminOrSuperAdmin,
  adminCompanyController.restoreCompany
);

export default router;
