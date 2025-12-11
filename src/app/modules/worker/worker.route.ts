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
router.patch(
  "/update-my-profile",
auth(UserRole.WORKER),
  WorkerController.updateMyProfile
);
router.get("/", WorkerController.getAllWorkers);

router.get("/:id", WorkerController.getSingleWorker);

router.patch("/:id", auth(UserRole.ADMIN), WorkerController.updateWorker);

router.delete("/:id", auth(UserRole.ADMIN), WorkerController.deleteWorker);

router.get("/:id/attendance", WorkerController.getWorkerAttendance);

router.get("/:id/payments", WorkerController.getWorkerPayments);

router.get("/:id/assignments", WorkerController.getWorkerAssignments);

router.patch("/soft-delete/:id",auth(UserRole.ADMIN), WorkerController.softDeleteWorkerController);
router.patch("/restore/:id",auth(UserRole.CHIEF_ENGINEER, UserRole.SITE_ENGINEER), WorkerController.restoreWorkerController);


router.patch("/update/:id",auth(UserRole.CHIEF_ENGINEER, UserRole.SITE_ENGINEER) ,WorkerController.updateWorkerController);



export const WorkerRoutes = router;
