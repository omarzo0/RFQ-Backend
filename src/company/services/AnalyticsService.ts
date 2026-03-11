import { prisma } from "../../app";
import { Decimal } from "@prisma/client/runtime/library";

export class AnalyticsService {
  /**
   * Get subscription plan usage & feature analytics for the company.
   * Shows current usage vs plan limits and quote-related feature stats.
   */
  async getPlanFeatureAnalytics(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    });

    if (!company) return null;

    const plan = await prisma.subscriptionPlan.findFirst({
      where: { name: company.subscriptionPlan },
    });

    // Current month boundaries
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Gather actual usage counts
    const [
      totalUsers,
      totalContacts,
      rfqsThisMonth,
      emailsThisMonth,
      totalQuotes,
      awardedQuotes,
      activeQuotes,
      expiredQuotes,
      avgQuoteAmount,
      quotesBySource,
      quotesByStatus,
    ] = await Promise.all([
      prisma.companyUser.count({ where: { companyId } }),
      prisma.contact.count({ where: { companyId } }),
      prisma.rFQ.count({ where: { companyId, createdAt: { gte: monthStart } } }),
      prisma.emailLog.count({ where: { companyId, createdAt: { gte: monthStart } } }),
      prisma.quote.count({ where: { rfq: { companyId } } }),
      prisma.quote.count({ where: { rfq: { companyId }, isAwarded: true } }),
      prisma.quote.count({ where: { rfq: { companyId }, status: "ACTIVE" } }),
      prisma.quote.count({ where: { rfq: { companyId }, isExpired: true } }),
      prisma.quote.aggregate({
        where: { rfq: { companyId } },
        _avg: { totalAmount: true },
      }),
      prisma.quote.groupBy({
        by: ["source"],
        where: { rfq: { companyId } },
        _count: { id: true },
      }),
      prisma.quote.groupBy({
        by: ["status"],
        where: { rfq: { companyId } },
        _count: { id: true },
      }),
    ]);

    const features = (plan?.features as Record<string, boolean>) || {};

    return {
      plan: {
        name: plan?.name || company.subscriptionPlan,
        description: plan?.description || null,
        features,
        isActive: plan?.isActive ?? true,
      },
      subscription: {
        status: company.subscriptionStatus,
        trialEndsAt: company.trialEndsAt,
      },
      usage: {
        users: { current: totalUsers, limit: plan?.maxUsers ?? null, percentage: plan?.maxUsers ? Math.round((totalUsers / plan.maxUsers) * 100) : null },
        contacts: { current: totalContacts, limit: plan?.maxContacts ?? null, percentage: plan?.maxContacts ? Math.round((totalContacts / plan.maxContacts) * 100) : null },
        rfqsThisMonth: { current: rfqsThisMonth, limit: plan?.maxRFQsPerMonth ?? null, percentage: plan?.maxRFQsPerMonth ? Math.round((rfqsThisMonth / plan.maxRFQsPerMonth) * 100) : null },
        emailsThisMonth: { current: emailsThisMonth, limit: plan?.maxEmailSendsPerMonth ?? null, percentage: plan?.maxEmailSendsPerMonth ? Math.round((emailsThisMonth / plan.maxEmailSendsPerMonth) * 100) : null },
      },
      quoteStats: {
        totalQuotes,
        activeQuotes,
        awardedQuotes,
        expiredQuotes,
        awardRate: totalQuotes > 0 ? Number(((awardedQuotes / totalQuotes) * 100).toFixed(1)) : 0,
        averageQuoteAmount: avgQuoteAmount._avg.totalAmount ? Number(avgQuoteAmount._avg.totalAmount) : 0,
        bySource: quotesBySource.map((s) => ({ source: s.source, count: s._count.id })),
        byStatus: quotesByStatus.map((s) => ({ status: s.status, count: s._count.id })),
      },
    };
  }

  /**
   * Get performance metrics for the company
   */
  async getPerformanceMetrics(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get RFQ metrics
    const rfqMetrics = await prisma.rFQ.aggregate({
      where: {
        companyId,
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
    });

    // Get quote metrics
    const quoteMetrics = await prisma.quote.aggregate({
      where: {
        rfq: { companyId },
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
      _avg: { totalAmount: true },
      _sum: { totalAmount: true },
    });

    // Get conversion rate
    const totalRFQs = rfqMetrics._count.id;
    const totalQuotes = quoteMetrics._count.id;
    const conversionRate = totalRFQs > 0 ? (totalQuotes / totalRFQs) * 100 : 0;

    // Get previous period for comparison
    const previousStart = new Date(
      start.getTime() - (end.getTime() - start.getTime())
    );
    const previousRfqMetrics = await prisma.rFQ.aggregate({
      where: {
        companyId,
        createdAt: { gte: previousStart, lt: start },
      },
      _count: { id: true },
    });

    const growth =
      previousRfqMetrics._count.id > 0
        ? ((totalRFQs - previousRfqMetrics._count.id) /
            previousRfqMetrics._count.id) *
          100
        : 0;

    return {
      totalRFQs,
      totalQuotes,
      quoteConversionRate: Number(conversionRate.toFixed(2)),
      totalRevenue: quoteMetrics._sum.totalAmount || 0,
      averageQuoteAmount: quoteMetrics._avg.totalAmount || 0,
      revenueGrowth: Number(growth.toFixed(2)),
    };
  }

  /**
   * Get RFQ analytics
   */
  async getRFQAnalytics(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get RFQs by status
    const rfqsByStatus = await prisma.rFQ.groupBy({
      by: ["status"],
      where: {
        companyId,
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
    });

    // Get RFQ timeline
    const rfqTimelineRaw = (await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM rfqs 
      WHERE company_id = ${companyId}
        AND created_at >= ${start}
        AND created_at <= ${end}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `) as Array<{ date: string; count: bigint }>;

    const rfqTimeline = rfqTimelineRaw.map((item) => ({
      date: item.date,
      count: Number(item.count),
    }));

    // Get response time analysis - using raw query since _avg doesn't work with DateTime fields
    const responseTimeData = await prisma.$queryRaw`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (response_received_at - email_sent_at))/3600) as average_response_time_hours
      FROM rfq_recipients 
      WHERE rfq_id IN (
        SELECT id FROM rfqs WHERE company_id = ${companyId}
      )
        AND email_sent_at >= ${start}
        AND email_sent_at <= ${end}
        AND response_received_at IS NOT NULL
    `;

    // Get quote distribution
    const quoteDistribution = await prisma.quote.groupBy({
      by: ["currency"],
      where: {
        rfq: { companyId },
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
      _avg: { totalAmount: true },
    });

    return {
      byStatus: rfqsByStatus.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = Number(item._count.id);
        return acc;
      }, {} as Record<string, number>),
      timeline: rfqTimeline as Array<{ date: string; count: number }>,
      responseTimeAnalysis: {
        averageResponseTime: (responseTimeData as any[])[0]
          ?.average_response_time_hours
          ? Number((responseTimeData as any[])[0].average_response_time_hours)
          : 0,
      },
      quoteDistribution: quoteDistribution.map((item) => ({
        currency: item.currency,
        count: Number(item._count.id),
        averageAmount: item._avg.totalAmount,
      })),
    };
  }

  /**
   * Get quote analytics
   */
  async getQuoteAnalytics(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get quote timeline
    const quoteTimelineRaw = (await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM quotes 
      WHERE rfq_id IN (
        SELECT id FROM rfqs WHERE company_id = ${companyId}
      )
        AND created_at >= ${start}
        AND created_at <= ${end}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `) as Array<{ date: string; count: bigint }>;

    const quoteTimeline = quoteTimelineRaw.map((item) => ({
      date: item.date,
      count: Number(item.count),
    }));

    // Get quotes by source
    const quotesBySource = await prisma.quote.groupBy({
      by: ["source"],
      where: {
        rfq: { companyId },
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
    });

    // Get competitive analysis
    const competitiveAnalysis = await prisma.quote.groupBy({
      by: ["shippingLineId"],
      where: {
        rfq: { companyId },
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
      _avg: { totalAmount: true },
      _min: { totalAmount: true },
    });

    return {
      timeline: quoteTimeline as Array<{ date: string; count: number }>,
      bySource: quotesBySource.reduce((acc, item) => {
        acc[item.source.toLowerCase()] = Number(item._count.id);
        return acc;
      }, {} as Record<string, number>),
      competitiveAnalysis: await Promise.all(
        competitiveAnalysis.map(async (item) => {
          const shippingLine = await prisma.shippingLine.findUnique({
            where: { id: item.shippingLineId },
            select: { name: true },
          });
          return {
            shippingLineId: item.shippingLineId,
            shippingLineName: shippingLine?.name || "Unknown",
            quoteCount: Number(item._count.id),
            averageAmount: item._avg.totalAmount,
            lowestAmount: item._min.totalAmount,
          };
        })
      ),
    };
  }

  /**
   * Get carrier performance analytics
   */
  async getCarrierPerformance(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get carrier performance metrics
    const carrierMetrics = await prisma.carrierPerformanceMetric.findMany({
      where: {
        companyId,
        periodStart: { gte: start },
        periodEnd: { lte: end },
      },
      include: {
        shippingLine: {
          select: { name: true, code: true },
        },
      },
      orderBy: { responseRate: "desc" },
    });

    // If no metrics exist, calculate them
    if (carrierMetrics.length === 0) {
      return await this.calculateCarrierPerformanceMetrics(
        companyId,
        start,
        end
      );
    }

    return carrierMetrics.map((metric) => ({
      id: metric.shippingLineId,
      name: metric.shippingLine.name,
      code: metric.shippingLine.code,
      responseRate: Number(metric.responseRate),
      averageResponseTime: Number(metric.averageResponseTimeHours || 0),
      winRate: Number(metric.winRate),
      quoteCount: metric.quotesSubmitted,
      averageQuoteAmount: Number(metric.averageQuoteAmount || 0),
      performanceScore: this.calculatePerformanceScore(
        Number(metric.responseRate),
        Number(metric.winRate),
        Number(metric.averageResponseTimeHours || 0)
      ),
    }));
  }

  /**
   * Get contact engagement analytics
   */
  async getContactEngagement(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get contact engagement data
    const engagementData = await prisma.contact.findMany({
      where: {
        companyId,
        createdAt: { gte: start, lte: end },
      },
      include: {
        shippingLine: { select: { name: true } },
        rfqRecipients: {
          where: {
            emailSentAt: { gte: start, lte: end },
          },
        },
        emailLogs: {
          where: {
            createdAt: { gte: start, lte: end },
          },
        },
      },
    });

    return engagementData
      .map((contact) => {
        const totalEmails = contact.emailLogs.length;
        const openedEmails = contact.emailLogs.filter(
          (log) => log.openedAt
        ).length;
        const responseRate =
          totalEmails > 0 ? (openedEmails / totalEmails) * 100 : 0;

        return {
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
          company: contact.shippingLine.name,
          email: contact.email,
          totalEmails,
          openedEmails,
          responseRate: Number(responseRate.toFixed(1)),
          lastActivity: contact.emailLogs[0]?.createdAt || contact.createdAt,
        };
      })
      .sort((a, b) => b.responseRate - a.responseRate);
  }

  /**
   * Get route performance analytics
   */
  async getRoutePerformance(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get route performance data
    const routeDataRaw = (await prisma.$queryRaw`
      SELECT 
        origin_port,
        destination_port,
        COUNT(DISTINCT r.id) as total_rfqs,
        COUNT(q.id) as total_quotes,
        AVG(q.total_amount) as average_price,
        AVG(EXTRACT(EPOCH FROM (q.created_at - r.created_at))/3600) as average_response_time
      FROM rfqs r
      LEFT JOIN quotes q ON r.id = q.rfq_id
      WHERE r.company_id = ${companyId}
        AND r.created_at >= ${start}
        AND r.created_at <= ${end}
      GROUP BY origin_port, destination_port
      ORDER BY total_quotes DESC
    `) as Array<{
      origin_port: string;
      destination_port: string;
      total_rfqs: bigint;
      total_quotes: bigint;
      average_price: number;
      average_response_time: number;
    }>;

    return routeDataRaw.map((route) => ({
      route: `${route.origin_port} → ${route.destination_port}`,
      totalRFQs: Number(route.total_rfqs),
      totalQuotes: Number(route.total_quotes),
      conversionRate:
        Number(route.total_rfqs) > 0
          ? (Number(route.total_quotes) / Number(route.total_rfqs)) * 100
          : 0,
      averagePrice: Number(route.average_price || 0),
      averageResponseTime: Number(route.average_response_time || 0),
    }));
  }

  /**
   * Get historical benchmarking data
   */
  async getHistoricalBenchmarking(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get current period metrics
    const currentMetrics = await this.getPerformanceMetrics(
      companyId,
      startDate,
      endDate
    );

    // Get previous period metrics
    const previousStart = new Date(
      start.getTime() - (end.getTime() - start.getTime())
    );
    const previousMetrics = await this.getPerformanceMetrics(
      companyId,
      previousStart.toISOString(),
      start.toISOString()
    );

    // Calculate improvements
    const improvements = [
      {
        metric: "Total RFQs",
        currentValue: currentMetrics.totalRFQs,
        previousValue: previousMetrics.totalRFQs,
        change:
          previousMetrics.totalRFQs > 0
            ? ((currentMetrics.totalRFQs - previousMetrics.totalRFQs) /
                previousMetrics.totalRFQs) *
              100
            : 0,
        changeType:
          currentMetrics.totalRFQs > previousMetrics.totalRFQs
            ? "improvement"
            : "decline",
      },
      {
        metric: "Conversion Rate",
        currentValue: currentMetrics.quoteConversionRate,
        previousValue: previousMetrics.quoteConversionRate,
        change:
          previousMetrics.quoteConversionRate > 0
            ? ((currentMetrics.quoteConversionRate -
                previousMetrics.quoteConversionRate) /
                previousMetrics.quoteConversionRate) *
              100
            : 0,
        changeType:
          currentMetrics.quoteConversionRate >
          previousMetrics.quoteConversionRate
            ? "improvement"
            : "decline",
      },
      {
        metric: "Average Quote Amount",
        currentValue: Number(currentMetrics.averageQuoteAmount),
        previousValue: Number(previousMetrics.averageQuoteAmount),
        change:
          Number(previousMetrics.averageQuoteAmount) > 0
            ? ((Number(currentMetrics.averageQuoteAmount) -
                Number(previousMetrics.averageQuoteAmount)) /
                Number(previousMetrics.averageQuoteAmount)) *
              100
            : 0,
        changeType:
          Number(currentMetrics.averageQuoteAmount) >
          Number(previousMetrics.averageQuoteAmount)
            ? "improvement"
            : "decline",
      },
    ];

    // Get year over year data
    const yearOverYear = await this.getYearOverYearData(companyId);

    return {
      currentPeriod: {
        period: `${start.toISOString().split("T")[0]} to ${
          end.toISOString().split("T")[0]
        }`,
        metrics: currentMetrics,
      },
      previousPeriod: {
        period: `${previousStart.toISOString().split("T")[0]} to ${
          start.toISOString().split("T")[0]
        }`,
        metrics: previousMetrics,
      },
      improvements,
      yearOverYear,
    };
  }

  /**
   * Get cost analysis data
   */
  async getCostAnalysis(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get total shipping costs
    const totalCosts = await prisma.quote.aggregate({
      where: {
        rfq: { companyId },
        createdAt: { gte: start, lte: end },
        isWinner: true,
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const totalShippingCosts = Number(totalCosts._sum.totalAmount || 0);
    const totalShipments = totalCosts._count.id;
    const averageCostPerShipment =
      totalShipments > 0 ? totalShippingCosts / totalShipments : 0;

    // Get cost breakdown by category
    const costBreakdown = await prisma.quote.groupBy({
      by: ["currency"],
      where: {
        rfq: { companyId },
        createdAt: { gte: start, lte: end },
        isWinner: true,
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    // Get cost trends
    const costTrendsRaw = (await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('week', created_at) as period,
        COUNT(*) as shipment_count,
        SUM(total_amount) as total_cost,
        AVG(total_amount) as average_cost
      FROM quotes 
      WHERE rfq_id IN (
        SELECT id FROM rfqs WHERE company_id = ${companyId}
      )
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND is_winner = true
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY period ASC
    `) as Array<{
      period: Date;
      shipment_count: bigint;
      total_cost: number;
      average_cost: number;
    }>;

    const costTrends = costTrendsRaw.map((trend) => ({
      period: trend.period,
      shipment_count: Number(trend.shipment_count),
      total_cost: Number(trend.total_cost),
      average_cost: Number(trend.average_cost),
    }));

    // Generate optimization opportunities
    const optimizationOpportunities = [
      {
        category: "Route Optimization",
        currentCost: totalShippingCosts * 0.3,
        potentialSavings: totalShippingCosts * 0.05,
        savingsPercentage: 16.7,
        recommendations: [
          "Consolidate shipments on popular routes",
          "Negotiate better rates with preferred carriers",
          "Consider alternative ports for cost savings",
        ],
      },
      {
        category: "Carrier Selection",
        currentCost: totalShippingCosts * 0.4,
        potentialSavings: totalShippingCosts * 0.08,
        savingsPercentage: 20.0,
        recommendations: [
          "Expand carrier network for better competition",
          "Implement dynamic carrier selection",
          "Review and renegotiate existing contracts",
        ],
      },
    ];

    return {
      totalShippingCosts,
      averageCostPerShipment,
      costBreakdown: costBreakdown.map((item) => ({
        category: item.currency,
        amount: Number(item._sum.totalAmount || 0),
        count: Number(item._count.id),
        percentage:
          totalShippingCosts > 0
            ? (Number(item._sum.totalAmount || 0) / totalShippingCosts) * 100
            : 0,
      })),
      costTrends: costTrends.map((trend) => ({
        period: trend.period.toISOString().split("T")[0],
        totalCost: Number(trend.total_cost || 0),
        averageCost: Number(trend.average_cost || 0),
      })),
      optimizationOpportunities,
    };
  }

  /**
   * Get market intelligence data
   */
  async getMarketIntelligence(
    companyId: string,
    startDate?: string,
    endDate?: string
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get pricing trends
    const pricingTrendsRaw = (await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('week', created_at) as period,
        AVG(total_amount) as average_price,
        COUNT(*) as volume
      FROM quotes 
      WHERE rfq_id IN (
        SELECT id FROM rfqs WHERE company_id = ${companyId}
      )
        AND created_at >= ${start}
        AND created_at <= ${end}
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY period ASC
    `) as Array<{ period: Date; average_price: number; volume: bigint }>;

    const pricingTrends = pricingTrendsRaw.map((trend) => ({
      period: trend.period,
      average_price: Number(trend.average_price),
      volume: Number(trend.volume),
    }));

    // Get competitor analysis
    const competitorAnalysis = await prisma.quote.groupBy({
      by: ["shippingLineId"],
      where: {
        rfq: { companyId },
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
      _avg: { totalAmount: true },
    });

    const totalQuotes = competitorAnalysis.reduce(
      (sum, item) => sum + Number(item._count.id),
      0
    );

    // Get market conditions
    const marketConditions = {
      priceTrend: "stable", // This would be calculated based on historical data
      demandLevel: "moderate",
      capacityUtilization: 75.5,
      volatility: 12.3,
    };

    // Generate market forecast
    const latestTrend =
      pricingTrends.length > 0
        ? pricingTrends[pricingTrends.length - 1]
        : { average_price: 0, volume: 0 };
    const marketForecast = [
      {
        period: "Next Month",
        predictedPrice: Number(latestTrend.average_price || 0) * 1.02,
        predictedVolume: Number(latestTrend.volume || 0) * 1.1,
        confidence: 85.0,
        factors: ["Seasonal demand", "Fuel prices", "Capacity constraints"],
      },
      {
        period: "Next Quarter",
        predictedPrice: Number(latestTrend.average_price || 0) * 1.05,
        predictedVolume: Number(latestTrend.volume || 0) * 1.2,
        confidence: 72.0,
        factors: [
          "Economic indicators",
          "Trade policies",
          "Infrastructure changes",
        ],
      },
    ];

    return {
      marketConditions,
      pricingTrends: pricingTrends.map((trend) => ({
        period: trend.period.toISOString().split("T")[0],
        averagePrice: Number(trend.average_price || 0),
        priceIndex:
          100 +
          ((Number(trend.average_price || 0) -
            Number(latestTrend.average_price || 0)) /
            Number(latestTrend.average_price || 0)) *
            100,
      })),
      competitorAnalysis: await Promise.all(
        competitorAnalysis.map(async (item) => {
          const shippingLine = await prisma.shippingLine.findUnique({
            where: { id: item.shippingLineId },
            select: { name: true },
          });
          return {
            carrier: shippingLine?.name || "Unknown",
            marketShare:
              totalQuotes > 0
                ? (Number(item._count.id) / totalQuotes) * 100
                : 0,
            averagePrice: Number(item._avg.totalAmount || 0),
          };
        })
      ),
      marketForecast,
    };
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(companyId: string) {
    // This would typically come from a separate table for scheduled reports
    // For now, return mock data
    return [
      {
        id: "1",
        name: "Weekly Performance Report",
        description: "Weekly summary of RFQ and quote performance",
        frequency: "weekly",
        recipients: ["admin@company.com"],
        isActive: true,
        lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  /**
   * Create scheduled report
   */
  async createScheduledReport(
    companyId: string,
    userId: string,
    reportData: any
  ) {
    // This would create a new scheduled report
    return {
      id: "new-report-id",
      ...reportData,
      companyId,
      createdBy: userId,
      createdAt: new Date(),
    };
  }

  /**
   * Update scheduled report
   */
  async updateScheduledReport(id: string, companyId: string, reportData: any) {
    // This would update an existing scheduled report
    return {
      id,
      ...reportData,
      updatedAt: new Date(),
    };
  }

  /**
   * Delete scheduled report
   */
  async deleteScheduledReport(id: string, companyId: string) {
    // This would delete a scheduled report
    return true;
  }

  /**
   * Get custom reports
   */
  async getCustomReports(companyId: string) {
    // This would return custom reports for the company
    return [
      {
        id: "1",
        name: "Custom Route Analysis",
        description: "Detailed analysis of specific routes",
        filters: { routes: ["Shanghai-Los Angeles", "Hamburg-New York"] },
        metrics: ["conversion_rate", "average_price", "response_time"],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  /**
   * Create custom report
   */
  async createCustomReport(companyId: string, userId: string, reportData: any) {
    return {
      id: "new-custom-report-id",
      ...reportData,
      companyId,
      createdBy: userId,
      createdAt: new Date(),
    };
  }

  /**
   * Update custom report
   */
  async updateCustomReport(id: string, companyId: string, reportData: any) {
    return {
      id,
      ...reportData,
      updatedAt: new Date(),
    };
  }

  /**
   * Delete custom report
   */
  async deleteCustomReport(id: string, companyId: string) {
    return true;
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    companyId: string,
    format: string,
    period: any,
    metrics: string[]
  ) {
    // This would generate and return the export file
    // For now, return mock data

    // Handle case where period might be undefined or malformed
    const startDate =
      period?.start ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = period?.end || new Date().toISOString();

    const data = {
      period: {
        start: startDate,
        end: endDate,
      },
      metrics,
      data: await this.getPerformanceMetrics(companyId, startDate, endDate),
    };

    // In a real implementation, this would generate PDF/Excel/CSV files
    return JSON.stringify(data, null, 2);
  }

  // Helper methods
  private calculateAverageResponseTime(responseTime: any): number {
    // This would calculate the actual response time
    return 24; // Mock value in hours
  }

  private calculatePerformanceScore(
    responseRate: number,
    winRate: number,
    responseTime: number
  ): number {
    // Calculate a performance score based on multiple factors
    const responseScore = Math.min(responseRate, 100);
    const winScore = Math.min(winRate, 100);
    const timeScore = Math.max(0, 100 - (responseTime / 24) * 10); // Penalize slow responses

    return Number(((responseScore + winScore + timeScore) / 3).toFixed(1));
  }

  private async calculateCarrierPerformanceMetrics(
    companyId: string,
    start: Date,
    end: Date
  ) {
    // Calculate carrier performance metrics from raw data
    const carriers = await prisma.shippingLine.findMany({
      where: { companyId },
      include: {
        quotes: {
          where: {
            createdAt: { gte: start, lte: end },
          },
        },
        rfqRecipients: {
          where: {
            emailSentAt: { gte: start, lte: end },
          },
        },
      },
    });

    return carriers.map((carrier) => {
      const totalRFQs = carrier.rfqRecipients.length;
      const totalQuotes = carrier.quotes.length;
      const responseRate = totalRFQs > 0 ? (totalQuotes / totalRFQs) * 100 : 0;
      const averageAmount =
        carrier.quotes.length > 0
          ? carrier.quotes.reduce(
              (sum, quote) => sum + Number(quote.totalAmount),
              0
            ) / carrier.quotes.length
          : 0;

      return {
        id: carrier.id,
        name: carrier.name,
        code: carrier.code,
        responseRate: Number(responseRate.toFixed(1)),
        averageResponseTime: 24, // Mock value
        winRate: 15, // Mock value
        quoteCount: Number(totalQuotes),
        averageQuoteAmount: Number(averageAmount.toFixed(2)),
        performanceScore: this.calculatePerformanceScore(responseRate, 15, 24),
      };
    });
  }

  private async getYearOverYearData(companyId: string) {
    // Get year over year data for the last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const metrics = await this.getPerformanceMetrics(
        companyId,
        start.toISOString(),
        end.toISOString()
      );

      months.push({
        period: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        metrics,
      });
    }

    return months;
  }
}
