import { PrismaClient } from "@prisma/client";
import { PasswordUtils } from "../../utils/password";
import logger from "../../utils/logger";

const prisma = new PrismaClient();

async function createNewAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: "admin@rfqplatform.com" },
    });

    if (existingAdmin) {
      logger.info("Admin with email admin@rfqplatform.com already exists");
      return;
    }

    // Create new admin
    const passwordHash = await PasswordUtils.hash("admin123");

    const newAdmin = await prisma.admin.create({
      data: {
        email: "admin@rfqplatform.com",
        passwordHash,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        isActive: true,
      },
    });

    logger.info(`New admin created successfully: ${newAdmin.email}`);
    logger.info(
      "Default password: admin123 - Please change this in production!"
    );
  } catch (error) {
    logger.error("Error creating new admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createNewAdmin()
    .then(() => {
      logger.info("New admin creation completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("New admin creation failed:", error);
      process.exit(1);
    });
}

export { createNewAdmin };
