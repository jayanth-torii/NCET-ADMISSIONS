const mongoose = require("mongoose");

const GENDERS = ["male", "female", "other"];

/**
 * Programmes a student can express interest in: every NCET B.E. branch,
 * the UG degrees and the PG programmes. Shared with the form's course
 * dropdown — keep both lists in sync.
 */
const COURSES = [
  // B.E. (NCET)
  "B.E. Computer Science & Engineering",
  "B.E. CSE (AI & ML)",
  "B.E. CSE (Data Science)",
  "B.E. CSE (Cyber Security)",
  "B.E. Information Science & Engineering",
  "B.E. Electronics & Communication",
  "B.E. Civil Engineering",
  // UG degrees
  "BCA",
  "BBA",
  "B.Com",
  // PG
  "MCA",
  "MBA",
];

/**
 * One admission application submitted through the NGI Admissions landing page.
 * Field names mirror the approved form spec (student / inter-college / app number /
 * home town) so the admissions desk can read exports without translation.
 */
const ApplicationSchema = new mongoose.Schema(
  {
    // --- Student ---
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    studentMobile: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },
    studentWhatsApp: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },
    gender: { type: String, required: true, enum: GENDERS },
    interestedCourse: { type: String, required: true, trim: true, enum: COURSES },

    // --- Parent / Guardian ---
    fatherName: { type: String, required: true, trim: true, maxlength: 120 },
    fatherMobile: {
      type: String,
      required: true,
      trim: true,
      match: /^[6-9]\d{9}$/,
    },

    // --- Previous college ---
    interCollegeName: { type: String, required: true, trim: true, maxlength: 180 },
    interCollegePlace: { type: String, required: true, trim: true, maxlength: 120 },

    // --- Entrance exam ---
    // KCET / JEE Main / CET allotment number, whichever the student applied through.
    appNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 40 },

    // --- Address ---
    homeTownAddress: { type: String, required: true, trim: true, maxlength: 400 },

    // --- Operations ---
    // Which regional desk the lead was routed to (drives follow-up ownership).
    region: { type: String, trim: true, default: "Andhra Pradesh" },
    status: {
      type: String,
      enum: ["new", "contacted", "shortlisted", "enrolled", "closed"],
      default: "new",
      index: true,
    },
    submittedFrom: { type: String, trim: true, default: "ngi-admissions-landing" },
  },
  { timestamps: true }
);

ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ studentMobile: 1 });
ApplicationSchema.index({ appNumber: 1 });

module.exports = mongoose.model("Application", ApplicationSchema);
module.exports.GENDERS = GENDERS;
module.exports.COURSES = COURSES;
