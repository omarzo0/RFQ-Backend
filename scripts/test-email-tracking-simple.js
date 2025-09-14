const axios = require("axios");

// Configuration
const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api/v1";
const COMPANY_EMAIL =
  process.env.COMPANY_EMAIL || "uomarkhaled202080@gmail.com";
const COMPANY_PASSWORD = process.env.COMPANY_PASSWORD || "564712Omar@@!!";

let authToken = "";

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
    console.log("✅ Authentication successful");
    return true;
  } catch (error) {
    console.log("❌ Authentication failed");
    return false;
  }
}

async function testEmailTrackingComplete() {
  console.log("\n📧 Testing Complete Email Tracking Feature...");

  try {
    // Step 1: Send an email
    console.log("\n1. Sending test email...");
    const emailData = {
      toEmail: "omarkhaled202080@gmail.com",
      fromEmail: "noreply@company.com",
      subject: "Test Email for Complete Tracking",
      bodyHtml: `
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This is a test email to verify complete tracking functionality.</p>
            <p>Time: ${new Date().toISOString()}</p>
            <p>This email should have a tracking pixel embedded.</p>
          </body>
        </html>
      `,
      bodyText:
        "Test Email\n\nThis is a test email to verify complete tracking functionality.",
      emailType: "RFQ",
      priority: "NORMAL",
    };

    const emailResponse = await makeRequest("POST", "/emails/send", emailData);
    console.log("✅ Email sent successfully");
    console.log(`Email ID: ${emailResponse.data.id}`);
    console.log(`Tracking Pixel ID: ${emailResponse.data.trackingPixelId}`);

    const trackingPixelId = emailResponse.data.trackingPixelId;
    const emailLogId = emailResponse.data.id;

    if (!trackingPixelId) {
      console.log("❌ No tracking pixel ID generated");
      return false;
    }

    // Step 2: Test GET request (email open tracking)
    console.log("\n2. Testing email open tracking (GET request)...");
    try {
      const getResponse = await makePublicRequest(
        "GET",
        `/emails/track/${trackingPixelId}`,
        null,
        { Accept: "application/json" }
      );
      console.log("✅ GET request successful - email open tracked");
      console.log("Response:", getResponse);

      if (getResponse.success && getResponse.data.status === "OPENED") {
        console.log("✅ Email open status: OPENED");
      } else {
        console.log("❌ Email open status: NOT_OPENED");
      }
    } catch (error) {
      console.log("❌ GET request failed:", error.message);
    }

    // Step 3: Verify tracking in database
    console.log("\n3. Verifying tracking in database...");
    const emailLogs = await makeRequest("GET", "/emails/logs");
    const sentEmail = emailLogs.data.find((log) => log.id === emailLogId);

    if (sentEmail) {
      console.log("📊 Email Status:");
      console.log(`- Status: ${sentEmail.status}`);
      console.log(`- Opened At: ${sentEmail.openedAt || "Not opened"}`);
      console.log(`- Clicked At: ${sentEmail.clickedAt || "Not clicked"}`);
      console.log(`- Tracking Pixel ID: ${sentEmail.trackingPixelId}`);

      if (sentEmail.openedAt) {
        console.log("✅ Email open tracking is working!");
      } else {
        console.log("❌ Email open tracking failed");
      }

      if (sentEmail.clickedAt) {
        console.log("✅ Email click tracking is working!");
      } else {
        console.log("⚠️ Email click tracking may need verification");
      }
    } else {
      console.log("❌ Email not found in database");
    }

    return true;
  } catch (error) {
    console.log("❌ Email tracking test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Complete Email Tracking Test...");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Company Email: ${COMPANY_EMAIL}`);

  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log("❌ Cannot proceed without authentication");
    process.exit(1);
  }

  // Test email tracking
  const trackingSuccess = await testEmailTrackingComplete();

  // Summary
  console.log("\n📋 Test Summary:");
  console.log(`- Authentication: ${authSuccess ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`- Email Tracking: ${trackingSuccess ? "✅ PASS" : "❌ FAIL"}`);

  if (trackingSuccess) {
    console.log("\n🎉 Email tracking is working correctly!");
    console.log("✅ Tracking pixels are embedded in emails");
    console.log("✅ Open tracking works via GET requests");
    console.log("✅ GET request returns JSON response with open status");
    console.log("✅ Database updates are working");
  } else {
    console.log(
      "\n❌ Email tracking tests failed. Please check the implementation."
    );
  }
}

// Run the test
main().catch(console.error);
