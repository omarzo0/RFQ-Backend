import { Router } from "express";
import { AdminCompanyController } from "../controllers/AdminCompanyController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";
import { createCompanyUserValidation } from "../../validators/authValidators";
import { standardRateLimit, mutationRateLimit } from "../../middleware/rateLimiter";

const router = Router();
const adminCompanyController = new AdminCompanyController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Dashboard
router.get("/dashboard/stats", standardRateLimit, adminCompanyController.getDashboardStats);

// Company CRUD operations
router.post(
  "/",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminCompanyController.createCompany
);
router.get("/", standardRateLimit, adminCompanyController.getCompanies);
router.get("/:companyId", standardRateLimit, adminCompanyController.getCompanyById);
router.put(
  "/:companyId",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminCompanyController.updateCompany
);
router.delete(
  "/:companyId",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminCompanyController.deleteCompany
);
router.post(
  "/:companyId/restore",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminCompanyController.restoreCompany
);

// Company user management
router.post(
  "/users",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  createCompanyUserValidation,
  adminCompanyController.createCompanyUser
);
router.get("/:companyId/users", standardRateLimit, adminCompanyController.getCompanyUsers);
router.put(
  "/users/:userId",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminCompanyController.updateCompanyUser
);
router.delete(
  "/users/:userId",
  mutationRateLimit,
  requireAdminOrSuperAdmin,
  adminCompanyController.deleteCompanyUser
);

export default router;
