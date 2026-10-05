const mongoose = require("mongoose");

/**
 * Connects to MongoDB using MONGODB_URI.
 * Mongoose buffers commands until connected, so this can be called once at boot
 * and the rest of the app can rely on models being usable.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`[db] connected to ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
