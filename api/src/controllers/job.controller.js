const { run } = require("../jobs/weeklyDigest");
const { asyncHandler } = require("../utils/httpError");

/**
 * POST /api/jobs/weekly-digest — send the weekly admissions digest now.
 *
 * Intended for an external cron (GitHub Actions, Vercel Cron, a Windows
 * scheduled task). It is NOT protected by auth, so put it behind your
 * scheduler's secret or a shared token before exposing it publicly.
 */
const triggerWeeklyDigest = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.body?.days, 10) || 7, 90);
  const result = await run({ days, region: req.body?.region });

  return res.status(200).json({ success: true, ...result });
});

module.exports = { triggerWeeklyDigest };
