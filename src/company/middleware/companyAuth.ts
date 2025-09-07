import { Request, Response, NextFunction } from "express";
import { JWTUtils } from "../../middleware/auth";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

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

      // Check if user is company user
      if (decoded.userType !== "COMPANY_USER") {
        res.status(403).json({
          success: false,
          error: "Company user access required",
          code: "FORBIDDEN",
        });
        return;
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        userType: "COMPANY_USER",
        companyId: decoded.companyId || "",
      };

      next();
    } catch (tokenError) {
      logger.warn(`Invalid company user token: ${tokenError}`);
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        code: "UNAUTHORIZED",
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
