import express from "express";
import NotificationController, {
  createNotificationValidation,
} from "../controllers/NotificationController";
import { authenticate } from "../middleware/auth";
import { standardRateLimit, mutationRateLimit } from "../../middleware/rateLimiter";

const router = express.Router();
const notificationController = new NotificationController();

// Apply admin authentication to all routes
router.use(authenticate);

// POST /api/v1/admin/notifications - Create notification
router.post(
  "/",
  mutationRateLimit,
  createNotificationValidation,
  notificationController.createNotification
);

// GET /api/v1/admin/notifications - Get all notifications
router.get("/", standardRateLimit, notificationController.getAllNotifications);

// GET /api/v1/admin/notifications/stats - Get notification statistics
router.get("/stats", standardRateLimit, notificationController.getNotificationStats);

// DELETE /api/v1/admin/notifications/:id - Delete notification
router.delete("/:id", mutationRateLimit, notificationController.deleteNotification);

export default router;
