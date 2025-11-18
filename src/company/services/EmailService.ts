import { prisma } from "../../app";
import { ValidationError } from "../../utils/errors";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
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
  sendTemplateEmail(arg0: {
    to: string | string[];
    subject: string;
    template: string;
    context: {
      firstName: string;
      lastName: string;
      companyName: string;
      loginUrl: string;
    };
  }) {
    throw new Error("Method not implemented.");
  }
  private readonly DEFAULT_RATE_LIMIT = 10; // emails per minute
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [5, 15, 60]; // minutes
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize nodemailer transporter with Brevo SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true", // false for 587, true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Additional options for better reliability
      pool: true, // use pooled connection
      maxConnections: 5, // max simultaneous connections
      maxMessages: 100, // max messages per connection
    });

    // Test connection on initialization (optional)
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully with Brevo");
    } catch (error) {
      console.error("❌ SMTP connection failed:", error);
      console.error("Please check your Brevo SMTP configuration in .env file");
    }
  }

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
            fromEmail: process.env.EMAIL_FROM_ADDRESS || "noreply@company.com",
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
        // Send email first, then update status
        await this.sendEmailViaProvider(emailLog);

        // Update status to sent only after successful sending
        await prisma.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: EmailStatus.SENT,
            sentAt: new Date(),
          },
        });

        // Don't update to DELIVERED status here - wait for tracking pixel to be loaded
        // The status will be updated to OPENED when the tracking pixel is accessed

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
   * Embed tracking pixel in email HTML
   */
  private embedTrackingPixel(html: string, trackingPixelId: string): string {
    if (!html || !trackingPixelId) return html;

    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
    const trackingPixelUrl = `${baseUrl}/emails/track/${trackingPixelId}`;

    // Create tracking pixel HTML
    const trackingPixel = `
      <img src="${trackingPixelUrl}" 
           width="1" height="1" 
           style="display:none; width:1px; height:1px; border:0;" 
           alt="" 
           onload="this.style.display='none';" />
    `;

    // Try to find the closing body tag and insert before it
    const bodyCloseIndex = html.lastIndexOf("</body>");
    if (bodyCloseIndex !== -1) {
      return (
        html.slice(0, bodyCloseIndex) +
        trackingPixel +
        html.slice(bodyCloseIndex)
      );
    }

    // If no body tag found, append to the end
    return html + trackingPixel;
  }

  /**
   * Send email via Brevo SMTP
   */
  private async sendEmailViaProvider(emailLog: any) {
    try {
      // Embed tracking pixel in HTML if trackingPixelId exists
      let processedHtml = emailLog.bodyHtml;
      if (emailLog.trackingPixelId) {
        processedHtml = this.embedTrackingPixel(
          emailLog.bodyHtml,
          emailLog.trackingPixelId
        );
      }

      // Prepare email options
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "RFQ Platform",
          address:
            process.env.EMAIL_FROM_ADDRESS || "omarkhaled202080@gmail.com", // Must use verified Brevo sender
        },
        to: emailLog.toEmail, // This allows sending to ANY email address
        subject: emailLog.subject,
        html: processedHtml,
        text: emailLog.bodyText || this.htmlToText(processedHtml),
        // Optional: Reply-To can be different from From
        replyTo: emailLog.fromEmail || process.env.EMAIL_FROM_ADDRESS,
        // Add tracking headers if needed
        headers: {
          "X-Email-Log-Id": emailLog.id,
          "X-Company-Id": emailLog.companyId,
        },
      };

      // Send email via Brevo SMTP
      const result = await this.transporter.sendMail(mailOptions);

      console.log(
        `✅ Email sent successfully to ${emailLog.toEmail}: ${emailLog.subject}`
      );
      console.log(`📧 Message ID: ${result.messageId}`);

      return result;
    } catch (error) {
      console.error(`❌ Failed to send email to ${emailLog.toEmail}:`, error);
      throw error;
    }
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private htmlToText(html: string): string {
    if (!html) return "";

    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .trim();
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

    // Prevent tracking if email was sent too recently (less than 30 seconds ago)
    // This helps prevent automated scans from being counted as opens
    if (emailLog.sentAt) {
      const timeSinceSent = Date.now() - emailLog.sentAt.getTime();
      const minimumDelay = 30 * 1000; // 30 seconds

      if (timeSinceSent < minimumDelay) {
        console.log(
          `⚠️ Email tracking attempted too soon after sending (${timeSinceSent}ms). Ignoring.`
        );
        throw new ValidationError(
          "Email tracking attempted too soon after sending"
        );
      }
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
    // Validate emailLogId format
    if (!emailLogId || typeof emailLogId !== "string") {
      throw new ValidationError("Invalid emailLogId provided");
    }

    // Check if emailLogId is a valid UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(emailLogId)) {
      throw new ValidationError(
        "Invalid emailLogId format - must be a valid UUID"
      );
    }

    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailLogId },
    });

    if (!emailLog) {
      console.log(
        `❌ Email bounce handling failed: Email with ID ${emailLogId} not found`
      );
      throw new ValidationError(`Email with ID ${emailLogId} not found`);
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

    // Debug logging
    console.log(
      `📊 Email Analytics Query for Company ${companyId}:`,
      JSON.stringify(where, null, 2)
    );

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
      // Count emails that have been sent (SENT or higher status)
      prisma.emailLog.count({
        where: {
          ...where,
          status: {
            in: [
              EmailStatus.SENT,
              EmailStatus.DELIVERED,
              EmailStatus.OPENED,
              EmailStatus.CLICKED,
            ],
          },
        },
      }),
      // Count emails that have been delivered (DELIVERED or higher status)
      prisma.emailLog.count({
        where: {
          ...where,
          status: {
            in: [
              EmailStatus.DELIVERED,
              EmailStatus.OPENED,
              EmailStatus.CLICKED,
            ],
          },
        },
      }),
      // Count emails that have been opened (OPENED or higher status)
      prisma.emailLog.count({
        where: {
          ...where,
          status: {
            in: [EmailStatus.OPENED, EmailStatus.CLICKED],
          },
        },
      }),
      // Count emails that have been clicked
      prisma.emailLog.count({
        where: {
          ...where,
          status: EmailStatus.CLICKED,
        },
      }),
      // Count emails that bounced
      prisma.emailLog.count({
        where: {
          ...where,
          status: EmailStatus.BOUNCED,
        },
      }),
      // Count emails that failed
      prisma.emailLog.count({
        where: {
          ...where,
          status: EmailStatus.FAILED,
        },
      }),
    ]);

    // Calculate rates based on sent emails
    const deliveryRate =
      sentEmails > 0 ? (deliveredEmails / sentEmails) * 100 : 0;
    const openRate = sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0;
    const clickRate = sentEmails > 0 ? (clickedEmails / sentEmails) * 100 : 0;
    const bounceRate = sentEmails > 0 ? (bouncedEmails / sentEmails) * 100 : 0;

    const analytics = {
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

    // Debug logging
    console.log(
      `📊 Email Analytics Results:`,
      JSON.stringify(analytics, null, 2)
    );

    return analytics;
  }

  /**
   * Get email logs with pagination and filtering
   */
  async getEmailLogs(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      emailType?: EmailType;
      status?: string;
      dateFrom?: Date;
      dateTo?: Date;
      bulkEmailId?: string;
      campaignId?: string;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    // Add filters
    if (options.search) {
      where.OR = [
        { subject: { contains: options.search, mode: "insensitive" } },
        { toEmail: { contains: options.search, mode: "insensitive" } },
        { fromEmail: { contains: options.search, mode: "insensitive" } },
      ];
    }

    if (options.emailType) where.emailType = options.emailType;
    if (options.status) where.status = options.status;
    if (options.bulkEmailId) where.bulkEmailId = options.bulkEmailId;
    if (options.campaignId) where.campaignId = options.campaignId;

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    const [emailLogs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              shippingLine: {
                select: {
                  name: true,
                },
              },
            },
          },
          rfq: {
            select: {
              id: true,
              rfqNumber: true,
              title: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          bulkEmail: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.emailLog.count({ where }),
    ]);

    return {
      data: emailLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
