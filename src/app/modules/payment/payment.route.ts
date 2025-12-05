import express from "express";
import { PaymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * @route POST /payment/create
 * @desc Create a worker payment and return Stripe checkout URL
 * @body { workerId, startDate, endDate, paidByEngineerId }
 */
router.post("/worker-pay",auth(UserRole.SITE_ENGINEER), PaymentController.createWorkerPayment);

export const paymentRoutes = router;
