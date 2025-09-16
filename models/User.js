import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },

  // New fields for profile
  avatar: { type: String }, // URL to profile image
  bio: { type: String, maxlength: 250 },
  phone: { type: String },
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String },
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
