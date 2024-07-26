import express from 'express'
import {
  deleteUser,
  login,
  addUser,
  updateUser,
} from "../controllors/UserControllor.js";
import orgAuthMiddleware from '../middelewares/OrgMiddleware.js';
const authRoutes = express.Router();

authRoutes.post("/addUser", orgAuthMiddleware, addUser);

authRoutes.post("/login", login);

authRoutes.delete("/delete/:id", orgAuthMiddleware, deleteUser);

authRoutes.delete("/update/:id", orgAuthMiddleware, updateUser);

export default authRoutes;
