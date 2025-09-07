const fs = require("fs");
const path = require("path");

// Function to update middleware imports in route files
function updateRouteMiddleware(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let updated = false;

    // Skip companyAuth.ts as it already has the correct imports
    if (filePath.includes("companyAuth.ts")) {
      return;
    }

    // Update auth middleware import
    if (content.includes('from "../../middleware/auth"')) {
      content = content.replace(
        /from "\.\.\/\.\.\/middleware\/auth"/g,
        'from "../middleware/companyAuth"'
      );
      updated = true;
    }

    // Update authenticate usage
    if (content.includes("router.use(authenticate)")) {
      content = content.replace(
        /router\.use\(authenticate\)/g,
        "router.use(authenticateCompanyUser)"
      );
      updated = true;
    }

    // Update authenticate import
    if (content.includes("import { authenticate }")) {
      content = content.replace(
        /import { authenticate }/g,
        "import { authenticateCompanyUser }"
      );
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated middleware in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Update all route files in company folder
const routesDir = path.join(__dirname, "..", "src", "company", "routes");
const files = fs.readdirSync(routesDir);

for (const file of files) {
  if (
    file.endsWith(".ts") &&
    file !== "index.ts" &&
    file !== "companyAuth.ts"
  ) {
    updateRouteMiddleware(path.join(routesDir, file));
  }
}

console.log("Route middleware updates completed!");
