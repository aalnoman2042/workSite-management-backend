import { NextFunction, Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import catchAsync from "../../shared/catchAsync";
import { IJwtPayload } from "../../types/common";
import { attendanceService } from "./attendance.service";


/**
 * 1) Mark attendance for single worker
 */
const markSingleAttendance = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const siteEngineer = req.user;

    const data = await attendanceService.markSingleAttendance(
      req.body,
      siteEngineer as IJwtPayload
    );

    return sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Attendance marked successfully",
      data,
    });
  }
);


/**
 * 2) Monthly attendance
 */
const getMonthlyAttendance = catchAsync(async (req: Request, res: Response) => {
  const { workerId } = req.params;
  const { month, year } = req.query;

  const data = await attendanceService.getMonthlyAttendance(
    workerId,
    Number(month),
    Number(year)
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Monthly attendance fetched",
    data,
  });
});


/**
 * 3) Weekly attendance
 */
const getWeeklyAttendance = catchAsync(async (req: Request, res: Response) => {
  const { workerId } = req.params;

  const data = await attendanceService.getWeeklyAttendance(workerId);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Weekly attendance fetched",
    data,
  });
});


/**
 * 4) Today attendance for site
 */
const getTodayAttendance = catchAsync(async (req: Request, res: Response) => {
  const { siteId } = req.params;

  const data = await attendanceService.getTodayAttendance(siteId);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Today's attendance fetched",
    data,
  });
});


/**
 * 5) Specific day attendance for site
 */
const getDayAttendance = catchAsync(async (req: Request, res: Response) => {
  const { siteId } = req.params;
  const { date } = req.query;

  const data = await attendanceService.getDayAttendance(
    siteId,
    date as string
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Day attendance fetched",
    data,
  });
});


/**
 * 6) Paginated + Sorting attendance
 */
const getPaginatedAttendance = catchAsync(async (req: Request, res: Response) => {
  const { siteId } = req.params;
  const { date, page, limit, sort } = req.query;

  const data = await attendanceService.getPaginatedAttendance({
    siteId,
    date: date as string,
    page: Number(page),
    limit: Number(limit),
    sort: sort as string,
  });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Paginated attendance fetched",
    data,
  });
});


export const attendanceController = {
  markSingleAttendance,
  getMonthlyAttendance,
  getWeeklyAttendance,
  getTodayAttendance,
  getDayAttendance,
  getPaginatedAttendance,
};
