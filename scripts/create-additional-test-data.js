const { execSync } = require("child_process");
const path = require("path");

console.log("Creating additional test data...");

try {
  // Compile TypeScript and run the script
  execSync("npx ts-node src/company/scripts/createAdditionalTestData.ts", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("✅ Additional test data created successfully!");
  console.log(
    "📊 Includes: More RFQs, quotes, email campaigns, usage metrics, and email logs!"
  );
  console.log(
    "🚀 Your test environment is now fully populated with realistic data!"
  );
} catch (error) {
  console.error("❌ Failed to create additional test data:", error.message);
  process.exit(1);
}
