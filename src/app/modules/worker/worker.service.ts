import { Prisma } from "@prisma/client";
import { IOPtions, paginationHelper } from "../../helper/paginationHelper";
import pick from "../../helper/pick";
import { prisma } from "../../shared/prisma";
import { workerFilterableFields, workerSearchableFields } from "./worker.constant";

const createWorker = async (payload: any) => {
    return prisma.worker.create({ data: payload });
};

 const getAllWorkers = async (filters: any, options: any) => {
  // Pagination calculation
//   console.log(filters);
  console.log(options);
  
  
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  // Only pick filterable fields (ignore page, limit, sortBy, sortOrder)
  const filterData = pick(filters, workerFilterableFields);
  const sortOrderNormalized = (sortOrder?.toLowerCase() === "asc" ? "asc" : "desc") as "asc" | "desc";

  const andConditions: any[] = [];

  // Search term
  if (filterData.searchTerm) {
    andConditions.push({
      OR: workerSearchableFields.map((field) => ({
        [field]: { contains: filterData.searchTerm, mode: "insensitive" },
      })),
    });
  }

  // Exact filters (email)
  Object.keys(filterData).forEach((key) => {
    if (key !== "searchTerm") {
      andConditions.push({ [key]: { equals: filterData[key] } });
    }
  });

  // Always filter out deleted workers
  const whereCondition =
    andConditions.length > 0
      ? { AND: [...andConditions, { isDeleted: false }] }
      : { isDeleted: false };

  // Fetch workers and total count in parallel
  const [workers, total] = await Promise.all([
    prisma.worker.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrderNormalized },
      include: {
        // workAssignments: true,
        // attendance: true,
        // payments: true,
      },
    }),
    prisma.worker.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: workers,
  };
};

const getSingleWorker = async (id: string) => {
    return prisma.worker.findUnique({
        where: { id },
        include: {
            workAssignments: true,
            attendance: true,
            payments: true,
        },
    });
};

const updateWorker = async (id: string, payload: any) => {
    return prisma.worker.update({
        where: { id },
        data: payload,
    });
};

const deleteWorker = async (id: string) => {
    return prisma.worker.update({
        where: { id },
        data: { isDeleted: true },
    });
};

// Worker Attendance
const getWorkerAttendance = async (id: string) => {
    return prisma.attendance.findMany({
        where: { workerId: id },
        include: { site: true },
    });
};

// Worker Payments
const getWorkerPayments = async (id: string) => {
    return prisma.workerPayment.findMany({
        where: { workerId: id },
        orderBy: { createdAt: "desc" },
    });
};

// Worker Assignments
const getWorkerAssignments = async (id: string) => {
    return prisma.workAssignment.findMany({
        where: { workerId: id },
        include: { site: true },
    });
};



const softDeleteWorker = async (workerId: string) => {
  const worker = await prisma.worker.update({
    where: { id: workerId },
    data: { isDeleted: true },
  });
  return worker;
};

const restoreWorker = async (workerId: string) => {
  const worker = await prisma.worker.update({
    where: { id: workerId },
    data: { isDeleted: false },
  });
  return worker;
};

const updateWorkerProfile = async (workerId: string, data: any) => {
  // List of fields that can be updated
  const updatableFields = [
    "name",
    "profilePhoto",
    "contactNumber",
    "nidNumber",
    "joiningDate",
    "banned",
    "approved",
    "onleave",
    "dailyRate",
    "halfDayRate",
    "companyName",
    "position",
  ];

  // Build the update object dynamically
  const updateData: any = {};
  for (const field of updatableFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
    // skip fields that are not provided
  }

  // If no valid fields provided, return early
  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields provided to update");
  }

  // Update worker in database
  const updatedWorker = await prisma.worker.update({
    where: { id: workerId },
    data: updateData,
  });

  return updatedWorker;
};


const updateMyProfile = async (email: string, data: any) => {
  console.log(email, "from service");
  
  // Only update provided fields
  const updatableFields = [
    "name",
    "profilePhoto",
    "contactNumber",
    "nidNumber",
    "joiningDate",
    "banned",
    "approved",
    "onleave",
    "dailyRate",
    "halfDayRate",
    "companyName",
    "position",
  ];

  const updateData: any = {};
  for (const field of updatableFields) {
    if (field in data) {
      updateData[field] = data[field];
    }
  }

  // Update worker by email
  const updatedWorker = await prisma.worker.update({
    where: { email },
    data: updateData,
  });

  return updatedWorker;
};


export const workerService = {
    createWorker,
    getAllWorkers,
    getSingleWorker,
    updateWorker,
    deleteWorker,
    getWorkerAttendance,
    getWorkerPayments,
    getWorkerAssignments,
    softDeleteWorker,
    restoreWorker,  
    updateWorkerProfile,    
    updateMyProfile
};

