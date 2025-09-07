import cron from "node-cron";
import { EmailJobProcessor } from "./EmailJobProcessor";

export class EmailScheduler {
  private jobProcessor = new EmailJobProcessor();
  private isRunning = false;

  /**
   * Start the email scheduler
   */
  start() {
    if (this.isRunning) {
      console.log("Email scheduler is already running");
      return;
    }

    console.log("Starting email scheduler...");

    // Process email queue every minute
    cron.schedule("* * * * *", async () => {
      try {
        await this.jobProcessor.processEmailQueue();
      } catch (error) {
        console.error("Error in email queue processing:", error);
      }
    });

    // Process scheduled follow-ups every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
      try {
        await this.jobProcessor.processScheduledFollowUps();
      } catch (error) {
        console.error("Error in follow-up processing:", error);
      }
    });

    // Retry failed emails every 10 minutes
    cron.schedule("*/10 * * * *", async () => {
      try {
        await this.jobProcessor.retryFailedEmails();
      } catch (error) {
        console.error("Error in email retry processing:", error);
      }
    });

    // Update bulk email statuses every 2 minutes
    cron.schedule("*/2 * * * *", async () => {
      try {
        await this.jobProcessor.updateBulkEmailStatuses();
      } catch (error) {
        console.error("Error in bulk email status update:", error);
      }
    });

    // Clean up old email logs daily at 2 AM
    cron.schedule("0 2 * * *", async () => {
      try {
        await this.jobProcessor.cleanupOldEmailLogs();
      } catch (error) {
        console.error("Error in email log cleanup:", error);
      }
    });

    this.isRunning = true;
    console.log("Email scheduler started successfully");
  }

  /**
   * Stop the email scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log("Email scheduler is not running");
      return;
    }

    cron.destroy();
    this.isRunning = false;
    console.log("Email scheduler stopped");
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: [
        {
          name: "Email Queue Processing",
          schedule: "Every minute",
          description: "Processes queued emails and sends them",
        },
        {
          name: "Follow-up Processing",
          schedule: "Every 5 minutes",
          description: "Processes scheduled follow-up emails",
        },
        {
          name: "Failed Email Retry",
          schedule: "Every 10 minutes",
          description: "Retries failed emails based on retry policy",
        },
        {
          name: "Bulk Email Status Update",
          schedule: "Every 2 minutes",
          description: "Updates bulk email completion status",
        },
        {
          name: "Email Log Cleanup",
          schedule: "Daily at 2 AM",
          description: "Cleans up old email logs for maintenance",
        },
      ],
    };
  }

  /**
   * Run all jobs manually (for testing or manual execution)
   */
  async runAllJobs() {
    console.log("Running all email jobs manually...");
    await this.jobProcessor.runAllJobs();
  }
}

