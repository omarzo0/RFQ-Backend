import { PrismaClient } from "@prisma/client";
import logger from "../../utils/logger";

const prisma = new PrismaClient();

async function createAdditionalTestData() {
  try {
    // Find the test company
    const company = await prisma.company.findFirst({
      where: { email: "testcompany@shipping.com" },
    });

    if (!company) {
      throw new Error(
        "Test company not found. Please run create-company-data.js first."
      );
    }

    // Find company users
    const companyAdmin = await prisma.companyUser.findFirst({
      where: {
        companyId: company.id,
        role: "ADMIN",
      },
    });

    const companyEmployee = await prisma.companyUser.findFirst({
      where: {
        companyId: company.id,
        role: "EMPLOYEE",
      },
    });

    if (!companyAdmin || !companyEmployee) {
      throw new Error(
        "Company users not found. Please run create-company-data.js first."
      );
    }

    // Find existing shipping lines and contacts
    const shippingLines = await prisma.shippingLine.findMany({
      where: { companyId: company.id },
    });

    const contacts = await prisma.contact.findMany({
      where: { companyId: company.id },
    });

    if (shippingLines.length === 0 || contacts.length === 0) {
      throw new Error(
        "Shipping lines or contacts not found. Please run create-company-data.js first."
      );
    }

    // Create additional RFQs
    const additionalRFQs = await Promise.all([
      prisma.rFQ.create({
        data: {
          companyId: company.id,
          rfqNumber: `RFQ-${Date.now()}-001`,
          title: "Furniture Container Shipment",
          description:
            "RFQ for furniture container shipment from Hamburg to New York",
          originPort: "Hamburg",
          destinationPort: "New York",
          commodity: "Furniture",
          containerType: "40GP",
          containerQuantity: 2,
          cargoWeight: 35000,
          cargoVolume: 134,
          incoterm: "CIF",
          cargoReadyDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          quoteDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          shipmentUrgency: "NORMAL",
          specialRequirements: "Handle with care",
          requiredServices: ["Container"],
          preferredCarriers: ["Maersk Line", "CMA CGM"],
          tradeLane: "Europe-North America",
          estimatedValue: 75000,
          currency: "USD",
          notes: "Furniture shipment requiring careful handling",
          tags: ["furniture", "container", "careful-handling"],
          priority: "MEDIUM",
          status: "SENT",
          sentAt: new Date(),
          createdBy: companyAdmin.id,
          assignedTo: companyEmployee.id,
        },
      }),
      prisma.rFQ.create({
        data: {
          companyId: company.id,
          rfqNumber: `RFQ-${Date.now()}-002`,
          title: "Reefer Container for Food Products",
          description:
            "RFQ for refrigerated container shipment of food products",
          originPort: "Rotterdam",
          destinationPort: "Miami",
          commodity: "Frozen Food",
          containerType: "40RF",
          containerQuantity: 1,
          cargoWeight: 28000,
          cargoVolume: 67,
          incoterm: "FOB",
          cargoReadyDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          quoteDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          shipmentUrgency: "URGENT",
          specialRequirements: "Temperature controlled at -18°C",
          requiredServices: ["Container", "Reefer"],
          preferredCarriers: ["MSC Mediterranean Shipping Company", "CMA CGM"],
          tradeLane: "Europe-North America",
          estimatedValue: 45000,
          currency: "USD",
          notes: "Frozen food products requiring temperature control",
          tags: ["reefer", "frozen", "food", "temperature-controlled"],
          priority: "HIGH",
          status: "SENT",
          sentAt: new Date(),
          createdBy: companyAdmin.id,
          assignedTo: companyEmployee.id,
        },
      }),
      prisma.rFQ.create({
        data: {
          companyId: company.id,
          rfqNumber: `RFQ-${Date.now()}-003`,
          title: "Breakbulk Machinery Shipment",
          description: "RFQ for breakbulk shipment of heavy machinery",
          originPort: "Antwerp",
          destinationPort: "Houston",
          commodity: "Machinery",
          containerType: "Breakbulk",
          containerQuantity: 1,
          cargoWeight: 50000,
          cargoVolume: 200,
          incoterm: "FOB",
          cargoReadyDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          quoteDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          shipmentUrgency: "NORMAL",
          specialRequirements: "Heavy lift equipment required",
          requiredServices: ["Breakbulk", "Heavy Lift"],
          preferredCarriers: ["Maersk Line"],
          tradeLane: "Europe-North America",
          estimatedValue: 120000,
          currency: "USD",
          notes: "Heavy machinery requiring special handling",
          tags: ["breakbulk", "machinery", "heavy-lift"],
          priority: "MEDIUM",
          status: "DRAFT",
          createdBy: companyAdmin.id,
          assignedTo: companyEmployee.id,
        },
      }),
    ]);

    logger.info(`Created ${additionalRFQs.length} additional RFQs`);

    // Create RFQ recipients for each RFQ
    for (const rfq of additionalRFQs) {
      const rfqRecipients = await Promise.all(
        contacts.map((contact) =>
          prisma.rFQRecipient.create({
            data: {
              rfqId: rfq.id,
              contactId: contact.id,
              shippingLineId: contact.shippingLineId,
              emailSentAt: rfq.status === "SENT" ? new Date() : new Date(),
              hasResponded: false,
              responseReceivedAt: null,
            },
          })
        )
      );
      logger.info(
        `Created ${rfqRecipients.length} recipients for RFQ ${rfq.rfqNumber}`
      );
    }

    // Create additional quotes
    const additionalQuotes = await Promise.all([
      // Quotes for Furniture RFQ
      prisma.quote.create({
        data: {
          rfqId: additionalRFQs[0].id,
          contactId: contacts[0].id,
          shippingLineId: shippingLines[0].id,
          oceanFreight: 3200.0,
          currency: "USD",
          totalAmount: 4200.0,
          validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          termsAndConditions: "CIF",
          notes: "Best rate for furniture shipment",
          status: "ACTIVE",
          isVerified: false,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.quote.create({
        data: {
          rfqId: additionalRFQs[0].id,
          contactId: contacts[1].id,
          shippingLineId: shippingLines[1].id,
          oceanFreight: 3400.0,
          currency: "USD",
          totalAmount: 4400.0,
          validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          termsAndConditions: "CIF",
          notes: "Competitive rate with good service",
          status: "ACTIVE",
          isVerified: false,
          createdBy: companyAdmin.id,
        },
      }),
      // Quotes for Reefer RFQ
      prisma.quote.create({
        data: {
          rfqId: additionalRFQs[1].id,
          contactId: contacts[0].id,
          shippingLineId: shippingLines[0].id,
          oceanFreight: 2800.0,
          currency: "USD",
          totalAmount: 3800.0,
          validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          termsAndConditions: "FOB",
          notes: "Reefer container rate for frozen food",
          status: "ACTIVE",
          isVerified: false,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.quote.create({
        data: {
          rfqId: additionalRFQs[1].id,
          contactId: contacts[1].id,
          shippingLineId: shippingLines[1].id,
          oceanFreight: 3000.0,
          currency: "USD",
          totalAmount: 4000.0,
          validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          termsAndConditions: "FOB",
          notes: "Reefer service with temperature monitoring",
          status: "ACTIVE",
          isVerified: false,
          createdBy: companyAdmin.id,
        },
      }),
      prisma.quote.create({
        data: {
          rfqId: additionalRFQs[1].id,
          contactId: contacts[2].id,
          shippingLineId: shippingLines[2].id,
          oceanFreight: 2900.0,
          currency: "USD",
          totalAmount: 3900.0,
          validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          termsAndConditions: "FOB",
          notes: "Specialized reefer service",
          status: "ACTIVE",
          isVerified: false,
          createdBy: companyAdmin.id,
        },
      }),
    ]);

    logger.info(`Created ${additionalQuotes.length} additional quotes`);

    // Create email campaigns
    const emailCampaigns = await Promise.all([
      prisma.emailCampaign.create({
        data: {
          companyId: company.id,
          name: "Q1 2024 RFQ Campaign",
          campaignType: "RFQ_BLAST",
          status: "SCHEDULED",
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          createdBy: companyAdmin.id,
        },
      }),
      prisma.emailCampaign.create({
        data: {
          companyId: company.id,
          name: "Follow-up Campaign",
          campaignType: "FOLLOW_UP_CAMPAIGN",
          status: "RUNNING",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          createdBy: companyAdmin.id,
        },
      }),
    ]);

    logger.info(`Created ${emailCampaigns.length} email campaigns`);

    // Update existing usage metrics
    const currentDate = new Date();
    const existingMetric = await prisma.usageMetric.findFirst({
      where: {
        companyId: company.id,
        periodMonth: currentDate.getMonth() + 1,
        periodYear: currentDate.getFullYear(),
      },
    });

    if (existingMetric) {
      await prisma.usageMetric.update({
        where: { id: existingMetric.id },
        data: {
          rfqsCreated: existingMetric.rfqsCreated + additionalRFQs.length,
          emailsSent: existingMetric.emailsSent + 2, // 2 email logs created
        },
      });
    }

    logger.info("Updated usage metrics");

    // Create some email logs for tracking
    const emailLogs = await Promise.all([
      prisma.emailLog.create({
        data: {
          companyId: company.id,
          contactId: contacts[0].id,
          toEmail: contacts[0].email,
          fromEmail: "noreply@testshipping.com",
          subject: "RFQ Request - Electronics Container Shipment",
          bodyHtml: "<p>Sample email content</p>",
          status: "SENT",
          sentAt: new Date(),
          emailType: "RFQ",
        },
      }),
      prisma.emailLog.create({
        data: {
          companyId: company.id,
          contactId: contacts[1].id,
          toEmail: contacts[1].email,
          fromEmail: "noreply@testshipping.com",
          subject: "Follow-up: RFQ Request",
          bodyHtml: "<p>Follow-up email content</p>",
          status: "SENT",
          sentAt: new Date(),
          emailType: "FOLLOW_UP",
        },
      }),
    ]);

    logger.info(`Created ${emailLogs.length} email logs`);

    // Summary
    logger.info("🎉 Additional test data creation completed successfully!");
    logger.info(`📊 Additional Data Summary:`);
    logger.info(`   - Additional RFQs: ${additionalRFQs.length}`);
    logger.info(`   - Additional Quotes: ${additionalQuotes.length}`);
    logger.info(`   - Email Campaigns: ${emailCampaigns.length}`);
    logger.info(`   - Usage Metrics: Updated`);
    logger.info(`   - Email Logs: ${emailLogs.length}`);

    return {
      additionalRFQs,
      additionalQuotes,
      emailCampaigns,
      emailLogs,
    };
  } catch (error) {
    logger.error("Error creating additional test data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createAdditionalTestData()
    .then(() => {
      logger.info("Additional test data creation completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Additional test data creation failed:", error);
      process.exit(1);
    });
}

export { createAdditionalTestData };
