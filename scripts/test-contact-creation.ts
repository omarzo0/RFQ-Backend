import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function testContactCreation() {
  try {
    console.log("🧪 Testing Contact Creation...");

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
    console.log(`- User: ${companyUser.firstName} ${companyUser.lastName} (${companyUser.id})`);

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
      console.log(`  ${index + 1}. ${sl.name} (${sl.code}) - ID: ${sl.id}`);
    });

    if (shippingLines.length === 0) {
      console.log("❌ No shipping lines found. Please create a shipping line first.");
      return;
    }

    // Generate a JWT token
    const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
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

    // Test creating a contact with each shipping line
    const baseUrl = "http://localhost:3000/api/v1/company";
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    for (let i = 0; i < shippingLines.length; i++) {
      const shippingLine = shippingLines[i];
      console.log(`\n🧪 Testing contact creation with shipping line: ${shippingLine.name}`);
      
      const contactData = {
        shippingLineId: shippingLine.id,
        firstName: `Test Contact ${i + 1}`,
        lastName: `For ${shippingLine.name}`,
        email: `test.contact.${i + 1}@${shippingLine.code.toLowerCase()}.com`,
        phone: `+65 9999 ${String(i + 1).padStart(4, '0')}`,
        jobTitle: "Test Manager",
        department: "Testing",
        tags: ["test", `shipping-line-${shippingLine.code}`],
        notes: `Test contact for ${shippingLine.name}`,
        seniority: "Mid",
        specialization: "Testing",
        reliability: 4,
        isPrimary: i === 0, // Make first one primary
        doNotContact: false,
      };

      try {
        const response = await fetch(`${baseUrl}/contacts`, {
          method: "POST",
          headers,
          body: JSON.stringify(contactData),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          console.log(`✅ Contact created successfully: ${data.data?.firstName} ${data.data?.lastName}`);
        } else {
          const errorText = await response.text();
          console.log(`❌ Contact creation failed: ${response.status} ${response.statusText}`);
          console.log(`   Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Contact creation error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log("\n🎉 Contact creation testing complete!");

  } catch (error) {
    console.error("❌ Error testing contact creation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testContactCreation();
