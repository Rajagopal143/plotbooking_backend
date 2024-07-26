import jwt from "jsonwebtoken";
import config from "../config/config.js";

const orgAuthMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.JWT_SECRET);
    const orgId = decoded.userId;
    req.id = orgId;
    next();
  } catch (error) {
    res.status(401).json({ message: error });
  }
};

export default orgAuthMiddleware;
