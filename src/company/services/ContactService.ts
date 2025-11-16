import { prisma } from "../../app";
import { ValidationError } from "../../utils/errors";

export class ContactService {
  /**
   * Get contacts with pagination and filtering
   */
  async getContacts(
    companyId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      shippingLineId?: string;
      department?: string;
      tag?: string;
      seniority?: string;
      specialization?: string;
      isPrimary?: boolean;
      doNotContact?: boolean;
    }
  ) {
    const {
      page,
      limit,
      search,
      status,
      shippingLineId,
      department,
      tag,
      seniority,
      specialization,
      isPrimary,
      doNotContact,
    } = options;
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

    // Shipping line filtering
    if (shippingLineId) {
      where.shippingLineId = shippingLineId;
    }

    // Department filtering
    if (department) {
      where.department = department;
    }

    // Seniority filtering
    if (seniority) {
      where.seniority = seniority;
    }

    // Specialization filtering
    if (specialization) {
      where.specialization = specialization;
    }

    // Primary contact filtering
    if (isPrimary !== undefined) {
      where.isPrimary = isPrimary;
    }

    // Do not contact filtering
    if (doNotContact !== undefined) {
      where.doNotContact = doNotContact;
    }

    // Search filtering
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { jobTitle: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Tag filtering
    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          companyName: true,
          jobTitle: true,
          department: true,
          tags: true,
          notes: true,
          performanceScore: true,
          responseRate: true,
          avgResponseTime: true,
          lastResponseAt: true,
          totalRFQsSent: true,
          totalResponses: true,
          quoteQuality: true,
          reliability: true,
          seniority: true,
          specialization: true,
          doNotContact: true,
          isPrimary: true,
          isActive: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          shippingLineId: true,
        },
      }),
      prisma.contact.count({ where }),
    ]);

    // Get related data separately to avoid foreign key constraint issues
    const contactIds = contacts.map((c) => c.id);
    const creatorIds = [...new Set(contacts.map((c) => c.createdBy))];
    const shippingLineIds = [...new Set(contacts.map((c) => c.shippingLineId))];

    const [creators, shippingLines] = await Promise.all([
      prisma.companyUser.findMany({
        where: { id: { in: creatorIds } },
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.shippingLine.findMany({
        where: { id: { in: shippingLineIds } },
        select: { id: true, name: true },
      }),
    ]);

    const creatorMap = new Map(creators.map((c) => [c.id, c]));
    const shippingLineMap = new Map(shippingLines.map((sl) => [sl.id, sl]));

    // Get counts for each contact
    const contactCounts = await Promise.all(
      contactIds.map(async (contactId) => {
        const [rfqRecipients, quotes, emailLogs] = await Promise.all([
          prisma.rFQRecipient.count({ where: { contactId } }),
          prisma.quote.count({ where: { contactId } }),
          prisma.emailLog.count({ where: { contactId } }),
        ]);
        return {
          contactId,
          rfqRecipients,
          quotes,
          emailLogs,
        };
      })
    );

    const countMap = new Map(contactCounts.map((c) => [c.contactId, c]));

    // Combine the data
    const contactsWithRelations = contacts.map((contact) => ({
      ...contact,
      creator: creatorMap.get(contact.createdBy) || null,
      shippingLine: shippingLineMap.get(contact.shippingLineId) || null,
      _count: countMap.get(contact.id) || {
        rfqRecipients: 0,
        quotes: 0,
        emailLogs: 0,
      },
    }));

    return {
      contacts: contactsWithRelations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get contact by ID
   */
  async getContactById(id: string, companyId: string) {
    const contact = await prisma.contact.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        jobTitle: true,
        department: true,
        tags: true,
        notes: true,
        performanceScore: true,
        responseRate: true,
        avgResponseTime: true,
        lastResponseAt: true,
        totalRFQsSent: true,
        totalResponses: true,
        quoteQuality: true,
        reliability: true,
        seniority: true,
        specialization: true,
        communicationHistory: true,
        preferences: true,
        doNotContact: true,
        isPrimary: true,
        isActive: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        creator: {
          select: { firstName: true, lastName: true },
        },
        shippingLine: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            rfqRecipients: true,
            quotes: true,
            emailLogs: true,
          },
        },
      },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    return contact;
  }

  /**
   * Create new contact
   */
  async createContact(companyId: string, createdBy: string, contactData: any) {
    // Debug: Log the shipping line ID being used
    console.log(
      `🔍 Creating contact with shippingLineId: ${contactData.shippingLineId}`
    );

    // First, verify the shipping line exists
    const shippingLine = await prisma.shippingLine.findFirst({
      where: {
        id: contactData.shippingLineId,
        companyId: companyId,
      },
    });

    if (!shippingLine) {
      console.log(
        `❌ Shipping line not found: ${contactData.shippingLineId} for company: ${companyId}`
      );
      throw new ValidationError(
        `Shipping line with ID ${contactData.shippingLineId} not found or doesn't belong to this company`
      );
    }

    console.log(
      `✅ Found shipping line: ${shippingLine.name} (${shippingLine.id})`
    );

    // Check if contact with same email already exists in the same shipping line
    const existingContact = await prisma.contact.findFirst({
      where: {
        companyId,
        shippingLineId: contactData.shippingLineId,
        email: contactData.email.toLowerCase(),
      },
    });

    if (existingContact) {
      throw new ValidationError(
        "Contact with this email already exists in this shipping line"
      );
    }

    // Validate ratings
    if (
      contactData.quoteQuality &&
      (contactData.quoteQuality < 1 || contactData.quoteQuality > 5)
    ) {
      throw new ValidationError("Quote quality rating must be between 1 and 5");
    }

    if (
      contactData.reliability &&
      (contactData.reliability < 1 || contactData.reliability > 5)
    ) {
      throw new ValidationError("Reliability rating must be between 1 and 5");
    }

    // If setting as primary, unset other primary contacts for the same shipping line
    if (contactData.isPrimary) {
      await prisma.contact.updateMany({
        where: {
          companyId,
          shippingLineId: contactData.shippingLineId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.contact.create({
      data: {
        companyId,
        shippingLineId: contactData.shippingLineId,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email.toLowerCase(),
        phone: contactData.phone,
        companyName: contactData.companyName || contactData.company,
        jobTitle: contactData.jobTitle,
        department: contactData.department,
        tags: contactData.tags || [],
        notes: contactData.notes,
        quoteQuality: contactData.quoteQuality,
        reliability: contactData.reliability,
        seniority: contactData.seniority,
        specialization: contactData.specialization,
        communicationHistory: contactData.communicationHistory,
        preferences: contactData.preferences,
        doNotContact: contactData.doNotContact || false,
        isPrimary: contactData.isPrimary || false,
        createdBy,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        jobTitle: true,
        department: true,
        tags: true,
        notes: true,
        performanceScore: true,
        responseRate: true,
        avgResponseTime: true,
        lastResponseAt: true,
        totalRFQsSent: true,
        totalResponses: true,
        quoteQuality: true,
        reliability: true,
        seniority: true,
        specialization: true,
        doNotContact: true,
        isPrimary: true,
        isActive: true,
        isArchived: true,
        createdAt: true,
        creator: {
          select: { firstName: true, lastName: true },
        },
        shippingLine: {
          select: { id: true, name: true },
        },
      },
    });

    return contact;
  }

  /**
   * Update contact
   */
  async updateContact(id: string, companyId: string, contactData: any) {
    // Check if contact with same email already exists in the same shipping line (excluding current one)
    if (contactData.email && contactData.shippingLineId) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          companyId,
          shippingLineId: contactData.shippingLineId,
          email: contactData.email.toLowerCase(),
          id: { not: id },
        },
      });

      if (existingContact) {
        throw new ValidationError(
          "Contact with this email already exists in this shipping line"
        );
      }
    }

    // Validate ratings
    if (
      contactData.quoteQuality &&
      (contactData.quoteQuality < 1 || contactData.quoteQuality > 5)
    ) {
      throw new ValidationError("Quote quality rating must be between 1 and 5");
    }

    if (
      contactData.reliability &&
      (contactData.reliability < 1 || contactData.reliability > 5)
    ) {
      throw new ValidationError("Reliability rating must be between 1 and 5");
    }

    // If setting as primary, unset other primary contacts for the same shipping line
    if (contactData.isPrimary) {
      const currentContact = await prisma.contact.findFirst({
        where: { id, companyId },
        select: { shippingLineId: true },
      });

      if (currentContact) {
        await prisma.contact.updateMany({
          where: {
            companyId,
            shippingLineId: currentContact.shippingLineId,
            isPrimary: true,
            id: { not: id },
          },
          data: { isPrimary: false },
        });
      }
    }

    const contact = await prisma.contact.update({
      where: { id, companyId },
      data: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email?.toLowerCase(),
        phone: contactData.phone,
        companyName: contactData.companyName || contactData.company,
        jobTitle: contactData.jobTitle,
        department: contactData.department,
        tags: contactData.tags,
        notes: contactData.notes,
        quoteQuality: contactData.quoteQuality,
        reliability: contactData.reliability,
        seniority: contactData.seniority,
        specialization: contactData.specialization,
        communicationHistory: contactData.communicationHistory,
        preferences: contactData.preferences,
        doNotContact: contactData.doNotContact,
        isPrimary: contactData.isPrimary,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        companyName: true,
        jobTitle: true,
        department: true,
        tags: true,
        notes: true,
        performanceScore: true,
        responseRate: true,
        avgResponseTime: true,
        lastResponseAt: true,
        totalRFQsSent: true,
        totalResponses: true,
        quoteQuality: true,
        reliability: true,
        seniority: true,
        specialization: true,
        doNotContact: true,
        isPrimary: true,
        isActive: true,
        isArchived: true,
        updatedAt: true,
        shippingLine: {
          select: { id: true, name: true },
        },
      },
    });

    return contact;
  }

  /**
   * Delete contact
   */
  async deleteContact(id: string, companyId: string) {
    // Check if contact has associated RFQ recipients or quotes
    const contact = await prisma.contact.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            rfqRecipients: true,
            quotes: true,
            emailLogs: true,
          },
        },
      },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    if (
      contact._count.rfqRecipients > 0 ||
      contact._count.quotes > 0 ||
      contact._count.emailLogs > 0
    ) {
      throw new ValidationError(
        "Cannot delete contact with associated RFQ recipients, quotes, or email logs"
      );
    }

    await prisma.contact.delete({
      where: { id, companyId },
    });

    return true;
  }

  /**
   * Update contact status
   */
  async updateContactStatus(id: string, companyId: string, isActive: boolean) {
    const contact = await prisma.contact.update({
      where: { id, companyId },
      data: { isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        isArchived: true,
      },
    });

    return contact;
  }

  /**
   * Archive contact
   */
  async archiveContact(id: string, companyId: string) {
    const contact = await prisma.contact.update({
      where: { id, companyId },
      data: { isArchived: true, isActive: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        isArchived: true,
      },
    });

    return contact;
  }

  /**
   * Restore contact
   */
  async restoreContact(id: string, companyId: string) {
    const contact = await prisma.contact.update({
      where: { id, companyId },
      data: { isArchived: false, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        isArchived: true,
      },
    });

    return contact;
  }

  /**
   * Set primary contact
   */
  async setPrimaryContact(id: string, companyId: string) {
    // Get the contact's shipping line
    const contact = await prisma.contact.findFirst({
      where: { id, companyId },
      select: { shippingLineId: true },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    // Unset other primary contacts for the same shipping line
    await prisma.contact.updateMany({
      where: {
        companyId,
        shippingLineId: contact.shippingLineId,
        isPrimary: true,
      },
      data: { isPrimary: false },
    });

    // Set this contact as primary
    const updatedContact = await prisma.contact.update({
      where: { id, companyId },
      data: { isPrimary: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isPrimary: true,
      },
    });

    return updatedContact;
  }

  /**
   * Update do not contact status
   */
  async updateDoNotContact(
    id: string,
    companyId: string,
    doNotContact: boolean
  ) {
    const contact = await prisma.contact.update({
      where: { id, companyId },
      data: { doNotContact },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        doNotContact: true,
      },
    });

    return contact;
  }

  /**
   * Get all unique departments
   */
  async getDepartments(companyId: string) {
    const contacts = await prisma.contact.findMany({
      where: { companyId, isArchived: false, department: { not: null } },
      select: { department: true },
      distinct: ["department"],
    });

    return contacts
      .map((c) => c.department)
      .filter((d) => d)
      .sort();
  }

  /**
   * Get all unique tags
   */
  async getTags(companyId: string) {
    const contacts = await prisma.contact.findMany({
      where: { companyId, isArchived: false },
      select: { tags: true },
    });

    const tags = new Set<string>();
    contacts.forEach((contact) => {
      contact.tags.forEach((tag) => tags.add(tag));
    });

    return Array.from(tags).sort();
  }

  /**
   * Get all unique seniority levels
   */
  async getSeniorityLevels(companyId: string) {
    const contacts = await prisma.contact.findMany({
      where: { companyId, isArchived: false, seniority: { not: null } },
      select: { seniority: true },
      distinct: ["seniority"],
    });

    return contacts
      .map((c) => c.seniority)
      .filter((s) => s)
      .sort();
  }

  /**
   * Get all unique specializations
   */
  async getSpecializations(companyId: string) {
    const contacts = await prisma.contact.findMany({
      where: { companyId, isArchived: false, specialization: { not: null } },
      select: { specialization: true },
      distinct: ["specialization"],
    });

    return contacts
      .map((c) => c.specialization)
      .filter((s) => s)
      .sort();
  }

  /**
   * Bulk import contacts
   */
  async bulkImportContacts(
    companyId: string,
    createdBy: string,
    contacts: any[]
  ) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const contactData of contacts) {
      try {
        // Check if contact already exists
        const existingContact = await prisma.contact.findFirst({
          where: {
            companyId,
            shippingLineId: contactData.shippingLineId,
            email: contactData.email.toLowerCase(),
          },
        });

        if (existingContact) {
          results.failed++;
          results.errors.push(
            `Contact ${contactData.email} already exists in this shipping line`
          );
          continue;
        }

        await prisma.contact.create({
          data: {
            companyId,
            shippingLineId: contactData.shippingLineId,
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            email: contactData.email.toLowerCase(),
            phone: contactData.phone,
            companyName: contactData.companyName || contactData.company,
            jobTitle: contactData.jobTitle,
            department: contactData.department,
            tags: contactData.tags || [],
            notes: contactData.notes,
            quoteQuality: contactData.quoteQuality,
            reliability: contactData.reliability,
            seniority: contactData.seniority,
            specialization: contactData.specialization,
            doNotContact: contactData.doNotContact || false,
            isPrimary: contactData.isPrimary || false,
            createdBy,
          },
        });
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `Failed to import ${contactData.email}: ${error.message}`
        );
      }
    }

    return results;
  }

  /**
   * Get performance statistics
   */
  async getPerformanceStats(companyId: string) {
    const [
      totalContacts,
      activeContacts,
      primaryContacts,
      doNotContactCount,
      avgPerformanceScore,
      avgResponseRate,
      avgResponseTime,
      topPerformers,
    ] = await Promise.all([
      prisma.contact.count({
        where: { companyId, isArchived: false },
      }),
      prisma.contact.count({
        where: { companyId, isActive: true, isArchived: false },
      }),
      prisma.contact.count({
        where: { companyId, isPrimary: true, isArchived: false },
      }),
      prisma.contact.count({
        where: { companyId, doNotContact: true, isArchived: false },
      }),
      prisma.contact.aggregate({
        where: { companyId, isArchived: false },
        _avg: { performanceScore: true },
      }),
      prisma.contact.aggregate({
        where: { companyId, isArchived: false, responseRate: { not: null } },
        _avg: { responseRate: true },
      }),
      prisma.contact.aggregate({
        where: { companyId, isArchived: false, avgResponseTime: { not: null } },
        _avg: { avgResponseTime: true },
      }),
      prisma.contact.findMany({
        where: { companyId, isArchived: false },
        orderBy: { performanceScore: "desc" },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          performanceScore: true,
          responseRate: true,
          shippingLine: {
            select: { name: true },
          },
        },
      }),
    ]);

    return {
      totalContacts,
      activeContacts,
      primaryContacts,
      doNotContactCount,
      avgPerformanceScore: avgPerformanceScore._avg.performanceScore || 0,
      avgResponseRate: avgResponseRate._avg.responseRate || 0,
      avgResponseTime: avgResponseTime._avg.avgResponseTime || 0,
      topPerformers,
    };
  }
}
