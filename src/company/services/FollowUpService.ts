import { prisma } from "../../app";
import { ValidationError } from "../../utils/errors";
import { EmailService } from "./EmailService";
import { FollowUpStatus, EmailType, EmailPriority } from "@prisma/client";

export interface FollowUpRuleData {
  name: string;
  description?: string;
  daysAfterSend: number;
  onlyIfNotOpened?: boolean;
  onlyIfNotReplied?: boolean;
  maxFollowUps: number;
  emailTemplateId?: string;
  isActive?: boolean;

  // Enhanced conditional follow-up features
  onlyIfOpened?: boolean;
  onlyIfClicked?: boolean;
  onlyIfDelivered?: boolean;
  minTimeSinceOpen?: number; // hours
  maxTimeSinceOpen?: number; // hours

  // Advanced scheduling features
  scheduleType?: "IMMEDIATE" | "SPECIFIC_TIME" | "BUSINESS_HOURS" | "CUSTOM";
  specificTime?: string; // HH:MM format
  timezone?: string;
  businessDaysOnly?: boolean;
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;

  // Follow-up sequence configuration
  followUpIntervals?: number[]; // Array of days for each follow-up
  customSchedule?: any; // Custom scheduling rules
}

export interface FollowUpCondition {
  rfqId?: string;
  contactId?: string;
  shippingLineId?: string;
  daysSinceLastEmail?: number;
  hasBeenOpened?: boolean;
  hasReplied?: boolean;
  followUpSequence?: number;
}

export class FollowUpService {
  private emailService = new EmailService();

  /**
   * Create follow-up rule
   */
  async createFollowUpRule(
    companyId: string,
    createdBy: string,
    ruleData: FollowUpRuleData
  ) {
    // Validate email template exists if provided
    if (ruleData.emailTemplateId) {
      const template = await prisma.emailTemplate.findFirst({
        where: {
          id: ruleData.emailTemplateId,
          companyId,
          isActive: true,
        },
      });

      if (!template) {
        throw new ValidationError("Email template not found or inactive");
      }
    }

    const followUpRule = await prisma.followUpRule.create({
      data: {
        companyId,
        name: ruleData.name,
        description: ruleData.description,
        daysAfterSend: ruleData.daysAfterSend,
        onlyIfNotOpened: ruleData.onlyIfNotOpened || false,
        onlyIfNotReplied: ruleData.onlyIfNotReplied !== false, // default true
        maxFollowUps: ruleData.maxFollowUps,
        emailTemplateId: ruleData.emailTemplateId,
        isActive: ruleData.isActive !== false, // default true
        createdBy,
      },
    });

    return followUpRule;
  }

  /**
   * Update follow-up rule
   */
  async updateFollowUpRule(
    id: string,
    companyId: string,
    ruleData: Partial<FollowUpRuleData>
  ) {
    const existingRule = await prisma.followUpRule.findFirst({
      where: { id, companyId },
    });

    if (!existingRule) {
      throw new ValidationError("Follow-up rule not found");
    }

    // Validate email template if being updated
    if (ruleData.emailTemplateId) {
      const template = await prisma.emailTemplate.findFirst({
        where: {
          id: ruleData.emailTemplateId,
          companyId,
          isActive: true,
        },
      });

      if (!template) {
        throw new ValidationError("Email template not found or inactive");
      }
    }

    const updatedRule = await prisma.followUpRule.update({
      where: { id },
      data: {
        ...ruleData,
        updatedAt: new Date(),
      },
    });

    return updatedRule;
  }

  /**
   * Get follow-up rules
   */
  async getFollowUpRules(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, isActive, search } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId };
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [rules, total] = await Promise.all([
      prisma.followUpRule.findMany({
        where,
        skip,
        take: limit,
        include: {
          emailTemplate: {
            select: {
              id: true,
              name: true,
              subject: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              scheduledFollowUps: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.followUpRule.count({ where }),
    ]);

    return {
      rules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete follow-up rule
   */
  async deleteFollowUpRule(id: string, companyId: string) {
    const rule = await prisma.followUpRule.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            scheduledFollowUps: true,
          },
        },
      },
    });

    if (!rule) {
      throw new ValidationError("Follow-up rule not found");
    }

    if (rule._count.scheduledFollowUps > 0) {
      throw new ValidationError("Cannot delete rule with scheduled follow-ups");
    }

    await prisma.followUpRule.delete({
      where: { id },
    });

    return { message: "Follow-up rule deleted successfully" };
  }

  /**
   * Schedule follow-ups for RFQ
   */
  async scheduleFollowUpsForRFQ(
    rfqId: string,
    companyId: string,
    contactIds: string[]
  ) {
    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, companyId },
    });

    if (!rfq) {
      throw new ValidationError("RFQ not found");
    }

    // Get active follow-up rules for the company
    const followUpRules = await prisma.followUpRule.findMany({
      where: {
        companyId,
        isActive: true,
      },
      include: {
        emailTemplate: true,
      },
    });

    if (followUpRules.length === 0) {
      return { message: "No active follow-up rules found", scheduled: 0 };
    }

    const scheduledFollowUps = [];

    for (const contactId of contactIds) {
      for (const rule of followUpRules) {
        // Check if contact already has follow-ups for this RFQ
        const existingFollowUps = await prisma.scheduledFollowUp.count({
          where: {
            rfqId,
            contactId,
            followUpRuleId: rule.id,
          },
        });

        if (existingFollowUps >= rule.maxFollowUps) {
          continue; // Skip if max follow-ups reached
        }

        // Calculate scheduled time using enhanced scheduling
        const scheduledAt = this.calculateScheduledTime(
          new Date(),
          rule,
          existingFollowUps + 1
        );

        const scheduledFollowUp = await prisma.scheduledFollowUp.create({
          data: {
            rfqId,
            contactId,
            followUpRuleId: rule.id,
            scheduledAt,
            followUpSequence: existingFollowUps + 1,
            timezone: rule.timezone || "UTC",
            isBusinessHours: rule.scheduleType === "BUSINESS_HOURS",
          },
        });

        scheduledFollowUps.push(scheduledFollowUp);
      }
    }

    return {
      message: `Scheduled ${scheduledFollowUps.length} follow-ups`,
      scheduled: scheduledFollowUps.length,
    };
  }

  /**
   * Process scheduled follow-ups
   */
  async processScheduledFollowUps(companyId?: string) {
    const where: any = {
      status: FollowUpStatus.SCHEDULED,
      scheduledAt: { lte: new Date() },
    };

    if (companyId) {
      where.rfq = { companyId };
    }

    const scheduledFollowUps = await prisma.scheduledFollowUp.findMany({
      where,
      include: {
        rfq: true,
        contact: {
          include: {
            shippingLine: true,
          },
        },
        followUpRule: {
          include: {
            emailTemplate: true,
          },
        },
      },
    });

    const results = [];

    for (const scheduledFollowUp of scheduledFollowUps) {
      try {
        const shouldSend = await this.shouldSendFollowUp(scheduledFollowUp);

        if (!shouldSend) {
          await prisma.scheduledFollowUp.update({
            where: { id: scheduledFollowUp.id },
            data: {
              status: FollowUpStatus.SKIPPED,
              skipReason: "Conditions not met",
            },
          });
          continue;
        }

        // Send follow-up email
        await this.sendFollowUpEmail(scheduledFollowUp);

        // Update status
        await prisma.scheduledFollowUp.update({
          where: { id: scheduledFollowUp.id },
          data: {
            status: FollowUpStatus.SENT,
            sentAt: new Date(),
          },
        });

        results.push({
          id: scheduledFollowUp.id,
          status: "sent",
          contactEmail: scheduledFollowUp.contact.email,
        });
      } catch (error) {
        console.error(
          `Failed to process follow-up ${scheduledFollowUp.id}:`,
          error
        );

        await prisma.scheduledFollowUp.update({
          where: { id: scheduledFollowUp.id },
          data: {
            status: FollowUpStatus.FAILED,
            skipReason:
              error instanceof Error ? error.message : "Unknown error",
          },
        });

        results.push({
          id: scheduledFollowUp.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      message: `Processed ${scheduledFollowUps.length} follow-ups`,
      results,
    };
  }

  /**
   * Check if follow-up should be sent based on conditions
   */
  private async shouldSendFollowUp(scheduledFollowUp: any): Promise<boolean> {
    const { rfq, contact, followUpRule } = scheduledFollowUp;

    // Check if contact is still active and not marked as do not contact
    if (contact.doNotContact || !contact.isActive) {
      return false;
    }

    // Check if contact has replied
    if (followUpRule.onlyIfNotReplied) {
      const hasReplied = await prisma.quote.count({
        where: {
          rfqId: rfq.id,
          contactId: contact.id,
        },
      });

      if (hasReplied > 0) {
        return false;
      }
    }

    // Use enhanced conditional logic
    const conditionalResult = await this.checkConditionalFollowUp(
      scheduledFollowUp,
      followUpRule
    );

    if (!conditionalResult.shouldSend) {
      // Update skip reason if provided
      if (conditionalResult.reason) {
        await prisma.scheduledFollowUp.update({
          where: { id: scheduledFollowUp.id },
          data: {
            skipReason: conditionalResult.reason,
          },
        });
      }
      return false;
    }

    // Update condition met time if available
    if (conditionalResult.conditionMetAt) {
      await prisma.scheduledFollowUp.update({
        where: { id: scheduledFollowUp.id },
        data: {
          conditionMetAt: conditionalResult.conditionMetAt,
        },
      });
    }

    return true;
  }

  /**
   * Send follow-up email
   */
  private async sendFollowUpEmail(scheduledFollowUp: any) {
    const { rfq, contact, followUpRule } = scheduledFollowUp;

    let subject = `Follow-up: ${rfq.title}`;
    let bodyHtml = this.generateDefaultFollowUpBody(
      rfq,
      contact,
      scheduledFollowUp.followUpSequence
    );
    let bodyText = this.generateDefaultFollowUpBodyText(
      rfq,
      contact,
      scheduledFollowUp.followUpSequence
    );

    // Use template if available
    if (followUpRule.emailTemplate) {
      subject = this.personalizeTemplate(
        followUpRule.emailTemplate.subject,
        rfq,
        contact
      );
      bodyHtml = this.personalizeTemplate(
        followUpRule.emailTemplate.bodyHtml,
        rfq,
        contact
      );
      bodyText = followUpRule.emailTemplate.bodyText
        ? this.personalizeTemplate(
            followUpRule.emailTemplate.bodyText,
            rfq,
            contact
          )
        : bodyText;
    }

    // Send email
    await this.emailService.sendEmail(
      rfq.companyId,
      contact.email,
      "", // Will be set from company settings
      subject,
      bodyHtml,
      bodyText,
      {
        rfqId: rfq.id,
        contactId: contact.id,
        templateId: followUpRule.emailTemplateId,
        followUpRuleId: followUpRule.id,
        scheduledFollowUpId: scheduledFollowUp.id,
        emailType: EmailType.FOLLOW_UP,
        priority: EmailPriority.NORMAL,
        personalizationData: {
          contactName: `${contact.firstName} ${contact.lastName}`,
          companyName: contact.shippingLine.name,
          rfqNumber: rfq.rfqNumber,
          rfqTitle: rfq.title,
          originPort: rfq.originPort,
          destinationPort: rfq.destinationPort,
          commodity: rfq.commodity,
          containerType: rfq.containerType,
          containerQuantity: rfq.containerQuantity,
          cargoWeight: rfq.cargoWeight,
          cargoVolume: rfq.cargoVolume,
          incoterm: rfq.incoterm,
          cargoReadyDate: rfq.cargoReadyDate,
          quoteDeadline: rfq.quoteDeadline,
          specialRequirements: rfq.specialRequirements,
          requiredServices: rfq.requiredServices,
          preferredCarriers: rfq.preferredCarriers,
          estimatedValue: rfq.estimatedValue,
          currency: rfq.currency,
          tradeLane: rfq.tradeLane,
          shipmentUrgency: rfq.shipmentUrgency,
          priority: rfq.priority,
          notes: rfq.notes,
          tags: rfq.tags,
          followUpSequence: scheduledFollowUp.followUpSequence,
        },
      }
    );
  }

  /**
   * Generate default follow-up email body
   */
  private generateDefaultFollowUpBody(
    rfq: any,
    contact: any,
    sequence: number
  ): string {
    const urgencyText =
      sequence === 1
        ? "gentle reminder"
        : sequence === 2
        ? "follow-up"
        : "final follow-up";

    return `
      <html>
        <body>
          <p>Dear ${contact.firstName} ${contact.lastName},</p>
          
          <p>I hope this email finds you well. This is a ${urgencyText} regarding our RFQ ${
      rfq.rfqNumber
    } for the shipment from ${rfq.originPort} to ${rfq.destinationPort}.</p>
          
          <p><strong>RFQ Details:</strong></p>
          <ul>
            <li>RFQ Number: ${rfq.rfqNumber}</li>
            <li>Route: ${rfq.originPort} → ${rfq.destinationPort}</li>
            <li>Commodity: ${rfq.commodity || "N/A"}</li>
            <li>Container Type: ${rfq.containerType || "N/A"}</li>
            <li>Quantity: ${rfq.containerQuantity}</li>
            ${
              rfq.cargoWeight
                ? `<li>Cargo Weight: ${rfq.cargoWeight} kg</li>`
                : ""
            }
            ${
              rfq.cargoVolume
                ? `<li>Cargo Volume: ${rfq.cargoVolume} m³</li>`
                : ""
            }
            <li>Incoterm: ${rfq.incoterm}</li>
            ${
              rfq.cargoReadyDate
                ? `<li>Cargo Ready Date: ${new Date(
                    rfq.cargoReadyDate
                  ).toLocaleDateString()}</li>`
                : ""
            }
            ${
              rfq.quoteDeadline
                ? `<li>Quote Deadline: ${new Date(
                    rfq.quoteDeadline
                  ).toLocaleDateString()}</li>`
                : ""
            }
          </ul>
          
          ${
            rfq.specialRequirements
              ? `<p><strong>Special Requirements:</strong><br>${rfq.specialRequirements}</p>`
              : ""
          }
          
          <p>We would greatly appreciate your quote for this shipment. If you have any questions or need additional information, please don't hesitate to contact us.</p>
          
          <p>Thank you for your time and consideration.</p>
          
          <p>Best regards,<br>
          RFQ Team</p>
        </body>
      </html>
    `;
  }

  /**
   * Generate default follow-up email body (text version)
   */
  private generateDefaultFollowUpBodyText(
    rfq: any,
    contact: any,
    sequence: number
  ): string {
    const urgencyText =
      sequence === 1
        ? "gentle reminder"
        : sequence === 2
        ? "follow-up"
        : "final follow-up";

    return `
Dear ${contact.firstName} ${contact.lastName},

I hope this email finds you well. This is a ${urgencyText} regarding our RFQ ${
      rfq.rfqNumber
    } for the shipment from ${rfq.originPort} to ${rfq.destinationPort}.

RFQ Details:
- RFQ Number: ${rfq.rfqNumber}
- Route: ${rfq.originPort} → ${rfq.destinationPort}
- Commodity: ${rfq.commodity || "N/A"}
- Container Type: ${rfq.containerType || "N/A"}
- Quantity: ${rfq.containerQuantity}
${rfq.cargoWeight ? `- Cargo Weight: ${rfq.cargoWeight} kg` : ""}
${rfq.cargoVolume ? `- Cargo Volume: ${rfq.cargoVolume} m³` : ""}
- Incoterm: ${rfq.incoterm}
${
  rfq.cargoReadyDate
    ? `- Cargo Ready Date: ${new Date(rfq.cargoReadyDate).toLocaleDateString()}`
    : ""
}
${
  rfq.quoteDeadline
    ? `- Quote Deadline: ${new Date(rfq.quoteDeadline).toLocaleDateString()}`
    : ""
}

${
  rfq.specialRequirements
    ? `Special Requirements:\n${rfq.specialRequirements}\n`
    : ""
}

We would greatly appreciate your quote for this shipment. If you have any questions or need additional information, please don't hesitate to contact us.

Thank you for your time and consideration.

Best regards,
RFQ Team
    `.trim();
  }

  /**
   * Personalize template with data
   */
  private personalizeTemplate(
    template: string,
    rfq: any,
    contact: any
  ): string {
    const replacements: { [key: string]: string } = {
      "{{contactName}}": `${contact.firstName} ${contact.lastName}`,
      "{{contactFirstName}}": contact.firstName,
      "{{contactLastName}}": contact.lastName,
      "{{contactEmail}}": contact.email,
      "{{companyName}}": contact.shippingLine.name,
      "{{rfqNumber}}": rfq.rfqNumber,
      "{{rfqTitle}}": rfq.title,
      "{{originPort}}": rfq.originPort,
      "{{destinationPort}}": rfq.destinationPort,
      "{{commodity}}": rfq.commodity || "",
      "{{containerType}}": rfq.containerType || "",
      "{{containerQuantity}}": rfq.containerQuantity?.toString() || "",
      "{{cargoWeight}}": rfq.cargoWeight?.toString() || "",
      "{{cargoVolume}}": rfq.cargoVolume?.toString() || "",
      "{{incoterm}}": rfq.incoterm || "",
      "{{cargoReadyDate}}": rfq.cargoReadyDate
        ? new Date(rfq.cargoReadyDate).toLocaleDateString()
        : "",
      "{{quoteDeadline}}": rfq.quoteDeadline
        ? new Date(rfq.quoteDeadline).toLocaleDateString()
        : "",
      "{{specialRequirements}}": rfq.specialRequirements || "",
      "{{requiredServices}}": rfq.requiredServices?.join(", ") || "",
      "{{preferredCarriers}}": rfq.preferredCarriers?.join(", ") || "",
      "{{estimatedValue}}": rfq.estimatedValue?.toString() || "",
      "{{currency}}": rfq.currency || "",
      "{{tradeLane}}": rfq.tradeLane || "",
      "{{shipmentUrgency}}": rfq.shipmentUrgency || "",
      "{{priority}}": rfq.priority || "",
      "{{notes}}": rfq.notes || "",
      "{{tags}}": rfq.tags?.join(", ") || "",
    };

    let personalizedTemplate = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      personalizedTemplate = personalizedTemplate.replace(
        new RegExp(placeholder, "g"),
        value
      );
    }

    return personalizedTemplate;
  }

  /**
   * Get follow-up analytics
   */
  async getFollowUpAnalytics(
    companyId: string,
    options: {
      dateFrom?: Date;
      dateTo?: Date;
      rfqId?: string;
    } = {}
  ) {
    const where: any = {
      rfq: { companyId },
    };

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    if (options.rfqId) {
      where.rfqId = options.rfqId;
    }

    const [totalScheduled, totalSent, totalSkipped, totalFailed] =
      await Promise.all([
        prisma.scheduledFollowUp.count({ where }),
        prisma.scheduledFollowUp.count({
          where: { ...where, status: FollowUpStatus.SENT },
        }),
        prisma.scheduledFollowUp.count({
          where: { ...where, status: FollowUpStatus.SKIPPED },
        }),
        prisma.scheduledFollowUp.count({
          where: { ...where, status: FollowUpStatus.FAILED },
        }),
      ]);

    const successRate =
      totalScheduled > 0 ? (totalSent / totalScheduled) * 100 : 0;

    return {
      totalScheduled,
      totalSent,
      totalSkipped,
      totalFailed,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Cancel scheduled follow-ups
   */
  async cancelScheduledFollowUps(
    companyId: string,
    options: {
      rfqId?: string;
      contactId?: string;
      followUpRuleId?: string;
    }
  ) {
    const where: any = {
      status: FollowUpStatus.SCHEDULED,
      rfq: { companyId },
    };

    if (options.rfqId) where.rfqId = options.rfqId;
    if (options.contactId) where.contactId = options.contactId;
    if (options.followUpRuleId) where.followUpRuleId = options.followUpRuleId;

    const result = await prisma.scheduledFollowUp.updateMany({
      where,
      data: {
        status: FollowUpStatus.SKIPPED,
        skipReason: "Cancelled by user",
      },
    });

    return {
      message: `Cancelled ${result.count} scheduled follow-ups`,
      count: result.count,
    };
  }

  /**
   * Enhanced conditional follow-up logic
   */
  private async checkConditionalFollowUp(
    scheduledFollowUp: any,
    followUpRule: any
  ): Promise<{ shouldSend: boolean; reason?: string; conditionMetAt?: Date }> {
    const { rfq, contact } = scheduledFollowUp;

    // Check if email has been opened (onlyIfOpened condition)
    if (followUpRule.onlyIfOpened) {
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          rfqId: rfq.id,
          contactId: contact.id,
          openedAt: { not: null },
        },
        orderBy: { openedAt: "desc" },
      });

      if (!emailLog) {
        return { shouldSend: false, reason: "Email not opened yet" };
      }

      // Check time constraints if specified
      if (followUpRule.minTimeSinceOpen || followUpRule.maxTimeSinceOpen) {
        if (!emailLog.openedAt) {
          return {
            shouldSend: false,
            reason: "Email opened time not available",
          };
        }

        const hoursSinceOpen =
          (Date.now() - emailLog.openedAt.getTime()) / (1000 * 60 * 60);

        if (
          followUpRule.minTimeSinceOpen &&
          hoursSinceOpen < followUpRule.minTimeSinceOpen
        ) {
          return {
            shouldSend: false,
            reason: `Minimum time since open not met (${hoursSinceOpen.toFixed(
              1
            )}h < ${followUpRule.minTimeSinceOpen}h)`,
          };
        }

        if (
          followUpRule.maxTimeSinceOpen &&
          hoursSinceOpen > followUpRule.maxTimeSinceOpen
        ) {
          return {
            shouldSend: false,
            reason: `Maximum time since open exceeded (${hoursSinceOpen.toFixed(
              1
            )}h > ${followUpRule.maxTimeSinceOpen}h)`,
          };
        }
      }

      return {
        shouldSend: true,
        conditionMetAt: emailLog.openedAt || undefined,
      };
    }

    // Check if email has been clicked (onlyIfClicked condition)
    if (followUpRule.onlyIfClicked) {
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          rfqId: rfq.id,
          contactId: contact.id,
          clickedAt: { not: null },
        },
        orderBy: { clickedAt: "desc" },
      });

      if (!emailLog) {
        return { shouldSend: false, reason: "Email not clicked yet" };
      }

      return {
        shouldSend: true,
        conditionMetAt: emailLog.clickedAt || undefined,
      };
    }

    // Check if email has been delivered (onlyIfDelivered condition)
    if (followUpRule.onlyIfDelivered) {
      const emailLog = await prisma.emailLog.findFirst({
        where: {
          rfqId: rfq.id,
          contactId: contact.id,
          deliveredAt: { not: null },
        },
        orderBy: { deliveredAt: "desc" },
      });

      if (!emailLog) {
        return { shouldSend: false, reason: "Email not delivered yet" };
      }

      return {
        shouldSend: true,
        conditionMetAt: emailLog.deliveredAt || undefined,
      };
    }

    return { shouldSend: true };
  }

  /**
   * Calculate scheduled time based on rule configuration
   */
  private calculateScheduledTime(
    baseTime: Date,
    followUpRule: any,
    followUpSequence: number
  ): Date {
    let scheduledTime = new Date(baseTime);

    // Use custom intervals if provided
    if (
      followUpRule.followUpIntervals &&
      followUpRule.followUpIntervals.length > 0
    ) {
      const intervalIndex = Math.min(
        followUpSequence - 1,
        followUpRule.followUpIntervals.length - 1
      );
      const daysToAdd = followUpRule.followUpIntervals[intervalIndex];
      scheduledTime.setDate(scheduledTime.getDate() + daysToAdd);
    } else {
      // Use default daysAfterSend
      scheduledTime.setDate(
        scheduledTime.getDate() + followUpRule.daysAfterSend
      );
    }

    // Apply scheduling type
    switch (followUpRule.scheduleType) {
      case "SPECIFIC_TIME":
        if (followUpRule.specificTime) {
          const [hours, minutes] = followUpRule.specificTime
            .split(":")
            .map(Number);
          scheduledTime.setHours(hours, minutes, 0, 0);
        }
        break;

      case "BUSINESS_HOURS":
        scheduledTime = this.adjustToBusinessHours(scheduledTime, followUpRule);
        break;

      case "CUSTOM":
        if (followUpRule.customSchedule) {
          scheduledTime = this.applyCustomSchedule(
            scheduledTime,
            followUpRule.customSchedule
          );
        }
        break;
    }

    // Apply business rules
    if (followUpRule.businessDaysOnly || followUpRule.excludeWeekends) {
      scheduledTime = this.adjustToBusinessDays(scheduledTime);
    }

    return scheduledTime;
  }

  /**
   * Adjust time to business hours (9 AM - 5 PM)
   */
  private adjustToBusinessHours(date: Date, followUpRule: any): Date {
    const adjustedDate = new Date(date);
    const hour = adjustedDate.getHours();

    // If before 9 AM, move to 9 AM
    if (hour < 9) {
      adjustedDate.setHours(9, 0, 0, 0);
    }
    // If after 5 PM, move to next business day at 9 AM
    else if (hour >= 17) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      adjustedDate.setHours(9, 0, 0, 0);

      // Skip weekends if configured
      if (followUpRule.excludeWeekends) {
        while (adjustedDate.getDay() === 0 || adjustedDate.getDay() === 6) {
          adjustedDate.setDate(adjustedDate.getDate() + 1);
        }
      }
    }

    return adjustedDate;
  }

  /**
   * Adjust to business days (skip weekends)
   */
  private adjustToBusinessDays(date: Date): Date {
    const adjustedDate = new Date(date);

    while (adjustedDate.getDay() === 0 || adjustedDate.getDay() === 6) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
    }

    return adjustedDate;
  }

  /**
   * Apply custom scheduling rules
   */
  private applyCustomSchedule(date: Date, customSchedule: any): Date {
    const adjustedDate = new Date(date);

    // Example custom schedule logic
    if (customSchedule.timeOfDay) {
      const [hours, minutes] = customSchedule.timeOfDay.split(":").map(Number);
      adjustedDate.setHours(hours, minutes, 0, 0);
    }

    if (customSchedule.dayOfWeek) {
      const targetDay = customSchedule.dayOfWeek; // 0-6 (Sunday-Saturday)
      const currentDay = adjustedDate.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7;
      adjustedDate.setDate(adjustedDate.getDate() + daysToAdd);
    }

    return adjustedDate;
  }

  /**
   * Schedule conditional follow-ups based on email events
   */
  async scheduleConditionalFollowUps(
    rfqId: string,
    contactId: string,
    eventType: "opened" | "clicked" | "delivered",
    eventTime: Date
  ) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { company: true },
    });

    if (!rfq) {
      throw new ValidationError("RFQ not found");
    }

    // Find follow-up rules that match the event type
    const followUpRules = await prisma.followUpRule.findMany({
      where: {
        companyId: rfq.companyId,
        isActive: true,
        ...(eventType === "opened" && { onlyIfOpened: true }),
        ...(eventType === "clicked" && { onlyIfClicked: true }),
        ...(eventType === "delivered" && { onlyIfDelivered: true }),
      },
      include: {
        emailTemplate: true,
      },
    });

    const results = [];

    for (const rule of followUpRules) {
      // Check if we already have scheduled follow-ups for this RFQ/contact/rule
      const existingFollowUps = await prisma.scheduledFollowUp.count({
        where: {
          rfqId,
          contactId,
          followUpRuleId: rule.id,
        },
      });

      if (existingFollowUps >= rule.maxFollowUps) {
        continue;
      }

      // Calculate scheduled time
      const scheduledTime = this.calculateScheduledTime(
        eventTime,
        rule,
        existingFollowUps + 1
      );

      // Create scheduled follow-up
      const scheduledFollowUp = await prisma.scheduledFollowUp.create({
        data: {
          rfqId,
          contactId,
          followUpRuleId: rule.id,
          scheduledAt: scheduledTime,
          followUpSequence: existingFollowUps + 1,
          conditionMetAt: eventTime,
          conditionType: eventType,
          timezone: rule.timezone || "UTC",
          isBusinessHours: rule.scheduleType === "BUSINESS_HOURS",
        },
      });

      results.push({
        id: scheduledFollowUp.id,
        ruleName: rule.name,
        scheduledAt: scheduledTime,
        conditionType: eventType,
      });
    }

    return {
      message: `Scheduled ${results.length} conditional follow-ups`,
      results,
    };
  }

  /**
   * Reschedule follow-ups based on new conditions
   */
  async rescheduleFollowUps(
    companyId: string,
    options: {
      rfqId?: string;
      contactId?: string;
      followUpRuleId?: string;
      reason?: string;
    }
  ) {
    const where: any = {
      status: FollowUpStatus.SCHEDULED,
      rfq: { companyId },
    };

    if (options.rfqId) where.rfqId = options.rfqId;
    if (options.contactId) where.contactId = options.contactId;
    if (options.followUpRuleId) where.followUpRuleId = options.followUpRuleId;

    const scheduledFollowUps = await prisma.scheduledFollowUp.findMany({
      where,
      include: {
        followUpRule: true,
        rfq: true,
        contact: true,
      },
    });

    const results = [];

    for (const scheduledFollowUp of scheduledFollowUps) {
      // Recalculate scheduled time based on current conditions
      const newScheduledTime = this.calculateScheduledTime(
        new Date(),
        scheduledFollowUp.followUpRule,
        scheduledFollowUp.followUpSequence
      );

      await prisma.scheduledFollowUp.update({
        where: { id: scheduledFollowUp.id },
        data: {
          originalScheduledAt: scheduledFollowUp.scheduledAt,
          scheduledAt: newScheduledTime,
          rescheduledAt: new Date(),
          rescheduleReason: options.reason || "Conditional reschedule",
        },
      });

      results.push({
        id: scheduledFollowUp.id,
        originalScheduledAt: scheduledFollowUp.scheduledAt,
        newScheduledAt: newScheduledTime,
      });
    }

    return {
      message: `Rescheduled ${results.length} follow-ups`,
      results,
    };
  }
}
