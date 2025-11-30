import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { SiteService } from "./site.service";

const createSite = catchAsync(async (req, res) => {
  const result = await SiteService.createSite(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Site created successfully",
    data: result,
  });
});

const getAllSites = catchAsync(async (req, res) => {
  const result = await SiteService.getAllSites();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All sites fetched",
    data: result,
  });
});

const getSingleSite = catchAsync(async (req, res) => {
  const result = await SiteService.getSingleSite(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Site fetched",
    data: result,
  });
});

const updateSite = catchAsync(async (req, res) => {
  const result = await SiteService.updateSite(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Site updated",
    data: result,
  });
});

const deleteSite = catchAsync(async (req, res) => {
  const result = await SiteService.deleteSite(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Site deleted",
    data: result,
  });
});

export const SiteController = {
  createSite,
  getAllSites,
  getSingleSite,
  updateSite,
  deleteSite,
};
