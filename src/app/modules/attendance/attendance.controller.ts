import { NextFunction, Request, Response } from "express";
import sendResponse from "../../shared/sendResponse";
import { attendanceService } from "./attendance.service";
import { IJwtPayload } from "../../types/common";
import catchAsync from "../../shared/catchAsync";

 const markDayAttendance = catchAsync(async (req: Request & {user?: IJwtPayload}, res: Response, next: NextFunction) => {
  const siteEngineer = req?.user;
    console.log(siteEngineer,"site engineer in controller");
    

  const data = await attendanceService.markDayAttendance(req.body, siteEngineer as IJwtPayload);
  return   sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Attendance marked successfully",
    data: data,
  });
});

const getDayAttendance = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { site_id, date } = req.query;  
  const data = await attendanceService.getDayAttendance({ site_id: site_id as string, date: date as string });
  return   sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Day attendance fetched successfully",
    data: data,
  });
});

export const attendanceController = {
  markDayAttendance,
  getDayAttendance
};