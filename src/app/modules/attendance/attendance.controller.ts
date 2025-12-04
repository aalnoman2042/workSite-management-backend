import { NextFunction, Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import catchAsync from "../../shared/catchAsync";
import { IJwtPayload } from "../../types/common";
import { attendanceService } from "./attendance.service";
import { attendanceFilterableFields } from "./attendance.consant";
import pick from "../../helper/pick";


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


const markBulkAttendance = catchAsync(async (req: Request & { user?: IJwtPayload }, res: Response) => {
  const siteEngineerId = req.user; // JWT payload
  const attendance = req.body;

  const result = await attendanceService.markBulkAttendance(attendance, siteEngineerId as IJwtPayload);
  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Bulk attendance marked successfully",
    data: result,
  });
});

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
  const getAllAttendance = catchAsync( async (req: Request, res: Response) => {
      const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = pick(req.query, attendanceFilterableFields)

    const result = await attendanceService.getAllAttendance(filters ,options);
   return sendResponse(res, {
      statusCode: 200, 
      message: "Attendance records fetched successfully",
      success: true,
      data: result,
    });
  });

export const attendanceController = {
  markSingleAttendance,
  markBulkAttendance,
  getMonthlyAttendance,
  getWeeklyAttendance,
  getTodayAttendance,
  getDayAttendance,
  getAllAttendance,
};
