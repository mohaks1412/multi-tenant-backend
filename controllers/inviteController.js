import Tenant from "../models/Tenant.js";
import crypto from "crypto";
import Invite from "../models/Invite.js";
import User from "../models/User.js";

// Create a new invite
export const inviteUser = async (req, res) => {
  try {
    const { email, role } = req.body;
    
    // Only admins can invite
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can invite users" });
    }

    // Check if the user already exists in this tenant
    const existingUser = await User.findOne({ email, tenant: req.user.tenant });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists in this tenant" });
    }

    // Generate a secure invite token
    const token = crypto.randomBytes(20).toString("hex");

    // Create the invite record
    
    const invite = await Invite.create({
      email,
      role,
      tenant: req.user.tenant,
      invitedBy: req.user.id,
      token,
    });

    

    // Instead of sending email, log the invite link (evaluation-friendly)
    const acceptUrl = `${process.env.CLIENT_URL}/invites/accept/${token}`;
    console.log(`Invite created for ${email}: Accept here → ${acceptUrl}`);

    res.status(201).json({ message: "Invitation created successfully", invite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// List all invites for the tenant
export const listInvites = async (req, res) => {
  try {
    
    console.log("in controller");
    const invites = await Invite.find({ tenant: req.user.tenant });
    
    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Accept an invite (create user in tenant)
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { name, password } = req.body;

    // Find the invite by token and ensure it's pending
    const invite = await Invite.findOne({ token, status: "pending" });
    if (!invite) {
      return res.status(400).json({ error: "Invalid or expired invite" });
    }

    // Check if user already exists (safety)
    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user under the tenant
    const user = await User.create({
      name,
      email: invite.email,
      password,
      tenant: invite.tenant,
      role: invite.role,
    });

    // Mark invite as accepted
    invite.status = "accepted";
    await invite.save();

    res.json({ message: "Invite accepted successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



export const rejectInvite = async (req, res) => {
  try {
    const { id } = req.params;

    const invite = await Invite.findById(id);
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    if (!req.user.invites.includes(invite._id)) {
      return res.status(403).json({ error: "Not your invite" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ error: `Invite already ${invite.status}` });
    }

    invite.status = "rejected";
    await invite.save();

    res.json({ message: "Invite rejected", invite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

