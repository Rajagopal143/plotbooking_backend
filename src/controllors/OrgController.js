import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

import config from "../config/config.js";
import { Org } from "../models/organizationModel.js";

const { JWT_SECRET, JWT_EXPIRATION } = config;
// Register a new user
export const orgRegister = async (req, res) => {
  try {
    const {OrganizationName, email, password } = req.body;
    // Check if user already exists
    let user = await Org.findOne({ email });
    if (user) {
        return res.status(400).json({ message: "Organization already exists" });
    }
    
    // Create new user
    user = new Org({ email, password, OrganizationName });
    await user.save();
    console.log(user)
     const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
       expiresIn: JWT_EXPIRATION,
     });
    const {_id} = user

     res.status(201).json({"name":OrganizationName,email,_id, token });

  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const orglogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await Org.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });
    console.log({ token, user });

    res.status(201).json({ name: user.OrganizationName, email:user.email, _id:user._id, token });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const orgValidate = async(req, res) => {
   try {
     const { email } = req.body;
    const user = await Org.findOne({ email });
    if (user) {
      return res.json({ isValid: true });
    } else {
      return res.json({ isValid: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const updateOrg = async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, password, location } = req.body;

    // Check if user exists
    let user = await Org.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (location) user.location = location;

    // Save updated user
    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrg = async (req, res) => {
  const id = req.params.orgid
  try {
    const org = await Org.findById(id).populate("projects");
    console.log(org);
    // const {email,}
    const { OrganizationName, email, projects } = org;
    res.status(200).json({ OrganizationName, email, projects });
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: err });
  }
}
