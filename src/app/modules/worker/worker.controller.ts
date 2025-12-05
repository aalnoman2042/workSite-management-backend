import { Request, Response } from "express";
import { workerService } from "./worker.service";
import catchAsync from "../../shared/catchAsync";
import { workerFilterableFields } from "./worker.constant";
import pick from "../../helper/pick";
import sendResponse from "../../shared/sendResponse";
import { IJwtPayload } from "../../types/common";


 const createWorker = catchAsync( async (req: Request, res: Response) => {
    const result = await workerService.createWorker(req.body);

    res.status(201).json({
      success: true,
      message: "Worker created successfully",
      data: result
    });
  });   

  const getAllWorkers = catchAsync( async (req: Request, res: Response) => {
      const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, workerFilterableFields)

    const result = await workerService.getAllWorkers(fillters ,options);

    res.json({
      success: true,
      data: result,
    });
  });

  const getSingleWorker = catchAsync( async (req: Request, res: Response) => {
    const result = await workerService.getSingleWorker(req.params.id);

    res.json({ success: true, data: result });
  });

  const updateWorker = catchAsync( async (req: Request, res: Response) => {
    const result = await workerService.updateWorker(req.params.id, req.body);

    res.json({
      success: true,
      message: "Worker updated",
      data: result
    });
  });

  const deleteWorker = catchAsync( async (req: Request, res: Response) => {
    const result = await workerService.deleteWorker(req.params.id);

    res.json({
      success: true,
      message: "Worker deleted",
      data: result,
    });
  });

  const getWorkerAttendance = catchAsync( async (req: Request, res: Response) => {
    const result = await workerService.getWorkerAttendance(req.params.id);

    res.json({ success: true, data: result });
  });

  const getWorkerPayments = catchAsync( async (req: Request, res: Response) => {
    const result = await workerService.getWorkerPayments(req.params.id);

    res.json({ success: true, data: result });
  });   

  const getWorkerAssignments = catchAsync( async (req: Request, res: Response) => {
    const result = await workerService.getWorkerAssignments(req.params.id);

    res.json({ success: true, data: result });
  });


const softDeleteWorkerController = catchAsync(async (req: Request, res: Response) => {
  const worker = await workerService.softDeleteWorker(req.params.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Worker soft-deleted successfully",
    data: worker,
  });
});

const restoreWorkerController = catchAsync(async (req: Request, res: Response) => {
  const worker = await workerService.restoreWorker(req.params.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Worker restored successfully",
    data: worker,
  });
});

const updateWorkerController = catchAsync(async (req: Request, res: Response) => {
  const updatedWorker = await workerService.updateWorkerProfile(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Worker profile updated successfully",
    data: updatedWorker,
  });
});

const updateMyProfile = catchAsync(
  async (req: Request & { user?: IJwtPayload }, res: Response) => {
    console.log(req?.user, "from controller");
    console.log("jkfjhd");
    
    
    const workerEmail = req.user?.email;

    if (!workerEmail) {
      return res.status(401).json({ error: "Unauthorized: missing user email" });
    }

    const updatedWorker = await workerService.updateMyProfile(
      workerEmail,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: updatedWorker,
    });
  }
);

  export const WorkerController = {
  createWorker,
  getAllWorkers,
    getSingleWorker,    
    updateWorker,   

    deleteWorker,
    getWorkerAttendance,    
    getWorkerPayments,  
    getWorkerAssignments,
    softDeleteWorkerController,
    restoreWorkerController,
    updateWorkerController,
    updateMyProfile
};  