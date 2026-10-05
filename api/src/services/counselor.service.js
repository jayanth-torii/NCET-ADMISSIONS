const Counselor = require("../models/counselor.model");

const listActive = async () => Counselor.find({ active: true }).sort({ createdAt: 1 });

const getBySlug = async (slug) => Counselor.findOne({ slug, active: true });

module.exports = { listActive, getBySlug };
