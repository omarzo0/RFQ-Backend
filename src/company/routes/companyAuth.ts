import { Router, Request, Response } from "express";
import { CompanyAuthController } from "../controllers/CompanyAuthController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { CompanyRequest } from "../types/auth";

const router = Router();
const companyAuthController = new CompanyAuthController();

// Public routes
router.post("/login", companyAuthController.login);
router.post("/refresh-token", companyAuthController.refreshToken);

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
