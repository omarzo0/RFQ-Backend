import cron from "node-cron";
import TrialNotificationJob from "../company/jobs/TrialNotificationJob";
import logger from "../utils/logger";

const trialNotificationJob = new TrialNotificationJob();

/**
 * Run trial notification checks daily at 9:00 AM
 * This will check for:
 * - Companies with trials ending in 3 days (send warning)
 * - Companies with expired trials (send notification and deactivate)
 */
cron.schedule(
  "0 9 * * *",
  async () => {
    try {
      logger.info("Starting daily trial notification check...");
      await trialNotificationJob.runAllChecks();
      logger.info("Daily trial notification check completed");
    } catch (error) {
      logger.error("Error in daily trial notification check:", error);
    }
  },
  {
    timezone: "UTC",
  }
);

/**
 * Run trial notification checks every 6 hours for more frequent monitoring
 * This ensures we catch expiring trials more quickly
 */
cron.schedule(
  "0 */6 * * *",
  async () => {
    try {
      logger.info("Starting 6-hour trial notification check...");
      await trialNotificationJob.runAllChecks();
      logger.info("6-hour trial notification check completed");
    } catch (error) {
      logger.error("Error in 6-hour trial notification check:", error);
    }
  },
  {
    timezone: "UTC",
  }
);

logger.info("Trial notification cron jobs scheduled");
