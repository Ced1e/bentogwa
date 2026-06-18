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
      // We remove the single index here...
    },
    semesterName: {
      type: String,
      required: true,
    },
    subjects: [SubjectSchema],
  },
  { timestamps: true }
);

// ...and apply a Compound Index here!
// 1 = ascending (find email), -1 = descending (newest first)
SemesterSchema.index({ userEmail: 1, createdAt: -1 });

const Semester = models.Semester || model("Semester", SemesterSchema);
export default Semester;