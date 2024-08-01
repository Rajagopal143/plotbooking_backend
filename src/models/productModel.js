import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
 Name: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    },
    coveragePerBox: {
        type: Number,
        required: true,

  }
});
export const Product = mongoose.model("products", ProductSchema);
