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
    const { workerId, startDate, endDate } = req.body;

    // 🔥 1. Validate required fields
    if (!workerId || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing workerId, startDate or endDate" });
    }

    // 🔥 2. Logged-in user extracted from JWT
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ error: "Unauthorized or missing user info" });
    }

    // 🔥 3. Find engineer who is paying
    const paidByEngineer = await prisma.sITE_Engineer.findUnique({
      where: { email }
    });

    if (!paidByEngineer) {
      return res.status(404).json({ error: "Engineer not found" });
    }

    const paidByEngineerId = paidByEngineer.id;

    // 🔥 4. Call PaymentService
    const { checkoutUrl, totalAmountDue, totalDays } =
      await PaymentService.createWorkerPayment({
        workerId,
        startDate,
        endDate,
        paidByEngineerId,
      });

    // 🔥 5. Send Response
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Worker payment session created. Total due: ${totalAmountDue} for ${totalDays} days.`,
      data: { checkoutUrl, totalAmountDue, totalDays },
    });
  }
);

export const PaymentController = {
  handleStripeWebhookEvent,
  createWorkerPayment
};
