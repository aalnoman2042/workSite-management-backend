import express from "express";
import { authValidation } from "./auth.vaalidation";
import { authController } from "./auth.controller";


const router = express.Router();

// Login
router.post(
  "/login",
  (req, res, next) => {
    req.body =authValidation.loginSchema.parse(req.body);
    next();
  },
  authController.login
);

router.get(
    "/me",
    authController.getMe
)
router.patch(
    '/:id',
    // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CHIEF_ENGINEER, ENUM_USER_ROLE.SITE_ENGINEER, ENUM_USER_ROLE.WORKER), // Apply authorization if needed
    authController.updateMyProfile
);

export const authRoutes = router;
