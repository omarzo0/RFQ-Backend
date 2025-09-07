import { PrismaClient } from "@prisma/client";
import { PasswordUtils } from "../../utils/password";
import logger from "../../utils/logger";

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existingSuperAdmin) {
      logger.info("Super admin already exists");
      return;
    }

    // Create super admin
    const passwordHash = await PasswordUtils.hash("admin123"); // Change this password in production

    const superAdmin = await prisma.admin.create({
      data: {
        email: "superadmin@rfqplatform.com",
        passwordHash,
        firstName: "Super",
        lastName: "Admin",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    logger.info(`Super admin created successfully: ${superAdmin.email}`);
    logger.info(
      "Default password: admin123 - Please change this in production!"
    );
  } catch (error) {
    logger.error("Error creating super admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createSuperAdmin()
    .then(() => {
      logger.info("Super admin creation completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Super admin creation failed:", error);
      process.exit(1);
    });
}

export { createSuperAdmin };
