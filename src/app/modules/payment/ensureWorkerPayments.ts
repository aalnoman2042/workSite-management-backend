import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";
import { calculateWorkerDue } from "../../helper/calculateWorkerDue";

export const ensureDueWorkerPayments = async () => {

  // 1️⃣ unpaid attendance
  const unpaidAttendances = await prisma.attendance.findMany({
    where: {
      ispaid: false,
      status: "PRESENT",
    },
    select: {
      workerId: true,
    },
  });

  const uniqueWorkerIds = [
    ...new Set(unpaidAttendances.map(a => a.workerId)),
  ];

  for (const workerId of uniqueWorkerIds) {

    // 2️⃣ already has DUE payment?
    const existingDue = await prisma.workerPayment.findFirst({
      where: {
        workerId,
        status: PaymentStatus.DUE,
      },
    });

    if (existingDue) continue;

    // 3️⃣ calculate total due (ALL unpaid)
    const { totalAmountDue } = await calculateWorkerDue(workerId);

    if (totalAmountDue <= 0) continue;

    // 4️⃣ create DUE payment
    await prisma.workerPayment.create({
      data: {
        workerId,
        totalAmountDue,
        status: PaymentStatus.DUE,
      },
    });
  }
};
