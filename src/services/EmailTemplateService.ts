import { prisma } from "../app";
import { ValidationError } from "../utils/errors";

export interface EmailTemplateData {
  name: string;
  templateType: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  supportedTokens: string[];
  language?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface TemplatePersonalizationData {
  contactName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  companyName?: string;
  rfqNumber?: string;
  rfqTitle?: string;
  originPort?: string;
  destinationPort?: string;
  commodity?: string;
  containerType?: string;
  containerQuantity?: number;
  cargoWeight?: number;
  cargoVolume?: number;
  incoterm?: string;
  cargoReadyDate?: string;
  quoteDeadline?: string;
  specialRequirements?: string;
  requiredServices?: string[];
  preferredCarriers?: string[];
  estimatedValue?: number;
  currency?: string;
  tradeLane?: string;
  shipmentUrgency?: string;
  priority?: string;
  notes?: string;
  tags?: string[];
  followUpSequence?: number;
  [key: string]: any;
}

export class EmailTemplateService {
  /**
   * Create email template
   */
  async createEmailTemplate(
    companyId: string,
    createdBy: string,
    templateData: EmailTemplateData
  ) {
    // Check if template with same name already exists
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: {
        companyId,
        name: templateData.name,
      },
    });

    if (existingTemplate) {
      throw new ValidationError("Template with this name already exists");
    }

    // If this is set as default, unset other defaults
    if (templateData.isDefault) {
      await prisma.emailTemplate.updateMany({
        where: {
          companyId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        companyId,
        name: templateData.name,
        templateType: templateData.templateType,
        subject: templateData.subject,
        bodyHtml: templateData.bodyHtml,
        bodyText: templateData.bodyText,
        supportedTokens: templateData.supportedTokens,
        language: templateData.language || "en",
        isDefault: templateData.isDefault || false,
        isActive: templateData.isActive !== false, // default true
        createdBy,
      },
    });

    return template;
  }

  /**
   * Update email template
   */
  async updateEmailTemplate(
    id: string,
    companyId: string,
    templateData: Partial<EmailTemplateData>
  ) {
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: { id, companyId },
    });

    if (!existingTemplate) {
      throw new ValidationError("Email template not found");
    }

    // Check if template with same name already exists (excluding current one)
    if (templateData.name && templateData.name !== existingTemplate.name) {
      const duplicateTemplate = await prisma.emailTemplate.findFirst({
        where: {
          companyId,
          name: templateData.name,
          id: { not: id },
        },
      });

      if (duplicateTemplate) {
        throw new ValidationError("Template with this name already exists");
      }
    }

    // If this is set as default, unset other defaults
    if (templateData.isDefault) {
      await prisma.emailTemplate.updateMany({
        where: {
          companyId,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...templateData,
        updatedAt: new Date(),
      },
    });

    return updatedTemplate;
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      templateType?: string;
      language?: string;
      isActive?: boolean;
      isDefault?: boolean;
    } = {}
  ) {
    const {
      page = 1,
      limit = 10,
      search,
      templateType,
      language,
      isActive,
      isDefault,
    } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { bodyHtml: { contains: search, mode: "insensitive" } },
      ];
    }

    if (templateType) where.templateType = templateType;
    if (language) where.language = language;
    if (isActive !== undefined) where.isActive = isActive;
    if (isDefault !== undefined) where.isDefault = isDefault;

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              emailLogs: true,
              followUpRules: true,
              bulkEmails: true,
            },
          },
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
      prisma.emailTemplate.count({ where }),
    ]);

    return {
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get email template by ID
   */
  async getEmailTemplate(id: string, companyId: string) {
    const template = await prisma.emailTemplate.findFirst({
      where: { id, companyId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            emailLogs: true,
            followUpRules: true,
            bulkEmails: true,
          },
        },
      },
    });

    if (!template) {
      throw new ValidationError("Email template not found");
    }

    return template;
  }

  /**
   * Delete email template
   */
  async deleteEmailTemplate(id: string, companyId: string) {
    const template = await prisma.emailTemplate.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            emailLogs: true,
            followUpRules: true,
            bulkEmails: true,
          },
        },
      },
    });

    if (!template) {
      throw new ValidationError("Email template not found");
    }

    if (
      template._count.emailLogs > 0 ||
      template._count.followUpRules > 0 ||
      template._count.bulkEmails > 0
    ) {
      throw new ValidationError("Cannot delete template that is being used");
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    return { message: "Email template deleted successfully" };
  }

  /**
   * Duplicate email template
   */
  async duplicateEmailTemplate(
    id: string,
    companyId: string,
    newName: string,
    createdBy: string
  ) {
    const originalTemplate = await prisma.emailTemplate.findFirst({
      where: { id, companyId },
    });

    if (!originalTemplate) {
      throw new ValidationError("Email template not found");
    }

    // Check if template with new name already exists
    const existingTemplate = await prisma.emailTemplate.findFirst({
      where: {
        companyId,
        name: newName,
      },
    });

    if (existingTemplate) {
      throw new ValidationError("Template with this name already exists");
    }

    const duplicatedTemplate = await prisma.emailTemplate.create({
      data: {
        companyId,
        name: newName,
        templateType: originalTemplate.templateType,
        subject: originalTemplate.subject,
        bodyHtml: originalTemplate.bodyHtml,
        bodyText: originalTemplate.bodyText,
        supportedTokens: originalTemplate.supportedTokens,
        language: originalTemplate.language,
        isDefault: false, // Duplicated templates are not default
        isActive: originalTemplate.isActive,
        createdBy,
      },
    });

    return duplicatedTemplate;
  }

  /**
   * Set template as default
   */
  async setDefaultTemplate(id: string, companyId: string) {
    const template = await prisma.emailTemplate.findFirst({
      where: { id, companyId },
    });

    if (!template) {
      throw new ValidationError("Email template not found");
    }

    // Unset other defaults
    await prisma.emailTemplate.updateMany({
      where: {
        companyId,
        isDefault: true,
        id: { not: id },
      },
      data: {
        isDefault: false,
      },
    });

    // Set this template as default
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: {
        isDefault: true,
      },
    });

    return updatedTemplate;
  }

  /**
   * Personalize template with data
   */
  personalizeTemplate(
    template: string,
    data: TemplatePersonalizationData
  ): string {
    const replacements: { [key: string]: string } = {
      "{{contactName}}": data.contactName || "",
      "{{contactFirstName}}": data.contactFirstName || "",
      "{{contactLastName}}": data.contactLastName || "",
      "{{contactEmail}}": data.contactEmail || "",
      "{{companyName}}": data.companyName || "",
      "{{rfqNumber}}": data.rfqNumber || "",
      "{{rfqTitle}}": data.rfqTitle || "",
      "{{originPort}}": data.originPort || "",
      "{{destinationPort}}": data.destinationPort || "",
      "{{commodity}}": data.commodity || "",
      "{{containerType}}": data.containerType || "",
      "{{containerQuantity}}": data.containerQuantity?.toString() || "",
      "{{cargoWeight}}": data.cargoWeight?.toString() || "",
      "{{cargoVolume}}": data.cargoVolume?.toString() || "",
      "{{incoterm}}": data.incoterm || "",
      "{{cargoReadyDate}}": data.cargoReadyDate
        ? new Date(data.cargoReadyDate).toLocaleDateString()
        : "",
      "{{quoteDeadline}}": data.quoteDeadline
        ? new Date(data.quoteDeadline).toLocaleDateString()
        : "",
      "{{specialRequirements}}": data.specialRequirements || "",
      "{{requiredServices}}": data.requiredServices?.join(", ") || "",
      "{{preferredCarriers}}": data.preferredCarriers?.join(", ") || "",
      "{{estimatedValue}}": data.estimatedValue?.toString() || "",
      "{{currency}}": data.currency || "",
      "{{tradeLane}}": data.tradeLane || "",
      "{{shipmentUrgency}}": data.shipmentUrgency || "",
      "{{priority}}": data.priority || "",
      "{{notes}}": data.notes || "",
      "{{tags}}": data.tags?.join(", ") || "",
      "{{followUpSequence}}": data.followUpSequence?.toString() || "",
    };

    // Add custom data replacements
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string" || typeof value === "number") {
        replacements[`{{${key}}}`] = value.toString();
      }
    }

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
   * Preview personalized template
   */
  async previewTemplate(
    id: string,
    companyId: string,
    data: TemplatePersonalizationData
  ) {
    const template = await prisma.emailTemplate.findFirst({
      where: { id, companyId },
    });

    if (!template) {
      throw new ValidationError("Email template not found");
    }

    const personalizedSubject = this.personalizeTemplate(
      template.subject,
      data
    );
    const personalizedBodyHtml = this.personalizeTemplate(
      template.bodyHtml,
      data
    );
    const personalizedBodyText = template.bodyText
      ? this.personalizeTemplate(template.bodyText, data)
      : null;

    return {
      subject: personalizedSubject,
      bodyHtml: personalizedBodyHtml,
      bodyText: personalizedBodyText,
    };
  }

  /**
   * Get template usage statistics
   */
  async getTemplateUsageStats(id: string, companyId: string) {
    const template = await prisma.emailTemplate.findFirst({
      where: { id, companyId },
    });

    if (!template) {
      throw new ValidationError("Email template not found");
    }

    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      failedEmails,
    ] = await Promise.all([
      prisma.emailLog.count({
        where: { templateId: id, companyId },
      }),
      prisma.emailLog.count({
        where: { templateId: id, companyId, status: "SENT" },
      }),
      prisma.emailLog.count({
        where: { templateId: id, companyId, status: "DELIVERED" },
      }),
      prisma.emailLog.count({
        where: { templateId: id, companyId, status: "OPENED" },
      }),
      prisma.emailLog.count({
        where: { templateId: id, companyId, status: "CLICKED" },
      }),
      prisma.emailLog.count({
        where: { templateId: id, companyId, status: "BOUNCED" },
      }),
      prisma.emailLog.count({
        where: { templateId: id, companyId, status: "FAILED" },
      }),
    ]);

    const deliveryRate =
      sentEmails > 0 ? (deliveredEmails / sentEmails) * 100 : 0;
    const openRate =
      deliveredEmails > 0 ? (openedEmails / deliveredEmails) * 100 : 0;
    const clickRate =
      deliveredEmails > 0 ? (clickedEmails / deliveredEmails) * 100 : 0;
    const bounceRate = sentEmails > 0 ? (bouncedEmails / sentEmails) * 100 : 0;

    return {
      totalEmails,
      sentEmails,
      deliveredEmails,
      openedEmails,
      clickedEmails,
      bouncedEmails,
      failedEmails,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      openRate: Math.round(openRate * 100) / 100,
      clickRate: Math.round(clickRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
    };
  }

  /**
   * Get available template types
   */
  async getTemplateTypes() {
    return [
      { value: "rfq", label: "RFQ Email" },
      { value: "follow_up", label: "Follow-up Email" },
      { value: "bulk_email", label: "Bulk Email" },
      { value: "campaign", label: "Campaign Email" },
      { value: "notification", label: "Notification" },
      { value: "system", label: "System Email" },
    ];
  }

  /**
   * Get supported tokens
   */
  getSupportedTokens(): { token: string; description: string }[] {
    return [
      { token: "{{contactName}}", description: "Full contact name" },
      { token: "{{contactFirstName}}", description: "Contact first name" },
      { token: "{{contactLastName}}", description: "Contact last name" },
      { token: "{{contactEmail}}", description: "Contact email address" },
      { token: "{{companyName}}", description: "Shipping line company name" },
      { token: "{{rfqNumber}}", description: "RFQ number" },
      { token: "{{rfqTitle}}", description: "RFQ title" },
      { token: "{{originPort}}", description: "Origin port" },
      { token: "{{destinationPort}}", description: "Destination port" },
      { token: "{{commodity}}", description: "Commodity type" },
      { token: "{{containerType}}", description: "Container type" },
      { token: "{{containerQuantity}}", description: "Number of containers" },
      { token: "{{cargoWeight}}", description: "Cargo weight" },
      { token: "{{cargoVolume}}", description: "Cargo volume" },
      { token: "{{incoterm}}", description: "Incoterm" },
      { token: "{{cargoReadyDate}}", description: "Cargo ready date" },
      { token: "{{quoteDeadline}}", description: "Quote deadline" },
      { token: "{{specialRequirements}}", description: "Special requirements" },
      { token: "{{requiredServices}}", description: "Required services" },
      { token: "{{preferredCarriers}}", description: "Preferred carriers" },
      { token: "{{estimatedValue}}", description: "Estimated value" },
      { token: "{{currency}}", description: "Currency" },
      { token: "{{tradeLane}}", description: "Trade lane" },
      { token: "{{shipmentUrgency}}", description: "Shipment urgency" },
      { token: "{{priority}}", description: "Priority level" },
      { token: "{{notes}}", description: "Notes" },
      { token: "{{tags}}", description: "Tags" },
      {
        token: "{{followUpSequence}}",
        description: "Follow-up sequence number",
      },
    ];
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(
    companyId: string,
    options: {
      dateFrom?: Date;
      dateTo?: Date;
      templateType?: string;
    } = {}
  ) {
    const where: any = { companyId };

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    if (options.templateType) where.templateType = options.templateType;

    const templates = await prisma.emailTemplate.findMany({
      where,
      include: {
        _count: {
          select: {
            emailLogs: true,
            followUpRules: true,
            bulkEmails: true,
          },
        },
      },
    });

    const analytics = templates.map((template) => ({
      id: template.id,
      name: template.name,
      templateType: template.templateType,
      usageCount: template._count.emailLogs,
      followUpRulesCount: template._count.followUpRules,
      bulkEmailsCount: template._count.bulkEmails,
      isDefault: template.isDefault,
      isActive: template.isActive,
      createdAt: template.createdAt,
    }));

    return analytics.sort((a, b) => b.usageCount - a.usageCount);
  }
}

