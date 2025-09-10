import { Router } from "express";
import { CompanyTicketController } from "../controllers/CompanyTicketController";
import { authenticate } from "../middleware/companyAuth";

const router = Router();
const companyTicketController = new CompanyTicketController();

// All routes require company user authentication
router.use(authenticate);

// Ticket CRUD operations
router.post("/", companyTicketController.createTicket);
router.get("/", companyTicketController.getTickets);
router.get("/statistics", companyTicketController.getTicketStatistics);
router.get("/recent", companyTicketController.getRecentTickets);
router.get("/:id", companyTicketController.getTicketById);
router.put("/:id", companyTicketController.updateTicket);

export default router;
