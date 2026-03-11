import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app";
import logger from "../../utils/logger";
import { isFeatureEnabled, FEATURE_MAP } from "../../config/featureRegistry";

/**
 * Helper: Get the subscription plan limits for a company.
 * Looks up the SubscriptionPlan row that matches company.subscriptionPlan name.
 * Returns null limits when no matching plan exists (unlimited fallback).
 */
async function getPlanLimitsForCompany(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
    },
  });

  if (!company) return null;

  // Inactive / suspended / cancelled companies are blocked entirely
  if (company.subscriptionStatus !== "ACTIVE") {
    return { blocked: true, reason: "Your subscription is not active. Please contact support." };
  }

  const plan = await prisma.subscriptionPlan.findFirst({
    where: { name: company.subscriptionPlan },
  });

  if (!plan) return { blocked: false, plan: null, company };

  return { blocked: false, plan, company };
}

/**
 * Middleware: Enforce maxRFQsPerMonth limit before creating an RFQ.
 */
export const enforceRFQLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = (req as any).user?.companyId;
    if (!companyId) { next(); return; }

    const result = await getPlanLimitsForCompany(companyId);
    if (!result) { next(); return; }
    if (result.blocked) {
      res.status(403).json({ success: false, error: result.reason, code: "SUBSCRIPTION_INACTIVE" });
      return;
    }

    const { plan } = result;
    if (!plan || plan.maxRFQsPerMonth === null) { next(); return; }

    // Count RFQs created this calendar month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const rfqCount = await prisma.rFQ.count({
      where: {
        companyId,
        createdAt: { gte: monthStart },
      },
    });

    if (rfqCount >= plan.maxRFQsPerMonth) {
      res.status(403).json({
        success: false,
        error: `You have reached your monthly RFQ limit (${plan.maxRFQsPerMonth}). Please upgrade your plan.`,
        code: "PLAN_LIMIT_REACHED",
        limit: plan.maxRFQsPerMonth,
        current: rfqCount,
      });
      return;
    }

    next();
  } catch (error) {
    logger.error("Error enforcing RFQ limit:", error);
    next(); // fail-open so a bug here doesn't block all requests
  }
};

/**
 * Middleware: Enforce maxContacts limit before creating a contact.
 */
export const enforceContactLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = (req as any).user?.companyId;
    if (!companyId) { next(); return; }

    const result = await getPlanLimitsForCompany(companyId);
    if (!result) { next(); return; }
    if (result.blocked) {
      res.status(403).json({ success: false, error: result.reason, code: "SUBSCRIPTION_INACTIVE" });
      return;
    }

    const { plan } = result;
    if (!plan || plan.maxContacts === null) { next(); return; }

    const contactCount = await prisma.contact.count({ where: { companyId } });

    if (contactCount >= plan.maxContacts) {
      res.status(403).json({
        success: false,
        error: `You have reached your contact limit (${plan.maxContacts}). Please upgrade your plan.`,
        code: "PLAN_LIMIT_REACHED",
        limit: plan.maxContacts,
        current: contactCount,
      });
      return;
    }

    next();
  } catch (error) {
    logger.error("Error enforcing contact limit:", error);
    next();
  }
};

/**
 * Middleware: Enforce maxUsers limit before creating a company user.
 */
export const enforceUserLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = (req as any).user?.companyId;
    if (!companyId) { next(); return; }

    const result = await getPlanLimitsForCompany(companyId);
    if (!result) { next(); return; }
    if (result.blocked) {
      res.status(403).json({ success: false, error: result.reason, code: "SUBSCRIPTION_INACTIVE" });
      return;
    }

    const { plan } = result;
    if (!plan || plan.maxUsers === null) { next(); return; }

    const userCount = await prisma.companyUser.count({ where: { companyId } });

    if (userCount >= plan.maxUsers) {
      res.status(403).json({
        success: false,
        error: `You have reached your user limit (${plan.maxUsers}). Please upgrade your plan.`,
        code: "PLAN_LIMIT_REACHED",
        limit: plan.maxUsers,
        current: userCount,
      });
      return;
    }

    next();
  } catch (error) {
    logger.error("Error enforcing user limit:", error);
    next();
  }
};

/**
 * Middleware: Enforce maxEmailSendsPerMonth limit before sending emails.
 */
export const enforceEmailLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = (req as any).user?.companyId;
    if (!companyId) { next(); return; }

    const result = await getPlanLimitsForCompany(companyId);
    if (!result) { next(); return; }
    if (result.blocked) {
      res.status(403).json({ success: false, error: result.reason, code: "SUBSCRIPTION_INACTIVE" });
      return;
    }

    const { plan } = result;
    if (!plan || plan.maxEmailSendsPerMonth === null) { next(); return; }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const emailCount = await prisma.emailLog.count({
      where: {
        companyId,
        createdAt: { gte: monthStart },
      },
    });

    if (emailCount >= plan.maxEmailSendsPerMonth) {
      res.status(403).json({
        success: false,
        error: `You have reached your monthly email limit (${plan.maxEmailSendsPerMonth}). Please upgrade your plan.`,
        code: "PLAN_LIMIT_REACHED",
        limit: plan.maxEmailSendsPerMonth,
        current: emailCount,
      });
      return;
    }

    next();
  } catch (error) {
    logger.error("Error enforcing email limit:", error);
    next();
  }
};

/**
 * Middleware: Check if a specific plan feature is enabled.
 * Uses the feature registry to resolve defaults and provide nice labels.
 * Usage: enforceFeature("advancedAnalytics")
 */
export const enforceFeature = (featureName: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId;
      if (!companyId) { next(); return; }

      const result = await getPlanLimitsForCompany(companyId);
      if (!result) { next(); return; }
      if (result.blocked) {
        res.status(403).json({ success: false, error: result.reason, code: "SUBSCRIPTION_INACTIVE" });
        return;
      }

      const { plan } = result;
      if (!plan) { next(); return; }

      const planFeatures = (plan.features as Record<string, boolean>) || {};

      if (!isFeatureEnabled(planFeatures, featureName)) {
        const def = FEATURE_MAP.get(featureName);
        const label = def ? def.label : featureName;
        res.status(403).json({
          success: false,
          error: `The "${label}" feature is not available on your current plan. Please upgrade.`,
          code: "FEATURE_NOT_AVAILABLE",
          feature: featureName,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error(`Error enforcing feature ${featureName}:`, error);
      next();
    }
  };
};
