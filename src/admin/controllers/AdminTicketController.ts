import { Request, Response } from "express";
import { AdminTicketService } from "../services/AdminTicketService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class AdminTicketController {
  private adminTicketService: AdminTicketService;

  constructor() {
    this.adminTicketService = new AdminTicketService();
  }

  /**
   * Create a new support ticket
   * POST /api/v1/admin/tickets
   */
  createTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, priority, category, companyId, assignedTo } =
        req.body;
      const createdById = (req as any).user?.id;

      if (!createdById) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      // Validate required fields
      if (!title || !description || !priority || !category) {
        errorResponse(
          res,
          "Title, description, priority, and category are required",
          400
        );
        return;
      }

      const ticketData = {
        title,
        description,
        priority,
        category,
        companyId,
        assignedTo,
      };

      const newTicket = await this.adminTicketService.createTicket(
        ticketData,
        createdById
      );

      res
        .status(201)
        .json(
          successResponse(newTicket, "Support ticket created successfully")
        );
    } catch (error) {
      logger.error("Create ticket error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get all support tickets
   * GET /api/v1/admin/tickets
   */
  getTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        category,
        assignedTo,
        companyId,
        search,
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        priority: priority as string,
        category: category as string,
        assignedTo: assignedTo as string,
        companyId: companyId as string,
        search: search as string,
      };

      const ticketsData = await this.adminTicketService.getTickets(filters);

      res
        .status(200)
        .json(
          successResponse(ticketsData, "Support tickets retrieved successfully")
        );
    } catch (error) {
      logger.error("Get tickets error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get ticket by ID
   * GET /api/v1/admin/tickets/:id
   */
  getTicketById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Ticket ID is required", 400);
        return;
      }

      const ticket = await this.adminTicketService.getTicketById(id);

      res
        .status(200)
        .json(successResponse(ticket, "Support ticket retrieved successfully"));
    } catch (error) {
      logger.error("Get ticket by ID error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Update ticket
   * PUT /api/v1/admin/tickets/:id
   */
  updateTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        errorResponse(res, "Ticket ID is required", 400);
        return;
      }

      const updatedTicket = await this.adminTicketService.updateTicket(
        id,
        updateData
      );

      res
        .status(200)
        .json(
          successResponse(updatedTicket, "Support ticket updated successfully")
        );
    } catch (error) {
      logger.error("Update ticket error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Assign ticket to admin
   * POST /api/v1/admin/tickets/:id/assign
   */
  assignTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { adminId } = req.body;

      if (!id) {
        errorResponse(res, "Ticket ID is required", 400);
        return;
      }

      if (!adminId) {
        errorResponse(res, "Admin ID is required", 400);
        return;
      }

      const assignedTicket = await this.adminTicketService.assignTicket(
        id,
        adminId
      );

      res
        .status(200)
        .json(successResponse(assignedTicket, "Ticket assigned successfully"));
    } catch (error) {
      logger.error("Assign ticket error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Close ticket
   * POST /api/v1/admin/tickets/:id/close
   */
  closeTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { resolution } = req.body;

      if (!id) {
        errorResponse(res, "Ticket ID is required", 400);
        return;
      }

      const closedTicket = await this.adminTicketService.closeTicket(
        id,
        resolution
      );

      res
        .status(200)
        .json(successResponse(closedTicket, "Ticket closed successfully"));
    } catch (error) {
      logger.error("Close ticket error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get ticket statistics
   * GET /api/v1/admin/tickets/statistics
   */
  getTicketStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.adminTicketService.getTicketStatistics();

      res
        .status(200)
        .json(
          successResponse(
            statistics,
            "Ticket statistics retrieved successfully"
          )
        );
    } catch (error) {
      logger.error("Get ticket statistics error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get tickets assigned to current admin
   * GET /api/v1/admin/tickets/my-tickets
   */
  getMyTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = (req as any).user?.id;
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        category,
        search,
      } = req.query;

      if (!adminId) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        priority: priority as string,
        category: category as string,
        search: search as string,
      };

      const ticketsData = await this.adminTicketService.getTicketsByAdmin(
        adminId,
        filters
      );

      res
        .status(200)
        .json(
          successResponse(ticketsData, "My tickets retrieved successfully")
        );
    } catch (error) {
      logger.error("Get my tickets error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get recent tickets
   * GET /api/v1/admin/tickets/recent
   */
  getRecentTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10 } = req.query;

      const tickets = await this.adminTicketService.getRecentTickets(
        parseInt(limit as string)
      );

      res
        .status(200)
        .json(
          successResponse(tickets, "Recent tickets retrieved successfully")
        );
    } catch (error) {
      logger.error("Get recent tickets error:", error);

      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(errorResponse(res, error.message, error.statusCode));
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
