import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
// import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const createSite = async (payload: any) => {
  const newSite = await prisma.site.create({
    data: payload,
  });

  return newSite;
};

const getAllSites = async () => {
  return await prisma.site.findMany({
    include: {
      assignments: {
        include: {
          worker: true,       // এখানে worker object include করছো
        },
      },
      attendance: {
        include: {
          worker: true,       // attendance এর worker object include
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
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
  getSingleSite,
  updateSite,
  deleteSite,
};
