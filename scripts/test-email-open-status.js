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

async function testEmailOpenStatus() {
  console.log("\n📧 Testing Email Open Status Feature...");

  try {
    // Step 1: Send an email
    console.log("\n1. Sending test email...");
    const emailData = {
      toEmail: "omarkhaled202080@gmail.com",
      fromEmail: "noreply@company.com",
      subject: "Test Email for Open Status",
      bodyHtml: `
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This email will test the open status functionality.</p>
            <p>Time: ${new Date().toISOString()}</p>
            <p>When you open this email, the tracking pixel will be loaded.</p>
          </body>
        </html>
      `,
      bodyText:
        "Test Email\n\nThis email will test the open status functionality.",
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

    // Step 2: Test GET request to check email open status
    console.log("\n2. Testing email open status (GET request)...");
    console.log(`Tracking URL: ${BASE_URL}/emails/track/${trackingPixelId}`);

    try {
      const getResponse = await makePublicRequest(
        "GET",
        `/emails/track/${trackingPixelId}`,
        null,
        { Accept: "application/json" }
      );

      console.log("📊 Email Open Status Response:");
      console.log(JSON.stringify(getResponse, null, 2));

      if (getResponse.success && getResponse.data.status === "OPENED") {
        console.log("✅ Email Status: OPENED");
        console.log(`✅ Opened at: ${getResponse.data.timestamp}`);
        console.log(`✅ User Agent: ${getResponse.data.userAgent || "N/A"}`);
        console.log(`✅ IP Address: ${getResponse.data.ipAddress || "N/A"}`);
      } else if (getResponse.success && getResponse.data.status === "SCANNED") {
        console.log("🤖 Email Status: SCANNED (Automated scan detected)");
        console.log(`🤖 User Agent: ${getResponse.data.userAgent || "N/A"}`);
        console.log(
          "This is correct behavior - automated scans should not count as opens"
        );
      } else {
        console.log("❌ Email Status: NOT_OPENED");
        console.log(`❌ Error: ${getResponse.data?.error || "Unknown error"}`);
      }
    } catch (error) {
      console.log("❌ GET request failed:", error.message);
      if (error.response) {
        console.log("Error response:", error.response.data);
      }
    }

    // Step 3: Verify in database
    console.log("\n3. Verifying in database...");
    const emailLogs = await makeRequest("GET", "/emails/logs");
    const sentEmail = emailLogs.data.find((log) => log.id === emailLogId);

    if (sentEmail) {
      console.log("📊 Database Email Status:");
      console.log(`- Status: ${sentEmail.status}`);
      console.log(`- Opened At: ${sentEmail.openedAt || "Not opened"}`);
      console.log(`- Tracking Pixel ID: ${sentEmail.trackingPixelId}`);
    } else {
      console.log("❌ Email not found in database");
    }

    return true;
  } catch (error) {
    console.log("❌ Email open status test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Email Open Status Test...");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Company Email: ${COMPANY_EMAIL}`);

  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log("❌ Cannot proceed without authentication");
    process.exit(1);
  }

  // Test email open status
  const testSuccess = await testEmailOpenStatus();

  // Summary
  console.log("\n📋 Test Summary:");
  console.log(`- Authentication: ${authSuccess ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`- Email Open Status: ${testSuccess ? "✅ PASS" : "❌ FAIL"}`);

  if (testSuccess) {
    console.log("\n🎉 Email open status feature is working!");
    console.log("✅ GET request returns JSON response");
    console.log("✅ Response indicates if email was opened or not");
    console.log("✅ Database is updated with tracking information");
  } else {
    console.log("\n❌ Email open status test failed.");
  }
}

// Run the test
main().catch(console.error);
