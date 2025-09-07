import { Router } from "express";
import { CompanyAuthController } from "../controllers/CompanyAuthController";
import { authenticateCompanyUser } from "../../middleware/companyAuth";

const router = Router();
const companyAuthController = new CompanyAuthController();

// Public routes
router.post("/login", companyAuthController.login);
router.post("/refresh-token", companyAuthController.refreshToken);

// Protected routes
router.get(
  "/profile",
  authenticateCompanyUser,
  companyAuthController.getProfile
);
router.post(
  "/change-password",
  authenticateCompanyUser,
  companyAuthController.changePassword
);
router.post("/logout", authenticateCompanyUser, companyAuthController.logout);

export default router;
