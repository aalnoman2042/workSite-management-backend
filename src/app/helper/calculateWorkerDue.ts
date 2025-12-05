import { prisma } from "../shared/prisma";

export const calculateWorkerDue = async (workerId: string, startDate: string, endDate: string) => {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId }
  });

  if (!worker?.dailyRate) {
    throw new Error("Worker rate missing");
  }

  const attendance = await prisma.attendance.findMany({
    where: {
      workerId,
      ispaid: false,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      status: "PRESENT"
    }
  });

  const totalDays = attendance.length;
  const totalAmountDue = totalDays * worker.dailyRate;

  // Extract attendance IDs
  const attendanceIds = attendance.map(a => a.id);

  return { totalDays, totalAmountDue, attendanceIds };
};
