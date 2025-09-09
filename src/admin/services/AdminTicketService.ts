import { prisma } from "../../app";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";

export interface TicketCreateData {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category:
    | "TECHNICAL"
    | "BILLING"
    | "FEATURE_REQUEST"
    | "BUG_REPORT"
    | "GENERAL";
  companyId?: string;
  assignedTo?: string;
}

export interface TicketUpdateData {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?:
    | "TECHNICAL"
    | "BILLING"
    | "FEATURE_REQUEST"
    | "BUG_REPORT"
    | "GENERAL";
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedTo?: string;
  resolution?: string;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  companyId?: string;
  search?: string;
}

export interface TicketResponse {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  company?: {
    id: string;
    name: string;
    email: string;
  };
  assignedAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class AdminTicketService {
  /**
   * Create a new support ticket
   */
  async createTicket(data: TicketCreateData, createdById: string) {
    try {
      const ticket = await prisma.supportTicket.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority as any,
          category: data.category,
          companyId: data.companyId,
          assignedTo: data.assignedTo,
          userId: createdById,
          status: "OPEN",
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      logger.info(`Support ticket created: ${ticket.id} by ${createdById}`);

      return ticket;
    } catch (error) {
      logger.error("Error creating support ticket:", error);
      throw new AppError("Failed to create support ticket", 500);
    }
  }

  /**
   * Get all tickets with filtering and pagination
   */
  async getTickets(filters: TicketFilters = {}) {
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
      } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (category) where.category = category;
      if (assignedTo) where.assignedTo = assignedTo;
      if (companyId) where.companyId = companyId;
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
            company: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Error getting support tickets:", error);
      throw new AppError("Failed to get support tickets", 500);
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: string) {
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
        throw new AppError("Support ticket not found", 404);
      }

      return ticket;
    } catch (error) {
      logger.error("Error getting support ticket by ID:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get support ticket", 500);
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId: string, data: TicketUpdateData) {
    try {
      const existingTicket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!existingTicket) {
        throw new AppError("Support ticket not found", 404);
      }

      const updateData: any = { ...data };

      // If status is being changed to RESOLVED or CLOSED, set resolvedAt
      if (data.status && ["RESOLVED", "CLOSED"].includes(data.status)) {
        updateData.resolvedAt = new Date();
      }

      const updatedTicket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      logger.info(`Support ticket updated: ${ticketId}`);

      return updatedTicket;
    } catch (error) {
      logger.error("Error updating support ticket:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update support ticket", 500);
    }
  }

  /**
   * Assign ticket to admin
   */
  async assignTicket(ticketId: string, adminId: string) {
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new AppError("Support ticket not found", 404);
      }

      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      const updatedTicket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          assignedTo: adminId,
          status: "IN_PROGRESS",
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      logger.info(`Support ticket ${ticketId} assigned to admin ${adminId}`);

      return updatedTicket;
    } catch (error) {
      logger.error("Error assigning support ticket:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to assign support ticket", 500);
    }
  }

  /**
   * Close ticket
   */
  async closeTicket(ticketId: string, resolution?: string) {
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new AppError("Support ticket not found", 404);
      }

      const updatedTicket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: "CLOSED",
          resolvedAt: new Date(),
          // resolution field doesn't exist in schema
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      logger.info(`Support ticket ${ticketId} closed`);

      return updatedTicket;
    } catch (error) {
      logger.error("Error closing support ticket:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to close support ticket", 500);
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStatistics() {
    try {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        urgentTickets,
        highPriorityTickets,
        ticketsByCategory,
        ticketsByPriority,
      ] = await Promise.all([
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: "OPEN" } }),
        prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
        prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
        prisma.supportTicket.count({ where: { status: "CLOSED" } }),
        prisma.supportTicket.count({ where: { priority: "URGENT" } }),
        prisma.supportTicket.count({ where: { priority: "HIGH" } }),
        prisma.supportTicket.groupBy({
          by: ["category"],
          _count: { category: true },
        }),
        prisma.supportTicket.groupBy({
          by: ["priority"],
          _count: { priority: true },
        }),
      ]);

      return {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        urgentTickets,
        highPriorityTickets,
        ticketsByCategory: ticketsByCategory.map((item) => ({
          category: item.category,
          count: item._count.category,
        })),
        ticketsByPriority: ticketsByPriority.map((item) => ({
          priority: item.priority,
          count: item._count.priority,
        })),
        resolutionRate:
          totalTickets > 0
            ? ((resolvedTickets + closedTickets) / totalTickets) * 100
            : 0,
      };
    } catch (error) {
      logger.error("Error getting ticket statistics:", error);
      throw new AppError("Failed to get ticket statistics", 500);
    }
  }

  /**
   * Get tickets assigned to specific admin
   */
  async getTicketsByAdmin(adminId: string, filters: TicketFilters = {}) {
    try {
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      return this.getTickets({ ...filters, assignedTo: adminId });
    } catch (error) {
      logger.error("Error getting tickets by admin:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get tickets by admin", 500);
    }
  }

  /**
   * Get recent tickets
   */
  async getRecentTickets(limit: number = 10) {
    try {
      const tickets = await prisma.supportTicket.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
