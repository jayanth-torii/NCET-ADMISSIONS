const { body, validationResult } = require("express-validator");

const trim = (field) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .bail();

const mobile = (field) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .bail()
    .matches(/^[6-9]\d{9}$/)
    .withMessage(`${field} must be a valid 10-digit Indian mobile number`);

/**
 * Validation for the NGI Admissions application form.
 * Every field on the approved spec is required.
 */
const applicationRules = () => [
  trim("studentName").isLength({ min: 2, max: 120 }).withMessage("Student name looks too short"),
  mobile("studentMobile"),
  mobile("studentWhatsApp"),
  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required")
    .bail()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be one of male, female, other"),
  trim("fatherName").isLength({ min: 2, max: 120 }).withMessage("Father name looks too short"),
  mobile("fatherMobile"),
  trim("interCollegeName").isLength({ min: 2, max: 180 }).withMessage("Inter college name is required"),
  trim("interCollegePlace").isLength({ min: 2, max: 120 }).withMessage("Inter college place is required"),
  trim("appNumber").isLength({ max: 40 }).withMessage("Application number is too long"),
  trim("homeTownAddress").isLength({ min: 5, max: 400 }).withMessage("Home town address is required"),
];

/** Flattens express-validator output into the same shape the frontend expects. */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(422).json({
    success: false,
    message: "Please correct the highlighted fields.",
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

module.exports = { applicationRules, validate };
