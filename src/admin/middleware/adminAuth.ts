import { Request, Response, NextFunction } from "express";
import { JWTUtils } from "./auth";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";
import { prisma } from "../../app";

export interface AdminRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    userType: "ADMIN";
  };
}

/**
 * Middleware to authenticate admin users
 */
export const authenticateAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Access token required",
        code: "UNAUTHORIZED",
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = await JWTUtils.verifyAccessToken(token);

      // Check if user is admin
      if (decoded.userType !== "ADMIN") {
        res.status(403).json({
          success: false,
          error: "Admin access required",
          code: "FORBIDDEN",
        });
        return;
      }

      // Get admin details from database
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!admin || !admin.isActive) {
        res.status(401).json({
          success: false,
          error: "Admin not found or inactive",
          code: "UNAUTHORIZED",
        });
        return;
      }

      req.user = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        userType: "ADMIN",
      };

      next();
    } catch (tokenError) {
      logger.warn(`Invalid admin token: ${tokenError}`);
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        code: "UNAUTHORIZED",
      });
      return;
    }
  } catch (error) {
    logger.error("Admin authentication error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed",
      code: "INTERNAL_ERROR",
    });
    return;
  }
};

/**
 * Middleware to check if admin has super admin role
 */
export const requireSuperAdmin = (
  req: AdminRequest,
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

  if (req.user.role !== "SUPER_ADMIN") {
    res.status(403).json({
      success: false,
      error: "Super admin access required",
      code: "FORBIDDEN",
    });
    return;
  }

  next();
};

/**
 * Middleware to check if admin has admin or super admin role
 */
export const requireAdminOrSuperAdmin = (
  req: AdminRequest,
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

  if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: "Admin access required",
      code: "FORBIDDEN",
    });
    return;
  }

  next();
};
