import { Router } from "express";
import companyAuthRoutes from "./companyAuth";
import companyRoutes from "./company";
import contactsRoutes from "./contacts";
// import emailsRoutes from "./emails";
// import quotesRoutes from "./quotes";
import rfqsRoutes from "./rfqs";
import shippingLinesRoutes from "./shipping-lines";
import templatesRoutes from "./templates";
import usersRoutes from "./users";
// import analyticsRoutes from "./analytics";
// import replyIngestionRoutes from "./reply-ingestion";
// import ticketsRoutes from "./tickets";

const router = Router();

// Company authentication routes
router.use("/auth", companyAuthRoutes);

// Company management routes
router.use("/", companyRoutes);

// Company business routes - temporarily disabled due to TypeScript errors
router.use("/contacts", contactsRoutes);
// router.use("/tickets", ticketsRoutes);
// router.use("/emails", emailsRoutes);
// router.use("/quotes", quotesRoutes);
router.use("/rfqs", rfqsRoutes);
router.use("/shipping-lines", shippingLinesRoutes);
router.use("/templates", templatesRoutes);
router.use("/users", usersRoutes);
// router.use("/analytics", analyticsRoutes);
// router.use("/reply-ingestion", replyIngestionRoutes);

export default router;
