const { execSync } = require("child_process");
const path = require("path");

console.log("Updating superadmin password...");

try {
  // Compile TypeScript and run the script
  execSync("npx ts-node --transpile-only src/admin/scripts/updateSuperAdminPassword.ts", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("✅ Superadmin password updated successfully!");
  console.log("📧 Email: superadmin@rfqplatform.com");
  console.log("🔑 New Password: omar123@");
} catch (error) {
  console.error("❌ Failed to update superadmin password:", error.message);
  process.exit(1);
}
