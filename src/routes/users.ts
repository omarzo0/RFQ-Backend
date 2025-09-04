import express from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middleware/auth";

const router = express.Router();
const userController = new UserController();

// Apply authentication middleware to all routes
router.use(authenticate);

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

// User Roles and Permissions
router.get("/roles", userController.getUserRoles.bind(userController));
router.get(
  "/permissions",
  userController.getUserPermissions.bind(userController)
);

export default router;

