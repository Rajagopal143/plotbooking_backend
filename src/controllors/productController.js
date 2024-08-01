import { uploadToS3 } from "../middelewares/s3UploadMiddelware.js";
import { Org } from "../models/organizationModel.js";
import { Product } from "../models/productModel.js";

export const CreateProduct = async (req, res) => {
    try {
        const { Name, coveragePerBox } = req.body;
        console.log(Name,coveragePerBox,req.file)
    const image = await uploadToS3([req.file]);
    const scene = new Product({
     Name, coveragePerBox,
      imageUrl: image[0].url,
    });
    await scene.save();
    const org = await Org.findById(req.id);
    org.products.push(scene._id);

    await org.save();


    res.status(200).json({ message: "Product Created Successfully" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: err });
  }
}
export const listProduct = async (req, res) => {
    const { orgId } = req.params;

    try {
      // Find projects based on organizationId
      const org = await Org.findById(orgId).populate("products");
      console.log(org.products);

      res.status(200).json(org["products"]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server Error" });
    }
}