export const tenantIsolation = (model, idParam = "id") => {
  return async (req, res, next) => {
    try {
      const record = await model.findById(req.params[idParam]);
      if (!record) return res.status(404).json({ error: "Resource not found" });

      if (record.tenant.toString() !== req.user.tenant.toString()) {
        return res.status(403).json({ error: "Access denied: wrong tenant" });
      }
      
      req.record = record;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };
};
