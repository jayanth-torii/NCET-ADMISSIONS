/**
 * Tests for the weekly admissions Excel workbook.
 */
const assert = require("node:assert/strict");

const ExcelJS = require("exceljs");

const { buildWorkbook, COLUMNS } = require("../src/emails/buildWorkbook");

const APPLICATIONS = [
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
    homeTownAddress: "4-12-8, Gandhi Nagar, Kurnool, AP 518004",
    status: "new",
    createdAt: "2026-10-03T04:20:00.000Z",
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
    homeTownAddress: "6-2-14, Gandhi Road, Tirupati",
    status: "new",
    createdAt: "2026-10-04T09:05:00.000Z",
  },
];

const readBack = async (buffer) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return wb;
};

describe("workbook builder", () => {
  it("produces a valid .xlsx buffer", async () => {
    const { buffer } = await buildWorkbook(APPLICATIONS, {
      weekEnding: "05 October 2026",
      region: "Andhra Pradesh",
    });

    assert.ok(Buffer.isBuffer(buffer));
    // xlsx files are zip archives — "PK" magic bytes.
    assert.equal(buffer.subarray(0, 2).toString(), "PK");
    assert.ok(buffer.length > 3000, `suspiciously small: ${buffer.length} bytes`);
  });

  it("names the file after the week", async () => {
    const { filename } = await buildWorkbook(APPLICATIONS, {
      weekEnding: "05 October 2026",
      region: "Andhra Pradesh",
    });
    assert.match(filename, /^NGI-Admissions-05-October-2026\.xlsx$/);
  });

  it("writes one row per application plus a Summary sheet", async () => {
    const { buffer } = await buildWorkbook(APPLICATIONS, { weekEnding: "05 October 2026" });
    const wb = await readBack(buffer);

    assert.ok(wb.getWorksheet("Applications"));
    assert.ok(wb.getWorksheet("Summary"));

    const sheet = wb.getWorksheet("Applications");
    // Title row, subtitle row, header row, then the data rows.
    assert.equal(sheet.actualRowCount, 3 + APPLICATIONS.length);
  });

  it("writes every form field into the columns", async () => {
    const { buffer } = await buildWorkbook(APPLICATIONS, { weekEnding: "05 October 2026" });
    const wb = await readBack(buffer);
    const sheet = wb.getWorksheet("Applications");

    const header = [];
    sheet.getRow(3).eachCell((cell) => header.push(cell.value));
    assert.deepEqual(header, COLUMNS.map((c) => c.header));

    // Read the first data row by column key, matching COLUMNS.key -> header.
    const first = sheet.getRow(4);
    const byHeader = {};
    COLUMNS.forEach((c, i) => (byHeader[c.key] = first.getCell(i + 1).value));

    for (const key of [
      "studentName", "studentMobile", "studentWhatsApp", "gender", "fatherName", "fatherMobile",
      "interCollegeName", "interCollegePlace", "appNumber", "homeTownAddress",
    ]) {
      assert.equal(
        byHeader[key],
        APPLICATIONS[0][key],
        `column ${key} not written (got ${JSON.stringify(byHeader[key])})`
      );
    }
    assert.equal(byHeader.status, "new");
  });

  it("keeps phone and app numbers as text so leading zeros survive", async () => {
    const { buffer } = await buildWorkbook(
      [{ ...APPLICATIONS[0], studentMobile: "09876543210", appNumber: "007" }],
      { weekEnding: "05 October 2026" }
    );
    const wb = await readBack(buffer);
    const sheet = wb.getWorksheet("Applications");

    // Derive column positions from COLUMNS so inserting columns cannot break this.
    const colOf = (key) => COLUMNS.findIndex((c) => c.key === key) + 1;

    const mobile = sheet.getRow(4).getCell(colOf("studentMobile")).value;
    assert.equal(mobile, "09876543210", "leading zero was lost");
    assert.equal(sheet.getRow(4).getCell(colOf("studentMobile")).numFmt, "@");

    const whatsapp = sheet.getRow(4).getCell(colOf("studentWhatsApp")).value;
    assert.equal(whatsapp, "9876543211");
    assert.equal(sheet.getRow(4).getCell(colOf("studentWhatsApp")).numFmt, "@");

    const appNo = sheet.getRow(4).getCell(colOf("appNumber")).value;
    assert.equal(appNo, "007");
  });

  it("summarises the week on the Summary sheet", async () => {
    const { buffer } = await buildWorkbook(APPLICATIONS, {
      weekEnding: "05 October 2026",
      region: "Andhra Pradesh",
    });
    const wb = await readBack(buffer);
    const sum = wb.getWorksheet("Summary");

    const flat = {};
    sum.eachRow((row) => {
      flat[row.getCell(1).value] = row.getCell(2).value;
    });

    assert.equal(flat["Total applications"], 2);
    assert.equal(flat["Distinct colleges"], 2);
    assert.equal(flat["Male applicants"], 1);
    assert.equal(flat["Female applicants"], 1);
    assert.equal(flat["Regional desk"], "Andhra Pradesh");
  });

  it("produces a header-only sheet when the week was quiet", async () => {
    const { buffer } = await buildWorkbook([], { weekEnding: "05 October 2026" });
    const wb = await readBack(buffer);
    const sheet = wb.getWorksheet("Applications");

    assert.equal(sheet.actualRowCount, 3);
    assert.equal(sheet.getRow(1).value, undefined, "title lives in the merged cell");
  });
});
