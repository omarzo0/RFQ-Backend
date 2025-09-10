import express from "express";
import { UserController } from "../controllers/UserController";
import { authenticateCompanyUser } from "../middleware/companyAuth";

const router = express.Router();
const userController = new UserController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

// User Roles and Permissions (must come before /:id routes)
router.get("/roles", userController.getUserRoles.bind(userController));
router.get(
  "/permissions",
  userController.getUserPermissions.bind(userController)
);

// User Management
router.get("/", userController.getUsers.bind(userController));
router.get("/:id", userController.getUserById.bind(userController));
router.post("/", userController.createUser.bind(userController));
router.put("/:id", userController.updateUser.bind(userController));
router.delete("/:id", userController.deleteUser.bind(userController));

// User Status and Role Management
router.put("/:id/status", userController.updateUserStatus.bind(userController));
router.put("/:id/role", userController.updateUserRole.bind(userController));
router.post(
  "/:id/reset-password",
  userController.resetUserPassword.bind(userController)
);

export default router;
