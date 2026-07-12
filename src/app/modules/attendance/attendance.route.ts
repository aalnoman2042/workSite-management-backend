import { Router } from "express";
import { attendanceController } from "./attendance.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
// import { authMiddleware } from "../../middleware/auth";

const router = Router();

// 1) Mark attendance for a single worker
router.post("/mark",auth(UserRole.SITE_ENGINEER) , attendanceController.markSingleAttendance);
router.post("/bulk-mark", auth(UserRole.SITE_ENGINEER), attendanceController.markBulkAttendance);

// 2) Get monthly attendance of a worker
router.get("/worker/:workerId/month", attendanceController.getMonthlyAttendance);

// 3) Get weekly attendance of a worker
router.get("/worker/:workerId/week", attendanceController.getWeeklyAttendance);

// 4) Get today's attendance of all workers of a site
router.get("/site/:siteId/today", attendanceController.getTodayAttendance);

// 5) Get specific day attendance of a site
router.get("/site/:siteId/day", attendanceController.getDayAttendance);

// 6) Get attendance with pagination + sorting (supervisors only — this returns every
//    worker's records, so it must not be reachable by a WORKER token)
router.get(
  "/all-attendance",
  auth(UserRole.ADMIN, UserRole.CHIEF_ENGINEER, UserRole.SITE_ENGINEER),
  attendanceController.getAllAttendance
);

// 7) A worker's own attendance, scoped from the token
router.get("/my-attendance", auth(UserRole.WORKER), attendanceController.getMyAttendance);

export const attendanceRouter = router;
