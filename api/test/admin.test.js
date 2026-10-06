/**
 * Developer admin auth tests: two-step login, OTP, token protection and the
 * stats endpoint.
 */
const jwt = require("jsonwebtoken");

let app;
let request;
let assert;

const EMAIL = "jayanth.m@ncetmail.com";
const PASSWORD = "Admin@123";
const OTP = "000000";

// bcrypt hash of "Admin@123"
const HASH = "$2b$10$mDyHRartBeVDjSuj0dHgNudTUZDtfyTtk3iMTtyMSZEN.RyjaBZem";

const VALID = {
  studentName: "Anitha Sharma",
  studentMobile: "9876543210",
  studentWhatsApp: "9876543211",
  gender: "female",
  fatherName: "Ramesh Sharma",
  fatherMobile: "9123456780",
  interCollegeName: "Sri Chaitanya Junior College",
  interCollegePlace: "Kurnool",
  appNumber: "KCET2026999",
  homeTownAddress: "4-12-8, Gandhi Nagar, Kurnool",
};

/** Full two-step sign-in, returning the bearer token. */
const signIn = async (overrides = {}) => {
  const login = await request(app)
    .post("/api/admin/login")
    .send({ email: EMAIL, password: PASSWORD, ...overrides });
  if (login.status !== 200) throw new Error(`login failed: ${login.status}`);

  const verify = await request(app)
    .post("/api/admin/verify")
    .send({ email: login.body.email, otp: overrides.otp ?? OTP, challenge: login.body.challenge });

  return verify.body.token;
};

before(async () => {
  assert = (await import("node:assert/strict")).default;
  request = (await import("supertest")).default;
  app = global.__app;
});

beforeEach(async () => {
  // The lockout is keyed by IP and supertest reuses one, so clear it between
  // cases. The lockout test re-populates it deliberately.
  require("../src/config/admin").resetAttempts();

  // Other test files may wipe the collection, so guarantee at least one row
  // exists. Mocha runs every file's root `before` before any test, so seeding
  // only at the top of this file is not enough.
  const Application = require("../src/models/application.model");
  if ((await Application.estimatedDocumentCount()) === 0) {
    await Application.create(VALID);
  }
});


describe("POST /api/admin/login", () => {
  it("accepts the correct email and password", async () => {
    const res = await request(app).post("/api/admin/login").send({ email: EMAIL, password: PASSWORD });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.challenge, "expected an OTP challenge token");
    assert.equal(res.body.email, EMAIL);
  });

  it("is case-insensitive on the email", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: "JAYANTH.M@NCETMAIL.COM", password: PASSWORD });

    assert.equal(res.status, 200);
  });

  it("rejects a wrong password", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: EMAIL, password: "wrong-password" });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.ok(!res.body.challenge);
  });

  it("rejects a wrong email without revealing which field failed", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: "someone@else.com", password: PASSWORD });

    assert.equal(res.status, 401);
    assert.equal(res.body.message, "Invalid email or password");
  });
});

describe("lockout", () => {
  it("locks the IP out after MAX_ATTEMPTS failures", async () => {
    let locked = false;
    for (let i = 0; i < 8; i += 1) {
      const res = await request(app)
        .post("/api/admin/login")
        .send({ email: "attacker@example.com", password: "guess" });
      if (res.status === 429) {
        locked = true;
        break;
      }
    }
    assert.ok(locked, "expected a 429 lockout after repeated failures");

    // ...and even the correct password is refused while locked.
    const blocked = await request(app).post("/api/admin/login").send({ email: EMAIL, password: PASSWORD });
    assert.equal(blocked.status, 429);
  });
});

describe("POST /api/admin/verify", () => {
  it("returns a session token for the correct OTP", async () => {
    const login = await request(app).post("/api/admin/login").send({ email: EMAIL, password: PASSWORD });
    const res = await request(app)
      .post("/api/admin/verify")
      .send({ email: EMAIL, otp: OTP, challenge: login.body.challenge });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, EMAIL);

    const payload = jwt.verify(res.body.token, "test-secret");
    assert.equal(payload.scope, "admin");
    assert.equal(payload.sub, EMAIL);
  });

  it("rejects an incorrect OTP", async () => {
    const login = await request(app).post("/api/admin/login").send({ email: EMAIL, password: PASSWORD });
    const res = await request(app)
      .post("/api/admin/verify")
      .send({ email: EMAIL, otp: "111111", challenge: login.body.challenge });

    assert.equal(res.status, 401);
    assert.ok(!res.body.token);
  });

  it("rejects a missing or tampered challenge", async () => {
    const res = await request(app)
      .post("/api/admin/verify")
      .send({ email: EMAIL, otp: OTP, challenge: "not-a-jwt" });

    assert.equal(res.status, 401);
  });

  it("will not accept a session token in place of a challenge", async () => {
    const token = await signIn();
    const res = await request(app)
      .post("/api/admin/verify")
      .send({ email: EMAIL, otp: OTP, challenge: token });

    assert.equal(res.status, 401, "an admin token must not work as an OTP challenge");
  });
});

describe("protected admissions routes", () => {
  it("GET /api/applications is now closed to the public", async () => {
    const res = await request(app).get("/api/applications");
    assert.equal(res.status, 401);
  });

  it("returns data when a valid token is supplied", async () => {
    const token = await signIn();
    const res = await request(app)
      .get("/api/applications")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.applications.length >= 1);
    assert.equal(res.body.applications[0].studentName, VALID.studentName);
  });

  it("PATCH /status requires a token", async () => {
    const token = await signIn();
    const list = await request(app).get("/api/applications").set("Authorization", `Bearer ${token}`);
    const id = list.body.applications[0]._id;

    const denied = await request(app).patch(`/api/applications/${id}/status`).send({ status: "contacted" });
    assert.equal(denied.status, 401);

    const allowed = await request(app)
      .patch(`/api/applications/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "contacted" });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.application.status, "contacted");
  });

  it("still allows the public form to submit", async () => {
    const res = await request(app).post("/api/applications").send({ ...VALID, appNumber: "PUBLIC1" });
    assert.equal(res.status, 201);
  });
});

describe("GET /api/admin/me and /stats", () => {
  it("me confirms a valid session", async () => {
    const token = await signIn();
    const res = await request(app).get("/api/admin/me").set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, EMAIL);
  });

  it("me rejects a missing token", async () => {
    const res = await request(app).get("/api/admin/me");
    assert.equal(res.status, 401);
  });

  it("stats returns pipeline counts", async () => {
    const token = await signIn();
    const res = await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.stats.total >= 2);
    assert.ok("contacted" in res.body.stats.statusCounts);
    assert.ok(res.body.stats.statusCounts.contacted >= 1);
  });
});

describe("GET /api/admin/applications and status updates", () => {
  it("rejects an unauthenticated read", async () => {
    const res = await request(app).get("/api/admin/applications");
    assert.equal(res.status, 401);
  });

  it("rejects an unauthenticated status update", async () => {
    const created = await request(app).post("/api/applications").send({ ...VALID, appNumber: "ADM1" });
    const id = created.body.application.id;

    const res = await request(app)
      .patch(`/api/admin/applications/${id}/status`)
      .send({ status: "contacted" });

    assert.equal(res.status, 401);
  });

  it("lists applications for a signed-in admin, honouring limit and status", async () => {
    const token = await signIn();
    const res = await request(app)
      .get("/api/admin/applications?limit=200")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.applications));
    assert.ok(res.body.applications.length >= 1);
    assert.ok(res.body.applications.length <= 200);
  });

  it("filters the list by status", async () => {
    const token = await signIn();

    const created = await request(app).post("/api/applications").send({ ...VALID, appNumber: "ADM2" });
    const id = created.body.application.id;

    const updated = await request(app)
      .patch(`/api/admin/applications/${id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "shortlisted" });
    assert.equal(updated.status, 200);

    const list = await request(app)
      .get("/api/admin/applications?status=shortlisted")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(list.status, 200);
    assert.ok(list.body.applications.every((a) => a.status === "shortlisted"));
    assert.ok(list.body.applications.some((a) => String(a._id) === String(id)));
  });
});
