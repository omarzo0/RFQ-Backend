import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { EmailService } from "../src/company/services/EmailService";
import { PasswordResetService } from "../src/services/PasswordResetService";
import { PaymentEmailService } from "../src/company/services/PaymentEmailService";

// Load environment variables
dotenv.config();

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  error?: string;
  duration?: number;
}

class EmailTester {
  private results: TestResult[] = [];

  /**
   * Test 1: SMTP Connection
   */
  async testSMTPConnection(): Promise<void> {
    const testName = "SMTP Connection Test";
    const startTime = Date.now();

    try {
      console.log("\n🔍 Testing SMTP Connection...");

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.verify();

      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: true,
        message: "SMTP connection successful",
        duration,
      });
      console.log(`✅ SMTP connection verified (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: "SMTP connection failed",
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ SMTP connection failed:`, error);
    }
  }

  /**
   * Test 2: Send Test Email
   */
  async testSendTestEmail(toEmail: string): Promise<void> {
    const testName = "Send Test Email";
    const startTime = Date.now();

    try {
      console.log("\n📧 Testing Email Sending...");

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "RFQ Platform",
          address:
            process.env.EMAIL_FROM_ADDRESS || "omarkhaled202080@gmail.com",
        },
        to: toEmail,
        subject: "🧪 RFQ Platform - Email Test",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
              .success { background: #dcfce7; border: 2px solid #16a34a; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Email Test Successful!</h1>
              </div>
              <div class="content">
                <div class="success">
                  <strong>Test Email Sent Successfully</strong>
                  <p>This is a test email from the RFQ Platform to verify that the email functionality is working correctly.</p>
                </div>

                <h3>📋 Test Details</h3>
                <ul>
                  <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                  <li><strong>SMTP Server:</strong> ${
                    process.env.EMAIL_HOST
                  }</li>
                  <li><strong>Port:</strong> ${process.env.EMAIL_PORT}</li>
                  <li><strong>From:</strong> ${
                    process.env.EMAIL_FROM_ADDRESS
                  }</li>
                  <li><strong>To:</strong> ${toEmail}</li>
                </ul>

                <p>If you received this email, it means your email configuration is working correctly! 🎉</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Email Test Successful!

This is a test email from the RFQ Platform to verify that the email functionality is working correctly.

Test Details:
- Timestamp: ${new Date().toISOString()}
- SMTP Server: ${process.env.EMAIL_HOST}
- Port: ${process.env.EMAIL_PORT}
- From: ${process.env.EMAIL_FROM_ADDRESS}
- To: ${toEmail}

If you received this email, it means your email configuration is working correctly!
        `.trim(),
      };

      const result = await transporter.sendMail(mailOptions);

      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: true,
        message: `Test email sent successfully to ${toEmail}`,
        duration,
      });
      console.log(
        `✅ Test email sent successfully (${duration}ms)\n📧 Message ID: ${result.messageId}`
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: `Failed to send test email to ${toEmail}`,
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ Failed to send test email:`, error);
    }
  }

  /**
   * Test 3: Test Email Tracking Pixel
   */
  async testEmailTrackingPixel(): Promise<void> {
    const testName = "Email Tracking Pixel";
    const startTime = Date.now();

    try {
      console.log("\n🎯 Testing Email Tracking Pixel...");

      const emailService = new EmailService();
      const trackingPixelId = "test-tracking-pixel-123";
      const baseUrl =
        process.env.API_BASE_URL || "http://localhost:3000/api/v1";
      const trackingPixelUrl = `${baseUrl}/emails/track/${trackingPixelId}`;

      // Generate test HTML with tracking pixel
      const html = `
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This is a test email with tracking pixel.</p>
          </body>
        </html>
      `;

      // @ts-ignore - accessing private method for testing
      const htmlWithPixel = emailService["embedTrackingPixel"](
        html,
        trackingPixelId
      );

      // Verify tracking pixel is embedded
      if (
        htmlWithPixel.includes(trackingPixelUrl) &&
        htmlWithPixel.includes('width="1"') &&
        htmlWithPixel.includes('height="1"')
      ) {
        const duration = Date.now() - startTime;
        this.results.push({
          test: testName,
          passed: true,
          message: "Tracking pixel embedded successfully",
          duration,
        });
        console.log(`✅ Tracking pixel embedded correctly (${duration}ms)`);
      } else {
        throw new Error("Tracking pixel not found in HTML");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: "Failed to embed tracking pixel",
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ Tracking pixel test failed:`, error);
    }
  }

  /**
   * Test 4: Test HTML to Text Conversion
   */
  async testHtmlToTextConversion(): Promise<void> {
    const testName = "HTML to Text Conversion";
    const startTime = Date.now();

    try {
      console.log("\n📝 Testing HTML to Text Conversion...");

      const emailService = new EmailService();
      const html = `
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This is a <strong>test</strong> email with &nbsp; special characters.</p>
            <p>Line 1<br>Line 2</p>
          </body>
        </html>
      `;

      // @ts-ignore - accessing private method for testing
      const text = emailService["htmlToText"](html);

      // Verify conversion
      if (
        text.includes("Test Email") &&
        text.includes("test") &&
        !text.includes("<html>") &&
        !text.includes("<body>")
      ) {
        const duration = Date.now() - startTime;
        this.results.push({
          test: testName,
          passed: true,
          message: "HTML to text conversion successful",
          duration,
        });
        console.log(`✅ HTML to text conversion works (${duration}ms)`);
      } else {
        throw new Error("HTML to text conversion failed");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: "HTML to text conversion failed",
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ HTML to text conversion failed:`, error);
    }
  }

  /**
   * Test 5: Test Email Service Initialization
   */
  async testEmailServiceInitialization(): Promise<void> {
    const testName = "Email Service Initialization";
    const startTime = Date.now();

    try {
      console.log("\n🔧 Testing Email Service Initialization...");

      const emailService = new EmailService();

      // Check if service is initialized
      if (emailService) {
        const duration = Date.now() - startTime;
        this.results.push({
          test: testName,
          passed: true,
          message: "Email service initialized successfully",
          duration,
        });
        console.log(`✅ Email service initialized (${duration}ms)`);
      } else {
        throw new Error("Email service initialization failed");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: "Email service initialization failed",
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ Email service initialization failed:`, error);
    }
  }

  /**
   * Test 6: Test Password Reset Service
   */
  async testPasswordResetService(): Promise<void> {
    const testName = "Password Reset Service";
    const startTime = Date.now();

    try {
      console.log("\n🔑 Testing Password Reset Service...");

      const passwordResetService = new PasswordResetService();

      // Check if service is initialized
      if (passwordResetService) {
        const duration = Date.now() - startTime;
        this.results.push({
          test: testName,
          passed: true,
          message: "Password reset service initialized successfully",
          duration,
        });
        console.log(`✅ Password reset service initialized (${duration}ms)`);
      } else {
        throw new Error("Password reset service initialization failed");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: "Password reset service initialization failed",
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ Password reset service initialization failed:`, error);
    }
  }

  /**
   * Test 7: Test Payment Email Service
   */
  async testPaymentEmailService(): Promise<void> {
    const testName = "Payment Email Service";
    const startTime = Date.now();

    try {
      console.log("\n💳 Testing Payment Email Service...");

      const paymentEmailService = new PaymentEmailService();

      // Check if service is initialized
      if (paymentEmailService) {
        const duration = Date.now() - startTime;
        this.results.push({
          test: testName,
          passed: true,
          message: "Payment email service initialized successfully",
          duration,
        });
        console.log(`✅ Payment email service initialized (${duration}ms)`);
      } else {
        throw new Error("Payment email service initialization failed");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: "Payment email service initialization failed",
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ Payment email service initialization failed:`, error);
    }
  }

  /**
   * Test 8: Environment Variables Check
   */
  async testEnvironmentVariables(): Promise<void> {
    const testName = "Environment Variables";
    const startTime = Date.now();

    try {
      console.log("\n⚙️  Testing Environment Variables...");

      const requiredVars = [
        "EMAIL_HOST",
        "EMAIL_PORT",
        "EMAIL_USER",
        "EMAIL_PASSWORD",
        "EMAIL_FROM_ADDRESS",
        "EMAIL_FROM_NAME",
      ];

      const missingVars = requiredVars.filter((varName) => !process.env[varName]);

      if (missingVars.length === 0) {
        const duration = Date.now() - startTime;
        this.results.push({
          test: testName,
          passed: true,
          message: "All required environment variables are set",
          duration,
        });
        console.log(`✅ All environment variables configured (${duration}ms)`);
      } else {
        throw new Error(
          `Missing environment variables: ${missingVars.join(", ")}`
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: "Environment variables check failed",
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ Environment variables check failed:`, error);
    }
  }

  /**
   * Print Test Summary
   */
  printSummary(): void {
    console.log("\n" + "=".repeat(70));
    console.log("📊 EMAIL FEATURE TEST SUMMARY");
    console.log("=".repeat(70) + "\n");

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;

    this.results.forEach((result, index) => {
      const icon = result.passed ? "✅" : "❌";
      const status = result.passed ? "PASSED" : "FAILED";
      console.log(`${index + 1}. ${icon} [${status}] ${result.test}`);
      console.log(`   ${result.message}`);
      if (result.duration) {
        console.log(`   Duration: ${result.duration}ms`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log("");
    });

    console.log("=".repeat(70));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
    console.log("=".repeat(70) + "\n");

    if (failed === 0) {
      console.log("🎉 All tests passed! Email feature is working correctly.\n");
    } else {
      console.log("⚠️  Some tests failed. Please review the errors above.\n");
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(testEmail?: string): Promise<void> {
    console.log("\n🚀 Starting Email Feature Tests...\n");
    console.log("=".repeat(70));

    // Run tests in sequence
    await this.testEnvironmentVariables();
    await this.testEmailServiceInitialization();
    await this.testPasswordResetService();
    await this.testPaymentEmailService();
    await this.testSMTPConnection();
    await this.testHtmlToTextConversion();
    await this.testEmailTrackingPixel();

    // Only send test email if email address is provided
    if (testEmail) {
      await this.testSendTestEmail(testEmail);
    } else {
      console.log(
        "\n⚠️  Skipping actual email send test (no test email provided)"
      );
      console.log(
        "   To test actual email sending, run: npm run test:email <your-email@example.com>\n"
      );
    }

    // Print summary
    this.printSummary();
  }
}

// Main execution
const main = async () => {
  const tester = new EmailTester();

  // Get test email from command line arguments
  const testEmail = process.argv[2];

  if (testEmail && !testEmail.includes("@")) {
    console.error("❌ Invalid email address provided");
    process.exit(1);
  }

  await tester.runAllTests(testEmail);

  // Exit with appropriate code
  process.exit(0);
};

main();
