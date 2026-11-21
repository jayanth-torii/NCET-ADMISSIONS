const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

/**
 * Origins allowed to call the API from a browser.
 *
 * These are always allowed, so a missing or stale CORS_ORIGIN on the host
 * cannot lock the live admissions desk out of its own API. Anything in
 * CORS_ORIGIN is added on top.
 */
const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://ap-ngi.vercel.app",
];

/** Vercel preview deployments of this project: ap-ngi-<branch-or-hash>.vercel.app */
const PREVIEW_ORIGIN = /^https:\/\/ap-ngi-[a-z0-9-]+\.vercel\.app$/;

/** Trailing slashes and casing differ between hosts; an Origin header never has a path. */
const normalise = (value) => String(value).trim().replace(/\/+$/, "").toLowerCase();

const allowList = new Set(DEFAULT_ORIGINS.map(normalise));
(process.env.CORS_ORIGIN || "")
  .split(",")
  .map(normalise)
  .filter(Boolean)
  .forEach((origin) => allowList.add(origin));

const isAllowedOrigin = (origin) => {
  const candidate = normalise(origin);
  return allowList.has(candidate) || PREVIEW_ORIGIN.test(candidate);
};

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header at all: curl, health checks, server-to-server. Not a browser,
      // so there is nothing for CORS to protect.
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);

      // Answer without the allow header rather than throwing: the browser still
      // reports a clean CORS failure, and the log says which origin to add.
      console.warn(`[cors] blocked origin: ${origin}`);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) =>
  res.json({ success: true, message: "NGI Admissions API is running", docs: "/api/health" })
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
module.exports.isAllowedOrigin = isAllowedOrigin;
