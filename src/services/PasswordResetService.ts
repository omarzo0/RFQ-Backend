import { prisma } from "../app";
import { AppError, ValidationError } from "../utils/errors";
import logger from "../utils/logger";
import { UserType } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export interface PasswordResetRequest {
  email: string;
  userType: UserType;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
}

export class PasswordResetService {
  private transporter: nodemailer.Transporter;
  private readonly TOKEN_EXPIRY_HOURS = 1; // Token expires in 1 hour
  private readonly SALT_ROUNDS = 12;

  constructor() {
    // Create nodemailer transporter for Brevo
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Request password reset for admin or company user
   */
  async requestPasswordReset(data: PasswordResetRequest) {
    const { email, userType } = data;

    // Find user based on type
    let user: any = null;
    let companyId: string | null = null;

    if (userType === UserType.ADMIN) {
      user = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      });
    } else if (userType === UserType.COMPANY_USER) {
      user = await prisma.companyUser.findFirst({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          companyId: true,
        },
      });
      companyId = user?.companyId || null;
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return {
        message: "If an account with this email exists, an OTP has been sent.",
      };
    }

    if (!user.isActive) {
      throw new ValidationError("Account is inactive. Please contact support.");
    }

    // Invalidate any existing password reset tokens for this user
    await this.invalidateExistingTokens(user.id, userType);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create password reset token
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        adminUserId: userType === UserType.ADMIN ? user.id : null,
        companyUserId: userType === UserType.COMPANY_USER ? user.id : null,
        userType,
        companyId,
        email: user.email,
        expiresAt,
      },
    });

    // Send OTP email
    await this.sendOTPEmail(user, otp, userType);

    logger.info(`Password reset OTP sent for ${userType}: ${user.email}`);
    return {
      message: "OTP has been sent to your email address.",
      // OTP is only sent via email, never returned in response
    };
  }

  /**
   * Verify OTP and reset password
   * Email is extracted from the access token, not from request body
   */
  async verifyOTPAndResetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
    userType: UserType;
    userId: string; // User ID from access token
  }) {
    const { email, otp, newPassword, userType, userId } = data;

    // Validate password strength
    this.validatePasswordStrength(newPassword);

    // Hash the OTP to find the record
    const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Find the password reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        email: email.toLowerCase(),
        userType,
        isUsed: false,
        expiresAt: { gt: new Date() },
        // Verify the token belongs to the authenticated user
        OR: [
          { adminUserId: userType === UserType.ADMIN ? userId : null },
          { companyUserId: userType === UserType.COMPANY_USER ? userId : null },
        ],
      },
      include: {
        admin: true,
        companyUser: true,
        company: true,
      },
    });

    if (!resetToken) {
      throw new ValidationError("Invalid or expired OTP");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update user password based on type
    if (resetToken.userType === UserType.ADMIN && resetToken.admin) {
      await prisma.admin.update({
        where: { id: resetToken.admin.id },
        data: { passwordHash },
      });
    } else if (
      resetToken.userType === UserType.COMPANY_USER &&
      resetToken.companyUser
    ) {
      await prisma.companyUser.update({
        where: { id: resetToken.companyUser.id },
        data: { passwordHash },
      });
    } else {
      throw new AppError("User not found", 404);
    }

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Invalidate all refresh tokens for this user
    await this.invalidateUserRefreshTokens(
      resetToken.adminUserId,
      resetToken.companyUserId,
      resetToken.userType
    );

    logger.info(
      `Password reset completed for ${resetToken.userType}: ${resetToken.email}`
    );
    return { message: "Password has been reset successfully." };
  }

  /**
   * Verify OTP only (without resetting password)
   * Email is extracted from the access token, not from request body
   */
  async verifyOTP(data: {
    email: string;
    otp: string;
    userType: UserType;
    userId: string; // User ID from access token
  }) {
    const { email, otp, userType, userId } = data;

    // Hash the OTP to find the record
    const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Find the password reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        email: email.toLowerCase(),
        userType,
        isUsed: false,
        expiresAt: { gt: new Date() },
        // Verify the token belongs to the authenticated user
        OR: [
          { adminUserId: userType === UserType.ADMIN ? userId : null },
          { companyUserId: userType === UserType.COMPANY_USER ? userId : null },
        ],
      },
    });

    if (!resetToken) {
      throw new ValidationError("Invalid or expired OTP");
    }

    return {
      message: "OTP verified successfully",
      valid: true,
    };
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string) {
    if (!password || password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long.");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one lowercase letter."
      );
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one uppercase letter."
      );
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new ValidationError("Password must contain at least one number.");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new ValidationError(
        "Password must contain at least one special character (@$!%*?&)."
      );
    }
  }

  /**
   * Send OTP email
   */
  private async sendOTPEmail(user: any, otp: string, userType: UserType) {
    const userName = `${user.firstName} ${user.lastName}`;
    const platformName =
      userType === UserType.ADMIN ? "RFQ Admin Panel" : "RFQ Platform";

    const subject = `Password Reset OTP - ${platformName}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset OTP</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your ${platformName} account.</p>
            
            <p>Use the following OTP to reset your password:</p>
            
            <div class="otp-box">
              ${otp}
            </div>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This OTP will expire in 10 minutes</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>For security reasons, this OTP can only be used once</li>
                <li>Do not share this OTP with anyone</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The ${platformName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Password Reset OTP - ${platformName}

Hello ${userName},

We received a request to reset your password for your ${platformName} account.

Your OTP is: ${otp}

Important:
- This OTP will expire in 10 minutes
- If you didn't request this password reset, please ignore this email
- For security reasons, this OTP can only be used once
- Do not share this OTP with anyone

If you have any questions, please contact our support team.

Best regards,
The ${platformName} Team

This is an automated message. Please do not reply to this email.
    `;

    try {
      // Send email directly using nodemailer
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || "RFQ Platform",
          address:
            process.env.EMAIL_FROM_ADDRESS || "omarkhaled202080@gmail.com",
        },
        to: user.email,
        subject,
        html: htmlContent,
        text: textContent,
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`Password reset OTP email sent to ${user.email}`);
      logger.info(`Message ID: ${result.messageId}`);
    } catch (error) {
      logger.error("Failed to send password reset OTP email:", error);
      throw new AppError("Failed to send password reset OTP email", 500);
    }
  }

  /**
   * Invalidate existing password reset tokens for user
   */
  private async invalidateExistingTokens(userId: string, userType: UserType) {
    const whereClause: any = {
      isUsed: false,
    };

    if (userType === UserType.ADMIN) {
      whereClause.adminUserId = userId;
    } else if (userType === UserType.COMPANY_USER) {
      whereClause.companyUserId = userId;
    }

    await prisma.passwordResetToken.updateMany({
      where: whereClause,
      data: { isUsed: true },
    });
  }

  /**
   * Invalidate all refresh tokens for user
   */
  private async invalidateUserRefreshTokens(
    adminUserId: string | null,
    companyUserId: string | null,
    userType: UserType
  ) {
    const whereClause: any = {};

    if (userType === UserType.ADMIN && adminUserId) {
      whereClause.adminUserId = adminUserId;
    } else if (userType === UserType.COMPANY_USER && companyUserId) {
      whereClause.companyUserId = companyUserId;
    }

    if (Object.keys(whereClause).length > 0) {
      await prisma.refreshToken.updateMany({
        where: whereClause,
        data: { isRevoked: true },
      });
    }
  }

  /**
   * Clean up expired tokens (can be called by a cron job)
   */
  async cleanupExpiredTokens() {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            isUsed: true,
            createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          }, // Delete used tokens older than 24 hours
        ],
      },
    });

    logger.info(`Cleaned up ${result.count} expired password reset tokens`);
    return result.count;
  }

  /**
   * Verify token validity without using it
   */
  async verifyToken(token: string) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        admin: true,
        companyUser: true,
      },
    });

    if (!resetToken) {
      throw new ValidationError("Invalid or expired password reset token.");
    }

    return {
      valid: true,
      email: resetToken.email,
      userType: resetToken.userType,
      expiresAt: resetToken.expiresAt,
    };
  }
}
