const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testCampaignAnalytics() {
  try {
    // Check if there are any campaigns
    const campaigns = await prisma.emailCampaign.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        campaignType: true,
        createdAt: true,
        totalEmails: true,
        sentEmails: true,
        deliveredEmails: true,
        openedEmails: true,
        clickedEmails: true,
        bouncedEmails: true,
      },
    });

    console.log("Found campaigns:", campaigns.length);
    campaigns.forEach((campaign, index) => {
      console.log(
        `${index + 1}. ${campaign.name} (${campaign.status}) - Type: ${
          campaign.campaignType
        }`
      );
      console.log(
        `   Total: ${campaign.totalEmails}, Sent: ${campaign.sentEmails}, Delivered: ${campaign.deliveredEmails}`
      );
    });

    // Test the analytics query that the endpoint would run
    const analytics = await prisma.emailCampaign.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        totalEmails: true,
        sentEmails: true,
        deliveredEmails: true,
        openedEmails: true,
        clickedEmails: true,
        bouncedEmails: true,
      },
    });

    console.log("\nAnalytics summary:");
    console.log("- Total campaigns:", analytics._count.id);
    console.log("- Total emails:", analytics._sum.totalEmails || 0);
    console.log("- Sent emails:", analytics._sum.sentEmails || 0);
    console.log("- Delivered emails:", analytics._sum.deliveredEmails || 0);
    console.log("- Opened emails:", analytics._sum.openedEmails || 0);
    console.log("- Clicked emails:", analytics._sum.clickedEmails || 0);
    console.log("- Bounced emails:", analytics._sum.bouncedEmails || 0);
  } catch (error) {
    console.error("Error testing campaign analytics:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCampaignAnalytics();
