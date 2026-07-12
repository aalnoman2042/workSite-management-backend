import express from "express";
import { UserRole } from "@prisma/client";
// import validateRequest from "../../middlewares/validateRequest";
// import { createSiteSchema } from "./site.validation";
import auth from "../../middlewares/auth";
import { SiteController } from "./site.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.CHIEF_ENGINEER),
  //   validateRequest(createSiteSchema),
  SiteController.createSite
);

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.CHIEF_ENGINEER, UserRole.SITE_ENGINEER),
  SiteController.getAllSites
);

// Must come before "/:id", or Express matches this with id = "my-sites".
router.get("/my-sites", auth(UserRole.SITE_ENGINEER), SiteController.getMySites);

router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.CHIEF_ENGINEER, UserRole.SITE_ENGINEER),
  SiteController.getSingleSite
);

router.patch("/update/:id", auth(UserRole.CHIEF_ENGINEER), SiteController.updateSite);

router.delete("/:id", auth(UserRole.CHIEF_ENGINEER), SiteController.deleteSite);

export const SiteRoutes = router;