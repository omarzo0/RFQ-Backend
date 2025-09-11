// Test script to send email via API
const axios = require("axios");

async function testEmailSend() {
  try {
    // Step 1: Login to get token
    console.log("🔐 Step 1: Logging in...");
    const loginResponse = await axios.post(
      "http://localhost:3000/api/v1/company/auth/login",
      {
        email: "admin@testshipping.com", // Default company admin user
        password: "admin123", // Default password
      }
    );

    const token = loginResponse.data.data.accessToken;
    console.log("✅ Login successful, got token");

    // Step 2: Send email with token
    console.log("📧 Step 2: Sending email...");
    const emailResponse = await axios.post(
      "http://localhost:3000/api/v1/company/emails/send",
      {
        toEmail: "omar.masoud@gu.edu.eg",
        fromEmail: "sender@company.com",
        subject: "Test Email from RFQ Platform",
        bodyHtml:
          "<h1>Hello!</h1><p>This is a test email sent via Brevo SMTP.</p><p>Sent at: " +
          new Date().toISOString() +
          "</p>",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Email sent successfully!");
    console.log("Response:", emailResponse.data);
  } catch (error) {
    console.log("❌ Error occurred:");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Error:", error.response.data);
    } else {
      console.log("Network Error:", error.message);
    }
  }
}

console.log("🧪 Testing complete email flow...");
testEmailSend();
