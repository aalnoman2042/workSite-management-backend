import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();


router.get(
  "/all",
  auth(UserRole.SITE_ENGINEER, UserRole.CHIEF_ENGINEER),
  PaymentController.getAllWorkerPayments
);

router.post("/worker-pay",auth(UserRole.SITE_ENGINEER), PaymentController.createWorkerPayment);

export const paymentRoutes = router;
