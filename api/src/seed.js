require("dotenv").config();

const connectDB = require("./config/db");
const Counselor = require("./models/counselor.model");

/**
 * Counsellor details transcribed from the official NGI visiting card
 * ("venugopal visiting card ngi.pdf") and cross-checked with a second OCR pass.
 */
const COUNSELORS = [
  {
    slug: "venugopal-reddy",
    name: "Venugopal Reddy N",
    designation: "Director – Admissions",
    region: "Andhra Pradesh",
    phones: ["9949166771", "9985165771"],
    email: "admissionsap@ncetmail.com",
    officeAddress:
      "#105-B, 1st Floor, Sai Vasanth Complex, N.G. Birla Compound, Kurnool – 518002",
    website: "https://www.ncet.co.in",
    languages: ["Telugu", "English", "Kannada", "Hindi"],
    message:
      "Call or WhatsApp for programme guidance, eligibility clarification and campus visit scheduling.",
    active: true,
  },
];

(async () => {
  await connectDB();

  for (const counselor of COUNSELORS) {
    const saved = await Counselor.findOneAndUpdate(
      { slug: counselor.slug },
      counselor,
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`[seed] counsellor ready: ${saved.name} (${saved.slug})`);
  }

  process.exit(0);
})().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
