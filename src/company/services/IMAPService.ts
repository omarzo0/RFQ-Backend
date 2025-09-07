import Imap from "imap";
import { simpleParser } from "mailparser";
import { PrismaClient } from "@prisma/client";
import logger from "../../utils/logger";
import { EmailReplyService } from "./EmailReplyService";

export interface IMAPConfig {
  id: string;
  companyId: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  folder: string;
  checkInterval: number;
  maxEmailsPerCheck: number;
}

export interface EmailMessage {
  messageId: string;
  inReplyTo?: string;
  references: string[];
  from: {
    address: string;
    name?: string;
  };
  to: {
    address: string;
    name?: string;
  };
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  receivedAt: Date;
  headers: any;
  attachments: Array<{
    filename: string;
    contentType: string;
    content: Buffer;
  }>;
}

export class IMAPService {
  private prisma: PrismaClient;
  private emailReplyService: EmailReplyService;
  private activeConnections: Map<string, Imap> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.emailReplyService = new EmailReplyService();
  }

  /**
   * Connect to IMAP server
   */
  private async connectToIMAP(config: IMAPConfig): Promise<Imap> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: config.username,
        password: config.password,
        host: config.host,
        port: config.port,
        tls: config.secure,
        tlsOptions: { rejectUnauthorized: false },
      });

      imap.once("ready", () => {
        logger.info(`IMAP connection established for ${config.name}`);
        resolve(imap);
      });

      imap.once("error", (err: Error) => {
        logger.error(`IMAP connection error for ${config.name}:`, err);
        reject(err);
      });

      imap.once("end", () => {
        logger.info(`IMAP connection ended for ${config.name}`);
        this.activeConnections.delete(config.id);
      });

      imap.connect();
    });
  }

  /**
   * Fetch emails from IMAP server
   */
  private async fetchEmails(
    imap: Imap,
    config: IMAPConfig
  ): Promise<EmailMessage[]> {
    return new Promise((resolve, reject) => {
      const emails: EmailMessage[] = [];

      imap.openBox(config.folder, false, (err: any, _box: any) => {
        if (err) {
          reject(err);
          return;
        }

        // Search for unseen emails
        imap.search(["UNSEEN"], (err: any, results: any) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            resolve(emails);
            return;
          }

          // Limit the number of emails to process
          const limitedResults = results.slice(0, config.maxEmailsPerCheck);

          const fetch = imap.fetch(limitedResults, {
            bodies: "",
            struct: true,
          });

          fetch.on("message", (msg: any, _seqno: any) => {
            let buffer = "";

            msg.on("body", (stream: any) => {
              stream.on("data", (chunk: any) => {
                buffer += chunk.toString("utf8");
              });
            });

            msg.once("end", () => {
              simpleParser(buffer, (err: any, parsed: any) => {
                if (err) {
                  logger.error("Error parsing email:", err);
                  return;
                }

                const emailMessage: EmailMessage = {
                  messageId: parsed.messageId || "",
                  inReplyTo: parsed.inReplyTo,
                  references: parsed.references || [],
                  from: {
                    address: parsed.from?.value[0]?.address || "",
                    name: parsed.from?.value[0]?.name,
                  },
                  to: {
                    address: parsed.to?.value[0]?.address || "",
                    name: parsed.to?.value[0]?.name,
                  },
                  subject: parsed.subject || "",
                  bodyHtml: parsed.html,
                  bodyText: parsed.text,
                  receivedAt: parsed.date || new Date(),
                  headers: parsed.headers,
                  attachments:
                    parsed.attachments?.map((att: any) => ({
                      filename: att.filename || "unknown",
                      contentType:
                        att.contentType || "application/octet-stream",
                      content: att.content,
                    })) || [],
                };

                emails.push(emailMessage);
              });
            });
          });

          fetch.once("error", (err: any) => {
            reject(err);
          });

          fetch.once("end", () => {
            resolve(emails);
          });
        });
      });
    });
  }

  /**
   * Mark emails as seen
   */
  private async markAsSeen(imap: Imap, messageIds: number[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (messageIds.length === 0) {
        resolve();
        return;
      }

      imap.addFlags(messageIds, "\\Seen", (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Process emails for a specific IMAP configuration
   */
  async processEmailsForConfig(configId: string): Promise<void> {
    try {
      const config = await this.prisma.iMAPConfiguration.findUnique({
        where: { id: configId },
      });

      if (!config || !config.isActive) {
        logger.warn(`IMAP config ${configId} not found or inactive`);
        return;
      }

      logger.info(`Processing emails for IMAP config: ${config.name}`);

      // Connect to IMAP
      const imap = await this.connectToIMAP(config);
      this.activeConnections.set(configId, imap);

      // Fetch emails
      const emails = await this.fetchEmails(imap, config);

      if (emails.length === 0) {
        logger.info(`No new emails found for ${config.name}`);
        await this.updateLastChecked(configId);
        imap.end();
        return;
      }

      logger.info(`Found ${emails.length} new emails for ${config.name}`);

      // Process each email
      for (const email of emails) {
        try {
          await this.emailReplyService.processIncomingEmail({
            companyId: config.companyId,
            messageId: email.messageId,
            inReplyTo: email.inReplyTo,
            references: email.references,
            fromEmail: email.from.address,
            fromName: email.from.name,
            toEmail: email.to.address,
            subject: email.subject,
            bodyHtml: email.bodyHtml,
            bodyText: email.bodyText,
            receivedAt: email.receivedAt,
            source: "IMAP",
            rawContent: JSON.stringify(email.headers),
            attachments: email.attachments.map((att) => ({
              filename: att.filename,
              originalFilename: att.filename,
              mimeType: att.contentType,
              size: att.content.length,
              content: att.content.toString("base64"),
            })),
          });
        } catch (error) {
          logger.error(`Error processing email ${email.messageId}:`, error);
        }
      }

      // Update last checked timestamp
      await this.updateLastChecked(configId);

      // Close connection
      imap.end();
    } catch (error) {
      logger.error(`Error processing emails for config ${configId}:`, error);
      await this.updateLastError(configId, (error as Error).message);
    }
  }

  /**
   * Process all active IMAP configurations
   */
  async processAllActiveConfigs(): Promise<void> {
    try {
      const configs = await this.prisma.iMAPConfiguration.findMany({
        where: {
          isActive: true,
        },
      });

      logger.info(`Processing ${configs.length} active IMAP configurations`);

      for (const config of configs) {
        // Check if it's time to process this config
        const shouldProcess = this.shouldProcessConfig(config);

        if (shouldProcess) {
          await this.processEmailsForConfig(config.id);
        }
      }
    } catch (error) {
      logger.error("Error processing IMAP configurations:", error);
    }
  }

  /**
   * Check if a configuration should be processed based on check interval
   */
  private shouldProcessConfig(config: {
    lastCheckedAt: Date | null;
    checkInterval: number;
  }): boolean {
    if (!config.lastCheckedAt) {
      return true;
    }

    const now = new Date();
    const lastChecked = new Date(config.lastCheckedAt);
    const intervalMs = config.checkInterval * 1000;

    return now.getTime() - lastChecked.getTime() >= intervalMs;
  }

  /**
   * Update last checked timestamp
   */
  private async updateLastChecked(configId: string): Promise<void> {
    await this.prisma.iMAPConfiguration.update({
      where: { id: configId },
      data: { lastCheckedAt: new Date() },
    });
  }

  /**
   * Update last error timestamp and message
   */
  private async updateLastError(
    configId: string,
    errorMessage: string
  ): Promise<void> {
    await this.prisma.iMAPConfiguration.update({
      where: { id: configId },
      data: {
        lastErrorAt: new Date(),
        lastErrorMessage: errorMessage,
      },
    });
  }

  /**
   * Test IMAP connection
   */
  async testConnection(
    config: Omit<IMAPConfig, "id" | "companyId">
  ): Promise<boolean> {
    try {
      const imap = await this.connectToIMAP({
        id: "test",
        companyId: "test",
        ...config,
      });

      imap.end();
      return true;
    } catch (error) {
      logger.error("IMAP connection test failed:", error);
      return false;
    }
  }

  /**
   * Get IMAP configuration by ID
   */
  async getIMAPConfig(configId: string): Promise<IMAPConfig | null> {
    const config = await this.prisma.iMAPConfiguration.findUnique({
      where: { id: configId },
    });

    if (!config) {
      return null;
    }

    return {
      id: config.id,
      companyId: config.companyId,
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password, // Note: This should be decrypted in production
      folder: config.folder,
      checkInterval: config.checkInterval,
      maxEmailsPerCheck: config.maxEmailsPerCheck,
    };
  }

  /**
   * Create new IMAP configuration
   */
  async createIMAPConfig(data: {
    companyId: string;
    name: string;
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    folder?: string;
    checkInterval?: number;
    maxEmailsPerCheck?: number;
    createdBy: string;
  }): Promise<IMAPConfig> {
    const config = await this.prisma.iMAPConfiguration.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        host: data.host,
        port: data.port,
        secure: data.secure,
        username: data.username,
        password: data.password, // Note: This should be encrypted in production
        folder: data.folder || "INBOX",
        checkInterval: data.checkInterval || 300,
        maxEmailsPerCheck: data.maxEmailsPerCheck || 50,
        createdBy: data.createdBy,
      },
    });

    return {
      id: config.id,
      companyId: config.companyId,
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password,
      folder: config.folder,
      checkInterval: config.checkInterval,
      maxEmailsPerCheck: config.maxEmailsPerCheck,
    };
  }

  /**
   * Update IMAP configuration
   */
  async updateIMAPConfig(
    configId: string,
    data: Partial<IMAPConfig>
  ): Promise<IMAPConfig | null> {
    const config = await this.prisma.iMAPConfiguration.update({
      where: { id: configId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.host && { host: data.host }),
        ...(data.port && { port: data.port }),
        ...(data.secure !== undefined && { secure: data.secure }),
        ...(data.username && { username: data.username }),
        ...(data.password && { password: data.password }),
        ...(data.folder && { folder: data.folder }),
        ...(data.checkInterval && { checkInterval: data.checkInterval }),
        ...(data.maxEmailsPerCheck && {
          maxEmailsPerCheck: data.maxEmailsPerCheck,
        }),
      },
    });

    return {
      id: config.id,
      companyId: config.companyId,
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password,
      folder: config.folder,
      checkInterval: config.checkInterval,
      maxEmailsPerCheck: config.maxEmailsPerCheck,
    };
  }

  /**
   * Delete IMAP configuration
   */
  async deleteIMAPConfig(configId: string): Promise<void> {
    await this.prisma.iMAPConfiguration.delete({
      where: { id: configId },
    });
  }

  /**
   * Get all IMAP configurations for a company
   */
  async getIMAPConfigs(companyId: string): Promise<IMAPConfig[]> {
    const configs = await this.prisma.iMAPConfiguration.findMany({
      where: { companyId },
    });

    return configs.map((config) => ({
      id: config.id,
      companyId: config.companyId,
      name: config.name,
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password,
      folder: config.folder,
      checkInterval: config.checkInterval,
      maxEmailsPerCheck: config.maxEmailsPerCheck,
    }));
  }

  /**
   * Close all active connections
   */
  async closeAllConnections(): Promise<void> {
    for (const [configId, imap] of this.activeConnections) {
      try {
        imap.end();
        logger.info(`Closed IMAP connection for config ${configId}`);
      } catch (error) {
        logger.error(
          `Error closing IMAP connection for config ${configId}:`,
          error
        );
      }
    }
    this.activeConnections.clear();
  }
}
