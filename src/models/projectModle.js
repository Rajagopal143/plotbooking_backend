import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  ProjectName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  jsonUrl: {
    type: String,
    trim: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
});

export const Project = mongoose.model("projects", projectSchema);
