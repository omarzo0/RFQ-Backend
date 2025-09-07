const fs = require("fs");
const path = require("path");

// Function to update controller types
function updateControllerTypes(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let updated = false;

    // Skip CompanyAuthController.ts as it already has the correct types
    if (filePath.includes("CompanyAuthController.ts")) {
      return;
    }

    // Update AuthenticatedRequest import
    if (content.includes('from "../../types/auth"')) {
      content = content.replace(
        /from "\.\.\/\.\.\/types\/auth"/g,
        'from "../types/auth"'
      );
      updated = true;
    }

    // Update AuthenticatedRequest to CompanyRequest
    if (content.includes("AuthenticatedRequest")) {
      content = content.replace(/AuthenticatedRequest/g, "CompanyRequest");
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated types in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Update all controller files in company folder
const controllersDir = path.join(
  __dirname,
  "..",
  "src",
  "company",
  "controllers"
);
const files = fs.readdirSync(controllersDir);

for (const file of files) {
  if (file.endsWith(".ts") && file !== "CompanyAuthController.ts") {
    updateControllerTypes(path.join(controllersDir, file));
  }
}

console.log("Controller types updates completed!");
