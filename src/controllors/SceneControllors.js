import fs from 'fs';
import FormData from "form-data";
import fetch from 'node-fetch'
import { createSceneGraph } from "./Graphcontroller.js";
import { Scene } from '../models/SceneModel.js';
import { uploadToS3 } from '../middelewares/s3UploadMiddelware.js';
import axios from 'axios';
import { Org } from '../models/organizationModel.js';


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
    const org = await Org.findById(req.id)
    org.scenes.push(scene._id)

    await org.save();
    
    const sceneGraph = await createSceneGraph(
      graphDetails,
      ProjectType, spaceType,
      image[0].url,
      scene._id
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
    console.log(org.scenes);

    res.status(200).json( org['scenes'] );
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

