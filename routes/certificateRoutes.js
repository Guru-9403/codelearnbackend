import express from "express";
import { issueCertificate, verifyCertificate } from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/issue", protect, issueCertificate);
router.get("/verify/:certificateId", verifyCertificate); // public - no auth

export default router;
