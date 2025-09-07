import express from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middleware/auth";
import {
  loginValidation,
  registerCompanyValidation,
  refreshTokenValidation,
  changePasswordValidation,
} from "../validators/authValidators";

const router = express.Router();
const authController = new AuthController();

// Public routes (no authentication required)
router.post("/login/admin", loginValidation, authController.loginAdmin);
router.post("/login/company", loginValidation, authController.loginCompany);
router.post(
  "/register/company",
  registerCompanyValidation,
  authController.registerCompany
);
router.post("/refresh", refreshTokenValidation, authController.refreshToken);

// Protected routes (authentication required)
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);
router.put(
  "/change-password",
  authenticate,
  changePasswordValidation,
  authController.changePassword
);

export default router;
