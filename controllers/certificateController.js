import crypto from "crypto";
import Progress from "../models/Progress.js";
import User from "../models/User.js";

function allLessonsComplete(arr) {
  return arr.every((s) => s?.taskCompleted && s?.testPassed);
}

function generateCertificateId() {
  return `CL-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// @route POST /api/certificate/issue  (protected)
// Issues a certificate only if all 28 lessons (10 HTML + 12 CSS + 6 JS) are complete.
export async function issueCertificate(req, res, next) {
  try {
    const progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      return res.status(404).json({ message: "No progress found for this user" });
    }

    const done =
      allLessonsComplete(progress.statuses) &&
      allLessonsComplete(progress.cssStatuses) &&
      allLessonsComplete(progress.jsStatuses);

    if (!done) {
      return res.status(400).json({ message: "Not all lessons are complete yet" });
    }

    if (!progress.certificateId) {
      progress.certificateId = generateCertificateId();
      progress.certificateIssuedAt = new Date();
      await progress.save();
    }

    res.json({
      certificateId: progress.certificateId,
      issuedAt: progress.certificateIssuedAt,
    });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/certificate/verify/:certificateId  (public, no auth)
// Lets anyone (e.g. an employer) verify a certificate is real.
export async function verifyCertificate(req, res, next) {
  try {
    const { certificateId } = req.params;
    const progress = await Progress.findOne({ certificateId }).populate("user", "name email");

    if (!progress) {
      return res.status(404).json({ valid: false, message: "Certificate not found" });
    }

    res.json({
      valid: true,
      certificateId: progress.certificateId,
      issuedAt: progress.certificateIssuedAt,
      studentName: progress.user.name,
    });
  } catch (err) {
    next(err);
  }
}
