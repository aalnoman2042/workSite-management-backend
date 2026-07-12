import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { StatsController } from "./stats.controller";

const router = express.Router();

// Each role can only reach its own dashboard stats, and the scoped ones
// (site engineer, worker) resolve the caller from the token — never from the request.
router.get("/admin", auth(UserRole.ADMIN), StatsController.getAdminStats);

router.get(
  "/chief-engineer",
  auth(UserRole.CHIEF_ENGINEER),
  StatsController.getChiefEngineerStats
);

router.get(
  "/site-engineer",
  auth(UserRole.SITE_ENGINEER),
  StatsController.getSiteEngineerStats
);

router.get("/worker", auth(UserRole.WORKER), StatsController.getWorkerStats);

export const statsRoutes = router;