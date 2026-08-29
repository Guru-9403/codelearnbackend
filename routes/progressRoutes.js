import express from "express";
import { getProgress, updateLessonProgress, resetProgress } from "../controllers/progressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // every route below requires a valid token

router.get("/", getProgress);
router.patch("/lesson", updateLessonProgress);
router.post("/reset", resetProgress);

export default router;
