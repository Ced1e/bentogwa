import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: { 
      type: String, 
      unique: true, 
      required: [true, "Email is required"],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Valid email required"],
    },
    password: { type: String, required: [true, "Password is required"], select: false },
    course: { type: String, default: "" },
    university: { type: String, default: "" }
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);
export default User;