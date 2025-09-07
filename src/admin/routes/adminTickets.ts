import { Router } from "express";
import { AdminTicketController } from "../controllers/AdminTicketController";
import {
  authenticateAdmin,
  requireAdminOrSuperAdmin,
} from "../middleware/adminAuth";

const router = Router();
const adminTicketController = new AdminTicketController();

// All routes require admin authentication
router.use(authenticateAdmin);

// Ticket management routes
router.post("/", adminTicketController.createTicket);
router.get("/", adminTicketController.getTickets);
router.get("/statistics", adminTicketController.getTicketStatistics);
router.get("/my-tickets", adminTicketController.getMyTickets);
router.get("/recent", adminTicketController.getRecentTickets);
router.get("/:id", adminTicketController.getTicketById);
router.put("/:id", adminTicketController.updateTicket);
router.post("/:id/assign", adminTicketController.assignTicket);
router.post("/:id/close", adminTicketController.closeTicket);

export default router;
