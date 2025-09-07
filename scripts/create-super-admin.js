const { execSync } = require("child_process");
const path = require("path");

console.log("Creating super admin user...");

try {
  // Compile TypeScript and run the script
  execSync("npx ts-node src/admin/scripts/createSuperAdmin.ts", {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });

  console.log("✅ Super admin created successfully!");
  console.log("📧 Email: superadmin@rfqplatform.com");
  console.log("🔑 Password: admin123");
  console.log("⚠️  Please change the password in production!");
} catch (error) {
  console.error("❌ Failed to create super admin:", error.message);
  process.exit(1);
}
