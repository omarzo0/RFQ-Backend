import { Router } from "express";
import { AdminCompanyController } from "../controllers/AdminCompanyController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";
import { createCompanyUserValidation } from "../../validators/authValidators";

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

// Company user management
router.post(
  "/users",
  requireAdminOrSuperAdmin,
  createCompanyUserValidation,
  adminCompanyController.createCompanyUser
);
router.get("/:companyId/users", adminCompanyController.getCompanyUsers);
router.put(
  "/users/:userId",
  requireAdminOrSuperAdmin,
  adminCompanyController.updateCompanyUser
);
router.delete(
  "/users/:userId",
  requireAdminOrSuperAdmin,
  adminCompanyController.deleteCompanyUser
);

export default router;
