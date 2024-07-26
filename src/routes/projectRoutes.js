import express from 'express'
import { createProject, deleteProject, ListOrgProjects, ListUserProjects, onePoject, updateProject } from '../controllors/projectController.js';
import fileUploadMiddleware from '../middelewares/fileUploadMiddleware.js';
import { uploadToS3 } from '../middelewares/s3UploadMiddelware.js';
import authMiddleware from '../middelewares/authMiddleware.js';

const projectRoutes = express.Router();

projectRoutes.post(
  "/addproject",
  fileUploadMiddleware,
  authMiddleware,
  createProject
);
projectRoutes.get(
  "/organization/:organizationId",
  ListOrgProjects
);
projectRoutes.put(
  "/update-project/:projectId",
  authMiddleware,
  updateProject
);
projectRoutes.delete('/:projectId',authMiddleware,deleteProject)
projectRoutes.get("/user/:userId", authMiddleware, ListUserProjects);
projectRoutes.get("/:projectId", onePoject);


export default projectRoutes;