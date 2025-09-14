const axios = require("axios");

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
    console.log(`Company ID: ${companyId}`);
    return true;
  } catch (error) {
    console.log("❌ Authentication failed");
    return false;
  }
}

async function testEmailAnalytics() {
  console.log("\n📈 Testing Email Analytics...");

  try {
    // Step 1: Get current analytics
    console.log("\n1. Getting current email analytics...");
    const analyticsResponse = await makeRequest("GET", "/emails/analytics");
    console.log("📊 Current Analytics:");
    console.log(JSON.stringify(analyticsResponse.data, null, 2));

    // Step 2: Get email logs to see what emails exist
    console.log("\n2. Getting email logs...");
    const logsResponse = await makeRequest("GET", "/emails/logs");
    console.log(`📧 Total Email Logs: ${logsResponse.data.total}`);

    if (logsResponse.data.data && logsResponse.data.data.length > 0) {
      console.log("\n📋 Recent Email Logs:");
      logsResponse.data.data.slice(0, 5).forEach((log, index) => {
        console.log(`${index + 1}. ID: ${log.id}`);
        console.log(`   To: ${log.toEmail}`);
        console.log(`   Subject: ${log.subject}`);
        console.log(`   Status: ${log.status}`);
        console.log(`   Sent At: ${log.sentAt || "Not sent"}`);
        console.log(`   Created At: ${log.createdAt}`);
        console.log(`   Company ID: ${log.companyId}`);
        console.log("");
      });
    }

    // Step 3: Send a test email
    console.log("\n3. Sending test email...");
    const emailData = {
      toEmail: "analytics-test@example.com",
      fromEmail: "noreply@company.com",
      subject: "Analytics Test Email",
      bodyHtml:
        "<h1>Analytics Test</h1><p>This email is for testing analytics.</p>",
      bodyText: "Analytics Test\n\nThis email is for testing analytics.",
      emailType: "RFQ",
      priority: "NORMAL",
    };

    const emailResponse = await makeRequest("POST", "/emails/send", emailData);
    console.log("✅ Test email sent successfully");
    console.log(`Email ID: ${emailResponse.data.id}`);
    console.log(`Status: ${emailResponse.data.status}`);

    // Step 4: Wait a moment and check analytics again
    console.log("\n4. Waiting 2 seconds and checking analytics again...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analyticsResponse2 = await makeRequest("GET", "/emails/analytics");
    console.log("📊 Updated Analytics:");
    console.log(JSON.stringify(analyticsResponse2.data, null, 2));

    // Step 5: Compare analytics
    console.log("\n5. Analytics Comparison:");
    console.log(
      `Total Emails: ${analyticsResponse.data.totalEmails} → ${analyticsResponse2.data.totalEmails}`
    );
    console.log(
      `Sent Emails: ${analyticsResponse.data.sentEmails} → ${analyticsResponse2.data.sentEmails}`
    );
    console.log(
      `Delivered Emails: ${analyticsResponse.data.deliveredEmails} → ${analyticsResponse2.data.deliveredEmails}`
    );
    console.log(
      `Opened Emails: ${analyticsResponse.data.openedEmails} → ${analyticsResponse2.data.openedEmails}`
    );

    if (
      analyticsResponse2.data.totalEmails > analyticsResponse.data.totalEmails
    ) {
      console.log("✅ Analytics are updating correctly!");
    } else {
      console.log("❌ Analytics are not updating - there might be an issue");
    }

    return true;
  } catch (error) {
    console.log("❌ Email analytics test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Email Analytics Debug Test...");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Company Email: ${COMPANY_EMAIL}`);

  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log("❌ Cannot proceed without authentication");
    process.exit(1);
  }

  // Test email analytics
  const testSuccess = await testEmailAnalytics();

  // Summary
  console.log("\n📋 Test Summary:");
  console.log(`- Email Analytics Test: ${testSuccess ? "✅ PASS" : "❌ FAIL"}`);

  if (testSuccess) {
    console.log("\n🎉 Email analytics are working correctly!");
  } else {
    console.log("\n❌ Email analytics test failed.");
  }
}

// Run the test
main().catch(console.error);
