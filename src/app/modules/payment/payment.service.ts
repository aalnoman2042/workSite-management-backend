import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";
import { stripe } from "../../helper/stripe";
import { calculateWorkerDue } from "../../helper/calculateWorkerDue";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {

  switch (event.type) {

    case "checkout.session.completed": {
  const session = event.data.object as any;

  const workerPaymentId = session.metadata?.workerPaymentId;
  const payerId = session.metadata?.payerId;
  const attendanceIds = JSON.parse(session.metadata.attendanceIds || "[]");

  if (!workerPaymentId) {
    console.error("❌ No workerPaymentId in metadata");
    return;
  }

  const amountPaid = session.amount_total / 100;

  // 1️⃣ Update WorkerPayment
  const updatedPayment = await prisma.workerPayment.update({
    where: { id: workerPaymentId },
    data: {
      amountPaid,
      status: PaymentStatus.PAID,
      paymentDate: new Date(),
      paidByEngineerId: payerId,
    },
  });

  // 2️⃣ Update Attendance
  if (attendanceIds.length > 0) {
    await prisma.attendance.updateMany({
      where: { id: { in: attendanceIds } },
      data: { ispaid: true },
    });
  }

  return updatedPayment;
}


    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};




const createWorkerPayment = async ({ workerId , paidByEngineerId, startDate, endDate }:{workerId: string , paidByEngineerId : string, startDate : string, endDate: string} ) => {
  const { totalAmountDue, totalDays, attendanceIds } = await calculateWorkerDue(workerId, startDate, endDate);

  const payment = await prisma.workerPayment.create({
    data: {
      workerId,
      paidByEngineerId,
      startDate: new Date(startDate),   // ✅ FIXED
      endDate: new Date(endDate), 
      totalAmountDue,
      status: PaymentStatus.PENDING
    }
  });

  const workerDetails=await prisma.worker.findUnique({
    where:{id: workerId}
  })

  const session = await stripe.checkout.sessions.create({
  mode: "payment",
  line_items: [
    {
      price_data: {
        currency: "bdt",
        product_data: { name: `Payment for Worker ${workerDetails?.name}` },
        unit_amount: Math.round(totalAmountDue * 100),
      },
      quantity: 1,
    },
  ],
  metadata: {
    workerPaymentId: payment.id,     // ✅ must match webhook
    payerId: paidByEngineerId,       // ✅ pass the engineer ID here
    attendanceIds: JSON.stringify(attendanceIds), // ✅ optional to update attendance
  },
  success_url: "https://abdullah-al-noman.vercel.app/",
  cancel_url: "https://gari-lagbe-frontend.vercel.app/",
});


return {
  checkoutUrl: session.url,
  totalAmountDue,
  totalDays
  
};

};


const getAllWorkerPayments = async (status?: string) => {
  const where: any = {};


  if (status) {
    where.status = status.toUpperCase(); // DUE | PENDING | PAID | FAILED
  }

  const payments = await prisma.workerPayment.findMany({
    where,
    include: {
      worker: true,
      paidBy: true, // assuming paidBy relation to SITE_Engineer
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};



export const PaymentService = {
  handleStripeWebhookEvent,
  createWorkerPayment,
  getAllWorkerPayments
};
