import express from "express";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

// Worker Registration
router.post(
  "/register-worker",
  (req, res, next) => {
    req.body = UserValidation.workerSchema.parse(req.body);
    next();
  },
  UserController.createWorker
);

// Site Engineer Registration
router.post(
  "/register-site-engineer",
  (req, res, next) => {
    req.body = UserValidation.siteEngineerSchema.parse(req.body);
    next();
  },
  UserController.createSiteEngineer
);

// Chief Engineer Registration
router.post(
  "/register-chief-engineer",
  (req, res, next) => {
    req.body = UserValidation.chiefEngineerSchema.parse(req.body);
    next();
  },
  UserController.createChiefEngineer
);

// Admin Registration
router.post(
  "/register-admin",
  (req, res, next) => {
    req.body = UserValidation.adminSchema.parse(req.body);
    next();
  },
  UserController.createAdmin
);

export const UserRoutes = router;
