import express, { Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/UserController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { CompanyRequest } from "../types/auth";

const router = express.Router();
const userController = new UserController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

// Current User Profile (must come before /:id routes)
router.get("/me", (req: Request, res: Response, next: NextFunction) =>
  userController.getMyProfile(req as unknown as CompanyRequest, res, next)
);
router.put("/me", (req: Request, res: Response, next: NextFunction) =>
  userController.updateMyProfile(req as unknown as CompanyRequest, res, next)
);

// User Roles and Permissions (must come before /:id routes)
router.get("/roles", (req: Request, res: Response, next: NextFunction) =>
  userController.getUserRoles(req as unknown as CompanyRequest, res, next)
);
router.get("/permissions", (req: Request, res: Response, next: NextFunction) =>
  userController.getUserPermissions(req as unknown as CompanyRequest, res, next)
);

// User Management
router.get("/", (req: Request, res: Response, next: NextFunction) =>
  userController.getUsers(req as unknown as CompanyRequest, res, next)
);
router.get("/:id", (req: Request, res: Response, next: NextFunction) =>
  userController.getUserById(req as unknown as CompanyRequest, res, next)
);
router.post("/", (req: Request, res: Response, next: NextFunction) =>
  userController.createUser(req as unknown as CompanyRequest, res, next)
);
router.put("/:id", (req: Request, res: Response, next: NextFunction) =>
  userController.updateUser(req as unknown as CompanyRequest, res, next)
);
router.delete("/:id", (req: Request, res: Response, next: NextFunction) =>
  userController.deleteUser(req as unknown as CompanyRequest, res, next)
);

// User Status and Role Management
router.put("/:id/status", (req: Request, res: Response, next: NextFunction) =>
  userController.updateUserStatus(req as unknown as CompanyRequest, res, next)
);
router.put("/:id/role", (req: Request, res: Response, next: NextFunction) =>
  userController.updateUserRole(req as unknown as CompanyRequest, res, next)
);
router.post(
  "/:id/reset-password",
  (req: Request, res: Response, next: NextFunction) =>
    userController.resetUserPassword(
      req as unknown as CompanyRequest,
      res,
      next
    )
);

export default router;
