import { Router } from "express";
import { EmailController } from "../controllers/EmailController";
import { authenticateToken } from "../middleware/companyAuth";
import { validateUUID } from "../../utils/validators";
import { body, query } from "express-validator";

const router = Router();
const emailController = new EmailController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Email sending routes
router.post(
  "/send",
  [
    body("toEmail").isEmail().normalizeEmail(),
    body("fromEmail").isEmail().normalizeEmail(),
    body("subject").notEmpty().trim(),
    body("bodyHtml").notEmpty(),
  ],
  emailController.sendEmail
);

router.post(
  "/bulk",
  [
    body("name").notEmpty().trim(),
    body("subject").notEmpty().trim(),
    body("bodyHtml").notEmpty(),
    body("contactIds").isArray({ min: 1 }),
    body("contactIds.*").isUUID(),
  ],
  emailController.createBulkEmail
);

router.post(
  "/bulk/:id/send",
  [validateUUID("id")],
  emailController.sendBulkEmail
);

// Email analytics
router.get(
  "/analytics",
  [
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
    query("emailType")
      .optional()
      .isIn([
        "RFQ",
        "FOLLOW_UP",
        "BULK_EMAIL",
        "CAMPAIGN",
        "NOTIFICATION",
        "SYSTEM",
      ]),
  ],
  emailController.getEmailAnalytics
);

// Email retry
router.post(
  "/retry",
  [
    body("emailLogIds").optional().isArray(),
    body("emailLogIds.*").optional().isUUID(),
  ],
  emailController.retryFailedEmails
);

// Email tracking (public routes - no authentication)
router.post(
  "/track/:trackingPixelId",
  [body("engagementType").isIn(["OPEN", "CLICK"])],
  emailController.trackEmailEngagement
);

router.post(
  "/bounce",
  [
    body("emailLogId").isUUID(),
    body("bounceType").isIn(["HARD", "SOFT", "SPAM", "BLOCKED", "INVALID"]),
  ],
  emailController.handleEmailBounce
);

router.post(
  "/unsubscribe/:unsubscribeToken",
  emailController.handleUnsubscribe
);

// Email Template routes
router.get(
  "/templates",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim(),
    query("templateType").optional().trim(),
    query("language").optional().trim(),
    query("isActive").optional().isBoolean(),
    query("isDefault").optional().isBoolean(),
  ],
  emailController.getEmailTemplates
);

router.get(
  "/templates/:id",
  [validateUUID("id")],
  emailController.getEmailTemplate
);

router.post(
  "/templates",
  [
    body("name").notEmpty().trim(),
    body("templateType").notEmpty().trim(),
    body("subject").notEmpty().trim(),
    body("bodyHtml").notEmpty(),
    body("supportedTokens").isArray(),
  ],
  emailController.createEmailTemplate
);

router.put(
  "/templates/:id",
  [validateUUID("id")],
  emailController.updateEmailTemplate
);

router.delete(
  "/templates/:id",
  [validateUUID("id")],
  emailController.deleteEmailTemplate
);

router.post(
  "/templates/:id/duplicate",
  [validateUUID("id"), body("newName").notEmpty().trim()],
  emailController.duplicateEmailTemplate
);

router.put(
  "/templates/:id/default",
  [validateUUID("id")],
  emailController.setDefaultTemplate
);

router.post(
  "/templates/:id/preview",
  [validateUUID("id")],
  emailController.previewTemplate
);

router.get(
  "/templates/:id/stats",
  [validateUUID("id")],
  emailController.getTemplateStats
);

router.get("/templates/types", emailController.getTemplateTypes);

router.get("/templates/tokens", emailController.getSupportedTokens);

router.get(
  "/templates/analytics",
  [
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
    query("templateType").optional().trim(),
  ],
  emailController.getTemplateAnalytics
);

// Follow-up Rule routes
router.get(
  "/follow-up-rules",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("isActive").optional().isBoolean(),
    query("search").optional().trim(),
  ],
  emailController.getFollowUpRules
);

router.post(
  "/follow-up-rules",
  [
    body("name").notEmpty().trim(),
    body("daysAfterSend").isInt({ min: 1 }),
    body("maxFollowUps").isInt({ min: 1, max: 10 }),
    body("emailTemplateId").optional().isUUID(),
  ],
  emailController.createFollowUpRule
);

router.put(
  "/follow-up-rules/:id",
  [validateUUID("id")],
  emailController.updateFollowUpRule
);

router.delete(
  "/follow-up-rules/:id",
  [validateUUID("id")],
  emailController.deleteFollowUpRule
);

router.post(
  "/follow-up-rules/process",
  emailController.processScheduledFollowUps
);

router.get(
  "/follow-up-rules/analytics",
  [
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
    query("rfqId").optional().isUUID(),
  ],
  emailController.getFollowUpAnalytics
);

// Email Campaign routes
router.get(
  "/campaigns",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim(),
    query("campaignType")
      .optional()
      .isIn([
        "RFQ_BLAST",
        "FOLLOW_UP_CAMPAIGN",
        "MARKETING",
        "ANNOUNCEMENT",
        "NEWSLETTER",
      ]),
    query("status")
      .optional()
      .isIn([
        "DRAFT",
        "SCHEDULED",
        "RUNNING",
        "COMPLETED",
        "PAUSED",
        "CANCELLED",
      ]),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
  ],
  emailController.getEmailCampaigns
);

router.get(
  "/campaigns/:id",
  [validateUUID("id")],
  emailController.getEmailCampaign
);

router.post(
  "/campaigns",
  [
    body("name").notEmpty().trim(),
    body("campaignType").isIn([
      "RFQ_BLAST",
      "FOLLOW_UP_CAMPAIGN",
      "MARKETING",
      "ANNOUNCEMENT",
      "NEWSLETTER",
    ]),
    body("startDate").optional().isISO8601(),
    body("endDate").optional().isISO8601(),
  ],
  emailController.createEmailCampaign
);

router.put(
  "/campaigns/:id",
  [validateUUID("id")],
  emailController.updateEmailCampaign
);

router.delete(
  "/campaigns/:id",
  [validateUUID("id")],
  emailController.deleteEmailCampaign
);

router.post(
  "/campaigns/:id/start",
  [
    validateUUID("id"),
    body("target").isObject(),
    body("emailContent").isObject(),
    body("emailContent.subject").notEmpty().trim(),
    body("emailContent.bodyHtml").notEmpty(),
  ],
  emailController.startEmailCampaign
);

router.put(
  "/campaigns/:id/pause",
  [validateUUID("id")],
  emailController.pauseEmailCampaign
);

router.put(
  "/campaigns/:id/resume",
  [validateUUID("id")],
  emailController.resumeEmailCampaign
);

router.put(
  "/campaigns/:id/complete",
  [validateUUID("id")],
  emailController.completeEmailCampaign
);

router.get(
  "/campaigns/:id/stats",
  [validateUUID("id")],
  emailController.getCampaignStats
);

router.get(
  "/campaigns/analytics",
  [
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
    query("campaignType")
      .optional()
      .isIn([
        "RFQ_BLAST",
        "FOLLOW_UP_CAMPAIGN",
        "MARKETING",
        "ANNOUNCEMENT",
        "NEWSLETTER",
      ]),
  ],
  emailController.getCampaignAnalytics
);

router.get("/campaigns/types", emailController.getCampaignTypes);

router.get("/campaigns/statuses", emailController.getCampaignStatuses);

export default router;

