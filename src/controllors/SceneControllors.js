import fs from 'fs';
import FormData from "form-data";
import fetch from 'node-fetch'
import { createSceneGraph, getEmentsbysceneId } from "./Graphcontroller.js";
import { Scene } from '../models/SceneModel.js';
import { uploadToS3 } from '../middelewares/s3UploadMiddelware.js';
import axios from 'axios';
import { Org } from '../models/organizationModel.js';
import { dbGraph } from '../db/db.js';


export const createScene = async (req, res) => {
  try {
    
    
    const { ProjectType, spaceType } = req.body;
    const graphDetails = await uploadImage(req.file)
    const image = await uploadToS3([req.file]);
    const scene = new Scene({
      ProjectType, spaceType,
      ImgUrl:image[0].url
    });
    await scene.save();
    const sceneId = scene._id;
    const org = await Org.findById(req.id)
    org.scenes.push(scene._id)

    await org.save();
    
    const sceneGraph = await createSceneGraph(
      graphDetails,
      ProjectType, spaceType,
      image[0].url,
      sceneId
    );
    

    res.status(200).json({ message: "Scene Created Successfully" });
  } catch (err) {
    console.log(err)
    res.status(404).json({message:err});
    
  }
  
}


export const listScene = async (req, res) => {
  const { orgId } = req.params;

  try {
    // Find projects based on organizationId
    const org = await Org.findById(orgId).populate('scenes');
    const { scenes } = org;
    const data = [];
  for (let scene of scenes) {
    const elements = await dbGraph.queryNodeBysceneId(scene._id);
    const dummy = scene.toObject();
    dummy.elements = elements;
    data.push(dummy);
  }

    res.status(200).json( data );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
}



async function uploadImage(file) {
    try {
      const imageFileName = file.originalname;

      // Read the image file
      // Create a form and append the image file
      const form = new FormData();
      form.append("file", file.buffer, {
        filename: imageFileName,
        contentType: file.mimetype,
      });

      // Send the image to another API
     
    const res = await axios
        .post("http://23.20.122.223:8000/genSceneGraph/", form, {
          headers: {
            ...form.getHeaders(), // Set the appropriate headers for multipart/form-data
          },
        })
      const data = res.data;
        

    
      // Send response back to the client
     return data
    } catch (error) {
      return error
    } finally {

    }
}


export const getelementofScene = async (req, res) => {
  const { sceneId } = req.params;

  try {
    // Find projects based on organizationId
    const data = await dbGraph.queryNodeBysceneId(sceneId);
   
   
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};