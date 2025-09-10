import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testEndpoints() {
  try {
    console.log("🔍 Testing endpoints...");

    // Get the first company and user
    const company = await prisma.company.findFirst();
    const companyUser = await prisma.companyUser.findFirst({
      where: { companyId: company?.id },
    });
    const shippingLine = await prisma.shippingLine.findFirst({
      where: { companyId: company?.id },
    });

    if (!company || !companyUser || !shippingLine) {
      console.log("❌ Missing required data");
      return;
    }

    console.log(`\n📋 Current Data:`);
    console.log(`- Company: ${company.name} (${company.id})`);
    console.log(
      `- User: ${companyUser.firstName} ${companyUser.lastName} (${companyUser.id})`
    );
    console.log(`- Shipping Line: ${shippingLine.name} (${shippingLine.id})`);

    // Test shipping lines endpoint
    console.log("\n🚢 Testing Shipping Lines...");
    const shippingLines = await prisma.shippingLine.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        createdAt: true,
      },
    });
    console.log(`Found ${shippingLines.length} shipping lines:`);
    shippingLines.forEach((sl) => {
      console.log(
        `  - ${sl.name} (${sl.code}) - ${sl.isActive ? "Active" : "Inactive"}`
      );
    });

    // Test contacts endpoint
    console.log("\n👤 Testing Contacts...");
    const contacts = await prisma.contact.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        shippingLineId: true,
        isActive: true,
        createdAt: true,
      },
    });
    console.log(`Found ${contacts.length} contacts:`);
    contacts.forEach((contact) => {
      console.log(
        `  - ${contact.firstName} ${contact.lastName} (${contact.email})`
      );
    });

    // Test creating a new contact
    console.log("\n➕ Testing Contact Creation...");
    try {
      const newContact = await prisma.contact.create({
        data: {
          companyId: company.id,
          shippingLineId: shippingLine.id,
          createdBy: companyUser.id,
          firstName: "Test",
          lastName: "Contact",
          email: "test.contact@example.com",
          phone: "+65 9876 5432",
          jobTitle: "Test Manager",
          department: "Test",
          tags: ["test"],
          notes: "Test contact for API testing",
          seniority: "Mid",
          specialization: "Testing",
          reliability: 4,
          isPrimary: false,
          doNotContact: false,
        },
      });
      console.log(
        `✅ Successfully created contact: ${newContact.firstName} ${newContact.lastName} (${newContact.id})`
      );
    } catch (error) {
      console.log(
        `❌ Error creating contact: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    console.log("\n🎉 Endpoint testing complete!");
  } catch (error) {
    console.error("❌ Error testing endpoints:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpoints();
