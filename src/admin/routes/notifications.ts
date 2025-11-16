import express from "express";
import NotificationController, {
  createNotificationValidation,
} from "../controllers/NotificationController";
import { authenticate } from "../middleware/auth";

const router = express.Router();
const notificationController = new NotificationController();

// Apply admin authentication to all routes
router.use(authenticate);

// POST /api/v1/admin/notifications - Create notification
router.post(
  "/",
  createNotificationValidation,
  notificationController.createNotification
);

// GET /api/v1/admin/notifications - Get all notifications
router.get("/", notificationController.getAllNotifications);

// GET /api/v1/admin/notifications/stats - Get notification statistics
router.get("/stats", notificationController.getNotificationStats);

// DELETE /api/v1/admin/notifications/:id - Delete notification
router.delete("/:id", notificationController.deleteNotification);

export default router;
