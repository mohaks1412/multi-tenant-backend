import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import Note from "../models/Note.js";
import { tenantIsolation } from "../middleware/tenantIsolation.js";
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote
} from "../controllers/noteController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("admin", "member"));

router.post("/", createNote);
router.get("/", getNotes);
router.get("/:id", tenantIsolation(Note), getNote);
router.put("/:id", tenantIsolation(Note), updateNote);
router.delete("/:id", tenantIsolation(Note), deleteNote);

export default router;
