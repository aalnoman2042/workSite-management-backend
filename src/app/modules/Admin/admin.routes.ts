import express from "express";
import { AdminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";


const router = express.Router();

// Login
router.patch(
  "/approve-user/:id",
  auth(UserRole.ADMIN),
  AdminController.approveUser
);

export const adminRoutes = router;