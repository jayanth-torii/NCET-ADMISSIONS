/**
 * Browser end-to-end test for the NGI Admissions landing page.
 *
 * Drives the real form the way a student would: fills every field, submits,
 * and asserts the success state renders and the API accepted the payload.
 *
 *   node scripts/e2e.js
 *
 * Requires the API on :4005 and the web app on :3000 to be running.
 */
const { chromium } = require("playwright");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const WEB = process.env.WEB_URL || "http://localhost:3000";
const API = process.env.API_URL || "http://localhost:4005";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "jayanth.m@ncetmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_OTP = process.env.ADMIN_OTP || "000000";

/**
 * Applicant data is admin-only, so verifying that a submission reached Mongo
 * needs a developer session. Runs the same two-step login the panel uses.
 */
async function getAdminToken() {
  const login = await fetch(`${API}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`admin login failed: ${login.status}`);

  const { challenge, email } = await login.json();

  const verify = await fetch(`${API}/api/admin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp: ADMIN_OTP, challenge }),
  });
  if (!verify.ok) throw new Error(`admin verify failed: ${verify.status}`);

  return (await verify.json()).token;
}

const APPLICANT = {
  studentName: "Anitha Sharma",
  studentMobile: "9876543210",
  fatherName: "Ramesh Sharma",
  fatherMobile: "9123456780",
  interCollegeName: "Sri Chaitanya Junior College",
  interCollegePlace: "Kurnool",
  appNumber: "KCET2026999",
  homeTownAddress: "4-12-8, Gandhi Nagar, Kurnool, Andhra Pradesh 518004",
};

const results = [];
const check = (name, passed, detail = "") => {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(e.message));

  await page.goto(WEB, { waitUntil: "networkidle" });

  check("page loads", (await page.title()).includes("NGI Admissions"), await page.title());

  // --- All nine form fields are present and labelled ---
  // Addressed by input name rather than label text: marketing copy rewords
  // labels often, but the names are what the API contract depends on.
  const FIELDS = [
    ["studentName", "Student name"],
    ["studentMobile", "Student mobile"],
    ["fatherName", "Father / guardian name"],
    ["fatherMobile", "Father / guardian mobile"],
    ["interCollegeName", "Inter college name"],
    ["interCollegePlace", "Inter college place"],
    ["appNumber", "Application number"],
    ["homeTownAddress", "Home town address"],
  ];

  for (const [name, label] of FIELDS) {
    const count = await page.locator(`[name="${name}"]`).count();
    check(`field "${label}" exists`, count === 1, `${count} match(es)`);
  }

  // Gender is a listbox rather than a native input, so assert its label.
  check(
    `field "Gender" exists`,
    (await page.getByLabel(/^Gender/).count()) === 1
  );

  // --- Empty submit is blocked client-side ---
  await page.getByRole("button", { name: /submit admission enquiry/i }).click();
  const errorCount = await page.getByRole("alert").count();
  check("empty submit shows validation errors", errorCount > 0, `${errorCount} error(s)`);
  check(
    "still on the form (no false success)",
    (await page.getByText(/Thank you for applying/).count()) === 0
  );

  // --- Invalid mobile is rejected client-side ---
  await page.locator('[name="studentMobile"]').fill("12345");
  await page.getByRole("button", { name: /submit admission enquiry/i }).click();
  check(
    "invalid mobile blocks submission",
    (await page.getByText(/Thank you for applying/).count()) === 0
  );

  // --- Fill the form properly ---
  await page.locator('[name="studentName"]').fill(APPLICANT.studentName);
  await page.locator('[name="studentMobile"]').fill(APPLICANT.studentMobile);
  await page.getByLabel(/^Gender/).click();
  await page.getByRole("option", { name: "Female" }).click();
  await page.locator('[name="fatherName"]').fill(APPLICANT.fatherName);
  await page.locator('[name="fatherMobile"]').fill(APPLICANT.fatherMobile);
  await page.locator('[name="interCollegeName"]').fill(APPLICANT.interCollegeName);
  await page.locator('[name="interCollegePlace"]').fill(APPLICANT.interCollegePlace);
  await page.locator('[name="appNumber"]').fill(APPLICANT.appNumber);
  await page.locator('[name="homeTownAddress"]').fill(APPLICANT.homeTownAddress);

  await page.getByRole("button", { name: /submit admission enquiry/i }).click();

  await page.getByText(/Thank you for applying/).waitFor({ timeout: 15000 });
  check("success state renders after submit", true);

  // --- The record actually reached the API/Mongo ---
  const token = await getAdminToken();
  const res = await fetch(`${API}/api/applications?limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { applications } = await res.json();
  const stored = applications.find((a) => a.appNumber === APPLICANT.appNumber);

  check("application persisted to database", Boolean(stored));
  if (stored) {
    check("student name stored", stored.studentName === APPLICANT.studentName, stored.studentName);
    check("gender stored", stored.gender === "female", stored.gender);
    check("father name stored", stored.fatherName === APPLICANT.fatherName, stored.fatherName);
    check(
      "inter college stored",
      stored.interCollegeName === APPLICANT.interCollegeName,
      stored.interCollegeName
    );
    check("home town stored", stored.homeTownAddress === APPLICANT.homeTownAddress);
    check("status is new", stored.status === "new", stored.status);
  }

  // --- Counsellor card is populated from the API ---
  await page.reload({ waitUntil: "networkidle" });
  const applyText = await page.locator("#apply").innerText();
  check("counsellor name from API", applyText.includes("Venugopal Reddy"));
  check("counsellor designation", applyText.includes("Director"));
  check("first phone rendered", applyText.includes("9949166771"));
  check("second phone rendered", applyText.includes("9985165771"));
  check("email rendered", applyText.includes("admissionsap@ncetmail.com"));
  check("regional office rendered", applyText.includes("Kurnool"));

  // --- "Your counsellor details" heading, with counsellor above the form ---
  check(
    "section heading is 'Your counsellor details'",
    (await page.getByRole("heading", { name: "Your counsellor details" }).count()) === 1
  );
  check(
    "old 'Secure your future' heading removed",
    (await page.getByText("Secure your future").count()) === 0
  );

  const counsellorY = (await page.getByText("Venugopal Reddy N").first().boundingBox()).y;
  const formY = (await page.getByRole("button", { name: /submit admission enquiry/i }).boundingBox()).y;
  check("counsellor block sits above the form", counsellorY < formY, `${Math.round(counsellorY)} < ${Math.round(formY)}`);

  // --- Testimonials section removed ---
  check(
    "testimonials section removed",
    (await page.getByText("What our community says").count()) === 0
  );
  check("no Google Reviewer cards", (await page.getByText("Google Reviewer").count()) === 0);

  // --- NGI logo ---
  const logo = page.locator('img[alt="NGI logo"]').first();
  check("NGI logo present", (await logo.count()) === 1);
  check(
    "NGI logo actually loads",
    await logo.evaluate((el) => el.complete && el.naturalWidth > 0)
  );

  // Hero headline must keep real spaces between words (the reveal animation
  // renders each word as its own element).
  const heroText = (await page.getByRole("heading", { level: 1 }).innerText()).replace(/\s+/g, " ").trim();
  check(
    "hero headline has word spacing",
    /Admissions to the Nagarjuna Group of Institutions/i.test(heroText),
    heroText
  );

  // --- Typography matches NCET (Product Sans) ---
  // next/font/local registers the family as "productSans" (lower-cased, no space).
  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  check("Product Sans applied", /productsans/i.test(bodyFont), bodyFont);

  // The @font-face must actually load, not silently fall back to a system face.
  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some((f) =>
      /productsans/i.test(f.family) && f.status === "loaded"
    );
  });
  check("Product Sans webfont loaded", fontLoaded);

  // And that the rendered hero text actually uses it.
  const heroFont = await page
    .getByRole("heading", { level: 1 })
    .evaluate((el) => getComputedStyle(el).fontFamily);
  check("hero heading uses Product Sans", /productsans/i.test(heroFont), heroFont);

  // --- Every institution in the data file is rendered on the page ---
  // Parsed out of the data module as text so editorial renames do not need a
  // test edit (this script is plain Node and cannot import TypeScript).
  const siteSource = readFileSync(
    path.join(__dirname, "..", "web", "src", "data", "site.ts"),
    "utf8"
  );
  const institutionsBlock = siteSource.slice(
    siteSource.indexOf("export const institutions"),
    siteSource.indexOf("export const stats")
  );
  const instNames = [...institutionsBlock.matchAll(/^\s{4}name: "([^"]+)"/gm)].map((m) => m[1]);

  check("institutions data has six units", instNames.length === 6, `${instNames.length} found`);

  for (const name of instNames) {
    check(`institution listed: ${name}`, (await page.getByText(name).count()) >= 1);
  }

  // --- Verified "at a glance" figures from the deck ---
  const statsText = await page.locator("dl").first().innerText();
  for (const figure of ["1,152", "159", "25"]) {
    check(`stat present: ${figure}`, statsText.includes(figure), statsText.replace(/\n/g, " | "));
  }

  // --- Anchor navigation targets all resolve ---
  for (const id of ["institutions", "programmes", "process", "apply", "faq"]) {
    check(`section #${id} exists`, (await page.locator(`#${id}`).count()) === 1);
  }

  // The counsellor heading is an anchor inside the combined apply section, not a
  // standalone section of its own — so it must live within #apply.
  check(
    "#counsellor anchor lives inside #apply",
    (await page.locator("#apply #counsellor").count()) === 1
  );
  check(
    "no standalone counsellor section",
    (await page.locator("main > section#counsellor").count()) === 0
  );

  // --- Mobile viewport sanity check ---
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const menuButton = page.getByRole("button", { name: /open menu/i });
  check("mobile menu button visible", await menuButton.isVisible());
  await menuButton.click();
  check("mobile nav opens", (await page.locator("#mobile-nav").count()) === 1);
  await page.screenshot({ path: "e2e-mobile.png" });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "e2e-desktop.png", fullPage: true });

  // Ignore the expected SWR/CORS noise if any, but surface real page errors.
  const realErrors = consoleErrors.filter((e) => !/favicon|Failed to load resource/i.test(e));
  check("no uncaught page errors", realErrors.length === 0, realErrors.join(" | "));

  await browser.close();

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  console.error("E2E crashed:", err);
  process.exit(1);
});
