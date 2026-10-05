const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/application.controller");
const counselorController = require("../controllers/counselor.controller");
const jobController = require("../controllers/job.controller");
const { applicationRules, validate } = require("../validators/application.validator");
const { asyncHandler } = require("../utils/httpError");

router.get("/health", (req, res) =>
  res.json({ success: true, service: "ngi-admissions-api", time: new Date().toISOString() })
);

// --- Applications (admission form) ---
router.post("/applications", applicationRules(), validate, asyncHandler(applicationController.createApplication));
router.get("/applications", asyncHandler(applicationController.listApplications));
router.get("/applications/:id", asyncHandler(applicationController.getApplication));
router.patch("/applications/:id/status", asyncHandler(applicationController.updateStatus));

// --- Counselors ---
router.get("/counselors", asyncHandler(counselorController.listCounselors));
router.get("/counselors/:slug", asyncHandler(counselorController.getCounselor));

// --- Scheduled jobs (trigger externally, e.g. GitHub Actions / Vercel Cron) ---
router.post("/jobs/weekly-digest", jobController.triggerWeeklyDigest);

module.exports = router;
