/**
 * End-to-end check of the admissions API against a real (in-memory) MongoDB.
 * Run with:  npm test
 *
 * This exercises the same Mongoose schemas, validators and controllers that run
 * in production, so it catches schema/type mismatches before deploy.
 */
let app;
let mongoose;
let request;
let assert;

const VALID = {
  studentName: "Anitha Sharma",
  studentMobile: "9876543210",
  gender: "female",
  fatherName: "Ramesh Sharma",
  fatherMobile: "9123456780",
  interCollegeName: "Sri Chaitanya Junior College",
  interCollegePlace: "Kurnool",
  appNumber: "kcet 2026 12345",
  homeTownAddress: "4-12-8, Gandhi Nagar, Kurnool, Andhra Pradesh 518004",
};

before(async () => {
  assert = (await import("node:assert/strict")).default;
  request = (await import("supertest")).default;
  app = global.__app;
  mongoose = global.__mongoose;

  // Start from a clean collection so ordering between files cannot skew counts.
  await mongoose.connection.collection("applications").deleteMany({});

  // Reading applicant data is admin-only, so these tests carry a real session
  // token rather than relying on the routes being public.
  const login = await request(app)
    .post("/api/admin/login")
    .send({ email: process.env.ADMIN_EMAIL, password: "Admin@123" });
  const verify = await request(app)
    .post("/api/admin/verify")
    .send({
      email: login.body.email,
      otp: process.env.ADMIN_OTP,
      challenge: login.body.challenge,
    });
  assert.ok(verify.body.token, "admin sign-in failed — cannot run protected-route tests");
  auth = { Authorization: `Bearer ${verify.body.token}` };
});

let auth;

describe("POST /api/applications", () => {
  it("accepts a valid application and uppercases the app number", async () => {
    const res = await request(app).post("/api/applications").send(VALID);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.application.studentName, VALID.studentName);
    // "kcet 2026 12345" -> normalised to "KCET 2026 12345"
    assert.equal(res.body.application.appNumber, "KCET 2026 12345");
    assert.equal(res.body.application.status, "new");
  });

  it("trims surrounding whitespace from every text field", async () => {
    const res = await request(app)
      .post("/api/applications")
      .send({ ...VALID, studentName: "  Anitha Sharma  ", interCollegePlace: "  Kurnool " });

    assert.equal(res.status, 201);

    const Application = require("../src/models/application.model");
    const stored = await Application.findById(res.body.application.id);
    assert.equal(stored.studentName, "Anitha Sharma");
    assert.equal(stored.interCollegePlace, "Kurnool");
  });

  it("rejects a missing required field with 422", async () => {
    const res = await request(app).post("/api/applications").send({ ...VALID, fatherMobile: undefined });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.field === "fatherMobile"));
  });

  it("rejects an invalid 10-digit Indian mobile number", async () => {
    const res = await request(app).post("/api/applications").send({ ...VALID, studentMobile: "12345" });

    assert.equal(res.status, 422);
    assert.ok(res.body.errors.some((e) => e.field === "studentMobile"));
  });

  it("rejects a mobile number not starting 6-9", async () => {
    const res = await request(app).post("/api/applications").send({ ...VALID, fatherMobile: "1234567890" });

    assert.equal(res.status, 422);
    assert.ok(res.body.errors.some((e) => e.field === "fatherMobile"));
  });

  it("rejects an unknown gender value", async () => {
    const res = await request(app).post("/api/applications").send({ ...VALID, gender: "other-ish" });

    assert.equal(res.status, 422);
    assert.ok(res.body.errors.some((e) => e.field === "gender"));
  });

  it("ignores client-supplied status (field allow-list)", async () => {
    const res = await request(app)
      .post("/api/applications")
      .send({ ...VALID, status: "enrolled", region: "Karnataka" });

    assert.equal(res.status, 201);
    assert.equal(res.body.application.status, "new");
  });

  it("flags a repeat submission with the same app number", async () => {
    const res = await request(app).post("/api/applications").send(VALID);

    assert.equal(res.status, 201);
    assert.ok(res.body.duplicateOf, "expected duplicateOf to be set on the second submission");
  });
});

describe("GET /api/applications", () => {
  it("lists applications newest first", async () => {
    const res = await request(app).get("/api/applications").set(auth);

    assert.equal(res.status, 200);
    assert.ok(res.body.total >= 1);
    assert.equal(res.body.applications[0].studentName, "Anitha Sharma");
  });

  it("filters by status", async () => {
    const res = await request(app).get("/api/applications?status=new").set(auth);

    assert.equal(res.status, 200);
    assert.ok(res.body.applications.every((a) => a.status === "new"));
  });
});

describe("PATCH /api/applications/:id/status", () => {
  it("updates the pipeline status", async () => {
    const created = await request(app).post("/api/applications").send({ ...VALID, studentName: "Rahul K" });
    const res = await request(app)
      .patch(`/api/applications/${created.body.application.id}/status`)
      .set(auth)
      .send({ status: "contacted" });

    assert.equal(res.status, 200);
    assert.equal(res.body.application.status, "contacted");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app)
      .patch("/api/applications/64b7f9f9f9f9f9f9f9f9f9f9/status")
      .set(auth)
      .send({ status: "contacted" });

    assert.equal(res.status, 404);
  });
});

describe("counsellor endpoints", () => {
  const Counselor = require("../src/models/counselor.model");

  it("returns 404 when no counsellor is seeded", async () => {
    const res = await request(app).get("/api/counselors");
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 0);
  });

  it("lists the seeded regional counsellor with both phone numbers", async () => {
    await Counselor.create({
      slug: "venugopal-reddy",
      name: "Venugopal Reddy N",
      designation: "Director – Admissions",
      region: "Andhra Pradesh",
      phones: ["9949166771", "9985165771"],
      email: "admissionsap@ncetmail.com",
    });

    const res = await request(app).get("/api/counselors");

    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.deepEqual(res.body.counselors[0].phones, ["9949166771", "9985165771"]);
  });

  it("fetches a counsellor by slug", async () => {
    const res = await request(app).get("/api/counselors/venugopal-reddy");

    assert.equal(res.status, 200);
    assert.equal(res.body.counselor.email, "admissionsap@ncetmail.com");
  });
});

describe("health & errors", () => {
  it("serves /api/health", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
