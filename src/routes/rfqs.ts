import express from "express";
import { RFQController } from "../controllers/RFQController";
import { authenticate } from "../middleware/auth";

const router = express.Router();
const rfqController = new RFQController();

// Apply authentication middleware to all routes
router.use(authenticate);

// RFQ Management
router.get("/", (req, res, next) => rfqController.getRFQs(req, res, next));
router.get("/:id", (req, res, next) =>
  rfqController.getRFQById(req, res, next)
);
router.post("/", (req, res, next) => rfqController.createRFQ(req, res, next));
router.put("/:id", (req, res, next) => rfqController.updateRFQ(req, res, next));
router.delete("/:id", (req, res, next) =>
  rfqController.deleteRFQ(req, res, next)
);

// RFQ Status Management
router.put("/:id/status", (req, res, next) =>
  rfqController.updateRFQStatus(req, res, next)
);
router.put("/:id/close", (req, res, next) =>
  rfqController.closeRFQ(req, res, next)
);
router.put("/:id/award", (req, res, next) =>
  rfqController.awardRFQ(req, res, next)
);

// RFQ Operations
router.post("/:id/send", (req, res, next) =>
  rfqController.sendRFQ(req, res, next)
);
router.get("/:id/recipients", (req, res, next) =>
  rfqController.getRFQRecipients(req, res, next)
);
router.get("/:id/quotes", (req, res, next) =>
  rfqController.getRFQQuotes(req, res, next)
);

// RFQ Analytics
router.get("/analytics", (req, res, next) =>
  rfqController.getRFQAnalytics(req, res, next)
);

// RFQ Data
router.get("/trade-lanes", (req, res, next) =>
  rfqController.getTradeLanes(req, res, next)
);
router.get("/tags", (req, res, next) => rfqController.getTags(req, res, next));

// RFQ Templates
router.get("/templates", (req, res, next) =>
  rfqController.getRFQTemplates(req, res, next)
);
router.post("/templates", (req, res, next) =>
  rfqController.createRFQTemplate(req, res, next)
);

// RFQ Utilities
router.post("/duplicate/:id", (req, res, next) =>
  rfqController.duplicateRFQ(req, res, next)
);

export default router;
