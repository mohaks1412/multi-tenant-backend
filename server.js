import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import authRoutes from "./routes/authRoutes.js"

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,                   // true so that automates scripts and dashboards can access the APIs (replace with process.env.CLIENT_URL)
  credentials: true
}));



app.use(express.json());
app.use(cookieParser());

//-----------------------------------------------------------Routes------------------------------------------------------------


app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);
app.use("/tenants", tenantRoutes);
app.use("/invites", inviteRoutes);
app.use("/users", userRoutes)


//-------------------------------------------------------Health endpoint--------------------------------------------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

//------------------------------------------------------MongoDB connection-------------------------------------------------------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

