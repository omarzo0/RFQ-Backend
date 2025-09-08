const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 Setting up complete company environment...");
console.log(
  "This will create all company data including users, shipping lines, contacts, templates, RFQs, quotes, and more!\n"
);

try {
  // Step 1: Create basic company data
  console.log("📋 Step 1: Creating basic company data...");
  execSync("node scripts/create-company-data.js", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("\n" + "=".repeat(50) + "\n");

  // Step 2: Create additional test data
  console.log("📊 Step 2: Creating additional test data...");
  execSync("node scripts/create-additional-test-data.js", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("\n" + "=".repeat(50) + "\n");

  // Step 3: Summary
  console.log("🎉 Company environment setup completed successfully!");
  console.log("\n📋 What was created:");
  console.log("   🏢 Company: Test Shipping Company");
  console.log("   👥 Users: Admin + Employee");
  console.log("   🚢 Shipping Lines: 3 (Maersk, MSC, CMA CGM)");
  console.log("   👤 Contacts: 3 (one for each shipping line)");
  console.log("   📄 RFQ Templates: 2 (Standard + Reefer)");
  console.log("   📧 Email Templates: 2 (RFQ + Follow-up)");
  console.log("   ⏰ Follow-up Rules: 2 (Standard + Urgent)");
  console.log("   📋 RFQs: 4 (1 original + 3 additional)");
  console.log("   💰 Quotes: 7 (2 original + 5 additional)");
  console.log("   📢 Email Campaigns: 2");
  console.log("   📊 Usage Metrics: 5");
  console.log("   📧 Email Logs: 2");

  console.log("\n🔑 Login Credentials:");
  console.log("   👤 Admin: admin@testshipping.com / admin123");
  console.log("   👤 Employee: employee@testshipping.com / employee123");

  console.log("\n🚀 Next Steps:");
  console.log("   1. Start your server: npm run dev");
  console.log(
    "   2. Import the Postman collection: postman/company/RFQ_Company_APIs_Complete.postman_collection.json"
  );
  console.log(
    "   3. Import the environment: postman/company/RFQ_Company_Environment.postman_environment.json"
  );
  console.log("   4. Start testing the APIs!");

  console.log("\n⚠️  Important Notes:");
  console.log("   - Change passwords in production!");
  console.log("   - All data is for testing purposes only");
  console.log("   - Use the Postman collection for comprehensive API testing");
} catch (error) {
  console.error("❌ Failed to setup company environment:", error.message);
  process.exit(1);
}
