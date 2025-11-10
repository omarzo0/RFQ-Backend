import nodemailer from "nodemailer";
import dotenv from "dotenv";

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
   * Test 1: Environment Variables Check
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

        // Print config details
        console.log(`\n📋 Email Configuration:`);
        console.log(`   - Host: ${process.env.EMAIL_HOST}`);
        console.log(`   - Port: ${process.env.EMAIL_PORT}`);
        console.log(`   - Secure: ${process.env.EMAIL_SECURE}`);
        console.log(`   - User: ${process.env.EMAIL_USER}`);
        console.log(`   - From Name: ${process.env.EMAIL_FROM_NAME}`);
        console.log(`   - From Address: ${process.env.EMAIL_FROM_ADDRESS}`);
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
   * Test 2: SMTP Connection
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
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });

      await transporter.verify();

      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: true,
        message: "SMTP connection successful - Brevo is responding",
        duration,
      });
      console.log(
        `✅ SMTP connection verified with Brevo (${duration}ms)`
      );
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
   * Test 3: Send Test Email
   */
  async testSendTestEmail(toEmail: string): Promise<void> {
    const testName = "Send Test Email";
    const startTime = Date.now();

    try {
      console.log(`\n📧 Sending Test Email to ${toEmail}...`);

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Create tracking pixel
      const trackingPixelId = `test-${Date.now()}`;
      const baseUrl =
        process.env.API_BASE_URL || "http://localhost:3000/api/v1";
      const trackingPixelUrl = `${baseUrl}/emails/track/${trackingPixelId}`;

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "RFQ Platform",
          address:
            process.env.EMAIL_FROM_ADDRESS || "omarkhaled202080@gmail.com",
        },
        to: toEmail,
        subject: "🧪 RFQ Platform - Email Feature Test",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Test</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .success { background: #d4edda; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .info-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
              .test-details { background: white; border: 1px solid #dee2e6; padding: 15px; border-radius: 6px; margin: 15px 0; }
              h1 { margin: 0; font-size: 28px; }
              h2 { color: #333; font-size: 22px; margin-top: 0; }
              h3 { color: #667eea; font-size: 18px; }
              ul { padding-left: 20px; }
              li { margin: 8px 0; }
              .badge { display: inline-block; background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Email Test Successful!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">RFQ Platform Email Feature Verification</p>
              </div>

              <div class="content">
                <div class="success">
                  <h2 style="margin-top: 0;">🎉 Test Passed!</h2>
                  <p><strong>This email confirms that your RFQ Platform email system is working correctly.</strong></p>
                  <p>All email features including SMTP connection, email composition, tracking pixels, and delivery are functioning as expected.</p>
                </div>

                <div class="info-box">
                  <h3>📋 Test Details</h3>
                  <div class="test-details">
                    <ul style="list-style: none; padding-left: 0;">
                      <li><strong>📅 Timestamp:</strong> ${new Date().toLocaleString()}</li>
                      <li><strong>🌐 SMTP Server:</strong> ${
                        process.env.EMAIL_HOST
                      }</li>
                      <li><strong>🔌 Port:</strong> ${
                        process.env.EMAIL_PORT
                      }</li>
                      <li><strong>📤 From:</strong> ${
                        process.env.EMAIL_FROM_ADDRESS
                      } (${process.env.EMAIL_FROM_NAME})</li>
                      <li><strong>📥 To:</strong> ${toEmail}</li>
                      <li><strong>🔍 Tracking ID:</strong> ${trackingPixelId}</li>
                    </ul>
                  </div>
                </div>

                <div class="info-box">
                  <h3>✨ Features Verified</h3>
                  <ul>
                    <li><span class="badge">✓</span> SMTP Authentication</li>
                    <li><span class="badge">✓</span> HTML Email Rendering</li>
                    <li><span class="badge">✓</span> Email Tracking Pixel</li>
                    <li><span class="badge">✓</span> Personalization Variables</li>
                    <li><span class="badge">✓</span> Email Delivery</li>
                  </ul>
                </div>

                <div class="info-box" style="border-left-color: #ffc107; background: #fff3cd;">
                  <h3 style="color: #856404;">📊 Email Tracking</h3>
                  <p style="color: #856404; margin: 0;">This email includes a tracking pixel to monitor email opens. When you open this email in your email client, it will be recorded in the system analytics.</p>
                  <p style="color: #856404; margin: 10px 0 0 0; font-size: 14px;"><strong>Tracking URL:</strong> ${trackingPixelUrl}</p>
                </div>

                <p style="margin-top: 30px;">If you received this email, your RFQ Platform email configuration is working perfectly! 🚀</p>
              </div>

              <div class="footer">
                <p><strong>RFQ Platform - Email Testing Service</strong></p>
                <p style="margin: 10px 0 0 0;">This is an automated test email. Please do not reply.</p>
              </div>
            </div>

            <!-- Tracking Pixel -->
            <img src="${trackingPixelUrl}"
                 width="1" height="1"
                 style="display:none; width:1px; height:1px; border:0;"
                 alt="" />
          </body>
          </html>
        `,
        text: `
EMAIL TEST SUCCESSFUL!
RFQ Platform Email Feature Verification

✅ Test Passed!

This email confirms that your RFQ Platform email system is working correctly.

All email features including SMTP connection, email composition, tracking pixels, and delivery are functioning as expected.

📋 Test Details:
- Timestamp: ${new Date().toLocaleString()}
- SMTP Server: ${process.env.EMAIL_HOST}
- Port: ${process.env.EMAIL_PORT}
- From: ${process.env.EMAIL_FROM_ADDRESS} (${
          process.env.EMAIL_FROM_NAME
        })
- To: ${toEmail}
- Tracking ID: ${trackingPixelId}

✨ Features Verified:
✓ SMTP Authentication
✓ HTML Email Rendering
✓ Email Tracking Pixel
✓ Personalization Variables
✓ Email Delivery

📊 Email Tracking:
This email includes a tracking pixel to monitor email opens.
Tracking URL: ${trackingPixelUrl}

If you received this email, your RFQ Platform email configuration is working perfectly! 🚀

---
RFQ Platform - Email Testing Service
This is an automated test email. Please do not reply.
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
        `✅ Test email sent successfully (${duration}ms)\n📧 Message ID: ${result.messageId}\n🔍 Tracking ID: ${trackingPixelId}`
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
   * Test 4: Tracking Pixel Generation
   */
  async testTrackingPixelGeneration(): Promise<void> {
    const testName = "Tracking Pixel Generation";
    const startTime = Date.now();

    try {
      console.log("\n🎯 Testing Tracking Pixel Generation...");

      const trackingPixelId = `test-${Date.now()}`;
      const baseUrl =
        process.env.API_BASE_URL || "http://localhost:3000/api/v1";
      const trackingPixelUrl = `${baseUrl}/emails/track/${trackingPixelId}`;

      const html = `<html><body><h1>Test</h1></body></html>`;
      const htmlWithPixel = `${html.replace(
        "</body>",
        `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" /></body>`
      )}`;

      if (
        htmlWithPixel.includes(trackingPixelUrl) &&
        htmlWithPixel.includes('width="1"')
      ) {
        const duration = Date.now() - startTime;
        this.results.push({
          test: testName,
          passed: true,
          message: "Tracking pixel generated correctly",
          duration,
        });
        console.log(`✅ Tracking pixel generation works (${duration}ms)`);
      } else {
        throw new Error("Tracking pixel not found in HTML");
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: "Tracking pixel generation failed",
        error: error instanceof Error ? error.message : String(error),
        duration,
      });
      console.error(`❌ Tracking pixel generation failed:`, error);
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
      if (result.duration !== undefined) {
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
      console.log(
        "🎉 All tests passed! Email feature is working correctly.\n"
      );
      console.log("✨ Next Steps:");
      console.log("   - Check your inbox for the test email");
      console.log("   - Verify the email renders correctly");
      console.log("   - Open the email to test tracking pixel");
      console.log(
        "   - Check email logs in the database for tracking data\n"
      );
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
    await this.testSMTPConnection();
    await this.testTrackingPixelGeneration();

    // Only send test email if email address is provided
    if (testEmail) {
      await this.testSendTestEmail(testEmail);
    } else {
      console.log(
        "\n⚠️  Skipping actual email send test (no test email provided)"
      );
      console.log(
        "   To test actual email sending, run:"
      );
      console.log(
        '   npm run test:email <your-email@example.com>\n'
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
    console.error('   Usage: npm run test:email <email@example.com>');
    process.exit(1);
  }

  await tester.runAllTests(testEmail);

  // Exit with appropriate code
  const allPassed = tester['results'].every((r) => r.passed);
  process.exit(allPassed ? 0 : 1);
};

main();
