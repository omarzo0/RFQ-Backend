import { prisma } from "../../app";
import { ValidationError } from "../../utils/errors";
import { FollowUpService } from "./FollowUpService";

export class RFQService {
  private followUpService = new FollowUpService();
  /**
   * Get RFQs with pagination and filtering
   */
  async getRFQs(
    companyId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      priority?: string;
      urgency?: string;
      tradeLane?: string;
      tag?: string;
      assignedTo?: string;
      createdBy?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) {
    const {
      page,
      limit,
      search,
      status,
      priority,
      urgency,
      tradeLane,
      tag,
      assignedTo,
      createdBy,
      dateFrom,
      dateTo,
    } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    // Status filtering
    if (status) {
      where.status = status;
    }

    // Priority filtering
    if (priority) {
      where.priority = priority;
    }

    // Urgency filtering
    if (urgency) {
      where.shipmentUrgency = urgency;
    }

    // Trade lane filtering
    if (tradeLane) {
      where.tradeLane = tradeLane;
    }

    // Assigned to filtering
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    // Created by filtering
    if (createdBy) {
      where.createdBy = createdBy;
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Search filtering
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { rfqNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { originPort: { contains: search, mode: "insensitive" } },
        { destinationPort: { contains: search, mode: "insensitive" } },
        { commodity: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Tag filtering
    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rfqNumber: true,
          title: true,
          description: true,
          originPort: true,
          destinationPort: true,
          commodity: true,
          containerType: true,
          containerQuantity: true,
          cargoWeight: true,
          cargoVolume: true,
          incoterm: true,
          cargoReadyDate: true,
          quoteDeadline: true,
          shipmentUrgency: true,
          specialRequirements: true,
          requiredServices: true,
          preferredCarriers: true,
          status: true,
          sentAt: true,
          closedAt: true,
          totalContactsSent: true,
          totalQuotesReceived: true,
          bestQuoteAmount: true,
          averageQuoteAmount: true,
          responseRate: true,
          tradeLane: true,
          estimatedValue: true,
          currency: true,
          notes: true,
          tags: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          assignedTo: true,
          createdByUser: {
            select: { firstName: true, lastName: true },
          },
          assignedToUser: {
            select: { firstName: true, lastName: true },
          },
          _count: {
            select: {
              recipients: true,
              quotes: true,
            },
          },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return {
      rfqs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get RFQ by ID
   */
  async getRFQById(id: string, companyId: string) {
    const rfq = await prisma.rFQ.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        description: true,
        originPort: true,
        destinationPort: true,
        commodity: true,
        containerType: true,
        containerQuantity: true,
        cargoWeight: true,
        cargoVolume: true,
        incoterm: true,
        cargoReadyDate: true,
        quoteDeadline: true,
        shipmentUrgency: true,
        specialRequirements: true,
        requiredServices: true,
        preferredCarriers: true,
        emailSubject: true,
        emailBody: true,
        status: true,
        sentAt: true,
        closedAt: true,
        totalContactsSent: true,
        totalQuotesReceived: true,
        bestQuoteAmount: true,
        averageQuoteAmount: true,
        responseRate: true,
        tradeLane: true,
        estimatedValue: true,
        currency: true,
        notes: true,
        tags: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        assignedTo: true,
        createdByUser: {
          select: { firstName: true, lastName: true },
        },
        assignedToUser: {
          select: { firstName: true, lastName: true },
        },
        recipients: {
          select: {
            id: true,
            emailSentAt: true,
            emailDeliveredAt: true,
            emailOpenedAt: true,
            hasResponded: true,
            responseReceivedAt: true,
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                jobTitle: true,
              },
            },
            shippingLine: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        quotes: {
          select: {
            id: true,
            totalAmount: true,
            currency: true,
            validityDate: true,
            status: true,
            createdAt: true,
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            recipients: true,
            quotes: true,
          },
        },
      },
    });

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    return rfq;
  }

  /**
   * Create new RFQ
   */
  async createRFQ(companyId: string, createdBy: string, rfqData: any) {
    // Generate RFQ number
    const rfqNumber = await this.generateRFQNumber(companyId);

    const rfq = await prisma.rFQ.create({
      data: {
        companyId,
        rfqNumber,
        title: rfqData.title,
        description: rfqData.description,
        originPort: rfqData.originPort,
        destinationPort: rfqData.destinationPort,
        commodity: rfqData.commodity,
        containerType: rfqData.containerType,
        containerQuantity: rfqData.containerQuantity || 1,
        cargoWeight: rfqData.cargoWeight,
        cargoVolume: rfqData.cargoVolume,
        incoterm: rfqData.incoterm || "FOB",
        cargoReadyDate: rfqData.cargoReadyDate
          ? new Date(rfqData.cargoReadyDate)
          : null,
        quoteDeadline: rfqData.quoteDeadline
          ? new Date(rfqData.quoteDeadline)
          : null,
        shipmentUrgency: rfqData.shipmentUrgency || "NORMAL",
        specialRequirements: rfqData.specialRequirements,
        requiredServices: rfqData.requiredServices || [],
        preferredCarriers: rfqData.preferredCarriers || [],
        emailSubject: rfqData.emailSubject,
        emailBody: rfqData.emailBody,
        tradeLane: rfqData.tradeLane,
        estimatedValue: rfqData.estimatedValue,
        currency: rfqData.currency || "USD",
        notes: rfqData.notes,
        tags: rfqData.tags || [],
        priority: rfqData.priority || "MEDIUM",
        assignedTo: rfqData.assignedTo,
        createdBy,
      },
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        description: true,
        originPort: true,
        destinationPort: true,
        commodity: true,
        containerType: true,
        containerQuantity: true,
        cargoWeight: true,
        cargoVolume: true,
        incoterm: true,
        cargoReadyDate: true,
        quoteDeadline: true,
        shipmentUrgency: true,
        specialRequirements: true,
        requiredServices: true,
        preferredCarriers: true,
        status: true,
        tradeLane: true,
        estimatedValue: true,
        currency: true,
        notes: true,
        tags: true,
        priority: true,
        createdAt: true,
        createdByUser: {
          select: { firstName: true, lastName: true },
        },
        assignedToUser: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return rfq;
  }

  /**
   * Update RFQ
   */
  async updateRFQ(id: string, companyId: string, rfqData: any) {
    const rfq = await prisma.rFQ.update({
      where: { id, companyId },
      data: {
        title: rfqData.title,
        description: rfqData.description,
        originPort: rfqData.originPort,
        destinationPort: rfqData.destinationPort,
        commodity: rfqData.commodity,
        containerType: rfqData.containerType,
        containerQuantity: rfqData.containerQuantity,
        cargoWeight: rfqData.cargoWeight,
        cargoVolume: rfqData.cargoVolume,
        incoterm: rfqData.incoterm,
        cargoReadyDate: rfqData.cargoReadyDate
          ? new Date(rfqData.cargoReadyDate)
          : null,
        quoteDeadline: rfqData.quoteDeadline
          ? new Date(rfqData.quoteDeadline)
          : null,
        shipmentUrgency: rfqData.shipmentUrgency,
        specialRequirements: rfqData.specialRequirements,
        requiredServices: rfqData.requiredServices,
        preferredCarriers: rfqData.preferredCarriers,
        emailSubject: rfqData.emailSubject,
        emailBody: rfqData.emailBody,
        tradeLane: rfqData.tradeLane,
        estimatedValue: rfqData.estimatedValue,
        currency: rfqData.currency,
        notes: rfqData.notes,
        tags: rfqData.tags,
        priority: rfqData.priority,
        assignedTo: rfqData.assignedTo,
      },
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        description: true,
        originPort: true,
        destinationPort: true,
        commodity: true,
        containerType: true,
        containerQuantity: true,
        cargoWeight: true,
        cargoVolume: true,
        incoterm: true,
        cargoReadyDate: true,
        quoteDeadline: true,
        shipmentUrgency: true,
        specialRequirements: true,
        requiredServices: true,
        preferredCarriers: true,
        status: true,
        tradeLane: true,
        estimatedValue: true,
        currency: true,
        notes: true,
        tags: true,
        priority: true,
        updatedAt: true,
        createdByUser: {
          select: { firstName: true, lastName: true },
        },
        assignedToUser: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return rfq;
  }

  /**
   * Delete RFQ
   */
  async deleteRFQ(id: string, companyId: string) {
    // Check if RFQ has associated recipients or quotes
    const rfq = await prisma.rFQ.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            recipients: true,
            quotes: true,
          },
        },
      },
    });

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq._count.recipients > 0 || rfq._count.quotes > 0) {
      throw new ValidationError(
        "Cannot delete RFQ with associated recipients or quotes"
      );
    }

    await prisma.rFQ.delete({
      where: { id, companyId },
    });

    return true;
  }

  /**
   * Update RFQ status
   */
  async updateRFQStatus(id: string, companyId: string, status: string) {
    // First get the current RFQ to check existing dates
    const currentRFQ = await prisma.rFQ.findFirst({
      where: { id, companyId },
      select: { sentAt: true, closedAt: true },
    });

    if (!currentRFQ) {
      throw new Error("RFQ not found");
    }

    const updateData: any = { status };

    if (status === "SENT" && !currentRFQ.sentAt) {
      updateData.sentAt = new Date();
    } else if (status === "CLOSED" && !currentRFQ.closedAt) {
      updateData.closedAt = new Date();
    }

    const rfq = await prisma.rFQ.update({
      where: { id, companyId },
      data: updateData,
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        sentAt: true,
        closedAt: true,
      },
    });

    return rfq;
  }

  /**
   * Send RFQ to contacts
   */
  async sendRFQ(
    id: string,
    companyId: string,
    contactIds: string[],
    emailSubject?: string,
    emailBody?: string
  ) {
    const rfq = await prisma.rFQ.findFirst({
      where: { id, companyId },
    });

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    if (rfq.status !== "DRAFT") {
      throw new ValidationError("Only draft RFQs can be sent");
    }

    // Get contacts and their shipping lines
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        companyId,
        isActive: true,
        doNotContact: false,
      },
      include: {
        shippingLine: true,
      },
    });

    if (contacts.length === 0) {
      throw new ValidationError("No valid contacts found");
    }

    // Create RFQ recipients
    const recipients = await Promise.all(
      contacts.map((contact) =>
        prisma.rFQRecipient.create({
          data: {
            rfqId: id,
            contactId: contact.id,
            shippingLineId: contact.shippingLineId,
            emailSentAt: new Date(),
          },
        })
      )
    );

    // Update RFQ status and counts
    const updatedRFQ = await prisma.rFQ.update({
      where: { id, companyId },
      data: {
        status: "SENT",
        sentAt: new Date(),
        totalContactsSent: recipients.length,
        emailSubject: emailSubject || rfq.emailSubject,
        emailBody: emailBody || rfq.emailBody,
      },
    });

    // Schedule follow-ups if company has auto follow-up enabled
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { autoFollowUpEnabled: true },
    });

    let followUpResult = null;
    if (company?.autoFollowUpEnabled) {
      try {
        followUpResult = await this.followUpService.scheduleFollowUpsForRFQ(
          id,
          companyId,
          contactIds
        );
      } catch (error) {
        console.error("Failed to schedule follow-ups:", error);
        // Don't fail the RFQ send if follow-up scheduling fails
      }
    }

    return {
      rfq: updatedRFQ,
      recipients: recipients.length,
      contacts: contacts.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        shippingLine: c.shippingLine.name,
      })),
      followUpsScheduled: followUpResult?.scheduled || 0,
    };
  }

  /**
   * Close RFQ
   */
  async closeRFQ(id: string, companyId: string) {
    const rfq = await prisma.rFQ.update({
      where: { id, companyId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        closedAt: true,
      },
    });

    return rfq;
  }

  /**
   * Award RFQ
   */
  async awardRFQ(
    id: string,
    companyId: string,
    winningQuoteId: string,
    notes?: string
  ) {
    // Verify the quote belongs to this RFQ
    const quote = await prisma.quote.findFirst({
      where: {
        id: winningQuoteId,
        rfqId: id,
      },
    });

    if (!quote) {
      throw new ValidationError("Quote not found for this RFQ");
    }

    // Get current RFQ to access existing notes
    const currentRFQ = await prisma.rFQ.findFirst({
      where: { id, companyId },
      select: { notes: true },
    });

    const rfq = await prisma.rFQ.update({
      where: { id, companyId },
      data: {
        status: "AWARDED",
        closedAt: new Date(),
        notes: notes
          ? `${currentRFQ?.notes || ""}\nAwarded to: ${winningQuoteId}`
          : currentRFQ?.notes,
      },
      select: {
        id: true,
        rfqNumber: true,
        title: true,
        status: true,
        closedAt: true,
      },
    });

    return rfq;
  }

  /**
   * Get RFQ recipients
   */
  async getRFQRecipients(id: string, companyId: string) {
    const recipients = await prisma.rFQRecipient.findMany({
      where: {
        rfqId: id,
        rfq: { companyId },
      },
      select: {
        id: true,
        emailSentAt: true,
        emailDeliveredAt: true,
        emailOpenedAt: true,
        emailClickedAt: true,
        hasResponded: true,
        responseReceivedAt: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            phone: true,
          },
        },
        shippingLine: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return recipients;
  }

  /**
   * Get RFQ quotes
   */
  async getRFQQuotes(id: string, companyId: string) {
    const quotes = await prisma.quote.findMany({
      where: {
        rfqId: id,
        rfq: { companyId },
      },
      select: {
        id: true,
        totalAmount: true,
        currency: true,
        validityDate: true,
        status: true,
        notes: true,
        createdAt: true,
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
          },
        },
        shippingLine: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { totalAmount: "asc" },
    });

    return quotes;
  }

  /**
   * Get RFQ analytics
   */
  async getRFQAnalytics(companyId: string, options: any) {
    const { period, dateFrom, dateTo } = options;

    let dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.lte = new Date(dateTo);
    } else if (period) {
      const now = new Date();
      const startDate = new Date();
      switch (period) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      dateFilter.createdAt = { gte: startDate };
    }

    const where = { companyId, ...dateFilter };

    const [
      totalRFQs,
      draftRFQs,
      sentRFQs,
      closedRFQs,
      awardedRFQs,
      avgResponseRate,
      avgQuotesPerRFQ,
      topTradeLanes,
    ] = await Promise.all([
      prisma.rFQ.count({ where }),
      prisma.rFQ.count({ where: { ...where, status: "DRAFT" } }),
      prisma.rFQ.count({ where: { ...where, status: "SENT" } }),
      prisma.rFQ.count({ where: { ...where, status: "CLOSED" } }),
      prisma.rFQ.count({ where: { ...where, status: "AWARDED" } }),
      prisma.rFQ.aggregate({
        where: { ...where, responseRate: { not: null } },
        _avg: { responseRate: true },
      }),
      prisma.rFQ.aggregate({
        where: { ...where, totalQuotesReceived: { gt: 0 } },
        _avg: { totalQuotesReceived: true },
      }),
      prisma.rFQ.groupBy({
        by: ["tradeLane"],
        where: { ...where, tradeLane: { not: null } },
        _count: { tradeLane: true },
        orderBy: { _count: { tradeLane: "desc" } },
        take: 10,
      }),
    ]);

    return {
      totalRFQs,
      draftRFQs,
      sentRFQs,
      closedRFQs,
      awardedRFQs,
      avgResponseRate: avgResponseRate._avg.responseRate || 0,
      avgQuotesPerRFQ: avgQuotesPerRFQ._avg.totalQuotesReceived || 0,
      topTradeLanes: topTradeLanes.map((lane) => ({
        tradeLane: lane.tradeLane,
        count: lane._count.tradeLane,
      })),
    };
  }

  /**
   * Get trade lanes
   */
  async getTradeLanes(companyId: string) {
    const rfqs = await prisma.rFQ.findMany({
      where: { companyId, tradeLane: { not: null } },
      select: { tradeLane: true },
      distinct: ["tradeLane"],
    });

    return rfqs
      .map((rfq) => rfq.tradeLane)
      .filter((lane) => lane)
      .sort();
  }

  /**
   * Get tags
   */
  async getTags(companyId: string) {
    const rfqs = await prisma.rFQ.findMany({
      where: { companyId },
      select: { tags: true },
    });

    const tags = new Set<string>();
    rfqs.forEach((rfq) => {
      rfq.tags.forEach((tag) => tags.add(tag));
    });

    return Array.from(tags).sort();
  }

  /**
   * Duplicate RFQ
   */
  async duplicateRFQ(id: string, companyId: string, createdBy: string) {
    const originalRFQ = await prisma.rFQ.findFirst({
      where: { id, companyId },
    });

    if (!originalRFQ) {
      throw new Error("RFQ not found");
    }

    const rfqNumber = await this.generateRFQNumber(companyId);

    const duplicatedRFQ = await prisma.rFQ.create({
      data: {
        companyId,
        rfqNumber,
        title: `${originalRFQ.title} (Copy)`,
        description: originalRFQ.description,
        originPort: originalRFQ.originPort,
        destinationPort: originalRFQ.destinationPort,
        commodity: originalRFQ.commodity,
        containerType: originalRFQ.containerType,
        containerQuantity: originalRFQ.containerQuantity,
        cargoWeight: originalRFQ.cargoWeight,
        cargoVolume: originalRFQ.cargoVolume,
        incoterm: originalRFQ.incoterm,
        cargoReadyDate: originalRFQ.cargoReadyDate,
        quoteDeadline: originalRFQ.quoteDeadline,
        shipmentUrgency: originalRFQ.shipmentUrgency,
        specialRequirements: originalRFQ.specialRequirements,
        requiredServices: originalRFQ.requiredServices,
        preferredCarriers: originalRFQ.preferredCarriers,
        tradeLane: originalRFQ.tradeLane,
        estimatedValue: originalRFQ.estimatedValue,
        currency: originalRFQ.currency,
        notes: originalRFQ.notes,
        tags: originalRFQ.tags,
        priority: originalRFQ.priority,
        status: "DRAFT",
        createdBy,
      },
    });

    return duplicatedRFQ;
  }

  /**
   * Get RFQ templates
   */
  async getRFQTemplates(companyId: string) {
    const templates = await prisma.rFQTemplate.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        description: true,
        originPort: true,
        destinationPort: true,
        commodity: true,
        containerType: true,
        containerQuantity: true,
        cargoWeight: true,
        cargoVolume: true,
        incoterm: true,
        specialRequirements: true,
        requiredServices: true,
        isDefault: true,
        createdAt: true,
        createdBy: true,
        creator: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return templates;
  }

  /**
   * Create RFQ template
   */
  async createRFQTemplate(
    companyId: string,
    createdBy: string,
    templateData: any
  ) {
    const template = await prisma.rFQTemplate.create({
      data: {
        companyId,
        name: templateData.name,
        description: templateData.description,
        subjectTemplate: templateData.subjectTemplate,
        bodyTemplate: templateData.bodyTemplate,
        originPort: templateData.originPort,
        destinationPort: templateData.destinationPort,
        commodity: templateData.commodity,
        containerType: templateData.containerType,
        containerQuantity: templateData.containerQuantity,
        cargoWeight: templateData.cargoWeight,
        cargoVolume: templateData.cargoVolume,
        incoterm: templateData.incoterm,
        specialRequirements: templateData.specialRequirements,
        requiredServices: templateData.requiredServices || [],
        isDefault: templateData.isDefault || false,
        createdBy,
      },
    });

    return template;
  }

  /**
   * Generate unique RFQ number
   */
  private async generateRFQNumber(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `RFQ-${year}`;

    const lastRFQ = await prisma.rFQ.findFirst({
      where: {
        companyId,
        rfqNumber: { startsWith: prefix },
      },
      orderBy: { rfqNumber: "desc" },
    });

    let sequence = 1;
    if (lastRFQ) {
      const lastSequence = parseInt(lastRFQ.rfqNumber.split("-").pop() || "0");
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, "0")}`;
  }
}
