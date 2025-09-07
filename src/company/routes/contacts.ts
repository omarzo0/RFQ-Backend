import express from "express";
import { ContactController } from "../controllers/ContactController";
import { authenticateCompanyUser } from "../middleware/companyAuth";

const router = express.Router();
const contactController = new ContactController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

// Contact Management
router.get("/", contactController.getContacts.bind(contactController));
router.get("/:id", contactController.getContactById.bind(contactController));
router.post("/", contactController.createContact.bind(contactController));
router.put("/:id", contactController.updateContact.bind(contactController));
router.delete("/:id", contactController.deleteContact.bind(contactController));

// Contact Status Management
router.put(
  "/:id/status",
  contactController.updateContactStatus.bind(contactController)
);
router.put(
  "/:id/archive",
  contactController.archiveContact.bind(contactController)
);
router.put(
  "/:id/restore",
  contactController.restoreContact.bind(contactController)
);

// Contact Special Actions
router.put(
  "/:id/primary",
  contactController.setPrimaryContact.bind(contactController)
);
router.put(
  "/:id/do-not-contact",
  contactController.updateDoNotContact.bind(contactController)
);

// Contact Data
router.get(
  "/departments",
  contactController.getDepartments.bind(contactController)
);
router.get("/tags", contactController.getTags.bind(contactController));
router.get(
  "/seniority-levels",
  contactController.getSeniorityLevels.bind(contactController)
);
router.get(
  "/specializations",
  contactController.getSpecializations.bind(contactController)
);

// Bulk Operations
router.post(
  "/bulk-import",
  contactController.bulkImportContacts.bind(contactController)
);

// Performance Analytics
router.get(
  "/performance-stats",
  contactController.getPerformanceStats.bind(contactController)
);

export default router;
