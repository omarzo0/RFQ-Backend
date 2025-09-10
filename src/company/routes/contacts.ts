import express from "express";
import { ContactController } from "../controllers/ContactController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { CompanyRequest } from "../types/auth";

const router = express.Router();
const contactController = new ContactController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

// Contact Data (must come before /:id routes)
router.get("/departments", (req, res, next) =>
  contactController.getDepartments(req as CompanyRequest, res, next)
);
router.get("/tags", (req, res, next) =>
  contactController.getTags(req as CompanyRequest, res, next)
);
router.get("/seniority-levels", (req, res, next) =>
  contactController.getSeniorityLevels(req as CompanyRequest, res, next)
);
router.get("/specializations", (req, res, next) =>
  contactController.getSpecializations(req as CompanyRequest, res, next)
);

// Performance Analytics (must come before /:id routes)
router.get("/performance-stats", (req, res, next) =>
  contactController.getPerformanceStats(req as CompanyRequest, res, next)
);

// Bulk Operations (must come before /:id routes)
router.post("/bulk-import", (req, res, next) =>
  contactController.bulkImportContacts(req as CompanyRequest, res, next)
);

// Contact Management
router.get("/", (req, res, next) =>
  contactController.getContacts(req as CompanyRequest, res, next)
);
router.get("/:id", (req, res, next) =>
  contactController.getContactById(req as CompanyRequest, res, next)
);
router.post("/", (req, res, next) =>
  contactController.createContact(req as CompanyRequest, res, next)
);
router.put("/:id", (req, res, next) =>
  contactController.updateContact(req as CompanyRequest, res, next)
);
router.delete("/:id", (req, res, next) =>
  contactController.deleteContact(req as CompanyRequest, res, next)
);

// Contact Status Management
router.put("/:id/status", (req, res, next) =>
  contactController.updateContactStatus(req as CompanyRequest, res, next)
);
router.put("/:id/archive", (req, res, next) =>
  contactController.archiveContact(req as CompanyRequest, res, next)
);
router.put("/:id/restore", (req, res, next) =>
  contactController.restoreContact(req as CompanyRequest, res, next)
);

// Contact Special Actions
router.put("/:id/primary", (req, res, next) =>
  contactController.setPrimaryContact(req as CompanyRequest, res, next)
);
router.put("/:id/do-not-contact", (req, res, next) =>
  contactController.updateDoNotContact(req as CompanyRequest, res, next)
);

export default router;
