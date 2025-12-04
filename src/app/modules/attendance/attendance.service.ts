import { AttendanceStatus, Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";


/** Normalize Date → YYYY-MM-DD only */
const normalizeDate = (date: string) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};


/* ========================================================
   1) Mark Single Worker Attendance
======================================================== */
const markSingleAttendance = async (
  { workerId, siteId, date, status }: { workerId: string; siteId: string; date: string; status: AttendanceStatus },
  siteEngineer: IJwtPayload
) => {
  const ISODate = normalizeDate(date);

  // Find engineer
  const engineer = await prisma.sITE_Engineer.findUnique({
    where: { email: siteEngineer.email },
  });

  if (!engineer) throw new Error("Invalid site engineer");

  // Remove previous attendance for this worker same date
  await prisma.attendance.deleteMany({
    where: { workerId, siteId, date: ISODate },
  });

  // Create new attendance
  const attendance = await prisma.attendance.create({
    data: {
      workerId,
      siteId,
      date: ISODate,
      status,
      siteEngineerId: engineer.id,
    },
  });

  return attendance;
};


/* ========================================================
   2) TODAY’S ATTENDANCE (by Site)
======================================================== */
const getTodayAttendance = async (siteId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findMany({
    where: { siteId, date: today },
    include: { worker: true },
  });

  return attendance;
};


/* ========================================================
   3) SPECIFIC DAY ATTENDANCE (by Site)
======================================================== */
const getDayAttendance = async (siteId: string, date: string) => {
  const ISODate = normalizeDate(date);

  return prisma.attendance.findMany({
    where: { siteId, date: ISODate },
    include: { worker: true },
  });
};


/* ========================================================
   4) WEEKLY ATTENDANCE (Last 7 Days)
======================================================== */
const getWeeklyAttendance = async (workerId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize today
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 6); // last 7 days including today

  // Fetch all attendance for last 7 days
  const records = await prisma.attendance.findMany({
    where: {
      workerId,
      date: { gte: lastWeek, lte: today },
    },
    orderBy: { date: "asc" },
  });

  // Count total present days
  const totalPresent = records.filter(r => r.status === "PRESENT").length;

  return {
    totalPresent,
    records,
  };
};



/* ========================================================
   5) MONTHLY ATTENDANCE
======================================================== */
const getMonthlyAttendance = async (workerId: string, month: number, year: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Fetch all attendance for that month
  const records = await prisma.attendance.findMany({
    where: {
      workerId,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: "asc" },
  });

  // Count total present days
  const totalPresent = records.filter(r => r.status === "PRESENT").length;

  return {
    totalPresent,
    records,
  };
};


/* ========================================================
   6) PAGINATION + SORTING
======================================================== */
const getPaginatedAttendance = async ({
  siteId,
  date,
  page = 1,
  limit = 10,
  sort = "asc",
}: {
  siteId: string;
  date: string;
  page: number;
  limit: number;
  sort: string;
}) => {
  const ISODate = normalizeDate(date);

  const skip = (page - 1) * limit;

  const attendance = await prisma.attendance.findMany({
    where: { siteId, date: ISODate },
    skip,
    take: limit,
    orderBy: { status: sort as "asc" | "desc" },
    include: { worker: true },
  });

  const total = await prisma.attendance.count({
    where: { siteId, date: ISODate },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: attendance,
  };
};


export const attendanceService = {
  markSingleAttendance,
  getTodayAttendance,
  getDayAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
  getPaginatedAttendance,
};
