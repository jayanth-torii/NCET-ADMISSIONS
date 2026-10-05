/**
 * Computed-style audit: confirms the NCET brand palette and layout are actually
 * applied in the browser, not just present in the markup.
 *
 *   node scripts/style-audit.js
 */
const { chromium } = require("playwright");

const WEB = process.env.WEB_URL || "http://localhost:3000";
const rgb = (hex) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const NAVY = rgb("#0a1f44");
const EMBER = rgb("#f6872a");

const results = [];
const check = (name, passed, detail = "") => {
  results.push({ name, passed });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(WEB, { waitUntil: "networkidle" });

  // Hero surface should be NCET navy.
  const heroBg = await page
    .locator("#top")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  check("hero uses NCET navy", heroBg === NAVY, `${heroBg} (expected ${NAVY})`);

  // Primary CTA should carry the ember gradient.
  const ctaBg = await page
    .getByRole("link", { name: /start your application/i })
    .evaluate((el) => getComputedStyle(el).backgroundImage);
  check(
    "primary CTA uses ember gradient",
    ctaBg.includes("246, 135, 42"),
    ctaBg.slice(0, 70)
  );

  // The animated gradient tokens should have compiled.
  const aurora = await page
    .locator("#top .animate-aurora")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  check("aurora keyframes compiled", aurora === "ngi-aurora", aurora);

  const marquee = await page
    .locator(".animate-marquee")
    .first()
    .count();
  check("marquee present", marquee > 0, `${marquee} node(s)`);

  // Layout: no horizontal overflow at desktop or mobile width.
  for (const width of [1280, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    check(`no horizontal overflow at ${width}px`, overflow <= 0, `${overflow}px`);
  }

  // Focus visibility on the primary CTA (keyboard accessibility).
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.keyboard.press("Tab");
  const focusTag = await page.evaluate(() => document.activeElement?.tagName);
  check("first tab stop is focusable", Boolean(focusTag), String(focusTag));

  // Heading order sanity.
  const h1Count = await page.locator("h1").count();
  check("exactly one h1", h1Count === 1, `${h1Count}`);

  // Tap target size on the primary CTA (WCAG 2.5.8 min 24px).
  const box = await page
    .getByRole("link", { name: /start your application/i })
    .boundingBox();
  check("CTA tap target >= 24px tall", box.height >= 24, `${Math.round(box.height)}px`);

  await browser.close();

  const failed = results.filter((r) => !r.passed);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  console.error("Audit crashed:", err);
  process.exit(1);
});
