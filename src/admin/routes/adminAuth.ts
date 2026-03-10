import { Router } from "express";
import { AdminAuthController } from "../controllers/AdminAuthController";
import { authenticateAdmin } from "../middleware/adminAuth";
import { body } from "express-validator";

const router = Router();
const controller = new AdminAuthController();

// ─── Public Routes ─────────────────────────────────────────────────────
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);

// ─── Password Reset (Public) ───────────────────────────────────────────
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  controller.requestPasswordReset
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
  controller.resetPassword
);

// ─── Protected Routes ──────────────────────────────────────────────────
router.get("/profile", authenticateAdmin, controller.getProfile);
router.post("/logout", authenticateAdmin, controller.logout);

export default router;
