const Application = require("../models/application.model");

// Only these keys are copied from the request body, so a client cannot
// inject arbitrary fields such as `status` or `region`.
const ALLOWED_FIELDS = [
  "studentName",
  "studentMobile",
  "studentWhatsApp",
  "gender",
  "fatherName",
  "fatherMobile",
  "interCollegeName",
  "interCollegePlace",
  "appNumber",
  "homeTownAddress",
];

/** Normalises whitespace and uppercases the exam application number. */
const clean = (value) => String(value).trim().replace(/\s+/g, " ");

const createApplication = async (body) => {
  const doc = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined && body[key] !== null) {
      doc[key] = key === "appNumber" ? clean(body[key]).toUpperCase() : clean(body[key]);
    }
  }

  const application = await new Application(doc).save();

  // Best-effort duplicate hint. The same exam number can legitimately be
  // re-submitted after a correction, so this never blocks the insert.
  let duplicateOf = null;
  try {
    const prior = await Application.findOne({
      _id: { $ne: application._id },
      $or: [{ appNumber: application.appNumber }, { studentMobile: application.studentMobile }],
    }).select("_id createdAt");

    if (prior) duplicateOf = prior._id;
  } catch (err) {
    console.warn("[applications] duplicate lookup failed:", err.message);
  }

  return { application, duplicateOf };
};

const listApplications = async ({ status, limit = 50, skip = 0 } = {}) => {
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ]);
  return { items, total };
};

const getApplication = async (id) => Application.findById(id);

const updateStatus = async (id, status) => {
  const application = await Application.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  return application;
};

module.exports = {
  createApplication,
  listApplications,
  getApplication,
  updateStatus,
  ALLOWED_FIELDS,
};
