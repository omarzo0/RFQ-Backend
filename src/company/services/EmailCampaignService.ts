import { prisma } from "../../app";
import { ValidationError } from "../../utils/errors";
import { EmailService } from "./EmailService";
import {
  CampaignStatus,
  CampaignType,
  EmailType,
  EmailPriority,
} from "@prisma/client";

export interface EmailCampaignData {
  name: string;
  description?: string;
  campaignType: CampaignType;
  startDate?: Date;
  endDate?: Date;
}

export interface CampaignTarget {
  contactIds?: string[];
  shippingLineIds?: string[];
  tags?: string[];
  departments?: string[];
  seniority?: string[];
  specializations?: string[];
}

export class EmailCampaignService {
  private emailService = new EmailService();

  /**
   * Create email campaign
   */
  async createEmailCampaign(
    companyId: string,
    createdBy: string,
    campaignData: EmailCampaignData
  ) {
    const campaign = await prisma.emailCampaign.create({
      data: {
        companyId,
        name: campaignData.name,
        description: campaignData.description,
        campaignType: campaignData.campaignType,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        createdBy,
      },
    });

    return campaign;
  }

  /**
   * Update email campaign
   */
  async updateEmailCampaign(
    id: string,
    companyId: string,
    campaignData: Partial<EmailCampaignData>
  ) {
    const existingCampaign = await prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!existingCampaign) {
      throw new ValidationError("Email campaign not found");
    }

    if (existingCampaign.status !== CampaignStatus.DRAFT) {
      throw new ValidationError(
        "Cannot update campaign that is not in draft status"
      );
    }

    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        ...campaignData,
        updatedAt: new Date(),
      },
    });

    return updatedCampaign;
  }

  /**
   * Get email campaigns
   */
  async getEmailCampaigns(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      campaignType?: CampaignType;
      status?: CampaignStatus;
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      campaignType,
      status,
      dateFrom,
      dateTo,
    } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (campaignType) where.campaignType = campaignType;
    if (status) where.status = status;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              emailLogs: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get email campaign by ID
   */
  async getEmailCampaign(id: string, companyId: string) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, companyId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new ValidationError("Email campaign not found");
    }

    return campaign;
  }

  /**
   * Delete email campaign
   */
  async deleteEmailCampaign(id: string, companyId: string) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new ValidationError("Email campaign not found");
    }

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new ValidationError(
        "Cannot delete campaign that is not in draft status"
      );
    }

    if (campaign._count.emailLogs > 0) {
      throw new ValidationError("Cannot delete campaign with sent emails");
    }

    await prisma.emailCampaign.delete({
      where: { id },
    });

    return { message: "Email campaign deleted successfully" };
  }

  /**
   * Start email campaign
   */
  async startEmailCampaign(
    id: string,
    companyId: string,
    target: CampaignTarget,
    emailContent: {
      subject: string;
      bodyHtml: string;
      bodyText?: string;
      templateId?: string;
    },
    options: {
      rateLimitPerMinute?: number;
      personalizationData?: any;
      language?: string;
      timezone?: string;
      priority?: EmailPriority;
    } = {}
  ) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new ValidationError("Email campaign not found");
    }

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new ValidationError("Campaign is not in draft status");
    }

    // Get target contacts
    const contacts = await this.getTargetContacts(companyId, target);

    if (contacts.length === 0) {
      throw new ValidationError("No contacts found for campaign target");
    }

    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.RUNNING,
        startDate: new Date(),
        totalEmails: contacts.length,
      },
    });

    // Create bulk email for this campaign
    const bulkEmail = await this.emailService.createBulkEmail(
      companyId,
      campaign.createdBy,
      {
        name: `${campaign.name} - Campaign`,
        description: campaign.description,
        subject: emailContent.subject,
        bodyHtml: emailContent.bodyHtml,
        bodyText: emailContent.bodyText,
        templateId: emailContent.templateId,
        contactIds: contacts.map((c) => c.id),
        rateLimitPerMinute: options.rateLimitPerMinute || 10,
        personalizationData: options.personalizationData,
        language: options.language || "en",
        timezone: options.timezone,
        priority: options.priority || EmailPriority.NORMAL,
      }
    );

    // Update email logs with campaign ID
    await prisma.emailLog.updateMany({
      where: {
        bulkEmailId: bulkEmail.bulkEmail.id,
      },
      data: {
        campaignId: id,
      },
    });

    // Start sending the bulk email
    await this.emailService.sendBulkEmail(bulkEmail.bulkEmail.id, companyId);

    return {
      campaign,
      bulkEmail,
      contacts: contacts.length,
    };
  }

  /**
   * Pause email campaign
   */
  async pauseEmailCampaign(id: string, companyId: string) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new ValidationError("Email campaign not found");
    }

    if (campaign.status !== CampaignStatus.RUNNING) {
      throw new ValidationError("Campaign is not running");
    }

    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.PAUSED,
      },
    });

    return updatedCampaign;
  }

  /**
   * Resume email campaign
   */
  async resumeEmailCampaign(id: string, companyId: string) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new ValidationError("Email campaign not found");
    }

    if (campaign.status !== CampaignStatus.PAUSED) {
      throw new ValidationError("Campaign is not paused");
    }

    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.RUNNING,
      },
    });

    return updatedCampaign;
  }

  /**
   * Complete email campaign
   */
  async completeEmailCampaign(id: string, companyId: string) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new ValidationError("Email campaign not found");
    }

    if (
      campaign.status !== CampaignStatus.RUNNING &&
      campaign.status !== CampaignStatus.PAUSED
    ) {
      throw new ValidationError("Campaign is not running or paused");
    }

    // Calculate final statistics
    const stats = await this.getCampaignStats(id, companyId);

    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.COMPLETED,
        endDate: new Date(),
        sentEmails: stats.sentEmails,
        deliveredEmails: stats.deliveredEmails,
        openedEmails: stats.openedEmails,
        clickedEmails: stats.clickedEmails,
        bouncedEmails: stats.bouncedEmails,
        failedEmails: stats.failedEmails,
        responseRate: stats.responseRate,
        openRate: stats.openRate,
        clickRate: stats.clickRate,
      },
    });

    return updatedCampaign;
  }

  /**
   * Get target contacts based on campaign target criteria
   */
  private async getTargetContacts(companyId: string, target: CampaignTarget) {
    const where: any = {
      companyId,
      isActive: true,
      doNotContact: false,
    };

    if (target.contactIds && target.contactIds.length > 0) {
      where.id = { in: target.contactIds };
    } else {
      if (target.shippingLineIds && target.shippingLineIds.length > 0) {
        where.shippingLineId = { in: target.shippingLineIds };
      }

      if (target.tags && target.tags.length > 0) {
        where.tags = { hasSome: target.tags };
      }

      if (target.departments && target.departments.length > 0) {
        where.department = { in: target.departments };
      }

      if (target.seniority && target.seniority.length > 0) {
        where.seniority = { in: target.seniority };
      }

      if (target.specializations && target.specializations.length > 0) {
        where.specialization = { in: target.specializations };
      }
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        shippingLine: true,
      },
    });

    return contacts;
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(id: string, companyId: string) {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id, companyId },
    });

    if (!campaign) {
      throw new ValidationError("Email campaign not found");
    }

    const emailLogs = await prisma.emailLog.findMany({
      where: {
        campaignId: id,
        companyId,
      },
    });

    const sentEmails = emailLogs.filter(
      (e) =>
        e.status === "SENT" ||
        e.status === "DELIVERED" ||
        e.status === "OPENED" ||
        e.status === "CLICKED"
    ).length;
    const deliveredEmails = emailLogs.filter(
      (e) =>
        e.status === "DELIVERED" ||
        e.status === "OPENED" ||
        e.status === "CLICKED"
    ).length;
    const openedEmails = emailLogs.filter(
      (e) => e.status === "OPENED" || e.status === "CLICKED"
    ).length;
    const clickedEmails = emailLogs.filter(
      (e) => e.status === "CLICKED"
    ).length;
    const bouncedEmails = emailLogs.filter(
      (e) => e.status === "BOUNCED"
    ).length;
    const failedEmails = emailLogs.filter((e) => e.status === "FAILED").length;

    const responseRate =
      sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0;
    const openRate =
      deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0;
    const clickRate =
      deliveredEmails > 0 ? (clickedEmails / deliveredEmails) * 100 : 0;

    return {
      totalEmails: emailLogs.length,
      sentEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      failedEmails,
      responseRate: Math.round(responseRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
    };
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(
    companyId: string,
    options: {
      dateFrom?: Date;
      dateTo?: Date;
      campaignType?: CampaignType;
    } = {}
  ) {
    const where: any = { companyId };

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    if (options.campaignType) where.campaignType = options.campaignType;

    const campaigns = await prisma.emailCampaign.findMany({
      where,
      include: {
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    });

    const analytics = campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      campaignType: campaign.campaignType,
      status: campaign.status,
      totalEmails: campaign.totalEmails,
      sentEmails: campaign.sentEmails,
      deliveredEmails: campaign.deliveredEmails,
      openedEmails: campaign.openedEmails,
      clickedEmails: campaign.clickedEmails,
      bouncedEmails: campaign.bouncedEmails,
      failedEmails: campaign.failedEmails,
      responseRate: campaign.responseRate,
      openRate: campaign.openRate,
      clickRate: campaign.clickRate,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdAt: campaign.createdAt,
    }));

    return analytics.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get campaign types
   */
  getCampaignTypes() {
    return [
      { value: "RFQ_BLAST", label: "RFQ Blast" },
      { value: "FOLLOW_UP_CAMPAIGN", label: "Follow-up Campaign" },
      { value: "MARKETING", label: "Marketing Campaign" },
      { value: "ANNOUNCEMENT", label: "Announcement" },
      { value: "NEWSLETTER", label: "Newsletter" },
    ];
  }

  /**
   * Get campaign statuses
   */
  getCampaignStatuses() {
    return [
      { value: "DRAFT", label: "Draft" },
      { value: "SCHEDULED", label: "Scheduled" },
      { value: "RUNNING", label: "Running" },
      { value: "COMPLETED", label: "Completed" },
      { value: "PAUSED", label: "Paused" },
      { value: "CANCELLED", label: "Cancelled" },
    ];
  }
}

