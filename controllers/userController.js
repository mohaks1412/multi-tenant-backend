import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("tenant");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log(password, user.passwordHash);
    
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,           // "admin" | "member"
      tenant: user.tenant._id,
      tenantSlug: user.tenant.slug,
      plan: user.tenant.plan     // "free" | "pro"
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "none",
      maxAge: 60 * 60 * 1000 
    });

    res.json({
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
        tenant: user.tenant.slug,
        plan: user.tenant.plan
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none"
  });
  console.log("here");
  
  res.json({ message: "Logged out successfully" });
};





export const getProfile = async (req, res) => {
  try {
    // req.user is set by your auth middleware
    
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    req.body.socialLinks = JSON.parse(req.body.socialLinks);
    const updates = req.body;
    console.log(req.body);
    
    // Only allow specific fields to be updated
    const allowedUpdates = ["name", "avatar", "bio", "phone", "socialLinks"];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) filteredUpdates[field] = updates[field];
    });
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select("-password");

    console.log(user);
    
    
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

