import { PrismaClient } from "@prisma/client";
import { PasswordUtils } from "../../utils/password";
import logger from "../../utils/logger";

const prisma = new PrismaClient();

async function createCompanyData() {
  try {
    // Check if test company already exists
    const existingCompany = await prisma.company.findFirst({
      where: { email: "testcompany@shipping.com" },
    });

    if (existingCompany) {
      logger.info("Test company already exists");
      return existingCompany;
    }

    // Create test company
    const company = await prisma.company.create({
      data: {
        name: "Test Shipping Company",
        email: "testcompany@shipping.com",
        domain: "testshipping.com",
        phone: "+1234567890",
        address: "123 Shipping Street",
        city: "New York",
        country: "USA",
        timezone: "America/New_York",
        subscriptionPlan: "premium",
        subscriptionStatus: "ACTIVE",
        emailFooter: "Best regards,\nTest Shipping Company",
        defaultFollowUpDays: 3,
        autoFollowUpEnabled: true,
        isActive: true,
      },
    });

    logger.info(
      `Company created successfully: ${company.name} (${company.email})`
    );

    // Create company admin user
    const adminPasswordHash = await PasswordUtils.hash("admin123");
    const companyAdmin = await prisma.companyUser.create({
      data: {
        companyId: company.id,
        email: "admin@testshipping.com",
        passwordHash: adminPasswordHash,
        firstName: "Company",
        lastName: "Admin",
        role: "ADMIN",
        isActive: true,
      },
    });

    logger.info(`Company admin created: ${companyAdmin.email}`);

    // Create company employee user
    const employeePasswordHash = await PasswordUtils.hash("employee123");
    const companyEmployee = await prisma.companyUser.create({
      data: {
        companyId: company.id,
        email: "employee@testshipping.com",
        passwordHash: employeePasswordHash,
        firstName: "Test",
        lastName: "Employee",
        role: "EMPLOYEE",
        isActive: true,
      },
    });

    logger.info(`Company employee created: ${companyEmployee.email}`);

    // Create shipping lines
    const shippingLines = await Promise.all([
      prisma.shippingLine.create({
        data: {
          companyId: company.id,
          name: "Maersk Line",
          code: "MAEU",
          scacCode: "MAEU",
          website: "https://www.maersk.com",
          headquartersLocation: "Copenhagen",
          headquartersCountry: "Denmark",
          description: "World's largest container shipping company",
          services: ["Container", "Breakbulk", "Reefer"],
          specialization: "Container Shipping",
          tradeLanes: ["Asia-Europe", "Asia-Americas", "Europe-Americas"],
          tags: ["premium", "reliable", "global"],
          reliability: 5,
          serviceQuality: 5,
          isCustom: false,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.shippingLine.create({
        data: {
          companyId: company.id,
          name: "MSC Mediterranean Shipping Company",
          code: "MSC",
          scacCode: "MSC",
          website: "https://www.msc.com",
          headquartersLocation: "Geneva",
          headquartersCountry: "Switzerland",
          description: "Second largest container shipping company",
          services: ["Container", "Breakbulk"],
          specialization: "Container Shipping",
          tradeLanes: ["Asia-Europe", "Asia-Americas", "Europe-Americas"],
          tags: ["premium", "reliable", "global"],
          reliability: 4,
          serviceQuality: 4,
          isCustom: false,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.shippingLine.create({
        data: {
          companyId: company.id,
          name: "CMA CGM",
          code: "CMACGM",
          scacCode: "CMACGM",
          website: "https://www.cmacgm.com",
          headquartersLocation: "Marseille",
          headquartersCountry: "France",
          description: "Third largest container shipping company",
          services: ["Container", "Breakbulk", "Reefer"],
          specialization: "Container Shipping",
          tradeLanes: ["Asia-Europe", "Asia-Americas", "Europe-Americas"],
          tags: ["premium", "reliable", "global"],
          reliability: 4,
          serviceQuality: 4,
          isCustom: false,
          createdBy: companyAdmin.id,
        },
      }),
    ]);

    logger.info(`Created ${shippingLines.length} shipping lines`);

    // Create contacts for each shipping line
    const contacts = [];
    for (const shippingLine of shippingLines) {
      const contact = await prisma.contact.create({
        data: {
          companyId: company.id,
          shippingLineId: shippingLine.id,
          firstName: "John",
          lastName: "Doe",
          email: `contact@${
            shippingLine.code?.toLowerCase() || "shipping"
          }.com`,
          phone: "+1234567890",
          jobTitle: "Sales Manager",
          department: "Sales",
          tags: ["primary", "sales"],
          notes: `Primary contact for ${shippingLine.name}`,
          seniority: "SENIOR",
          specialization: "Container Shipping",
          quoteQuality: 4,
          reliability: 4,
          isPrimary: true,
          createdBy: companyAdmin.id,
        },
      });
      contacts.push(contact);
    }

    logger.info(`Created ${contacts.length} contacts`);

    // Create RFQ templates
    const rfqTemplates = await Promise.all([
      prisma.rFQTemplate.create({
        data: {
          companyId: company.id,
          name: "Standard Container RFQ",
          description: "Template for standard container shipping RFQs",
          subjectTemplate:
            "RFQ Request - {{commodity}} from {{originPort}} to {{destinationPort}}",
          bodyTemplate:
            "Dear {{contactName}},\n\nWe are seeking quotes for the following shipment:\n\nCommodity: {{commodity}}\nOrigin: {{originPort}}\nDestination: {{destinationPort}}\nContainer Type: {{containerType}}\nQuantity: {{containerQuantity}}\nCargo Weight: {{cargoWeight}} kg\nCargo Volume: {{cargoVolume}} cbm\nIncoterm: {{incoterm}}\nCargo Ready Date: {{cargoReadyDate}}\nQuote Deadline: {{quoteDeadline}}\n\nPlease provide your best rates and terms.\n\nBest regards,\n{{companyName}}",
          originPort: "Shanghai",
          destinationPort: "Los Angeles",
          commodity: "Electronics",
          containerType: "40GP",
          containerQuantity: 1,
          cargoWeight: 20000,
          cargoVolume: 67,
          incoterm: "FOB",
          specialRequirements: "None",
          requiredServices: ["Container"],
          category: "Container Shipping",
          tradeLane: "Asia-North America",
          language: "en",
          tags: ["container", "standard", "electronics"],
          templateVariables: [
            "{{commodity}}",
            "{{originPort}}",
            "{{destinationPort}}",
            "{{containerType}}",
            "{{containerQuantity}}",
            "{{cargoWeight}}",
            "{{cargoVolume}}",
            "{{incoterm}}",
            "{{cargoReadyDate}}",
            "{{quoteDeadline}}",
            "{{contactName}}",
            "{{companyName}}",
          ],
          isDefault: true,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.rFQTemplate.create({
        data: {
          companyId: company.id,
          name: "Reefer Container RFQ",
          description: "Template for refrigerated container shipping RFQs",
          subjectTemplate:
            "Reefer RFQ - {{commodity}} from {{originPort}} to {{destinationPort}}",
          bodyTemplate:
            "Dear {{contactName}},\n\nWe are seeking quotes for refrigerated container shipment:\n\nCommodity: {{commodity}}\nOrigin: {{originPort}}\nDestination: {{destinationPort}}\nContainer Type: {{containerType}} (Reefer)\nQuantity: {{containerQuantity}}\nCargo Weight: {{cargoWeight}} kg\nCargo Volume: {{cargoVolume}} cbm\nTemperature: {{temperature}}°C\nIncoterm: {{incoterm}}\nCargo Ready Date: {{cargoReadyDate}}\nQuote Deadline: {{quoteDeadline}}\n\nPlease provide your best rates and terms for refrigerated transport.\n\nBest regards,\n{{companyName}}",
          originPort: "Rotterdam",
          destinationPort: "New York",
          commodity: "Frozen Food",
          containerType: "40RF",
          containerQuantity: 1,
          cargoWeight: 25000,
          cargoVolume: 67,
          incoterm: "FOB",
          specialRequirements: "Temperature controlled",
          requiredServices: ["Container", "Reefer"],
          category: "Reefer Shipping",
          tradeLane: "Europe-North America",
          language: "en",
          tags: ["reefer", "frozen", "food"],
          templateVariables: [
            "{{commodity}}",
            "{{originPort}}",
            "{{destinationPort}}",
            "{{containerType}}",
            "{{containerQuantity}}",
            "{{cargoWeight}}",
            "{{cargoVolume}}",
            "{{temperature}}",
            "{{incoterm}}",
            "{{cargoReadyDate}}",
            "{{quoteDeadline}}",
            "{{contactName}}",
            "{{companyName}}",
          ],
          isDefault: false,
          createdBy: companyAdmin.id,
        },
      }),
    ]);

    logger.info(`Created ${rfqTemplates.length} RFQ templates`);

    // Create email templates
    const emailTemplates = await Promise.all([
      prisma.emailTemplate.create({
        data: {
          companyId: company.id,
          name: "Standard RFQ Email",
          templateType: "RFQ",
          subject:
            "RFQ Request - {{commodity}} from {{originPort}} to {{destinationPort}}",
          bodyHtml:
            "<p>Dear {{contactName}},</p><p>We are seeking quotes for the following shipment:</p><ul><li>Commodity: {{commodity}}</li><li>Origin: {{originPort}}</li><li>Destination: {{destinationPort}}</li><li>Container Type: {{containerType}}</li><li>Quantity: {{containerQuantity}}</li></ul><p>Please provide your best rates and terms.</p><p>Best regards,<br>{{companyName}}</p>",
          bodyText:
            "Dear {{contactName}},\n\nWe are seeking quotes for the following shipment:\n\nCommodity: {{commodity}}\nOrigin: {{originPort}}\nDestination: {{destinationPort}}\nContainer Type: {{containerType}}\nQuantity: {{containerQuantity}}\n\nPlease provide your best rates and terms.\n\nBest regards,\n{{companyName}}",
          supportedTokens: [
            "{{commodity}}",
            "{{originPort}}",
            "{{destinationPort}}",
            "{{containerType}}",
            "{{containerQuantity}}",
            "{{contactName}}",
            "{{companyName}}",
          ],
          isDefault: true,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.emailTemplate.create({
        data: {
          companyId: company.id,
          name: "Follow-up Email",
          templateType: "FOLLOW_UP",
          subject: "Follow-up: RFQ Request - {{commodity}}",
          bodyHtml:
            "<p>Dear {{contactName}},</p><p>This is a follow-up regarding our RFQ request for {{commodity}} from {{originPort}} to {{destinationPort}}.</p><p>We would appreciate your response at your earliest convenience.</p><p>Best regards,<br>{{companyName}}</p>",
          bodyText:
            "Dear {{contactName}},\n\nThis is a follow-up regarding our RFQ request for {{commodity}} from {{originPort}} to {{destinationPort}}.\n\nWe would appreciate your response at your earliest convenience.\n\nBest regards,\n{{companyName}}",
          supportedTokens: [
            "{{commodity}}",
            "{{originPort}}",
            "{{destinationPort}}",
            "{{contactName}}",
            "{{companyName}}",
          ],
          isDefault: false,
          createdBy: companyAdmin.id,
        },
      }),
    ]);

    logger.info(`Created ${emailTemplates.length} email templates`);

    // Create follow-up rules
    const followUpRules = await Promise.all([
      prisma.followUpRule.create({
        data: {
          companyId: company.id,
          name: "Standard Follow-up",
          daysAfterSend: 3,
          maxFollowUps: 2,
          emailTemplateId: emailTemplates[1].id,
          isActive: true,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.followUpRule.create({
        data: {
          companyId: company.id,
          name: "Urgent Follow-up",
          daysAfterSend: 1,
          maxFollowUps: 3,
          emailTemplateId: emailTemplates[1].id,
          isActive: true,
          createdBy: companyAdmin.id,
        },
      }),
    ]);

    logger.info(`Created ${followUpRules.length} follow-up rules`);

    // Create sample RFQ
    const sampleRFQ = await prisma.rFQ.create({
      data: {
        companyId: company.id,
        rfqNumber: `RFQ-${Date.now()}`,
        title: "Electronics Container Shipment",
        description:
          "Sample RFQ for electronics container shipment from Shanghai to Los Angeles",
        originPort: "Shanghai",
        destinationPort: "Los Angeles",
        commodity: "Electronics",
        containerType: "40GP",
        containerQuantity: 1,
        cargoWeight: 20000,
        cargoVolume: 67,
        incoterm: "FOB",
        cargoReadyDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        quoteDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        shipmentUrgency: "NORMAL",
        specialRequirements: "None",
        requiredServices: ["Container"],
        preferredCarriers: [
          "Maersk Line",
          "MSC Mediterranean Shipping Company",
        ],
        tradeLane: "Asia-North America",
        estimatedValue: 50000,
        currency: "USD",
        notes: "Sample RFQ for testing purposes",
        tags: ["electronics", "container", "test"],
        priority: "MEDIUM",
        status: "DRAFT",
        createdBy: companyAdmin.id,
        assignedTo: companyEmployee.id,
      },
    });

    logger.info(`Created sample RFQ: ${sampleRFQ.rfqNumber}`);

    // Create RFQ recipients
    const rfqRecipients = await Promise.all(
      contacts.map((contact) =>
        prisma.rFQRecipient.create({
          data: {
            rfqId: sampleRFQ.id,
            contactId: contact.id,
            shippingLineId: contact.shippingLineId,
            emailSentAt: new Date(),
            hasResponded: false,
            responseReceivedAt: null,
          },
        })
      )
    );

    logger.info(`Created ${rfqRecipients.length} RFQ recipients`);

    // Create sample quotes
    const sampleQuotes = await Promise.all([
      prisma.quote.create({
        data: {
          rfqId: sampleRFQ.id,
          contactId: contacts[0].id,
          shippingLineId: shippingLines[0].id,
          oceanFreight: 1500.0,
          currency: "USD",
          totalAmount: 2000.0,
          validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          termsAndConditions: "FOB",
          notes: "Best rate for this route",
          status: "ACTIVE",
          isVerified: false,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.quote.create({
        data: {
          rfqId: sampleRFQ.id,
          contactId: contacts[1].id,
          shippingLineId: shippingLines[1].id,
          oceanFreight: 1600.0,
          currency: "USD",
          totalAmount: 2100.0,
          validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          termsAndConditions: "FOB",
          notes: "Competitive rate with good service",
          status: "ACTIVE",
          isVerified: false,
          createdBy: companyAdmin.id,
        },
      }),
    ]);

    logger.info(`Created ${sampleQuotes.length} sample quotes`);

    // Create usage metrics
    const currentDate = new Date();
    await prisma.usageMetric.create({
      data: {
        companyId: company.id,
        periodMonth: currentDate.getMonth() + 1,
        periodYear: currentDate.getFullYear(),
        rfqsCreated: 1,
        emailsSent: 3,
        aiParsingRequests: 0,
        apiCalls: 0,
        fileStorageMb: 0,
      },
    });

    logger.info("Created usage metrics");

    // Summary
    logger.info("🎉 Company data creation completed successfully!");
    logger.info(`📊 Summary:`);
    logger.info(`   - Company: ${company.name} (${company.email})`);
    logger.info(`   - Users: 2 (Admin + Employee)`);
    logger.info(`   - Shipping Lines: ${shippingLines.length}`);
    logger.info(`   - Contacts: ${contacts.length}`);
    logger.info(`   - RFQ Templates: ${rfqTemplates.length}`);
    logger.info(`   - Email Templates: ${emailTemplates.length}`);
    logger.info(`   - Follow-up Rules: ${followUpRules.length}`);
    logger.info(`   - Sample RFQ: ${sampleRFQ.rfqNumber}`);
    logger.info(`   - Sample Quotes: ${sampleQuotes.length}`);
    logger.info(`   - Usage Metrics: 2`);

    logger.info("\n🔑 Login Credentials:");
    logger.info(`   Admin: admin@testshipping.com / admin123`);
    logger.info(`   Employee: employee@testshipping.com / employee123`);

    return company;
  } catch (error) {
    logger.error("Error creating company data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createCompanyData()
    .then(() => {
      logger.info("Company data creation completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Company data creation failed:", error);
      process.exit(1);
    });
}

export { createCompanyData };
