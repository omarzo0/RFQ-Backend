import { prisma } from "../../app";
import { ValidationError } from "../../utils/errors";

export class QuoteService {
  /**
   * Get quotes with pagination and filtering
   */
  async getQuotes(
    companyId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      rfqId?: string;
      contactId?: string;
      shippingLineId?: string;
      status?: string;
      isWinner?: boolean;
      isAwarded?: boolean;
      isExpired?: boolean;
      isVerified?: boolean;
      source?: string;
      currency?: string;
      marketPosition?: string;
      tags?: string[];
      dateFrom?: string;
      dateTo?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ) {
    const {
      page,
      limit,
      search,
      rfqId,
      contactId,
      shippingLineId,
      status,
      isWinner,
      isAwarded,
      isExpired,
      isVerified,
      source,
      currency,
      marketPosition,
      tags,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      rfq: { companyId },
    };

    // Apply filters
    if (rfqId) where.rfqId = rfqId;
    if (contactId) where.contactId = contactId;
    if (shippingLineId) where.shippingLineId = shippingLineId;
    if (status) where.status = status;
    if (isWinner !== undefined) where.isWinner = isWinner;
    if (isAwarded !== undefined) where.isAwarded = isAwarded;
    if (isExpired !== undefined) where.isExpired = isExpired;
    if (isVerified !== undefined) where.isVerified = isVerified;
    if (source) where.source = source;
    if (currency) where.currency = currency;
    if (marketPosition) where.marketPosition = marketPosition;

    // Date filtering
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Search filtering
    if (search) {
      where.OR = [
        { quoteReference: { contains: search, mode: "insensitive" } },
        { quoteNumber: { contains: search, mode: "insensitive" } },
        { specialNotes: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Tag filtering
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Sort options
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          rfq: {
            select: {
              id: true,
              rfqNumber: true,
              title: true,
              originPort: true,
              destinationPort: true,
            },
          },
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
              code: true,
            },
          },
          creator: {
            select: { firstName: true, lastName: true },
          },
          awarder: {
            select: { firstName: true, lastName: true },
          },
          verifier: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.quote.count({ where }),
    ]);

    return {
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get quote by ID
   */
  async getQuoteById(id: string, companyId: string) {
    const quote = await prisma.quote.findFirst({
      where: {
        id,
        rfq: { companyId },
      },
      include: {
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
            originPort: true,
            destinationPort: true,
            commodity: true,
            containerType: true,
            containerQuantity: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            jobTitle: true,
            department: true,
          },
        },
        shippingLine: {
          select: {
            id: true,
            name: true,
            code: true,
            scacCode: true,
            website: true,
          },
        },
        creator: {
          select: { firstName: true, lastName: true },
        },
        awarder: {
          select: { firstName: true, lastName: true },
        },
        verifier: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!quote) {
      throw new Error("Quote not found");
    }

    return quote;
  }

  /**
   * Create new quote
   */
  async createQuote(companyId: string, createdBy: string, quoteData: any) {
    // Verify RFQ belongs to company
    const rfq = await prisma.rFQ.findFirst({
      where: { id: quoteData.rfqId, companyId },
    });

    if (!rfq) {
      throw new ValidationError("RFQ not found");
    }

    // Verify shipping line exists
    if (quoteData.shippingLineId) {
      const shippingLine = await prisma.shippingLine.findFirst({
        where: { id: quoteData.shippingLineId, companyId },
      });

      if (!shippingLine) {
        throw new ValidationError("Shipping line not found");
      }
    }

    // Verify contact exists
    if (quoteData.contactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: quoteData.contactId, companyId },
      });

      if (!contact) {
        throw new ValidationError("Contact not found");
      }
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId: quoteData.rfqId,
        contactId: quoteData.contactId,
        shippingLineId: quoteData.shippingLineId,
        quoteReference: quoteData.quoteReference,
        quoteNumber: quoteData.quoteNumber,
        oceanFreight: quoteData.oceanFreight,
        currency: quoteData.currency || "USD",
        baf: quoteData.baf,
        caf: quoteData.caf,
        securityFee: quoteData.securityFee,
        documentationFee: quoteData.documentationFee,
        handlingCharges: quoteData.handlingCharges,
        otherCharges: quoteData.otherCharges,
        totalAmount: quoteData.totalAmount,
        validityDate: new Date(quoteData.validityDate),
        paymentTerms: quoteData.paymentTerms,
        transitTime: quoteData.transitTime,
        freeTimeAtOrigin: quoteData.freeTimeAtOrigin,
        freeTimeAtDestination: quoteData.freeTimeAtDestination,
        termsAndConditions: quoteData.termsAndConditions,
        specialNotes: quoteData.specialNotes,
        source: quoteData.source || "MANUAL",
        receivedDate: quoteData.receivedDate
          ? new Date(quoteData.receivedDate)
          : new Date(),
        responseTime: quoteData.responseTime,
        tags: quoteData.tags || [],
        notes: quoteData.notes,
        attachments: quoteData.attachments || [],
        createdBy,
      },
      include: {
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shippingLine: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        creator: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return quote;
  }

  /**
   * Update quote
   */
  async updateQuote(id: string, companyId: string, quoteData: any) {
    const quote = await prisma.quote.update({
      where: {
        id,
        rfq: { companyId },
      },
      data: {
        quoteReference: quoteData.quoteReference,
        quoteNumber: quoteData.quoteNumber,
        oceanFreight: quoteData.oceanFreight,
        currency: quoteData.currency,
        baf: quoteData.baf,
        caf: quoteData.caf,
        securityFee: quoteData.securityFee,
        documentationFee: quoteData.documentationFee,
        handlingCharges: quoteData.handlingCharges,
        otherCharges: quoteData.otherCharges,
        totalAmount: quoteData.totalAmount,
        validityDate: quoteData.validityDate
          ? new Date(quoteData.validityDate)
          : undefined,
        paymentTerms: quoteData.paymentTerms,
        transitTime: quoteData.transitTime,
        freeTimeAtOrigin: quoteData.freeTimeAtOrigin,
        freeTimeAtDestination: quoteData.freeTimeAtDestination,
        termsAndConditions: quoteData.termsAndConditions,
        specialNotes: quoteData.specialNotes,
        source: quoteData.source,
        receivedDate: quoteData.receivedDate
          ? new Date(quoteData.receivedDate)
          : undefined,
        responseTime: quoteData.responseTime,
        tags: quoteData.tags,
        notes: quoteData.notes,
        attachments: quoteData.attachments,
        serviceQuality: quoteData.serviceQuality,
        reliability: quoteData.reliability,
        communicationScore: quoteData.communicationScore,
        overallScore: quoteData.overallScore,
        marketPosition: quoteData.marketPosition,
        priceCompetitiveness: quoteData.priceCompetitiveness,
      },
      include: {
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shippingLine: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        creator: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return quote;
  }

  /**
   * Delete quote
   */
  async deleteQuote(id: string, companyId: string) {
    await prisma.quote.delete({
      where: {
        id,
        rfq: { companyId },
      },
    });

    return true;
  }

  /**
   * Get quotes by RFQ
   */
  async getQuotesByRFQ(rfqId: string, companyId: string) {
    const quotes = await prisma.quote.findMany({
      where: {
        rfqId,
        rfq: { companyId },
      },
      include: {
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
            code: true,
          },
        },
        creator: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { totalAmount: "asc" },
    });

    return quotes;
  }

  /**
   * Compare quotes for an RFQ
   */
  async compareQuotes(rfqId: string, companyId: string) {
    const quotes = await this.getQuotesByRFQ(rfqId, companyId);

    if (quotes.length === 0) {
      return {
        quotes: [],
        comparison: {
          totalQuotes: 0,
          bestPrice: null,
          averagePrice: null,
          priceRange: null,
          marketPosition: {},
        },
      };
    }

    const prices = quotes.map((q) => Number(q.totalAmount));
    const bestPrice = Math.min(...prices);
    const worstPrice = Math.max(...prices);
    const averagePrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Calculate market position for each quote
    const comparison = quotes.map((quote) => {
      const price = Number(quote.totalAmount);
      let marketPosition = "competitive";

      if (price <= bestPrice * 1.05) {
        marketPosition = "best";
      } else if (price >= averagePrice * 1.2) {
        marketPosition = "expensive";
      }

      return {
        ...quote,
        marketPosition,
        priceDifference: price - bestPrice,
        priceDifferencePercent: ((price - bestPrice) / bestPrice) * 100,
      };
    });

    // Update quotes with market position
    for (const quote of comparison) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          marketPosition: quote.marketPosition,
          priceCompetitiveness:
            quote.marketPosition === "best"
              ? 1.0
              : quote.marketPosition === "competitive"
              ? 0.7
              : 0.3,
        },
      });
    }

    return {
      quotes: comparison,
      comparison: {
        totalQuotes: quotes.length,
        bestPrice,
        worstPrice,
        averagePrice,
        priceRange: worstPrice - bestPrice,
        marketPosition: {
          best: comparison.filter((q) => q.marketPosition === "best").length,
          competitive: comparison.filter(
            (q) => q.marketPosition === "competitive"
          ).length,
          expensive: comparison.filter((q) => q.marketPosition === "expensive")
            .length,
        },
      },
    };
  }

  /**
   * Award quote
   */
  async awardQuote(
    id: string,
    companyId: string,
    awardedBy: string,
    notes?: string
  ) {
    // First, unset all other winners for this RFQ
    const quote = await prisma.quote.findFirst({
      where: {
        id,
        rfq: { companyId },
      },
      include: { rfq: true },
    });

    if (!quote) {
      throw new Error("Quote not found");
    }

    await prisma.quote.updateMany({
      where: {
        rfqId: quote.rfqId,
        rfq: { companyId },
      },
      data: {
        isWinner: false,
        isAwarded: false,
      },
    });

    // Award the selected quote
    const awardedQuote = await prisma.quote.update({
      where: { id },
      data: {
        isWinner: true,
        isAwarded: true,
        awardedDate: new Date(),
        awardedBy,
        notes: notes ? `${quote.notes || ""}\nAwarded: ${notes}` : quote.notes,
      },
      include: {
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shippingLine: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        awarder: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return awardedQuote;
  }

  /**
   * Reject quote
   */
  async rejectQuote(id: string, companyId: string, reason: string) {
    // First get the current quote to access its notes
    const currentQuote = await prisma.quote.findFirst({
      where: {
        id,
        rfq: { companyId },
      },
    });

    if (!currentQuote) {
      throw new ValidationError("Quote not found");
    }

    const quote = await prisma.quote.update({
      where: {
        id,
        rfq: { companyId },
      },
      data: {
        status: "WITHDRAWN", // Using WITHDRAWN as closest equivalent to rejected
        rejectionReason: reason,
        notes: `${currentQuote.notes || ""}\nRejected: ${reason}`,
      },
      include: {
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shippingLine: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return quote;
  }

  /**
   * Verify quote
   */
  async verifyQuote(id: string, companyId: string, verifiedBy: string) {
    const quote = await prisma.quote.update({
      where: {
        id,
        rfq: { companyId },
      },
      data: {
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date(),
      },
      include: {
        rfq: {
          select: {
            id: true,
            rfqNumber: true,
            title: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        shippingLine: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        verifier: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return quote;
  }

  /**
   * Update quote status
   */
  async updateQuoteStatus(id: string, companyId: string, status: string) {
    const quote = await prisma.quote.update({
      where: {
        id,
        rfq: { companyId },
      },
      data: { status: status as any },
      select: {
        id: true,
        status: true,
        quoteReference: true,
      },
    });

    return quote;
  }

  /**
   * Get quote analytics
   */
  async getQuoteAnalytics(companyId: string, options: any) {
    const { period, dateFrom, dateTo, rfqId } = options;

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

    const where = {
      rfq: { companyId },
      ...dateFilter,
    };

    if (rfqId) {
      where.rfqId = rfqId;
    }

    const [
      totalQuotes,
      activeQuotes,
      awardedQuotes,
      expiredQuotes,
      verifiedQuotes,
      avgResponseTime,
      avgQuoteAmount,
      quoteSources,
      statusDistribution,
    ] = await Promise.all([
      prisma.quote.count({ where }),
      prisma.quote.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.quote.count({ where: { ...where, isAwarded: true } }),
      prisma.quote.count({ where: { ...where, isExpired: true } }),
      prisma.quote.count({ where: { ...where, isVerified: true } }),
      prisma.quote.aggregate({
        where: { ...where, responseTime: { not: null } },
        _avg: { responseTime: true },
      }),
      prisma.quote.aggregate({
        where,
        _avg: { totalAmount: true },
      }),
      prisma.quote.groupBy({
        by: ["source"],
        where,
        _count: { source: true },
        orderBy: { _count: { source: "desc" } },
      }),
      prisma.quote.groupBy({
        by: ["status"],
        where,
        _count: { status: true },
        orderBy: { _count: { status: "desc" } },
      }),
    ]);

    return {
      totalQuotes,
      activeQuotes,
      awardedQuotes,
      expiredQuotes,
      verifiedQuotes,
      avgResponseTime: avgResponseTime._avg.responseTime || 0,
      avgQuoteAmount: avgQuoteAmount._avg.totalAmount || 0,
      quoteSources: quoteSources.map((source) => ({
        source: source.source,
        count: source._count.source,
      })),
      statusDistribution: statusDistribution.map((status) => ({
        status: status.status,
        count: status._count.status,
      })),
    };
  }

  /**
   * Get price analysis
   */
  async getPriceAnalysis(companyId: string, options: any) {
    const { rfqId, period, dateFrom, dateTo } = options;

    let where: any = { rfq: { companyId } };

    if (rfqId) {
      where.rfqId = rfqId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const quotes = await prisma.quote.findMany({
      where,
      select: {
        id: true,
        totalAmount: true,
        currency: true,
        marketPosition: true,
        priceCompetitiveness: true,
        rfq: {
          select: {
            originPort: true,
            destinationPort: true,
            commodity: true,
            containerType: true,
          },
        },
        shippingLine: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (quotes.length === 0) {
      return {
        totalQuotes: 0,
        priceRange: null,
        averagePrice: null,
        bestPrice: null,
        marketDistribution: {},
        carrierPricing: [],
        routeAnalysis: [],
      };
    }

    const prices = quotes.map((q) => Number(q.totalAmount));
    const bestPrice = Math.min(...prices);
    const worstPrice = Math.max(...prices);
    const averagePrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Market position distribution
    const marketDistribution = quotes.reduce((acc, quote) => {
      const position = quote.marketPosition || "competitive";
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Carrier pricing analysis
    const carrierPricing = quotes.reduce((acc, quote) => {
      const carrierName = quote.shippingLine.name;
      if (!acc[carrierName]) {
        acc[carrierName] = {
          carrier: carrierName,
          quotes: 0,
          totalAmount: 0,
          averageAmount: 0,
          bestPrice: Number.MAX_VALUE,
        };
      }
      acc[carrierName].quotes++;
      acc[carrierName].totalAmount += Number(quote.totalAmount);
      acc[carrierName].bestPrice = Math.min(
        acc[carrierName].bestPrice,
        Number(quote.totalAmount)
      );
      return acc;
    }, {} as Record<string, any>);

    Object.values(carrierPricing).forEach((carrier: any) => {
      carrier.averageAmount = carrier.totalAmount / carrier.quotes;
    });

    // Route analysis
    const routeAnalysis = quotes.reduce((acc, quote) => {
      const route = `${quote.rfq.originPort} - ${quote.rfq.destinationPort}`;
      if (!acc[route]) {
        acc[route] = {
          route,
          quotes: 0,
          averagePrice: 0,
          totalAmount: 0,
        };
      }
      acc[route].quotes++;
      acc[route].totalAmount += Number(quote.totalAmount);
      return acc;
    }, {} as Record<string, any>);

    Object.values(routeAnalysis).forEach((route: any) => {
      route.averagePrice = route.totalAmount / route.quotes;
    });

    return {
      totalQuotes: quotes.length,
      priceRange: {
        min: bestPrice,
        max: worstPrice,
        range: worstPrice - bestPrice,
      },
      averagePrice,
      bestPrice,
      marketDistribution,
      carrierPricing: Object.values(carrierPricing),
      routeAnalysis: Object.values(routeAnalysis),
    };
  }

  /**
   * Get carrier performance
   */
  async getCarrierPerformance(companyId: string, options: any) {
    const { period, dateFrom, dateTo } = options;

    let where: any = { rfq: { companyId } };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        shippingLine: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const carrierStats = quotes.reduce((acc, quote) => {
      const carrierId = quote.shippingLineId;
      const carrierName = quote.shippingLine.name;

      if (!acc[carrierId]) {
        acc[carrierId] = {
          carrierId,
          carrierName,
          totalQuotes: 0,
          awardedQuotes: 0,
          totalAmount: 0,
          averageAmount: 0,
          winRate: 0,
          averageResponseTime: 0,
          responseTimes: [],
          serviceQuality: [],
          reliability: [],
        };
      }

      acc[carrierId].totalQuotes++;
      acc[carrierId].totalAmount += Number(quote.totalAmount);

      if (quote.isAwarded) {
        acc[carrierId].awardedQuotes++;
      }

      if (quote.responseTime) {
        acc[carrierId].responseTimes.push(quote.responseTime);
      }

      if (quote.serviceQuality) {
        acc[carrierId].serviceQuality.push(quote.serviceQuality);
      }

      if (quote.reliability) {
        acc[carrierId].reliability.push(quote.reliability);
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate averages and rates
    Object.values(carrierStats).forEach((carrier: any) => {
      carrier.averageAmount = carrier.totalAmount / carrier.totalQuotes;
      carrier.winRate = (carrier.awardedQuotes / carrier.totalQuotes) * 100;
      carrier.averageResponseTime =
        carrier.responseTimes.length > 0
          ? carrier.responseTimes.reduce(
              (sum: number, time: number) => sum + time,
              0
            ) / carrier.responseTimes.length
          : 0;
      carrier.averageServiceQuality =
        carrier.serviceQuality.length > 0
          ? carrier.serviceQuality.reduce(
              (sum: number, quality: number) => sum + quality,
              0
            ) / carrier.serviceQuality.length
          : 0;
      carrier.averageReliability =
        carrier.reliability.length > 0
          ? carrier.reliability.reduce(
              (sum: number, rel: number) => sum + rel,
              0
            ) / carrier.reliability.length
          : 0;
    });

    return Object.values(carrierStats);
  }

  /**
   * Get market trends
   */
  async getMarketTrends(companyId: string, options: any) {
    const { period, dateFrom, dateTo, route } = options;

    let where: any = { rfq: { companyId } };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (route) {
      where.OR = [
        { rfq: { originPort: { contains: route, mode: "insensitive" } } },
        { rfq: { destinationPort: { contains: route, mode: "insensitive" } } },
      ];
    }

    const quotes = await prisma.quote.findMany({
      where,
      select: {
        totalAmount: true,
        currency: true,
        createdAt: true,
        rfq: {
          select: {
            originPort: true,
            destinationPort: true,
            commodity: true,
            containerType: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by month for trend analysis
    const monthlyTrends = quotes.reduce((acc, quote) => {
      const month = quote.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          month,
          quotes: 0,
          totalAmount: 0,
          averageAmount: 0,
        };
      }
      acc[month].quotes++;
      acc[month].totalAmount += Number(quote.totalAmount);
      return acc;
    }, {} as Record<string, any>);

    Object.values(monthlyTrends).forEach((month: any) => {
      month.averageAmount = month.totalAmount / month.quotes;
    });

    return {
      trends: Object.values(monthlyTrends),
      totalQuotes: quotes.length,
      averagePrice:
        quotes.length > 0
          ? quotes.reduce((sum, q) => sum + Number(q.totalAmount), 0) /
            quotes.length
          : 0,
    };
  }

  /**
   * Get historical comparison
   */
  async getHistoricalComparison(companyId: string, options: any) {
    const { rfqId, period } = options;

    const currentRFQ = await prisma.rFQ.findFirst({
      where: { id: rfqId, companyId },
      select: {
        originPort: true,
        destinationPort: true,
        commodity: true,
        containerType: true,
      },
    });

    if (!currentRFQ) {
      throw new Error("RFQ not found");
    }

    // Find similar historical RFQs
    const historicalRFQs = await prisma.rFQ.findMany({
      where: {
        companyId,
        originPort: currentRFQ.originPort,
        destinationPort: currentRFQ.destinationPort,
        commodity: currentRFQ.commodity,
        containerType: currentRFQ.containerType,
        id: { not: rfqId },
      },
      include: {
        quotes: {
          select: {
            totalAmount: true,
            currency: true,
            createdAt: true,
            isAwarded: true,
          },
        },
      },
    });

    const historicalPrices = historicalRFQs.flatMap((rfq) =>
      rfq.quotes.map((quote) => ({
        amount: Number(quote.totalAmount),
        date: quote.createdAt,
        isAwarded: quote.isAwarded,
      }))
    );

    const currentQuotes = await prisma.quote.findMany({
      where: { rfqId },
      select: {
        totalAmount: true,
        isAwarded: true,
      },
    });

    const currentPrices = currentQuotes.map((quote) => ({
      amount: Number(quote.totalAmount),
      isAwarded: quote.isAwarded,
    }));

    const historicalAverage =
      historicalPrices.length > 0
        ? historicalPrices.reduce((sum, q) => sum + q.amount, 0) /
          historicalPrices.length
        : 0;

    const currentAverage =
      currentPrices.length > 0
        ? currentPrices.reduce((sum, q) => sum + q.amount, 0) /
          currentPrices.length
        : 0;

    const priceChange =
      historicalAverage > 0
        ? ((currentAverage - historicalAverage) / historicalAverage) * 100
        : 0;

    return {
      current: {
        averagePrice: currentAverage,
        bestPrice:
          currentPrices.length > 0
            ? Math.min(...currentPrices.map((p) => p.amount))
            : 0,
        totalQuotes: currentPrices.length,
      },
      historical: {
        averagePrice: historicalAverage,
        bestPrice:
          historicalPrices.length > 0
            ? Math.min(...historicalPrices.map((p) => p.amount))
            : 0,
        totalQuotes: historicalPrices.length,
        priceChange,
        trend:
          priceChange > 5
            ? "increasing"
            : priceChange < -5
            ? "decreasing"
            : "stable",
      },
    };
  }

  /**
   * Get rate optimization suggestions
   */
  async getRateOptimization(companyId: string, options: any) {
    const { rfqId, route } = options;

    let where: any = { rfq: { companyId } };

    if (rfqId) {
      where.rfqId = rfqId;
    }

    if (route) {
      where.OR = [
        { rfq: { originPort: { contains: route, mode: "insensitive" } } },
        { rfq: { destinationPort: { contains: route, mode: "insensitive" } } },
      ];
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        shippingLine: {
          select: {
            name: true,
            reliability: true,
            serviceQuality: true,
          },
        },
        rfq: {
          select: {
            originPort: true,
            destinationPort: true,
            commodity: true,
            containerType: true,
          },
        },
      },
    });

    if (quotes.length === 0) {
      return {
        suggestions: [],
        opportunities: [],
        recommendations: [],
      };
    }

    const prices = quotes.map((q) => Number(q.totalAmount));
    const bestPrice = Math.min(...prices);
    const averagePrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;

    const suggestions = quotes.map((quote) => {
      const price = Number(quote.totalAmount);
      const savings = price - bestPrice;
      const savingsPercent = ((price - bestPrice) / price) * 100;

      return {
        quoteId: quote.id,
        shippingLine: quote.shippingLine.name,
        currentPrice: price,
        potentialSavings: savings,
        savingsPercent,
        recommendation:
          savingsPercent > 10 ? "high" : savingsPercent > 5 ? "medium" : "low",
      };
    });

    const opportunities = suggestions.filter((s) => s.savingsPercent > 5);
    const recommendations = suggestions
      .sort((a, b) => b.savingsPercent - a.savingsPercent)
      .slice(0, 3);

    return {
      suggestions,
      opportunities,
      recommendations,
      summary: {
        totalQuotes: quotes.length,
        bestPrice,
        averagePrice,
        potentialSavings: opportunities.reduce(
          (sum, opp) => sum + opp.potentialSavings,
          0
        ),
      },
    };
  }

  /**
   * Get quote tags
   */
  async getQuoteTags(companyId: string) {
    const quotes = await prisma.quote.findMany({
      where: { rfq: { companyId } },
      select: { tags: true },
    });

    const tags = new Set<string>();
    quotes.forEach((quote) => {
      quote.tags.forEach((tag) => tags.add(tag));
    });

    return Array.from(tags).sort();
  }

  /**
   * Get quote currencies
   */
  async getQuoteCurrencies(companyId: string) {
    const quotes = await prisma.quote.findMany({
      where: { rfq: { companyId } },
      select: { currency: true },
      distinct: ["currency"],
    });

    return quotes.map((q) => q.currency).sort();
  }

  /**
   * Bulk import quotes
   */
  async bulkImportQuotes(companyId: string, createdBy: string, quotes: any[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const quoteData of quotes) {
      try {
        await this.createQuote(companyId, createdBy, quoteData);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `Quote "${quoteData.quoteReference}": ${error.message}`
        );
      }
    }

    return results;
  }

  /**
   * Duplicate quote
   */
  async duplicateQuote(
    id: string,
    companyId: string,
    createdBy: string,
    options: { rfqId?: string; contactId?: string }
  ) {
    const originalQuote = await prisma.quote.findFirst({
      where: {
        id,
        rfq: { companyId },
      },
    });

    if (!originalQuote) {
      throw new Error("Quote not found");
    }

    // Use provided rfqId or fall back to original quote's rfqId
    const rfqId = options.rfqId || originalQuote.rfqId;

    // Use provided contactId or fall back to original quote's contactId
    const contactId = options.contactId || originalQuote.contactId;

    // Validate that rfqId exists and belongs to the company
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id: rfqId,
        companyId,
      },
    });

    if (!rfq) {
      throw new Error("RFQ not found or does not belong to company");
    }

    // Validate that contactId exists and belongs to the company
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        companyId,
      },
    });

    if (!contact) {
      throw new Error("Contact not found or does not belong to company");
    }

    const duplicatedQuote = await prisma.quote.create({
      data: {
        rfqId: rfqId,
        contactId: contactId,
        shippingLineId: originalQuote.shippingLineId,
        quoteReference: `${originalQuote.quoteReference} (Copy)`,
        quoteNumber: `${originalQuote.quoteNumber} (Copy)`,
        oceanFreight: originalQuote.oceanFreight,
        currency: originalQuote.currency,
        baf: originalQuote.baf,
        caf: originalQuote.caf,
        securityFee: originalQuote.securityFee,
        documentationFee: originalQuote.documentationFee,
        handlingCharges: originalQuote.handlingCharges,
        otherCharges: originalQuote.otherCharges as any,
        totalAmount: originalQuote.totalAmount,
        validityDate: originalQuote.validityDate,
        paymentTerms: originalQuote.paymentTerms,
        transitTime: originalQuote.transitTime,
        freeTimeAtOrigin: originalQuote.freeTimeAtOrigin,
        freeTimeAtDestination: originalQuote.freeTimeAtDestination,
        termsAndConditions: originalQuote.termsAndConditions,
        specialNotes: originalQuote.specialNotes,
        source: "MANUAL",
        receivedDate: new Date(),
        tags: originalQuote.tags,
        notes: originalQuote.notes,
        attachments: originalQuote.attachments,
        createdBy,
      },
    });

    return duplicatedQuote;
  }

  /**
   * Get expired quotes
   */
  async getExpiredQuotes(
    companyId: string,
    options: { page: number; limit: number }
  ) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where = {
      rfq: { companyId },
      isExpired: true,
    };

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: limit,
        include: {
          rfq: {
            select: {
              id: true,
              rfqNumber: true,
              title: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          shippingLine: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { validityDate: "desc" },
      }),
      prisma.quote.count({ where }),
    ]);

    return {
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Validate quote
   */
  async validateQuote(quoteData: any) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!quoteData.rfqId) errors.push("RFQ ID is required");
    if (!quoteData.contactId) errors.push("Contact ID is required");
    if (!quoteData.shippingLineId) errors.push("Shipping Line ID is required");
    if (!quoteData.totalAmount) errors.push("Total amount is required");
    if (!quoteData.validityDate) errors.push("Validity date is required");

    // Data type validation
    if (quoteData.totalAmount && isNaN(Number(quoteData.totalAmount))) {
      errors.push("Total amount must be a valid number");
    }

    if (quoteData.validityDate && isNaN(Date.parse(quoteData.validityDate))) {
      errors.push("Validity date must be a valid date");
    }

    // Business logic validation
    if (
      quoteData.validityDate &&
      new Date(quoteData.validityDate) < new Date()
    ) {
      warnings.push("Validity date is in the past");
    }

    if (quoteData.totalAmount && Number(quoteData.totalAmount) <= 0) {
      errors.push("Total amount must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
