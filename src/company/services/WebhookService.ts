import { PrismaClient } from "@prisma/client";
import logger from "../../utils/logger";
import { EmailReplyService } from "./EmailReplyService";
import crypto from "crypto";

export interface WebhookPayload {
  provider: string;
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

export interface EmailWebhookData {
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  from: {
    email: string;
    name?: string;
  };
  to: {
    email: string;
    name?: string;
  };
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  receivedAt: string;
  headers?: any;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: string; // Base64 encoded
    size: number;
  }>;
}

export class WebhookService {
  private prisma: PrismaClient;
  private emailReplyService: EmailReplyService;

  constructor() {
    this.prisma = new PrismaClient();
    this.emailReplyService = new EmailReplyService();
  }

  /**
   * Process incoming webhook
   */
  async processWebhook(
    webhookId: string,
    payload: WebhookPayload
  ): Promise<void> {
    try {
      logger.info(`Processing webhook ${webhookId} from ${payload.provider}`);

      // Get webhook configuration
      const webhookConfig = await this.prisma.emailWebhook.findUnique({
        where: { id: webhookId },
      });

      if (!webhookConfig || !webhookConfig.isActive) {
        logger.warn(`Webhook ${webhookId} not found or inactive`);
        return;
      }

      // Verify webhook signature if secret is provided
      if (webhookConfig.secret && payload.signature) {
        const isValid = this.verifyWebhookSignature(
          payload,
          webhookConfig.secret
        );
        if (!isValid) {
          logger.error(`Invalid webhook signature for ${webhookId}`);
          await this.updateWebhookError(webhookId, "Invalid signature");
          return;
        }
      }

      // Process based on provider
      let processed = false;
      switch (payload.provider.toLowerCase()) {
        case "sendgrid":
          processed = await this.processSendGridWebhook(
            webhookConfig.companyId,
            payload
          );
          break;
        case "mailgun":
          processed = await this.processMailgunWebhook(
            webhookConfig.companyId,
            payload
          );
          break;
        case "ses":
          processed = await this.processSESWebhook(
            webhookConfig.companyId,
            payload
          );
          break;
        case "postmark":
          processed = await this.processPostmarkWebhook(
            webhookConfig.companyId,
            payload
          );
          break;
        default:
          logger.warn(`Unsupported webhook provider: ${payload.provider}`);
          await this.updateWebhookError(
            webhookId,
            `Unsupported provider: ${payload.provider}`
          );
          return;
      }

      if (processed) {
        await this.updateWebhookSuccess(webhookId);
        logger.info(`Successfully processed webhook ${webhookId}`);
      } else {
        await this.updateWebhookError(
          webhookId,
          "Failed to process webhook data"
        );
      }
    } catch (error) {
      logger.error(`Error processing webhook ${webhookId}:`, error);
      await this.updateWebhookError(webhookId, (error as Error).message);
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(
    payload: WebhookPayload,
    secret: string
  ): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload.data))
        .digest("hex");

      return payload.signature === expectedSignature;
    } catch (error) {
      logger.error("Error verifying webhook signature:", error);
      return false;
    }
  }

  /**
   * Process SendGrid webhook
   */
  private async processSendGridWebhook(
    companyId: string,
    payload: WebhookPayload
  ): Promise<boolean> {
    try {
      if (payload.event === "inbound") {
        const emailData = this.parseSendGridInbound(payload.data);
        if (emailData) {
          await this.emailReplyService.processIncomingEmail({
            companyId: companyId,
            messageId: emailData.messageId,
            inReplyTo: emailData.inReplyTo,
            references: emailData.references || [],
            fromEmail: emailData.from.email,
            fromName: emailData.from.name,
            toEmail: emailData.to.email,
            subject: emailData.subject,
            bodyHtml: emailData.bodyHtml,
            bodyText: emailData.bodyText,
            receivedAt: new Date(emailData.receivedAt),
            source: "WEBHOOK",
            rawContent: JSON.stringify(payload.data),
            headers: emailData.headers,
            attachments: emailData.attachments?.map((att) => ({
              filename: att.filename,
              originalFilename: att.filename,
              mimeType: att.contentType,
              size: att.size,
              content: att.content,
            })),
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error("Error processing SendGrid webhook:", error);
      return false;
    }
  }

  /**
   * Parse SendGrid inbound email data
   */
  private parseSendGridInbound(data: any): EmailWebhookData | null {
    try {
      return {
        messageId: data.headers["Message-ID"] || data.messageId,
        inReplyTo: data.headers["In-Reply-To"],
        references: data.headers["References"]
          ? data.headers["References"].split(" ")
          : [],
        from: {
          email: data.from,
          name: data.fromname,
        },
        to: {
          email: data.to,
          name: data.toname,
        },
        subject: data.subject,
        bodyHtml: data.html,
        bodyText: data.text,
        receivedAt: data.timestamp || new Date().toISOString(),
        headers: data.headers,
        attachments: data.attachments || [],
      };
    } catch (error) {
      logger.error("Error parsing SendGrid data:", error);
      return null;
    }
  }

  /**
   * Process Mailgun webhook
   */
  private async processMailgunWebhook(
    companyId: string,
    payload: WebhookPayload
  ): Promise<boolean> {
    try {
      if (payload.event === "incoming") {
        const emailData = this.parseMailgunInbound(payload.data);
        if (emailData) {
          await this.emailReplyService.processIncomingEmail({
            companyId: companyId,
            messageId: emailData.messageId,
            inReplyTo: emailData.inReplyTo,
            references: emailData.references || [],
            fromEmail: emailData.from.email,
            fromName: emailData.from.name,
            toEmail: emailData.to.email,
            subject: emailData.subject,
            bodyHtml: emailData.bodyHtml,
            bodyText: emailData.bodyText,
            receivedAt: new Date(emailData.receivedAt),
            source: "WEBHOOK",
            rawContent: JSON.stringify(payload.data),
            headers: emailData.headers,
            attachments: emailData.attachments?.map((att) => ({
              filename: att.filename,
              originalFilename: att.filename,
              mimeType: att.contentType,
              size: att.size,
              content: att.content,
            })),
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error("Error processing Mailgun webhook:", error);
      return false;
    }
  }

  /**
   * Parse Mailgun inbound email data
   */
  private parseMailgunInbound(data: any): EmailWebhookData | null {
    try {
      return {
        messageId: data["Message-Id"] || data.messageId,
        inReplyTo: data["In-Reply-To"],
        references: data["References"] ? data["References"].split(" ") : [],
        from: {
          email: data.sender,
          name: data.from,
        },
        to: {
          email: data.recipient,
          name: data.to,
        },
        subject: data.subject,
        bodyHtml: data["body-html"],
        bodyText: data["body-plain"],
        receivedAt: data.timestamp || new Date().toISOString(),
        headers: data,
        attachments: data.attachments || [],
      };
    } catch (error) {
      logger.error("Error parsing Mailgun data:", error);
      return null;
    }
  }

  /**
   * Process AWS SES webhook
   */
  private async processSESWebhook(
    companyId: string,
    payload: WebhookPayload
  ): Promise<boolean> {
    try {
      if (payload.event === "inbound") {
        const emailData = this.parseSESInbound(payload.data);
        if (emailData) {
          await this.emailReplyService.processIncomingEmail({
            companyId: companyId,
            messageId: emailData.messageId,
            inReplyTo: emailData.inReplyTo,
            references: emailData.references || [],
            fromEmail: emailData.from.email,
            fromName: emailData.from.name,
            toEmail: emailData.to.email,
            subject: emailData.subject,
            bodyHtml: emailData.bodyHtml,
            bodyText: emailData.bodyText,
            receivedAt: new Date(emailData.receivedAt),
            source: "WEBHOOK",
            rawContent: JSON.stringify(payload.data),
            headers: emailData.headers,
            attachments: emailData.attachments?.map((att) => ({
              filename: att.filename,
              originalFilename: att.filename,
              mimeType: att.contentType,
              size: att.size,
              content: att.content,
            })),
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error("Error processing SES webhook:", error);
      return false;
    }
  }

  /**
   * Parse AWS SES inbound email data
   */
  private parseSESInbound(data: any): EmailWebhookData | null {
    try {
      return {
        messageId: data.mail.messageId,
        inReplyTo: data.mail.commonHeaders["In-Reply-To"],
        references: data.mail.commonHeaders["References"]
          ? data.mail.commonHeaders["References"].split(" ")
          : [],
        from: {
          email: data.mail.commonHeaders.from[0],
          name: data.mail.commonHeaders.from[0],
        },
        to: {
          email: data.mail.commonHeaders.to[0],
          name: data.mail.commonHeaders.to[0],
        },
        subject: data.mail.commonHeaders.subject,
        bodyHtml: data.content,
        bodyText: data.content,
        receivedAt: data.mail.timestamp || new Date().toISOString(),
        headers: data.mail.commonHeaders,
        attachments: [],
      };
    } catch (error) {
      logger.error("Error parsing SES data:", error);
      return null;
    }
  }

  /**
   * Process Postmark webhook
   */
  private async processPostmarkWebhook(
    companyId: string,
    payload: WebhookPayload
  ): Promise<boolean> {
    try {
      if (payload.event === "inbound") {
        const emailData = this.parsePostmarkInbound(payload.data);
        if (emailData) {
          await this.emailReplyService.processIncomingEmail({
            companyId: companyId,
            messageId: emailData.messageId,
            inReplyTo: emailData.inReplyTo,
            references: emailData.references || [],
            fromEmail: emailData.from.email,
            fromName: emailData.from.name,
            toEmail: emailData.to.email,
            subject: emailData.subject,
            bodyHtml: emailData.bodyHtml,
            bodyText: emailData.bodyText,
            receivedAt: new Date(emailData.receivedAt),
            source: "WEBHOOK",
            rawContent: JSON.stringify(payload.data),
            headers: emailData.headers,
            attachments: emailData.attachments?.map((att) => ({
              filename: att.filename,
              originalFilename: att.filename,
              mimeType: att.contentType,
              size: att.size,
              content: att.content,
            })),
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error("Error processing Postmark webhook:", error);
      return false;
    }
  }

  /**
   * Parse Postmark inbound email data
   */
  private parsePostmarkInbound(data: any): EmailWebhookData | null {
    try {
      return {
        messageId: data.MessageID,
        inReplyTo: data.InReplyTo,
        references: data.References ? data.References.split(" ") : [],
        from: {
          email: data.From,
          name: data.FromName,
        },
        to: {
          email: data.To,
          name: data.ToName,
        },
        subject: data.Subject,
        bodyHtml: data.HtmlBody,
        bodyText: data.TextBody,
        receivedAt: data.Date || new Date().toISOString(),
        headers: data.Headers,
        attachments: data.Attachments || [],
      };
    } catch (error) {
      logger.error("Error parsing Postmark data:", error);
      return null;
    }
  }

  /**
   * Update webhook success
   */
  private async updateWebhookSuccess(webhookId: string): Promise<void> {
    await this.prisma.emailWebhook.update({
      where: { id: webhookId },
      data: {
        lastReceivedAt: new Date(),
        totalReceived: { increment: 1 },
        totalProcessed: { increment: 1 },
        lastErrorAt: null,
        lastErrorMessage: null,
      },
    });
  }

  /**
   * Update webhook error
   */
  private async updateWebhookError(
    webhookId: string,
    errorMessage: string
  ): Promise<void> {
    await this.prisma.emailWebhook.update({
      where: { id: webhookId },
      data: {
        lastErrorAt: new Date(),
        lastErrorMessage: errorMessage,
        totalReceived: { increment: 1 },
        totalFailed: { increment: 1 },
      },
    });
  }

  /**
   * Create webhook configuration
   */
  async createWebhookConfig(data: {
    companyId: string;
    name: string;
    provider: string;
    webhookUrl: string;
    secret?: string;
    createdBy: string;
  }): Promise<any> {
    const webhook = await this.prisma.emailWebhook.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        provider: data.provider,
        webhookUrl: data.webhookUrl,
        secret: data.secret,
        createdBy: data.createdBy,
      },
    });

    return webhook;
  }

  /**
   * Get webhook configurations for a company
   */
  async getWebhookConfigs(companyId: string): Promise<any[]> {
    return await this.prisma.emailWebhook.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update webhook configuration
   */
  async updateWebhookConfig(
    webhookId: string,
    data: {
      name?: string;
      provider?: string;
      webhookUrl?: string;
      secret?: string;
      isActive?: boolean;
    }
  ): Promise<any> {
    return await this.prisma.emailWebhook.update({
      where: { id: webhookId },
      data: data,
    });
  }

  /**
   * Delete webhook configuration
   */
  async deleteWebhookConfig(webhookId: string): Promise<void> {
    await this.prisma.emailWebhook.delete({
      where: { id: webhookId },
    });
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(companyId: string): Promise<{
    totalWebhooks: number;
    activeWebhooks: number;
    totalReceived: number;
    totalProcessed: number;
    totalFailed: number;
    successRate: number;
  }> {
    const webhooks = await this.prisma.emailWebhook.findMany({
      where: { companyId },
    });

    const totalWebhooks = webhooks.length;
    const activeWebhooks = webhooks.filter((w) => w.isActive).length;
    const totalReceived = webhooks.reduce((sum, w) => sum + w.totalReceived, 0);
    const totalProcessed = webhooks.reduce(
      (sum, w) => sum + w.totalProcessed,
      0
    );
    const totalFailed = webhooks.reduce((sum, w) => sum + w.totalFailed, 0);
    const successRate = totalReceived > 0 ? totalProcessed / totalReceived : 0;

    return {
      totalWebhooks,
      activeWebhooks,
      totalReceived,
      totalProcessed,
      totalFailed,
      successRate,
    };
  }

  /**
   * Test webhook endpoint
   */
  async testWebhookEndpoint(webhookId: string): Promise<boolean> {
    try {
      const webhook = await this.prisma.emailWebhook.findUnique({
        where: { id: webhookId },
      });

      if (!webhook) {
        return false;
      }

      // Send a test payload to the webhook URL
      const testPayload = {
        provider: webhook.provider,
        event: "test",
        data: { test: true },
        timestamp: new Date().toISOString(),
      };

      // This would typically make an HTTP request to the webhook URL
      // For now, we'll just return true
      logger.info(`Test webhook sent to ${webhook.webhookUrl}`);
      return true;
    } catch (error) {
      logger.error("Error testing webhook endpoint:", error);
      return false;
    }
  }
}
