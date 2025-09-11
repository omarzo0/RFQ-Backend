const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function resetCompletedCampaign() {
  try {
    const campaignId = "63dc9bfc-f5e2-4896-a7be-a361a3bdf8be";
    
    // First check current status
    const currentCampaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        name: true,
        status: true,
        companyId: true,
        totalEmails: true,
        sentEmails: true,
        deliveredEmails: true,
        openedEmails: true,
        clickedEmails: true,
        bouncedEmails: true
      }
    });
    
    if (!currentCampaign) {
      console.log("Campaign not found with ID:", campaignId);
      return;
    }
    
    console.log("Current campaign status:", currentCampaign.status);
    console.log("Campaign name:", currentCampaign.name);
    console.log("Current metrics:");
    console.log("- Total emails:", currentCampaign.totalEmails);
    console.log("- Sent emails:", currentCampaign.sentEmails);
    console.log("- Delivered emails:", currentCampaign.deliveredEmails);
    console.log("- Opened emails:", currentCampaign.openedEmails);
    console.log("- Clicked emails:", currentCampaign.clickedEmails);
    console.log("- Bounced emails:", currentCampaign.bouncedEmails);
    
    // Reset to draft
    const updatedCampaign = await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: "DRAFT",
        startDate: null,
        endDate: null,
        totalEmails: 0,
        sentEmails: 0,
        deliveredEmails: 0,
        openedEmails: 0,
        clickedEmails: 0,
        bouncedEmails: 0,
        updatedAt: new Date(),
      },
    });
    
    console.log("\n✅ Campaign successfully reset to DRAFT status!");
    console.log("New status:", updatedCampaign.status);
    console.log("Updated at:", updatedCampaign.updatedAt);
    console.log("\nYou can now update this campaign using the PUT /api/v1/company/emails/campaigns/:id endpoint.");
    
  } catch (error) {
    console.error("Error resetting campaign:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCompletedCampaign();
