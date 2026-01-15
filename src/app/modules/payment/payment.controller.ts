import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";
import { stripe } from "../../helper/stripe";
import config from "../../../config";
import { IJwtPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
  console.log("web hook hit");
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = config.webhookSecretKey as string;

  

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Invalid webhook signature:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const result = await PaymentService.handleStripeWebhookEvent(event);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Webhook processed successfully",
    data: result,
  });
});



const createWorkerPayment = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {

    // 🔥 1. paymentId from body
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "paymentId is required",
      });
    }

    // 🔥 2. Logged-in user (JWT)
    const email = req.user?.email;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔥 3. Find engineer (payer)
    const paidByEngineer = await prisma.sITE_Engineer.findUnique({
      where: { email },
    });

    if (!paidByEngineer) {
      return res.status(404).json({
        success: false,
        message: "Engineer not found",
      });
    }

    // 🔥 4. Create Stripe checkout for EXISTING payment
    const { checkoutUrl, totalAmountDue } =
      await PaymentService.createWorkerPaymentCheckout({
        paymentId,
        paidByEngineerId: paidByEngineer.id,
      });

    // 🔥 5. Response
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Worker payment checkout session created successfully",
      data: {
        checkoutUrl,
        totalAmountDue,
      },
    });
  }
);

const getAllWorkerPayments = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    // Optional query param: status
    const { status } = req.query;

    const payments = await PaymentService.getAllWorkerPayments(status as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Worker payments fetched successfully",
      data: payments,
    });
  }
);

export const PaymentController = {
  handleStripeWebhookEvent,
  createWorkerPayment,
  getAllWorkerPayments
};
