import { prisma } from "../../app";
import PaymentEmailService from "../services/PaymentEmailService";
import logger from "../../utils/logger";

export class TrialNotificationJob {
  private paymentEmailService: PaymentEmailService;

  constructor() {
    this.paymentEmailService = new PaymentEmailService();
  }

  /**
   * Check for companies with trials ending in 3 days and send warning emails
   */
  async checkTrialEndingWarning(): Promise<void> {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // Find companies with trials ending in 3 days
      const companies = await prisma.company.findMany({
        where: {
          subscriptionPlan: "trial",
          subscriptionStatus: "ACTIVE",
          trialEndsAt: {
            gte: new Date(
              threeDaysFromNow.getFullYear(),
              threeDaysFromNow.getMonth(),
              threeDaysFromNow.getDate()
            ),
            lt: new Date(
              threeDaysFromNow.getFullYear(),
              threeDaysFromNow.getMonth(),
              threeDaysFromNow.getDate() + 1
            ),
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          trialEndsAt: true,
        },
      });

      logger.info(
        `Found ${companies.length} companies with trials ending in 3 days`
      );

      for (const company of companies) {
        try {
          const daysLeft = company.trialEndsAt
            ? Math.ceil(
                (company.trialEndsAt.getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;

          await this.paymentEmailService.sendTrialEndingWarningWithData(
            company.id,
            daysLeft,
            company.trialEndsAt!
          );

          logger.info(
            `Trial ending warning sent to company ${company.name} (${company.email})`
          );
        } catch (error) {
          logger.error(
            `Failed to send trial ending warning to company ${company.id}:`,
            error
          );
        }
      }
    } catch (error) {
      logger.error("Error in checkTrialEndingWarning job:", error);
      throw error;
    }
  }

  /**
   * Check for companies with expired trials and send notification emails
   */
  async checkTrialExpired(): Promise<void> {
    try {
      const now = new Date();

      // Find companies with expired trials
      const companies = await prisma.company.findMany({
        where: {
          subscriptionPlan: "trial",
          subscriptionStatus: "ACTIVE",
          trialEndsAt: {
            lt: now,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          trialEndsAt: true,
        },
      });

      logger.info(`Found ${companies.length} companies with expired trials`);

      for (const company of companies) {
        try {
          // Update company status to inactive
          await prisma.company.update({
            where: { id: company.id },
            data: { subscriptionStatus: "INACTIVE" },
          });

          await this.paymentEmailService.sendTrialExpiredNotificationWithData(
            company.id,
            company.trialEndsAt!
          );

          logger.info(
            `Trial expired notification sent to company ${company.name} (${company.email})`
          );
        } catch (error) {
          logger.error(
            `Failed to send trial expired notification to company ${company.id}:`,
            error
          );
        }
      }
    } catch (error) {
      logger.error("Error in checkTrialExpired job:", error);
      throw error;
    }
  }

  /**
   * Run all trial notification checks
   */
  async runAllChecks(): Promise<void> {
    try {
      logger.info("Starting trial notification checks...");

      await Promise.all([
        this.checkTrialEndingWarning(),
        this.checkTrialExpired(),
      ]);

      logger.info("Trial notification checks completed");
    } catch (error) {
      logger.error("Error running trial notification checks:", error);
      throw error;
    }
  }
}

export default TrialNotificationJob;
