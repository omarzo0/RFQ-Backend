import { Request, Response } from "express";
import { CompanyTicketService } from "../services/CompanyTicketService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class CompanyTicketController {
  private companyTicketService: CompanyTicketService;

  constructor() {
    this.companyTicketService = new CompanyTicketService();
  }

  /**
   * Create a new support ticket
   * POST /api/v1/company/tickets
   */
  createTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, priority, category } = req.body;
      const companyId = (req as any).user?.companyId;
      const userId = (req as any).user?.id;

      if (!companyId || !userId) {
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
      };

      const newTicket = await this.companyTicketService.createTicket(
        ticketData,
        companyId,
        userId
      );

      successResponse(
        res,
        newTicket,
        "Support ticket created successfully",
        201
      );
    } catch (error) {
      logger.error("Create ticket error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get all tickets for the company
   * GET /api/v1/company/tickets
   */
  getTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      const {
        page = 1,
        limit = 20,
        status,
        priority,
        category,
        search,
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        priority: priority as string,
        category: category as string,
        search: search as string,
      };

      const result = await this.companyTicketService.getTickets(
        companyId,
        filters
      );

      successResponse(res, result, "Tickets retrieved successfully");
    } catch (error) {
      logger.error("Get tickets error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get a specific ticket by ID
   * GET /api/v1/company/tickets/:id
   */
  getTicketById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      if (!id) {
        errorResponse(res, "Ticket ID is required", 400);
        return;
      }

      const ticket = await this.companyTicketService.getTicketById(
        id,
        companyId
      );

      successResponse(res, ticket, "Ticket retrieved successfully");
    } catch (error) {
      logger.error("Get ticket by ID error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Update a ticket
   * PUT /api/v1/company/tickets/:id
   */
  updateTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, priority, category } = req.body;
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      if (!id) {
        errorResponse(res, "Ticket ID is required", 400);
        return;
      }

      const updateData = {
        title,
        description,
        priority,
        category,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(
        (key) =>
          updateData[key as keyof typeof updateData] === undefined &&
          delete updateData[key as keyof typeof updateData]
      );

      const updatedTicket = await this.companyTicketService.updateTicket(
        id,
        updateData,
        companyId
      );

      successResponse(res, updatedTicket, "Ticket updated successfully");
    } catch (error) {
      logger.error("Update ticket error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get ticket statistics
   * GET /api/v1/company/tickets/statistics
   */
  getTicketStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId;

      if (!companyId) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      const statistics = await this.companyTicketService.getTicketStatistics(
        companyId
      );

      successResponse(
        res,
        statistics,
        "Ticket statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Get ticket statistics error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get recent tickets
   * GET /api/v1/company/tickets/recent
   */
  getRecentTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId;
      const { limit = 10 } = req.query;

      if (!companyId) {
        errorResponse(res, "Authentication required", 401);
        return;
      }

      const tickets = await this.companyTicketService.getRecentTickets(
        companyId,
        parseInt(limit as string)
      );

      successResponse(res, tickets, "Recent tickets retrieved successfully");
    } catch (error) {
      logger.error("Get recent tickets error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
