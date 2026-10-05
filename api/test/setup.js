/**
 * Shared mocha root fixture.
 *
 * Loaded with `--file test/setup.js` so it runs once per process. Every test
 * file then reuses the single connection and app instance instead of each
 * opening their own (Mongoose allows only one active connection).
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/ngi_admissions_test";
process.env.ADMIN_EMAIL = "jayanth.m@ncetmail.com";
process.env.ADMIN_OTP = "000000";
process.env.ADMIN_JWT_SECRET = "test-secret";
// bcrypt hash of "Admin@123"
process.env.ADMIN_PASSWORD_HASH =
  "$2b$10$mDyHRartBeVDjSuj0dHgNudTUZDtfyTtk3iMTtyMSZEN.RyjaBZem";

let mongod;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri("ngi_admissions_test"));

  global.__app = require("../src/app");
  global.__mongoose = mongoose;
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});
