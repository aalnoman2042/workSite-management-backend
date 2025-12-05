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


export const authRoutes = router;
