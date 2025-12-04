// import prisma from "../../config/db.js";

import { AttendanceStatus } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";

/**
 * 1) GET workers + their attendance for a specific date
 */
const getDayAttendance = async ({ site_id, date }: { site_id: string; date: string }) => {
  if (!site_id || !date) throw new Error("site_id and date are required");

  // normalize date
  const ISODate = new Date(date);


  // 1️⃣ Find all workers assigned to this site
  const assignedWorkers = await prisma.workAssignment.findMany({
    where: { siteId: site_id },
    include: {
      worker: true,    // Get worker details
    }
  });
//  console.log(assignedWorkers, );
 
  if (assignedWorkers.length === 0) return [];

  // extract only worker details
  const workers = assignedWorkers.map(w => w.worker);

  // 2️⃣ Find attendance for this site & date
  const attendance = await prisma.attendance.findMany({
    where: { siteId: site_id, date: ISODate }
  });

  console.log(attendance, "attendance records");

  // 3️⃣ Merge worker + attendance
  const result = workers.map(worker => {
    const att = attendance.find(a => a.workerId === worker.id);

    return {
      workerId: worker.id,
      workerName: worker.name,
      email: worker.email,

      status: att?.status ?? "none",
      hoursWorked: att?.hoursWorked ?? 0,
      isHalfDay: att?.isHalfDay ?? false,
      attendanceId: att?.id ?? null,
      date: ISODate
    };
  });

  return result;
};




/**
 * 2) Mark attendance for full day
 */
 const markDayAttendance = async ({ siteId, date, presentWorkers }: { siteId: string; date: string; presentWorkers: string[] }, siteEngineer: IJwtPayload
 ) => {
  if (!siteId || !date) throw new Error("siteId, date required");

  const ISODate = new Date(date);
  const siteEngineerId = await prisma.sITE_Engineer.findUnique({
    where: { email: siteEngineer.email },
  });
  // all workers
  const workers = await prisma.worker.findMany({});
  const workerIds = workers.map(w => w.id);

  // Remove previous marking for this exact date + site
  await prisma.attendance.deleteMany({
    where: { siteId: siteId, date: ISODate }
  });

  // Present workers
  const presentData = presentWorkers.map(workerId => ({
    workerId ,
    siteId,
    siteEngineerId: siteEngineerId?.id as string,
    date: ISODate,
    status: AttendanceStatus.PRESENT
  }));

  // Absent workers = all_workers - present_workers
  const absentWorkers = workerIds.filter(id => !presentWorkers.includes(id));

  const absentData = absentWorkers.map(workerId => ({
    workerId,
    siteId,
    siteEngineerId : siteEngineerId?.id as string,
    date: ISODate,
    status: AttendanceStatus.ABSENT
  }));

  // Insert new attendance rows
  await prisma.attendance.createMany({
    data: [...presentData, ...absentData]
  });

  return { totalPresent: presentData.length, totalAbsent: absentData.length };
};

export const attendanceService = {
  getDayAttendance,
  markDayAttendance
};
