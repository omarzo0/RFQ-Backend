const { execSync } = require("child_process");
const path = require("path");

console.log("Creating new admin user...");

try {
  // Compile TypeScript and run the script
  execSync("npx ts-node src/admin/scripts/createNewAdmin.ts", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("✅ New admin created successfully!");
  console.log("📧 Email: admin@rfqplatform.com");
  console.log("🔑 Password: admin123");
  console.log("⚠️  Please change the password in production!");
} catch (error) {
  console.error("❌ Failed to create new admin:", error.message);
  process.exit(1);
}
