import mongoose from "mongoose";

const SceneSchema = new mongoose.Schema({
    ProjectType: {
    type: String,
    required: true,
    trim: true,
    },
    spaceType: {
    type: String,
    required: true,
    trim: true,
    },
    ImgUrl: {
        type: String,
        trim:true
    }
  
});

export const Scene = mongoose.model("Scene", SceneSchema);
