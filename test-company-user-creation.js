const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1";

async function testCompanyUserCreation() {
  try {
    console.log("🧪 Testing Company User Creation...\n");

    // Step 1: Create a company first
    console.log("1. Creating a test company...");
    const companyResponse = await axios.post(
      `${BASE_URL}/admin/companies`,
      {
        name: "Test Company for Users",
        email: "testcompany@example.com",
        phone: "+1234567890",
        address: "123 Test Street",
        city: "Test City",
        country: "USA",
      },
      {
        headers: {
          Authorization: "Bearer YOUR_ADMIN_TOKEN_HERE", // You'll need to replace this
        },
      }
    );

    const companyId = companyResponse.data.data.id;
    console.log("✅ Company created with ID:", companyId);

    // Step 2: Create a company user
    console.log("\n2. Creating a company user...");
    const userResponse = await axios.post(
      `${BASE_URL}/admin/companies/users`,
      {
        email: "testuser@example.com",
        password: "Test123!",
        companyId: companyId,
        firstName: "Test",
        lastName: "User",
        role: "EMPLOYEE",
      },
      {
        headers: {
          Authorization: "Bearer YOUR_ADMIN_TOKEN_HERE", // You'll need to replace this
        },
      }
    );

    console.log("✅ Company user created successfully!");
    console.log("User ID:", userResponse.data.data.id);
    console.log("User Email:", userResponse.data.data.email);
    console.log("Company:", userResponse.data.data.company.name);
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testCompanyUserCreation();
