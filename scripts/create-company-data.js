const { execSync } = require("child_process");
const path = require("path");

console.log("Creating company data...");

try {
  // Compile TypeScript and run the script
  execSync("npx ts-node src/company/scripts/createCompanyData.ts", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("✅ Company data created successfully!");
  console.log("🏢 Company: Test Shipping Company (testcompany@shipping.com)");
  console.log("👤 Admin: admin@testshipping.com / admin123");
  console.log("👤 Employee: employee@testshipping.com / employee123");
  console.log(
    "📊 Includes: Shipping lines, contacts, templates, RFQs, quotes, and more!"
  );
  console.log("⚠️  Please change the passwords in production!");
} catch (error) {
  console.error("❌ Failed to create company data:", error.message);
  process.exit(1);
}
