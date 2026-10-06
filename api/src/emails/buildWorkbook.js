const ExcelJS = require("exceljs");

const NAVY = "FF0A1F44";
const EMBER = "FFF6872A";

/** Columns mirror the admission form exactly, plus the ops fields. */
const COLUMNS = [
  { header: "Student Name", key: "studentName", width: 24 },
  { header: "Student Mobile", key: "studentMobile", width: 16 },
  { header: "Student WhatsApp", key: "studentWhatsApp", width: 16 },
  { header: "Gender", key: "gender", width: 10 },
  { header: "Interested Course", key: "interestedCourse", width: 32 },
  { header: "Father / Guardian", key: "fatherName", width: 22 },
  { header: "Father Mobile", key: "fatherMobile", width: 16 },
  { header: "Inter College", key: "interCollegeName", width: 34 },
  { header: "Inter College Place", key: "interCollegePlace", width: 20 },
  { header: "Application No.", key: "appNumber", width: 18 },
  { header: "Home Town Address", key: "homeTownAddress", width: 42 },
  { header: "Submitted On", key: "createdAt", width: 18 },
  { header: "Status", key: "status", width: 12 },
];

// 1-based index of the address column, used to wrap that cell only.
const ADDRESS_COL = COLUMNS.findIndex((c) => c.key === "homeTownAddress") + 1;

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/**
 * Builds the weekly admissions workbook.
 *
 * @param {object[]} applications
 * @param {object} meta  { weekEnding, region }
 * @returns {Promise<{ buffer: Buffer, filename: string }>}
 */
async function buildWorkbook(applications = [], meta = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nagarjuna Group of Institutions — Admissions";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Applications", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  // --- Title rows ---
  sheet.mergeCells(1, 1, 1, COLUMNS.length);
  const title = sheet.getCell("A1");
  title.value = "Nagarjuna Group of Institutions — Weekly Admissions Report";
  title.font = { bold: true, size: 15, color: { argb: NAVY } };
  title.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 26;

  sheet.mergeCells(2, 1, 2, COLUMNS.length);
  const sub = sheet.getCell("A2");
  sub.value = `Week ending ${meta.weekEnding || ""} · ${meta.region || ""} desk · ${
    applications.length
  } application${applications.length === 1 ? "" : "s"}`;
  sub.font = { size: 11, color: { argb: "FF2B4478" } };

  // --- Header row (row 4) ---
  sheet.getRow(3).values = COLUMNS.map((c) => c.header);
  const header = sheet.getRow(3);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      bottom: { style: "medium", color: { argb: EMBER } },
    };
  });

  sheet.columns = COLUMNS.map((c) => ({ key: c.key, width: c.width }));

  // --- Data rows ---
  applications.forEach((app, i) => {
    const row = sheet.addRow({
      studentName: app.studentName,
      studentMobile: app.studentMobile,
      studentWhatsApp: app.studentWhatsApp,
      gender: app.gender,
      interestedCourse: app.interestedCourse,
      fatherName: app.fatherName,
      fatherMobile: app.fatherMobile,
      interCollegeName: app.interCollegeName,
      interCollegePlace: app.interCollegePlace,
      appNumber: app.appNumber,
      homeTownAddress: app.homeTownAddress,
      createdAt: fmtDate(app.createdAt),
      status: app.status || "new",
    });

    // Zebra striping, and keep text as text so leading zeros survive.
    row.eachCell((cell, col) => {
      cell.alignment = { vertical: "top", wrapText: col === ADDRESS_COL };
      if (i % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F5FA" } };
      }
    });
    row.getCell("studentMobile").numFmt = "@";
    row.getCell("studentWhatsApp").numFmt = "@";
    row.getCell("fatherMobile").numFmt = "@";
    row.getCell("appNumber").numFmt = "@";
  });

  sheet.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: COLUMNS.length } };

  // --- Summary sheet ---
  const sum = workbook.addWorksheet("Summary");
  sum.columns = [
    { header: "Metric", key: "metric", width: 28 },
    { header: "Value", key: "value", width: 18 },
  ];
  sum.getRow(1).font = { bold: true, size: 12, color: { argb: NAVY } };

  const genders = applications.reduce((acc, a) => {
    acc[a.gender] = (acc[a.gender] || 0) + 1;
    return acc;
  }, {});

  const rows = [
    ["Week ending", meta.weekEnding || ""],
    ["Regional desk", meta.region || ""],
    ["Total applications", applications.length],
    ["Distinct colleges", new Set(applications.map((a) => a.interCollegePlace)).size],
    ["Male applicants", genders.male || 0],
    ["Female applicants", genders.female || 0],
    ["Other applicants", genders.other || 0],
    ["Generated", new Date().toLocaleString("en-IN")],
  ];
  rows.forEach(([metric, value]) => sum.addRow({ metric, value }));

  sum.getColumn("metric").font = { bold: true };

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const stamp = (meta.weekEnding || new Date().toISOString().slice(0, 10)).replace(/\s+/g, "-");

  return {
    buffer,
    filename: `NGI-Admissions-${stamp}.xlsx`,
  };
}

module.exports = { buildWorkbook, COLUMNS };
