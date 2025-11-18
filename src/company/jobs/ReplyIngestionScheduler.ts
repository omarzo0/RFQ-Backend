import * as cron from "node-cron";
import { ReplyIngestionJobProcessor } from "./ReplyIngestionJobProcessor";
import logger from "../../utils/logger";

export class ReplyIngestionScheduler {
  private jobProcessor: ReplyIngestionJobProcessor;
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.jobProcessor = new ReplyIngestionJobProcessor();
  }

  /**
   * Start all scheduled jobs
   */
  start(): void {
    logger.info("Starting Reply Ingestion Scheduler");

    // Process IMAP configurations every 5 minutes
    this.scheduleTask("process-imap", "*/5 * * * *", () => {
      this.jobProcessor.processIMAPConfigurations();
    });

    // Retry failed email replies every 15 minutes
    this.scheduleTask("retry-failed", "*/15 * * * *", () => {
      this.jobProcessor.retryFailedEmailReplies();
    });

    // Update parsing learning data every hour
    this.scheduleTask("update-learning", "0 * * * *", () => {
      this.jobProcessor.updateParsingLearningData();
    });

    // Cleanup old email replies daily at 2 AM
    this.scheduleTask("cleanup-old", "0 2 * * *", () => {
      this.jobProcessor.cleanupOldEmailReplies();
    });

    logger.info("Reply Ingestion Scheduler started successfully");
  }

  /**
   * Stop all scheduled jobs
   */
  stop(): void {
    logger.info("Stopping Reply Ingestion Scheduler");

    for (const [name, task] of this.tasks) {
      task.stop();
      logger.info(`Stopped scheduled task: ${name}`);
    }

    this.tasks.clear();
    logger.info("Reply Ingestion Scheduler stopped");
  }

  /**
   * Schedule a task
   */
  private scheduleTask(
    name: string,
    cronExpression: string,
    task: () => void
  ): void {
    if (this.tasks.has(name)) {
      logger.warn(`Task ${name} is already scheduled`);
      return;
    }

    const scheduledTask = cron.schedule(cronExpression, task, {
      timezone: "UTC",
    });

    this.tasks.set(name, scheduledTask);
    scheduledTask.start();

    logger.info(`Scheduled task ${name} with expression: ${cronExpression}`);
  }

  /**
   * Get status of all scheduled tasks
   */
  getStatus(): { [key: string]: { scheduled: boolean; running: boolean } } {
    const status: { [key: string]: { scheduled: boolean; running: boolean } } =
      {};

    for (const [name, task] of this.tasks) {
      status[name] = {
        scheduled: task.getStatus() === "scheduled",
        running: task.getStatus() === "running",
      };
    }

    return status;
  }

  /**
   * Manually trigger a specific job
   */
  async triggerJob(jobName: string): Promise<void> {
    switch (jobName) {
      case "process-imap":
        await this.jobProcessor.processIMAPConfigurations();
        break;
      case "retry-failed":
        await this.jobProcessor.retryFailedEmailReplies();
        break;
      case "update-learning":
        await this.jobProcessor.updateParsingLearningData();
        break;
      case "cleanup-old":
        await this.jobProcessor.cleanupOldEmailReplies();
        break;
      case "all":
        await this.jobProcessor.runAllJobs();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}
