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

// Helper function to make unauthenticated requests
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

async function testEmailSending() {
  console.log("\n📧 Testing Email Sending...");

  try {
    // Test 1: Send single email
    console.log("\n1. Testing single email sending...");
    const emailData = {
      toEmail: "test@example.com",
      fromEmail: "noreply@company.com",
      subject: "Test Email - Single Send",
      bodyHtml: "<h1>Test Email</h1><p>This is a test email.</p>",
      bodyText: "Test Email\n\nThis is a test email.",
      emailType: "RFQ",
      priority: "NORMAL",
    };

    const emailResponse = await makeRequest("POST", "/emails/send", emailData);
    console.log("✅ Single email sent successfully");
    console.log(`Email ID: ${emailResponse.data.id}`);
    console.log(`Tracking Pixel ID: ${emailResponse.data.trackingPixelId}`);

    // Test 2: Send scheduled email
    console.log("\n2. Testing scheduled email...");
    const scheduledEmailData = {
      toEmail: "scheduled@example.com",
      fromEmail: "noreply@company.com",
      subject: "Test Email - Scheduled",
      bodyHtml: "<h1>Scheduled Email</h1><p>This is a scheduled email.</p>",
      bodyText: "Scheduled Email\n\nThis is a scheduled email.",
      emailType: "RFQ",
      priority: "NORMAL",
      scheduledFor: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    };

    const scheduledResponse = await makeRequest(
      "POST",
      "/emails/send",
      scheduledEmailData
    );
    console.log("✅ Scheduled email created successfully");
    console.log(`Scheduled Email ID: ${scheduledResponse.data.id}`);

    return {
      emailId: emailResponse.data.id,
      scheduledId: scheduledResponse.data.id,
    };
  } catch (error) {
    console.log("❌ Email sending test failed");
    console.error("Error details:", error.message);
    return null;
  }
}

async function testEmailTracking(emailId) {
  console.log("\n📊 Testing Email Tracking...");

  try {
    // Get email logs
    console.log("\n1. Getting email logs...");
    const emailLogs = await makeRequest("GET", "/emails/logs");
    const sentEmail = emailLogs.data.find((log) => log.id === emailId);

    if (!sentEmail) {
      console.log("❌ Email not found in logs");
      return false;
    }

    console.log("✅ Email found in logs");
    console.log(`Status: ${sentEmail.status}`);
    console.log(`Tracking Pixel ID: ${sentEmail.trackingPixelId}`);

    // Test tracking pixel
    if (sentEmail.trackingPixelId) {
      console.log("\n2. Testing tracking pixel...");
      try {
        const trackingResponse = await makePublicRequest(
          "GET",
          `/emails/track/${sentEmail.trackingPixelId}`,
          null,
          { Accept: "application/json" }
        );
        console.log("✅ Tracking pixel accessed successfully");
        console.log(`Status: ${trackingResponse.data.status}`);
      } catch (error) {
        console.log("⚠️ Tracking pixel test failed:", error.message);
      }
    }

    return true;
  } catch (error) {
    console.log("❌ Email tracking test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function testEmailTemplates() {
  console.log("\n📝 Testing Email Templates...");

  try {
    // Test 1: Create email template
    console.log("\n1. Creating email template...");
    const templateData = {
      name: "Test Template",
      templateType: "RFQ",
      subject: "Test Subject - {{contactName}}",
      bodyHtml: "<h1>Hello {{contactName}}</h1><p>This is a test template.</p>",
      bodyText: "Hello {{contactName}}\n\nThis is a test template.",
      supportedTokens: ["contactName", "companyName"],
      language: "en",
      isActive: true,
    };

    const templateResponse = await makeRequest(
      "POST",
      "/emails/templates",
      templateData
    );
    console.log("✅ Email template created successfully");
    console.log(`Template ID: ${templateResponse.data.id}`);

    // Test 2: Get email templates
    console.log("\n2. Getting email templates...");
    const templatesResponse = await makeRequest("GET", "/emails/templates");
    console.log("✅ Email templates retrieved successfully");
    console.log(`Total templates: ${templatesResponse.data.total}`);

    // Test 3: Preview template
    console.log("\n3. Testing template preview...");
    const previewData = {
      contactName: "John Doe",
      companyName: "Test Company",
    };

    const previewResponse = await makeRequest(
      "POST",
      `/emails/templates/${templateResponse.data.id}/preview`,
      previewData
    );
    console.log("✅ Template preview generated successfully");

    return { templateId: templateResponse.data.id };
  } catch (error) {
    console.log("❌ Email templates test failed");
    console.error("Error details:", error.message);
    return null;
  }
}

async function testFollowUpRules() {
  console.log("\n🔄 Testing Follow-Up Rules...");

  try {
    // Test 1: Create follow-up rule
    console.log("\n1. Creating follow-up rule...");
    const ruleData = {
      name: "Test Follow-Up Rule",
      description: "Test follow-up rule for testing",
      daysAfterSend: 3,
      onlyIfNotOpened: true,
      onlyIfNotReplied: true,
      maxFollowUps: 2,
      isActive: true,
    };

    const ruleResponse = await makeRequest(
      "POST",
      "/emails/follow-up-rules",
      ruleData
    );
    console.log("✅ Follow-up rule created successfully");
    console.log(`Rule ID: ${ruleResponse.data.id}`);

    // Test 2: Get follow-up rules
    console.log("\n2. Getting follow-up rules...");
    const rulesResponse = await makeRequest("GET", "/emails/follow-up-rules");
    console.log("✅ Follow-up rules retrieved successfully");
    console.log(`Total rules: ${rulesResponse.data.total}`);

    // Test 3: Process scheduled follow-ups
    console.log("\n3. Testing scheduled follow-ups processing...");
    const processResponse = await makeRequest(
      "POST",
      "/emails/follow-up-rules/process"
    );
    console.log("✅ Scheduled follow-ups processed successfully");

    return { ruleId: ruleResponse.data.id };
  } catch (error) {
    console.log("❌ Follow-up rules test failed");
    console.error("Error details:", error.message);
    return null;
  }
}

async function testEmailCampaigns() {
  console.log("\n📢 Testing Email Campaigns...");

  try {
    // Test 1: Create email campaign
    console.log("\n1. Creating email campaign...");
    const campaignData = {
      name: "Test Campaign",
      description: "Test campaign for testing",
      campaignType: "RFQ_BLAST",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };

    const campaignResponse = await makeRequest(
      "POST",
      "/emails/campaigns",
      campaignData
    );
    console.log("✅ Email campaign created successfully");
    console.log(`Campaign ID: ${campaignResponse.data.id}`);

    // Test 2: Get email campaigns
    console.log("\n2. Getting email campaigns...");
    const campaignsResponse = await makeRequest("GET", "/emails/campaigns");
    console.log("✅ Email campaigns retrieved successfully");
    console.log(`Total campaigns: ${campaignsResponse.data.total}`);

    return { campaignId: campaignResponse.data.id };
  } catch (error) {
    console.log("❌ Email campaigns test failed");
    console.error("Error details:", error.message);
    return null;
  }
}

async function testEmailAnalytics() {
  console.log("\n📈 Testing Email Analytics...");

  try {
    // Test 1: Get email analytics
    console.log("\n1. Getting email analytics...");
    const analyticsResponse = await makeRequest("GET", "/emails/analytics");
    console.log("✅ Email analytics retrieved successfully");
    console.log(
      "Analytics data:",
      JSON.stringify(analyticsResponse.data, null, 2)
    );

    // Test 2: Get email logs
    console.log("\n2. Getting email logs...");
    const logsResponse = await makeRequest("GET", "/emails/logs");
    console.log("✅ Email logs retrieved successfully");
    console.log(`Total email logs: ${logsResponse.data.total}`);

    return true;
  } catch (error) {
    console.log("❌ Email analytics test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function testEmailBounceHandling() {
  console.log("\n📧 Testing Email Bounce Handling...");

  try {
    // Test 1: Test bounce handling with invalid emailLogId
    console.log("\n1. Testing bounce handling with invalid emailLogId...");
    try {
      await makePublicRequest("POST", "/emails/bounce", {
        emailLogId: "invalid-uuid",
        bounceType: "HARD",
        bounceReason: "Invalid email address",
      });
      console.log("❌ Bounce handling should have failed with invalid UUID");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log("✅ Bounce handling correctly rejected invalid UUID");
      } else {
        console.log("⚠️ Unexpected error:", error.message);
      }
    }

    // Test 2: Test bounce handling with non-existent emailLogId
    console.log("\n2. Testing bounce handling with non-existent emailLogId...");
    try {
      await makePublicRequest("POST", "/emails/bounce", {
        emailLogId: "00000000-0000-0000-0000-000000000000",
        bounceType: "HARD",
        bounceReason: "Email not found",
      });
      console.log(
        "❌ Bounce handling should have failed with non-existent email"
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log("✅ Bounce handling correctly rejected non-existent email");
      } else {
        console.log("⚠️ Unexpected error:", error.message);
      }
    }

    return true;
  } catch (error) {
    console.log("❌ Email bounce handling test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function testEmailRetry() {
  console.log("\n🔄 Testing Email Retry...");

  try {
    // Test 1: Retry failed emails
    console.log("\n1. Testing retry failed emails...");
    const retryResponse = await makeRequest("POST", "/emails/retry", {
      emailLogIds: [], // Empty array to retry all failed emails
    });
    console.log("✅ Email retry initiated successfully");
    console.log(`Retry result: ${retryResponse.data.message}`);

    return true;
  } catch (error) {
    console.log("❌ Email retry test failed");
    console.error("Error details:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Complete Email Management Test...");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Company Email: ${COMPANY_EMAIL}`);

  // Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log("❌ Cannot proceed without authentication");
    process.exit(1);
  }

  const results = {
    emailSending: false,
    emailTracking: false,
    emailTemplates: false,
    followUpRules: false,
    emailCampaigns: false,
    emailAnalytics: false,
    emailBounceHandling: false,
    emailRetry: false,
  };

  // Test email sending
  const emailResult = await testEmailSending();
  results.emailSending = emailResult !== null;

  // Test email tracking
  if (emailResult) {
    results.emailTracking = await testEmailTracking(emailResult.emailId);
  }

  // Test email templates
  const templateResult = await testEmailTemplates();
  results.emailTemplates = templateResult !== null;

  // Test follow-up rules
  const ruleResult = await testFollowUpRules();
  results.followUpRules = ruleResult !== null;

  // Test email campaigns
  const campaignResult = await testEmailCampaigns();
  results.emailCampaigns = campaignResult !== null;

  // Test email analytics
  results.emailAnalytics = await testEmailAnalytics();

  // Test email bounce handling
  results.emailBounceHandling = await testEmailBounceHandling();

  // Test email retry
  results.emailRetry = await testEmailRetry();

  // Summary
  console.log("\n📋 Test Summary:");
  console.log(
    `- Email Sending: ${results.emailSending ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `- Email Tracking: ${results.emailTracking ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `- Email Templates: ${results.emailTemplates ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `- Follow-Up Rules: ${results.followUpRules ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `- Email Campaigns: ${results.emailCampaigns ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `- Email Analytics: ${results.emailAnalytics ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `- Email Bounce Handling: ${
      results.emailBounceHandling ? "✅ PASS" : "❌ FAIL"
    }`
  );
  console.log(`- Email Retry: ${results.emailRetry ? "✅ PASS" : "❌ FAIL"}`);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  console.log(
    `\n📊 Overall Results: ${passedTests}/${totalTests} tests passed`
  );

  if (passedTests === totalTests) {
    console.log("\n🎉 All email management functions are working correctly!");
  } else {
    console.log(
      "\n❌ Some email management functions have issues that need to be fixed."
    );
  }
}

// Run the test
main().catch(console.error);
