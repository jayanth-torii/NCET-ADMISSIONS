const mongoose = require("mongoose");

/**
 * Regional admission counsellor shown on the landing page.
 * Seeded from the official visiting card so the page and the API share one source.
 */
const CounselorSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    phones: {
      type: [String],
      validate: [(v) => v.length > 0, "At least one phone number is required"],
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    officeAddress: { type: String, trim: true },
    website: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    languages: { type: [String], default: [] },
    message: { type: String, trim: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Counselor", CounselorSchema);
