import { Router, Request, Response } from "express";
import { CompanyAuthController } from "../controllers/CompanyAuthController";
import { CompanyPasswordResetController } from "../controllers/CompanyPasswordResetController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { CompanyRequest } from "../types/auth";
import { body } from "express-validator";
import { authRateLimit, standardRateLimit } from "../../middleware/rateLimiter";

const router = Router();
const companyAuthController = new CompanyAuthController();
const companyPasswordResetController = new CompanyPasswordResetController();

// Public routes (strict auth rate limit)
router.post("/login", authRateLimit, companyAuthController.login);
router.post("/refresh-token", authRateLimit, companyAuthController.refreshToken);

// Password reset routes (public, strict)
router.post(
  "/forgot-password",
  authRateLimit,
  [body("email").isEmail().normalizeEmail()],
  companyPasswordResetController.requestPasswordReset
);
router.post(
  "/verify-otp",
  authRateLimit,
  [
    body("email").isEmail().normalizeEmail(),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  companyPasswordResetController.verifyOTP
);
router.post(
  "/reset-password",
  authRateLimit,
  [
    body("email").isEmail().normalizeEmail(),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  companyPasswordResetController.resetPassword
);

// Protected routes
router.get("/profile", authenticateCompanyUser, standardRateLimit, (req: Request, res: Response) =>
  companyAuthController.getProfile(req as unknown as CompanyRequest, res)
);
router.post(
  "/change-password",
  authenticateCompanyUser,
  standardRateLimit,
  (req: Request, res: Response) =>
    companyAuthController.changePassword(req as unknown as CompanyRequest, res)
);
router.post("/logout", authenticateCompanyUser, standardRateLimit, (req: Request, res: Response) =>
  companyAuthController.logout(req as unknown as CompanyRequest, res)
);

export default router;
