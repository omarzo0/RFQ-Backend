const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1/admin";

// You'll need to replace this with a valid super admin token
const SUPER_ADMIN_TOKEN = "YOUR_SUPER_ADMIN_TOKEN_HERE";

const headers = {
  Authorization: `Bearer ${SUPER_ADMIN_TOKEN}`,
  "Content-Type": "application/json",
};

async function testAdminManagement() {
  console.log("🧪 Testing Admin Management API...\n");

  try {
    // Test 1: Create a new admin
    console.log("1. Creating a new admin...");
    const createResponse = await axios.post(
      `${BASE_URL}/management/admins`,
      {
        email: "test-admin@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "Admin",
        role: "ADMIN",
        isActive: true,
      },
      { headers }
    );

    console.log("✅ Admin created:", createResponse.data.data.email);
    const adminId = createResponse.data.data.id;

    // Test 2: Get all admins
    console.log("\n2. Getting all admins...");
    const listResponse = await axios.get(
      `${BASE_URL}/management/admins?page=1&limit=10`,
      { headers }
    );
    console.log("✅ Found", listResponse.data.data.total, "admins");

    // Test 3: Get admin by ID
    console.log("\n3. Getting admin by ID...");
    const getResponse = await axios.get(
      `${BASE_URL}/management/admins/${adminId}`,
      { headers }
    );
    console.log("✅ Admin retrieved:", getResponse.data.data.email);

    // Test 4: Update admin
    console.log("\n4. Updating admin...");
    const updateResponse = await axios.put(
      `${BASE_URL}/management/admins/${adminId}`,
      {
        firstName: "Updated",
        lastName: "Admin",
      },
      { headers }
    );
    console.log(
      "✅ Admin updated:",
      updateResponse.data.data.firstName,
      updateResponse.data.data.lastName
    );

    // Test 5: Get admin statistics
    console.log("\n5. Getting admin statistics...");
    const statsResponse = await axios.get(`${BASE_URL}/management/statistics`, {
      headers,
    });
    console.log("✅ Admin statistics:", statsResponse.data.data);

    // Test 6: Change admin password
    console.log("\n6. Changing admin password...");
    await axios.post(
      `${BASE_URL}/management/admins/${adminId}/change-password`,
      {
        newPassword: "newpassword123",
      },
      { headers }
    );
    console.log("✅ Password changed successfully");

    // Test 7: Deactivate admin
    console.log("\n7. Deactivating admin...");
    const deleteResponse = await axios.delete(
      `${BASE_URL}/management/admins/${adminId}`,
      { headers }
    );
    console.log("✅ Admin deactivated:", deleteResponse.data.data.isActive);

    // Test 8: Restore admin
    console.log("\n8. Restoring admin...");
    const restoreResponse = await axios.post(
      `${BASE_URL}/management/admins/${adminId}/restore`,
      {},
      { headers }
    );
    console.log("✅ Admin restored:", restoreResponse.data.data.isActive);

    console.log("\n🎉 All admin management tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Instructions
console.log("📋 Admin Management API Test");
console.log("============================");
console.log("Before running this test:");
console.log("1. Make sure your server is running on http://localhost:3000");
console.log("2. Replace SUPER_ADMIN_TOKEN with a valid super admin token");
console.log("3. Run: node scripts/test-admin-management.js");
console.log("");

if (SUPER_ADMIN_TOKEN === "YOUR_SUPER_ADMIN_TOKEN_HERE") {
  console.log(
    "⚠️  Please set a valid SUPER_ADMIN_TOKEN before running the test"
  );
} else {
  testAdminManagement();
}
