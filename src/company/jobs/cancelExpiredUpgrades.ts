import cron from "node-cron";
import PaymentService from "../services/PaymentService";
import logger from "../../utils/logger";

/**
 * Cron job to cancel expired pending plan upgrades
 * Runs every hour to check for companies with expired payment deadlines
 */
export function startCancelExpiredUpgradesCron() {
  const paymentService = new PaymentService();

  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      logger.info("Running cancel expired pending upgrades cron job");

      const result = await paymentService.cancelExpiredPendingUpgrades();

      if (result.cancelledCount > 0) {
        logger.info(
          `Cancelled ${result.cancelledCount} expired pending upgrades`,
          {
            companies: result.companies.map((c) => c.name),
          }
        );
      } else {
        logger.info("No expired pending upgrades found");
      }
    } catch (error) {
      logger.error("Error in cancel expired upgrades cron job:", error);
    }
  });

  logger.info("Cancel expired pending upgrades cron job scheduled (runs hourly)");
}
