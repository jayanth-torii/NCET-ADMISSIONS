/**
 * Tests for the Weekly Admissions Report email — a short note that points at the
 * attached workbook rather than listing applicants.
 */
const assert = require("node:assert/strict");

const { buildWeeklyDigest } = require("../src/emails/weeklyDigest.template");
const { startWeeklySchedule } = require("../src/jobs/weeklyDigest");

const COUNSELLOR = {
  name: "Venugopal Reddy N",
  designation: "Director – Admissions",
  region: "Andhra Pradesh",
  phones: ["9949166771", "9985165771"],
  email: "admissionsap@ncetmail.com",
  officeAddress: "#105-B, 1st Floor, Sai Vasanth Complex, Kurnool – 518002",
};

const APPLICATION = {
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
  homeTownAddress: "4-12-8, Gandhi Nagar, Kurnool",
  createdAt: "2026-10-03T04:20:00.000Z",
};

const SENT_AT = new Date("2026-10-05T03:30:00.000Z");
const build = (apps, extra = {}) =>
  buildWeeklyDigest({
    applications: apps,
    counsellor: COUNSELLOR,
    dashboardUrl: "https://example.com",
    sentAt: SENT_AT,
    ...extra,
  });

describe("weekly report subject", () => {
  it("names the desk and the week ending", () => {
    const { subject } = build([APPLICATION]);
    assert.match(subject, /Weekly Admissions Report/);
    assert.match(subject, /Andhra Pradesh/);
    assert.match(subject, /week ending 05 October 2026/);
  });
});

describe("weekly report summary", () => {
  it("counts applications, colleges and female applicants", () => {
    const { stats } = build([
      APPLICATION,
      { ...APPLICATION, gender: "male", interCollegePlace: "Tirupati" },
      { ...APPLICATION, gender: "female", interCollegePlace: "Tirupati" },
    ]);

    assert.equal(stats.count, 3);
    assert.equal(stats.college_count, 2, "distinct inter-college places");
    assert.equal(stats.female_count, 2);
    assert.equal(stats.male_count, 1);
  });

  it("reports a seven-day window ending on the send date", () => {
    const { stats } = build([APPLICATION]);
    assert.equal(stats.period, "29 September – 05 October 2026");
    assert.equal(stats.weekEnding, "05 October 2026");
  });

  it("handles a quiet week without dividing by zero", () => {
    const { stats, html } = build([]);
    assert.equal(stats.count, 0);
    assert.equal(stats.college_count, 0);
    assert.equal(stats.female_count, 0);
    assert.ok(html.includes("Dear Sir/Madam"));
  });
});

describe("weekly report body", () => {
  it("follows the agreed note structure", () => {
    const { html } = build([APPLICATION], { filename: "NGI-Admissions-05-October-2026.xlsx" });

    assert.ok(html.includes("Dear Sir/Madam"));
    assert.ok(html.includes("Weekly Admissions Summary"));
    assert.ok(html.includes("New Applications Received"));
    assert.ok(html.includes("Colleges Represented"));
    assert.ok(html.includes("Female Applicants"));
    assert.ok(html.includes("Reporting Period"));
    assert.ok(html.includes("Application Number"));
    assert.ok(html.includes("Kindly review the report"));
    assert.ok(html.includes("NGI Admissions Team"));
  });

  it("names the attached workbook", () => {
    const { html, text } = build([APPLICATION], {
      filename: "NGI-Admissions-05-October-2026.xlsx",
    });
    assert.ok(html.includes("NGI-Admissions-05-October-2026.xlsx"));
    assert.ok(text.includes("Attached: NGI-Admissions-05-October-2026.xlsx"));
  });

  it("does NOT list applicants — the workbook is the record", () => {
    const { html, text } = build([APPLICATION]);
    assert.ok(!html.includes("Anitha Sharma"), "applicant name leaked into the body");
    assert.ok(!html.includes("KCET2026999"), "application number leaked into the body");
    assert.ok(!html.includes("9876543210"), "phone number leaked into the body");
    assert.ok(!text.includes("Anitha Sharma"));
  });

  it("still shows the summary numbers", () => {
    const { html, stats } = build([APPLICATION, APPLICATION]);
    assert.equal(stats.count, 2);

    // The count cell renders as "> ... 2 ... </td>", so match on the digits alone.
    assert.match(html, new RegExp(`>\\s*${stats.count}\\s*</td>`), "count cell not rendered");
    assert.match(
      html,
      new RegExp(`>\\s*${stats.college_count}\\s*</td>`),
      "college count not rendered"
    );
  });

  it("escapes the counsellor name if it contains markup", () => {
    const { html } = buildWeeklyDigest({
      applications: [],
      counsellor: { ...COUNSELLOR, name: '<b>Venugopal</b>' },
      dashboardUrl: "https://example.com",
    });
    assert.ok(!html.includes("<b>Venugopal</b>"));
    assert.ok(html.includes("&lt;b&gt;Venugopal&lt;/b&gt;"));
  });

  it("keeps the brand colours", () => {
    const { html } = build([APPLICATION]);
    assert.ok(html.includes("#0A1F44"), "navy missing");
    assert.ok(html.includes("#F6872A"), "ember missing");
  });
});

describe("weekly digest scheduler", () => {
  it("arms and disarms cleanly", () => {
    const stop = startWeeklySchedule(() => {});
    assert.equal(typeof stop, "function");
    stop();
  });

  it("stays quiet outside the Saturday 09:00 IST window", async () => {
    let fired = 0;
    const stop = startWeeklySchedule(() => {
      fired += 1;
    });

    await new Promise((r) => setTimeout(r, 1200));
    stop();

    const ist = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const isSlot = /Sat/.test(ist) && /09:0\d/.test(ist);
    assert.equal(fired, isSlot ? fired : 0);
  });
});
