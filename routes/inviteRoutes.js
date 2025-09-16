import express from "express";
import { authMiddleware} from "../middleware/auth.js";
import {authorize} from "../middleware/authorize.js"
import { acceptInvite, rejectInvite, inviteUser, listInvites } from "../controllers/inviteController.js";

const router = express.Router();

router.use(authMiddleware);


router.post("/", authMiddleware, authorize("admin"), inviteUser);


router.get("/", authMiddleware, authorize("admin"), listInvites);
// Accept invite
router.post("/:id/accept", acceptInvite);

// Reject invite
router.post("/:id/reject", rejectInvite);

export default router;
