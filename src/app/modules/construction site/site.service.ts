import { SiteStatus } from "@prisma/client";
import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
// import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IJwtPayload } from "../../types/common";

const createSite = async (payload: any) => {
  const newSite = await prisma.site.create({
    data: payload,
  });

  return newSite;
};

const siteInclude = {
  assignments: {
    include: {
      worker: true,
      assignedBy: { select: { id: true, name: true, email: true } },
    },
  },
  attendance: {
    include: {
      worker: true,
    },
  },
};

// Running sites first. Prisma cannot order by an arbitrary enum priority, so the ordering
// is applied here instead of in the query. Within a status group the newest start date wins.
const STATUS_ORDER: Record<SiteStatus, number> = {
  ACTIVE: 0,
  UNDER_MAINTENANCE: 1,
  INACTIVE: 2,
  CLOSED: 3,
};

const sortRunningFirst = <T extends { status: SiteStatus; startDate: Date }>(sites: T[]) =>
  [...sites].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

const getAllSites = async () => {
  const sites = await prisma.site.findMany({
    include: siteInclude,
    orderBy: { createdAt: "desc" },
  });

  return sortRunningFirst(sites);
};

// A Site has no owner column, so a site engineer's sites are derived: the ones they have
// assigned work at or marked attendance for. Same scoping the site engineer dashboard uses.
const getMySites = async (user: IJwtPayload) => {
  const engineer = await prisma.sITE_Engineer.findUnique({
    where: { email: user.email },
  });

  if (!engineer) {
    throw new ApiError(httpStatus.NOT_FOUND, "Engineer not found or invalid token");
  }

  const [assignments, attendance] = await Promise.all([
    prisma.workAssignment.findMany({
      where: { assignedByEngineerId: engineer.id },
      select: { siteId: true },
    }),
    prisma.attendance.findMany({
      where: { siteEngineerId: engineer.id },
      select: { siteId: true },
    }),
  ]);

  const mySiteIds = [
    ...new Set([
      ...assignments.map((a) => a.siteId),
      ...attendance.map((a) => a.siteId),
    ]),
  ];

  const sites = await prisma.site.findMany({
    where: { id: { in: mySiteIds } },
    include: siteInclude,
    orderBy: { createdAt: "desc" },
  });

  return sortRunningFirst(sites);
};


const getSingleSite = async (id: string) => {
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      assignments: true,
    },
  });

  if (!site) {
    throw new ApiError(httpStatus.NOT_FOUND, "Site not found!");
  }

  return site;
};

const updateSite = async (id: string, payload: any) => {
  const site = await prisma.site.update({
    where: { id },
    data: payload,
  });

  return site;
};

const deleteSite = async (id: string) => {
  await prisma.site.delete({
    where: { id },
  });

  return { message: "Site deleted successfully" };
};

export const SiteService = {
  createSite,
  getAllSites,
  getMySites,
  getSingleSite,
  updateSite,
  deleteSite,
};
