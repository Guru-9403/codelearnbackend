import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      // Only required for accounts created with email/password.
      // Google sign-in accounts never set a password.
      required: function () { return this.provider === "local"; },
      minlength: 6,
      select: false, // never return password by default
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving, only if it changed and one was actually set
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to check a candidate password against the hash
userSchema.methods.matchPassword = async function (candidatePassword) {
  if (!this.password) return false; // Google-only accounts have no password to match
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
