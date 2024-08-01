
import { Router } from "express";
import authMiddleware from "../middelewares/authMiddleware.js";
import { singlefile } from "../middelewares/fileUploadMiddleware.js";
import { CreateProduct, listProduct } from "../controllors/productController.js";

const ProductRoutes = Router();

ProductRoutes.post("/create", authMiddleware, singlefile, CreateProduct);

ProductRoutes.get("/list", authMiddleware, listProduct);

export default ProductRoutes;