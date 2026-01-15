import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";
import { stripe } from "../../helper/stripe";
import { calculateWorkerDue } from "../../helper/calculateWorkerDue";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {

    case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;

  const workerPaymentId = session.metadata?.workerPaymentId;
  if (!workerPaymentId) return;

  const payment = await prisma.workerPayment.findUnique({
    where: { id: workerPaymentId },
  });

  if (!payment) return;

  // ✅ 1️⃣ Payment PAID
  await prisma.workerPayment.update({
    where: { id: workerPaymentId },
    data: {
      status: PaymentStatus.PAID,
      amountPaid: (session.amount_total ?? 0) / 100,
      paymentDate: new Date(),
    },
  });

  // ✅ 2️⃣ Attendance paid
  await prisma.attendance.updateMany({
     where: { id: { in: payment.attendanceIds.map(a => String(a)) } },
    data: {
      ispaid: true,
    },
  });

  break;
}


    default:
      console.log(`Unhandled event: ${event.type}`);
  }
};




const createWorkerPaymentCheckout = async ({
  paymentId,
  paidByEngineerId,
}: {
  paymentId: string;
  paidByEngineerId: string;
}) => {

  const payment = await prisma.workerPayment.findUnique({
    where: { id: paymentId },
    include: { worker: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === PaymentStatus.PAID) {
    throw new Error("Payment already completed");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Payment for Worker ${payment.worker.name}`,
          },
          unit_amount: Math.round(payment.totalAmountDue * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      workerPaymentId: payment.id,
      payerId: paidByEngineerId,
    },
    success_url: "https://abdullah-al-noman.vercel.app/",
    cancel_url: "https://gari-lagbe-frontend.vercel.app/",
  });

  // ✅ Update existing payment
  await prisma.workerPayment.update({
    where: { id: paymentId },
    data: {
      paidByEngineerId,
      // stripeSessionId: session.id,
      status: PaymentStatus.PENDING,
    },
  });

  return {
    checkoutUrl: session.url,
    totalAmountDue: payment.totalAmountDue,
  };
};



const getAllWorkerPayments = async (status?: string) => {
  // 1️⃣ Find all workers who have unpaid attendance
  const unpaidAttendances = await prisma.attendance.findMany({
    where: { status: "PRESENT", ispaid: false },
    select: {
      id: true,
      workerId: true,
      isHalfDay: true,
      worker: { select: { dailyRate: true, halfDayRate: true } },
    },
  });

  // 2️⃣ Group by worker
  const workerMap: Record<string, { totalAmount: number; attendanceIds: string[] }> = {};
  for (const att of unpaidAttendances) {
    const dailyRate = att.worker?.dailyRate ?? 0;
    const halfDayRate = att.worker?.halfDayRate ?? dailyRate / 2;

    if (!workerMap[att.workerId]) workerMap[att.workerId] = { totalAmount: 0, attendanceIds: [] };

    workerMap[att.workerId].attendanceIds.push(att.id);
    workerMap[att.workerId].totalAmount += att.isHalfDay ? halfDayRate : dailyRate;
  }

  const now = new Date();
  const workerIds = Object.keys(workerMap);

  // 3️⃣ Find all existing DUE payments for these workers
  const existingDuePayments = await prisma.workerPayment.findMany({
    where: { workerId: { in: workerIds }, status: PaymentStatus.DUE },
    select: { workerId: true },
  });

  // 4️⃣ Create DUE payment if not exists
  for (const workerId of workerIds) {
    if (workerMap[workerId].totalAmount <= 0) continue;

    const alreadyExists = existingDuePayments.some(p => p.workerId === workerId);
    if (alreadyExists) continue;

    await prisma.workerPayment.create({
      data: {
        workerId,
        totalAmountDue: workerMap[workerId].totalAmount,
        status: PaymentStatus.DUE,
        startDate: now,
        endDate: now,
    attendanceIds: workerMap[workerId].attendanceIds.map(a => String(a))
      },
    });
  }

  // 5️⃣ Fetch payments
  let payments;
  if (status) {
    payments = await prisma.workerPayment.findMany({
      where: { status: status.toUpperCase() as PaymentStatus },
      include: { worker: true, paidBy: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    payments = await prisma.workerPayment.findMany({
      include: { worker: true, paidBy: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return payments;
};
  


export const PaymentService = {
  handleStripeWebhookEvent,
  createWorkerPaymentCheckout,
  getAllWorkerPayments
};
