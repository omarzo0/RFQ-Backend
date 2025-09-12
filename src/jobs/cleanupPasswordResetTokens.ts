import { PasswordResetService } from "../services/PasswordResetService";
import logger from "../utils/logger";

/**
 * Cleanup job for expired password reset tokens
 * This should be run periodically (e.g., every hour) to clean up expired tokens
 */
export async function cleanupPasswordResetTokens() {
  try {
    const passwordResetService = new PasswordResetService();
    const cleanedCount = await passwordResetService.cleanupExpiredTokens();

    logger.info(
      `Password reset token cleanup completed. Removed ${cleanedCount} expired tokens.`
    );
    return cleanedCount;
  } catch (error) {
    logger.error("Error during password reset token cleanup:", error);
    throw error;
  }
}

// If this file is run directly (not imported)
if (require.main === module) {
  cleanupPasswordResetTokens()
    .then((count) => {
      console.log(`✅ Cleanup completed. Removed ${count} expired tokens.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Cleanup failed:", error);
      process.exit(1);
    });
}
