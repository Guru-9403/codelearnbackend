import mongoose from "mongoose";

// Mirrors { taskCompleted, testPassed } used per-lesson in the frontend
const lessonStatusSchema = new mongoose.Schema(
  {
    taskCompleted: { type: Boolean, default: false },
    testPassed: { type: Boolean, default: false },
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one progress doc per user
    },
    xp: {
      type: Number,
      default: 0,
    },
    // Lesson ids 1-10
    statuses: {
      type: [lessonStatusSchema],
      default: () => Array.from({ length: 10 }, () => ({ taskCompleted: false, testPassed: false })),
    },
    // Lesson ids 11-22
    cssStatuses: {
      type: [lessonStatusSchema],
      default: () => Array.from({ length: 12 }, () => ({ taskCompleted: false, testPassed: false })),
    },
    // Lesson ids 23-28
    jsStatuses: {
      type: [lessonStatusSchema],
      default: () => Array.from({ length: 6 }, () => ({ taskCompleted: false, testPassed: false })),
    },
    certificateId: {
      type: String, // e.g. "CL-XXXXXXXX", generated once all 28 lessons pass
      default: null,
    },
    certificateIssuedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);
