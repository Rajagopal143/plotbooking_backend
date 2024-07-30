import { Router } from "express";
import authMiddleware from "../middelewares/authMiddleware.js";
import { createScene, listScene } from "../controllors/SceneControllors.js";
import fileUploadMiddleware, { singlefile } from "../middelewares/fileUploadMiddleware.js";


const SceneRoutes = Router();

SceneRoutes.post('/create', authMiddleware, singlefile, createScene)
SceneRoutes.get('/:orgId',authMiddleware,listScene)

export default SceneRoutes