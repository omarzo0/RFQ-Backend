import { prisma } from "../../app";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export interface AdminDashboardData {
  overview: {
    totalCompanies: number;
    activeCompanies: number;
    totalUsers: number;
    totalRFQs: number;
    totalQuotes: number;
    totalContacts: number;
    totalShippingLines: number;
    totalEmails: number;
    totalTemplates: number;
  };
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    companyName?: string;
    userId?: string;
  }[];
  subscriptionStats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    expiredSubscriptions: number;
    revenue: number;
  };
  companyStats: {
    id: string;
    name: string;
    email: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    userCount: number;
    rfqCount: number;
    quoteCount: number;
    lastActivity: Date;
    createdAt: Date;
  }[];
  emailStats: {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    bounceRate: number;
    openRate: number;
    clickRate: number;
  };
  rfqStats: {
    totalRFQs: number;
    pendingRFQs: number;
    sentRFQs: number;
    respondedRFQs: number;
    averageResponseTime: number;
  };
  quoteStats: {
    totalQuotes: number;
    pendingQuotes: number;
    acceptedQuotes: number;
    rejectedQuotes: number;
    averageValue: number;
  };
}

export class AdminDashboardService {
  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<AdminDashboardData> {
    try {
      const [
        overview,
        recentActivity,
        subscriptionStats,
        companyStats,
        emailStats,
        rfqStats,
        quoteStats,
      ] = await Promise.all([
        this.getOverviewStats(),
        this.getRecentActivity(),
        this.getSubscriptionStats(),
        this.getCompanyStats(),
        this.getEmailStats(),
        this.getRFQStats(),
        this.getQuoteStats(),
      ]);

      return {
        overview,
        recentActivity,
        subscriptionStats,
        companyStats,
        emailStats,
        rfqStats,
        quoteStats,
      };
    } catch (error) {
      logger.error("Error getting dashboard data:", error);
      throw new AppError("Failed to get dashboard data", 500);
    }
  }

  /**
   * Get overview statistics
   */
  private async getOverviewStats() {
    const [
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalRFQs,
      totalQuotes,
      totalContacts,
      totalShippingLines,
      totalEmails,
      totalTemplates,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.companyUser.count({ where: { isActive: true } }),
      prisma.rFQ.count(),
      prisma.quote.count(),
      prisma.contact.count(),
      prisma.shippingLine.count(),
      prisma.emailLog.count(),
      prisma.rFQTemplate.count(),
    ]);

    return {
      totalCompanies,
      activeCompanies,
      totalUsers,
      totalRFQs,
      totalQuotes,
      totalContacts,
      totalShippingLines,
      totalEmails,
      totalTemplates,
    };
  }

  /**
   * Get recent activity across all companies
   */
  private async getRecentActivity() {
    const activities = await prisma.$queryRaw`
      SELECT 
        'RFQ' as type,
        id,
        title as description,
        created_at as timestamp,
        company_id
      FROM "RFQ" 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'QUOTE' as type,
        id,
        CONCAT('Quote for RFQ: ', rfq_id) as description,
        created_at as timestamp,
        (SELECT company_id FROM "RFQ" WHERE id = rfq_id) as company_id
      FROM "Quote" 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'EMAIL' as type,
        id,
        CONCAT('Email sent: ', subject) as description,
        sent_at as timestamp,
        company_id
      FROM "EmailLog" 
      WHERE sent_at >= NOW() - INTERVAL '7 days'
      
      ORDER BY timestamp DESC
      LIMIT 20
    `;

    // Get company names for activities
    const activitiesWithCompanyNames = await Promise.all(
      (activities as any[]).map(async (activity) => {
        const company = await prisma.company.findUnique({
          where: { id: activity.company_id },
          select: { name: true },
        });

        return {
          id: activity.id,
          type: activity.type,
          description: activity.description,
          timestamp: activity.timestamp,
          companyName: company?.name,
        };
      })
    );

    return activitiesWithCompanyNames;
  }

  /**
   * Get subscription statistics
   */
  private async getSubscriptionStats() {
    const [
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({
        where: { subscriptionStatus: "ACTIVE" },
      }),
      prisma.company.count({
        where: { subscriptionStatus: "TRIAL" },
      }),
      prisma.company.count({
        where: { subscriptionStatus: "EXPIRED" },
      }),
    ]);

    // Calculate revenue (mock calculation - you'd implement real billing logic)
    const revenue = await prisma.company.aggregate({
      where: { subscriptionStatus: "ACTIVE" },
      _sum: {
        // Assuming you have a monthlyFee field in Company model
        // monthlyFee: true
      },
    });

    return {
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      expiredSubscriptions,
      revenue: 0, // revenue._sum.monthlyFee || 0
    };
  }

  /**
   * Get company statistics with activity data
   */
  private async getCompanyStats() {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        users: {
          select: { id: true },
        },
        rfqs: {
          select: { id: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            users: true,
            rfqs: true,
            quotes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      email: company.email,
      subscriptionPlan: company.subscriptionPlan,
      subscriptionStatus: company.subscriptionStatus,
      userCount: company._count.users,
      rfqCount: company._count.rfqs,
      quoteCount: company._count.quotes,
      lastActivity: company.rfqs[0]?.updatedAt || company.createdAt,
      createdAt: company.createdAt,
    }));
  }

  /**
   * Get email statistics
   */
  private async getEmailStats() {
    const [totalSent, totalDelivered, totalOpened, totalClicked] =
      await Promise.all([
        prisma.emailLog.count(),
        prisma.emailLog.count({ where: { status: "DELIVERED" } }),
        prisma.emailLog.count({ where: { status: "OPENED" } }),
        prisma.emailLog.count({ where: { status: "CLICKED" } }),
      ]);

    const bounceRate =
      totalSent > 0 ? (totalSent - totalDelivered) / totalSent : 0;
    const openRate = totalDelivered > 0 ? totalOpened / totalDelivered : 0;
    const clickRate = totalOpened > 0 ? totalClicked / totalOpened : 0;

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      bounceRate,
      openRate,
      clickRate,
    };
  }

  /**
   * Get RFQ statistics
   */
  private async getRFQStats() {
    const [totalRFQs, pendingRFQs, sentRFQs, respondedRFQs] = await Promise.all(
      [
        prisma.rFQ.count(),
        prisma.rFQ.count({ where: { status: "DRAFT" } }),
        prisma.rFQ.count({ where: { status: "SENT" } }),
        prisma.rFQ.count({ where: { status: "RESPONDED" } }),
      ]
    );

    // Calculate average response time
    const responseTimeData = await prisma.rFQ.aggregate({
      where: {
        status: "RESPONDED",
        sentAt: { not: null },
        respondedAt: { not: null },
      },
      _avg: {
        // This would need a computed field for response time
        // responseTime: true
      },
    });

    return {
      totalRFQs,
      pendingRFQs,
      sentRFQs,
      respondedRFQs,
      averageResponseTime: 0, // responseTimeData._avg.responseTime || 0
    };
  }

  /**
   * Get quote statistics
   */
  private async getQuoteStats() {
    const [totalQuotes, pendingQuotes, acceptedQuotes, rejectedQuotes] =
      await Promise.all([
        prisma.quote.count(),
        prisma.quote.count({ where: { status: "PENDING" } }),
        prisma.quote.count({ where: { status: "ACCEPTED" } }),
        prisma.quote.count({ where: { status: "REJECTED" } }),
      ]);

    // Calculate average quote value
    const averageValueData = await prisma.quote.aggregate({
      where: { status: { not: "DRAFT" } },
      _avg: {
        totalAmount: true,
      },
    });

    return {
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      rejectedQuotes,
      averageValue: Number(averageValueData._avg.totalAmount) || 0,
    };
  }

  /**
   * Get detailed company data
   */
  async getCompanyDetails(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        rfqs: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            sentAt: true,
            _count: {
              select: {
                recipients: true,
                quotes: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        quotes: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            currency: true,
            createdAt: true,
            rfq: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        contacts: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                rfqs: true,
                quotes: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        shippingLines: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                contacts: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        emailLogs: {
          select: {
            id: true,
            subject: true,
            status: true,
            sentAt: true,
            openedAt: true,
            clickedAt: true,
          },
          orderBy: { sentAt: "desc" },
          take: 10,
        },
        templates: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                rfqs: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            users: true,
            rfqs: true,
            quotes: true,
            contacts: true,
            shippingLines: true,
            emailLogs: true,
            templates: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError("Company not found", 404);
    }

    return company;
  }

  /**
   * Get all RFQs across all companies
   */
  async getAllRFQs(
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      companyId?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, status, companyId, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
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
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all quotes across all companies
   */
  async getAllQuotes(
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      companyId?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, status, companyId, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { quoteReference: { contains: search, mode: "insensitive" } },
        { specialNotes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
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
          rfq: {
            select: {
              id: true,
              title: true,
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
      }),
      prisma.quote.count({ where }),
    ]);

    return {
      quotes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all contacts across all companies
   */
  async getAllContacts(
    filters: {
      page?: number;
      limit?: number;
      companyId?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, companyId, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
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
          shippingLine: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              rfqs: true,
              quotes: true,
            },
          },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    return {
      contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all shipping lines across all companies
   */
  async getAllShippingLines(
    filters: {
      page?: number;
      limit?: number;
      companyId?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, companyId, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const [shippingLines, total] = await Promise.all([
      prisma.shippingLine.findMany({
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
          _count: {
            select: {
              contacts: true,
            },
          },
        },
      }),
      prisma.shippingLine.count({ where }),
    ]);

    return {
      shippingLines,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all email logs across all companies
   */
  async getAllEmailLogs(
    filters: {
      page?: number;
      limit?: number;
      companyId?: string;
      status?: string;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 20, companyId, status, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { to: { contains: search, mode: "insensitive" } },
      ];
    }

    const [emailLogs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          rfq: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.emailLog.count({ where }),
    ]);

    return {
      emailLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
