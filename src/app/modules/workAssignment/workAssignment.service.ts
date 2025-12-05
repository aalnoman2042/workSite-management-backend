import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../Error/apiError";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";
import { log } from "console";
import { AssignmentStatus } from "@prisma/client";

const createAssignment = async (
  user: JwtPayload,
  payload: {
    title: string;
    description: string;
    siteId: string;
    workerId: string;
    dueDate?: Date;
    workdate?: Date;
  }
) => {
  const { title, description, siteId, workerId, dueDate, workdate } = payload;
  const allWorkers = await prisma.worker.findMany();
  console.log(allWorkers, "all workers");

  const siteEngineer = await prisma.sITE_Engineer.findUnique({
    where: { email: user.email },
  });
  //    console.log(siteEngineer, "service");

  if (!siteEngineer) throw new ApiError(404, "User not found");

  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
  });
  console.log(worker);

  if (!worker) throw new ApiError(404, "Worker not found");

  const site = await prisma.site.findUnique({
    where: { id: siteId },
  });

  if (!site) throw new ApiError(404, "Site not found");

  const assignment = await prisma.workAssignment.create({
    data: {
      title,
      description,
      siteId,
      workerId,
      assignedByEngineerId: siteEngineer.id, // <-- auto detect from cookie
      dueDate,
      workdate,
      status: "PENDING",
    },
  });

  return assignment;
};

const getAssignmentsByEngineer = async (user: IJwtPayload) => {
  console.log(user);
  // 1️ Make sure engineer exists
  const engineer = await prisma.sITE_Engineer.findUnique({
    where: { email: user.email },
  });
  
  console.log(engineer, "engineer   ");

  if (!engineer) {
    throw new ApiError(404, "Engineer not found or invalid token");
  }

  // 2️ Get all assignments created by this engineer
  const assignments = await prisma.workAssignment.findMany({
    where: { assignedByEngineerId: engineer.id },
    include: {
      worker: true,
      site: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments;
};

const getAssignmentsByWorker = async (user: IJwtPayload) => {
  // 1️⃣ Validate worker exists
  const worker = await prisma.worker.findUnique({
    where: { email: user.email },
  });

  if (!worker) {
    throw new ApiError(404, "Worker not found or invalid token");
  }

  // 2️⃣ Fetch worker’s assignments
  const assignments = await prisma.workAssignment.findMany({
    where: { workerId: worker.id },
    include: {
      site: true,
      assignedBy: true, // Engineer who assigned the work
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments;
};

const updateAssignmentStatus = async (assignmentId: string, status: string) => {
  // Optionally, validate status enum here
  return prisma.workAssignment.update({
    where: { id: assignmentId },
    data: { status: status as AssignmentStatus }, // Cast to AssignmentStatus if you are sure it's valid
  });
};

const getAssignmentById = async (assignmentId: string) => {
  const assignment = await prisma.workAssignment.findUnique({
    where: { id: assignmentId },
    include: { worker: true, assignedBy: true, site: true },
  });
  if (!assignment) throw new ApiError(404, "Assignment not found");
  return assignment;
};

export const WorkAssignmentService = {
  createAssignment,
  getAssignmentsByEngineer,
  getAssignmentsByWorker,
  updateAssignmentStatus,
  getAssignmentById,
};
