/**
 * Renders the Weekly Admissions Report to `out/` so the mail can be reviewed in
 * a browser before any credentials exist. Sends nothing.
 *
 *   node scripts/preview-digest.js
 */
const fs = require("node:fs");
const path = require("node:path");

const { buildWeeklyDigest } = require("../src/emails/weeklyDigest.template");
const { buildWorkbook } = require("../src/emails/buildWorkbook");

const counsellor = {
  name: "Venugopal Reddy N",
  designation: "Director – Admissions",
  region: "Andhra Pradesh",
  phones: ["9949166771", "9985165771"],
  email: "admissionsap@ncetmail.com",
  officeAddress:
    "#105-B, 1st Floor, Sai Vasanth Complex, N.G. Birla Compound, Kurnool – 518002",
};

const applications = [
  {
    studentName: "Anitha Sharma",
    studentMobile: "9876543210",
    studentWhatsApp: "9876543211",
    gender: "female",
    interestedCourse: "B.E. Computer Science & Engineering",
    fatherName: "Ramesh Sharma",
    fatherMobile: "9123456780",
    interCollegeName: "Sri Chaitanya Junior College",
    interCollegePlace: "Kurnool",
    appNumber: "KCET2026999",
    homeTownAddress: "4-12-8, Gandhi Nagar, Kurnool, Andhra Pradesh 518004",
    status: "new",
    createdAt: "2026-10-03T04:20:00.000Z",
  },
  {
    studentName: "Rahul Krishna",
    studentMobile: "9812345678",
    studentWhatsApp: "9812345679",
    gender: "male",
    interestedCourse: "B.E. Electronics & Communication",
    fatherName: "Krishna Reddy",
    fatherMobile: "9008007000",
    interCollegeName: "Narayana Junior College",
    interCollegePlace: "Tirupati",
    appNumber: "JEE202604412",
    homeTownAddress: "6-2-14, Gandhi Road, Tirupati, Andhra Pradesh 517501",
    status: "new",
    createdAt: "2026-10-04T09:05:00.000Z",
  },
  {
    studentName: "Sneha Priya",
    studentMobile: "9700112233",
    studentWhatsApp: "9700112234",
    gender: "female",
    interestedCourse: "MCA",
    fatherName: "Suresh Babu",
    fatherMobile: "9445566778",
    interCollegeName: "Sri Chaitanya Junior College",
    interCollegePlace: "Kurnool",
    appNumber: "KCET20261002",
    homeTownAddress: "1-9-3, Nehru Nagar, Nandyal",
    status: "new",
    createdAt: "2026-10-05T11:40:00.000Z",
  },
];

const SENT_AT = new Date("2026-10-05T03:30:00.000Z");

(async () => {
  const { subject, html, text, stats } = buildWeeklyDigest({
    applications,
    counsellor,
    dashboardUrl: "https://admissions.ncet.co.in/",
    sentAt: SENT_AT,
    filename: "NGI-Admissions-05-October-2026.xlsx",
  });

  const { buffer, filename } = await buildWorkbook(applications, {
    weekEnding: stats.weekEnding,
    region: counsellor.region,
  });

  const outDir = path.join(__dirname, "..", "..", "out");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, "weekly-report-preview.html"), html);
  fs.writeFileSync(path.join(outDir, "weekly-report-preview.txt"), text);
  fs.writeFileSync(path.join(outDir, "weekly-report-subject.txt"), subject);
  fs.writeFileSync(path.join(outDir, filename), buffer);

  // Guard: the body must not carry applicant data — that lives in the workbook.
  const leaked = applications.filter((a) => html.includes(a.studentName) || html.includes(a.appNumber));
  if (leaked.length) {
    console.error(`LEAK: ${leaked.length} applicant(s) appear in the email body`);
    process.exitCode = 1;
  }

  console.log("Subject: ", subject);
  console.log("Stats:   ", JSON.stringify(stats));
  console.log("Workbook:", filename, `(${buffer.length} bytes)`);
  console.log("Preview: ", path.join(outDir, "weekly-report-preview.html"));
  console.log("Leak check: passed (no applicant data in the body)");
})();
