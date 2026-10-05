/** Escapes user-supplied text before it goes anywhere near the markup. */
const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Weekly Admissions Report — the email that accompanies the Excel attachment.
 *
 * Deliberately does NOT list applicants: the workbook attached to this mail is
 * the record. Keeps the body short enough to read on a phone.
 *
 * Table-based, inline-styled, no external assets or web fonts, so it survives
 * Gmail, Outlook and Apple Mail. Brand colours match the site:
 * navy #0A1F44, ember #F6872A.
 */

const NAVY = "#0A1F44";
const EMBER = "#F6872A";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Formatted by hand rather than via toLocaleDateString: ICU month names and
// spacing vary between Node builds (e.g. "Sept" vs "September"), and this
// string goes into a report the admissions desk reads verbatim.
const dayLabel = (d) =>
  `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

/** Reporting window: the 7 days ending on `sentAt`, e.g. "29 September – 05 October 2026". */
const periodLabel = (sentAt) => {
  const end = new Date(sentAt);
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  return `${String(start.getDate()).padStart(2, "0")} ${MONTHS[start.getMonth()]} – ${dayLabel(end)}`;
};

/**
 * @param {object} p
 * @param {object[]} p.applications
 * @param {object}   p.counsellor
 * @param {string}   p.dashboardUrl
 * @param {Date}    [p.sentAt]
 * @param {string}  [p.filename]      name of the attached workbook
 * @returns {{ subject: string, html: string, text: string, stats: object }}
 */
function buildWeeklyDigest({ applications = [], counsellor, dashboardUrl, sentAt, filename }) {
  const date = sentAt ?? new Date();

  const stats = {
    count: applications.length,
    college_count: new Set(applications.map((a) => a.interCollegePlace).filter(Boolean)).size,
    female_count: applications.filter((a) => a.gender === "female").length,
    male_count: applications.filter((a) => a.gender === "male").length,
    other_count: applications.filter((a) => a.gender === "other").length,
    period: periodLabel(date),
    weekEnding: dayLabel(date),
  };

  const subject = `Weekly Admissions Report — ${counsellor.region} Desk · week ending ${stats.weekEnding}`;

  const attachmentLine = filename
    ? `<strong>Attached:</strong> <em>${esc(filename)}</em>`
    : `<strong>Attached:</strong> the Weekly Admissions Report workbook`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F2F5FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F5FA;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(10,31,68,.08);">

          <!-- Header -->
          <tr>
            <td style="background:${NAVY};padding:22px 28px;">
              <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${EMBER};font-weight:700;">
                Nagarjuna Group of Institutions
              </p>
              <h1 style="margin:8px 0 0;font-size:20px;line-height:1.3;color:#FFFFFF;font-weight:700;">
                Weekly Admissions Report
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:#C3D1E7;">
                ${esc(counsellor.region)} Admissions Desk · week ending ${esc(stats.weekEnding)}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px;font-size:15px;line-height:1.7;color:#2B4478;">
              <p style="margin:0 0 16px;">Dear Sir/Madam,</p>

              <p style="margin:0 0 22px;">
                Please find attached the <strong>Weekly Admissions Report for the ${esc(
                  counsellor.region
                )} Admissions Desk</strong>, covering the week ending
                <strong>${esc(stats.weekEnding)}</strong>.
              </p>

              <!-- Summary -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E9F4;border-radius:10px;margin:0 0 22px;">
                <tr>
                  <td colspan="2" style="padding:14px 18px;background:#F2F5FA;border-radius:10px 10px 0 0;font-size:13px;font-weight:700;color:${NAVY};letter-spacing:.06em;text-transform:uppercase;">
                    Weekly Admissions Summary
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 18px;border-top:1px solid #E2E9F4;font-size:14px;color:#2B4478;">
                    New Applications Received
                  </td>
                  <td align="right" style="padding:11px 18px;border-top:1px solid #E2E9F4;font-size:15px;font-weight:700;color:${NAVY};">
                    ${stats.count}
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 18px;border-top:1px solid #E2E9F4;font-size:14px;color:#2B4478;">
                    Colleges Represented
                  </td>
                  <td align="right" style="padding:11px 18px;border-top:1px solid #E2E9F4;font-size:15px;font-weight:700;color:${NAVY};">
                    ${stats.college_count}
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 18px;border-top:1px solid #E2E9F4;font-size:14px;color:#2B4478;">
                    Female Applicants
                  </td>
                  <td align="right" style="padding:11px 18px;border-top:1px solid #E2E9F4;font-size:15px;font-weight:700;color:${NAVY};">
                    ${stats.female_count}
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 18px;border-top:1px solid #E2E9F4;font-size:14px;color:#2B4478;">
                    Reporting Period
                  </td>
                  <td align="right" style="padding:11px 18px;border-top:1px solid #E2E9F4;font-size:14px;font-weight:600;color:${NAVY};">
                    ${esc(stats.period)}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 18px;">
                The attached Excel file contains the complete applicant-wise details,
                including the <strong>Application Number</strong> and relevant admission
                information, for your review and further reference.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;margin:0 0 22px;">
                <tr>
                  <td style="padding:13px 16px;font-size:13px;color:#7C2D12;line-height:1.6;">
                    ${attachmentLine}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 22px;">
                Kindly review the report and let us know if any additional information
                or clarification is required.
              </p>

              <p style="margin:0;">
                Regards,<br/>
                <strong style="color:${NAVY};">NGI Admissions Team</strong><br/>
                <strong style="color:${NAVY};">Nagarjuna Group of Institutions</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px;background:#F2F5FA;">
              <p style="margin:0;font-size:12px;color:#5F7DB0;line-height:1.7;">
                ${esc(counsellor.name)} · ${esc(counsellor.designation)} ·
                <a href="mailto:${esc(counsellor.email)}" style="color:${EMBER};">${esc(
                  counsellor.email
                )}</a><br/>
                ${esc(counsellor.officeAddress || "")}<br/>
                ${esc(counsellor.phones ? counsellor.phones.join(" / ") : "")}
                <br/><br/>
                Sent automatically every Saturday. Applicant details are confidential —
                please do not forward this email outside the admissions team.
              </p>
            </td>
          </tr>

          <!-- Spacer + dashboard link -->
          <tr>
            <td align="center" style="padding:22px 28px 26px;">
              <a href="${esc(dashboardUrl)}"
                 style="display:inline-block;background:${EMBER};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;">
                Open the admissions desk
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Dear Sir/Madam,`,
    ``,
    `Please find attached the Weekly Admissions Report for the ${counsellor.region} Admissions Desk, covering the week ending ${stats.weekEnding}.`,
    ``,
    `WEEKLY ADMISSIONS SUMMARY`,
    `  New Applications Received : ${stats.count}`,
    `  Colleges Represented     : ${stats.college_count}`,
    `  Female Applicants        : ${stats.female_count}`,
    `  Reporting Period         : ${stats.period}`,
    ``,
    `The attached Excel file contains the complete applicant-wise details, including the Application Number and relevant admission information, for your review and further reference.`,
    ``,
    `Attached: ${filename || "the Weekly Admissions Report workbook"}`,
    ``,
    `Kindly review the report and let us know if any additional information or clarification is required.`,
    ``,
    `Regards,`,
    `NGI Admissions Team`,
    `Nagarjuna Group of Institutions`,
  ].join("\n");

  return { subject, html, text, stats };
}

module.exports = { buildWeeklyDigest, esc };
