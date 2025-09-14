import { Router, Request, Response } from "express";
import { CompanyAuthController } from "../controllers/CompanyAuthController";
import { CompanyPasswordResetController } from "../controllers/CompanyPasswordResetController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { CompanyRequest } from "../types/auth";
import { body } from "express-validator";

const router = Router();
const companyAuthController = new CompanyAuthController();
const companyPasswordResetController = new CompanyPasswordResetController();

// Public routes
router.post("/login", companyAuthController.login);
router.post("/refresh-token", companyAuthController.refreshToken);

// Password reset routes (public)
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  companyPasswordResetController.requestPasswordReset
);
router.post(
  "/verify-otp",
  [
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  authenticateCompanyUser, // Require authentication to get email from token
  companyPasswordResetController.verifyOTP
);
router.post(
  "/reset-password",
  [
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  authenticateCompanyUser, // Require authentication to get email from token
  companyPasswordResetController.resetPassword
);

// Protected routes
router.get("/profile", authenticateCompanyUser, (req: Request, res: Response) =>
  companyAuthController.getProfile(req as unknown as CompanyRequest, res)
);
router.post(
  "/change-password",
  authenticateCompanyUser,
  (req: Request, res: Response) =>
    companyAuthController.changePassword(req as unknown as CompanyRequest, res)
);
router.post("/logout", authenticateCompanyUser, (req: Request, res: Response) =>
  companyAuthController.logout(req as unknown as CompanyRequest, res)
);

export default router;
