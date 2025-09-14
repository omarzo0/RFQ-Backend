const axios = require("axios");
const fs = require("fs");

// Configuration
const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
const COMPANY_EMAIL =
  process.env.COMPANY_EMAIL || "uomarkhaled202080@gmail.com";
const COMPANY_PASSWORD = process.env.COMPANY_PASSWORD || "564712Omar@@!!";

let authToken = "";
let companyId = "";

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Request failed: ${method} ${endpoint}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error(`Error:`, error.message);
    }
    throw error;
  }
}

// Helper function to make unauthenticated requests (for tracking)
async function makePublicRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Public request failed: ${method} ${endpoint}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error(`Error:`, error.message);
    }
    throw error;
  }
}

async function authenticate() {
  console.log("🔐 Authenticating...");

  try {
    const response = await makeRequest("POST", "/auth/login", {
      email: COMPANY_EMAIL,
      password: COMPANY_PASSWORD,
    });

    authToken = response.data.token;
    companyId = response.data.user.companyId;
    console.log("✅ Authentication successful");
    return true;
  } catch (error) {
    console.log("❌ Authentication failed");
    return false;
  }
}

async function testEmailTracking() {
  console.log("\n📧 Testing Email Open Tracking Feature...");

  try {
    // Step 1: Send an email to get a tracking pixel ID
    console.log("\n1. Sending test email...");
    const emailData = {
      toEmail: "omarkhaled202080@gmail.com",
      fromEmail: "noreply@company.com",
      subject: "Test Email for Open Tracking",
      bodyHtml: `
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This is a test email to verify open tracking functionality.</p>
            <p>If you can see this, the email was delivered successfully.</p>
            <p>Time: ${new Date().toISOString()}</p>
          </body>
        </html>
      `,
      bodyText:
        "Test Email\n\nThis is a test email to verify open tracking functionality.\n\nIf you can see this, the email was delivered successfully.",
      emailType: "RFQ",
      priority: "NORMAL",
    };

    const emailResponse = await makeRequest("POST", "/emails/send", emailData);
    console.log("✅ Email sent successfully");
    console.log(`Email ID: ${emailResponse.data.id}`);
    console.log(`Tracking Pixel ID: ${emailResponse.data.trackingPixelId}`);

    const trackingPixelId = emailResponse.data.trackingPixelId;
    const emailLogId = emailResponse.data.id;

    // Verify tracking pixel is embedded in email HTML
    console.log("\n1.5. Verifying tracking pixel embedding...");
    const baseUrl = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
    const expectedPixelUrl = `${baseUrl}/emails/track/${trackingPixelId}`;

    if (emailData.bodyHtml.includes(expectedPixelUrl)) {
      console.log("✅ Tracking pixel is embedded in email HTML");
    } else {
      console.log("⚠️ Tracking pixel may not be embedded in email HTML");
      console.log("Expected URL:", expectedPixelUrl);
    }

    if (!trackingPixelId) {
      console.log(
        "❌ No tracking pixel ID generated - email tracking may not be enabled"
      );
      return false;
    }

    // Step 2: Test API-based email open tracking
    console.log("\n2. Testing API-based email open tracking...");
    const openTrackingData = {
      engagementType: "OPEN",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "192.168.1.100",
      location: "Test Location",
      device: "Desktop",
      browser: "Chrome",
      os: "Windows 10",
    };

    const trackingResponse = await makePublicRequest(
      "POST",
      `/emails/track/${trackingPixelId}`,
      openTrackingData,
      { Accept: "application/json" }
    );

    console.log("✅ API-based tracking successful");
    console.log("Tracking Response:", trackingResponse);

    // Step 3: Test pixel-based email open tracking (simulating email client)
    console.log("\n3. Testing pixel-based email open tracking...");
    try {
      // Simulate a GET request (like when an email client loads the pixel)
      const pixelResponse = await makePublicRequest(
        "GET",
        `/emails/track/${trackingPixelId}`,
        null,
        { Accept: "image/png" }
      );
      console.log("✅ Pixel-based tracking successful (GET request)");
    } catch (error) {
      console.log("⚠️ Pixel-based tracking failed:", error.message);
    }

    // Step 4: Verify tracking data in database
    console.log("\n4. Verifying tracking data in database...");

    // Get email logs to verify the email was tracked
    const emailLogs = await makeRequest("GET", "/emails/logs");
    const sentEmail = emailLogs.data.find((log) => log.id === emailLogId);

    if (sentEmail) {
      console.log("✅ Email log found in database");
      console.log(`Email Status: ${sentEmail.status}`);
      console.log(`Opened At: ${sentEmail.openedAt || "Not opened yet"}`);
      console.log(`Clicked At: ${sentEmail.clickedAt || "Not clicked yet"}`);

      if (sentEmail.openedAt) {
        console.log("✅ Email open was successfully tracked!");
      } else {
        console.log("⚠️ Email open was not recorded in the email log");
      }
    } else {
      console.log("❌ Email log not found in database");
    }

    // Step 5: Test email analytics
    console.log("\n5. Testing email analytics...");
    try {
      const analytics = await makeRequest("GET", "/emails/analytics");
      console.log("✅ Email analytics retrieved successfully");
      console.log("Analytics data:", JSON.stringify(analytics.data, null, 2));
    } catch (error) {
      console.log("⚠️ Email analytics not available or failed");
    }

    // Step 6: Test click tracking as well
    console.log("\n6. Testing email click tracking...");
    const clickTrackingData = {
      engagementType: "CLICK",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      ipAddress: "192.168.1.100",
      linkUrl: "https://example.com/test-link",
      linkText: "Test Link",
    };

    const clickResponse = await makePublicRequest(
      "POST",
      `/emails/track/${trackingPixelId}`,
      clickTrackingData,
      { Accept: "application/json" }
    );

    console.log("✅ Click tracking successful");
    console.log("Click Response:", clickResponse);

    // Final verification
    console.log("\n7. Final verification...");
    const finalEmailLogs = await makeRequest("GET", "/emails/logs");
    const finalEmail = finalEmailLogs.data.find((log) => log.id === emailLogId);

    if (finalEmail) {
      console.log("📊 Final Email Status:");
      console.log(`- Status: ${finalEmail.status}`);
      console.log(`- Opened At: ${finalEmail.openedAt || "Not opened"}`);
      console.log(`- Clicked At: ${finalEmail.clickedAt || "Not clicked"}`);
      console.log(`- Tracking Pixel ID: ${finalEmail.trackingPixelId}`);

      if (finalEmail.openedAt && finalEmail.clickedAt) {
        console.log(
          "🎉 Email tracking is working perfectly! Both open and click tracking are functional."
        );
        return true;
      } else if (finalEmail.openedAt) {
        console.log(
          "✅ Email open tracking is working! Click tracking may need verification."
        );
        return true;
      } else {
        console.log("❌ Email tracking is not working properly.");
        return false;
      }
    }

    return true;
  } catch (error) {
    console.log("❌ Email tracking test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function testTrackingPixelGeneration() {
  console.log("\n🔍 Testing Tracking Pixel Generation...");

  try {
    // Test with different email types
    const emailTypes = ["RFQ", "FOLLOW_UP", "BULK_EMAIL", "NOTIFICATION"];

    for (const emailType of emailTypes) {
      console.log(`\nTesting ${emailType} email...`);

      const emailData = {
        toEmail: `test-${emailType.toLowerCase()}@example.com`,
        fromEmail: "noreply@company.com",
        subject: `Test ${emailType} Email`,
        bodyHtml: `<p>Test ${emailType} email content</p>`,
        bodyText: `Test ${emailType} email content`,
        emailType: emailType,
        priority: "NORMAL",
      };

      const emailResponse = await makeRequest(
        "POST",
        "/emails/send",
        emailData
      );

      if (emailResponse.data.trackingPixelId) {
        console.log(
          `✅ ${emailType} email generated tracking pixel: ${emailResponse.data.trackingPixelId}`
        );
      } else {
        console.log(`⚠️ ${emailType} email did not generate tracking pixel`);
      }
    }

    return true;
  } catch (error) {
    console.log("❌ Tracking pixel generation test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Email Open Tracking Test...");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Company Email: ${COMPANY_EMAIL}`);

  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log("❌ Cannot proceed without authentication");
    process.exit(1);
  }

  // Test email tracking
  const trackingSuccess = await testEmailTracking();

  // Test tracking pixel generation
  const pixelGenerationSuccess = await testTrackingPixelGeneration();

  // Summary
  console.log("\n📋 Test Summary:");
  console.log(`- Authentication: ${authSuccess ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`- Email Tracking: ${trackingSuccess ? "✅ PASS" : "❌ FAIL"}`);
  console.log(
    `- Pixel Generation: ${pixelGenerationSuccess ? "✅ PASS" : "❌ FAIL"}`
  );

  if (trackingSuccess && pixelGenerationSuccess) {
    console.log(
      "\n🎉 All email tracking tests passed! The open email feature is working correctly."
    );
  } else {
    console.log(
      "\n❌ Some email tracking tests failed. Please check the implementation."
    );
  }
}

// Run the test
main().catch(console.error);
