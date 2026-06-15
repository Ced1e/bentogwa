import mongoose, { Schema, model, models } from "mongoose";

const SubjectSchema = new Schema({
  name: { type: String, default: "" },
  units: { type: Number, default: 0 },
  grade: { type: Number, default: 0 },
});

const SemesterSchema = new Schema(
  {
    userEmail: {
      type: String,
      required: true,
      index: true // Speeds up lookups significantly
    },
    semesterName: {
      type: String,
      required: true,
    },
    subjects: [SubjectSchema],
  },
  { timestamps: true }
);

const Semester = models.Semester || model("Semester", SemesterSchema);
export default Semester;