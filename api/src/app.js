const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:3001")
      .split(",")
      .map((o) => o.trim()),
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) =>
  res.json({ success: true, message: "NGI Admissions API is running", docs: "/api/health" })
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
