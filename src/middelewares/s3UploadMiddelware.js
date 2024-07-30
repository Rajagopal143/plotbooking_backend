import AWS from 'aws-sdk'
import dotenv from 'dotenv'
dotenv.config();

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export  const uploadToS3 =async (files) => {

  const uploadPromises = files.map(async (file) => {
    
   const params = {
     Bucket: process.env.AWS_BUCKET_NAME,
     Key: `${Date.now()}_${file.originalname}`,
     Body: file.buffer,
     ContentType: file.mimetype,
   };

   return s3
     .upload(params)
     .promise()
     .then((data) => ({
       url: data.Location,
       key: params.Key,
     }));
 });
 const results = await Promise.all(uploadPromises);
  return results;
};

