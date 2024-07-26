import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

import config from "../config/config.js";
import { Org } from "../models/organizationModel.js";

const { JWT_SECRET, JWT_EXPIRATION } = config;
// Register a new user
export const addUser = async (req, res) => {
  try {

    const { email, password, role, contactNo } = req.body;
    console.log(email, password, role, contactNo);
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({ email, password, role, contactNo, organizationId:req.id });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password Incorrect" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const deleteUser = async (req, res) => {
  
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    await Org.updateOne({ _id: req.id }, { $pull: { users: userId } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message:error });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password, role, contactNo } = req.body;

    // Check if user exists
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;
    if (contactNo) user.contactNo = contactNo;

    // Save updated user
    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
