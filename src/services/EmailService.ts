import { prisma } from "../app";
import { ValidationError } from "../utils/errors";
import { v4 as uuidv4 } from "uuid";
import {
  EmailStatus,
  EmailType,
  EmailPriority,
  BulkEmailStatus,
} from "@prisma/client";

export interface EmailPersonalizationData {
  [key: string]: any;
  contactName?: string;
  companyName?: string;
  rfqNumber?: string;
  originPort?: string;
  destinationPort?: string;
  commodity?: string;
  containerType?: string;
  containerQuantity?: number;
  cargoWeight?: number;
  cargoVolume?: number;
  incoterm?: string;
  cargoReadyDate?: string;
  quoteDeadline?: string;
  specialRequirements?: string;
  requiredServices?: string[];
  preferredCarriers?: string[];
  estimatedValue?: number;
  currency?: string;
  tradeLane?: string;
  shipmentUrgency?: string;
  priority?: string;
  notes?: string;
  tags?: string[];
}

export interface BulkEmailOptions {
  name: string;
  description?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  templateId?: string;
  contactIds: string[];
  scheduledFor?: Date;
  rateLimitPerMinute?: number;
  personalizationData?: EmailPersonalizationData;
  language?: string;
  timezone?: string;
  priority?: EmailPriority;
}

export interface EmailTrackingData {
  trackingPixelId?: string;
  unsubscribeToken?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  device?: string;
  browser?: string;
  os?: string;
}

export class EmailService {
  private readonly DEFAULT_RATE_LIMIT = 10; // emails per minute
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [5, 15, 60]; // minutes

  /**
   * Send single email with tracking
   */
  async sendEmail(
    companyId: string,
    toEmail: string,
    fromEmail: string,
    subject: string,
    bodyHtml: string,
    bodyText?: string,
    options: {
      rfqId?: string;
      contactId?: string;
      templateId?: string;
      followUpRuleId?: string;
      scheduledFollowUpId?: string;
      emailType?: EmailType;
      priority?: EmailPriority;
      personalizationData?: EmailPersonalizationData;
      trackingData?: EmailTrackingData;
      language?: string;
      timezone?: string;
      scheduledFor?: Date;
    } = {}
  ) {
    const trackingPixelId = uuidv4();
    const unsubscribeToken = uuidv4();

    const emailLog = await prisma.emailLog.create({
      data: {
        companyId,
        toEmail: toEmail.toLowerCase(),
        fromEmail,
        subject,
        bodyHtml,
        bodyText,
        rfqId: options.rfqId,
        contactId: options.contactId,
        templateId: options.templateId,
        followUpRuleId: options.followUpRuleId,
        scheduledFollowUpId: options.scheduledFollowUpId,
        emailType: options.emailType || EmailType.RFQ,
        priority: options.priority || EmailPriority.NORMAL,
        personalizationData: options.personalizationData,
        trackingPixelId,
        unsubscribeToken,
        language: options.language || "en",
        timezone: options.timezone,
        scheduledFor: options.scheduledFor,
        status: options.scheduledFor ? EmailStatus.QUEUED : EmailStatus.QUEUED,
      },
    });

    // If scheduled for future, don't send immediately
    if (options.scheduledFor && options.scheduledFor > new Date()) {
      return emailLog;
    }

    // Send email immediately
    await this.processEmailQueue([emailLog.id]);

    return emailLog;
  }

  /**
   * Create and send bulk email
   */
  async createBulkEmail(
    companyId: string,
    createdBy: string,
    options: BulkEmailOptions
  ) {
    // Validate contacts exist and are active
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: options.contactIds },
        companyId,
        isActive: true,
        doNotContact: false,
      },
      include: {
        shippingLine: true,
      },
    });

    if (contacts.length === 0) {
      throw new ValidationError("No valid contacts found for bulk email");
    }

    // Create bulk email record
    const bulkEmail = await prisma.bulkEmail.create({
      data: {
        companyId,
        name: options.name,
        description: options.description,
        subject: options.subject,
        bodyHtml: options.bodyHtml,
        bodyText: options.bodyText,
        templateId: options.templateId,
        contactIds: options.contactIds,
        totalRecipients: contacts.length,
        status: options.scheduledFor
          ? BulkEmailStatus.SCHEDULED
          : BulkEmailStatus.DRAFT,
        scheduledFor: options.scheduledFor,
        rateLimitPerMinute:
          options.rateLimitPerMinute || this.DEFAULT_RATE_LIMIT,
        personalizationData: options.personalizationData,
        language: options.language || "en",
        timezone: options.timezone,
        createdBy,
      },
    });

    // Create individual email logs for each contact
    const emailLogs = await Promise.all(
      contacts.map((contact) => {
        const personalizationData = {
          ...options.personalizationData,
          contactName: `${contact.firstName} ${contact.lastName}`,
          companyName: contact.shippingLine.name,
        };

        return prisma.emailLog.create({
          data: {
            companyId,
            toEmail: contact.email,
            fromEmail: "", // Will be set from company settings
            subject: options.subject,
            bodyHtml: options.bodyHtml,
            bodyText: options.bodyText,
            templateId: options.templateId,
            contactId: contact.id,
            emailType: EmailType.BULK_EMAIL,
            priority: options.priority || EmailPriority.NORMAL,
            personalizationData,
            trackingPixelId: uuidv4(),
            unsubscribeToken: uuidv4(),
            language: options.language || "en",
            timezone: options.timezone,
            scheduledFor: options.scheduledFor,
            isBulkEmail: true,
            bulkEmailId: bulkEmail.id,
            status: options.scheduledFor
              ? EmailStatus.QUEUED
              : EmailStatus.QUEUED,
          },
        });
      })
    );

    return {
      bulkEmail,
      emailLogs: emailLogs.length,
      contacts: contacts.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        shippingLine: c.shippingLine.name,
      })),
    };
  }

  /**
   * Send bulk email immediately
   */
  async sendBulkEmail(bulkEmailId: string, companyId: string) {
    const bulkEmail = await prisma.bulkEmail.findFirst({
      where: { id: bulkEmailId, companyId },
    });

    if (!bulkEmail) {
      throw new ValidationError("Bulk email not found");
    }

    if (
      bulkEmail.status !== BulkEmailStatus.DRAFT &&
      bulkEmail.status !== BulkEmailStatus.SCHEDULED
    ) {
      throw new ValidationError("Bulk email cannot be sent in current status");
    }

    // Update bulk email status
    await prisma.bulkEmail.update({
      where: { id: bulkEmailId },
      data: {
        status: BulkEmailStatus.SENDING,
        startedAt: new Date(),
      },
    });

    // Get email logs for this bulk email
    const emailLogs = await prisma.emailLog.findMany({
      where: {
        bulkEmailId,
        companyId,
        status: EmailStatus.QUEUED,
      },
    });

    // Process emails with rate limiting
    await this.processBulkEmailQueue(emailLogs, bulkEmail.rateLimitPerMinute);

    return bulkEmail;
  }

  /**
   * Process bulk email queue with rate limiting
   */
  private async processBulkEmailQueue(
    emailLogs: any[],
    rateLimitPerMinute: number
  ) {
    const batchSize = Math.ceil(rateLimitPerMinute / 60); // emails per second
    const delay = 1000 / batchSize; // milliseconds between emails

    for (let i = 0; i < emailLogs.length; i += batchSize) {
      const batch = emailLogs.slice(i, i + batchSize);

      // Process batch in parallel
      await Promise.all(
        batch.map((emailLog) => this.processEmailQueue([emailLog.id]))
      );

      // Wait before next batch
      if (i + batchSize < emailLogs.length) {
        await new Promise((resolve) => setTimeout(resolve, delay * batchSize));
      }
    }
  }

  /**
   * Process email queue (send emails)
   */
  async processEmailQueue(emailLogIds: string[]) {
    const emailLogs = await prisma.emailLog.findMany({
      where: {
        id: { in: emailLogIds },
        status: EmailStatus.QUEUED,
      },
      include: {
        contact: true,
        rfq: true,
        template: true,
        company: true,
      },
    });

    for (const emailLog of emailLogs) {
      try {
        // Update status to sending
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: EmailStatus.SENT,
            sentAt: new Date(),
          },
        });

        // Here you would integrate with your email provider (SendGrid, AWS SES, etc.)
        // For now, we'll simulate sending
        await this.sendEmailViaProvider(emailLog);

        // Update status to delivered
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: EmailStatus.DELIVERED,
            deliveredAt: new Date(),
          },
        });

        // Update bulk email counters if applicable
        if (emailLog.bulkEmailId) {
          await this.updateBulkEmailCounters(emailLog.bulkEmailId, "sent");
        }
      } catch (error) {
        console.error(`Failed to send email ${emailLog.id}:`, error);

        // Update status to failed
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: EmailStatus.FAILED,
            failedAt: new Date(),
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            retryCount: emailLog.retryCount + 1,
            nextRetryAt: this.calculateNextRetry(emailLog.retryCount + 1),
          },
        });

        // Update bulk email counters if applicable
        if (emailLog.bulkEmailId) {
          await this.updateBulkEmailCounters(emailLog.bulkEmailId, "failed");
        }
      }
    }
  }

  /**
   * Send email via email provider (placeholder)
   */
  private async sendEmailViaProvider(emailLog: any) {
    // This is where you would integrate with your email provider
    // Examples: SendGrid, AWS SES, Mailgun, etc.

    // For now, we'll simulate sending
    console.log(`Sending email to ${emailLog.toEmail}: ${emailLog.subject}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate occasional failures for testing
    if (Math.random() < 0.05) {
      // 5% failure rate
      throw new Error("Simulated email provider failure");
    }
  }

  /**
   * Update bulk email counters
   */
  private async updateBulkEmailCounters(
    bulkEmailId: string,
    action: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed"
  ) {
    const updateData: any = {};

    switch (action) {
      case "sent":
        updateData.sentCount = { increment: 1 };
        break;
      case "delivered":
        updateData.deliveredCount = { increment: 1 };
        break;
      case "opened":
        updateData.openedCount = { increment: 1 };
        break;
      case "clicked":
        updateData.clickedCount = { increment: 1 };
        break;
      case "bounced":
        updateData.bouncedCount = { increment: 1 };
        break;
      case "failed":
        updateData.failedCount = { increment: 1 };
        break;
    }

    await prisma.bulkEmail.update({
      where: { id: bulkEmailId },
      data: updateData,
    });
  }

  /**
   * Calculate next retry time
   */
  private calculateNextRetry(retryCount: number): Date {
    if (retryCount > this.MAX_RETRIES) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    const delayMinutes = this.RETRY_DELAYS[retryCount - 1] || 60;
    return new Date(Date.now() + delayMinutes * 60 * 1000);
  }

  /**
   * Track email engagement (open, click, etc.)
   */
  async trackEmailEngagement(
    trackingPixelId: string,
    engagementType: "OPEN" | "CLICK",
    additionalData?: {
      userAgent?: string;
      ipAddress?: string;
      location?: string;
      device?: string;
      browser?: string;
      os?: string;
      linkUrl?: string;
      linkText?: string;
    }
  ) {
    const emailLog = await prisma.emailLog.findFirst({
      where: { trackingPixelId },
    });

    if (!emailLog) {
      throw new ValidationError("Email not found");
    }

    // Create engagement record
    await prisma.emailEngagement.create({
      data: {
        emailLogId: emailLog.id,
        engagementType: engagementType as any,
        userAgent: additionalData?.userAgent,
        ipAddress: additionalData?.ipAddress,
        location: additionalData?.location,
        device: additionalData?.device,
        browser: additionalData?.browser,
        os: additionalData?.os,
        linkUrl: additionalData?.linkUrl,
        linkText: additionalData?.linkText,
      },
    });

    // Update email log status
    const updateData: any = {};
    if (engagementType === "OPEN" && !emailLog.openedAt) {
      updateData.openedAt = new Date();
      updateData.status = EmailStatus.OPENED;
    } else if (engagementType === "CLICK" && !emailLog.clickedAt) {
      updateData.clickedAt = new Date();
      updateData.status = EmailStatus.CLICKED;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: updateData,
      });

      // Update bulk email counters if applicable
      if (emailLog.bulkEmailId) {
        await this.updateBulkEmailCounters(
          emailLog.bulkEmailId,
          engagementType.toLowerCase() as any
        );
      }
    }
  }

  /**
   * Handle email bounce
   */
  async handleEmailBounce(
    emailLogId: string,
    bounceType: "HARD" | "SOFT" | "SPAM" | "BLOCKED" | "INVALID",
    bounceReason?: string,
    bounceCode?: string
  ) {
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
    });

    if (!emailLog) {
      throw new ValidationError("Email not found");
    }

    // Create bounce record
    await prisma.emailBounce.create({
      data: {
        emailLogId,
        bounceType: bounceType as any,
        bounceReason,
        bounceCode,
        isPermanent: bounceType === "HARD" || bounceType === "INVALID",
      },
    });

    // Update email log
    await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        status: EmailStatus.BOUNCED,
        bouncedAt: new Date(),
      },
    });

    // Update bulk email counters if applicable
    if (emailLog.bulkEmailId) {
      await this.updateBulkEmailCounters(emailLog.bulkEmailId, "bounced");
    }

    // If permanent bounce, mark contact as do not contact
    if (bounceType === "HARD" || bounceType === "INVALID") {
      await prisma.contact.update({
        where: { id: emailLog.contactId! },
        data: { doNotContact: true },
      });
    }
  }

  /**
   * Handle unsubscribe
   */
  async handleUnsubscribe(unsubscribeToken: string, reason?: string) {
    const emailLog = await prisma.emailLog.findFirst({
      where: { unsubscribeToken },
    });

    if (!emailLog) {
      throw new ValidationError("Invalid unsubscribe token");
    }

    // Create unsubscribe record
    await prisma.emailUnsubscribe.create({
      data: {
        companyId: emailLog.companyId,
        email: emailLog.toEmail,
        unsubscribeToken,
        reason,
      },
    });

    // Mark contact as do not contact
    if (emailLog.contactId) {
      await prisma.contact.update({
        where: { id: emailLog.contactId },
        data: { doNotContact: true },
      });
    }

    return { success: true, message: "Successfully unsubscribed" };
  }

  /**
   * Get email analytics
   */
  async getEmailAnalytics(
    companyId: string,
    options: {
      dateFrom?: Date;
      dateTo?: Date;
      emailType?: EmailType;
      bulkEmailId?: string;
      campaignId?: string;
    } = {}
  ) {
    const where: any = { companyId };

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    if (options.emailType) where.emailType = options.emailType;
    if (options.bulkEmailId) where.bulkEmailId = options.bulkEmailId;
    if (options.campaignId) where.campaignId = options.campaignId;

    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      failedEmails,
    ] = await Promise.all([
      prisma.emailLog.count({ where }),
      prisma.emailLog.count({ where: { ...where, status: EmailStatus.SENT } }),
      prisma.emailLog.count({
        where: { ...where, status: EmailStatus.DELIVERED },
      }),
      prisma.emailLog.count({
        where: { ...where, status: EmailStatus.OPENED },
      }),
      prisma.emailLog.count({
        where: { ...where, status: EmailStatus.CLICKED },
      }),
      prisma.emailLog.count({
        where: { ...where, status: EmailStatus.BOUNCED },
      }),
      prisma.emailLog.count({
        where: { ...where, status: EmailStatus.FAILED },
      }),
    ]);

    const deliveryRate =
      sentEmails > 0 ? (deliveredEmails / sentEmails) * 100 : 0;
    const openRate =
      deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0;
    const clickRate =
      deliveredEmails > 0 ? (clickedEmails / deliveredEmails) * 100 : 0;
    const bounceRate = sentEmails > 0 ? (bouncedEmails / sentEmails) * 100 : 0;

    return {
      totalEmails,
      sentEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      failedEmails,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
    };
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(companyId: string, emailLogIds?: string[]) {
    const where: any = {
      companyId,
      status: EmailStatus.FAILED,
      retryCount: { lt: this.MAX_RETRIES },
      nextRetryAt: { lte: new Date() },
    };

    if (emailLogIds) {
      where.id = { in: emailLogIds };
    }

    const failedEmails = await prisma.emailLog.findMany({
      where,
    });

    if (failedEmails.length === 0) {
      return { message: "No emails to retry", count: 0 };
    }

    // Reset status to queued for retry
    await prisma.emailLog.updateMany({
      where: { id: { in: failedEmails.map((e) => e.id) } },
      data: {
        status: EmailStatus.QUEUED,
        nextRetryAt: null,
      },
    });

    // Process the retry queue
    await this.processEmailQueue(failedEmails.map((e) => e.id));

    return {
      message: `Retrying ${failedEmails.length} emails`,
      count: failedEmails.length,
    };
  }
}

