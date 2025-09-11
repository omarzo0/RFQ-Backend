// Debug script to check template visibility issues
const axios = require("axios");

async function debugTemplateIssue() {
  try {
    console.log("🔍 Debugging Template Visibility Issue...\n");

    // Step 1: Login to get token
    console.log("🔐 Step 1: Logging in...");
    const loginResponse = await axios.post(
      "http://localhost:3000/api/v1/company/auth/login",
      {
        email: "admin@testshipping.com",
        password: "admin123",
      }
    );

    const token = loginResponse.data.data.accessToken;
    console.log("✅ Login successful\n");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Step 2: List all templates
    console.log("📋 Step 2: Listing all templates...");
    const templatesResponse = await axios.get(
      "http://localhost:3000/api/v1/company/emails/templates",
      { headers }
    );

    const templates = templatesResponse.data.data.templates;
    console.log(`Found ${templates.length} templates:`);

    templates.forEach((template, index) => {
      console.log(`${index + 1}. ID: ${template.id}`);
      console.log(`   Name: ${template.name}`);
      console.log(`   Type: ${template.templateType}`);
      console.log(`   Active: ${template.isActive}`);
      console.log(`   Created: ${template.createdAt}`);
      console.log("");
    });

    if (templates.length === 0) {
      console.log("❌ No templates found! This might be the issue.");
      console.log("💡 Try creating a template first:\n");

      // Step 3: Create a test template
      console.log("📝 Step 3: Creating a test template...");
      const createResponse = await axios.post(
        "http://localhost:3000/api/v1/company/emails/templates",
        {
          name: "Debug Test Template",
          templateType: "RFQ",
          subject: "Test Subject - {{contactName}}",
          bodyHtml:
            "<h1>Hello {{contactName}}!</h1><p>This is a test template.</p>",
          supportedTokens: ["contactName", "companyName"],
          isActive: true,
        },
        { headers }
      );

      const newTemplate = createResponse.data.data;
      console.log(`✅ Created template: ${newTemplate.id}`);
      console.log(`   Name: ${newTemplate.name}\n`);

      templates.push(newTemplate); // Add to our list for testing
    }

    // Step 4: Test each template with different endpoints
    console.log("🧪 Step 4: Testing template endpoints...");

    for (const template of templates.slice(0, 2)) {
      // Test first 2 templates
      console.log(
        `\n--- Testing Template: ${template.name} (${template.id}) ---`
      );

      // Test 4a: Get single template
      try {
        const getResponse = await axios.get(
          `http://localhost:3000/api/v1/company/emails/templates/${template.id}`,
          { headers }
        );
        console.log("✅ GET single template: SUCCESS");
      } catch (error) {
        console.log("❌ GET single template: FAILED");
        console.log(
          `   Error: ${error.response?.data?.message || error.message}`
        );
      }

      // Test 4b: Preview template
      try {
        const previewResponse = await axios.post(
          `http://localhost:3000/api/v1/company/emails/templates/${template.id}/preview`,
          {
            contactName: "John Doe",
            companyName: "Test Company",
          },
          { headers }
        );
        console.log("✅ POST template preview: SUCCESS");
      } catch (error) {
        console.log("❌ POST template preview: FAILED");
        console.log(
          `   Error: ${error.response?.data?.message || error.message}`
        );
      }

      // Test 4c: Get template stats (the problematic one)
      try {
        const statsResponse = await axios.get(
          `http://localhost:3000/api/v1/company/emails/templates/${template.id}/stats`,
          { headers }
        );
        console.log("✅ GET template stats: SUCCESS");
        console.log(
          `   Stats: ${JSON.stringify(statsResponse.data.data, null, 2)}`
        );
      } catch (error) {
        console.log("❌ GET template stats: FAILED");
        console.log(
          `   Error: ${error.response?.data?.message || error.message}`
        );

        // This is the main issue we're debugging
        if (error.response?.data?.message === "Email template not found") {
          console.log(
            "🔍 FOUND THE ISSUE: Template exists in list but not found in stats!"
          );
          console.log("   This suggests a database query inconsistency.");
        }
      }
    }

    console.log("\n🎯 Debug Summary:");
    console.log("- If templates are listed but stats fail, it's a query issue");
    console.log("- If no templates are found, create some first");
    console.log("- Check that all methods use the same database query pattern");
  } catch (error) {
    console.log("❌ Debug script failed:");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Error:", error.response.data);
    } else {
      console.log("Network Error:", error.message);
    }
  }
}

console.log("🧪 Template Visibility Debug Tool");
console.log("==================================");
debugTemplateIssue();
