import jwt from "jsonwebtoken";
import config from "../config/config.js";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      config.JWT_SECRET
    );
    req.id = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: error });
  }
};


export default authMiddleware;
