import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";



const createWorker = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UserService.createWorker(req.body);
    res.status(201).json({
      success: true,
      message: "Worker created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

const createSiteEngineer = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
    res.status(201).json({
      success: true,
      message: "Chief Engineer created successfully",
      data: result,
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
