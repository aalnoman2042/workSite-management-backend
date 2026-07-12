import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";
import { StatsService } from "./stats.service";

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await StatsService.getAdminStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin dashboard stats fetched successfully",
    data: stats,
  });
});

const getChiefEngineerStats = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const stats = await StatsService.getChiefEngineerStats(req.user as IJwtPayload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Chief engineer dashboard stats fetched successfully",
      data: stats,
    });
  }
);

const getSiteEngineerStats = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const stats = await StatsService.getSiteEngineerStats(req.user as IJwtPayload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Site engineer dashboard stats fetched successfully",
      data: stats,
    });
  }
);

const getWorkerStats = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    const stats = await StatsService.getWorkerStats(req.user as IJwtPayload);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Worker dashboard stats fetched successfully",
      data: stats,
    });
  }
);

export const StatsController = {
  getAdminStats,
  getChiefEngineerStats,
  getSiteEngineerStats,
  getWorkerStats,
};