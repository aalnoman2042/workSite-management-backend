import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";



const createWorker = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  
  try {
    const result = await UserService.createWorker(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Worker created successfully",
      data: {
        result
      }
    });
  } catch (error) {
    next(error);
  }
});

const createSiteEngineer = catchAsync(async (req: Request & {user?: any}, res: Response, next: NextFunction) => {
  console.log(req.user);
  
  try {
    const result = await UserService.createSiteEngineer(req.body);
    res.status(201).json({
      success: true,
      message: "Site Engineer created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

const createChiefEngineer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.createChiefEngineer(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Chief Engineer created successfully",
      data: {
        result
      }
    });
  } catch (error) {
    next(error);
  }
});

const createAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.createAdmin(req.body);
    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
} );

export const UserController = {
  createWorker,
  createSiteEngineer,
  createChiefEngineer,
  createAdmin 
};
