import express from "express";



import { attendanceController } from "./attendance.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/mark-day",auth(UserRole.SITE_ENGINEER), attendanceController.markDayAttendance);
router.get("/day-attendance",auth(UserRole.SITE_ENGINEER), attendanceController.getDayAttendance);

export const attendanceRoutes = router;