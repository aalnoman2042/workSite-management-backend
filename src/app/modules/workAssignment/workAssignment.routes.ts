import express from "express";
import { WorkAssignmentController } from "./workAssignment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();


// Fetch all assignments for an engineer
router.get("/engineer",auth(UserRole.SITE_ENGINEER), WorkAssignmentController.getAssignmentsByEngineer);

// Fetch all assignments for a worker
router.get("/worker",auth(UserRole.WORKER),  WorkAssignmentController.getAssignmentsByWorker);

// Engineer assigns work to worker
router.post("/create",auth(UserRole.SITE_ENGINEER) ,     WorkAssignmentController.createAssignment);
// Update assignment status (e.g., IN_PROGRESS, COMPLETED)
router.patch("/update-status", WorkAssignmentController.updateAssignmentStatus);

export const WorkAssignmentRoutes = router;
