import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export interface ThreadMatchResult {
  rfqId?: string;
  contactId?: string;
  shippingLineId?: string;
  confidence: number;
  matchType: 'MESSAGE_ID' | 'SUBJECT' | 'EMAIL_ADDRESS' | 'CONTENT' | 'NONE';
}

export class ThreadMatchingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Match email to RFQ using various strategies
   */
  async matchEmailToRFQ(emailReply: any): Promise<ThreadMatchResult | null> {
    try {
      logger.info(`Attempting to match email ${emailReply.messageId} to RFQ`);

      // Strategy 1: Match by Message-ID references
      const messageIdMatch = await this.matchByMessageId(emailReply);
      if (messageIdMatch && messageIdMatch.confidence > 0.8) {
        logger.info(`Matched by Message-ID with confidence ${messageIdMatch.confidence}`);
        return messageIdMatch;
      }

      // Strategy 2: Match by subject line patterns
      const subjectMatch = await this.matchBySubject(emailReply);
      if (subjectMatch && subjectMatch.confidence > 0.7) {
        logger.info(`Matched by subject with confidence ${subjectMatch.confidence}`);
        return subjectMatch;
      }

      // Strategy 3: Match by email address and recent RFQ activity
      const emailMatch = await this.matchByEmailAddress(emailReply);
      if (emailMatch && emailMatch.confidence > 0.6) {
        logger.info(`Matched by email address with confidence ${emailMatch.confidence}`);
        return emailMatch;
      }

      // Strategy 4: Match by content analysis
      const contentMatch = await this.matchByContent(emailReply);
      if (contentMatch && contentMatch.confidence > 0.5) {
        logger.info(`Matched by content with confidence ${contentMatch.confidence}`);
        return contentMatch;
      }

      logger.info(`No match found for email ${emailReply.messageId}`);
      return null;

    } catch (error) {
      logger.error(`Error matching email to RFQ:`, error);
      return null;
    }
  }

  /**
   * Match by Message-ID references (most reliable)
   */
  private async matchByMessageId(emailReply: any): Promise<ThreadMatchResult | null> {
    try {
      // Check if this email is a reply to one of our sent emails
      const sentEmail = await this.prisma.emailLog.findFirst({
        where: {
          companyId: emailReply.companyId,
          messageId: emailReply.inReplyTo
        },
        include: {
          rfq: true,
          contact: true
        }
      });

      if (sentEmail && sentEmail.rfq && sentEmail.contact) {
        return {
          rfqId: sentEmail.rfq.id,
          contactId: sentEmail.contact.id,
          shippingLineId: sentEmail.contact.shippingLineId,
          confidence: 0.95,
          matchType: 'MESSAGE_ID'
        };
      }

      // Check references array
      for (const reference of emailReply.references || []) {
        const referencedEmail = await this.prisma.emailLog.findFirst({
          where: {
            companyId: emailReply.companyId,
            messageId: reference
          },
          include: {
            rfq: true,
            contact: true
          }
        });

        if (referencedEmail && referencedEmail.rfq && referencedEmail.contact) {
          return {
            rfqId: referencedEmail.rfq.id,
            contactId: referencedEmail.contact.id,
            shippingLineId: referencedEmail.contact.shippingLineId,
            confidence: 0.9,
            matchType: 'MESSAGE_ID'
          };
        }
      }

      return null;
    } catch (error) {
      logger.error('Error in message ID matching:', error);
      return null;
    }
  }

  /**
   * Match by subject line patterns
   */
  private async matchBySubject(emailReply: any): Promise<ThreadMatchResult | null> {
    try {
      const subject = emailReply.subject.toLowerCase();
      
      // Look for RFQ number patterns
      const rfqNumberMatch = subject.match(/rfq[:\s]*([a-z0-9\-]+)/i);
      if (rfqNumberMatch) {
        const rfqNumber = rfqNumberMatch[1];
        
        const rfq = await this.prisma.rFQ.findFirst({
          where: {
            companyId: emailReply.companyId,
            rfqNumber: rfqNumber
          },
          include: {
            recipients: {
              include: {
                contact: true
              }
            }
          }
        });

        if (rfq) {
          // Find the contact that matches the sender email
          const matchingRecipient = rfq.recipients.find(r => 
            r.contact.email.toLowerCase() === emailReply.fromEmail.toLowerCase()
          );

          if (matchingRecipient) {
            return {
              rfqId: rfq.id,
              contactId: matchingRecipient.contact.id,
              shippingLineId: matchingRecipient.contact.shippingLineId,
              confidence: 0.85,
              matchType: 'SUBJECT'
            };
          }
        }
      }

      // Look for "Re:" patterns and try to match with recent RFQs
      if (subject.startsWith('re:')) {
        const baseSubject = subject.replace(/^re:\s*/i, '').trim();
        
        const recentRFQ = await this.prisma.rFQ.findFirst({
          where: {
            companyId: emailReply.companyId,
            emailSubject: {
              contains: baseSubject,
              mode: 'insensitive'
            },
            sentAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          include: {
            recipients: {
              include: {
                contact: true
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        });

        if (recentRFQ) {
          const matchingRecipient = recentRFQ.recipients.find(r => 
            r.contact.email.toLowerCase() === emailReply.fromEmail.toLowerCase()
          );

          if (matchingRecipient) {
            return {
              rfqId: recentRFQ.id,
              contactId: matchingRecipient.contact.id,
              shippingLineId: matchingRecipient.contact.shippingLineId,
              confidence: 0.75,
              matchType: 'SUBJECT'
            };
          }
        }
      }

      return null;
    } catch (error) {
      logger.error('Error in subject matching:', error);
      return null;
    }
  }

  /**
   * Match by email address and recent RFQ activity
   */
  private async matchByEmailAddress(emailReply: any): Promise<ThreadMatchResult | null> {
    try {
      // Find contact by email
      const contact = await this.prisma.contact.findFirst({
        where: {
          companyId: emailReply.companyId,
          email: emailReply.fromEmail
        }
      });

      if (!contact) {
        return null;
      }

      // Find recent RFQs sent to this contact
      const recentRFQ = await this.prisma.rFQ.findFirst({
        where: {
          companyId: emailReply.companyId,
          recipients: {
            some: {
              contactId: contact.id
            }
          },
          sentAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          recipients: {
            where: {
              contactId: contact.id
            }
          }
        },
        orderBy: { sentAt: 'desc' }
      });

      if (recentRFQ) {
        return {
          rfqId: recentRFQ.id,
          contactId: contact.id,
          shippingLineId: contact.shippingLineId,
          confidence: 0.65,
          matchType: 'EMAIL_ADDRESS'
        };
      }

      return null;
    } catch (error) {
      logger.error('Error in email address matching:', error);
      return null;
    }
  }

  /**
   * Match by content analysis
   */
  private async matchByContent(emailReply: any): Promise<ThreadMatchResult | null> {
    try {
      const content = (emailReply.bodyText || emailReply.bodyHtml || '').toLowerCase();
      
      // Look for port names, commodity types, or other RFQ-specific terms
      const portPatterns = [
        /from\s+([a-z\s]+)\s+to\s+([a-z\s]+)/i,
        /origin[:\s]*([a-z\s]+)/i,
        /destination[:\s]*([a-z\s]+)/i
      ];

      const commodityPatterns = [
        /commodity[:\s]*([a-z\s]+)/i,
        /cargo[:\s]*([a-z\s]+)/i,
        /goods[:\s]*([a-z\s]+)/i
      ];

      // Extract potential matching terms
      const extractedTerms: string[] = [];
      
      for (const pattern of portPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          extractedTerms.push(...matches.slice(1));
        }
      }

      for (const pattern of commodityPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          extractedTerms.push(...matches.slice(1));
        }
      }

      if (extractedTerms.length === 0) {
        return null;
      }

      // Find RFQs that match these terms
      const matchingRFQs = await this.prisma.rFQ.findMany({
        where: {
          companyId: emailReply.companyId,
          OR: [
            {
              originPort: {
                in: extractedTerms.map(term => term.trim())
              }
            },
            {
              destinationPort: {
                in: extractedTerms.map(term => term.trim())
              }
            },
            {
              commodity: {
                in: extractedTerms.map(term => term.trim())
              }
            }
          ],
          sentAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Last 14 days
          }
        },
        include: {
          recipients: {
            include: {
              contact: true
            }
          }
        },
        orderBy: { sentAt: 'desc' },
        take: 5
      });

      // Find the best match
      for (const rfq of matchingRFQs) {
        const matchingRecipient = rfq.recipients.find(r => 
          r.contact.email.toLowerCase() === emailReply.fromEmail.toLowerCase()
        );

        if (matchingRecipient) {
          return {
            rfqId: rfq.id,
            contactId: matchingRecipient.contact.id,
            shippingLineId: matchingRecipient.contact.shippingLineId,
            confidence: 0.55,
            matchType: 'CONTENT'
          };
        }
      }

      return null;
    } catch (error) {
      logger.error('Error in content matching:', error);
      return null;
    }
  }

  /**
   * Get thread history for an RFQ
   */
  async getThreadHistory(rfqId: string): Promise<{
    sentEmails: any[];
    receivedReplies: any[];
  }> {
    try {
      const [sentEmails, receivedReplies] = await Promise.all([
        this.prisma.emailLog.findMany({
          where: {
            rfqId: rfqId,
            status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED'] }
          },
          include: {
            contact: true
          },
          orderBy: { sentAt: 'asc' }
        }),
        this.prisma.emailReply.findMany({
          where: {
            rfqId: rfqId,
            status: { in: ['PROCESSED', 'REVIEWED'] }
          },
          include: {
            contact: true,
            parsingResults: true
          },
          orderBy: { receivedAt: 'asc' }
        })
      ]);

      return {
        sentEmails,
        receivedReplies
      };
    } catch (error) {
      logger.error('Error getting thread history:', error);
      return { sentEmails: [], receivedReplies: [] };
    }
  }

  /**
   * Get unmatched emails for a company
   */
  async getUnmatchedEmails(companyId: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    emails: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      this.prisma.emailReply.findMany({
        where: {
          companyId: companyId,
          rfqId: null,
          status: 'PROCESSED'
        },
        include: {
          parsingResults: true
        },
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.emailReply.count({
        where: {
          companyId: companyId,
          rfqId: null,
          status: 'PROCESSED'
        }
      })
    ]);

    return {
      emails,
      total,
      page,
      limit
    };
  }

  /**
   * Manually link email to RFQ
   */
  async linkEmailToRFQ(emailReplyId: string, rfqId: string): Promise<void> {
    try {
      const emailReply = await this.prisma.emailReply.findUnique({
        where: { id: emailReplyId },
        include: { contact: true }
      });

      if (!emailReply) {
        throw new Error('Email reply not found');
      }

      const rfq = await this.prisma.rFQ.findUnique({
        where: { id: rfqId },
        include: {
          recipients: {
            include: {
              contact: true
            }
          }
        }
      });

      if (!rfq) {
        throw new Error('RFQ not found');
      }

      // Find matching recipient
      const matchingRecipient = rfq.recipients.find(r => 
        r.contact.email.toLowerCase() === emailReply.fromEmail.toLowerCase()
      );

      if (!matchingRecipient) {
        throw new Error('Email sender does not match any RFQ recipients');
      }

      // Update email reply
      await this.prisma.emailReply.update({
        where: { id: emailReplyId },
        data: {
          rfqId: rfqId,
          contactId: matchingRecipient.contact.id,
          shippingLineId: matchingRecipient.contact.shippingLineId
        }
      });

      logger.info(`Successfully linked email ${emailReplyId} to RFQ ${rfqId}`);
    } catch (error) {
      logger.error('Error linking email to RFQ:', error);
      throw error;
    }
  }
}
