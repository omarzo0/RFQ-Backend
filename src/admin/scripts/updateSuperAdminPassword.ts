import { PrismaClient } from "@prisma/client";
import { PasswordUtils } from "../../utils/password";
import logger from "../../utils/logger";

const prisma = new PrismaClient();

async function updateSuperAdminPassword() {
  try {
    // Find the superadmin
    const superAdmin = await prisma.admin.findFirst({
      where: {
        email: "superadmin@rfqplatform.com",
        role: "SUPER_ADMIN",
      },
    });

    if (!superAdmin) {
      logger.error("Super admin not found");
      throw new Error("Super admin not found");
    }

    // Hash the new password
    const newPasswordHash = await PasswordUtils.hash(" ");

    // Update the password
    await prisma.admin.update({
      where: { id: superAdmin.id },
      data: { passwordHash: newPasswordHash },
    });

    logger.info(
      `Super admin password updated successfully: ${superAdmin.email}`
    );
    logger.info("New password: omar123@");
  } catch (error) {
    logger.error("Error updating super admin password:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  updateSuperAdminPassword()
    .then(() => {
      logger.info("Super admin password update completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Super admin password update failed:", error);
      process.exit(1);
    });
}

export { updateSuperAdminPassword };
