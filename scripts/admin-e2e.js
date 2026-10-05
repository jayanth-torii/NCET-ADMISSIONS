/**
 * Browser end-to-end test for the developer admin panel.
 *
 * Drives the real two-step login and asserts the dashboard renders applicant
 * data from the API.
 *
 *   node scripts/admin-e2e.js
 */
const { chromium } = require("playwright");

const WEB = process.env.WEB_URL || "http://localhost:3000";

const EMAIL = process.env.ADMIN_EMAIL || "jayanth.m@ncetmail.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const OTP = process.env.ADMIN_OTP || "000000";

const API_URL = process.env.API_URL || "http://localhost:4005";

/** Escape a value for safe use inside a RegExp. */
const escapeRe = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const results = [];
const check = (name, passed, detail = "") => {
  results.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  /**
   * Reads the newest application straight from the API, so the assertions below
   * check that the dashboard renders real data instead of hard-coded fixtures.
   */
  const fetchFirstApplication = async () => {
    const token = await page.evaluate(() => localStorage.getItem("ngi_admin_token"));
    const res = await page.request.get(`${API_URL}/api/admin/applications?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status() !== 200) throw new Error(`could not read applications: ${res.status()}`);
    const [first] = (await res.json()).applications;
    if (!first) throw new Error("no applications in the database to assert on");
    return first;
  };

  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  // --- Login screen ---
  await page.goto(`${WEB}/admin`, { waitUntil: "networkidle" });
  check("admin page loads", (await page.title()).includes("Developer sign-in"), await page.title());
  check("password field present", (await page.getByLabel("Password").count()) === 1);
  check("OTP step hidden initially", (await page.getByLabel("Developer OTP").count()) === 0);

  // Next's route announcer also carries role="alert", so target the error
  // paragraph specifically rather than the role.
  const errorText = page.locator('p[role="alert"]');

  // --- Wrong password is rejected ---
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: /continue/i }).click();
  await errorText.waitFor({ timeout: 15000 });
  check(
    "wrong password rejected",
    /Invalid email or password/i.test(await errorText.innerText())
  );
  check("still on login step", (await page.getByRole("button", { name: /continue/i }).count()) === 1);

  // --- Correct credentials ---
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel("Developer OTP").waitFor({ timeout: 15000 });
  check("OTP step shown", true);

  // --- Wrong OTP rejected ---
  await page.getByLabel("Developer OTP").fill("111111");
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await errorText.waitFor({ timeout: 15000 });
  check("wrong OTP rejected", /Incorrect OTP/i.test(await errorText.innerText()));

  // --- Correct OTP ---
  await page.getByLabel("Developer OTP").fill(OTP);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
  check("redirected to dashboard", page.url().includes("/admin/dashboard"));

  // --- Dashboard content ---
  await page.getByRole("heading", { name: "Admissions dashboard" }).waitFor({ timeout: 15000 });
  check("dashboard heading rendered", true);

  // The heading renders before the applicant fetch resolves, so wait for the
  // table to actually have rows before asserting on its contents.
  await page
    .locator('a[href^="tel:+91"]')
    .first()
    .waitFor({ timeout: 20000 });

  const bodyText = await page.locator("main").innerText();
  check("shows total applications", /Total applications/i.test(bodyText));
  check("shows last-7-days card", /Last 7 days/i.test(bodyText));

  // Read the expected values from the API rather than hard-coding a seed, so
  // this keeps working against whatever data the target database holds.
  const applicant = await fetchFirstApplication();
  check(
    "seeded applicant visible",
    new RegExp(escapeRe(applicant.studentName), "i").test(bodyText),
    applicant.studentName
  );
  check(
    "application number visible",
    new RegExp(escapeRe(applicant.appNumber), "i").test(bodyText),
    applicant.appNumber
  );
  check(
    "inter college visible",
    new RegExp(escapeRe(applicant.interCollegeName), "i").test(bodyText),
    applicant.interCollegeName
  );

  // --- Search filter ---
  // The seeded rows may repeat the same applicant, so filter on a term that
  // cannot match anything and assert the table empties out.
  const rowsBefore = await page.locator("tbody tr").count();
  // The empty state also occupies a <tbody tr>, so count click-to-call links
  // instead — only genuine applicant rows have one.
  const dataRows = () => page.locator('tbody a[href^="tel:+91"]').count();

  await page.getByLabel("Search applications").fill("zzz-no-such-applicant-zzz");
  await page.waitForTimeout(400);

  check("search hides non-matching rows", (await dataRows()) === 0);
  check(
    "empty state shown",
    /No applications match/i.test(await page.locator("main").innerText())
  );

  await page.getByLabel("Search applications").fill(applicant.studentName);
  await page.waitForTimeout(400);
  const rowsAfter = await dataRows();
  check(
    "search narrows results",
    rowsAfter > 0 && rowsAfter <= rowsBefore,
    `${rowsBefore} -> ${rowsAfter} rows`
  );

  await page.getByLabel("Search applications").fill("");
  await page.waitForTimeout(300);
  check("clearing search restores rows", (await dataRows()) === rowsBefore);

  // --- Status update persists ---
  const trigger = page.getByLabel(`Change status for ${applicant.studentName}`).first();
  await trigger.click();
  await page.getByRole("option", { name: /^enrolled$/i }).click();
  await page.waitForTimeout(2500);

  check(
    "status change confirmed in UI",
    /Moved to enrolled/i.test(await page.locator("main").innerText())
  );

  // Re-read from the API so this proves the write reached Mongo, not just React.
  const persisted = await page.evaluate(
    async ([name, api]) => {
      const token = localStorage.getItem("ngi_admin_token");
      const res = await fetch(`${api}/api/admin/applications?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { applications } = await res.json();
      return applications.find((a) => a.studentName === name)?.status;
    },
    [applicant.studentName, API_URL]
  );

  check("status change persisted to the API", persisted === "enrolled", `status ${persisted}`);

  // Put it back so the test does not leave the database mutated.
  await page.getByLabel(`Change status for ${applicant.studentName}`).first().click();
  await page.getByRole("option", { name: /^new$/i }).click();
  await page.waitForTimeout(2000);

  // --- Phone is click-to-call ---
  const tel = await page.locator('a[href^="tel:+91"]').first().getAttribute("href");
  check("phone rendered as tel: link", /^tel:\+91\d{10}$/.test(tel ?? ""), String(tel));

  // --- Sign out clears the session ---
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL(/\/admin$/, { timeout: 15000 });
  check("sign out returns to login", page.url().endsWith("/admin"));

  const token = await page.evaluate(() => localStorage.getItem("ngi_admin_token"));
  check("token cleared from storage", token === null);

  // --- Protected API refuses anonymous reads ---
  const anon = await page.request.get(`${API_URL}/api/applications`);
  check("API rejects unauthenticated read", anon.status() === 401, `status ${anon.status()}`);

  check("no uncaught page errors", pageErrors.length === 0, pageErrors.join(" | "));

  await browser.close();

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  console.error("Admin E2E crashed:", err);
  process.exit(1);
});
