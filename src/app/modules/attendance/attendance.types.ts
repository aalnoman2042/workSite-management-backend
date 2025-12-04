import { AttendanceStatus } from "@prisma/client";

export type BulkAttendanceInput = {
  workerId: string;
  siteId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  isHalfDay?: boolean;
};

export type DayAttendanceInput = {
  siteId: string;
  date: string; // YYYY-MM-DD
  presentWorkers: string[];
  absentWorkers?: string[];
};