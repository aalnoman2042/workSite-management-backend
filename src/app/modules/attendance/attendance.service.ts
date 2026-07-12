import { AttendanceStatus, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";
import { BulkAttendanceInput, DayAttendanceInput } from "./attendance.types";
import { paginationHelper } from "../../helper/paginationHelper";


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




const markBulkAttendance = async (attendance: DayAttendanceInput, siteEngineer: IJwtPayload) => {
  const { siteId, date, presentWorkers = [], absentWorkers = [] } = attendance;

  if (!siteId || !date) throw new Error("siteId and date are required");

  // Fetch SiteEngineer ID
  const engineer = await prisma.sITE_Engineer.findUnique({
    where: { email: siteEngineer.email },
  });
  if (!engineer) throw new Error("Site engineer not found");

  const ISODate = new Date(date);

  // Remove previous attendance for that site & date
  await prisma.attendance.deleteMany({ where: { siteId, date: ISODate } });

  // Prepare data
  const records = [
    ...presentWorkers.map(id => ({
      workerId: id,
      siteId,
      siteEngineerId: engineer.id,
      date: ISODate,
      status: "PRESENT" as const,
    })),
    ...absentWorkers.map(id => ({
      workerId: id,
      siteId,
      siteEngineerId: engineer.id,
      date: ISODate,
      status: "ABSENT" as const,
    })),
  ];

  // Insert attendance
  const result = await prisma.attendance.createMany({ data: records });
    return {
    presentCount: presentWorkers.length,
    absentCount: absentWorkers.length,
    totalInserted: result.count,
  };
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
const getAllAttendance = async (filters: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);


  const { searchTerm, siteName, date, status, ispaid, ...otherFilters } = filters;

  const statusNNormalized = status ? status.toUpperCase() as AttendanceStatus : undefined;

  const andConditions: Prisma.AttendanceWhereInput[] = [];

  // 🔍 Search by worker name/email
  if (searchTerm) {
    andConditions.push({
      OR: [
      { worker: { name: { contains: searchTerm, mode: "insensitive" } } },
      { worker: { email: { contains: searchTerm, mode: "insensitive" } } },
      { site: { name: { contains: searchTerm, mode: "insensitive" } } },
    ],
    });
  }

  // 🏗 Filter attendance by SITE NAME (JOIN with Site table)
  if (siteName) {
    andConditions.push({
      site: {
        name: {
          contains: siteName,
          mode: "insensitive",
        },
      },
    });
  }

  // 📅 Filter by date
  if (date) {
    andConditions.push({
      date: normalizeDate(date),
    });
  }

  //  Filter by status (present/absent/half-day)
  if (status) {
    andConditions.push({
      status: statusNNormalized,
    });
  }

  // 💰 Filter by paid / unpaid. It arrives from the query string as "true"/"false",
  // and Prisma needs a real boolean here or it throws a validation error.
  if (ispaid !== undefined && ispaid !== "") {
    andConditions.push({
      ispaid: ispaid === true || ispaid === "true",
    });
  }

  // Additional filters if needed
  Object.keys(otherFilters).forEach((key) => {
    andConditions.push({
      [key]: otherFilters[key],
    });
  });

  // Final where condition
  const whereCondition =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        worker: true,
        site: true, // ⭐ site join needed for siteName search
      },
    }),

    prisma.attendance.count({
      where: whereCondition,
    }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: records,
  };
};


/* ========================================================
   7) A WORKER'S OWN ATTENDANCE
======================================================== */
// The worker is resolved from the token, and workerId is forced onto the filters after
// the caller's own filters are spread in — so a worker cannot read anyone else's records
// by passing ?workerId=<someone-else>.
const getMyAttendance = async (user: IJwtPayload, filters: any, options: any) => {
  const worker = await prisma.worker.findUnique({
    where: { email: user.email },
    select: { id: true },
  });

  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Worker not found or invalid token");
  }

  return getAllAttendance({ ...filters, workerId: worker.id }, options);
};

export const attendanceService = {
  markSingleAttendance,
  markBulkAttendance,
  getTodayAttendance,
  getDayAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
getAllAttendance,
  getMyAttendance,
};
