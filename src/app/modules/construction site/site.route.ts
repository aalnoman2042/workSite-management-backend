import express from "express";
// import validateRequest from "../../middlewares/validateRequest";
// import { createSiteSchema } from "./site.validation";
import { SiteController } from "./site.controller";

const router = express.Router();

router.post(
  "/",
//   validateRequest(createSiteSchema),
  SiteController.createSite
);

router.get("/", SiteController.getAllSites);
router.get("/:id", SiteController.getSingleSite);
router.patch("/update/:id", SiteController.updateSite);
router.delete("/:id", SiteController.deleteSite);

export const SiteRoutes = router;
