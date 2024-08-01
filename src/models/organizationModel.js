import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const OrganisationSchema = new mongoose.Schema(
  {
    OrganizationName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "users",
      },
    ],
    projects: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "projects",
      },
    ],
    scenes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Scene",
      },
    ],
    products: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "products",
      },
    ],
  },
  { timestamps: true }
);


OrganisationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// Compare password for login
OrganisationSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
export const Org = mongoose.model("Organisation", OrganisationSchema);
