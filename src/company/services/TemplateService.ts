import { prisma } from "../../app";
import { ValidationError } from "../../utils/errors";

export class TemplateService {
  /**
   * Get templates with pagination and filtering
   */
  async getTemplates(
    companyId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      category?: string;
      tradeLane?: string;
      language?: string;
      isPublic?: boolean;
      isActive?: boolean;
      tags?: string[];
      createdBy?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ) {
    const {
      page,
      limit,
      search,
      category,
      tradeLane,
      language,
      isPublic,
      isActive,
      tags,
      createdBy,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    // Category filtering
    if (category) {
      where.category = category;
    }

    // Trade lane filtering
    if (tradeLane) {
      where.tradeLane = tradeLane;
    }

    // Language filtering
    if (language) {
      where.language = language;
    }

    // Public/Private filtering
    if (isPublic !== undefined) {
      where.isPublic = isPublic;
    }

    // Active/Inactive filtering
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Created by filtering
    if (createdBy) {
      where.createdBy = createdBy;
    }

    // Search filtering
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { subjectTemplate: { contains: search, mode: "insensitive" } },
        { bodyTemplate: { contains: search, mode: "insensitive" } },
        { originPort: { contains: search, mode: "insensitive" } },
        { destinationPort: { contains: search, mode: "insensitive" } },
        { commodity: { contains: search, mode: "insensitive" } },
      ];
    }

    // Tag filtering
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // Sort options
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [templates, total] = await Promise.all([
      prisma.rFQTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          subjectTemplate: true,
          bodyTemplate: true,
          originPort: true,
          destinationPort: true,
          commodity: true,
          containerType: true,
          containerQuantity: true,
          cargoWeight: true,
          cargoVolume: true,
          incoterm: true,
          specialRequirements: true,
          requiredServices: true,
          isDefault: true,
          category: true,
          tradeLane: true,
          language: true,
          dynamicFields: true,
          templateVariables: true,
          usageCount: true,
          lastUsedAt: true,
          isPublic: true,
          tags: true,
          version: true,
          parentTemplateId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          creator: {
            select: { firstName: true, lastName: true },
          },
          parentTemplate: {
            select: { id: true, name: true },
          },
          _count: {
            select: { childTemplates: true },
          },
        },
      }),
      prisma.rFQTemplate.count({ where }),
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
   * Get template by ID
   */
  async getTemplateById(id: string, companyId: string) {
    const template = await prisma.rFQTemplate.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        name: true,
        description: true,
        subjectTemplate: true,
        bodyTemplate: true,
        originPort: true,
        destinationPort: true,
        commodity: true,
        containerType: true,
        containerQuantity: true,
        cargoWeight: true,
        cargoVolume: true,
        incoterm: true,
        specialRequirements: true,
        requiredServices: true,
        isDefault: true,
        category: true,
        tradeLane: true,
        language: true,
        dynamicFields: true,
        templateVariables: true,
        usageCount: true,
        lastUsedAt: true,
        isPublic: true,
        tags: true,
        version: true,
        parentTemplateId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        creator: {
          select: { firstName: true, lastName: true },
        },
        parentTemplate: {
          select: { id: true, name: true, version: true },
        },
        childTemplates: {
          select: {
            id: true,
            name: true,
            version: true,
            createdAt: true,
            creator: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    return template;
  }

  /**
   * Create new template
   */
  async createTemplate(
    companyId: string,
    createdBy: string,
    templateData: any
  ) {
    const template = await prisma.rFQTemplate.create({
      data: {
        companyId,
        name: templateData.name,
        description: templateData.description,
        subjectTemplate: templateData.subjectTemplate,
        bodyTemplate: templateData.bodyTemplate,
        originPort: templateData.originPort,
        destinationPort: templateData.destinationPort,
        commodity: templateData.commodity,
        containerType: templateData.containerType,
        containerQuantity: templateData.containerQuantity,
        cargoWeight: templateData.cargoWeight,
        cargoVolume: templateData.cargoVolume,
        incoterm: templateData.incoterm,
        specialRequirements: templateData.specialRequirements,
        requiredServices: templateData.requiredServices || [],
        isDefault: templateData.isDefault || false,
        category: templateData.category,
        tradeLane: templateData.tradeLane,
        language: templateData.language || "en",
        dynamicFields: templateData.dynamicFields as any,
        templateVariables: templateData.templateVariables || [],
        isPublic: templateData.isPublic || false,
        tags: templateData.tags || [],
        version: templateData.version || 1,
        parentTemplateId: templateData.parentTemplateId,
        isActive:
          templateData.isActive !== undefined ? templateData.isActive : true,
        createdBy,
      },
      select: {
        id: true,
        name: true,
        description: true,
        subjectTemplate: true,
        bodyTemplate: true,
        originPort: true,
        destinationPort: true,
        commodity: true,
        containerType: true,
        containerQuantity: true,
        cargoWeight: true,
        cargoVolume: true,
        incoterm: true,
        specialRequirements: true,
        requiredServices: true,
        isDefault: true,
        category: true,
        tradeLane: true,
        language: true,
        dynamicFields: true,
        templateVariables: true,
        usageCount: true,
        lastUsedAt: true,
        isPublic: true,
        tags: true,
        version: true,
        parentTemplateId: true,
        isActive: true,
        createdAt: true,
        createdBy: true,
        creator: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return template;
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, companyId: string, templateData: any) {
    const template = await prisma.rFQTemplate.update({
      where: { id, companyId },
      data: {
        name: templateData.name,
        description: templateData.description,
        subjectTemplate: templateData.subjectTemplate,
        bodyTemplate: templateData.bodyTemplate,
        originPort: templateData.originPort,
        destinationPort: templateData.destinationPort,
        commodity: templateData.commodity,
        containerType: templateData.containerType,
        containerQuantity: templateData.containerQuantity,
        cargoWeight: templateData.cargoWeight,
        cargoVolume: templateData.cargoVolume,
        incoterm: templateData.incoterm,
        specialRequirements: templateData.specialRequirements,
        requiredServices: templateData.requiredServices,
        isDefault: templateData.isDefault,
        category: templateData.category,
        tradeLane: templateData.tradeLane,
        language: templateData.language,
        dynamicFields: templateData.dynamicFields as any,
        templateVariables: templateData.templateVariables,
        isPublic: templateData.isPublic,
        tags: templateData.tags,
        version: templateData.version,
        parentTemplateId: templateData.parentTemplateId,
        isActive: templateData.isActive,
      },
      select: {
        id: true,
        name: true,
        description: true,
        subjectTemplate: true,
        bodyTemplate: true,
        originPort: true,
        destinationPort: true,
        commodity: true,
        containerType: true,
        containerQuantity: true,
        cargoWeight: true,
        cargoVolume: true,
        incoterm: true,
        specialRequirements: true,
        requiredServices: true,
        isDefault: true,
        category: true,
        tradeLane: true,
        language: true,
        dynamicFields: true,
        templateVariables: true,
        usageCount: true,
        lastUsedAt: true,
        isPublic: true,
        tags: true,
        version: true,
        parentTemplateId: true,
        isActive: true,
        updatedAt: true,
        createdBy: true,
        creator: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return template;
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string, companyId: string) {
    // Check if template has child templates
    const template = await prisma.rFQTemplate.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { childTemplates: true },
        },
      },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    if (template._count.childTemplates > 0) {
      throw new ValidationError(
        "Cannot delete template with child templates. Delete child templates first."
      );
    }

    await prisma.rFQTemplate.delete({
      where: { id, companyId },
    });

    return true;
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(
    id: string,
    companyId: string,
    createdBy: string,
    options: { name?: string; description?: string }
  ) {
    const originalTemplate = await prisma.rFQTemplate.findFirst({
      where: { id, companyId },
    });

    if (!originalTemplate) {
      throw new Error("Template not found");
    }

    const duplicatedTemplate = await prisma.rFQTemplate.create({
      data: {
        companyId,
        name: options.name || `${originalTemplate.name} (Copy)`,
        description: options.description || originalTemplate.description,
        subjectTemplate: originalTemplate.subjectTemplate,
        bodyTemplate: originalTemplate.bodyTemplate,
        originPort: originalTemplate.originPort,
        destinationPort: originalTemplate.destinationPort,
        commodity: originalTemplate.commodity,
        containerType: originalTemplate.containerType,
        containerQuantity: originalTemplate.containerQuantity,
        cargoWeight: originalTemplate.cargoWeight,
        cargoVolume: originalTemplate.cargoVolume,
        incoterm: originalTemplate.incoterm,
        specialRequirements: originalTemplate.specialRequirements,
        requiredServices: originalTemplate.requiredServices,
        isDefault: false, // Duplicated templates are not default
        category: originalTemplate.category,
        tradeLane: originalTemplate.tradeLane,
        language: originalTemplate.language,
        dynamicFields: originalTemplate.dynamicFields as any,
        templateVariables: originalTemplate.templateVariables,
        isPublic: false, // Duplicated templates are private
        tags: originalTemplate.tags,
        version: 1, // Reset version for duplicated template
        parentTemplateId: originalTemplate.id, // Set parent reference
        isActive: true,
        createdBy,
      },
    });

    return duplicatedTemplate;
  }

  /**
   * Use template to create RFQ data
   */
  async useTemplate(id: string, companyId: string, variables: any = {}) {
    const template = await prisma.rFQTemplate.findFirst({
      where: { id, companyId, isActive: true },
    });

    if (!template) {
      throw new Error("Template not found or inactive");
    }

    // Update usage statistics
    await prisma.rFQTemplate.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    // Process template with variables
    const processedTemplate = this.processTemplateWithVariables(
      template,
      variables
    );

    return processedTemplate;
  }

  /**
   * Create template from existing RFQ
   */
  async createTemplateFromRFQ(
    rfqId: string,
    companyId: string,
    createdBy: string,
    options: {
      name: string;
      description?: string;
      category?: string;
      tags?: string[];
    }
  ) {
    const rfq = await prisma.rFQ.findFirst({
      where: { id: rfqId, companyId },
    });

    if (!rfq) {
      throw new Error("RFQ not found");
    }

    const template = await prisma.rFQTemplate.create({
      data: {
        companyId,
        name: options.name,
        description: options.description,
        subjectTemplate: rfq.emailSubject || "RFQ Request",
        bodyTemplate: rfq.emailBody || "Please find attached RFQ details.",
        originPort: rfq.originPort,
        destinationPort: rfq.destinationPort,
        commodity: rfq.commodity,
        containerType: rfq.containerType,
        containerQuantity: rfq.containerQuantity,
        cargoWeight: rfq.cargoWeight,
        cargoVolume: rfq.cargoVolume,
        incoterm: rfq.incoterm,
        specialRequirements: rfq.specialRequirements,
        requiredServices: rfq.requiredServices,
        isDefault: false,
        category: options.category,
        tradeLane: rfq.tradeLane,
        language: "en",
        dynamicFields: this.extractDynamicFields(rfq),
        templateVariables: this.extractTemplateVariables(rfq),
        isPublic: false,
        tags: options.tags || [],
        version: 1,
        isActive: true,
        createdBy,
      },
    });

    return template;
  }

  /**
   * Update template status
   */
  async updateTemplateStatus(id: string, companyId: string, isActive: boolean) {
    const template = await prisma.rFQTemplate.update({
      where: { id, companyId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    return template;
  }

  /**
   * Set default template
   */
  async setDefaultTemplate(id: string, companyId: string) {
    // First, unset all other default templates for this company
    await prisma.rFQTemplate.updateMany({
      where: { companyId, isDefault: true },
      data: { isDefault: false },
    });

    // Set the specified template as default
    const template = await prisma.rFQTemplate.update({
      where: { id, companyId },
      data: { isDefault: true },
      select: {
        id: true,
        name: true,
        isDefault: true,
      },
    });

    return template;
  }

  /**
   * Get template categories
   */
  async getTemplateCategories(companyId: string) {
    const templates = await prisma.rFQTemplate.findMany({
      where: { companyId, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });

    return templates
      .map((t) => t.category)
      .filter((category) => category)
      .sort();
  }

  /**
   * Get supported languages
   */
  async getTemplateLanguages() {
    return [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
      { code: "fr", name: "French" },
      { code: "de", name: "German" },
      { code: "it", name: "Italian" },
      { code: "pt", name: "Portuguese" },
      { code: "ru", name: "Russian" },
      { code: "zh", name: "Chinese" },
      { code: "ja", name: "Japanese" },
      { code: "ko", name: "Korean" },
      { code: "ar", name: "Arabic" },
    ];
  }

  /**
   * Get template tags
   */
  async getTemplateTags(companyId: string) {
    const templates = await prisma.rFQTemplate.findMany({
      where: { companyId },
      select: { tags: true },
    });

    const tags = new Set<string>();
    templates.forEach((template) => {
      template.tags.forEach((tag) => tags.add(tag));
    });

    return Array.from(tags).sort();
  }

  /**
   * Get template trade lanes
   */
  async getTemplateTradeLanes(companyId: string) {
    const templates = await prisma.rFQTemplate.findMany({
      where: { companyId, tradeLane: { not: null } },
      select: { tradeLane: true },
      distinct: ["tradeLane"],
    });

    return templates
      .map((t) => t.tradeLane)
      .filter((tradeLane) => tradeLane)
      .sort();
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(companyId: string, options: any) {
    const { period, dateFrom, dateTo } = options;

    let dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.createdAt = {};
      if (dateFrom) dateFilter.createdAt.gte = new Date(dateFrom);
      if (dateTo) dateFilter.createdAt.lte = new Date(dateTo);
    } else if (period) {
      const now = new Date();
      const startDate = new Date();
      switch (period) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      dateFilter.createdAt = { gte: startDate };
    }

    const where = { companyId, ...dateFilter };

    const [
      totalTemplates,
      activeTemplates,
      publicTemplates,
      totalUsage,
      avgUsagePerTemplate,
      topTemplates,
      categoryDistribution,
    ] = await Promise.all([
      prisma.rFQTemplate.count({ where }),
      prisma.rFQTemplate.count({ where: { ...where, isActive: true } }),
      prisma.rFQTemplate.count({ where: { ...where, isPublic: true } }),
      prisma.rFQTemplate.aggregate({
        where: { ...where, usageCount: { gt: 0 } },
        _sum: { usageCount: true },
      }),
      prisma.rFQTemplate.aggregate({
        where: { ...where, usageCount: { gt: 0 } },
        _avg: { usageCount: true },
      }),
      prisma.rFQTemplate.findMany({
        where: { ...where, usageCount: { gt: 0 } },
        select: { id: true, name: true, usageCount: true },
        orderBy: { usageCount: "desc" },
        take: 10,
      }),
      prisma.rFQTemplate.groupBy({
        by: ["category"],
        where: { ...where, category: { not: null } },
        _count: { category: true },
        orderBy: { _count: { category: "desc" } },
        take: 10,
      }),
    ]);

    return {
      totalTemplates,
      activeTemplates,
      publicTemplates,
      totalUsage: totalUsage._sum.usageCount || 0,
      avgUsagePerTemplate: avgUsagePerTemplate._avg.usageCount || 0,
      topTemplates: topTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        usageCount: t.usageCount,
      })),
      categoryDistribution: categoryDistribution.map((cat) => ({
        category: cat.category,
        count: cat._count.category,
      })),
    };
  }

  /**
   * Get public templates
   */
  async getPublicTemplates(options: any) {
    const { page, limit, search, category, tradeLane, language, tags } =
      options;
    const skip = (page - 1) * limit;

    const where: any = { isPublic: true, isActive: true };

    if (category) where.category = category;
    if (tradeLane) where.tradeLane = tradeLane;
    if (language) where.language = language;
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [templates, total] = await Promise.all([
      prisma.rFQTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { usageCount: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          tradeLane: true,
          language: true,
          tags: true,
          usageCount: true,
          createdAt: true,
          creator: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.rFQTemplate.count({ where }),
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
   * Import public template
   */
  async importPublicTemplate(id: string, companyId: string, createdBy: string) {
    const publicTemplate = await prisma.rFQTemplate.findFirst({
      where: { id, isPublic: true, isActive: true },
    });

    if (!publicTemplate) {
      throw new Error("Public template not found");
    }

    const importedTemplate = await prisma.rFQTemplate.create({
      data: {
        companyId,
        name: `${publicTemplate.name} (Imported)`,
        description: publicTemplate.description,
        subjectTemplate: publicTemplate.subjectTemplate,
        bodyTemplate: publicTemplate.bodyTemplate,
        originPort: publicTemplate.originPort,
        destinationPort: publicTemplate.destinationPort,
        commodity: publicTemplate.commodity,
        containerType: publicTemplate.containerType,
        containerQuantity: publicTemplate.containerQuantity,
        cargoWeight: publicTemplate.cargoWeight,
        cargoVolume: publicTemplate.cargoVolume,
        incoterm: publicTemplate.incoterm,
        specialRequirements: publicTemplate.specialRequirements,
        requiredServices: publicTemplate.requiredServices,
        isDefault: false,
        category: publicTemplate.category,
        tradeLane: publicTemplate.tradeLane,
        language: publicTemplate.language,
        dynamicFields: publicTemplate.dynamicFields as any,
        templateVariables: publicTemplate.templateVariables,
        isPublic: false, // Imported templates are private
        tags: publicTemplate.tags,
        version: 1,
        parentTemplateId: publicTemplate.id,
        isActive: true,
        createdBy,
      },
    });

    return importedTemplate;
  }

  /**
   * Get template variables
   */
  async getTemplateVariables(id: string, companyId: string) {
    const template = await prisma.rFQTemplate.findFirst({
      where: { id, companyId },
      select: { templateVariables: true, dynamicFields: true },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    return {
      variables: template.templateVariables,
      dynamicFields: template.dynamicFields,
    };
  }

  /**
   * Bulk import templates
   */
  async bulkImportTemplates(
    companyId: string,
    createdBy: string,
    templates: any[]
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const templateData of templates) {
      try {
        await prisma.rFQTemplate.create({
          data: {
            companyId,
            name: templateData.name,
            description: templateData.description,
            subjectTemplate: templateData.subjectTemplate,
            bodyTemplate: templateData.bodyTemplate,
            originPort: templateData.originPort,
            destinationPort: templateData.destinationPort,
            commodity: templateData.commodity,
            containerType: templateData.containerType,
            containerQuantity: templateData.containerQuantity,
            cargoWeight: templateData.cargoWeight,
            cargoVolume: templateData.cargoVolume,
            incoterm: templateData.incoterm,
            specialRequirements: templateData.specialRequirements,
            requiredServices: templateData.requiredServices || [],
            isDefault: false,
            category: templateData.category,
            tradeLane: templateData.tradeLane,
            language: templateData.language || "en",
            dynamicFields: templateData.dynamicFields as any,
            templateVariables: templateData.templateVariables || [],
            isPublic: false,
            tags: templateData.tags || [],
            version: 1,
            isActive: true,
            createdBy,
          },
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `Template "${templateData.name}": ${error.message}`
        );
      }
    }

    return results;
  }

  /**
   * Process template with variables
   */
  private processTemplateWithVariables(template: any, variables: any) {
    const processedTemplate = { ...template };

    // Process subject template
    if (processedTemplate.subjectTemplate) {
      processedTemplate.subjectTemplate = this.replaceVariables(
        processedTemplate.subjectTemplate,
        variables
      );
    }

    // Process body template
    if (processedTemplate.bodyTemplate) {
      processedTemplate.bodyTemplate = this.replaceVariables(
        processedTemplate.bodyTemplate,
        variables
      );
    }

    // Process other text fields
    const textFields = [
      "description",
      "originPort",
      "destinationPort",
      "commodity",
      "specialRequirements",
    ];

    textFields.forEach((field) => {
      if (processedTemplate[field]) {
        processedTemplate[field] = this.replaceVariables(
          processedTemplate[field],
          variables
        );
      }
    });

    return processedTemplate;
  }

  /**
   * Replace variables in template text
   */
  private replaceVariables(text: string, variables: any): string {
    let processedText = text;

    // Replace {{variable}} patterns
    Object.keys(variables).forEach((key) => {
      const pattern = new RegExp(`{{${key}}}`, "g");
      processedText = processedText.replace(pattern, variables[key] || "");
    });

    return processedText;
  }

  /**
   * Extract dynamic fields from RFQ
   */
  private extractDynamicFields(rfq: any) {
    const dynamicFields: any = {};

    // Extract fields that could be variables
    if (rfq.originPort) dynamicFields.originPort = rfq.originPort;
    if (rfq.destinationPort)
      dynamicFields.destinationPort = rfq.destinationPort;
    if (rfq.commodity) dynamicFields.commodity = rfq.commodity;
    if (rfq.containerType) dynamicFields.containerType = rfq.containerType;
    if (rfq.containerQuantity)
      dynamicFields.containerQuantity = rfq.containerQuantity;

    return dynamicFields;
  }

  /**
   * Extract template variables from RFQ
   */
  private extractTemplateVariables(rfq: any) {
    const variables: string[] = [];

    // Common variables that can be used in templates
    const commonVariables = [
      "originPort",
      "destinationPort",
      "commodity",
      "containerType",
      "containerQuantity",
      "cargoWeight",
      "cargoVolume",
      "incoterm",
      "tradeLane",
      "estimatedValue",
      "currency",
    ];

    commonVariables.forEach((variable) => {
      if (rfq[variable]) {
        variables.push(variable);
      }
    });

    return variables;
  }
}
