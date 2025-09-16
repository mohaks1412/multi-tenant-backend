import Note from "../models/Note.js";
import Tenant from "../models/Tenant.js"

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const tenantId = req.user.tenant;
    console.log(req.user);
    const tenant = await Tenant.findById(req.user.tenant);
    if (tenant.plan === "free") {
      const count = await Note.countDocuments({ tenant: tenantId });
      if (count >= 3) {
        return res.status(403).json({ error: "Free plan limit reached" });
      }
    }

    const note = await Note.create({
      title,
      content,
      tenant: tenantId,
      createdBy: req.user.id
    });

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all notes for current tenant
export const getNotes = async (req, res) => {
  try {

    console.log(req.user);
    
    const notes = await Note.find({ tenant: req.user.tenant });
    const tenant = await Tenant.findOne({ slug: req.user.tenantSlug }); // get plan info

    console.log({ notes, tenant });
    
    res.json({ notes, tenant }); // return both notes and tenant info
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


// Get a single note
export const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, tenant: req.user.tenant });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, tenant: req.user.tenant },
      { title: req.body.title, content: req.body.content },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, tenant: req.user.tenant });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
