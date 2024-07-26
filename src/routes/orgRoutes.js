import express from "express";

import { getOrg, orglogin, orgRegister, orgValidate, updateOrg } from "../controllors/OrgController.js";
import authMiddleware from "../middelewares/authMiddleware.js";
const OrgRoutes = express.Router();

OrgRoutes.post("/register", orgRegister);

OrgRoutes.post("/login", orglogin);
OrgRoutes.post("/validate",orgValidate)

OrgRoutes.delete("/update/:id", authMiddleware, updateOrg);
OrgRoutes.get("/:orgid",getOrg)
export default OrgRoutes;
