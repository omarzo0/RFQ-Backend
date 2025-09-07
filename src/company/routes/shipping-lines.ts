import express from "express";
import { ShippingLineController } from "../controllers/ShippingLineController";
import { authenticateCompanyUser } from "../middleware/companyAuth";

const router = express.Router();
const shippingLineController = new ShippingLineController();

// Apply authentication middleware to all routes
router.use(authenticateCompanyUser);

// Shipping Line Management
router.get(
  "/",
  shippingLineController.getShippingLines.bind(shippingLineController)
);
router.get(
  "/:id",
  shippingLineController.getShippingLineById.bind(shippingLineController)
);
router.post(
  "/",
  shippingLineController.createShippingLine.bind(shippingLineController)
);
router.put(
  "/:id",
  shippingLineController.updateShippingLine.bind(shippingLineController)
);
router.delete(
  "/:id",
  shippingLineController.deleteShippingLine.bind(shippingLineController)
);

// Shipping Line Status Management
router.put(
  "/:id/status",
  shippingLineController.updateShippingLineStatus.bind(shippingLineController)
);
router.put(
  "/:id/archive",
  shippingLineController.archiveShippingLine.bind(shippingLineController)
);
router.put(
  "/:id/restore",
  shippingLineController.restoreShippingLine.bind(shippingLineController)
);

// Shipping Line Data
router.get(
  "/trade-lanes",
  shippingLineController.getTradeLanes.bind(shippingLineController)
);
router.get(
  "/services",
  shippingLineController.getServices.bind(shippingLineController)
);
router.get(
  "/tags",
  shippingLineController.getTags.bind(shippingLineController)
);

// Bulk Operations
router.post(
  "/bulk-import",
  shippingLineController.bulkImportShippingLines.bind(shippingLineController)
);

export default router;

