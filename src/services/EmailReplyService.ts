import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { ThreadMatchingService } from './ThreadMatchingService';
import { AIParsingService } from './AIParsingService';

export interface IncomingEmailData {
  companyId: string;
  messageId: string;
  inReplyTo?: string;
  references: string[];
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  receivedAt: Date;
  source: 'IMAP' | 'WEBHOOK' | 'MANUAL' | 'API';
  rawContent?: string;
  headers?: any;
  attachments?: Array<{
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    content: string; // Base64 encoded
  }>;
}

export interface EmailReplyWithRelations {
  id: string;
  messageId: string;
  inReplyTo?: string;
  references: string[];
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  receivedAt: Date;
  processedAt?: Date;
  status: string;
  source: string;
  rfqId?: string;
  contactId?: string;
  shippingLineId?: string;
  quoteId?: string;
  confidenceScore?: number | any;
  requiresReview: boolean;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  rfq?: any;
  contact?: any;
  shippingLine?: any;
  quote?: any;
  parsingResults?: any[];
  attachments?: any[];
}

export class EmailReplyService {
  private prisma: PrismaClient;
  private threadMatchingService: ThreadMatchingService;
  private aiParsingService: AIParsingService;

  constructor() {
    this.prisma = new PrismaClient();
    this.threadMatchingService = new ThreadMatchingService();
    this.aiParsingService = new AIParsingService();
  }

  /**
   * Process incoming email and store it in the database
   */
  async processIncomingEmail(emailData: IncomingEmailData): Promise<EmailReplyWithRelations> {
    try {
      logger.info(`Processing incoming email: ${emailData.messageId}`);

      // Check if email already exists
      const existingEmail = await this.prisma.emailReply.findUnique({
        where: { messageId: emailData.messageId }
      });

      if (existingEmail) {
        logger.warn(`Email ${emailData.messageId} already exists, skipping`);
        return existingEmail as EmailReplyWithRelations;
      }

      // Create email reply record
      const emailReply = await this.prisma.emailReply.create({
        data: {
          companyId: emailData.companyId,
          messageId: emailData.messageId,
          inReplyTo: emailData.inReplyTo,
          references: emailData.references,
          fromEmail: emailData.fromEmail,
          fromName: emailData.fromName,
          toEmail: emailData.toEmail,
          subject: emailData.subject,
          bodyHtml: emailData.bodyHtml,
          bodyText: emailData.bodyText,
          receivedAt: emailData.receivedAt,
          source: emailData.source,
          rawContent: emailData.rawContent,
          headers: emailData.headers || {}
        }
      });

      // Process attachments if any
      if (emailData.attachments && emailData.attachments.length > 0) {
        await this.processAttachments(emailReply.id, emailData.attachments);
      }

      // Update status to processing
      await this.prisma.emailReply.update({
        where: { id: emailReply.id },
        data: { status: 'PROCESSING' }
      });

      // Perform thread matching to link to RFQ
      const threadMatch = await this.threadMatchingService.matchEmailToRFQ(emailReply);
      
      if (threadMatch) {
        await this.prisma.emailReply.update({
          where: { id: emailReply.id },
          data: {
            rfqId: threadMatch.rfqId,
            contactId: threadMatch.contactId,
            shippingLineId: threadMatch.shippingLineId
          }
        });
      }

      // Perform AI parsing
      const parsingResults = await this.aiParsingService.parseEmailContent(emailReply);
      
      // Calculate overall confidence score
      const confidenceScore = this.calculateOverallConfidence(parsingResults);
      
      // Determine if manual review is required
      const requiresReview = confidenceScore < 0.7 || parsingResults.some(r => r.confidenceScore < 0.6);

      // Update email reply with processing results
      const updatedEmailReply = await this.prisma.emailReply.update({
        where: { id: emailReply.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
          confidenceScore: confidenceScore,
          requiresReview: requiresReview
        },
        include: {
          rfq: true,
          contact: true,
          shippingLine: true,
          quote: true,
          parsingResults: true,
          attachments: true
        }
      });

      logger.info(`Successfully processed email ${emailData.messageId} with confidence score ${confidenceScore}`);

      return updatedEmailReply as EmailReplyWithRelations;

    } catch (error) {
      logger.error(`Error processing email ${emailData.messageId}:`, error);
      
      // Update status to failed
      await this.prisma.emailReply.update({
        where: { messageId: emailData.messageId },
        data: { status: 'FAILED' }
      }).catch(() => {}); // Ignore errors if record doesn't exist

      throw error;
    }
  }

  /**
   * Process email attachments
   */
  private async processAttachments(emailReplyId: string, attachments: IncomingEmailData['attachments']): Promise<void> {
    for (const attachment of attachments || []) {
      await this.prisma.emailAttachment.create({
        data: {
          emailReplyId: emailReplyId,
          filename: attachment.filename,
          originalFilename: attachment.originalFilename,
          mimeType: attachment.mimeType,
          size: attachment.size,
          content: attachment.content,
          isProcessed: false
        }
      });
    }
  }

  /**
   * Calculate overall confidence score from parsing results
   */
  private calculateOverallConfidence(parsingResults: any[]): number {
    if (parsingResults.length === 0) {
      return 0;
    }

    const totalScore = parsingResults.reduce((sum, result) => sum + result.confidenceScore, 0);
    return totalScore / parsingResults.length;
  }

  /**
   * Get email replies for a company
   */
  async getEmailReplies(companyId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    requiresReview?: boolean;
    rfqId?: string;
    contactId?: string;
  } = {}): Promise<{
    replies: EmailReplyWithRelations[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (options.status) {
      where.status = options.status;
    }

    if (options.requiresReview !== undefined) {
      where.requiresReview = options.requiresReview;
    }

    if (options.rfqId) {
      where.rfqId = options.rfqId;
    }

    if (options.contactId) {
      where.contactId = options.contactId;
    }

    const [replies, total] = await Promise.all([
      this.prisma.emailReply.findMany({
        where,
        include: {
          rfq: true,
          contact: true,
          shippingLine: true,
          quote: true,
          parsingResults: true,
          attachments: true
        },
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.emailReply.count({ where })
    ]);

    return {
      replies: replies as EmailReplyWithRelations[],
      total,
      page,
      limit
    };
  }

  /**
   * Get email reply by ID
   */
  async getEmailReply(replyId: string): Promise<EmailReplyWithRelations | null> {
    const reply = await this.prisma.emailReply.findUnique({
      where: { id: replyId },
      include: {
        rfq: true,
        contact: true,
        shippingLine: true,
        quote: true,
        parsingResults: true,
        attachments: true
      }
    });

    return reply as EmailReplyWithRelations | null;
  }

  /**
   * Update email reply review status
   */
  async updateReviewStatus(replyId: string, data: {
    requiresReview?: boolean;
    reviewNotes?: string;
    reviewedBy: string;
  }): Promise<EmailReplyWithRelations> {
    const reply = await this.prisma.emailReply.update({
      where: { id: replyId },
      data: {
        requiresReview: data.requiresReview,
        reviewNotes: data.reviewNotes,
        reviewedBy: data.reviewedBy,
        reviewedAt: new Date()
      },
      include: {
        rfq: true,
        contact: true,
        shippingLine: true,
        quote: true,
        parsingResults: true,
        attachments: true
      }
    });

    return reply as EmailReplyWithRelations;
  }

  /**
   * Create quote from email reply
   */
  async createQuoteFromReply(replyId: string, data: {
    rfqId: string;
    contactId: string;
    shippingLineId: string;
    quoteData: any;
    createdBy: string;
  }): Promise<any> {
    const reply = await this.getEmailReply(replyId);
    
    if (!reply) {
      throw new Error('Email reply not found');
    }

    // Create quote
    const quote = await this.prisma.quote.create({
      data: {
        rfqId: data.rfqId,
        contactId: data.contactId,
        shippingLineId: data.shippingLineId,
        quoteReference: data.quoteData.quoteReference,
        oceanFreight: data.quoteData.oceanFreight,
        currency: data.quoteData.currency || 'USD',
        baf: data.quoteData.baf,
        caf: data.quoteData.caf,
        securityFee: data.quoteData.securityFee,
        documentationFee: data.quoteData.documentationFee,
        handlingCharges: data.quoteData.handlingCharges,
        otherCharges: data.quoteData.otherCharges,
        totalAmount: data.quoteData.totalAmount,
        validityDate: data.quoteData.validityDate,
        paymentTerms: data.quoteData.paymentTerms,
        transitTime: data.quoteData.transitTime,
        freeTimeAtOrigin: data.quoteData.freeTimeAtOrigin,
        freeTimeAtDestination: data.quoteData.freeTimeAtDestination,
        termsAndConditions: data.quoteData.termsAndConditions,
        specialNotes: data.quoteData.specialNotes,
        source: 'EMAIL',
        isParsedByAi: true,
        confidenceScore: reply.confidenceScore,
        rawEmailContent: reply.bodyText || reply.bodyHtml,
        createdBy: data.createdBy
      }
    });

    // Update email reply with quote ID
    await this.prisma.emailReply.update({
      where: { id: replyId },
      data: { quoteId: quote.id }
    });

    return quote;
  }

  /**
   * Get email replies requiring review
   */
  async getRepliesRequiringReview(companyId: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    replies: EmailReplyWithRelations[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.getEmailReplies(companyId, {
      ...options,
      requiresReview: true
    });
  }

  /**
   * Get email reply statistics
   */
  async getEmailReplyStats(companyId: string): Promise<{
    total: number;
    processed: number;
    pending: number;
    failed: number;
    requiringReview: number;
    averageConfidenceScore: number;
  }> {
    const [
      total,
      processed,
      pending,
      failed,
      requiringReview,
      avgConfidence
    ] = await Promise.all([
      this.prisma.emailReply.count({ where: { companyId } }),
      this.prisma.emailReply.count({ where: { companyId, status: 'PROCESSED' } }),
      this.prisma.emailReply.count({ where: { companyId, status: 'RECEIVED' } }),
      this.prisma.emailReply.count({ where: { companyId, status: 'FAILED' } }),
      this.prisma.emailReply.count({ where: { companyId, requiresReview: true } }),
      this.prisma.emailReply.aggregate({
        where: { companyId, confidenceScore: { not: null } },
        _avg: { confidenceScore: true }
      })
    ]);

    return {
      total,
      processed,
      pending,
      failed,
      requiringReview,
      averageConfidenceScore: Number(avgConfidence._avg.confidenceScore) || 0
    };
  }

  /**
   * Delete email reply
   */
  async deleteEmailReply(replyId: string): Promise<void> {
    await this.prisma.emailReply.delete({
      where: { id: replyId }
    });
  }

  /**
   * Reprocess email reply
   */
  async reprocessEmailReply(replyId: string): Promise<EmailReplyWithRelations> {
    const reply = await this.getEmailReply(replyId);
    
    if (!reply) {
      throw new Error('Email reply not found');
    }

    // Reset status
    await this.prisma.emailReply.update({
      where: { id: replyId },
      data: {
        status: 'PROCESSING',
        processedAt: null,
        confidenceScore: null,
        requiresReview: false
      }
    });

    // Clear existing parsing results
    await this.prisma.emailParsingResult.deleteMany({
      where: { emailReplyId: replyId }
    });

    // Reprocess
    const parsingResults = await this.aiParsingService.parseEmailContent(reply);
    const confidenceScore = this.calculateOverallConfidence(parsingResults);
    const requiresReview = confidenceScore < 0.7 || parsingResults.some(r => r.confidenceScore < 0.6);

    const updatedReply = await this.prisma.emailReply.update({
      where: { id: replyId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        confidenceScore: confidenceScore,
        requiresReview: requiresReview
      },
      include: {
        rfq: true,
        contact: true,
        shippingLine: true,
        quote: true,
        parsingResults: true,
        attachments: true
      }
    });

    return updatedReply as EmailReplyWithRelations;
  }
}
