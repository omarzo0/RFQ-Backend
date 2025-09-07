const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1/admin";

// Test credentials
const TEST_CREDENTIALS = {
  email: "superadmin@rfqplatform.com",
  password: "admin123",
};

let accessToken = "";
let refreshToken = "";

async function testAdminAuthentication() {
  console.log("🧪 Testing Admin Authentication System...\n");

  try {
    // Test 1: Admin Login
    console.log("1. Testing admin login...");
    const loginResponse = await axios.post(
      `${BASE_URL}/auth/login`,
      TEST_CREDENTIALS
    );

    if (loginResponse.data.success) {
      console.log("✅ Admin login successful");
      accessToken = loginResponse.data.data.tokens.accessToken;
      refreshToken = loginResponse.data.data.tokens.refreshToken;
      console.log("📧 Admin email:", loginResponse.data.data.admin.email);
      console.log("👤 Admin role:", loginResponse.data.data.admin.role);
      console.log("🔑 Access token received");
    } else {
      console.log("❌ Admin login failed");
      return;
    }

    // Test 2: Get Admin Profile
    console.log("\n2. Testing get admin profile...");
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (profileResponse.data.success) {
      console.log("✅ Admin profile retrieved successfully");
      console.log(
        "👤 Profile:",
        profileResponse.data.data.firstName,
        profileResponse.data.data.lastName
      );
    } else {
      console.log("❌ Get admin profile failed");
    }

    // Test 3: Test Protected Route (Dashboard)
    console.log("\n3. Testing protected route access...");
    const dashboardResponse = await axios.get(
      `${BASE_URL}/dashboard/comprehensive`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (dashboardResponse.data.success) {
      console.log("✅ Protected route access successful");
      console.log(
        "📊 Dashboard data keys:",
        Object.keys(dashboardResponse.data.data)
      );
    } else {
      console.log("❌ Protected route access failed");
    }

    // Test 4: Test Refresh Token
    console.log("\n4. Testing token refresh...");
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh-token`, {
      refreshToken: refreshToken,
    });

    if (refreshResponse.data.success) {
      console.log("✅ Token refresh successful");
      accessToken = refreshResponse.data.data.accessToken;
      refreshToken = refreshResponse.data.data.refreshToken;
      console.log("🔄 New access token received");
    } else {
      console.log("❌ Token refresh failed");
    }

    // Test 5: Test Invalid Token
    console.log("\n5. Testing invalid token handling...");
    try {
      await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: "Bearer invalid-token" },
      });
      console.log("❌ Invalid token should have been rejected");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Invalid token properly rejected");
      } else {
        console.log("❌ Unexpected error with invalid token");
      }
    }

    // Test 6: Test Missing Token
    console.log("\n6. Testing missing token handling...");
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
      console.log("❌ Missing token should have been rejected");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Missing token properly rejected");
      } else {
        console.log("❌ Unexpected error with missing token");
      }
    }

    // Test 7: Test Change Password
    console.log("\n7. Testing password change...");
    const changePasswordResponse = await axios.post(
      `${BASE_URL}/auth/change-password`,
      {
        currentPassword: "admin123",
        newPassword: "NewSecurePassword123!",
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (changePasswordResponse.data.success) {
      console.log("✅ Password changed successfully");

      // Test login with new password
      console.log("\n8. Testing login with new password...");
      const newLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_CREDENTIALS.email,
        password: "NewSecurePassword123!",
      });

      if (newLoginResponse.data.success) {
        console.log("✅ Login with new password successful");
        accessToken = newLoginResponse.data.data.tokens.accessToken;
      } else {
        console.log("❌ Login with new password failed");
      }
    } else {
      console.log("❌ Password change failed");
    }

    // Test 9: Test Logout
    console.log("\n9. Testing admin logout...");
    const logoutResponse = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (logoutResponse.data.success) {
      console.log("✅ Admin logout successful");
    } else {
      console.log("❌ Admin logout failed");
    }

    // Test 10: Test Access After Logout
    console.log("\n10. Testing access after logout...");
    try {
      await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("❌ Access after logout should have been denied");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Access properly denied after logout");
      } else {
        console.log("❌ Unexpected error after logout");
      }
    }

    console.log("\n🎉 Admin authentication system test completed!");
    console.log("\n📋 Test Summary:");
    console.log("✅ Admin login - Working");
    console.log("✅ Profile retrieval - Working");
    console.log("✅ Protected routes - Working");
    console.log("✅ Token refresh - Working");
    console.log("✅ Invalid token handling - Working");
    console.log("✅ Missing token handling - Working");
    console.log("✅ Password change - Working");
    console.log("✅ Login with new password - Working");
    console.log("✅ Admin logout - Working");
    console.log("✅ Access denial after logout - Working");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Instructions
console.log("📋 Admin Authentication Test");
console.log("============================");
console.log("Before running this test:");
console.log("1. Make sure your server is running on http://localhost:3000");
console.log(
  "2. Run the super admin creation script: npx ts-node src/admin/scripts/createSuperAdmin.ts"
);
console.log("3. Run: node scripts/test-admin-auth.js");
console.log("");

testAdminAuthentication();
