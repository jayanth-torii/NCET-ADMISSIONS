const nodemailer = require("nodemailer");

const { buildWeeklyDigest } = require("../emails/weeklyDigest.template");
const { buildWorkbook } = require("../emails/buildWorkbook");

/**
 * Weekly Admissions Report delivery.
 *
 * TRANSPORT
 *  Two paths, because EmailJS cannot send file attachments — its API accepts
 *  only text parameters. The workbook therefore goes out over SMTP (Nodemailer),
 *  which the rest of the NCET estate already uses.
 *
 *    - SMTP_* set  -> note-style mail with the XLSX attached   (preferred)
 *    - only EmailJS set -> same mail, no attachment possible
 *    - neither set -> dry run: render and log, send nothing
 *
 *  Force a path with DIGEST_TRANSPORT=smtp|emailjs|auto.
 */

const hasSmtp = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
const hasEmailjs = () =>
  Boolean(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY);

const transportName = () => {
  const forced = (process.env.DIGEST_TRANSPORT || "").toLowerCase();
  if (forced === "smtp") return "smtp";
  if (forced === "emailjs") return "emailjs";
  if (hasSmtp()) return "smtp";
  if (hasEmailjs()) return "emailjs";
  return "dry-run";
};

const weekLabel = (d = new Date()) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

/** SMTP: sends the note body with the XLSX attached. */
const sendViaSmtp = async ({ to, replyTo, subject, html, text, attachment }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo,
    subject,
    html,
    text,
    attachments: [
      {
        filename: attachment.filename,
        content: attachment.buffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });

  return { messageId: info.messageId };
};

/** EmailJS: text parameters only, so no attachment. */
const sendViaEmailjs = async ({ to, subject, params }) => {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: { to_email: to, subject, ...params },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`EmailJS responded ${res.status}: ${body.slice(0, 300)}`);
  }
};

/**
 * Builds the report, attaches the workbook when SMTP is available, and sends.
 */
const sendWeeklyDigest = async ({ applications, counsellor, dashboardUrl }) => {
  const mode = transportName();

  if (mode === "dry-run") {
    const { subject, stats } = buildWeeklyDigest({ applications, counsellor, dashboardUrl });
    console.log("[email] No SMTP or EmailJS credentials — DRY RUN.");
    console.log(`[email] To:      ${counsellor.email}`);
    console.log(`[email] Subject: ${subject}`);
    console.log(`[email] ${stats.count} application(s), ${stats.college_count} college(s).`);
    return {
      sent: false,
      dryRun: true,
      transport: "dry-run",
      subject,
      stats,
    };
  }

  // With SMTP the workbook filename is known up front, so it can be named in the body.
  const attachment =
    mode === "smtp"
      ? await buildWorkbook(applications, {
          weekEnding: weekLabel(),
          region: counsellor.region,
        })
      : null;

  const { subject, html, text, stats } = buildWeeklyDigest({
    applications,
    counsellor,
    dashboardUrl,
    filename: attachment?.filename,
  });

  if (mode === "smtp") {
    const { messageId } = await sendViaSmtp({
      to: counsellor.email,
      replyTo: counsellor.email,
      subject,
      html,
      text,
      attachment,
    });

    console.log(
      `[email] sent "${subject}" to ${counsellor.email} with ${attachment.filename} (${attachment.buffer.length} bytes)`
    );

    return {
      sent: true,
      dryRun: false,
      transport: "smtp",
      attachment: attachment.filename,
      attachmentBytes: attachment.buffer.length,
      messageId,
      subject,
      stats,
    };
  }

  const params = {
    to_email: counsellor.email,
    subject,
    region: counsellor.region,
    count: stats.count,
    college_count: stats.college_count,
    female_count: stats.female_count,
    period: stats.period,
    week_ending: stats.weekEnding,
    dashboard_url: dashboardUrl,
    counsellor_name: counsellor.name,
    counsellor_designation: counsellor.designation,
    counsellor_email: counsellor.email,
    counsellor_office: counsellor.officeAddress || "",
    counsellor_phones: (counsellor.phones || []).join(" / "),
    body_html: html,
    body_text: text,
  };

  await sendViaEmailjs({ to: counsellor.email, subject, params });
  console.log(
    `[email] sent "${subject}" to ${counsellor.email} (EmailJS — no attachment; set SMTP_* to attach the XLSX)`
  );

  return {
    sent: true,
    dryRun: false,
    transport: "emailjs",
    attachment: null,
    subject,
    stats,
  };
};

module.exports = { sendWeeklyDigest, transportName, hasSmtp, hasEmailjs };
