import express from "express";
import { TemplateController } from "../controllers/TemplateController";
import { authenticate } from "../middleware/auth";

const router = express.Router();
const templateController = new TemplateController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Template Management
router.get("/", (req, res, next) =>
  templateController.getTemplates(req, res, next)
);
router.get("/:id", (req, res, next) =>
  templateController.getTemplateById(req, res, next)
);
router.post("/", (req, res, next) =>
  templateController.createTemplate(req, res, next)
);
router.put("/:id", (req, res, next) =>
  templateController.updateTemplate(req, res, next)
);
router.delete("/:id", (req, res, next) =>
  templateController.deleteTemplate(req, res, next)
);

// Template Operations
router.post("/:id/duplicate", (req, res, next) =>
  templateController.duplicateTemplate(req, res, next)
);
router.post("/:id/use", (req, res, next) =>
  templateController.useTemplate(req, res, next)
);
router.post("/from-rfq/:rfqId", (req, res, next) =>
  templateController.createTemplateFromRFQ(req, res, next)
);

// Template Management
router.put("/:id/status", (req, res, next) =>
  templateController.updateTemplateStatus(req, res, next)
);
router.put("/:id/default", (req, res, next) =>
  templateController.setDefaultTemplate(req, res, next)
);

// Template Data
router.get("/categories", (req, res, next) =>
  templateController.getTemplateCategories(req, res, next)
);
router.get("/languages", (req, res, next) =>
  templateController.getTemplateLanguages(req, res, next)
);
router.get("/tags", (req, res, next) =>
  templateController.getTemplateTags(req, res, next)
);
router.get("/trade-lanes", (req, res, next) =>
  templateController.getTemplateTradeLanes(req, res, next)
);

// Template Analytics
router.get("/analytics", (req, res, next) =>
  templateController.getTemplateAnalytics(req, res, next)
);

// Public Templates
router.get("/public", (req, res, next) =>
  templateController.getPublicTemplates(req, res, next)
);
router.post("/:id/import", (req, res, next) =>
  templateController.importPublicTemplate(req, res, next)
);

// Template Variables
router.get("/:id/variables", (req, res, next) =>
  templateController.getTemplateVariables(req, res, next)
);

// Bulk Operations
router.post("/bulk-import", (req, res, next) =>
  templateController.bulkImportTemplates(req, res, next)
);

export default router;

