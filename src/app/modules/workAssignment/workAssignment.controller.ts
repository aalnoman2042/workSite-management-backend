import { Request, Response, NextFunction } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { WorkAssignmentService } from "./workAssignment.service";
import { JwtPayload } from "jsonwebtoken";
import { log } from "console";
import { IJwtPayload } from "../../types/common";

const createAssignment = catchAsync(async (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
    console.log(req.user);
  const assignment = await WorkAssignmentService.createAssignment( req.user as JwtPayload,req.body);
  
  
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Work assignment created successfully",
    data: assignment,
  });
});

const getAssignmentsByEngineer = catchAsync(async (req: Request & {user?: IJwtPayload}, res: Response, next: NextFunction) => {
  const engineer = req?.user;

  
  const assignments = await WorkAssignmentService.getAssignmentsByEngineer(engineer as IJwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assignments fetched successfully",
    data: assignments,
  });
});

const getAssignmentsByWorker = catchAsync(async (req: Request & {user?: IJwtPayload}, res: Response, next: NextFunction) => {
  const worker = req?.user;
  const assignments = await WorkAssignmentService.getAssignmentsByWorker( worker as IJwtPayload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assignments fetched successfully",
    data: assignments,
  });
});

const updateAssignmentStatus = catchAsync(async ( req: Request, res: Response, next: NextFunction) => {
  const { assignmentId, status } = req.body;
  const updated = await WorkAssignmentService.updateAssignmentStatus(assignmentId, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assignment status updated",
    data: updated,
  });
});

export const WorkAssignmentController = {
  createAssignment,
  getAssignmentsByEngineer,
  getAssignmentsByWorker,
  updateAssignmentStatus,
};
