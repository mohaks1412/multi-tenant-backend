import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { upgradePlan } from "../controllers/tenantController.js";

const router = express.Router();

router.post("/:slug/upgrade", authMiddleware, authorize("admin"), upgradePlan);

export default router;
