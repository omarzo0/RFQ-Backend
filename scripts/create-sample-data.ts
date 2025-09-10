import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log("🚀 Creating sample data...");

    // First, let's check if there are any companies
    const companies = await prisma.company.findMany();
    console.log(`Found ${companies.length} companies`);

    if (companies.length === 0) {
      console.log(
        "❌ No companies found. Please create a company first through the admin panel."
      );
      return;
    }

    const company = companies[0];
    console.log(`Using company: ${company.name} (${company.id})`);

    // Check if there are any company users
    const companyUsers = await prisma.companyUser.findMany({
      where: { companyId: company.id },
    });

    if (companyUsers.length === 0) {
      console.log(
        "❌ No company users found. Please create a company user first."
      );
      return;
    }

    const companyUser = companyUsers[0];
    console.log(
      `Using company user: ${companyUser.firstName} ${companyUser.lastName} (${companyUser.id})`
    );

    // Check existing shipping lines
    const existingShippingLines = await prisma.shippingLine.findMany({
      where: { companyId: company.id },
    });

    console.log(
      `Found ${existingShippingLines.length} existing shipping lines`
    );

    let shippingLine;
    if (existingShippingLines.length === 0) {
      // Create a sample shipping line
      console.log("📦 Creating sample shipping line...");
      shippingLine = await prisma.shippingLine.create({
        data: {
          companyId: company.id,
          createdBy: companyUser.id,
          name: "Sample Shipping Line",
          code: "SSL",
          scacCode: "SAMP",
          website: "https://sample-shipping.com",
          headquartersLocation: "Singapore",
          headquartersCountry: "Singapore",
          description: "A sample shipping line for testing",
          notes: "Created for testing purposes",
          tags: ["reliable", "fast"],
          tradeLanes: ["Asia-Europe", "Trans-Pacific"],
          services: ["FCL", "LCL"],
          specialization: "Container shipping",
          reliability: 5,
          serviceQuality: 4,
          isCustom: false,
        },
      });
      console.log(
        `✅ Created shipping line: ${shippingLine.name} (${shippingLine.id})`
      );
    } else {
      shippingLine = existingShippingLines[0];
      console.log(
        `✅ Using existing shipping line: ${shippingLine.name} (${shippingLine.id})`
      );
    }

    // Check existing contacts
    const existingContacts = await prisma.contact.findMany({
      where: { companyId: company.id },
    });

    console.log(`Found ${existingContacts.length} existing contacts`);

    if (existingContacts.length === 0) {
      // Create a sample contact
      console.log("👤 Creating sample contact...");
      const contact = await prisma.contact.create({
        data: {
          companyId: company.id,
          shippingLineId: shippingLine.id,
          createdBy: companyUser.id,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@sample-shipping.com",
          phone: "+65 1234 5678",
          jobTitle: "Sales Manager",
          department: "Sales",
          tags: ["key-contact", "decision-maker"],
          notes: "Primary contact for sample shipping line",
          seniority: "Senior",
          specialization: "Container shipping",
          reliability: 5,
          isPrimary: true,
          doNotContact: false,
        },
      });
      console.log(
        `✅ Created contact: ${contact.firstName} ${contact.lastName} (${contact.id})`
      );
    } else {
      console.log(`✅ Found existing contacts: ${existingContacts.length}`);
    }

    console.log("🎉 Sample data setup complete!");
    console.log("\n📋 Summary:");
    console.log(`- Company: ${company.name}`);
    console.log(
      `- Company User: ${companyUser.firstName} ${companyUser.lastName}`
    );
    console.log(`- Shipping Line: ${shippingLine.name}`);
    console.log(
      `- Contacts: ${
        existingContacts.length + (existingContacts.length === 0 ? 1 : 0)
      }`
    );
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();
