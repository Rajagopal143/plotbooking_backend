import { s3, uploadToS3 } from "../middelewares/s3UploadMiddelware.js";
import { Org } from "../models/organizationModel.js";
import { Project } from "../models/projectModle.js";
import { User } from "../models/userModel.js";
import { S3Client } from "@aws-sdk/client-s3";

export const createProject = async (req, res) => {
  // try {
    
    const org = await Org.findById(req.id);
    if (!org) return res.status(400).json({ message: "Token Invalid" });
    const { ProjectName, location } = req.body;

    // Check if user already exists
    let project = await Project.findOne({ ProjectName });
    if (project) {
      return res.status(400).json({ message: "Project already exists" });
  }
  const urls = await uploadToS3(req.files);
    // Create new user
    project = new Project({
      ProjectName,
      location,
      imageUrl: urls[0].url,
      jsonUrl: urls[1].url,
      organizationId: req.id,
    });
    console.log(org)
    org.projects.push(project._id);

    // Save the updated user object

    await project.save();
    await org.save();

    res.status(201).json({ message: "Project registered successfully" });
  // } catch (error) {
  //   res.status(500).json({ message: error });
  // }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { ProjectName, location, username } = req.body;

    // Find the project by ID
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Optionally update project details
    if (ProjectName) project.ProjectName = ProjectName;
    if (location) project.location = location;

    // Optionally add a user to the assignedTo array
    if (username) {
      const user = await User.findOne({ username });
      if (user) {
        user.projects.push(projectId);
        await user.save();
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    }
    await project.save();

    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const ListOrgProjects = async (req, res) => {
  const { organizationId } = req.params;


  try {
    // Find projects based on organizationId
    const projects = await Project.find({ organizationId });
    

    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};
export const ListUserProjects = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find projects based on assignedTo array containing userId
    const user = await User.findById(userId).populate("projects");
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }

    // Access projects associated with the user
    const projects = user.projects;
    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

export const onePoject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Find projects based on assignedTo array containing userId
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "project Not Found" });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
};
export const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Find projects based on assignedTo array containing userId
    const project = await Project.findOneAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ message: "project Not found" });
    }
    res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};
