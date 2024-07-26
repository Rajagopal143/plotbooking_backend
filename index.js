import express from "express";
import mongoose from "mongoose";
import cors from 'cors';


import authRoutes from "./src/routes/authRoutes.js";
import config from "./src/config/config.js";
import OrgRoutes from "./src/routes/orgRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors())
app.use(express.json());
// Middleware to parse JSON requests

// Routes
app.use("/api/user", authRoutes);
app.use("/api/auth/org", OrgRoutes);
app.use("/api/project", projectRoutes);

// Connect to MongoDB
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
