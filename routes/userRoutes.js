import express from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";import multer from "multer";

const upload = multer();

const router = express.Router();

router.use(authMiddleware);

// @route   GET /api/users/me
// @desc    Get logged-in user's profile
// @access  Private
router.get("/me", getProfile);

// @route   PATCH /api/users/me
// @desc    Update logged-in user's profile
// @access  Private
router.patch("/me", upload.none(), updateProfile);

export default router;
