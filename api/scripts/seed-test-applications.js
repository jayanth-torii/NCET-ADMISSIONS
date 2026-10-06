/**
 * Seeds a handful of realistic applications so the weekly digest can be tested
 * end to end without waiting for real traffic.
 *
 *   node scripts/seed-test-applications.js
 */
require("dotenv").config();

const connectDB = require("../src/config/db");
const Application = require("../src/models/application.model");
const Counselor = require("../src/models/counselor.model");

const COUNSELLOR = {
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
};

const SAMPLES = [
  {
    studentName: "Anitha Sharma",
    studentMobile: "9876543210",
    studentWhatsApp: "9876543211",
    gender: "female",
    fatherName: "Ramesh Sharma",
    fatherMobile: "9123456780",
    interCollegeName: "Sri Chaitanya Junior College",
    interCollegePlace: "Kurnool",
    appNumber: "KCET2026999",
    homeTownAddress: "4-12-8, Gandhi Nagar, Kurnool, Andhra Pradesh 518004",
  },
  {
    studentName: "Rahul Krishna",
    studentMobile: "9812345678",
    studentWhatsApp: "9812345679",
    gender: "male",
    fatherName: "Krishna Reddy",
    fatherMobile: "9008007000",
    interCollegeName: "Narayana Junior College",
    interCollegePlace: "Tirupati",
    appNumber: "JEE202604412",
    homeTownAddress: "6-2-14, Gandhi Road, Tirupati, Andhra Pradesh 517501",
  },
  {
    studentName: "Sneha Priya",
    studentMobile: "9700112233",
    studentWhatsApp: "9700112234",
    gender: "female",
    fatherName: "Suresh Babu",
    fatherMobile: "9445566778",
    interCollegeName: "Sri Chaitanya Junior College",
    interCollegePlace: "Kurnool",
    appNumber: "KCET20261002",
    homeTownAddress: "1-9-3, Nehru Nagar, Nandyal, Andhra Pradesh 518502",
  },
  {
    studentName: "Mohammed Irfan",
    studentMobile: "9632587410",
    studentWhatsApp: "9632587411",
    gender: "male",
    fatherName: "Abdul Rahman",
    fatherMobile: "9848012345",
    interCollegeName: "Vidy Mandir Junior College",
    interCollegePlace: "Kadapa",
    appNumber: "KCET20261017",
    homeTownAddress: "3-5-9, Yerraguntla, Kadapa, Andhra Pradesh 516520",
  },
];

(async () => {
  await connectDB();

  await Counselor.findOneAndUpdate({ slug: COUNSELLOR.slug }, COUNSELLOR, {
    upsert: true,
    new: true,
    runValidators: true,
  });
  console.log("[seed] counsellor ready");

  // Spread the samples over the past few days so they fall inside the 7-day window.
  for (let i = 0; i < SAMPLES.length; i += 1) {
    const when = new Date(Date.now() - i * 36 * 60 * 60 * 1000);
    const doc = await Application.create({ ...SAMPLES[i], createdAt: when, updatedAt: when });
    console.log(`[seed] application ${doc.studentName} (${doc.appNumber})`);
  }

  const total = await Application.countDocuments();
  console.log(`[seed] ${total} application(s) in total`);
  process.exit(0);
})().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
