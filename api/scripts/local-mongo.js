/**
 * Boots a local MongoDB for manual testing without touching Atlas.
 * Prints the connection URI, then stays alive until Ctrl+C.
 *
 *   node scripts/local-mongo.js
 */
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

(async () => {
  const mongod = await MongoMemoryServer.create({ instance: { port: 27017 } });
  const uri = `${mongod.getUri().replace(/\/$/, "")}/ngi_admissions`;

  await mongoose.connect(uri);
  const Counselor = require("../src/models/counselor.model");
  await Counselor.deleteMany({});
  await Counselor.create({
    slug: "venugopal-reddy",
    name: "Venugopal Reddy N",
    designation: "Director – Admissions",
    region: "Andhra Pradesh",
    phones: ["9949166771", "9985165771"],
    email: "admissionsap@ncetmail.com",
    officeAddress:
      "#105-B, 1st Floor, Sai Vasanth Complex, N.G. Birla Compound, Kurnool – 518002",
    website: "https://www.ncet.co.in",
    languages: ["Telugu", "English", "Kannada", "Hindi"],
    message:
      "Call or WhatsApp for programme guidance, eligibility clarification and campus visit scheduling.",
  });
  await mongoose.disconnect();

  console.log(`LOCAL_MONGO_URI=${uri}`);
  console.log("Seeded counsellor 'venugopal-reddy'. Press Ctrl+C to stop.");

  process.on("SIGINT", async () => {
    await mongod.stop();
    process.exit(0);
  });
})();
