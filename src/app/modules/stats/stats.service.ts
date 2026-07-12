import { AssignmentStatus, AttendanceStatus, PaymentStatus, SiteStatus, WorkerPosition } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";

const TREND_DAYS = 7;

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dayKey = (date: Date | string) => startOfDay(new Date(date)).toISOString().slice(0, 10);

// Oldest first, so the chart reads left to right.
const lastNDays = (days: number) => {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return d;
  });
};

const buildAttendanceTrend = (
  records: { date: Date; status: AttendanceStatus }[],
  days: Date[]
) => {
  return days.map((day) => {
    const key = dayKey(day);
    const onDay = records.filter((record) => dayKey(record.date) === key);

    return {
      date: key,
      present: onDay.filter((record) => record.status === AttendanceStatus.PRESENT).length,
      absent: onDay.filter((record) => record.status === AttendanceStatus.ABSENT).length,
    };
  });
};

// groupBy skips enum values with no rows. Charts need every slice, so fill the gaps with 0.
const fillCounts = <T extends string>(
  values: readonly T[],
  grouped: { _count: { _all: number } }[],
  keyOf: (row: any) => T | null
) => {
  return values.map((value) => ({
    name: value,
    count: grouped.find((row) => keyOf(row) === value)?._count._all ?? 0,
  }));
};

const countByStatus = (assignments: { status: AssignmentStatus }[]) =>
  Object.values(AssignmentStatus).map((status) => ({
    name: status,
    count: assignments.filter((assignment) => assignment.status === status).length,
  }));

const getAdminStats = async () => {
  const [
    totalWorkers,
    approvedWorkers,
    bannedWorkers,
    siteEngineers,
    chiefEngineers,
    totalSites,
    sitesByStatus,
    workersByPosition,
    paymentsByStatus,
    recentWorkers,
  ] = await Promise.all([
    prisma.worker.count({ where: { isDeleted: false } }),
    prisma.worker.count({ where: { isDeleted: false, approved: true } }),
    prisma.worker.count({ where: { isDeleted: false, banned: true } }),
    prisma.sITE_Engineer.count({ where: { isDeleted: false } }),
    prisma.cHIEF_ENGINEER.count({ where: { isDeleted: false } }),
    prisma.site.count(),
    prisma.site.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.worker.groupBy({
      by: ["position"],
      where: { isDeleted: false },
      _count: { _all: true },
    }),
    prisma.workerPayment.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { totalAmountDue: true, amountPaid: true },
    }),
    prisma.worker.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        approved: true,
        profilePhoto: true,
        createdAt: true,
      },
    }),
  ]);

  const due = paymentsByStatus.find((row) => row.status === PaymentStatus.DUE);
  const paid = paymentsByStatus.find((row) => row.status === PaymentStatus.PAID);

  return {
    counts: {
      totalWorkers,
      approvedWorkers,
      pendingWorkers: totalWorkers - approvedWorkers,
      bannedWorkers,
      siteEngineers,
      chiefEngineers,
      totalSites,
      activeSites:
        sitesByStatus.find((row) => row.status === SiteStatus.ACTIVE)?._count._all ?? 0,
    },
    sitesByStatus: fillCounts(Object.values(SiteStatus), sitesByStatus, (row) => row.status),
    workersByPosition: fillCounts(
      Object.values(WorkerPosition),
      workersByPosition,
      (row) => row.position
    ),
    payments: {
      totalDue: due?._sum.totalAmountDue ?? 0,
      dueCount: due?._count._all ?? 0,
      totalPaid: paid?._sum.amountPaid ?? 0,
      paidCount: paid?._count._all ?? 0,
    },
    recentWorkers,
  };
};

const getChiefEngineerStats = async (user: IJwtPayload) => {
  const chiefEngineer = await prisma.cHIEF_ENGINEER.findUnique({
    where: { email: user.email },
  });

  if (!chiefEngineer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chief engineer not found or invalid token");
  }

  const days = lastNDays(TREND_DAYS);

  const [
    totalWorkers,
    approvedWorkers,
    totalSites,
    sitesByStatus,
    assignments,
    trendRecords,
    duePayments,
    pendingWorkers,
  ] = await Promise.all([
    prisma.worker.count({ where: { isDeleted: false } }),
    prisma.worker.count({ where: { isDeleted: false, approved: true } }),
    prisma.site.count(),
    prisma.site.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.workAssignment.findMany({ select: { status: true } }),
    prisma.attendance.findMany({
      where: { date: { gte: days[0] } },
      select: { date: true, status: true },
    }),
    prisma.workerPayment.aggregate({
      where: { status: PaymentStatus.DUE },
      _count: { _all: true },
      _sum: { totalAmountDue: true },
    }),
    prisma.worker.findMany({
      where: { isDeleted: false, approved: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        contactNumber: true,
        profilePhoto: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    counts: {
      totalSites,
      activeSites:
        sitesByStatus.find((row) => row.status === SiteStatus.ACTIVE)?._count._all ?? 0,
      totalWorkers,
      pendingApproval: totalWorkers - approvedWorkers,
      totalAssignments: assignments.length,
      completedAssignments: assignments.filter(
        (assignment) => assignment.status === AssignmentStatus.COMPLETED
      ).length,
    },
    sitesByStatus: fillCounts(Object.values(SiteStatus), sitesByStatus, (row) => row.status),
    assignmentsByStatus: countByStatus(assignments),
    attendanceTrend: buildAttendanceTrend(trendRecords, days),
    payments: {
      totalDue: duePayments._sum.totalAmountDue ?? 0,
      dueCount: duePayments._count._all,
    },
    pendingWorkers,
  };
};

// A Site has no owner column, so "my sites" is derived: the sites this engineer has
// either assigned work at or marked attendance for. Every number below is filtered to
// those sites and the workers on them, so the engineer never sees another engineer's data.
const getSiteEngineerStats = async (user: IJwtPayload) => {
  const engineer = await prisma.sITE_Engineer.findUnique({
    where: { email: user.email },
  });

  if (!engineer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Engineer not found or invalid token");
  }

  const [assignments, markedAttendance] = await Promise.all([
    prisma.workAssignment.findMany({
      where: { assignedByEngineerId: engineer.id },
      include: {
        site: { select: { id: true, name: true, status: true } },
        worker: { select: { id: true, name: true, position: true, profilePhoto: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attendance.findMany({
      where: { siteEngineerId: engineer.id },
      select: { siteId: true, workerId: true },
    }),
  ]);

  const mySiteIds = [
    ...new Set([
      ...assignments.map((assignment) => assignment.siteId),
      ...markedAttendance.map((record) => record.siteId),
    ]),
  ];
  const myWorkerIds = [
    ...new Set([
      ...assignments.map((assignment) => assignment.workerId),
      ...markedAttendance.map((record) => record.workerId),
    ]),
  ];

  const days = lastNDays(TREND_DAYS);
  const today = startOfDay(new Date());

  const [mySites, presentToday, trendRecords, duePayments] = await Promise.all([
    prisma.site.findMany({
      where: { id: { in: mySiteIds } },
      select: { id: true, name: true, location: true, address: true, status: true, startDate: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attendance.count({
      where: {
        siteId: { in: mySiteIds },
        date: today,
        status: AttendanceStatus.PRESENT,
      },
    }),
    prisma.attendance.findMany({
      where: { siteId: { in: mySiteIds }, date: { gte: days[0] } },
      select: { date: true, status: true },
    }),
    prisma.workerPayment.aggregate({
      where: { workerId: { in: myWorkerIds }, status: PaymentStatus.DUE },
      _count: { _all: true },
      _sum: { totalAmountDue: true },
    }),
  ]);

  const workersPerSite = mySites.map((site) => ({
    ...site,
    workerCount: new Set(
      assignments
        .filter((assignment) => assignment.siteId === site.id)
        .map((assignment) => assignment.workerId)
    ).size,
  }));

  return {
    counts: {
      mySites: mySites.length,
      myWorkers: myWorkerIds.length,
      totalAssignments: assignments.length,
      pendingAssignments: assignments.filter(
        (assignment) => assignment.status === AssignmentStatus.PENDING
      ).length,
      completedAssignments: assignments.filter(
        (assignment) => assignment.status === AssignmentStatus.COMPLETED
      ).length,
      presentToday,
    },
    assignmentsByStatus: countByStatus(assignments),
    attendanceTrend: buildAttendanceTrend(trendRecords, days),
    payments: {
      totalDue: duePayments._sum.totalAmountDue ?? 0,
      dueCount: duePayments._count._all,
    },
    mySites: workersPerSite,
    recentAssignments: assignments.slice(0, 5),
  };
};

// Everything here is keyed off the worker resolved from the token, never off a client-supplied id.
const getWorkerStats = async (user: IJwtPayload) => {
  const worker = await prisma.worker.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      name: true,
      email: true,
      position: true,
      dailyRate: true,
      halfDayRate: true,
      companyName: true,
      joiningDate: true,
      approved: true,
      onleave: true,
      profilePhoto: true,
    },
  });

  if (!worker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Worker not found or invalid token");
  }

  const days = lastNDays(TREND_DAYS);
  const now = new Date();
  const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));

  const [assignments, monthAttendance, trendRecords, paymentsByStatus, recentPayments] =
    await Promise.all([
      prisma.workAssignment.findMany({
        where: { workerId: worker.id },
        include: {
          site: { select: { id: true, name: true, location: true, address: true } },
          assignedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.attendance.findMany({
        where: { workerId: worker.id, date: { gte: monthStart } },
        select: { status: true, isHalfDay: true },
      }),
      prisma.attendance.findMany({
        where: { workerId: worker.id, date: { gte: days[0] } },
        select: { date: true, status: true },
      }),
      prisma.workerPayment.groupBy({
        by: ["status"],
        where: { workerId: worker.id },
        _count: { _all: true },
        _sum: { totalAmountDue: true, amountPaid: true },
      }),
      prisma.workerPayment.findMany({
        where: { workerId: worker.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          totalAmountDue: true,
          amountPaid: true,
          status: true,
          startDate: true,
          endDate: true,
          paymentDate: true,
        },
      }),
    ]);

  const due = paymentsByStatus.find((row) => row.status === PaymentStatus.DUE);
  const paid = paymentsByStatus.find((row) => row.status === PaymentStatus.PAID);

  const upcomingAssignments = assignments
    .filter((assignment) => assignment.status === AssignmentStatus.PENDING)
    .sort((a, b) => {
      // Assignments without a due date sink to the bottom.
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  return {
    profile: worker,
    counts: {
      totalAssignments: assignments.length,
      pendingAssignments: assignments.filter(
        (assignment) => assignment.status === AssignmentStatus.PENDING
      ).length,
      completedAssignments: assignments.filter(
        (assignment) => assignment.status === AssignmentStatus.COMPLETED
      ).length,
      presentThisMonth: monthAttendance.filter(
        (record) => record.status === AttendanceStatus.PRESENT
      ).length,
      absentThisMonth: monthAttendance.filter(
        (record) => record.status === AttendanceStatus.ABSENT
      ).length,
      halfDaysThisMonth: monthAttendance.filter((record) => record.isHalfDay).length,
    },
    assignmentsByStatus: countByStatus(assignments),
    attendanceTrend: buildAttendanceTrend(trendRecords, days),
    earnings: {
      totalDue: due?._sum.totalAmountDue ?? 0,
      dueCount: due?._count._all ?? 0,
      totalPaid: paid?._sum.amountPaid ?? 0,
      paidCount: paid?._count._all ?? 0,
    },
    upcomingAssignments,
    recentPayments,
  };
};

export const StatsService = {
  getAdminStats,
  getChiefEngineerStats,
  getSiteEngineerStats,
  getWorkerStats,
};