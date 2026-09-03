import Progress from "../models/Progress.js";

// Maps a lessonId (1-28) to which array it belongs in and the index within that array.
// Mirrors the id ranges baked into the frontend's lessonsData.
function resolveLessonSlot(lessonId) {
  if (lessonId >= 1 && lessonId <= 10) {
    return { field: "statuses", index: lessonId - 1 };
  }
  if (lessonId >= 11 && lessonId <= 22) {
    return { field: "cssStatuses", index: lessonId - 11 };
  }
  if (lessonId >= 23 && lessonId <= 28) {
    return { field: "jsStatuses", index: lessonId - 23 };
  }
  return null;
}

async function getOrCreateProgress(userId) {
  let progress = await Progress.findOne({ user: userId });
  if (!progress) {
    progress = await Progress.create({ user: userId });
  }
  return progress;
}

// @route GET /api/progress  (protected)
export async function getProgress(req, res, next) {
  try {
    const progress = await getOrCreateProgress(req.user._id);
    res.json(progress);
  } catch (err) {
    next(err);
  }
}

// @route PATCH /api/progress/lesson  (protected)
// body: { lessonId: number, taskCompleted?: boolean, testPassed?: boolean, xpAward?: number }
export async function updateLessonProgress(req, res, next) {
  try {
    const { lessonId, taskCompleted, testPassed, xpAward } = req.body;

    if (typeof lessonId !== "number") {
      return res.status(400).json({ message: "lessonId (number) is required" });
    }

    const slot = resolveLessonSlot(lessonId);
    if (!slot) {
      return res.status(400).json({ message: `lessonId ${lessonId} is out of range (1-28)` });
    }

    const progress = await getOrCreateProgress(req.user._id);
    const arr = progress[slot.field];

    if (typeof taskCompleted === "boolean") arr[slot.index].taskCompleted = taskCompleted;
    if (typeof testPassed === "boolean") arr[slot.index].testPassed = testPassed;

    if (typeof xpAward === "number" && xpAward > 0) {
      progress.xp += xpAward;
    }

    progress.markModified(slot.field);
    await progress.save();

    res.json(progress);
  } catch (err) {
    next(err);
  }
}

// @route POST /api/progress/reset  (protected) - mostly useful for testing/dev
export async function resetProgress(req, res, next) {
  try {
    await Progress.findOneAndDelete({ user: req.user._id });
    const fresh = await Progress.create({ user: req.user._id });
    res.json(fresh);
  } catch (err) {
    next(err);
  }
}
