const express = require("express");
const fetch = require("node-fetch");
global.fetch = fetch;

const { RemoteLogger, expressLogger } = require("../Logging-Middleware");

const app = express();
app.use(express.json());


const logger = new RemoteLogger(process.env.LOG_TOKEN);

app.use(expressLogger(logger));

app.get("/api/ping", async (req, res) => {
  await logger.log("backend", "debug", "handler", "Ping route called");
  res.json({ ok: true, timestamp: Date.now() });
});

app.get("/api/error", async (req, res) => {
  await logger.log("backend", "error", "handler", "Simulated error occurred");
  res.status(400).json({ error: "simulated error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
