require("dotenv").config();

const connectDB = require("../config/db");
const mongoose = require("mongoose");
const Application = require("../models/application.model");
const Counselor = require("../models/counselor.model");
const { sendWeeklyDigest } = require("../services/email.service");

/**
 * Weekly admissions digest.
 *
 * Collects applications submitted in the last 7 days and emails them to the
 * regional counsellor.
 *
 * Run it three ways:
 *   - `npm run digest`                  one-off, right now
 *   - `npm run digest -- --schedule`    stay resident, run every Saturday 09:00 IST
 *   - POST /api/jobs/weekly-digest      trigger from an external cron
 */

const DASHBOARD_URL = process.env.DASHBOARD_URL || "http://localhost:3000/";
const TIMEZONE = "Asia/Kolkata";

/** Saturday at 09:00 in the institute's timezone. */
const SCHEDULE = { weekday: 6, hour: 9, minute: 0 };

const since = (days = 7) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/** Fetches the week's applications and the counsellor to notify. */
const collect = async ({ days = 7, region } = {}) => {
  const filter = { createdAt: { $gte: since(days) } };
  if (region) filter.region = region;

  const [applications, counselor] = await Promise.all([
    Application.find(filter).sort({ createdAt: 1 }),
    Counselor.findOne({ active: true }),
  ]);

  return { applications, counselor };
};

/** Builds and sends one digest. */
const run = async (options = {}) => {
  const { applications, counselor } = await collect(options);

  if (!counselor) {
    console.error("[digest] no active counsellor found — run `npm run seed` first.");
    return { sent: false, reason: "no-counsellor", applications: applications.length };
  }

  // DIGEST_TO redirects the mail without touching stored data — used for
  // staging sends and for testing against a real inbox.
  const target = { ...counselor.toObject() };
  if (process.env.DIGEST_TO) {
    target.email = process.env.DIGEST_TO;
    console.log(`[digest] DIGEST_TO override — sending to ${target.email} instead.`);
  }

  return sendWeeklyDigest({
    applications,
    counsellor: target,
    dashboardUrl: DASHBOARD_URL,
  });
};

/**
 * Fires `fn` every Saturday at 09:00 IST.
 *
 * Uses local-time arithmetic rather than a cron dependency so there is nothing
 * extra to install, and checks once a minute — cheap, and accurate to a minute.
 */
const startWeeklySchedule = (fn = run) => {
  let lastRunDay = -1;

  const tick = () => {
    const now = new Date();
    // en-CA gives an unambiguous YYYY-MM-DD date in the target timezone.
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const get = (type) => parts.find((p) => p.type === type)?.value;
    const weekday = get("weekday");
    const hour = Number(get("hour")) % 24;
    const minute = Number(get("minute"));

    // Date.now() in IST to derive a stable "day of year" for de-duplication.
    const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(now);

    if (weekday === "Sat" && hour === SCHEDULE.hour && minute === SCHEDULE.minute) {
      if (dayKey !== lastRunDay) {
        lastRunDay = dayKey;
        console.log(`[digest] Saturday slot reached — running digest.`);
        fn().catch((err) => console.error("[digest] failed:", err.message));
      }
    }
  };

  const timer = setInterval(tick, 60_000);
  tick();

  console.log(
    `[digest] scheduler armed — every Saturday ${String(SCHEDULE.hour).padStart(2, "0")}:${String(SCHEDULE.minute).padStart(2, "0")} ${TIMEZONE}`
  );

  return () => clearInterval(timer);
};

/** CLI entry: one run, or stay resident. */
const main = async () => {
  await connectDB();

  if (process.argv.includes("--schedule")) {
    startWeeklySchedule(run);
    return;
  }

  const result = await run();
  console.log("[digest] result:", JSON.stringify(result));
  await mongoose.disconnect();
  process.exit(0);
};

if (require.main === module) {
  main().catch((err) => {
    console.error("[digest] fatal:", err);
    process.exit(1);
  });
}

module.exports = { run, collect, startWeeklySchedule };
