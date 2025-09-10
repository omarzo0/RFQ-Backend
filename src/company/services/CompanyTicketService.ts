import { prisma } from "../../utils/prisma";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export interface TicketCreateData {
  title: string;
  description: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  category: string;
}

export interface TicketUpdateData {
  title?: string;
  description?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  category?: string;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  category?: string;
  search?: string;
}

export interface TicketResponse {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string | null;
  status: string;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
}

export class CompanyTicketService {
  /**
   * Create a new support ticket for the company
   */
  async createTicket(
    data: TicketCreateData,
    companyId: string,
    userId: string
  ) {
    try {
      const ticket = await prisma.supportTicket.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority as any,
          category: data.category,
          companyId: companyId,
          userId: userId,
          userType: "COMPANY_USER",
          status: "OPEN",
        },
        include: {
          assignedAdmin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logger.info(
        `Support ticket created: ${ticket.id} by company ${companyId}`
      );

      return ticket;
    } catch (error) {
      logger.error("Error creating support ticket:", error);
      throw new AppError("Failed to create support ticket", 500);
    }
  }

  /**
   * Get all tickets for the company with filtering and pagination
   */
  async getTickets(companyId: string, filters: TicketFilters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        category,
        search,
      } = filters;

      const skip = (page - 1) * limit;

      const where: any = {
        companyId: companyId,
      };

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (category) {
        where.category = category;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [tickets, total] = await Promise.all([
        prisma.supportTicket.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            assignedAdmin: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        prisma.supportTicket.count({ where }),
      ]);

      return {
        tickets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error getting company tickets:", error);
      throw new AppError("Failed to get tickets", 500);
    }
  }

  /**
   * Get a specific ticket by ID for the company
   */
  async getTicketById(ticketId: string, companyId: string) {
    try {
      const ticket = await prisma.supportTicket.findFirst({
        where: {
          id: ticketId,
          companyId: companyId,
        },
        include: {
          assignedAdmin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!ticket) {
        throw new AppError("Ticket not found", 404);
      }

      return ticket;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error getting ticket by ID:", error);
      throw new AppError("Failed to get ticket", 500);
    }
  }

  /**
   * Update a ticket (only if it's not closed)
   */
  async updateTicket(
    ticketId: string,
    data: TicketUpdateData,
    companyId: string
  ) {
    try {
      // First check if ticket exists and belongs to company
      const existingTicket = await prisma.supportTicket.findFirst({
        where: {
          id: ticketId,
          companyId: companyId,
        },
      });

      if (!existingTicket) {
        throw new AppError("Ticket not found", 404);
      }

      // Don't allow updates to closed tickets
      if (existingTicket.status === "CLOSED") {
        throw new AppError("Cannot update closed tickets", 400);
      }

      const updatedTicket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          ...data,
          priority: data.priority as any,
        },
        include: {
          assignedAdmin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      logger.info(
        `Support ticket updated: ${ticketId} by company ${companyId}`
      );

      return updatedTicket;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error updating support ticket:", error);
      throw new AppError("Failed to update support ticket", 500);
    }
  }

  /**
   * Get ticket statistics for the company
   */
  async getTicketStatistics(companyId: string) {
    try {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
      ] = await Promise.all([
        prisma.supportTicket.count({
          where: { companyId },
        }),
        prisma.supportTicket.count({
          where: { companyId, status: "OPEN" },
        }),
        prisma.supportTicket.count({
          where: { companyId, status: "IN_PROGRESS" },
        }),
        prisma.supportTicket.count({
          where: { companyId, status: "RESOLVED" },
        }),
        prisma.supportTicket.count({
          where: { companyId, status: "CLOSED" },
        }),
      ]);

      return {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
      };
    } catch (error) {
      logger.error("Error getting ticket statistics:", error);
      throw new AppError("Failed to get ticket statistics", 500);
    }
  }

  /**
   * Get recent tickets for the company
   */
  async getRecentTickets(companyId: string, limit: number = 10) {
    try {
      const tickets = await prisma.supportTicket.findMany({
        where: { companyId },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          assignedAdmin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return tickets;
    } catch (error) {
      logger.error("Error getting recent tickets:", error);
      throw new AppError("Failed to get recent tickets", 500);
    }
  }
}
