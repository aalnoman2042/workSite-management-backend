import { NextFunction, Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AdminService } from "./admin.service";

const approveUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;

  const result = await AdminService.approveUser(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User approved successfully",
    data: result
  });
});

export const AdminController = {
  approveUser,
};