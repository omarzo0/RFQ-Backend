import { Request, Response, NextFunction } from "express";
import { EmailService } from "../services/EmailService";
import { EmailTemplateService } from "../services/EmailTemplateService";
import { FollowUpService } from "../services/FollowUpService";
import { EmailCampaignService } from "../services/EmailCampaignService";
import { successResponse } from "../../utils/response";
import { CompanyRequest } from "../types/auth";

export class EmailController {
  private emailService = new EmailService();
  private emailTemplateService = new EmailTemplateService();
  private followUpService = new FollowUpService();
  private emailCampaignService = new EmailCampaignService();

  /**
   * POST /api/v1/emails/send
   */
  sendEmail = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const {
        toEmail,
        fromEmail,
        subject,
        bodyHtml,
        bodyText,
        rfqId,
        contactId,
        templateId,
        emailType,
        priority,
        personalizationData,
        scheduledFor,
      } = req.body;

      const emailLog = await this.emailService.sendEmail(
        companyId,
        toEmail,
        fromEmail,
        subject,
        bodyHtml,
        bodyText,
        {
          rfqId,
          contactId,
          templateId,
          emailType,
          priority,
          personalizationData,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        }
      );

      successResponse(res, emailLog, "Email sent successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/bulk
   */
  createBulkEmail = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const createdBy = req.user!.id;
      const {
        name,
        description,
        subject,
        bodyHtml,
        bodyText,
        templateId,
        contactIds,
        scheduledFor,
        rateLimitPerMinute,
        personalizationData,
        language,
        timezone,
        priority,
      } = req.body;

      const result = await this.emailService.createBulkEmail(
        companyId,
        createdBy,
        {
          name,
          description,
          subject,
          bodyHtml,
          bodyText,
          templateId,
          contactIds,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          rateLimitPerMinute,
          personalizationData,
          language,
          timezone,
          priority,
        }
      );

      successResponse(res, result, "Bulk email created successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/bulk/:id/send
   */
  sendBulkEmail = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const result = await this.emailService.sendBulkEmail(id, companyId);

      successResponse(res, result, "Bulk email sent successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/analytics
   */
  getEmailAnalytics = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const { dateFrom, dateTo, emailType, bulkEmailId, campaignId } =
        req.query;

      const analytics = await this.emailService.getEmailAnalytics(companyId, {
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        emailType: emailType as any,
        bulkEmailId: bulkEmailId as string,
        campaignId: campaignId as string,
      });

      successResponse(res, analytics, "Email analytics retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/retry
   */
  retryFailedEmails = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const { emailLogIds } = req.body;

      const result = await this.emailService.retryFailedEmails(
        companyId,
        emailLogIds
      );

      successResponse(res, result, "Failed emails retry initiated");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/track/:trackingPixelId
   */
  trackEmailEngagement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { trackingPixelId } = req.params;
      const {
        engagementType,
        userAgent,
        ipAddress,
        location,
        device,
        browser,
        os,
        linkUrl,
        linkText,
      } = req.body;

      const result = await this.emailService.trackEmailEngagement(
        trackingPixelId,
        engagementType,
        {
          userAgent,
          ipAddress,
          location,
          device,
          browser,
          os,
          linkUrl,
          linkText,
        }
      );

      // Check if this is an API call (JSON) or tracking pixel request
      const acceptHeader = req.headers.accept || "";
      const isApiCall = acceptHeader.includes("application/json");

      if (isApiCall) {
        // Return JSON response for API testing
        res.json({
          success: true,
          message: "Email engagement tracked successfully",
          data: {
            trackingPixelId,
            engagementType,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        // Return 1x1 transparent pixel for email tracking
        const pixel = Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          "base64"
        );

        res.set({
          "Content-Type": "image/png",
          "Content-Length": pixel.length,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        });

        res.send(pixel);
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/bounce
   */
  handleEmailBounce = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { emailLogId, bounceType, bounceReason, bounceCode } = req.body;

      await this.emailService.handleEmailBounce(
        emailLogId,
        bounceType,
        bounceReason,
        bounceCode
      );

      successResponse(res, {}, "Email bounce handled successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/unsubscribe/:unsubscribeToken
   */
  handleUnsubscribe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { unsubscribeToken } = req.params;
      const { reason } = req.body;

      const result = await this.emailService.handleUnsubscribe(
        unsubscribeToken,
        reason
      );

      successResponse(res, result, "Unsubscribe processed successfully");
    } catch (error) {
      next(error);
    }
  };

  // Email Template Methods

  /**
   * GET /api/v1/emails/templates
   */
  getEmailTemplates = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const {
        page = 1,
        limit = 10,
        search,
        templateType,
        language,
        isActive,
        isDefault,
      } = req.query;

      const result = await this.emailTemplateService.getEmailTemplates(
        companyId,
        {
          page: Number(page),
          limit: Number(limit),
          search: search as string,
          templateType: templateType as string,
          language: language as string,
          isActive: isActive ? isActive === "true" : undefined,
          isDefault: isDefault ? isDefault === "true" : undefined,
        }
      );

      successResponse(res, result, "Email templates retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/templates/:id
   */
  getEmailTemplate = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const template = await this.emailTemplateService.getEmailTemplate(
        id,
        companyId
      );

      successResponse(res, template, "Email template retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/templates
   */
  createEmailTemplate = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const createdBy = req.user!.id;
      const templateData = req.body;

      const template = await this.emailTemplateService.createEmailTemplate(
        companyId,
        createdBy,
        templateData
      );

      successResponse(res, template, "Email template created successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/emails/templates/:id
   */
  updateEmailTemplate = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const templateData = req.body;

      const template = await this.emailTemplateService.updateEmailTemplate(
        id,
        companyId,
        templateData
      );

      successResponse(res, template, "Email template updated successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/emails/templates/:id
   */
  deleteEmailTemplate = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const result = await this.emailTemplateService.deleteEmailTemplate(
        id,
        companyId
      );

      successResponse(res, result, "Email template deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/templates/:id/duplicate
   */
  duplicateEmailTemplate = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const createdBy = req.user!.id;
      const { newName } = req.body;

      // Add debug logging
      console.log(
        `[EmailController] Attempting to duplicate template: ${id} for company: ${companyId}`
      );

      const template = await this.emailTemplateService.duplicateEmailTemplate(
        id,
        companyId,
        newName,
        createdBy
      );

      successResponse(res, template, "Email template duplicated successfully");
    } catch (error) {
      // Enhanced error logging
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const { newName } = req.body;

      console.error(`[EmailController] Error duplicating template ${id}:`, {
        templateId: id,
        companyId,
        newName,
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };

  /**
   * PUT /api/v1/emails/templates/:id/default
   */
  setDefaultTemplate = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const template = await this.emailTemplateService.setDefaultTemplate(
        id,
        companyId
      );

      successResponse(res, template, "Default template set successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/templates/:id/preview
   */
  previewTemplate = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const personalizationData = req.body;

      const preview = await this.emailTemplateService.previewTemplate(
        id,
        companyId,
        personalizationData
      );

      successResponse(res, preview, "Template preview generated successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/templates/:id/stats
   */
  getTemplateStats = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const stats = await this.emailTemplateService.getTemplateUsageStats(
        id,
        companyId
      );

      successResponse(res, stats, "Template statistics retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/templates/types
   */
  getTemplateTypes = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const types = await this.emailTemplateService.getTemplateTypes();

      successResponse(res, types, "Template types retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/templates/tokens
   */
  getSupportedTokens = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tokens = this.emailTemplateService.getSupportedTokens();

      successResponse(res, tokens, "Supported tokens retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/templates/debug
   * Debug endpoint to list all templates with their IDs
   */
  debugTemplates = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const templates = await this.emailTemplateService.debugListTemplates(
        companyId
      );

      successResponse(
        res,
        templates,
        "Debug template list retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/templates/analytics
   */
  getTemplateAnalytics = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const { dateFrom, dateTo, templateType } = req.query;

      const analytics = await this.emailTemplateService.getTemplateAnalytics(
        companyId,
        {
          dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
          dateTo: dateTo ? new Date(dateTo as string) : undefined,
          templateType: templateType as string,
        }
      );

      successResponse(
        res,
        analytics,
        "Template analytics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // Follow-up Methods

  /**
   * GET /api/v1/emails/follow-up-rules
   */
  getFollowUpRules = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const { page = 1, limit = 10, isActive, search } = req.query;

      const result = await this.followUpService.getFollowUpRules(companyId, {
        page: Number(page),
        limit: Number(limit),
        isActive: isActive ? isActive === "true" : undefined,
        search: search as string,
      });

      successResponse(res, result, "Follow-up rules retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/follow-up-rules
   */
  createFollowUpRule = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const createdBy = req.user!.id;
      const ruleData = req.body;

      const rule = await this.followUpService.createFollowUpRule(
        companyId,
        createdBy,
        ruleData
      );

      successResponse(res, rule, "Follow-up rule created successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/emails/follow-up-rules/:id
   */
  updateFollowUpRule = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const ruleData = req.body;

      const rule = await this.followUpService.updateFollowUpRule(
        id,
        companyId,
        ruleData
      );

      successResponse(res, rule, "Follow-up rule updated successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/emails/follow-up-rules/:id
   */
  deleteFollowUpRule = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const result = await this.followUpService.deleteFollowUpRule(
        id,
        companyId
      );

      successResponse(res, result, "Follow-up rule deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/follow-up-rules/process
   */
  processScheduledFollowUps = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;

      const result = await this.followUpService.processScheduledFollowUps(
        companyId
      );

      successResponse(
        res,
        result,
        "Scheduled follow-ups processed successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/follow-up-rules/analytics
   */
  getFollowUpAnalytics = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const { dateFrom, dateTo, rfqId } = req.query;

      const analytics = await this.followUpService.getFollowUpAnalytics(
        companyId,
        {
          dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
          dateTo: dateTo ? new Date(dateTo as string) : undefined,
          rfqId: rfqId as string,
        }
      );

      successResponse(
        res,
        analytics,
        "Follow-up analytics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  // Campaign Methods

  /**
   * GET /api/v1/emails/campaigns
   */
  getEmailCampaigns = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const {
        page = 1,
        limit = 10,
        search,
        campaignType,
        status,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await this.emailCampaignService.getEmailCampaigns(
        companyId,
        {
          page: Number(page),
          limit: Number(limit),
          search: search as string,
          campaignType: campaignType as any,
          status: status as any,
          dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
          dateTo: dateTo ? new Date(dateTo as string) : undefined,
        }
      );

      successResponse(res, result, "Email campaigns retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/campaigns/:id
   */
  getEmailCampaign = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const campaign = await this.emailCampaignService.getEmailCampaign(
        id,
        companyId
      );

      successResponse(res, campaign, "Email campaign retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/campaigns
   */
  createEmailCampaign = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const createdBy = req.user!.id;
      const campaignData = req.body;

      const campaign = await this.emailCampaignService.createEmailCampaign(
        companyId,
        createdBy,
        campaignData
      );

      successResponse(res, campaign, "Email campaign created successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/emails/campaigns/:id
   */
  updateEmailCampaign = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const campaignData = req.body;

      const campaign = await this.emailCampaignService.updateEmailCampaign(
        id,
        companyId,
        campaignData
      );

      successResponse(res, campaign, "Email campaign updated successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/emails/campaigns/:id
   */
  deleteEmailCampaign = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const result = await this.emailCampaignService.deleteEmailCampaign(
        id,
        companyId
      );

      successResponse(res, result, "Email campaign deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/emails/campaigns/:id/start
   */
  startEmailCampaign = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const { target, emailContent, options } = req.body;

      const result = await this.emailCampaignService.startEmailCampaign(
        id,
        companyId,
        target,
        emailContent,
        options
      );

      successResponse(res, result, "Email campaign started successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/emails/campaigns/:id/pause
   */
  pauseEmailCampaign = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const campaign = await this.emailCampaignService.pauseEmailCampaign(
        id,
        companyId
      );

      successResponse(res, campaign, "Email campaign paused successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/emails/campaigns/:id/resume
   */
  resumeEmailCampaign = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const campaign = await this.emailCampaignService.resumeEmailCampaign(
        id,
        companyId
      );

      successResponse(res, campaign, "Email campaign resumed successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/emails/campaigns/:id/complete
   */
  completeEmailCampaign = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const campaign = await this.emailCampaignService.completeEmailCampaign(
        id,
        companyId
      );

      successResponse(res, campaign, "Email campaign completed successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/campaigns/:id/stats
   */
  getCampaignStats = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const stats = await this.emailCampaignService.getCampaignStats(
        id,
        companyId
      );

      successResponse(res, stats, "Campaign statistics retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/campaigns/analytics
   */
  getCampaignAnalytics = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const companyId = req.user!.companyId;
      const { dateFrom, dateTo, campaignType } = req.query;

      const analytics = await this.emailCampaignService.getCampaignAnalytics(
        companyId,
        {
          dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
          dateTo: dateTo ? new Date(dateTo as string) : undefined,
          campaignType: campaignType as any,
        }
      );

      successResponse(
        res,
        analytics,
        "Campaign analytics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/campaigns/types
   */
  getCampaignTypes = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const types = this.emailCampaignService.getCampaignTypes();

      successResponse(res, types, "Campaign types retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/emails/campaigns/statuses
   */
  getCampaignStatuses = async (
    req: CompanyRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const statuses = this.emailCampaignService.getCampaignStatuses();

      successResponse(
        res,
        statuses,
        "Campaign statuses retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  };
}
