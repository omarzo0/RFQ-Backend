import { Request, Response, NextFunction } from "express";
import { JWTUtils } from "../../admin/middleware/auth";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import { prisma } from "../../app";

export interface CompanyRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    userType: "COMPANY_USER";
    companyId: string;
  };
}

/**
 * Middleware to authenticate company users
 */
export const authenticateCompanyUser = async (
  req: CompanyRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    logger.info(`Auth header received: ${authHeader ? "Present" : "Missing"}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing or invalid authorization header format");
      res.status(401).json({
        success: false,
        error: "Access token required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    const token = authHeader.substring(7);
    logger.info(`Token extracted: ${token.substring(0, 20)}...`);

    try {
      const decoded = JWTUtils.verifyAccessToken(token);

      // Check if user is company user
      if (decoded.userType !== "COMPANY_USER") {
        res.status(403).json({
          success: false,
          error: "Company user access required",
          code: "FORBIDDEN",
        });
        return;
      }

      // Fetch user details from database
      const user = await prisma.companyUser.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          companyId: true,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: "User not found",
          code: "UNAUTHORIZED",
        });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        userType: "COMPANY_USER",
        companyId: user.companyId || "",
      };

      next();
    } catch (tokenError) {
      logger.warn(`Invalid company user token: ${tokenError}`);
      logger.warn(`Token that failed: ${token.substring(0, 20)}...`);
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        code: "UNAUTHORIZED",
        details:
          process.env.NODE_ENV === "development"
            ? tokenError instanceof Error
              ? tokenError.message
              : String(tokenError)
            : undefined,
      });
      return;
    }
  } catch (error) {
    logger.error("Company user authentication error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed",
      code: "INTERNAL_ERROR",
    });
    return;
  }
};

/**
 * Middleware to check if user has admin role within company
 */
export const requireCompanyAdmin = (
  req: CompanyRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "UNAUTHORIZED",
    });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      error: "Company admin access required",
      code: "FORBIDDEN",
    });
    return;
  }

  next();
};

// Alias for backward compatibility
export const authenticate = authenticateCompanyUser;

/**
 * Middleware to check if user has admin or manager role within company
 */
export const requireCompanyAdminOrManager = (
  req: CompanyRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "UNAUTHORIZED",
    });
    return;
  }

  if (!["ADMIN", "MANAGER"].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: "Admin or manager access required",
      code: "FORBIDDEN",
    });
    return;
  }

  next();
};
