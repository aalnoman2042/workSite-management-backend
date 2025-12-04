import express from "express";
import { WorkerController } from "./worker.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN),
  WorkerController.createWorker
);

router.get("/", auth(UserRole.ADMIN), WorkerController.getAllWorkers);

router.get("/:id", WorkerController.getSingleWorker);

router.patch("/:id", auth(UserRole.ADMIN), WorkerController.updateWorker);

router.delete("/:id", auth(UserRole.ADMIN), WorkerController.deleteWorker);

router.get("/:id/attendance", WorkerController.getWorkerAttendance);

router.get("/:id/payments", WorkerController.getWorkerPayments);

router.get("/:id/assignments", WorkerController.getWorkerAssignments);

export const WorkerRoutes = router;
