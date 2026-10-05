const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/application.controller");
const counselorController = require("../controllers/counselor.controller");
const jobController = require("../controllers/job.controller");
const adminController = require("../controllers/admin.controller");
const { applicationRules, validate } = require("../validators/application.validator");
const { asyncHandler } = require("../utils/httpError");
const { requireAdmin } = require("../middleware/auth");

router.get("/health", (req, res) =>
  res.json({ success: true, service: "ngi-admissions-api", time: new Date().toISOString() })
);

// --- Applications (admission form) ---
router.post("/applications", applicationRules(), validate, asyncHandler(applicationController.createApplication));

// Reading applicant data requires an admin session.
router.get("/applications", requireAdmin, asyncHandler(applicationController.listApplications));
router.get("/applications/:id", requireAdmin, asyncHandler(applicationController.getApplication));
router.patch("/applications/:id/status", requireAdmin, asyncHandler(applicationController.updateStatus));

// --- Counselors (public: the landing page needs them) ---
router.get("/counselors", asyncHandler(counselorController.listCounselors));
router.get("/counselors/:slug", asyncHandler(counselorController.getCounselor));

// --- Scheduled jobs (trigger externally, e.g. GitHub Actions / Vercel Cron) ---
router.post("/jobs/weekly-digest", jobController.triggerWeeklyDigest);

// --- Developer admin ---
router.post("/admin/login", asyncHandler(adminController.login));
router.post("/admin/verify", asyncHandler(adminController.verify));
router.get("/admin/me", asyncHandler(adminController.me));
router.get("/admin/stats", requireAdmin, asyncHandler(adminController.stats));

module.exports = router;
