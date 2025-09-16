import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Tenant from "./models/Tenant.js";
import Note from "./models/Note.js";
import Invite from "./models/Invite.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const SALT_ROUNDS = 10;

const usersData = [
  // Acme
  { email: "admin@acme.test", password: "password", role: "admin", tenantSlug: "acme" },
  { email: "user@acme.test", password: "password", role: "member", tenantSlug: "acme" },
  // Globex
  { email: "admin@globex.test", password: "password", role: "admin", tenantSlug: "globex" },
  { email: "user@globex.test", password: "password", role: "member", tenantSlug: "globex" },
];

const tenantsData = [
  { name: "Acme", slug: "acme", plan: "free" },
  { name: "Globex", slug: "globex", plan: "free" },
];

const clearDatabase = async () => {
  const collections = ["users", "tenants", "notes", "invites"];
  for (const name of collections) {
    if (mongoose.connection.collections[name]) {
      await mongoose.connection.collections[name].deleteMany({});
      console.log(`Cleared ${name} collection`);
    }
  }
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // 1️⃣ Clear DB
    await clearDatabase();

    // 2️⃣ Create tenants
    const tenants = {};
    for (const t of tenantsData) {
      const tenant = await Tenant.create(t);
      tenants[t.slug] = tenant;
      console.log(`Created tenant: ${t.name}`);
    }

    // 3️⃣ Create users
    for (const u of usersData) {
      const hashedPassword = await bcrypt.hash(u.password, SALT_ROUNDS);
      const tenant = tenants[u.tenantSlug];
      await User.create({
        email: u.email,
        passwordHash: hashedPassword,
        role: u.role,
        tenant: tenant._id,
      });
      console.log(`Created user: ${u.email} (${u.role})`);
    }

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDatabase();
