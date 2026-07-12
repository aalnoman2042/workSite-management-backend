import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();


router.get(
  "/all",
  auth(UserRole.ADMIN, UserRole.SITE_ENGINEER, UserRole.CHIEF_ENGINEER),
  PaymentController.getAllWorkerPayments
);

// A worker's own payment records, scoped from the token.
router.get("/my-payments", auth(UserRole.WORKER), PaymentController.getMyWorkerPayments);


router.post("/worker-pay",auth(UserRole.SITE_ENGINEER), PaymentController.createWorkerPayment);

export const paymentRoutes = router;
