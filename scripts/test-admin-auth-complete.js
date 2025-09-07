const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1/admin";

async function testCompleteAdminAuth() {
  console.log("🧪 Testing Complete Admin Authentication System...\n");

  try {
    // Test 1: Check server health
    console.log("1. Checking server health...");
    try {
      const healthResponse = await axios.get("http://localhost:3000/", {
        timeout: 5000,
      });
      console.log("✅ Server is running");
      console.log("📊 API Info:", healthResponse.data.message);
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        console.log("❌ Server is not running");
        console.log("Please start the server with: npm run dev");
        return;
      } else {
        console.log(
          "⚠️  Server responded but health check failed:",
          error.message
        );
      }
    }

    // Test 2: Test admin login
    console.log("\n2. Testing admin login...");
    try {
      const loginResponse = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          email: "superadmin@rfqplatform.com",
          password: "admin123",
        },
        { timeout: 10000 }
      );

      if (loginResponse.data.success) {
        console.log("✅ Admin login successful");
        console.log("📧 Admin email:", loginResponse.data.data.admin.email);
        console.log("👤 Admin role:", loginResponse.data.data.admin.role);
        console.log("🔑 Access token received");

        const accessToken = loginResponse.data.data.tokens.accessToken;

        // Test 3: Test protected route
        console.log("\n3. Testing protected route access...");
        try {
          const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 10000,
          });

          if (profileResponse.data.success) {
            console.log("✅ Protected route access successful");
            console.log(
              "👤 Profile:",
              profileResponse.data.data.firstName,
              profileResponse.data.data.lastName
            );
          } else {
            console.log(
              "❌ Protected route access failed:",
              profileResponse.data
            );
          }
        } catch (error) {
          console.log(
            "❌ Protected route error:",
            error.response?.data || error.message
          );
        }

        // Test 4: Test dashboard access
        console.log("\n4. Testing dashboard access...");
        try {
          const dashboardResponse = await axios.get(
            `${BASE_URL}/dashboard/comprehensive`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              timeout: 10000,
            }
          );

          if (dashboardResponse.data.success) {
            console.log("✅ Dashboard access successful");
            console.log(
              "📊 Dashboard data keys:",
              Object.keys(dashboardResponse.data.data)
            );
          } else {
            console.log("❌ Dashboard access failed:", dashboardResponse.data);
          }
        } catch (error) {
          console.log(
            "❌ Dashboard error:",
            error.response?.data || error.message
          );
        }
      } else {
        console.log("❌ Admin login failed:", loginResponse.data);
      }
    } catch (error) {
      console.log(
        "❌ Admin login error:",
        error.response?.data || error.message
      );
      if (error.response?.status === 404) {
        console.log("💡 Tip: Make sure the admin routes are properly mounted");
      }
    }

    console.log("\n🎉 Admin authentication test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Instructions
console.log("📋 Complete Admin Authentication Test");
console.log("=====================================");
console.log("Before running this test:");
console.log("1. Make sure your server is running: npm run dev");
console.log(
  "2. Run the super admin creation script: npx ts-node src/admin/scripts/createSuperAdmin.ts"
);
console.log("3. Run: node scripts/test-admin-auth-complete.js");
console.log("");

testCompleteAdminAuth();
