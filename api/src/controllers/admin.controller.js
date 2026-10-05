const jwt = require("jsonwebtoken");

const Application = require("../models/application.model");
const { asyncHandler } = require("../utils/httpError");
const {
  ADMIN_EMAIL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  verifyPassword,
  verifyOtp,
  registerFailure,
  clearFailures,
  isLocked,
  MAX_ATTEMPTS,
} = require("../config/admin");

/**
 * Developer admin API.
 *
 * Two-step login:
 *   POST /api/admin/login  { email, password }  -> a short-lived OTP challenge
 *   POST /api/admin/verify { email, otp, challenge } -> { token }
 *
 * The challenge is signed and expires in 5 minutes, so the OTP step cannot be
 * skipped or replayed from a stale session.
 */

const CHALLENGE_TTL = "5m";

const signChallenge = (email) =>
  jwt.sign({ sub: email, scope: "otp" }, JWT_SECRET, { expiresIn: CHALLENGE_TTL });

const signSession = (email) =>
  jwt.sign({ sub: email, scope: "admin" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/** POST /api/admin/login — step 1. */
const login = async (req, res) => {
  const key = req.ip || "unknown";

  if (isLocked(key)) {
    return res.status(429).json({
      success: false,
      message: "Too many failed attempts. Try again in a few minutes.",
    });
  }

  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  // Both checks always run, so a wrong email and a wrong password cost the same.
  const emailOk = email === ADMIN_EMAIL;
  const passwordOk = verifyPassword(password);

  if (!emailOk || !passwordOk) {
    const { locked, remaining } = registerFailure(key);
    if (locked) {
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Locked for ${MAX_ATTEMPTS} attempts.`,
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      attemptsRemaining: remaining,
    });
  }

  clearFailures(key);

  return res.status(200).json({
    success: true,
    message: "Enter the developer OTP.",
    email,
    challenge: signChallenge(email),
  });
};

/** POST /api/admin/verify — step 2. */
const verify = async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const otp = String(req.body?.otp || "");
  const challenge = String(req.body?.challenge || "");

  let payload;
  try {
    payload = jwt.verify(challenge, JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Session expired. Sign in again." });
  }

  if (payload.scope !== "otp" || payload.sub !== email || !verifyOtp(otp)) {
    return res.status(401).json({ success: false, message: "Incorrect OTP." });
  }

  return res.status(200).json({
    success: true,
    token: signSession(email),
    user: { email },
  });
};

/** GET /api/admin/me — cheap token check so the client can restore a session. */
const me = async (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.scope !== "admin") throw new Error("wrong scope");
    return res.status(200).json({ success: true, user: { email: payload.sub } });
  } catch {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
};

/** GET /api/admin/stats — pipeline summary for the dashboard cards. */
const stats = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, inRange, byStatus, recent] = await Promise.all([
    Application.countDocuments(),
    Application.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Application.find({ createdAt: { $gte: sevenDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const statusCounts = { new: 0, contacted: 0, shortlisted: 0, enrolled: 0, closed: 0 };
  for (const row of byStatus) {
    if (row._id in statusCounts) statusCounts[row._id] = row.count;
  }

  return res.status(200).json({
    success: true,
    stats: { total, inRange, statusCounts, recent: recent.length },
  });
});

module.exports = { login, verify, me, stats };
