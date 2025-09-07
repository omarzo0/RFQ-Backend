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

// Test data
const testCompany = {
  name: "Test Shipping Company",
  email: "test@shippingcompany.com",
  phone: "+1234567890",
  address: "123 Test Street",
  city: "Test City",
  country: "USA",
  subscriptionPlan: "professional",
  subscriptionStatus: "ACTIVE",
};

const testUser = {
  email: "testuser@shippingcompany.com",
  password: "TestPassword123!",
  firstName: "Test",
  lastName: "User",
  role: "ADMIN",
};

const testShippingLine = {
  name: "Test Shipping Line",
  code: "TSL",
  scacCode: "TSL",
  website: "https://testshipping.com",
  headquartersLocation: "Test City",
  headquartersCountry: "USA",
  description: "Test shipping line for testing",
  tags: ["test", "shipping"],
  tradeLanes: ["Asia-Europe"],
  services: ["Container", "Breakbulk"],
  specialization: "Container Shipping",
  reliability: 4,
  serviceQuality: 4,
};

const testContact = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@testshipping.com",
  phone: "+1234567890",
  jobTitle: "Sales Manager",
  department: "Sales",
  tags: ["primary", "sales"],
  notes: "Test contact for testing",
  seniority: "SENIOR",
  specialization: "Container Shipping",
  quoteQuality: 4,
  reliability: 4,
  isPrimary: true,
};

const testRFQ = {
  title: "Test RFQ for Container Shipping",
  description: "Test RFQ description",
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
  preferredCarriers: ["Test Shipping Line"],
  tradeLane: "Asia-North America",
  estimatedValue: 50000,
  currency: "USD",
  notes: "Test RFQ for testing",
  tags: ["test", "container"],
  priority: "MEDIUM",
};

const testTemplate = {
  name: "Test RFQ Template",
  description: "Test template for container shipping",
  subjectTemplate:
    "RFQ Request - {{commodity}} from {{originPort}} to {{destinationPort}}",
  bodyTemplate: "Please find attached RFQ details for {{commodity}} shipping.",
  originPort: "Shanghai",
  destinationPort: "Los Angeles",
  commodity: "Electronics",
  containerType: "40GP",
  containerQuantity: 1,
  cargoWeight: 20000,
  cargoVolume: 67,
  incoterm: "FOB",
  specialRequirements: "None",
  requiredServices: ["Container"],
  category: "Container Shipping",
  tradeLane: "Asia-North America",
  language: "en",
  tags: ["test", "container"],
  isPublic: false,
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

async function testUserManagement() {
  console.log("\n👥 Testing User Management...");

  try {
    // Get users
    const users = await makeRequest("GET", "/users");
    console.log("✅ Get users successful");

    // Create user
    const newUser = await makeRequest("POST", "/users", {
      ...testUser,
      email: "newuser@shippingcompany.com",
    });
    console.log("✅ Create user successful");

    // Update user
    const updatedUser = await makeRequest("PUT", `/users/${newUser.data.id}`, {
      firstName: "Updated",
      lastName: "User",
    });
    console.log("✅ Update user successful");

    // Get user by ID
    const user = await makeRequest("GET", `/users/${newUser.data.id}`);
    console.log("✅ Get user by ID successful");

    // Update user status
    await makeRequest("PUT", `/users/${newUser.data.id}/status`, {
      status: false,
    });
    console.log("✅ Update user status successful");

    // Update user role
    await makeRequest("PUT", `/users/${newUser.data.id}/role`, {
      role: "MANAGER",
    });
    console.log("✅ Update user role successful");

    // Get user roles
    const roles = await makeRequest("GET", "/users/roles");
    console.log("✅ Get user roles successful");

    // Get user permissions
    const permissions = await makeRequest("GET", "/users/permissions");
    console.log("✅ Get user permissions successful");

    // Delete user
    await makeRequest("DELETE", `/users/${newUser.data.id}`);
    console.log("✅ Delete user successful");

    return true;
  } catch (error) {
    console.log("❌ User management tests failed");
    return false;
  }
}

async function testShippingLineManagement() {
  console.log("\n🚢 Testing Shipping Line Management...");

  try {
    // Get shipping lines
    const shippingLines = await makeRequest("GET", "/shipping-lines");
    console.log("✅ Get shipping lines successful");

    // Create shipping line
    const newShippingLine = await makeRequest(
      "POST",
      "/shipping-lines",
      testShippingLine
    );
    shippingLineId = newShippingLine.data.id;
    console.log("✅ Create shipping line successful");

    // Get shipping line by ID
    const shippingLine = await makeRequest(
      "GET",
      `/shipping-lines/${shippingLineId}`
    );
    console.log("✅ Get shipping line by ID successful");

    // Update shipping line
    const updatedShippingLine = await makeRequest(
      "PUT",
      `/shipping-lines/${shippingLineId}`,
      {
        name: "Updated Test Shipping Line",
        description: "Updated description",
      }
    );
    console.log("✅ Update shipping line successful");

    // Get trade lanes
    const tradeLanes = await makeRequest("GET", "/shipping-lines/trade-lanes");
    console.log("✅ Get trade lanes successful");

    // Get services
    const services = await makeRequest("GET", "/shipping-lines/services");
    console.log("✅ Get services successful");

    // Get tags
    const tags = await makeRequest("GET", "/shipping-lines/tags");
    console.log("✅ Get tags successful");

    // Update shipping line status
    await makeRequest("PUT", `/shipping-lines/${shippingLineId}/status`, {
      isActive: false,
    });
    console.log("✅ Update shipping line status successful");

    // Archive shipping line
    await makeRequest("PUT", `/shipping-lines/${shippingLineId}/archive`);
    console.log("✅ Archive shipping line successful");

    // Restore shipping line
    await makeRequest("PUT", `/shipping-lines/${shippingLineId}/restore`);
    console.log("✅ Restore shipping line successful");

    // Delete shipping line
    await makeRequest("DELETE", `/shipping-lines/${shippingLineId}`);
    console.log("✅ Delete shipping line successful");

    return true;
  } catch (error) {
    console.log("❌ Shipping line management tests failed");
    return false;
  }
}

async function testContactManagement() {
  console.log("\n📞 Testing Contact Management...");

  try {
    // First create a shipping line for the contact
    const shippingLine = await makeRequest(
      "POST",
      "/shipping-lines",
      testShippingLine
    );
    shippingLineId = shippingLine.data.id;

    // Get contacts
    const contacts = await makeRequest("GET", "/contacts");
    console.log("✅ Get contacts successful");

    // Create contact
    const newContact = await makeRequest("POST", "/contacts", {
      ...testContact,
      shippingLineId: shippingLineId,
    });
    contactId = newContact.data.id;
    console.log("✅ Create contact successful");

    // Get contact by ID
    const contact = await makeRequest("GET", `/contacts/${contactId}`);
    console.log("✅ Get contact by ID successful");

    // Update contact
    const updatedContact = await makeRequest("PUT", `/contacts/${contactId}`, {
      firstName: "Updated",
      lastName: "Contact",
      notes: "Updated notes",
    });
    console.log("✅ Update contact successful");

    // Get departments
    const departments = await makeRequest("GET", "/contacts/departments");
    console.log("✅ Get departments successful");

    // Get tags
    const tags = await makeRequest("GET", "/contacts/tags");
    console.log("✅ Get tags successful");

    // Get seniority levels
    const seniorityLevels = await makeRequest(
      "GET",
      "/contacts/seniority-levels"
    );
    console.log("✅ Get seniority levels successful");

    // Get specializations
    const specializations = await makeRequest(
      "GET",
      "/contacts/specializations"
    );
    console.log("✅ Get specializations successful");

    // Set primary contact
    await makeRequest("PUT", `/contacts/${contactId}/set-primary`);
    console.log("✅ Set primary contact successful");

    // Update do not contact status
    await makeRequest("PUT", `/contacts/${contactId}/do-not-contact`, {
      doNotContact: true,
    });
    console.log("✅ Update do not contact status successful");

    // Get performance stats
    const performanceStats = await makeRequest(
      "GET",
      "/contacts/performance-stats"
    );
    console.log("✅ Get performance stats successful");

    // Update contact status
    await makeRequest("PUT", `/contacts/${contactId}/status`, {
      isActive: false,
    });
    console.log("✅ Update contact status successful");

    // Archive contact
    await makeRequest("PUT", `/contacts/${contactId}/archive`);
    console.log("✅ Archive contact successful");

    // Restore contact
    await makeRequest("PUT", `/contacts/${contactId}/restore`);
    console.log("✅ Restore contact successful");

    // Delete contact
    await makeRequest("DELETE", `/contacts/${contactId}`);
    console.log("✅ Delete contact successful");

    // Clean up shipping line
    await makeRequest("DELETE", `/shipping-lines/${shippingLineId}`);

    return true;
  } catch (error) {
    console.log("❌ Contact management tests failed");
    return false;
  }
}

async function testRFQManagement() {
  console.log("\n📋 Testing RFQ Management...");

  try {
    // Get RFQs
    const rfqs = await makeRequest("GET", "/rfqs");
    console.log("✅ Get RFQs successful");

    // Create RFQ
    const newRFQ = await makeRequest("POST", "/rfqs", testRFQ);
    rfqId = newRFQ.data.id;
    console.log("✅ Create RFQ successful");

    // Get RFQ by ID
    const rfq = await makeRequest("GET", `/rfqs/${rfqId}`);
    console.log("✅ Get RFQ by ID successful");

    // Update RFQ
    const updatedRFQ = await makeRequest("PUT", `/rfqs/${rfqId}`, {
      title: "Updated Test RFQ",
      description: "Updated description",
    });
    console.log("✅ Update RFQ successful");

    // Get trade lanes
    const tradeLanes = await makeRequest("GET", "/rfqs/trade-lanes");
    console.log("✅ Get trade lanes successful");

    // Get tags
    const tags = await makeRequest("GET", "/rfqs/tags");
    console.log("✅ Get tags successful");

    // Update RFQ status
    await makeRequest("PUT", `/rfqs/${rfqId}/status`, {
      status: "SENT",
    });
    console.log("✅ Update RFQ status successful");

    // Close RFQ
    await makeRequest("PUT", `/rfqs/${rfqId}/close`);
    console.log("✅ Close RFQ successful");

    // Get RFQ analytics
    const analytics = await makeRequest("GET", "/rfqs/analytics");
    console.log("✅ Get RFQ analytics successful");

    // Duplicate RFQ
    const duplicatedRFQ = await makeRequest("POST", `/rfqs/${rfqId}/duplicate`);
    console.log("✅ Duplicate RFQ successful");

    // Delete duplicated RFQ
    await makeRequest("DELETE", `/rfqs/${duplicatedRFQ.data.id}`);
    console.log("✅ Delete duplicated RFQ successful");

    // Delete original RFQ
    await makeRequest("DELETE", `/rfqs/${rfqId}`);
    console.log("✅ Delete RFQ successful");

    return true;
  } catch (error) {
    console.log("❌ RFQ management tests failed");
    return false;
  }
}

async function testTemplateManagement() {
  console.log("\n📄 Testing Template Management...");

  try {
    // Get templates
    const templates = await makeRequest("GET", "/templates");
    console.log("✅ Get templates successful");

    // Create template
    const newTemplate = await makeRequest("POST", "/templates", testTemplate);
    templateId = newTemplate.data.id;
    console.log("✅ Create template successful");

    // Get template by ID
    const template = await makeRequest("GET", `/templates/${templateId}`);
    console.log("✅ Get template by ID successful");

    // Update template
    const updatedTemplate = await makeRequest(
      "PUT",
      `/templates/${templateId}`,
      {
        name: "Updated Test Template",
        description: "Updated description",
      }
    );
    console.log("✅ Update template successful");

    // Get template categories
    const categories = await makeRequest("GET", "/templates/categories");
    console.log("✅ Get template categories successful");

    // Get template languages
    const languages = await makeRequest("GET", "/templates/languages");
    console.log("✅ Get template languages successful");

    // Get template tags
    const tags = await makeRequest("GET", "/templates/tags");
    console.log("✅ Get template tags successful");

    // Get template trade lanes
    const tradeLanes = await makeRequest("GET", "/templates/trade-lanes");
    console.log("✅ Get template trade lanes successful");

    // Use template
    const usedTemplate = await makeRequest(
      "POST",
      `/templates/${templateId}/use`,
      {
        variables: {
          commodity: "Electronics",
          originPort: "Shanghai",
          destinationPort: "Los Angeles",
        },
      }
    );
    console.log("✅ Use template successful");

    // Set default template
    await makeRequest("PUT", `/templates/${templateId}/set-default`);
    console.log("✅ Set default template successful");

    // Duplicate template
    const duplicatedTemplate = await makeRequest(
      "POST",
      `/templates/${templateId}/duplicate`,
      {
        name: "Duplicated Template",
        description: "Duplicated description",
      }
    );
    console.log("✅ Duplicate template successful");

    // Delete duplicated template
    await makeRequest("DELETE", `/templates/${duplicatedTemplate.data.id}`);
    console.log("✅ Delete duplicated template successful");

    // Get template analytics
    const analytics = await makeRequest("GET", "/templates/analytics");
    console.log("✅ Get template analytics successful");

    // Update template status
    await makeRequest("PUT", `/templates/${templateId}/status`, {
      isActive: false,
    });
    console.log("✅ Update template status successful");

    // Delete template
    await makeRequest("DELETE", `/templates/${templateId}`);
    console.log("✅ Delete template successful");

    return true;
  } catch (error) {
    console.log("❌ Template management tests failed");
    return false;
  }
}

async function testAnalytics() {
  console.log("\n📊 Testing Analytics...");

  try {
    // Get company analytics
    const analytics = await makeRequest("GET", "/analytics");
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

    return true;
  } catch (error) {
    console.log("❌ Analytics tests failed");
    return false;
  }
}

async function testCompanyProfile() {
  console.log("\n🏢 Testing Company Profile...");

  try {
    // Get company profile
    const profile = await makeRequest("GET", "/profile");
    console.log("✅ Get company profile successful");

    // Update company profile
    const updatedProfile = await makeRequest("PUT", "/profile", {
      name: "Updated Test Company",
      phone: "+1987654321",
    });
    console.log("✅ Update company profile successful");

    return true;
  } catch (error) {
    console.log("❌ Company profile tests failed");
    return false;
  }
}

async function testAuthentication() {
  console.log("\n🔐 Testing Authentication...");

  try {
    // Get current user profile
    const profile = await makeRequest("GET", "/auth/profile");
    console.log("✅ Get current user profile successful");

    // Change password
    await makeRequest("PUT", "/auth/change-password", {
      currentPassword: "TestPassword123!",
      newPassword: "NewTestPassword123!",
    });
    console.log("✅ Change password successful");

    // Change password back
    await makeRequest("PUT", "/auth/change-password", {
      currentPassword: "NewTestPassword123!",
      newPassword: "TestPassword123!",
    });
    console.log("✅ Change password back successful");

    // Refresh token
    const refreshResponse = await makeRequest("POST", "/auth/refresh", {
      refreshToken: refreshToken,
    });
    accessToken = refreshResponse.data.tokens.accessToken;
    refreshToken = refreshResponse.data.tokens.refreshToken;
    console.log("✅ Refresh token successful");

    // Logout
    await makeRequest("POST", "/auth/logout");
    console.log("✅ Logout successful");

    return true;
  } catch (error) {
    console.log("❌ Authentication tests failed");
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log("🚀 Starting Company API Tests...\n");

  const tests = [
    { name: "Server Health", fn: testServerHealth },
    { name: "Company Login", fn: testCompanyLogin },
    { name: "User Management", fn: testUserManagement },
    { name: "Shipping Line Management", fn: testShippingLineManagement },
    { name: "Contact Management", fn: testContactManagement },
    { name: "RFQ Management", fn: testRFQManagement },
    { name: "Template Management", fn: testTemplateManagement },
    { name: "Analytics", fn: testAnalytics },
    { name: "Company Profile", fn: testCompanyProfile },
    { name: "Authentication", fn: testAuthentication },
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
    console.log("\n🎉 All tests passed! Company APIs are working correctly.");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the errors above.");
  }
}

// Run tests
runAllTests().catch(console.error);
