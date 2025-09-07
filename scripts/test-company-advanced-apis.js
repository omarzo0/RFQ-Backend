const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1/company";
let accessToken = "";
let refreshToken = "";
let companyId = "";
let userId = "";
let shippingLineId = "";
let contactId = "";
let rfqId = "";
let templateId = "";
let quoteId = "";
let emailCampaignId = "";
let followUpRuleId = "";
let emailReplyId = "";

// Test data
const testEmailCampaign = {
  name: "Test Email Campaign",
  description: "Test campaign for container shipping",
  targetType: "CONTACTS",
  targetCriteria: {
    shippingLineIds: [],
    tags: ["test"],
    departments: ["Sales"],
  },
  emailContent: {
    subject: "Test RFQ Request - {{commodity}}",
    bodyHtml:
      "<p>Dear {{firstName}},</p><p>Please find our RFQ request for {{commodity}} shipping.</p>",
    bodyText:
      "Dear {{firstName}},\n\nPlease find our RFQ request for {{commodity}} shipping.",
  },
  scheduleType: "IMMEDIATE",
  rateLimitPerMinute: 5,
  personalizationData: {
    commodity: "Electronics",
    originPort: "Shanghai",
    destinationPort: "Los Angeles",
  },
};

const testFollowUpRule = {
  name: "First Follow-up Rule",
  description: "Follow up after 3 days if no response",
  daysAfterSend: 3,
  onlyIfNotOpened: true,
  onlyIfNotReplied: true,
  maxFollowUps: 2,
  isActive: true,
};

const testQuote = {
  rfqId: "",
  contactId: "",
  shippingLineId: "",
  quoteReference: "QUOTE-2024-001",
  quoteNumber: "Q2024001",
  oceanFreight: 1500,
  currency: "USD",
  baf: 200,
  caf: 150,
  securityFee: 50,
  documentationFee: 100,
  handlingCharges: 75,
  otherCharges: 25,
  totalAmount: 2100,
  validityDate: "2024-03-01",
  paymentTerms: "30 days",
  transitTime: "14 days",
  freeTimeAtOrigin: "7 days",
  freeTimeAtDestination: "7 days",
  termsAndConditions: "Standard terms apply",
  specialNotes: "Test quote for testing",
  source: "MANUAL",
  tags: ["test", "container"],
  notes: "Test quote created for testing",
};

// Helper function to make authenticated requests
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(
      `❌ ${method} ${url} failed:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

// Test functions
async function testServerHealth() {
  console.log("🔍 Testing server health...");
  try {
    const response = await axios.get("http://localhost:3000/health");
    console.log("✅ Server is running");
    return true;
  } catch (error) {
    console.log(
      "❌ Server is not running. Please start the server with: npm run dev"
    );
    return false;
  }
}

async function testCompanyLogin() {
  console.log("\n🔐 Testing company login...");
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: "testuser@shippingcompany.com",
      password: "TestPassword123!",
    });

    accessToken = response.data.data.tokens.accessToken;
    refreshToken = response.data.data.tokens.refreshToken;
    companyId = response.data.data.user.companyId;
    userId = response.data.data.user.id;

    console.log("✅ Company login successful");
    console.log(`   Company ID: ${companyId}`);
    console.log(`   User ID: ${userId}`);
    return true;
  } catch (error) {
    console.log(
      "❌ Company login failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

async function testEmailSendEngine() {
  console.log("\n📧 Testing Email Send Engine...");

  try {
    // Create shipping line and contact first
    const shippingLine = await makeRequest("POST", "/shipping-lines", {
      name: "Test Shipping Line for Email",
      code: "TSLE",
      scacCode: "TSLE",
      website: "https://testshippingemail.com",
      headquartersLocation: "Test City",
      headquartersCountry: "USA",
      description: "Test shipping line for email testing",
      tags: ["test", "email"],
      tradeLanes: ["Asia-Europe"],
      services: ["Container"],
      specialization: "Container Shipping",
      reliability: 4,
      serviceQuality: 4,
    });
    shippingLineId = shippingLine.data.id;

    const contact = await makeRequest("POST", "/contacts", {
      firstName: "Email",
      lastName: "Test",
      email: "email.test@testshippingemail.com",
      phone: "+1234567890",
      jobTitle: "Sales Manager",
      department: "Sales",
      shippingLineId: shippingLineId,
      tags: ["test", "email"],
      notes: "Test contact for email testing",
      seniority: "SENIOR",
      specialization: "Container Shipping",
      quoteQuality: 4,
      reliability: 4,
      isPrimary: true,
    });
    contactId = contact.data.id;

    // Test single email sending
    const singleEmail = await makeRequest("POST", "/emails/send", {
      toEmail: "email.test@testshippingemail.com",
      fromEmail: "noreply@company.com",
      subject: "Test Single Email",
      bodyHtml: "<p>This is a test email</p>",
      bodyText: "This is a test email",
      emailType: "RFQ",
      priority: "NORMAL",
      personalizationData: {
        firstName: "Email",
        lastName: "Test",
        companyName: "Test Company",
      },
      language: "en",
      timezone: "UTC",
    });
    console.log("✅ Send single email successful");

    // Test bulk email creation
    const bulkEmail = await makeRequest("POST", "/emails/bulk", {
      name: "Test Bulk Email",
      description: "Test bulk email for testing",
      subject: "Test Bulk Email - {{firstName}}",
      bodyHtml: "<p>Dear {{firstName}},</p><p>This is a test bulk email.</p>",
      bodyText: "Dear {{firstName}},\n\nThis is a test bulk email.",
      contactIds: [contactId],
      rateLimitPerMinute: 5,
      personalizationData: {
        firstName: "Email",
        lastName: "Test",
        companyName: "Test Company",
      },
      language: "en",
      timezone: "UTC",
      priority: "NORMAL",
    });
    console.log("✅ Create bulk email successful");

    // Test email templates
    const emailTemplate = await makeRequest("POST", "/emails/templates", {
      name: "Test Email Template",
      description: "Test template for email testing",
      subject: "RFQ Request - {{commodity}}",
      bodyHtml:
        "<p>Dear {{firstName}},</p><p>Please find our RFQ for {{commodity}}.</p>",
      bodyText: "Dear {{firstName}},\n\nPlease find our RFQ for {{commodity}}.",
      category: "RFQ",
      language: "en",
      tags: ["test", "rfq"],
      isPublic: false,
      variables: [
        "firstName",
        "lastName",
        "commodity",
        "originPort",
        "destinationPort",
      ],
    });
    console.log("✅ Create email template successful");

    // Test email campaigns
    const emailCampaign = await makeRequest("POST", "/emails/campaigns", {
      name: "Test Email Campaign",
      description: "Test campaign for email testing",
      targetType: "CONTACTS",
      targetCriteria: {
        shippingLineIds: [shippingLineId],
        tags: ["test"],
      },
      emailContent: {
        subject: "Test Campaign - {{firstName}}",
        bodyHtml: "<p>Dear {{firstName}},</p><p>This is a test campaign.</p>",
        bodyText: "Dear {{firstName}},\n\nThis is a test campaign.",
      },
      scheduleType: "IMMEDIATE",
      rateLimitPerMinute: 5,
      personalizationData: {
        firstName: "Email",
        lastName: "Test",
      },
    });
    emailCampaignId = emailCampaign.data.id;
    console.log("✅ Create email campaign successful");

    // Test email tracking
    const emailLogs = await makeRequest("GET", "/emails/logs");
    console.log("✅ Get email logs successful");

    // Test email analytics
    const emailAnalytics = await makeRequest("GET", "/emails/analytics");
    console.log("✅ Get email analytics successful");

    // Test scheduled emails
    const scheduledEmail = await makeRequest("POST", "/emails/send", {
      toEmail: "email.test@testshippingemail.com",
      fromEmail: "noreply@company.com",
      subject: "Test Scheduled Email",
      bodyHtml: "<p>This is a scheduled email</p>",
      bodyText: "This is a scheduled email",
      scheduledFor: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      emailType: "RFQ",
      priority: "NORMAL",
    });
    console.log("✅ Schedule email successful");

    // Clean up
    await makeRequest("DELETE", `/contacts/${contactId}`);
    await makeRequest("DELETE", `/shipping-lines/${shippingLineId}`);

    return true;
  } catch (error) {
    console.log("❌ Email send engine tests failed");
    return false;
  }
}

async function testFollowUpEngine() {
  console.log("\n🔄 Testing Automated Follow-Up Engine...");

  try {
    // Create follow-up rule
    const followUpRule = await makeRequest("POST", "/follow-ups/rules", {
      name: "Test Follow-up Rule",
      description: "Test rule for follow-up testing",
      daysAfterSend: 3,
      onlyIfNotOpened: true,
      onlyIfNotReplied: true,
      maxFollowUps: 2,
      isActive: true,
    });
    followUpRuleId = followUpRule.data.id;
    console.log("✅ Create follow-up rule successful");

    // Get follow-up rules
    const followUpRules = await makeRequest("GET", "/follow-ups/rules");
    console.log("✅ Get follow-up rules successful");

    // Update follow-up rule
    const updatedRule = await makeRequest(
      "PUT",
      `/follow-ups/rules/${followUpRuleId}`,
      {
        name: "Updated Follow-up Rule",
        daysAfterSend: 5,
        maxFollowUps: 3,
      }
    );
    console.log("✅ Update follow-up rule successful");

    // Create RFQ for follow-up testing
    const rfq = await makeRequest("POST", "/rfqs", {
      title: "Test RFQ for Follow-up",
      description: "Test RFQ for follow-up testing",
      originPort: "Shanghai",
      destinationPort: "Los Angeles",
      commodity: "Electronics",
      containerType: "40GP",
      containerQuantity: 1,
      cargoWeight: 20000,
      cargoVolume: 67,
      incoterm: "FOB",
      cargoReadyDate: "2024-02-01",
      quoteDeadline: "2024-01-25",
      shipmentUrgency: "NORMAL",
      specialRequirements: "None",
      requiredServices: ["Container"],
      tradeLane: "Asia-North America",
      estimatedValue: 50000,
      currency: "USD",
      notes: "Test RFQ for follow-up testing",
      tags: ["test", "follow-up"],
      priority: "MEDIUM",
    });
    rfqId = rfq.data.id;

    // Create contact for follow-up testing
    const shippingLine = await makeRequest("POST", "/shipping-lines", {
      name: "Test Shipping Line for Follow-up",
      code: "TSLF",
      scacCode: "TSLF",
      website: "https://testshippingfollowup.com",
      headquartersLocation: "Test City",
      headquartersCountry: "USA",
      description: "Test shipping line for follow-up testing",
      tags: ["test", "follow-up"],
      tradeLanes: ["Asia-Europe"],
      services: ["Container"],
      specialization: "Container Shipping",
      reliability: 4,
      serviceQuality: 4,
    });
    shippingLineId = shippingLine.data.id;

    const contact = await makeRequest("POST", "/contacts", {
      firstName: "Follow-up",
      lastName: "Test",
      email: "followup.test@testshippingfollowup.com",
      phone: "+1234567890",
      jobTitle: "Sales Manager",
      department: "Sales",
      shippingLineId: shippingLineId,
      tags: ["test", "follow-up"],
      notes: "Test contact for follow-up testing",
      seniority: "SENIOR",
      specialization: "Container Shipping",
      quoteQuality: 4,
      reliability: 4,
      isPrimary: true,
    });
    contactId = contact.data.id;

    // Schedule follow-ups for RFQ
    const scheduledFollowUps = await makeRequest(
      "POST",
      `/rfqs/${rfqId}/schedule-follow-ups`,
      {
        contactIds: [contactId],
        followUpRuleIds: [followUpRuleId],
      }
    );
    console.log("✅ Schedule follow-ups for RFQ successful");

    // Get scheduled follow-ups
    const scheduledFollowUpsList = await makeRequest(
      "GET",
      "/follow-ups/scheduled"
    );
    console.log("✅ Get scheduled follow-ups successful");

    // Get follow-up analytics
    const followUpAnalytics = await makeRequest("GET", "/follow-ups/analytics");
    console.log("✅ Get follow-up analytics successful");

    // Clean up
    await makeRequest("DELETE", `/contacts/${contactId}`);
    await makeRequest("DELETE", `/shipping-lines/${shippingLineId}`);
    await makeRequest("DELETE", `/rfqs/${rfqId}`);
    await makeRequest("DELETE", `/follow-ups/rules/${followUpRuleId}`);

    return true;
  } catch (error) {
    console.log("❌ Follow-up engine tests failed");
    return false;
  }
}

async function testReplyIngestion() {
  console.log("\n📥 Testing Reply Ingestion & AI Parsing...");

  try {
    // Test IMAP configuration
    const imapConfig = await makeRequest(
      "POST",
      "/reply-ingestion/imap/config",
      {
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        username: "test@company.com",
        password: "testpassword",
        folder: "INBOX",
        isActive: true,
      }
    );
    console.log("✅ Create IMAP configuration successful");

    // Get IMAP configurations
    const imapConfigs = await makeRequest(
      "GET",
      "/reply-ingestion/imap/configs"
    );
    console.log("✅ Get IMAP configurations successful");

    // Test webhook configuration
    const webhookConfig = await makeRequest(
      "POST",
      "/reply-ingestion/webhook/config",
      {
        provider: "GMAIL",
        webhookUrl: "https://api.company.com/webhooks/gmail",
        secret: "webhook-secret",
        isActive: true,
      }
    );
    console.log("✅ Create webhook configuration successful");

    // Get webhook configurations
    const webhookConfigs = await makeRequest(
      "GET",
      "/reply-ingestion/webhook/configs"
    );
    console.log("✅ Get webhook configurations successful");

    // Test manual email ingestion
    const manualIngestion = await makeRequest(
      "POST",
      "/reply-ingestion/ingest",
      {
        messageId: "test-message-123",
        fromEmail: "test@shippingline.com",
        fromName: "Test Shipping Line",
        toEmail: "rfq@company.com",
        subject: "Re: RFQ Request - Electronics",
        bodyHtml:
          "<p>Dear Sir,</p><p>Please find our quote for your RFQ:</p><p>Ocean Freight: $1500</p><p>Total: $2100</p>",
        bodyText:
          "Dear Sir,\n\nPlease find our quote for your RFQ:\n\nOcean Freight: $1500\nTotal: $2100",
        receivedAt: new Date().toISOString(),
        source: "MANUAL",
      }
    );
    emailReplyId = manualIngestion.data.id;
    console.log("✅ Manual email ingestion successful");

    // Get email replies
    const emailReplies = await makeRequest("GET", "/reply-ingestion/replies");
    console.log("✅ Get email replies successful");

    // Get AI parsing results
    const parsingResults = await makeRequest(
      "GET",
      `/reply-ingestion/replies/${emailReplyId}/parsing`
    );
    console.log("✅ Get AI parsing results successful");

    // Test quote creation from email reply
    const quoteFromReply = await makeRequest(
      "POST",
      `/reply-ingestion/replies/${emailReplyId}/create-quote`,
      {
        rfqId: rfqId,
        contactId: contactId,
        shippingLineId: shippingLineId,
        quoteData: {
          quoteReference: "QUOTE-EMAIL-001",
          oceanFreight: 1500,
          currency: "USD",
          totalAmount: 2100,
          validityDate: "2024-03-01",
          paymentTerms: "30 days",
          transitTime: "14 days",
        },
      }
    );
    console.log("✅ Create quote from email reply successful");

    // Get replies requiring review
    const reviewsNeeded = await makeRequest(
      "GET",
      "/reply-ingestion/replies/requiring-review"
    );
    console.log("✅ Get replies requiring review successful");

    // Update review status
    await makeRequest(
      "PUT",
      `/reply-ingestion/replies/${emailReplyId}/review`,
      {
        requiresReview: false,
        reviewNotes: "AI parsing looks good",
        reviewedBy: userId,
      }
    );
    console.log("✅ Update review status successful");

    // Get AI parsing analytics
    const aiAnalytics = await makeRequest("GET", "/reply-ingestion/analytics");
    console.log("✅ Get AI parsing analytics successful");

    return true;
  } catch (error) {
    console.log("❌ Reply ingestion tests failed");
    return false;
  }
}

async function testQuoteManagement() {
  console.log("\n💰 Testing Quote Management...");

  try {
    // Create RFQ for quote testing
    const rfq = await makeRequest("POST", "/rfqs", {
      title: "Test RFQ for Quote Management",
      description: "Test RFQ for quote management testing",
      originPort: "Shanghai",
      destinationPort: "Los Angeles",
      commodity: "Electronics",
      containerType: "40GP",
      containerQuantity: 1,
      cargoWeight: 20000,
      cargoVolume: 67,
      incoterm: "FOB",
      cargoReadyDate: "2024-02-01",
      quoteDeadline: "2024-01-25",
      shipmentUrgency: "NORMAL",
      specialRequirements: "None",
      requiredServices: ["Container"],
      tradeLane: "Asia-North America",
      estimatedValue: 50000,
      currency: "USD",
      notes: "Test RFQ for quote management testing",
      tags: ["test", "quote"],
      priority: "MEDIUM",
    });
    rfqId = rfq.data.id;

    // Create shipping line and contact for quote testing
    const shippingLine = await makeRequest("POST", "/shipping-lines", {
      name: "Test Shipping Line for Quote",
      code: "TSLQ",
      scacCode: "TSLQ",
      website: "https://testshippingquote.com",
      headquartersLocation: "Test City",
      headquartersCountry: "USA",
      description: "Test shipping line for quote testing",
      tags: ["test", "quote"],
      tradeLanes: ["Asia-Europe"],
      services: ["Container"],
      specialization: "Container Shipping",
      reliability: 4,
      serviceQuality: 4,
    });
    shippingLineId = shippingLine.data.id;

    const contact = await makeRequest("POST", "/contacts", {
      firstName: "Quote",
      lastName: "Test",
      email: "quote.test@testshippingquote.com",
      phone: "+1234567890",
      jobTitle: "Sales Manager",
      department: "Sales",
      shippingLineId: shippingLineId,
      tags: ["test", "quote"],
      notes: "Test contact for quote testing",
      seniority: "SENIOR",
      specialization: "Container Shipping",
      quoteQuality: 4,
      reliability: 4,
      isPrimary: true,
    });
    contactId = contact.data.id;

    // Create quote
    const quote = await makeRequest("POST", "/quotes", {
      ...testQuote,
      rfqId: rfqId,
      contactId: contactId,
      shippingLineId: shippingLineId,
    });
    quoteId = quote.data.id;
    console.log("✅ Create quote successful");

    // Get quotes
    const quotes = await makeRequest("GET", "/quotes");
    console.log("✅ Get quotes successful");

    // Get quote by ID
    const quoteById = await makeRequest("GET", `/quotes/${quoteId}`);
    console.log("✅ Get quote by ID successful");

    // Update quote
    const updatedQuote = await makeRequest("PUT", `/quotes/${quoteId}`, {
      oceanFreight: 1600,
      totalAmount: 2200,
      notes: "Updated quote for testing",
    });
    console.log("✅ Update quote successful");

    // Get quotes by RFQ
    const quotesByRFQ = await makeRequest("GET", `/quotes/rfq/${rfqId}`);
    console.log("✅ Get quotes by RFQ successful");

    // Compare quotes
    const quoteComparison = await makeRequest(
      "POST",
      `/quotes/${quoteId}/compare`,
      {
        quoteIds: [quoteId],
      }
    );
    console.log("✅ Compare quotes successful");

    // Mark quote as winner
    await makeRequest("POST", `/quotes/${quoteId}/award`, {
      notes: "Best quote received",
    });
    console.log("✅ Award quote successful");

    // Get quote analytics
    const quoteAnalytics = await makeRequest("GET", "/quotes/analytics");
    console.log("✅ Get quote analytics successful");

    // Get market trends
    const marketTrends = await makeRequest("GET", "/quotes/market-trends");
    console.log("✅ Get market trends successful");

    // Get historical comparison
    const historicalComparison = await makeRequest(
      "GET",
      "/quotes/historical-comparison"
    );
    console.log("✅ Get historical comparison successful");

    // Get rate optimization
    const rateOptimization = await makeRequest(
      "GET",
      "/quotes/rate-optimization"
    );
    console.log("✅ Get rate optimization successful");

    // Clean up
    await makeRequest("DELETE", `/quotes/${quoteId}`);
    await makeRequest("DELETE", `/contacts/${contactId}`);
    await makeRequest("DELETE", `/shipping-lines/${shippingLineId}`);
    await makeRequest("DELETE", `/rfqs/${rfqId}`);

    return true;
  } catch (error) {
    console.log("❌ Quote management tests failed");
    return false;
  }
}

async function testAnalyticsReporting() {
  console.log("\n📊 Testing Analytics & Reporting...");

  try {
    // Get company analytics
    const companyAnalytics = await makeRequest("GET", "/analytics");
    console.log("✅ Get company analytics successful");

    // Get RFQ analytics
    const rfqAnalytics = await makeRequest("GET", "/analytics/rfqs");
    console.log("✅ Get RFQ analytics successful");

    // Get quote analytics
    const quoteAnalytics = await makeRequest("GET", "/analytics/quotes");
    console.log("✅ Get quote analytics successful");

    // Get contact analytics
    const contactAnalytics = await makeRequest("GET", "/analytics/contacts");
    console.log("✅ Get contact analytics successful");

    // Get email analytics
    const emailAnalytics = await makeRequest("GET", "/analytics/emails");
    console.log("✅ Get email analytics successful");

    // Get carrier performance analytics
    const carrierAnalytics = await makeRequest("GET", "/analytics/carriers");
    console.log("✅ Get carrier performance analytics successful");

    // Get route performance analytics
    const routeAnalytics = await makeRequest("GET", "/analytics/routes");
    console.log("✅ Get route performance analytics successful");

    // Get business intelligence
    const businessIntelligence = await makeRequest(
      "GET",
      "/analytics/business-intelligence"
    );
    console.log("✅ Get business intelligence successful");

    // Export analytics to CSV
    const csvExport = await makeRequest(
      "GET",
      "/analytics/export/csv?type=rfq"
    );
    console.log("✅ Export analytics to CSV successful");

    // Export analytics to PDF
    const pdfExport = await makeRequest(
      "GET",
      "/analytics/export/pdf?type=quotes"
    );
    console.log("✅ Export analytics to PDF successful");

    // Get custom reports
    const customReports = await makeRequest("GET", "/analytics/custom-reports");
    console.log("✅ Get custom reports successful");

    return true;
  } catch (error) {
    console.log("❌ Analytics & reporting tests failed");
    return false;
  }
}

async function testCompanyBillingSettings() {
  console.log("\n💳 Testing Company & Billing Settings...");

  try {
    // Get company profile
    const companyProfile = await makeRequest("GET", "/profile");
    console.log("✅ Get company profile successful");

    // Update company profile
    const updatedProfile = await makeRequest("PUT", "/profile", {
      name: "Updated Test Company",
      phone: "+1987654321",
      address: "456 Updated Street",
      city: "Updated City",
      country: "USA",
      emailFooter: "Best regards,\nTest Company Team",
      followUpRules: {
        enabled: true,
        maxFollowUps: 3,
        daysBetweenFollowUps: 3,
      },
    });
    console.log("✅ Update company profile successful");

    // Get subscription details
    const subscription = await makeRequest("GET", "/subscription");
    console.log("✅ Get subscription details successful");

    // Update subscription
    const updatedSubscription = await makeRequest("PUT", "/subscription", {
      plan: "professional",
      billingCycle: "monthly",
    });
    console.log("✅ Update subscription successful");

    // Get billing settings
    const billingSettings = await makeRequest("GET", "/billing-settings");
    console.log("✅ Get billing settings successful");

    // Update billing settings
    const updatedBillingSettings = await makeRequest(
      "PUT",
      "/billing-settings",
      {
        billingEmail: "billing@company.com",
        taxId: "TAX123456",
        address: {
          street: "123 Billing Street",
          city: "Billing City",
          state: "CA",
          zipCode: "12345",
          country: "USA",
        },
      }
    );
    console.log("✅ Update billing settings successful");

    // Get payment methods
    const paymentMethods = await makeRequest("GET", "/payment-methods");
    console.log("✅ Get payment methods successful");

    // Add payment method
    const newPaymentMethod = await makeRequest("POST", "/payment-methods", {
      type: "card",
      cardNumber: "4242424242424242",
      expiryMonth: 12,
      expiryYear: 2025,
      cvc: "123",
      name: "Test Card",
    });
    console.log("✅ Add payment method successful");

    // Set default payment method
    await makeRequest(
      "PUT",
      `/payment-methods/${newPaymentMethod.data.id}/set-default`
    );
    console.log("✅ Set default payment method successful");

    // Get API keys
    const apiKeys = await makeRequest("GET", "/api-keys");
    console.log("✅ Get API keys successful");

    // Generate new API key
    const newApiKey = await makeRequest("POST", "/api-keys", {
      name: "Test API Key",
      description: "API key for testing",
      permissions: ["read", "write"],
    });
    console.log("✅ Generate new API key successful");

    // Get usage metrics
    const usageMetrics = await makeRequest("GET", "/usage-metrics");
    console.log("✅ Get usage metrics successful");

    // Get billing history
    const billingHistory = await makeRequest("GET", "/billing-history");
    console.log("✅ Get billing history successful");

    return true;
  } catch (error) {
    console.log("❌ Company & billing settings tests failed");
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log("🚀 Starting Company Advanced API Tests...\n");

  const tests = [
    { name: "Server Health", fn: testServerHealth },
    { name: "Company Login", fn: testCompanyLogin },
    { name: "Email Send Engine", fn: testEmailSendEngine },
    { name: "Follow-Up Engine", fn: testFollowUpEngine },
    { name: "Reply Ingestion", fn: testReplyIngestion },
    { name: "Quote Management", fn: testQuoteManagement },
    { name: "Analytics & Reporting", fn: testAnalyticsReporting },
    { name: "Company & Billing Settings", fn: testCompanyBillingSettings },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} test failed with error:`, error.message);
      failed++;
    }
  }

  console.log("\n📊 Test Results:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(
    `📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
  );

  if (failed === 0) {
    console.log(
      "\n🎉 All tests passed! Company Advanced APIs are working correctly."
    );
  } else {
    console.log("\n⚠️  Some tests failed. Please check the errors above.");
  }
}

// Run tests
runAllTests().catch(console.error);
