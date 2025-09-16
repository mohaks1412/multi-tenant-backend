import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    
    const token = req.cookies.token;
    if (!token) {
      
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tenant: decoded.tenant,
      tenantSlug: decoded.tenantSlug,
      plan: decoded.plan
    };
    
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
