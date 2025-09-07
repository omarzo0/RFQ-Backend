import { Router } from "express";
import { AdminAuthController } from "../controllers/AdminAuthController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = Router();
const adminAuthController = new AdminAuthController();

// Public routes
router.post("/login", adminAuthController.login);
router.post("/refresh-token", adminAuthController.refreshToken);

// Protected routes
router.get("/profile", authenticateAdmin, adminAuthController.getProfile);
router.post(
  "/change-password",
  authenticateAdmin,
  adminAuthController.changePassword
);
router.post("/logout", authenticateAdmin, adminAuthController.logout);

export default router;
