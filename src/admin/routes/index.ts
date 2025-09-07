import { Router } from "express";
import adminAuthRoutes from "./adminAuth";
import adminCompanyRoutes from "./adminCompany";
import authRoutes from "./auth";

const router = Router();

// Admin authentication routes
router.use("/auth", adminAuthRoutes);
router.use("/auth", authRoutes);

// Admin company management routes
router.use("/companies", adminCompanyRoutes);

export default router;
