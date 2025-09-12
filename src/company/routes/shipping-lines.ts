import express from "express";
import { ShippingLineController } from "../controllers/ShippingLineController";
import { authenticateCompanyUser } from "../middleware/companyAuth";
import { CompanyRequest } from "../types/auth";

const router = express.Router();
const shippingLineController = new ShippingLineController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

// Shipping Line Data (must come before /:id routes)
router.get("/trade-lanes", (req, res, next) =>
  shippingLineController.getTradeLanes(req as unknown as CompanyRequest, res, next)
);
router.get("/services", (req, res, next) =>
  shippingLineController.getServices(req as unknown as CompanyRequest, res, next)
);
router.get("/tags", (req, res, next) =>
  shippingLineController.getTags(req as unknown as CompanyRequest, res, next)
);

// Bulk Operations (must come before /:id routes)
router.post("/bulk-import", (req, res, next) =>
  shippingLineController.bulkImportShippingLines(
    req as unknown as CompanyRequest,
    res,
    next
  )
);

// Shipping Line Management
router.get("/", (req, res, next) =>
  shippingLineController.getShippingLines(req as unknown as CompanyRequest, res, next)
);
router.get("/:id", (req, res, next) =>
  shippingLineController.getShippingLineById(req as unknown as CompanyRequest, res, next)
);
router.post("/", (req, res, next) =>
  shippingLineController.createShippingLine(req as unknown as CompanyRequest, res, next)
);
router.put("/:id", (req, res, next) =>
  shippingLineController.updateShippingLine(req as unknown as CompanyRequest, res, next)
);
router.delete("/:id", (req, res, next) =>
  shippingLineController.deleteShippingLine(req as unknown as CompanyRequest, res, next)
);

// Shipping Line Status Management
router.put("/:id/status", (req, res, next) =>
  shippingLineController.updateShippingLineStatus(
    req as unknown as CompanyRequest,
    res,
    next
  )
);
router.put("/:id/archive", (req, res, next) =>
  shippingLineController.archiveShippingLine(req as unknown as CompanyRequest, res, next)
);
router.put("/:id/restore", (req, res, next) =>
  shippingLineController.restoreShippingLine(req as unknown as CompanyRequest, res, next)
);

export default router;
