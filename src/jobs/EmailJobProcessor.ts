import { EmailService } from "../services/EmailService";
import { FollowUpService } from "../services/FollowUpService";
import { prisma } from "../app";

export class EmailJobProcessor {
  private emailService = new EmailService();
  private followUpService = new FollowUpService();

  /**
   * Process email queue - send queued emails
   */
  async processEmailQueue() {
    console.log("Processing email queue...");

    try {
      // Get queued emails that are ready to be sent
      const queuedEmails = await prisma.emailLog.findMany({
        where: {
          status: "QUEUED",
          OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }],
        },
        take: 100, // Process in batches
        orderBy: { queuedAt: "asc" },
      });

      if (queuedEmails.length === 0) {
        console.log("No emails to process");
        return;
      }

      console.log(`Processing ${queuedEmails.length} emails`);

      // Process emails in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < queuedEmails.length; i += batchSize) {
        const batch = queuedEmails.slice(i, i + batchSize);
        await this.emailService.processEmailQueue(batch.map((e) => e.id));

        // Small delay between batches
        if (i + batchSize < queuedEmails.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(`Processed ${queuedEmails.length} emails`);
    } catch (error) {
      console.error("Error processing email queue:", error);
    }
  }

  /**
   * Process scheduled follow-ups
   */
  async processScheduledFollowUps() {
    console.log("Processing scheduled follow-ups...");

    try {
      const result = await this.followUpService.processScheduledFollowUps();
      console.log(`Processed ${result.results.length} follow-ups`);
    } catch (error) {
      console.error("Error processing scheduled follow-ups:", error);
    }
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails() {
    console.log("Retrying failed emails...");

    try {
      const result = await this.emailService.retryFailedEmails();
      console.log(`Retried ${result.count} emails`);
    } catch (error) {
      console.error("Error retrying failed emails:", error);
    }
  }

  /**
   * Update bulk email statuses
   */
  async updateBulkEmailStatuses() {
    console.log("Updating bulk email statuses...");

    try {
      // Find bulk emails that are in SENDING status and check if all emails are processed
      const bulkEmails = await prisma.bulkEmail.findMany({
        where: {
          status: "SENDING",
        },
        include: {
          emailLogs: true,
        },
      });

      for (const bulkEmail of bulkEmails) {
        const totalEmails = bulkEmail.emailLogs.length;
        const sentEmails = bulkEmail.emailLogs.filter(
          (e) =>
            e.status === "SENT" ||
            e.status === "DELIVERED" ||
            e.status === "OPENED" ||
            e.status === "CLICKED"
        ).length;
        const failedEmails = bulkEmail.emailLogs.filter(
          (e) => e.status === "FAILED" || e.status === "BOUNCED"
        ).length;

        // If all emails are processed, mark as SENT
        if (sentEmails + failedEmails >= totalEmails) {
          await prisma.bulkEmail.update({
            where: { id: bulkEmail.id },
            data: {
              status: "SENT",
              completedAt: new Date(),
            },
          });
          console.log(`Bulk email ${bulkEmail.id} marked as completed`);
        }
      }
    } catch (error) {
      console.error("Error updating bulk email statuses:", error);
    }
  }

  /**
   * Clean up old email logs (optional - for maintenance)
   */
  async cleanupOldEmailLogs() {
    console.log("Cleaning up old email logs...");

    try {
      // Delete email logs older than 1 year
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

      const result = await prisma.emailLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: {
            in: ["DELIVERED", "OPENED", "CLICKED", "BOUNCED", "FAILED"],
          },
        },
      });

      console.log(`Cleaned up ${result.count} old email logs`);
    } catch (error) {
      console.error("Error cleaning up old email logs:", error);
    }
  }

  /**
   * Run all email processing jobs
   */
  async runAllJobs() {
    console.log("Starting email job processing...");

    try {
      await Promise.all([
        this.processEmailQueue(),
        this.processScheduledFollowUps(),
        this.retryFailedEmails(),
        this.updateBulkEmailStatuses(),
      ]);

      console.log("Email job processing completed");
    } catch (error) {
      console.error("Error in email job processing:", error);
    }
  }
}

