import { prisma } from "../../app";
import { EmailService } from "./EmailService";
import logger from "../../utils/logger";
import Stripe from "stripe";

export interface PaymentEmailData {
  companyId: string;
  companyName: string;
  companyEmail: string;
  planName?: string;
  amount?: number;
  currency?: string;
  trialEndsAt?: Date;
  daysLeft?: number;
  paymentIntentId?: string;
  subscriptionId?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
}

export class PaymentEmailService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Send plan upgrade confirmation email
   */
  async sendPlanUpgradeConfirmation(data: PaymentEmailData): Promise<void> {
    try {
      const subject = `🎉 Plan Upgraded Successfully - Welcome to ${data.planName}!`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Plan Upgrade Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; margin-bottom: 20px; }
            .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
            .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">🎉</div>
              <h1>Plan Upgraded Successfully!</h1>
              <p>Welcome to your new ${data.planName} plan</p>
            </div>
            <div class="content">
              <h2>Hello ${data.companyName}!</h2>
              <p>Congratulations! Your subscription has been successfully upgraded to the <strong>${
                data.planName
              }</strong> plan.</p>
              
              <div class="plan-details">
                <h3>📋 Plan Details</h3>
                <ul>
                  <li><strong>Plan:</strong> ${data.planName}</li>
                  <li><strong>Amount:</strong> ${data.currency} ${
        data.amount
      }</li>
                  <li><strong>Status:</strong> Active</li>
                  <li><strong>Upgraded:</strong> ${new Date().toLocaleDateString()}</li>
                </ul>
              </div>

              <p>You now have access to all the premium features included in your new plan. Start exploring the enhanced capabilities right away!</p>
              
              <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "https://yourdomain.com"
                }/dashboard" class="cta-button">
                  Access Your Dashboard
                </a>
              </div>

              <p>If you have any questions about your new plan or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing our service!</p>
              <p>This email was sent to ${data.companyEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Plan Upgraded Successfully!
        
        Hello ${data.companyName}!
        
        Congratulations! Your subscription has been successfully upgraded to the ${
          data.planName
        } plan.
        
        Plan Details:
        - Plan: ${data.planName}
        - Amount: ${data.currency} ${data.amount}
        - Status: Active
        - Upgraded: ${new Date().toLocaleDateString()}
        
        You now have access to all the premium features included in your new plan.
        
        Access your dashboard: ${
          process.env.FRONTEND_URL || "https://yourdomain.com"
        }/dashboard
        
        If you have any questions, please contact our support team.
        
        Thank you for choosing our service!
      `;

      await this.emailService.sendEmail(
        data.companyId,
        data.companyEmail,
        process.env.FROM_EMAIL || "noreply@yourdomain.com",
        subject,
        htmlContent,
        textContent,
        {
          emailType: "PAYMENT_CONFIRMATION",
          priority: "HIGH",
        }
      );

      logger.info(
        `Plan upgrade confirmation email sent to ${data.companyEmail}`
      );
    } catch (error) {
      logger.error("Error sending plan upgrade confirmation email:", error);
      throw error;
    }
  }

  /**
   * Send trial ending warning email (3 days before)
   */
  async sendTrialEndingWarning(data: PaymentEmailData): Promise<void> {
    try {
      const subject = `⚠️ Your Free Trial Ends in ${data.daysLeft} Days`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Trial Ending Soon</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning-icon { font-size: 48px; margin-bottom: 20px; }
            .trial-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
            .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="warning-icon">⚠️</div>
              <h1>Trial Ending Soon!</h1>
              <p>Your free trial expires in ${data.daysLeft} days</p>
            </div>
            <div class="content">
              <h2>Hello ${data.companyName}!</h2>
              <p>We hope you've been enjoying your free trial experience with our platform!</p>
              
              <div class="trial-info">
                <h3>📅 Trial Information</h3>
                <ul>
                  <li><strong>Current Plan:</strong> Free Trial</li>
                  <li><strong>Trial Ends:</strong> ${data.trialEndsAt?.toLocaleDateString()}</li>
                  <li><strong>Days Remaining:</strong> ${
                    data.daysLeft
                  } days</li>
                </ul>
              </div>

              <p>To continue using our platform after your trial ends, please upgrade to one of our paid plans. Don't lose access to your data and features!</p>
              
              <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "https://yourdomain.com"
                }/pricing" class="cta-button">
                  View Available Plans
                </a>
              </div>

              <p>If you have any questions about our plans or need assistance, our support team is here to help!</p>
            </div>
            <div class="footer">
              <p>Thank you for trying our service!</p>
              <p>This email was sent to ${data.companyEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Trial Ending Soon!
        
        Hello ${data.companyName}!
        
        We hope you've been enjoying your free trial experience with our platform!
        
        Trial Information:
        - Current Plan: Free Trial
        - Trial Ends: ${data.trialEndsAt?.toLocaleDateString()}
        - Days Remaining: ${data.daysLeft} days
        
        To continue using our platform after your trial ends, please upgrade to one of our paid plans.
        
        View available plans: ${
          process.env.FRONTEND_URL || "https://yourdomain.com"
        }/pricing
        
        If you have any questions, our support team is here to help!
        
        Thank you for trying our service!
      `;

      await this.emailService.sendEmail(
        data.companyId,
        data.companyEmail,
        process.env.FROM_EMAIL || "noreply@yourdomain.com",
        subject,
        htmlContent,
        textContent,
        {
          emailType: "TRIAL_WARNING",
          priority: "HIGH",
        }
      );

      logger.info(`Trial ending warning email sent to ${data.companyEmail}`);
    } catch (error) {
      logger.error("Error sending trial ending warning email:", error);
      throw error;
    }
  }

  /**
   * Send trial expired notification email
   */
  async sendTrialExpiredNotification(data: PaymentEmailData): Promise<void> {
    try {
      const subject = `🔒 Trial Expired - Upgrade to Continue`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Trial Expired</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .expired-icon { font-size: 48px; margin-bottom: 20px; }
            .trial-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c757d; }
            .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="expired-icon">🔒</div>
              <h1>Trial Expired</h1>
              <p>Your free trial has ended</p>
            </div>
            <div class="content">
              <h2>Hello ${data.companyName}!</h2>
              <p>Your free trial has expired on ${data.trialEndsAt?.toLocaleDateString()}. To continue using our platform, please upgrade to a paid plan.</p>
              
              <div class="trial-info">
                <h3>📅 Trial Status</h3>
                <ul>
                  <li><strong>Previous Plan:</strong> Free Trial</li>
                  <li><strong>Expired On:</strong> ${data.trialEndsAt?.toLocaleDateString()}</li>
                  <li><strong>Current Status:</strong> Expired</li>
                </ul>
              </div>

              <p>Don't worry! Your data is safe and will be restored once you upgrade to a paid plan. Choose from our flexible pricing options to continue your journey with us.</p>
              
              <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "https://yourdomain.com"
                }/pricing" class="cta-button">
                  Upgrade Now
                </a>
              </div>

              <p>If you have any questions about our plans or need assistance, our support team is ready to help you get back on track!</p>
            </div>
            <div class="footer">
              <p>We hope to see you back soon!</p>
              <p>This email was sent to ${data.companyEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Trial Expired
        
        Hello ${data.companyName}!
        
        Your free trial has expired on ${data.trialEndsAt?.toLocaleDateString()}. To continue using our platform, please upgrade to a paid plan.
        
        Trial Status:
        - Previous Plan: Free Trial
        - Expired On: ${data.trialEndsAt?.toLocaleDateString()}
        - Current Status: Expired
        
        Don't worry! Your data is safe and will be restored once you upgrade to a paid plan.
        
        Upgrade now: ${
          process.env.FRONTEND_URL || "https://yourdomain.com"
        }/pricing
        
        If you have any questions, our support team is ready to help!
        
        We hope to see you back soon!
      `;

      await this.emailService.sendEmail(
        data.companyId,
        data.companyEmail,
        process.env.FROM_EMAIL || "noreply@yourdomain.com",
        subject,
        htmlContent,
        textContent,
        {
          emailType: "TRIAL_EXPIRED",
          priority: "HIGH",
        }
      );

      logger.info(
        `Trial expired notification email sent to ${data.companyEmail}`
      );
    } catch (error) {
      logger.error("Error sending trial expired notification email:", error);
      throw error;
    }
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(
    data: PaymentEmailData,
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    try {
      const subject = `🧾 Payment Receipt - ${data.planName || "Payment"}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .receipt-icon { font-size: 48px; margin-bottom: 20px; }
            .receipt-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
            .amount { font-size: 24px; font-weight: bold; color: #28a745; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="receipt-icon">🧾</div>
              <h1>Payment Successful!</h1>
              <p>Thank you for your payment</p>
            </div>
            <div class="content">
              <h2>Hello ${data.companyName}!</h2>
              <p>Your payment has been processed successfully. Here are the details:</p>
              
              <div class="receipt-details">
                <h3>💳 Payment Details</h3>
                <ul>
                  <li><strong>Amount:</strong> <span class="amount">${data.currency?.toUpperCase()} ${(
        data.amount || 0
      ).toFixed(2)}</span></li>
                  <li><strong>Payment ID:</strong> ${data.paymentIntentId}</li>
                  <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
                  <li><strong>Status:</strong> ${paymentIntent.status}</li>
                  ${
                    data.planName
                      ? `<li><strong>Plan:</strong> ${data.planName}</li>`
                      : ""
                  }
                </ul>
              </div>

              <p>Your payment has been processed and your account has been updated accordingly.</p>
              
              ${
                data.receiptUrl
                  ? `
                <div style="text-align: center;">
                  <a href="${data.receiptUrl}" class="cta-button" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Download Receipt
                  </a>
                </div>
              `
                  : ""
              }

              <p>If you have any questions about this payment or need assistance, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>This email was sent to ${data.companyEmail}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Payment Successful!
        
        Hello ${data.companyName}!
        
        Your payment has been processed successfully. Here are the details:
        
        Payment Details:
        - Amount: ${data.currency?.toUpperCase()} ${(data.amount || 0).toFixed(
        2
      )}
        - Payment ID: ${data.paymentIntentId}
        - Date: ${new Date().toLocaleDateString()}
        - Status: ${paymentIntent.status}
        ${data.planName ? `- Plan: ${data.planName}` : ""}
        
        Your payment has been processed and your account has been updated accordingly.
        
        ${data.receiptUrl ? `Download receipt: ${data.receiptUrl}` : ""}
        
        If you have any questions about this payment, please contact our support team.
        
        Thank you for your business!
      `;

      await this.emailService.sendEmail(
        data.companyId,
        data.companyEmail,
        process.env.FROM_EMAIL || "noreply@yourdomain.com",
        subject,
        htmlContent,
        textContent,
        {
          emailType: "PAYMENT_RECEIPT",
          priority: "HIGH",
        }
      );

      logger.info(`Payment receipt email sent to ${data.companyEmail}`);
    } catch (error) {
      logger.error("Error sending payment receipt email:", error);
      throw error;
    }
  }

  /**
   * Get company data for email
   */
  private async getCompanyData(
    companyId: string
  ): Promise<{ name: string; email: string }> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, email: true },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    return {
      name: company.name,
      email: company.email,
    };
  }

  /**
   * Send plan upgrade confirmation with company data
   */
  async sendPlanUpgradeConfirmationWithData(
    companyId: string,
    planName: string,
    amount: number,
    currency: string
  ): Promise<void> {
    const companyData = await this.getCompanyData(companyId);

    await this.sendPlanUpgradeConfirmation({
      companyId,
      companyName: companyData.name,
      companyEmail: companyData.email,
      planName,
      amount,
      currency,
    });
  }

  /**
   * Send trial ending warning with company data
   */
  async sendTrialEndingWarningWithData(
    companyId: string,
    daysLeft: number,
    trialEndsAt: Date
  ): Promise<void> {
    const companyData = await this.getCompanyData(companyId);

    await this.sendTrialEndingWarning({
      companyId,
      companyName: companyData.name,
      companyEmail: companyData.email,
      daysLeft,
      trialEndsAt,
    });
  }

  /**
   * Send trial expired notification with company data
   */
  async sendTrialExpiredNotificationWithData(
    companyId: string,
    trialEndsAt: Date
  ): Promise<void> {
    const companyData = await this.getCompanyData(companyId);

    await this.sendTrialExpiredNotification({
      companyId,
      companyName: companyData.name,
      companyEmail: companyData.email,
      trialEndsAt,
    });
  }

  /**
   * Send payment receipt with company data
   */
  async sendPaymentReceiptWithData(
    companyId: string,
    paymentIntent: Stripe.PaymentIntent,
    planName?: string,
    receiptUrl?: string
  ): Promise<void> {
    const companyData = await this.getCompanyData(companyId);

    await this.sendPaymentReceipt(
      {
        companyId,
        companyName: companyData.name,
        companyEmail: companyData.email,
        planName,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        paymentIntentId: paymentIntent.id,
        receiptUrl,
      },
      paymentIntent
    );
  }
}

export default PaymentEmailService;
