import { Job, Worker, Processor } from "bullmq";
import { redisConnection } from "../../config/redis";
import logger from "../../utils/logger";
import { EmailService } from "../services/EmailService";
import { AppError } from "../../utils/errors";

export interface EmailJobData {
  to: string | string[];
  subject: string;
  template: string;
  context?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

export interface WelcomeEmailData extends EmailJobData {
  template: "welcome";
  context: {
    firstName: string;
    lastName: string;
    companyName: string;
    loginUrl: string;
  };
}

export interface PasswordResetEmailData extends EmailJobData {
  template: "password-reset";
  context: {
    firstName: string;
    lastName: string;
    resetUrl: string;
    expiryHours: number;
  };
}

export interface SubscriptionAlertEmailData extends EmailJobData {
  template: "subscription-alert";
  context: {
    companyName: string;
    planName: string;
    expiryDate?: string;
    renewalDate?: string;
    alertType:
      | "trial-expiring"
      | "trial-expired"
      | "payment-failed"
      | "subscription-activated";
  };
}

export interface RFQNotificationEmailData extends EmailJobData {
  template: "rfq-notification";
  context: {
    firstName: string;
    rfqId: string;
    rfqTitle: string;
    submittedBy: string;
    dueDate: string;
    rfqUrl: string;
  };
}

export type EmailJobType =
  | "send-welcome-email"
  | "send-password-reset"
  | "send-subscription-alert"
  | "send-rfq-notification"
  | "send-bulk-emails";

export class EmailJobProcessor {
  runAllJobs() {
    throw new Error("Method not implemented.");
  }
  cleanupOldEmailLogs() {
    throw new Error("Method not implemented.");
  }
  updateBulkEmailStatuses() {
    throw new Error("Method not implemented.");
  }
  retryFailedEmails() {
    throw new Error("Method not implemented.");
  }
  processScheduledFollowUps() {
    throw new Error("Method not implemented.");
  }
  processEmailQueue() {
    throw new Error("Method not implemented.");
  }
  private worker: Worker;
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
    this.worker = this.createWorker();
  }

  private createWorker(): Worker {
    return new Worker("email-queue", this.processJob.bind(this), {
      connection: redisConnection,
      concurrency: 5, // Process 5 emails concurrently
      removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
      removeOnFail: { count: 100 }, // Keep last 100 failed jobs
    });
  }

  /**
   * Process email jobs from the queue
   */
  private async processJob(job: Job): Promise<void> {
    const { type, data } = job.data as {
      type: EmailJobType;
      data: EmailJobData;
    };

    logger.info(`Processing email job: ${job.id} of type: ${type}`);

    try {
      switch (type) {
        case "send-welcome-email":
          await this.processWelcomeEmail(data as WelcomeEmailData);
          break;

        case "send-password-reset":
          await this.processPasswordResetEmail(data as PasswordResetEmailData);
          break;

        case "send-subscription-alert":
          await this.processSubscriptionAlertEmail(
            data as SubscriptionAlertEmailData
          );
          break;

        case "send-rfq-notification":
          await this.processRFQNotificationEmail(
            data as RFQNotificationEmailData
          );
          break;

        case "send-bulk-emails":
          await this.processBulkEmails(data);
          break;

        default:
          throw new AppError(`Unknown email job type: ${type}`, 400);
      }

      logger.info(`Email job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Email job ${job.id} failed:`, error);

      // Retry logic for transient failures
      if (this.shouldRetry(error)) {
        throw error; // BullMQ will handle retry
      }

      // For permanent failures, we don't throw so the job is marked as failed
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message ?? String(error)
          : String(error);

      throw new AppError(
        `Permanent failure in email job: ${errorMessage}`,
        500
      );
    }
  }

  /**
   * Process welcome email for new users
   */
  private async processWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const { to, context } = data;

    await this.emailService.sendTemplateEmail({
      to,
      subject: `Welcome to ${context.companyName}!`,
      template: "welcome",
      context,
    });

    logger.info(
      `Welcome email sent to: ${Array.isArray(to) ? to.join(", ") : to}`
    );
  }

  /**
   * Process password reset email
   */
  private async processPasswordResetEmail(
    data: PasswordResetEmailData
  ): Promise<void> {
    const { to, context } = data;

    await this.emailService.sendTemplateEmail({
      to,
      subject: "Password Reset Request",
      template: "password-reset",
      context: {
        firstName: context.firstName,
        lastName: context.lastName,
        companyName: "", // Default or fetch company name if available
        loginUrl: "",    // Default or fetch login URL if available
      },
    });

    logger.info(
      `Password reset email sent to: ${Array.isArray(to) ? to.join(", ") : to}`
    );
  }

  /**
   * Process subscription alert emails
   */
  private async processSubscriptionAlertEmail(
    data: SubscriptionAlertEmailData
  ): Promise<void> {
    const { to, context } = data;

    let subject: string;
    switch (context.alertType) {
      case "trial-expiring":
        subject = `Your ${context.planName} Trial is Expiring Soon`;
        break;
      case "trial-expired":
        subject = `Your ${context.planName} Trial Has Expired`;
        break;
      case "payment-failed":
        subject = "Payment Failed - Action Required";
        break;
      case "subscription-activated":
        subject = `Your ${context.planName} Subscription is Active`;
        break;
      default:
        subject = "Subscription Update";
    }

    await this.emailService.sendTemplateEmail({
      to,
      subject,
      template: "subscription-alert",
      context: {
        firstName: "", // Default or fetch first name if available
        lastName: "",  // Default or fetch last name if available
        companyName: context.companyName,
        loginUrl: "",  // Default or fetch login URL if available
      },
    });

    logger.info(
      `Subscription alert email sent to: ${
        Array.isArray(to) ? to.join(", ") : to
      }`
    );
  }

  /**
   * Process RFQ notification emails
   */
  private async processRFQNotificationEmail(
    data: RFQNotificationEmailData
  ): Promise<void> {
    const { to, context } = data;

    await this.emailService.sendTemplateEmail({
      to,
      subject: `New RFQ: ${context.rfqTitle}`,
      template: "rfq-notification",
      context: {
        firstName: context.firstName,
        lastName: "", // Default or fetch last name if available
        companyName: "", // Default or fetch company name if available
        loginUrl: context.rfqUrl,
      },
    });

    logger.info(
      `RFQ notification email sent to: ${
        Array.isArray(to) ? to.join(", ") : to
      }`
    );
  }

  /**
   * Process bulk emails to multiple recipients
   */
  private async processBulkEmails(data: EmailJobData): Promise<void> {
    const { to, subject, template, context, attachments } = data;

    if (!Array.isArray(to)) {
      throw new AppError("Bulk emails require an array of recipients", 400);
    }

    // Process emails in batches to avoid overwhelming the email service
    const batchSize = 10;
    for (let i = 0; i < to.length; i += batchSize) {
      const batch = to.slice(i, i + batchSize);

      await Promise.all(
        batch.map((recipient) =>
          this.emailService.sendTemplateEmail({
            to: recipient,
            subject,
            template,
            context: {
              firstName: (context && context.firstName) || "",
              lastName: (context && context.lastName) || "",
              companyName: (context && context.companyName) || "",
              loginUrl: (context && context.loginUrl) || "",
            },
          })
        )
      );

      logger.info(
        `Sent bulk emails to batch ${i / batchSize + 1}: ${
          batch.length
        } recipients`
      );

      // Small delay between batches to be respectful to the email service
      if (i + batchSize < to.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    logger.info(
      `Bulk email campaign completed. Total recipients: ${to.length}`
    );
  }

  /**
   * Determine if a job should be retried based on the error
   */
  private shouldRetry(error: any): boolean {
    // Retry on network issues, timeouts, and rate limits
    if (
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNRESET" ||
      error.code === "ESOCKETTIMEDOUT" ||
      error.statusCode === 429
    ) {
      // Rate limit
      return true;
    }

    // Don't retry on validation errors or bad requests
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }

    // Retry on server errors
    return error.statusCode >= 500;
  }

  /**
   * Start the email job processor
   */
  async start(): Promise<void> {
    this.worker.on("completed", (job) => {
      logger.info(`Email job ${job.id} completed successfully`);
    });

    this.worker.on("failed", (job, err) => {
      logger.error(`Email job ${job?.id} failed:`, err);
    });

    this.worker.on("error", (err) => {
      logger.error("Email worker error:", err);
    });

    logger.info("Email job processor started");
  }

  /**
   * Gracefully shutdown the email job processor
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down email job processor...");
    await this.worker.close();
    logger.info("Email job processor shutdown complete");
  }

  /**
   * Get worker status and metrics
   */
  getWorkerStatus(): {
    isRunning: boolean;
    concurrency: number;
  } {
    return {
      isRunning: this.worker.isRunning(),
      concurrency: this.worker.opts.concurrency || 5,
    };
  }
}

// Export a singleton instance
export const emailJobProcessor = new EmailJobProcessor();
