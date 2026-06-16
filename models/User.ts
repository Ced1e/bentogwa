import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    course: { type: String },
    university: { type: String },
    // --- NEW FIELDS FOR PASSWORD RESET ---
    resetToken: { type: String, required: false },
    resetTokenExpiry: { type: Date, required: false },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;