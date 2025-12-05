import express from "express";

import { aiController } from "./ai.controller";


const router = express.Router();

// Login
router.post("/suggest", 
    aiController.getAISuggetions
)


export const aiRoutes = router;
