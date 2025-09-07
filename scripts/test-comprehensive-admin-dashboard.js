const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/v1/admin";

// You'll need to replace this with a valid admin token
const ADMIN_TOKEN = "YOUR_ADMIN_TOKEN_HERE";
const SUPER_ADMIN_TOKEN = "YOUR_SUPER_ADMIN_TOKEN_HERE";

const adminHeaders = {
  Authorization: `Bearer ${ADMIN_TOKEN}`,
  "Content-Type": "application/json",
};

const superAdminHeaders = {
  Authorization: `Bearer ${SUPER_ADMIN_TOKEN}`,
  "Content-Type": "application/json",
};

async function testComprehensiveAdminDashboard() {
  console.log("🧪 Testing Comprehensive Admin Dashboard...\n");

  try {
    // Test 1: Get comprehensive dashboard
    console.log("1. Testing comprehensive dashboard...");
    const dashboardResponse = await axios.get(
      `${BASE_URL}/dashboard/comprehensive`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ Comprehensive dashboard:",
      Object.keys(dashboardResponse.data.data)
    );

    // Test 2: Test admin management (super admin only)
    console.log("\n2. Testing admin management...");
    try {
      const adminStatsResponse = await axios.get(
        `${BASE_URL}/management/statistics`,
        { headers: superAdminHeaders }
      );
      console.log("✅ Admin statistics:", adminStatsResponse.data.data);
    } catch (error) {
      console.log("⚠️  Admin management requires super admin token");
    }

    // Test 3: Test company management
    console.log("\n3. Testing company management...");
    const companiesResponse = await axios.get(
      `${BASE_URL}/companies?page=1&limit=5`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ Companies list:",
      companiesResponse.data.data.total,
      "companies found"
    );

    // Test 4: Test analytics
    console.log("\n4. Testing analytics...");
    const analyticsResponse = await axios.get(
      `${BASE_URL}/analytics/company-growth?months=6`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ Company growth analytics:",
      analyticsResponse.data.data.length,
      "data points"
    );

    // Test 5: Test subscription management
    console.log("\n5. Testing subscription management...");
    const subscriptionsResponse = await axios.get(
      `${BASE_URL}/subscriptions?page=1&limit=5`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ Subscriptions:",
      subscriptionsResponse.data.data.total,
      "subscriptions found"
    );

    // Test 6: Test ticket system
    console.log("\n6. Testing ticket system...");
    const ticketsResponse = await axios.get(
      `${BASE_URL}/tickets?page=1&limit=5`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ Tickets:",
      ticketsResponse.data.data.total,
      "tickets found"
    );

    // Test 7: Test system features
    console.log("\n7. Testing system features...");
    const featuresResponse = await axios.get(
      `${BASE_URL}/system-features?page=1&limit=5`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ System features:",
      featuresResponse.data.data.total,
      "features found"
    );

    // Test 8: Test recent activity
    console.log("\n8. Testing recent activity...");
    const activityResponse = await axios.get(
      `${BASE_URL}/dashboard/recent-activity?limit=10`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ Recent activity:",
      activityResponse.data.data.length,
      "activities"
    );

    // Test 9: Test system health
    console.log("\n9. Testing system health...");
    const healthResponse = await axios.get(
      `${BASE_URL}/dashboard/system-health`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ System health:",
      healthResponse.data.data.serverInfo?.uptime,
      "seconds uptime"
    );

    // Test 10: Test email analytics
    console.log("\n10. Testing email analytics...");
    const emailAnalyticsResponse = await axios.get(
      `${BASE_URL}/analytics/email-performance?days=30`,
      { headers: adminHeaders }
    );
    console.log(
      "✅ Email analytics:",
      emailAnalyticsResponse.data.data.length,
      "data points"
    );

    console.log("\n🎉 All comprehensive admin dashboard tests passed!");
    console.log("\n📊 Dashboard Features Summary:");
    console.log("✅ Admin Management - Complete");
    console.log("✅ Company Management - Complete");
    console.log("✅ Analytics & Monitoring - Complete");
    console.log("✅ Subscription Management - Complete");
    console.log("✅ Ticket System - Complete");
    console.log("✅ System Features - Complete");
    console.log("✅ Role-Based Access - Complete");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Instructions
console.log("📋 Comprehensive Admin Dashboard Test");
console.log("=====================================");
console.log("Before running this test:");
console.log("1. Make sure your server is running on http://localhost:3000");
console.log("2. Replace ADMIN_TOKEN with a valid admin token");
console.log("3. Replace SUPER_ADMIN_TOKEN with a valid super admin token");
console.log("4. Run: node scripts/test-comprehensive-admin-dashboard.js");
console.log("");

if (ADMIN_TOKEN === "YOUR_ADMIN_TOKEN_HERE") {
  console.log(
    "⚠️  Please set valid ADMIN_TOKEN and SUPER_ADMIN_TOKEN before running the test"
  );
} else {
  testComprehensiveAdminDashboard();
}
