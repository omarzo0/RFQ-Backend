import { Router } from "express";
import { EmailController } from "../controllers/EmailController";
import { authenticate } from "../middleware/companyAuth";
import { body, query, param } from "express-validator";

const router = Router();
const emailController = new EmailController();

// Apply authentication middleware to all routes
router.use(authenticate);

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
  [param("id").isUUID().withMessage("Invalid UUID format")],
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

// Specific template routes (must come before parameterized routes)
router.get("/templates/types", emailController.getTemplateTypes);
router.get("/templates/tokens", emailController.getSupportedTokens);
router.get("/templates/debug", emailController.debugTemplates);
router.get(
  "/templates/analytics",
  [
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
  ],
  emailController.getTemplateAnalytics
);

// Parameterized template routes (must come after specific routes)
router.get(
  "/templates/:id",
  [param("id").isUUID().withMessage("Invalid UUID format")],
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
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.updateEmailTemplate
);

router.delete(
  "/templates/:id",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.deleteEmailTemplate
);

router.post(
  "/templates/:id/duplicate",
  [
    param("id").isUUID().withMessage("Invalid UUID format"),
    body("newName").notEmpty().trim(),
  ],
  emailController.duplicateEmailTemplate
);

router.put(
  "/templates/:id/default",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.setDefaultTemplate
);

router.post(
  "/templates/:id/preview",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.previewTemplate
);

router.get(
  "/templates/:id/stats",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.getTemplateStats
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
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.updateFollowUpRule
);

router.delete(
  "/follow-up-rules/:id",
  [param("id").isUUID().withMessage("Invalid UUID format")],
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

// Specific campaign routes (must come before parameterized routes)
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

// Parameterized campaign routes (must come after specific routes)
router.get(
  "/campaigns/:id",
  [param("id").isUUID().withMessage("Invalid UUID format")],
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
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.updateEmailCampaign
);

router.delete(
  "/campaigns/:id",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.deleteEmailCampaign
);

router.post(
  "/campaigns/:id/start",
  [
    param("id").isUUID().withMessage("Invalid UUID format"),
    body("target").isObject(),
    body("emailContent").isObject(),
    body("emailContent.subject").notEmpty().trim(),
    body("emailContent.bodyHtml").notEmpty(),
  ],
  emailController.startEmailCampaign
);

router.put(
  "/campaigns/:id/pause",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.pauseEmailCampaign
);

router.put(
  "/campaigns/:id/resume",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.resumeEmailCampaign
);

router.put(
  "/campaigns/:id/complete",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.completeEmailCampaign
);

router.get(
  "/campaigns/:id/stats",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.getCampaignStats
);

router.post(
  "/campaigns/:id/reset-to-draft",
  [param("id").isUUID().withMessage("Invalid UUID format")],
  emailController.resetCampaignToDraft
);

export default router;
