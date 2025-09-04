import { prisma } from "../app";
import { ValidationError } from "../utils/errors";

export class ShippingLineService {
  /**
   * Get shipping lines with pagination and filtering
   */
  async getShippingLines(
    companyId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      tradeLane?: string;
      service?: string;
      tag?: string;
      isCustom?: boolean;
    }
  ) {
    const { page, limit, search, status, tradeLane, service, tag, isCustom } =
      options;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    // Status filtering
    if (status === "active") {
      where.isActive = true;
      where.isArchived = false;
    } else if (status === "inactive") {
      where.isActive = false;
    } else if (status === "archived") {
      where.isArchived = true;
    }

    // Custom carrier filtering
    if (isCustom !== undefined) {
      where.isCustom = isCustom;
    }

    // Search filtering
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { scacCode: { contains: search, mode: "insensitive" } },
        { headquartersLocation: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Trade lane filtering
    if (tradeLane) {
      where.tradeLanes = {
        has: tradeLane,
      };
    }

    // Service filtering
    if (service) {
      where.services = {
        has: service,
      };
    }

    // Tag filtering
    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    const [shippingLines, total] = await Promise.all([
      prisma.shippingLine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          code: true,
          scacCode: true,
          website: true,
          headquartersLocation: true,
          headquartersCountry: true,
          description: true,
          notes: true,
          tags: true,
          tradeLanes: true,
          services: true,
          specialization: true,
          reliability: true,
          serviceQuality: true,
          isActive: true,
          isArchived: true,
          isCustom: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          creator: {
            select: { firstName: true, lastName: true },
          },
          _count: {
            select: {
              contacts: true,
              quotes: true,
            },
          },
        },
      }),
      prisma.shippingLine.count({ where }),
    ]);

    return {
      shippingLines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get shipping line by ID
   */
  async getShippingLineById(id: string, companyId: string) {
    const shippingLine = await prisma.shippingLine.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        name: true,
        code: true,
        scacCode: true,
        website: true,
        headquartersLocation: true,
        headquartersCountry: true,
        description: true,
        notes: true,
        tags: true,
        tradeLanes: true,
        services: true,
        specialization: true,
        reliability: true,
        serviceQuality: true,
        isActive: true,
        isArchived: true,
        isCustom: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        creator: {
          select: { firstName: true, lastName: true },
        },
        contacts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            isPrimary: true,
          },
        },
        _count: {
          select: {
            contacts: true,
            quotes: true,
            rfqRecipients: true,
          },
        },
      },
    });

    if (!shippingLine) {
      throw new Error("Shipping line not found");
    }

    return shippingLine;
  }

  /**
   * Create new shipping line
   */
  async createShippingLine(
    companyId: string,
    createdBy: string,
    shippingLineData: any
  ) {
    // Check if shipping line with same name already exists
    const existingShippingLine = await prisma.shippingLine.findFirst({
      where: {
        companyId,
        name: shippingLineData.name,
      },
    });

    if (existingShippingLine) {
      throw new ValidationError("Shipping line with this name already exists");
    }

    // Validate ratings
    if (
      shippingLineData.reliability &&
      (shippingLineData.reliability < 1 || shippingLineData.reliability > 5)
    ) {
      throw new ValidationError("Reliability rating must be between 1 and 5");
    }

    if (
      shippingLineData.serviceQuality &&
      (shippingLineData.serviceQuality < 1 ||
        shippingLineData.serviceQuality > 5)
    ) {
      throw new ValidationError(
        "Service quality rating must be between 1 and 5"
      );
    }

    const shippingLine = await prisma.shippingLine.create({
      data: {
        companyId,
        name: shippingLineData.name,
        code: shippingLineData.code,
        scacCode: shippingLineData.scacCode,
        website: shippingLineData.website,
        headquartersLocation: shippingLineData.headquartersLocation,
        headquartersCountry: shippingLineData.headquartersCountry,
        description: shippingLineData.description,
        notes: shippingLineData.notes,
        tags: shippingLineData.tags || [],
        tradeLanes: shippingLineData.tradeLanes || [],
        services: shippingLineData.services || [],
        specialization: shippingLineData.specialization,
        reliability: shippingLineData.reliability,
        serviceQuality: shippingLineData.serviceQuality,
        isCustom: shippingLineData.isCustom || false,
        createdBy,
      },
      select: {
        id: true,
        name: true,
        code: true,
        scacCode: true,
        website: true,
        headquartersLocation: true,
        headquartersCountry: true,
        description: true,
        notes: true,
        tags: true,
        tradeLanes: true,
        services: true,
        specialization: true,
        reliability: true,
        serviceQuality: true,
        isActive: true,
        isArchived: true,
        isCustom: true,
        createdAt: true,
        creator: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return shippingLine;
  }

  /**
   * Update shipping line
   */
  async updateShippingLine(
    id: string,
    companyId: string,
    shippingLineData: any
  ) {
    // Check if shipping line with same name already exists (excluding current one)
    if (shippingLineData.name) {
      const existingShippingLine = await prisma.shippingLine.findFirst({
        where: {
          companyId,
          name: shippingLineData.name,
          id: { not: id },
        },
      });

      if (existingShippingLine) {
        throw new ValidationError(
          "Shipping line with this name already exists"
        );
      }
    }

    // Validate ratings
    if (
      shippingLineData.reliability &&
      (shippingLineData.reliability < 1 || shippingLineData.reliability > 5)
    ) {
      throw new ValidationError("Reliability rating must be between 1 and 5");
    }

    if (
      shippingLineData.serviceQuality &&
      (shippingLineData.serviceQuality < 1 ||
        shippingLineData.serviceQuality > 5)
    ) {
      throw new ValidationError(
        "Service quality rating must be between 1 and 5"
      );
    }

    const shippingLine = await prisma.shippingLine.update({
      where: { id, companyId },
      data: {
        name: shippingLineData.name,
        code: shippingLineData.code,
        scacCode: shippingLineData.scacCode,
        website: shippingLineData.website,
        headquartersLocation: shippingLineData.headquartersLocation,
        headquartersCountry: shippingLineData.headquartersCountry,
        description: shippingLineData.description,
        notes: shippingLineData.notes,
        tags: shippingLineData.tags,
        tradeLanes: shippingLineData.tradeLanes,
        services: shippingLineData.services,
        specialization: shippingLineData.specialization,
        reliability: shippingLineData.reliability,
        serviceQuality: shippingLineData.serviceQuality,
      },
      select: {
        id: true,
        name: true,
        code: true,
        scacCode: true,
        website: true,
        headquartersLocation: true,
        headquartersCountry: true,
        description: true,
        notes: true,
        tags: true,
        tradeLanes: true,
        services: true,
        specialization: true,
        reliability: true,
        serviceQuality: true,
        isActive: true,
        isArchived: true,
        isCustom: true,
        updatedAt: true,
      },
    });

    return shippingLine;
  }

  /**
   * Delete shipping line
   */
  async deleteShippingLine(id: string, companyId: string) {
    // Check if shipping line has associated contacts or quotes
    const shippingLine = await prisma.shippingLine.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            contacts: true,
            quotes: true,
            rfqRecipients: true,
          },
        },
      },
    });

    if (!shippingLine) {
      throw new Error("Shipping line not found");
    }

    if (
      shippingLine._count.contacts > 0 ||
      shippingLine._count.quotes > 0 ||
      shippingLine._count.rfqRecipients > 0
    ) {
      throw new ValidationError(
        "Cannot delete shipping line with associated contacts, quotes, or RFQ recipients"
      );
    }

    await prisma.shippingLine.delete({
      where: { id, companyId },
    });

    return true;
  }

  /**
   * Update shipping line status
   */
  async updateShippingLineStatus(
    id: string,
    companyId: string,
    isActive: boolean
  ) {
    const shippingLine = await prisma.shippingLine.update({
      where: { id, companyId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
        isArchived: true,
      },
    });

    return shippingLine;
  }

  /**
   * Archive shipping line
   */
  async archiveShippingLine(id: string, companyId: string) {
    const shippingLine = await prisma.shippingLine.update({
      where: { id, companyId },
      data: { isArchived: true, isActive: false },
      select: {
        id: true,
        name: true,
        isActive: true,
        isArchived: true,
      },
    });

    return shippingLine;
  }

  /**
   * Restore shipping line
   */
  async restoreShippingLine(id: string, companyId: string) {
    const shippingLine = await prisma.shippingLine.update({
      where: { id, companyId },
      data: { isArchived: false, isActive: true },
      select: {
        id: true,
        name: true,
        isActive: true,
        isArchived: true,
      },
    });

    return shippingLine;
  }

  /**
   * Get all unique trade lanes
   */
  async getTradeLanes(companyId: string) {
    const shippingLines = await prisma.shippingLine.findMany({
      where: { companyId, isArchived: false },
      select: { tradeLanes: true },
    });

    const tradeLanes = new Set<string>();
    shippingLines.forEach((line) => {
      line.tradeLanes.forEach((lane) => tradeLanes.add(lane));
    });

    return Array.from(tradeLanes).sort();
  }

  /**
   * Get all unique services
   */
  async getServices(companyId: string) {
    const shippingLines = await prisma.shippingLine.findMany({
      where: { companyId, isArchived: false },
      select: { services: true },
    });

    const services = new Set<string>();
    shippingLines.forEach((line) => {
      line.services.forEach((service) => services.add(service));
    });

    return Array.from(services).sort();
  }

  /**
   * Get all unique tags
   */
  async getTags(companyId: string) {
    const shippingLines = await prisma.shippingLine.findMany({
      where: { companyId, isArchived: false },
      select: { tags: true },
    });

    const tags = new Set<string>();
    shippingLines.forEach((line) => {
      line.tags.forEach((tag) => tags.add(tag));
    });

    return Array.from(tags).sort();
  }

  /**
   * Bulk import shipping lines
   */
  async bulkImportShippingLines(
    companyId: string,
    createdBy: string,
    shippingLines: any[]
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const shippingLineData of shippingLines) {
      try {
        await prisma.shippingLine.create({
          data: {
            companyId,
            name: shippingLineData.name,
            code: shippingLineData.code,
            scacCode: shippingLineData.scacCode,
            website: shippingLineData.website,
            headquartersLocation: shippingLineData.headquartersLocation,
            headquartersCountry: shippingLineData.headquartersCountry,
            description: shippingLineData.description,
            notes: shippingLineData.notes,
            tags: shippingLineData.tags || [],
            tradeLanes: shippingLineData.tradeLanes || [],
            services: shippingLineData.services || [],
            specialization: shippingLineData.specialization,
            reliability: shippingLineData.reliability,
            serviceQuality: shippingLineData.serviceQuality,
            isCustom: shippingLineData.isCustom || false,
            createdBy,
          },
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `Failed to import ${shippingLineData.name}: ${error.message}`
        );
      }
    }

    return results;
  }
}

