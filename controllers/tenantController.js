import Tenant from "../models/Tenant.js";

export const upgradePlan = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    // Upgrade plan
    tenant.plan = "pro";
    await tenant.save();

    res.json({ message: `${tenant.name} upgraded to Pro plan!`, plan: tenant.plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
