const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1/admin";

async function testQuickAdminAuth() {
  console.log("🧪 Quick Admin Authentication Test...\n");

  try {
    // Test 1: Check if admin login endpoint exists
    console.log("1. Testing admin login endpoint...");

    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email: "superadmin@rfqplatform.com",
        password: "admin123",
      },
      {
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500; // Accept any status code less than 500
        },
      }
    );

    console.log("📊 Response status:", loginResponse.status);
    console.log(
      "📊 Response data:",
      JSON.stringify(loginResponse.data, null, 2)
    );

    if (loginResponse.data.success) {
      console.log("✅ Admin login successful!");
      console.log(
        "🔑 Access token:",
        loginResponse.data.data.tokens.accessToken.substring(0, 20) + "..."
      );

      // Test protected route
      console.log("\n2. Testing protected route...");
      const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${loginResponse.data.data.tokens.accessToken}`,
        },
        timeout: 10000,
      });

      if (profileResponse.data.success) {
        console.log("✅ Protected route access successful!");
        console.log(
          "👤 Admin profile:",
          profileResponse.data.data.firstName,
          profileResponse.data.data.lastName
        );
      } else {
        console.log("❌ Protected route failed:", profileResponse.data);
      }
    } else {
      console.log("❌ Admin login failed:", loginResponse.data);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    if (error.response) {
      console.log("📊 Status:", error.response.status);
      console.log("📊 Data:", error.response.data);
    }
  }
}

testQuickAdminAuth();
