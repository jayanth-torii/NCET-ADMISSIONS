const counselorService = require("../services/counselor.service");
const { ApiError } = require("../utils/httpError");

/** GET /api/counselors — active counsellors for the landing page. */
const listCounselors = async (req, res) => {
  const counselors = await counselorService.listActive();
  return res.status(200).json({ success: true, count: counselors.length, counselors });
};

/** GET /api/counselors/:slug */
const getCounselor = async (req, res) => {
  const counselor = await counselorService.getBySlug(req.params.slug);
  if (!counselor) throw new ApiError(404, "Counselor not found");
  return res.status(200).json({ success: true, counselor });
};

module.exports = { listCounselors, getCounselor };
