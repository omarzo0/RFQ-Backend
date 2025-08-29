import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create system features
  const features = [
    {
      name: "Email Tracking",
      featureKey: "email_tracking",
      featureType: "BOOLEAN",
      description: "Track email opens, clicks, and delivery status",
    },
    {
      name: "AI Quote Parsing",
      featureKey: "ai_parsing",
      featureType: "BOOLEAN",
      description: "Automatically parse quotes from emails using AI",
    },
    {
      name: "Advanced Analytics",
      featureKey: "analytics_advanced",
      featureType: "BOOLEAN",
      description: "Advanced reporting and analytics features",
    },
    {
      name: "Max RFQs Per Month",
      featureKey: "max_rfqs_monthly",
      featureType: "LIMIT",
      description: "Maximum number of RFQs that can be created per month",
    },
    {
      name: "Max Contacts",
      featureKey: "max_contacts",
      featureType: "LIMIT",
      description: "Maximum number of contacts that can be stored",
    },
  ];

  console.log("Creating system features...");
  for (const feature of features) {
    await prisma.systemFeature.upsert({
      where: { featureKey: feature.featureKey },
      update: {},
      create: feature,
    });
  }

  // Create subscription plans
  const plans = [
    {
      name: "Trial",
      description: "30-day free trial with basic features",
      priceMonthly: 0,
      priceYearly: 0,
      maxUsers: 3,
      maxRFQsPerMonth: 50,
      maxContacts: 100,
      maxEmailSendsPerMonth: 500,
      features: {
        email_tracking: true,
        ai_parsing: false,
        analytics_advanced: false,
      },
    },
    {
      name: "Starter",
      description: "Perfect for small teams getting started",
      priceMonthly: 99,
      priceYearly: 990,
      maxUsers: 5,
      maxRFQsPerMonth: 200,
      maxContacts: 500,
      maxEmailSendsPerMonth: 2000,
      features: {
        email_tracking: true,
        ai_parsing: true,
        analytics_advanced: false,
      },
    },
    {
      name: "Professional",
      description: "Advanced features for growing businesses",
      priceMonthly: 299,
      priceYearly: 2990,
      maxUsers: 15,
      maxRFQsPerMonth: 1000,
      maxContacts: 2000,
      maxEmailSendsPerMonth: 10000,
      features: {
        email_tracking: true,
        ai_parsing: true,
        analytics_advanced: true,
      },
    },
    {
      name: "Enterprise",
      description: "Unlimited access with premium support",
      priceMonthly: 599,
      priceYearly: 5990,
      maxUsers: null,
      maxRFQsPerMonth: null,
      maxContacts: null,
      maxEmailSendsPerMonth: null,
      features: {
        email_tracking: true,
        ai_parsing: true,
        analytics_advanced: true,
      },
    },
  ];

  console.log("Creating subscription plans...");
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  // Create super admin user
  const superAdminEmail =
    process.env.SUPER_ADMIN_EMAIL || "admin@rfqplatform.com";
  const superAdminPassword =
    process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin123!";

  const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

  console.log("Creating super admin...");
  const superAdmin = await prisma.admin.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      passwordHash: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  // Create demo company for testing
  if (process.env.NODE_ENV === "development") {
    console.log("Creating demo company...");

    const demoCompany = await prisma.company.upsert({
      where: { email: "demo@company.com" },
      update: {},
      create: {
        name: "Demo Logistics Company",
        email: "demo@company.com",
        domain: "company.com",
        phone: "+1-555-0123",
        address: "123 Business Ave",
        city: "New York",
        country: "United States",
        subscriptionPlan: "Professional",
        subscriptionStatus: "ACTIVE",
      },
    });

    // Create demo company admin user
    const demoUserPassword = await bcrypt.hash("DemoUser123!", 12);

    const demoUser = await prisma.companyUser.upsert({
      where: {
        companyId_email: {
          companyId: demoCompany.id,
          email: "john@company.com",
        },
      },
      update: {},
      create: {
        companyId: demoCompany.id,
        email: "john@company.com",
        passwordHash: demoUserPassword,
        firstName: "John",
        lastName: "Smith",
        role: "ADMIN",
      },
    });

    // Create sample shipping lines
    const shippingLines = [
      {
        name: "Maersk Line",
        code: "MAEU",
        website: "https://www.maersk.com",
        headquartersLocation: "Copenhagen, Denmark",
      },
      {
        name: "MSC Mediterranean Shipping Company",
        code: "MSCU",
        website: "https://www.msc.com",
        headquartersLocation: "Geneva, Switzerland",
      },
      {
        name: "CMA CGM",
        code: "CMDU",
        website: "https://www.cma-cgm.com",
        headquartersLocation: "Marseille, France",
      },
    ];

    console.log("Creating sample shipping lines...");
    for (const line of shippingLines) {
      const shippingLine = await prisma.shippingLine.upsert({
        where: {
          companyId_name: {
            companyId: demoCompany.id,
            name: line.name,
          },
        },
        update: {},
        create: {
          ...line,
          companyId: demoCompany.id,
          createdBy: demoUser.id,
        },
      });

      // Create sample contacts for each shipping line
      const contacts = [
        {
          firstName: "Sarah",
          lastName: "Johnson",
          email: `sarah.johnson@${line.code.toLowerCase()}.com`,
          jobTitle: "Sales Manager",
          isPrimary: true,
        },
        {
          firstName: "Mike",
          lastName: "Chen",
          email: `mike.chen@${line.code.toLowerCase()}.com`,
          jobTitle: "Pricing Specialist",
          isPrimary: false,
        },
      ];

      for (const contact of contacts) {
        await prisma.contact.upsert({
          where: {
            companyId_shippingLineId_email: {
              companyId: demoCompany.id,
              shippingLineId: shippingLine.id,
              email: contact.email,
            },
          },
          update: {},
          create: {
            ...contact,
            companyId: demoCompany.id,
            shippingLineId: shippingLine.id,
            createdBy: demoUser.id,
          },
        });
      }
    }

    console.log("Demo data created:");
    console.log(`- Company: ${demoCompany.name} (${demoCompany.email})`);
    console.log(
      `- User: ${demoUser.firstName} ${demoUser.lastName} (${demoUser.email})`
    );
    console.log(`- Password: DemoUser123!`);
  }

  console.log("✅ Database seeding completed!");
  console.log("\nLogin credentials:");
  console.log(`Super Admin: ${superAdminEmail} / ${superAdminPassword}`);

  if (process.env.NODE_ENV === "development") {
    console.log(`Demo Company User: john@company.com / DemoUser123!`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
