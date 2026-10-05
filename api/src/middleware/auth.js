const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/admin");

/**
 * Requires a valid admin session token.
 *
 * Applied to the admissions listing so the raw applicant data is never public —
 * POST /api/applications stays open, since that is the public form.
 */
const requireAdmin = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.scope !== "admin") throw new Error("wrong scope");
    req.admin = { email: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Session expired. Sign in again." });
  }
};

module.exports = { requireAdmin };
