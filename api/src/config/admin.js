const bcrypt = require("bcryptjs");

/**
 * Developer admin credentials.
 *
 * The password is NEVER stored in plaintext — ADMIN_PASSWORD_HASH holds a bcrypt
 * hash, so a leaked .env or repo still does not hand over the login.
 *
 * Generate a new hash with:
 *   node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
 */

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "jayanth.m@ncetmail.com"
).toLowerCase();

// Default hash for "Admin@123" — used only when no hash is configured so the
// panel is usable immediately. Override ADMIN_PASSWORD_HASH in .env for anything
// beyond local/developer use.
const DEFAULT_HASH = "$2b$10$mDyHRartBeVDjSuj0dHgNudTUZDtfyTtk3iMTtyMSZEN.RyjaBZem";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

// Fixed second factor for developer access.
const ADMIN_OTP = process.env.ADMIN_OTP || "000000";

// Short-lived access token.
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "ngi-admin-dev-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || "8h";

// Simple in-memory throttle: N failed logins from an IP inside the window locks
// it out. Enough for a developer panel; swap for Redis if this is ever exposed.
const MAX_ATTEMPTS = Number(process.env.ADMIN_MAX_ATTEMPTS || 5);
const WINDOW_MS = Number(process.env.ADMIN_ATTEMPT_WINDOW_MS || 10 * 60 * 1000);

const attempts = new Map();

/** Records a failure and reports whether the caller is now locked out. */
const registerFailure = (key) => {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return { locked: false, remaining: MAX_ATTEMPTS - 1 };
  }

  entry.count += 1;
  const locked = entry.count >= MAX_ATTEMPTS;
  return { locked, remaining: Math.max(0, MAX_ATTEMPTS - entry.count) };
};

const clearFailures = (key) => attempts.delete(key);

/** Drops every recorded failure. Used by tests between cases. */
const resetAttempts = () => attempts.clear();

const isLocked = (key) => {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
};

const verifyPassword = (plain) => {
  try {
    return bcrypt.compareSync(plain, ADMIN_PASSWORD_HASH);
  } catch {
    return false;
  }
};

/** Constant-time-ish comparison so the OTP does not leak by timing. */
const verifyOtp = (supplied) => {
  const a = String(supplied ?? "");
  const b = String(ADMIN_OTP);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

module.exports = {
  ADMIN_EMAIL,
  ADMIN_OTP,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  MAX_ATTEMPTS,
  verifyPassword,
  verifyOtp,
  registerFailure,
  clearFailures,
  resetAttempts,
  isLocked,
};
