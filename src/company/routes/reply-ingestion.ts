import express from 'express';
import { body, param, query } from 'express-validator';
import { ReplyIngestionController } from '../controllers/ReplyIngestionController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../utils/validators';

const router = express.Router();
const controller = new ReplyIngestionController();

// Email Reply Management Routes

/**
 * @route GET /api/v1/reply-ingestion/replies
 * @desc Get email replies for a company
 * @access Private
 */
router.get('/replies', 
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'REVIEWED']).withMessage('Invalid status'),
    query('requiresReview').optional().isBoolean().withMessage('Requires review must be a boolean'),
    query('rfqId').optional().isUUID().withMessage('RFQ ID must be a valid UUID'),
    query('contactId').optional().isUUID().withMessage('Contact ID must be a valid UUID')
  ],
  validateRequest,
  controller.getEmailReplies
);

/**
 * @route GET /api/v1/reply-ingestion/replies/:replyId
 * @desc Get email reply by ID
 * @access Private
 */
router.get('/replies/:replyId',
  authenticateToken,
  [
    param('replyId').isUUID().withMessage('Reply ID must be a valid UUID')
  ],
  validateRequest,
  controller.getEmailReply
);

/**
 * @route PUT /api/v1/reply-ingestion/replies/:replyId/review
 * @desc Update email reply review status
 * @access Private
 */
router.put('/replies/:replyId/review',
  authenticateToken,
  [
    param('replyId').isUUID().withMessage('Reply ID must be a valid UUID'),
    body('requiresReview').optional().isBoolean().withMessage('Requires review must be a boolean'),
    body('reviewNotes').optional().isString().withMessage('Review notes must be a string')
  ],
  validateRequest,
  controller.updateReviewStatus
);

/**
 * @route POST /api/v1/reply-ingestion/replies/:replyId/quote
 * @desc Create quote from email reply
 * @access Private
 */
router.post('/replies/:replyId/quote',
  authenticateToken,
  [
    param('replyId').isUUID().withMessage('Reply ID must be a valid UUID'),
    body('rfqId').isUUID().withMessage('RFQ ID must be a valid UUID'),
    body('contactId').isUUID().withMessage('Contact ID must be a valid UUID'),
    body('shippingLineId').isUUID().withMessage('Shipping line ID must be a valid UUID'),
    body('quoteData').isObject().withMessage('Quote data must be an object'),
    body('quoteData.oceanFreight').optional().isNumeric().withMessage('Ocean freight must be a number'),
    body('quoteData.currency').optional().isString().withMessage('Currency must be a string'),
    body('quoteData.totalAmount').isNumeric().withMessage('Total amount must be a number'),
    body('quoteData.validityDate').isISO8601().withMessage('Validity date must be a valid date')
  ],
  validateRequest,
  controller.createQuoteFromReply
);

/**
 * @route GET /api/v1/reply-ingestion/replies-requiring-review
 * @desc Get replies requiring review
 * @access Private
 */
router.get('/replies-requiring-review',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validateRequest,
  controller.getRepliesRequiringReview
);

/**
 * @route GET /api/v1/reply-ingestion/stats
 * @desc Get email reply statistics
 * @access Private
 */
router.get('/stats',
  authenticateToken,
  controller.getEmailReplyStats
);

/**
 * @route POST /api/v1/reply-ingestion/replies/:replyId/reprocess
 * @desc Reprocess email reply
 * @access Private
 */
router.post('/replies/:replyId/reprocess',
  authenticateToken,
  [
    param('replyId').isUUID().withMessage('Reply ID must be a valid UUID')
  ],
  validateRequest,
  controller.reprocessEmailReply
);

/**
 * @route DELETE /api/v1/reply-ingestion/replies/:replyId
 * @desc Delete email reply
 * @access Private
 */
router.delete('/replies/:replyId',
  authenticateToken,
  [
    param('replyId').isUUID().withMessage('Reply ID must be a valid UUID')
  ],
  validateRequest,
  controller.deleteEmailReply
);

// IMAP Configuration Management Routes

/**
 * @route GET /api/v1/reply-ingestion/imap-configs
 * @desc Get IMAP configurations
 * @access Private
 */
router.get('/imap-configs',
  authenticateToken,
  controller.getIMAPConfigs
);

/**
 * @route GET /api/v1/reply-ingestion/imap-configs/:configId
 * @desc Get IMAP configuration by ID
 * @access Private
 */
router.get('/imap-configs/:configId',
  authenticateToken,
  [
    param('configId').isUUID().withMessage('Config ID must be a valid UUID')
  ],
  validateRequest,
  controller.getIMAPConfig
);

/**
 * @route POST /api/v1/reply-ingestion/imap-configs
 * @desc Create IMAP configuration
 * @access Private
 */
router.post('/imap-configs',
  authenticateToken,
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('host').isString().notEmpty().withMessage('Host is required'),
    body('port').isInt({ min: 1, max: 65535 }).withMessage('Port must be between 1 and 65535'),
    body('secure').isBoolean().withMessage('Secure must be a boolean'),
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
    body('folder').optional().isString().withMessage('Folder must be a string'),
    body('checkInterval').optional().isInt({ min: 60 }).withMessage('Check interval must be at least 60 seconds'),
    body('maxEmailsPerCheck').optional().isInt({ min: 1, max: 1000 }).withMessage('Max emails per check must be between 1 and 1000')
  ],
  validateRequest,
  controller.createIMAPConfig
);

/**
 * @route PUT /api/v1/reply-ingestion/imap-configs/:configId
 * @desc Update IMAP configuration
 * @access Private
 */
router.put('/imap-configs/:configId',
  authenticateToken,
  [
    param('configId').isUUID().withMessage('Config ID must be a valid UUID'),
    body('name').optional().isString().notEmpty().withMessage('Name cannot be empty'),
    body('host').optional().isString().notEmpty().withMessage('Host cannot be empty'),
    body('port').optional().isInt({ min: 1, max: 65535 }).withMessage('Port must be between 1 and 65535'),
    body('secure').optional().isBoolean().withMessage('Secure must be a boolean'),
    body('username').optional().isString().notEmpty().withMessage('Username cannot be empty'),
    body('password').optional().isString().notEmpty().withMessage('Password cannot be empty'),
    body('folder').optional().isString().withMessage('Folder must be a string'),
    body('checkInterval').optional().isInt({ min: 60 }).withMessage('Check interval must be at least 60 seconds'),
    body('maxEmailsPerCheck').optional().isInt({ min: 1, max: 1000 }).withMessage('Max emails per check must be between 1 and 1000')
  ],
  validateRequest,
  controller.updateIMAPConfig
);

/**
 * @route DELETE /api/v1/reply-ingestion/imap-configs/:configId
 * @desc Delete IMAP configuration
 * @access Private
 */
router.delete('/imap-configs/:configId',
  authenticateToken,
  [
    param('configId').isUUID().withMessage('Config ID must be a valid UUID')
  ],
  validateRequest,
  controller.deleteIMAPConfig
);

/**
 * @route POST /api/v1/reply-ingestion/imap-configs/test-connection
 * @desc Test IMAP connection
 * @access Private
 */
router.post('/imap-configs/test-connection',
  authenticateToken,
  [
    body('host').isString().notEmpty().withMessage('Host is required'),
    body('port').isInt({ min: 1, max: 65535 }).withMessage('Port must be between 1 and 65535'),
    body('secure').isBoolean().withMessage('Secure must be a boolean'),
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
    body('folder').optional().isString().withMessage('Folder must be a string')
  ],
  validateRequest,
  controller.testIMAPConnection
);

/**
 * @route POST /api/v1/reply-ingestion/imap-configs/:configId/process
 * @desc Process emails for IMAP configuration
 * @access Private
 */
router.post('/imap-configs/:configId/process',
  authenticateToken,
  [
    param('configId').isUUID().withMessage('Config ID must be a valid UUID')
  ],
  validateRequest,
  controller.processIMAPEmails
);

// Webhook Management Routes

/**
 * @route GET /api/v1/reply-ingestion/webhook-configs
 * @desc Get webhook configurations
 * @access Private
 */
router.get('/webhook-configs',
  authenticateToken,
  controller.getWebhookConfigs
);

/**
 * @route POST /api/v1/reply-ingestion/webhook-configs
 * @desc Create webhook configuration
 * @access Private
 */
router.post('/webhook-configs',
  authenticateToken,
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('provider').isString().notEmpty().withMessage('Provider is required'),
    body('webhookUrl').isURL().withMessage('Webhook URL must be a valid URL'),
    body('secret').optional().isString().withMessage('Secret must be a string')
  ],
  validateRequest,
  controller.createWebhookConfig
);

/**
 * @route PUT /api/v1/reply-ingestion/webhook-configs/:webhookId
 * @desc Update webhook configuration
 * @access Private
 */
router.put('/webhook-configs/:webhookId',
  authenticateToken,
  [
    param('webhookId').isUUID().withMessage('Webhook ID must be a valid UUID'),
    body('name').optional().isString().notEmpty().withMessage('Name cannot be empty'),
    body('provider').optional().isString().notEmpty().withMessage('Provider cannot be empty'),
    body('webhookUrl').optional().isURL().withMessage('Webhook URL must be a valid URL'),
    body('secret').optional().isString().withMessage('Secret must be a string'),
    body('isActive').optional().isBoolean().withMessage('Is active must be a boolean')
  ],
  validateRequest,
  controller.updateWebhookConfig
);

/**
 * @route DELETE /api/v1/reply-ingestion/webhook-configs/:webhookId
 * @desc Delete webhook configuration
 * @access Private
 */
router.delete('/webhook-configs/:webhookId',
  authenticateToken,
  [
    param('webhookId').isUUID().withMessage('Webhook ID must be a valid UUID')
  ],
  validateRequest,
  controller.deleteWebhookConfig
);

/**
 * @route GET /api/v1/reply-ingestion/webhook-stats
 * @desc Get webhook statistics
 * @access Private
 */
router.get('/webhook-stats',
  authenticateToken,
  controller.getWebhookStats
);

/**
 * @route POST /api/v1/reply-ingestion/webhook-configs/:webhookId/test
 * @desc Test webhook endpoint
 * @access Private
 */
router.post('/webhook-configs/:webhookId/test',
  authenticateToken,
  [
    param('webhookId').isUUID().withMessage('Webhook ID must be a valid UUID')
  ],
  validateRequest,
  controller.testWebhookEndpoint
);

// AI Parsing Management Routes

/**
 * @route GET /api/v1/reply-ingestion/replies/:replyId/parsing-results
 * @desc Get parsing results for email reply
 * @access Private
 */
router.get('/replies/:replyId/parsing-results',
  authenticateToken,
  [
    param('replyId').isUUID().withMessage('Reply ID must be a valid UUID')
  ],
  validateRequest,
  controller.getParsingResults
);

/**
 * @route PUT /api/v1/reply-ingestion/parsing-results/:resultId/validate
 * @desc Validate parsing result
 * @access Private
 */
router.put('/parsing-results/:resultId/validate',
  authenticateToken,
  [
    param('resultId').isUUID().withMessage('Result ID must be a valid UUID'),
    body('validationStatus').isIn(['VALIDATED', 'REJECTED', 'FLAGGED']).withMessage('Invalid validation status'),
    body('validationNotes').optional().isString().withMessage('Validation notes must be a string')
  ],
  validateRequest,
  controller.validateParsingResult
);

/**
 * @route GET /api/v1/reply-ingestion/parsing-stats
 * @desc Get parsing statistics
 * @access Private
 */
router.get('/parsing-stats',
  authenticateToken,
  controller.getParsingStats
);

// Thread Matching Routes

/**
 * @route GET /api/v1/reply-ingestion/rfqs/:rfqId/thread-history
 * @desc Get thread history for RFQ
 * @access Private
 */
router.get('/rfqs/:rfqId/thread-history',
  authenticateToken,
  [
    param('rfqId').isUUID().withMessage('RFQ ID must be a valid UUID')
  ],
  validateRequest,
  controller.getThreadHistory
);

/**
 * @route GET /api/v1/reply-ingestion/unmatched-emails
 * @desc Get unmatched emails
 * @access Private
 */
router.get('/unmatched-emails',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validateRequest,
  controller.getUnmatchedEmails
);

/**
 * @route POST /api/v1/reply-ingestion/replies/:replyId/link-rfq
 * @desc Manually link email to RFQ
 * @access Private
 */
router.post('/replies/:replyId/link-rfq',
  authenticateToken,
  [
    param('replyId').isUUID().withMessage('Reply ID must be a valid UUID'),
    body('rfqId').isUUID().withMessage('RFQ ID must be a valid UUID')
  ],
  validateRequest,
  controller.linkEmailToRFQ
);

// Public Webhook Endpoint

/**
 * @route POST /api/v1/reply-ingestion/webhooks/:webhookId
 * @desc Handle incoming webhook (Public endpoint)
 * @access Public
 */
router.post('/webhooks/:webhookId',
  [
    param('webhookId').isUUID().withMessage('Webhook ID must be a valid UUID')
  ],
  validateRequest,
  controller.handleWebhook
);

export default router;

