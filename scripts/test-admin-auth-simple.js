const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1/admin";

async function testSimpleAdminAuth() {
  console.log("🧪 Testing Simple Admin Authentication...\n");

  try {
    // Test 1: Check if server is running
    console.log("1. Checking if server is running...");
    try {
      const healthResponse = await axios.get("http://localhost:3000/health");
      console.log("✅ Server is running");
    } catch (error) {
      console.log("❌ Server is not running or health endpoint not available");
      console.log("Please start the server first: npm run dev");
      return;
    }

    // Test 2: Test admin login
    console.log("\n2. Testing admin login...");
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: "superadmin@rfqplatform.com",
        password: "admin123",
      });

      if (loginResponse.data.success) {
        console.log("✅ Admin login successful");
        console.log("📧 Admin email:", loginResponse.data.data.admin.email);
        console.log("👤 Admin role:", loginResponse.data.data.admin.role);
        console.log(
          "🔑 Access token received:",
          loginResponse.data.data.tokens.accessToken.substring(0, 20) + "..."
        );
      } else {
        console.log("❌ Admin login failed:", loginResponse.data);
      }
    } catch (error) {
      console.log(
        "❌ Admin login error:",
        error.response?.data || error.message
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testSimpleAdminAuth();
