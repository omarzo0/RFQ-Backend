import express from "express";
import CompanyNotificationController from "../controllers/CompanyNotificationController";
import { authenticate } from "../middleware/companyAuth";
import { standardRateLimit } from "../../middleware/rateLimiter";

const router = express.Router();
const notificationController = new CompanyNotificationController();

// Apply company authentication to all routes
router.use(authenticate);
router.use(standardRateLimit);

// GET /api/v1/company/notifications - Get all notifications
router.get("/", notificationController.getNotifications);

// GET /api/v1/company/notifications/unread-count - Get unread notification count
router.get("/unread-count", notificationController.getUnreadCount);

// PUT /api/v1/company/notifications/:id/read - Mark notification as read
router.put("/:id/read", notificationController.markAsRead);

// PUT /api/v1/company/notifications/read-all - Mark all notifications as read
router.put("/read-all", notificationController.markAllAsRead);

export default router;
