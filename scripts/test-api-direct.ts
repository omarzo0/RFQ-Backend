import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function testApiDirect() {
  try {
    console.log("🔍 Testing API directly...");

    // Get company and user
    const company = await prisma.company.findFirst();
    const companyUser = await prisma.companyUser.findFirst({
      where: { companyId: company?.id },
    });

    if (!company || !companyUser) {
      console.log("❌ Missing company or user data");
      return;
    }

    console.log(`\n📋 Current Data:`);
    console.log(`- Company: ${company.name} (${company.id})`);
    console.log(
      `- User: ${companyUser.firstName} ${companyUser.lastName} (${companyUser.id})`
    );

    // Get all shipping lines for this company
    const shippingLines = await prisma.shippingLine.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
      },
    });

    console.log(`\n🚢 Available Shipping Lines:`);
    shippingLines.forEach((sl, index) => {
      console.log(
        `  ${index + 1}. ${sl.name} (${sl.code}) - ID: ${sl.id} - ${
          sl.isActive ? "Active" : "Inactive"
        }`
      );
    });

    if (shippingLines.length === 0) {
      console.log(
        "❌ No shipping lines found. Please create a shipping line first."
      );
      return;
    }

    // Get all contacts for this company
    const contacts = await prisma.contact.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        shippingLineId: true,
      },
    });

    console.log(`\n👤 Existing Contacts:`);
    contacts.forEach((contact, index) => {
      const shippingLine = shippingLines.find(
        (sl) => sl.id === contact.shippingLineId
      );
      console.log(
        `  ${index + 1}. ${contact.firstName} ${contact.lastName} (${
          contact.email
        }) - Shipping Line: ${shippingLine?.name || "Unknown"}`
      );
    });

    // Generate a JWT token manually
    const JWT_SECRET =
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production";
    const token = jwt.sign(
      {
        userId: companyUser.id,
        email: companyUser.email,
        role: companyUser.role,
        userType: "COMPANY_USER",
        companyId: companyUser.companyId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
      },
      JWT_SECRET
    );

    console.log(`\n🔑 Generated JWT Token:`);
    console.log(`Bearer ${token}`);

    // Test the endpoints
    const baseUrl = "http://localhost:3000/api/v1/company";
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log(`\n🧪 Testing API Endpoints:`);

    // Test shipping lines endpoint
    try {
      console.log("\n1. Testing GET /shipping-lines");
      const shippingResponse = await fetch(
        `${baseUrl}/shipping-lines?page=1&limit=10`,
        {
          method: "GET",
          headers,
        }
      );

      if (shippingResponse.ok) {
        const shippingData = (await shippingResponse.json()) as any;
        console.log(
          `✅ Shipping Lines: Found ${
            shippingData.data?.contacts?.length || 0
          } items`
        );
        console.log(
          `   Response: ${JSON.stringify(shippingData, null, 2).substring(
            0,
            200
          )}...`
        );
      } else {
        const errorText = await shippingResponse.text();
        console.log(
          `❌ Shipping Lines failed: ${shippingResponse.status} ${shippingResponse.statusText}`
        );
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(
        `❌ Shipping Lines error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Test contacts endpoint
    try {
      console.log("\n2. Testing GET /contacts");
      const contactsResponse = await fetch(
        `${baseUrl}/contacts?page=1&limit=10`,
        {
          method: "GET",
          headers,
        }
      );

      if (contactsResponse.ok) {
        const contactsData = (await contactsResponse.json()) as any;
        console.log(
          `✅ Contacts: Found ${contactsData.data?.contacts?.length || 0} items`
        );
        console.log(
          `   Response: ${JSON.stringify(contactsData, null, 2).substring(
            0,
            200
          )}...`
        );
      } else {
        const errorText = await contactsResponse.text();
        console.log(
          `❌ Contacts failed: ${contactsResponse.status} ${contactsResponse.statusText}`
        );
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(
        `❌ Contacts error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Test creating a contact with a valid shipping line ID
    if (shippingLines.length > 0) {
      try {
        console.log("\n3. Testing POST /contacts");
        const newContactData = {
          shippingLineId: shippingLines[0].id, // Use the first available shipping line
          firstName: "API Test",
          lastName: "Contact",
          email: "api.test@example.com",
          phone: "+65 9999 8888",
          jobTitle: "API Test Manager",
          department: "Testing",
          tags: ["api-test"],
          notes: "Contact created via API test",
          seniority: "Mid",
          specialization: "API Testing",
          reliability: 4,
          isPrimary: false,
          doNotContact: false,
        };

        const createResponse = await fetch(`${baseUrl}/contacts`, {
          method: "POST",
          headers,
          body: JSON.stringify(newContactData),
        });

        if (createResponse.ok) {
          const createData = (await createResponse.json()) as any;
          console.log(
            `✅ Contact created successfully: ${createData.data?.firstName} ${createData.data?.lastName}`
          );
        } else {
          const errorText = await createResponse.text();
          console.log(
            `❌ Contact creation failed: ${createResponse.status} ${createResponse.statusText}`
          );
          console.log(`   Error: ${errorText}`);
        }
      } catch (error) {
        console.log(
          `❌ Contact creation error: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    console.log("\n🎉 API testing complete!");
  } catch (error) {
    console.error("❌ Error testing API:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiDirect();
