const fs = require("fs");
const path = require("path");

// Function to update import paths in a file
function updateImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let updated = false;

    // Update service imports
    if (content.includes('from "../services/')) {
      content = content.replace(
        /from "\.\.\/services\//g,
        'from "../services/'
      );
      updated = true;
    }

    // Update controller imports
    if (content.includes('from "../controllers/')) {
      content = content.replace(
        /from "\.\.\/controllers\//g,
        'from "../controllers/'
      );
      updated = true;
    }

    // Update utils imports
    if (content.includes('from "../utils/')) {
      content = content.replace(/from "\.\.\/utils\//g, 'from "../../utils/');
      updated = true;
    }

    // Update types imports
    if (content.includes('from "../types/')) {
      content = content.replace(/from "\.\.\/types\//g, 'from "../../types/');
      updated = true;
    }

    // Update middleware imports
    if (content.includes('from "../middleware/')) {
      content = content.replace(
        /from "\.\.\/middleware\//g,
        'from "../../middleware/'
      );
      updated = true;
    }

    // Update app import
    if (content.includes('from "../app"')) {
      content = content.replace(/from "\.\.\/app"/g, 'from "../../app"');
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Function to recursively find and update all TypeScript files
function updateImportsInDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      updateImportsInDirectory(fullPath);
    } else if (item.endsWith(".ts")) {
      updateImportsInFile(fullPath);
    }
  }
}

// Update imports in company folder
console.log("Updating imports in company folder...");
updateImportsInDirectory(path.join(__dirname, "..", "src", "company"));

console.log("Import updates completed!");
