import { Router } from "express";
import { AdminAuthController } from "../controllers/AdminAuthController";
import { AdminPasswordResetController } from "../controllers/AdminPasswordResetController";
import { authenticateAdmin } from "../middleware/adminAuth";
import { body } from "express-validator";

const router = Router();
const adminAuthController = new AdminAuthController();
const adminPasswordResetController = new AdminPasswordResetController();

// Public routes
router.post("/login", adminAuthController.login);
router.post("/refresh-token", adminAuthController.refreshToken);

// Password reset routes (public)
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  adminPasswordResetController.requestPasswordReset
);
router.post(
  "/verify-otp",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  adminPasswordResetController.verifyOTP
);
router.post(
  "/reset-password",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  adminPasswordResetController.resetPassword
);

// Protected routes
router.get("/profile", authenticateAdmin, adminAuthController.getProfile);
router.post(
  "/change-password",
  authenticateAdmin,
  adminAuthController.changePassword
);
router.post("/logout", authenticateAdmin, adminAuthController.logout);

export default router;
