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

async function testEmailStatusOnly() {
  console.log("\n📧 Testing Email Status (No Tracking Call)...");

  try {
    // Step 1: Send an email
    console.log("\n1. Sending test email...");
    const emailData = {
      toEmail: "omarkhaled202080@gmail.com",
      fromEmail: "noreply@company.com",
      subject: "Test Email Status Only",
      bodyHtml: `
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This email will test the status without calling tracking endpoint.</p>
            <p>Time: ${new Date().toISOString()}</p>
          </body>
        </html>
      `,
      bodyText:
        "Test Email\n\nThis email will test the status without calling tracking endpoint.",
      emailType: "RFQ",
      priority: "NORMAL",
    };

    const emailResponse = await makeRequest("POST", "/emails/send", emailData);
    console.log("✅ Email sent successfully");
    console.log(`Email ID: ${emailResponse.data.id}`);
    console.log(`Tracking Pixel ID: ${emailResponse.data.trackingPixelId}`);

    const emailLogId = emailResponse.data.id;

    // Step 2: Check email status immediately after sending
    console.log("\n2. Checking email status immediately after sending...");
    const emailLogs = await makeRequest("GET", "/emails/logs");
    const sentEmail = emailLogs.data.find((log) => log.id === emailLogId);

    if (sentEmail) {
      console.log("📊 Email Status After Sending:");
      console.log(`- Status: ${sentEmail.status}`);
      console.log(`- Sent At: ${sentEmail.sentAt || "Not sent"}`);
      console.log(
        `- Delivered At: ${sentEmail.deliveredAt || "Not delivered"}`
      );
      console.log(`- Opened At: ${sentEmail.openedAt || "Not opened"}`);
      console.log(`- Tracking Pixel ID: ${sentEmail.trackingPixelId}`);

      if (sentEmail.status === "OPENED") {
        console.log(
          "❌ PROBLEM: Email is marked as OPENED immediately after sending!"
        );
        console.log(
          "This should not happen - email should only be OPENED when recipient opens it."
        );
      } else if (sentEmail.status === "SENT") {
        console.log("✅ Email status is correct: SENT (not opened yet)");
      } else {
        console.log(`ℹ️ Email status: ${sentEmail.status}`);
      }
    } else {
      console.log("❌ Email not found in database");
    }

    // Step 3: Wait a moment and check again
    console.log("\n3. Waiting 2 seconds and checking status again...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const emailLogs2 = await makeRequest("GET", "/emails/logs");
    const sentEmail2 = emailLogs2.data.find((log) => log.id === emailLogId);

    if (sentEmail2) {
      console.log("📊 Email Status After 2 Seconds:");
      console.log(`- Status: ${sentEmail2.status}`);
      console.log(`- Sent At: ${sentEmail2.sentAt || "Not sent"}`);
      console.log(
        `- Delivered At: ${sentEmail2.deliveredAt || "Not delivered"}`
      );
      console.log(`- Opened At: ${sentEmail2.openedAt || "Not opened"}`);

      if (sentEmail2.status === "OPENED" && !sentEmail.openedAt) {
        console.log(
          "❌ PROBLEM: Email status changed to OPENED without calling tracking endpoint!"
        );
        console.log(
          "This indicates there's code automatically calling the tracking endpoint."
        );
      } else if (sentEmail2.status === sentEmail.status) {
        console.log("✅ Email status remained unchanged (correct behavior)");
      }
    }

    return true;
  } catch (error) {
    console.log("❌ Email status test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Email Status Test (No Tracking Call)...");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Company Email: ${COMPANY_EMAIL}`);

  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log("❌ Cannot proceed without authentication");
    process.exit(1);
  }

  // Test email status
  const testSuccess = await testEmailStatusOnly();

  // Summary
  console.log("\n📋 Test Summary:");
  console.log(`- Authentication: ${authSuccess ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`- Email Status Test: ${testSuccess ? "✅ PASS" : "❌ FAIL"}`);

  if (testSuccess) {
    console.log("\n🎉 Email status test completed!");
  } else {
    console.log("\n❌ Email status test failed.");
  }
}

// Run the test
main().catch(console.error);
