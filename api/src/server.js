require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 4005;

(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("[db] connection failed:", err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[server] NGI Admissions API listening on http://localhost:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received, closing...`);
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
})();
