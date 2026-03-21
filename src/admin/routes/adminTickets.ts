import { Router } from "express";
import { AdminTicketController } from "../controllers/AdminTicketController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";
import { standardRateLimit, mutationRateLimit } from "../../middleware/rateLimiter";

const router = Router();
const adminTicketController = new AdminTicketController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Ticket read routes
router.get("/", standardRateLimit, adminTicketController.getTickets);
router.get("/statistics", standardRateLimit, adminTicketController.getTicketStatistics);
router.get("/my-tickets", standardRateLimit, adminTicketController.getMyTickets);
router.get("/recent", standardRateLimit, adminTicketController.getRecentTickets);
router.get("/:id", standardRateLimit, adminTicketController.getTicketById);

// Ticket mutation routes
router.put("/:id", mutationRateLimit, adminTicketController.updateTicket);
router.post("/:id/assign", mutationRateLimit, adminTicketController.assignTicket);
router.post("/:id/close", mutationRateLimit, adminTicketController.closeTicket);

export default router;
