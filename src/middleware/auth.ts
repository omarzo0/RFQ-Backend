import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../app";
import { AppError } from "../utils/errors";
import logger from "../utils/logger";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTUtils {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!;
  private static readonly REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET!;
  private static readonly ACCESS_TOKEN_EXPIRES_IN =
    process.env.JWT_EXPIRES_IN || "15m";
  private static readonly REFRESH_TOKEN_EXPIRES_IN =
    process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(): string {
    return randomBytes(64).toString("hex");
  }

  /**
   * Generate both access and refresh tokens
   */
  static async generateTokenPair(
    userId: string,
    userType: "admin" | "company_user",
    role: string,
    companyId?: string
  ): Promise<TokenPair> {
    const accessToken = this.generateAccessToken({
      userId,
      userType,
      role,
      companyId,
    });

    const refreshToken = this.generateRefreshToken();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId,
        userType,
        companyId,
        expiresAt,
      },
    });

    logger.info(`Generated token pair for user ${userId} (${userType})`);

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Access token expired", 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid access token", 401);
      }
      throw new AppError("Token verification failed", 401);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    // Find all refresh tokens and check against the provided token
    const storedTokens = await prisma.refreshToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
        isRevoked: false,
      },
    });

    let validToken = null;
    for (const stored of storedTokens) {
      if (await bcrypt.compare(refreshToken, stored.tokenHash)) {
        validToken = stored;
        break;
      }
    }

    if (!validToken) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Revoke the used refresh token
    await prisma.refreshToken.update({
      where: { id: validToken.id },
      data: { isRevoked: true },
    });

    // Generate new token pair
    return this.generateTokenPair(
      validToken.userId!,
      validToken.userType,
      "employee", // Default role, should be fetched from user record
      validToken.companyId || undefined
    );
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllTokens(
    userId: string,
    userType: "admin" | "company_user"
  ): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        userType,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    logger.info(`Revoked all tokens for user ${userId} (${userType})`);
  }
}

// Authentication middleware
export const authenticate = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const payload = JWTUtils.verifyAccessToken(token);

    // Get user details from database
    let user;
    if (payload.userType === "admin") {
      user = await prisma.admin.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    } else {
      user = await prisma.companyUser.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          companyId: true,
        },
      });
    }

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      userType: payload.userType,
      companyId: (user as any).companyId,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};
