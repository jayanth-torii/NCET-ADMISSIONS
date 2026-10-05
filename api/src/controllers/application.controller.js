const applicationService = require("../services/application.service");
const { ApiError } = require("../utils/httpError");

/** POST /api/applications — submit the admission form. */
const createApplication = async (req, res) => {
  const { application, duplicateOf } = await applicationService.createApplication(req.body || {});

  return res.status(201).json({
    success: true,
    message: "Application received. Our admissions counsellor will call you shortly.",
    application: {
      id: application._id,
      studentName: application.studentName,
      appNumber: application.appNumber,
      status: application.status,
      submittedAt: application.createdAt,
    },
    duplicateOf,
  });
};

/** GET /api/applications?status=new&limit=50&skip=0 — admissions desk listing. */
const listApplications = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

  const { items, total } = await applicationService.listApplications({
    status: req.query.status,
    limit,
    skip,
  });

  return res.status(200).json({ success: true, count: items.length, total, applications: items });
};

/** GET /api/applications/:id */
const getApplication = async (req, res) => {
  const application = await applicationService.getApplication(req.params.id);
  if (!application) throw new ApiError(404, "Application not found");
  return res.status(200).json({ success: true, application });
};

/** PATCH /api/applications/:id/status */
const updateStatus = async (req, res) => {
  const application = await applicationService.updateStatus(req.params.id, req.body.status);
  if (!application) throw new ApiError(404, "Application not found");
  return res.status(200).json({ success: true, application });
};

module.exports = { createApplication, listApplications, getApplication, updateStatus };
