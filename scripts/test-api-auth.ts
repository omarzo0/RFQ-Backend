import { PrismaClient } from "@prisma/client";
import { JWTUtils } from "../src/admin/middleware/auth";

const prisma = new PrismaClient();

async function testApiWithAuth() {
  try {
    console.log("🔐 Testing API with authentication...");

    // Get company and user
    const company = await prisma.company.findFirst();
    const companyUser = await prisma.companyUser.findFirst({
      where: { companyId: company?.id },
    });

    if (!company || !companyUser) {
      console.log("❌ Missing company or user data");
      return;
    }

    // Create a proper JWT token using the JWTUtils
    const tokenPair = await JWTUtils.generateTokenPair(
      companyUser.id,
      "COMPANY_USER",
      companyUser.role,
      companyUser.companyId
    );
    const token = tokenPair.accessToken;

    console.log(
      `✅ Generated test token for user: ${companyUser.firstName} ${companyUser.lastName}`
    );
    console.log(`🔑 Token: ${token.substring(0, 50)}...`);

    // Test the endpoints using fetch
    const baseUrl = "http://localhost:3000/api/v1/company";
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log("\n🚢 Testing Shipping Lines endpoint...");
    try {
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
      } else {
        console.log(
          `❌ Shipping Lines failed: ${shippingResponse.status} ${shippingResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(
        `❌ Shipping Lines error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    console.log("\n👤 Testing Contacts endpoint...");
    try {
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
      } else {
        console.log(
          `❌ Contacts failed: ${contactsResponse.status} ${contactsResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(
        `❌ Contacts error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    console.log("\n🎉 API testing complete!");
  } catch (error) {
    console.error("❌ Error testing API:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiWithAuth();
