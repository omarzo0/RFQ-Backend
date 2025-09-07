import { Request, Response, NextFunction } from 'express';
import { EmailReplyService } from '../services/EmailReplyService';
import { IMAPService } from '../services/IMAPService';
import { WebhookService } from '../services/WebhookService';
import { AIParsingService } from '../services/AIParsingService';
import { ThreadMatchingService } from '../services/ThreadMatchingService';
import logger from '../utils/logger';

export class ReplyIngestionController {
  private emailReplyService: EmailReplyService;
  private imapService: IMAPService;
  private webhookService: WebhookService;
  private aiParsingService: AIParsingService;
  private threadMatchingService: ThreadMatchingService;

  constructor() {
    this.emailReplyService = new EmailReplyService();
    this.imapService = new IMAPService();
    this.webhookService = new WebhookService();
    this.aiParsingService = new AIParsingService();
    this.threadMatchingService = new ThreadMatchingService();
  }

  /**
   * Get email replies for a company
   */
  getEmailReplies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const {
        page = 1,
        limit = 20,
        status,
        requiresReview,
        rfqId,
        contactId
      } = req.query;

      const result = await this.emailReplyService.getEmailReplies(companyId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        requiresReview: requiresReview === 'true',
        rfqId: rfqId as string,
        contactId: contactId as string
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error getting email replies:', error);
      next(error);
    }
  };

  /**
   * Get email reply by ID
   */
  getEmailReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replyId } = req.params;
      const reply = await this.emailReplyService.getEmailReply(replyId);

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Email reply not found'
        });
      }

      res.json({
        success: true,
        data: reply
      });
    } catch (error) {
      logger.error('Error getting email reply:', error);
      next(error);
    }
  };

  /**
   * Update email reply review status
   */
  updateReviewStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replyId } = req.params;
      const { requiresReview, reviewNotes } = req.body;
      const reviewedBy = req.user?.id;

      const reply = await this.emailReplyService.updateReviewStatus(replyId, {
        requiresReview,
        reviewNotes,
        reviewedBy
      });

      res.json({
        success: true,
        data: reply
      });
    } catch (error) {
      logger.error('Error updating review status:', error);
      next(error);
    }
  };

  /**
   * Create quote from email reply
   */
  createQuoteFromReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replyId } = req.params;
      const { rfqId, contactId, shippingLineId, quoteData } = req.body;
      const createdBy = req.user?.id;

      const quote = await this.emailReplyService.createQuoteFromReply(replyId, {
        rfqId,
        contactId,
        shippingLineId,
        quoteData,
        createdBy
      });

      res.json({
        success: true,
        data: quote
      });
    } catch (error) {
      logger.error('Error creating quote from reply:', error);
      next(error);
    }
  };

  /**
   * Get replies requiring review
   */
  getRepliesRequiringReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const { page = 1, limit = 20 } = req.query;

      const result = await this.emailReplyService.getRepliesRequiringReview(companyId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error getting replies requiring review:', error);
      next(error);
    }
  };

  /**
   * Get email reply statistics
   */
  getEmailReplyStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const stats = await this.emailReplyService.getEmailReplyStats(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting email reply stats:', error);
      next(error);
    }
  };

  /**
   * Reprocess email reply
   */
  reprocessEmailReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replyId } = req.params;
      const reply = await this.emailReplyService.reprocessEmailReply(replyId);

      res.json({
        success: true,
        data: reply
      });
    } catch (error) {
      logger.error('Error reprocessing email reply:', error);
      next(error);
    }
  };

  /**
   * Delete email reply
   */
  deleteEmailReply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replyId } = req.params;
      await this.emailReplyService.deleteEmailReply(replyId);

      res.json({
        success: true,
        message: 'Email reply deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting email reply:', error);
      next(error);
    }
  };

  // IMAP Configuration Management

  /**
   * Get IMAP configurations
   */
  getIMAPConfigs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const configs = await this.imapService.getIMAPConfigs(companyId);

      res.json({
        success: true,
        data: configs
      });
    } catch (error) {
      logger.error('Error getting IMAP configs:', error);
      next(error);
    }
  };

  /**
   * Get IMAP configuration by ID
   */
  getIMAPConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { configId } = req.params;
      const config = await this.imapService.getIMAPConfig(configId);

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'IMAP configuration not found'
        });
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error getting IMAP config:', error);
      next(error);
    }
  };

  /**
   * Create IMAP configuration
   */
  createIMAPConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const createdBy = req.user?.id;
      const {
        name,
        host,
        port,
        secure,
        username,
        password,
        folder,
        checkInterval,
        maxEmailsPerCheck
      } = req.body;

      const config = await this.imapService.createIMAPConfig({
        companyId,
        name,
        host,
        port,
        secure,
        username,
        password,
        folder,
        checkInterval,
        maxEmailsPerCheck,
        createdBy
      });

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error creating IMAP config:', error);
      next(error);
    }
  };

  /**
   * Update IMAP configuration
   */
  updateIMAPConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { configId } = req.params;
      const updateData = req.body;

      const config = await this.imapService.updateIMAPConfig(configId, updateData);

      if (!config) {
        return res.status(404).json({
          success: false,
          message: 'IMAP configuration not found'
        });
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error updating IMAP config:', error);
      next(error);
    }
  };

  /**
   * Delete IMAP configuration
   */
  deleteIMAPConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { configId } = req.params;
      await this.imapService.deleteIMAPConfig(configId);

      res.json({
        success: true,
        message: 'IMAP configuration deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting IMAP config:', error);
      next(error);
    }
  };

  /**
   * Test IMAP connection
   */
  testIMAPConnection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { host, port, secure, username, password, folder } = req.body;

      const isValid = await this.imapService.testConnection({
        host,
        port,
        secure,
        username,
        password,
        folder
      });

      res.json({
        success: true,
        data: { isValid }
      });
    } catch (error) {
      logger.error('Error testing IMAP connection:', error);
      next(error);
    }
  };

  /**
   * Process emails for IMAP configuration
   */
  processIMAPEmails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { configId } = req.params;
      await this.imapService.processEmailsForConfig(configId);

      res.json({
        success: true,
        message: 'IMAP emails processed successfully'
      });
    } catch (error) {
      logger.error('Error processing IMAP emails:', error);
      next(error);
    }
  };

  // Webhook Management

  /**
   * Get webhook configurations
   */
  getWebhookConfigs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const configs = await this.webhookService.getWebhookConfigs(companyId);

      res.json({
        success: true,
        data: configs
      });
    } catch (error) {
      logger.error('Error getting webhook configs:', error);
      next(error);
    }
  };

  /**
   * Create webhook configuration
   */
  createWebhookConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const createdBy = req.user?.id;
      const { name, provider, webhookUrl, secret } = req.body;

      const config = await this.webhookService.createWebhookConfig({
        companyId,
        name,
        provider,
        webhookUrl,
        secret,
        createdBy
      });

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error creating webhook config:', error);
      next(error);
    }
  };

  /**
   * Update webhook configuration
   */
  updateWebhookConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { webhookId } = req.params;
      const updateData = req.body;

      const config = await this.webhookService.updateWebhookConfig(webhookId, updateData);

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      logger.error('Error updating webhook config:', error);
      next(error);
    }
  };

  /**
   * Delete webhook configuration
   */
  deleteWebhookConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { webhookId } = req.params;
      await this.webhookService.deleteWebhookConfig(webhookId);

      res.json({
        success: true,
        message: 'Webhook configuration deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting webhook config:', error);
      next(error);
    }
  };

  /**
   * Get webhook statistics
   */
  getWebhookStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const stats = await this.webhookService.getWebhookStats(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting webhook stats:', error);
      next(error);
    }
  };

  /**
   * Test webhook endpoint
   */
  testWebhookEndpoint = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { webhookId } = req.params;
      const isValid = await this.webhookService.testWebhookEndpoint(webhookId);

      res.json({
        success: true,
        data: { isValid }
      });
    } catch (error) {
      logger.error('Error testing webhook endpoint:', error);
      next(error);
    }
  };

  // AI Parsing Management

  /**
   * Get parsing results for email reply
   */
  getParsingResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replyId } = req.params;
      const results = await this.aiParsingService.getParsingResults(replyId);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Error getting parsing results:', error);
      next(error);
    }
  };

  /**
   * Validate parsing result
   */
  validateParsingResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resultId } = req.params;
      const { validationStatus, validationNotes } = req.body;
      const validatedBy = req.user?.id;

      await this.aiParsingService.validateParsingResult(resultId, {
        validationStatus,
        validationNotes,
        validatedBy
      });

      res.json({
        success: true,
        message: 'Parsing result validated successfully'
      });
    } catch (error) {
      logger.error('Error validating parsing result:', error);
      next(error);
    }
  };

  /**
   * Get parsing statistics
   */
  getParsingStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const stats = await this.aiParsingService.getParsingStats(companyId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting parsing stats:', error);
      next(error);
    }
  };

  // Thread Matching

  /**
   * Get thread history for RFQ
   */
  getThreadHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rfqId } = req.params;
      const history = await this.threadMatchingService.getThreadHistory(rfqId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error getting thread history:', error);
      next(error);
    }
  };

  /**
   * Get unmatched emails
   */
  getUnmatchedEmails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user?.companyId;
      const { page = 1, limit = 20 } = req.query;

      const result = await this.threadMatchingService.getUnmatchedEmails(companyId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error getting unmatched emails:', error);
      next(error);
    }
  };

  /**
   * Manually link email to RFQ
   */
  linkEmailToRFQ = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replyId } = req.params;
      const { rfqId } = req.body;

      await this.threadMatchingService.linkEmailToRFQ(replyId, rfqId);

      res.json({
        success: true,
        message: 'Email linked to RFQ successfully'
      });
    } catch (error) {
      logger.error('Error linking email to RFQ:', error);
      next(error);
    }
  };

  // Webhook Endpoint (Public)

  /**
   * Handle incoming webhook
   */
  handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { webhookId } = req.params;
      const payload = req.body;

      await this.webhookService.processWebhook(webhookId, payload);

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      logger.error('Error handling webhook:', error);
      next(error);
    }
  };
}
