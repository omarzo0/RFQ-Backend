import { Response, NextFunction } from "express";
import { ContactService } from "../services/ContactService";
import { successResponse } from "../utils/response";
import { AuthenticatedRequest } from "../types/auth";

export class ContactController {
  private contactService = new ContactService();

  /**
   * GET /api/v1/contacts
   */
  async getContacts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        shippingLineId,
        department,
        tag,
        seniority,
        specialization,
        isPrimary,
        doNotContact,
      } = (req as any).query;
      const companyId = req.user.companyId!;

      const contacts = await this.contactService.getContacts(companyId, {
        page: Number(page),
        limit: Number(limit),
        search,
        status,
        shippingLineId,
        department,
        tag,
        seniority,
        specialization,
        isPrimary: isPrimary === "true",
        doNotContact: doNotContact === "true",
      });

      successResponse(res, contacts, "Contacts retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/contacts/:id
   */
  async getContactById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const contact = await this.contactService.getContactById(id, companyId);

      successResponse(res, contact, "Contact retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/contacts
   */
  async createContact(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const contactData = req.body;

      const contact = await this.contactService.createContact(
        companyId,
        createdBy,
        contactData
      );

      successResponse(res, contact, "Contact created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/contacts/:id
   */
  async updateContact(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const contactData = req.body;

      const contact = await this.contactService.updateContact(
        id,
        companyId,
        contactData
      );

      successResponse(res, contact, "Contact updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/contacts/:id
   */
  async deleteContact(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      await this.contactService.deleteContact(id, companyId);

      successResponse(res, null, "Contact deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/contacts/:id/status
   */
  async updateContactStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { isActive } = req.body;

      const contact = await this.contactService.updateContactStatus(
        id,
        companyId,
        isActive
      );

      successResponse(res, contact, "Contact status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/contacts/:id/archive
   */
  async archiveContact(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const contact = await this.contactService.archiveContact(id, companyId);

      successResponse(res, contact, "Contact archived successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/contacts/:id/restore
   */
  async restoreContact(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const contact = await this.contactService.restoreContact(id, companyId);

      successResponse(res, contact, "Contact restored successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/contacts/:id/primary
   */
  async setPrimaryContact(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;

      const contact = await this.contactService.setPrimaryContact(
        id,
        companyId
      );

      successResponse(res, contact, "Primary contact set successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/contacts/:id/do-not-contact
   */
  async updateDoNotContact(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = (req as any).params;
      const companyId = req.user.companyId!;
      const { doNotContact } = req.body;

      const contact = await this.contactService.updateDoNotContact(
        id,
        companyId,
        doNotContact
      );

      successResponse(
        res,
        contact,
        "Do not contact status updated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/contacts/departments
   */
  async getDepartments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const departments = await this.contactService.getDepartments(companyId);

      successResponse(res, departments, "Departments retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/contacts/tags
   */
  async getTags(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const tags = await this.contactService.getTags(companyId);

      successResponse(res, tags, "Tags retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/contacts/seniority-levels
   */
  async getSeniorityLevels(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const seniorityLevels = await this.contactService.getSeniorityLevels(
        companyId
      );

      successResponse(
        res,
        seniorityLevels,
        "Seniority levels retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/contacts/specializations
   */
  async getSpecializations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const specializations = await this.contactService.getSpecializations(
        companyId
      );

      successResponse(
        res,
        specializations,
        "Specializations retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/contacts/bulk-import
   */
  async bulkImportContacts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;
      const createdBy = req.user.id;
      const { contacts } = req.body;

      const result = await this.contactService.bulkImportContacts(
        companyId,
        createdBy,
        contacts
      );

      successResponse(res, result, "Contacts imported successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/contacts/performance-stats
   */
  async getPerformanceStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user.companyId!;

      const stats = await this.contactService.getPerformanceStats(companyId);

      successResponse(res, stats, "Performance stats retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
