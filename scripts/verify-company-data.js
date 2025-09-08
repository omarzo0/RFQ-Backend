const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verifyCompanyData() {
  try {
    console.log("🔍 Verifying company data...\n");

    // Check companies
    const companies = await prisma.company.findMany();
    console.log(`📊 Companies: ${companies.length}`);
    companies.forEach((company) => {
      console.log(
        `   - ${company.name} (${company.email}) - ${company.subscriptionPlan}`
      );
    });

    // Check company users
    const companyUsers = await prisma.companyUser.findMany();
    console.log(`\n👥 Company Users: ${companyUsers.length}`);
    companyUsers.forEach((user) => {
      console.log(
        `   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`
      );
    });

    // Check shipping lines
    const shippingLines = await prisma.shippingLine.findMany();
    console.log(`\n🚢 Shipping Lines: ${shippingLines.length}`);
    shippingLines.forEach((line) => {
      console.log(
        `   - ${line.name} (${line.code}) - ${line.headquartersLocation}`
      );
    });

    // Check contacts
    const contacts = await prisma.contact.findMany();
    console.log(`\n👤 Contacts: ${contacts.length}`);
    contacts.forEach((contact) => {
      console.log(
        `   - ${contact.firstName} ${contact.lastName} (${contact.email})`
      );
    });

    // Check RFQs
    const rfqs = await prisma.rFQ.findMany();
    console.log(`\n📋 RFQs: ${rfqs.length}`);
    rfqs.forEach((rfq) => {
      console.log(`   - ${rfq.rfqNumber}: ${rfq.title} (${rfq.status})`);
    });

    // Check quotes
    const quotes = await prisma.quote.findMany();
    console.log(`\n💰 Quotes: ${quotes.length}`);
    quotes.forEach((quote) => {
      console.log(
        `   - Quote ${quote.id}: $${quote.totalAmount} ${quote.currency} (${quote.status})`
      );
    });

    // Check templates
    const rfqTemplates = await prisma.rFQTemplate.findMany();
    const emailTemplates = await prisma.emailTemplate.findMany();
    console.log(`\n📄 Templates:`);
    console.log(`   - RFQ Templates: ${rfqTemplates.length}`);
    console.log(`   - Email Templates: ${emailTemplates.length}`);

    // Check campaigns
    const campaigns = await prisma.emailCampaign.findMany();
    console.log(`\n📢 Email Campaigns: ${campaigns.length}`);
    campaigns.forEach((campaign) => {
      console.log(
        `   - ${campaign.name} (${campaign.campaignType}) - ${campaign.status}`
      );
    });

    // Check usage metrics
    const usageMetrics = await prisma.usageMetric.findMany();
    console.log(`\n📊 Usage Metrics: ${usageMetrics.length}`);
    usageMetrics.forEach((metric) => {
      console.log(
        `   - Period: ${metric.periodMonth}/${metric.periodYear} - RFQs: ${metric.rfqsCreated}, Emails: ${metric.emailsSent}`
      );
    });

    console.log("\n✅ Company data verification completed!");
    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@testshipping.com / admin123");
    console.log("   Employee: employee@testshipping.com / employee123");
  } catch (error) {
    console.error("❌ Error verifying company data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCompanyData();
