const express = require("express");
const fetch = require("node-fetch");
const cors = require('cors');
global.fetch = fetch;

const { RemoteLogger, expressLogger } = require("../Logging-Middleware");
const { nanoid } = require("nanoid");

const app = express();
app.use(express.json());
app.use(cors()); 

// ===== Logger Setup =====
const logger = new RemoteLogger(process.env.LOG_TOKEN);
app.use(expressLogger(logger));

// ===== In-memory storage =====
// Map: shortcode -> { url, createdAt, expiry, clicks[] }
const urlStore = new Map();

// ===== Test Routes =====
app.get("/api/ping", async (req, res) => {
  await logger.log("backend", "debug", "handler", "Ping route called");
  res.json({ ok: true, timestamp: Date.now() });
});

app.get("/api/error", async (req, res) => {
  await logger.log("backend", "error", "handler", "Simulated error occurred");
  res.status(400).json({ error: "simulated error" });
});

// ===== URL Shortener Routes =====

// Create Short URL
app.post("/shorturls", async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;

    // 1. Validate URL
    try {
      new URL(url);
    } catch {
      await logger.log("backend", "error", "validation", "Invalid URL format");
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // 2. Validity (default 30 min)
    const minutes = validity && Number.isInteger(validity) ? validity : 30;
    const expiry = new Date(Date.now() + minutes * 60000);

    // 3. Shortcode handling
    let code = shortcode || nanoid(6);
    if (!/^[a-zA-Z0-9]{4,16}$/.test(code)) {
      return res.status(400).json({ error: "Invalid shortcode format" });
    }
    if (urlStore.has(code)) {
      return res.status(409).json({ error: "Shortcode already exists" });
    }

    // 4. Save to store
    urlStore.set(code, {
      url,
      createdAt: new Date(),
      expiry,
      clicks: []
    });

    const shortLink = `${req.protocol}://${req.get("host")}/${code}`;
    await logger.log("backend", "info", "shorten", `Created shortlink ${code}`);

    res.status(201).json({
      shortLink,
      expiry: expiry.toISOString()
    });
  } catch (err) {
    await logger.log("backend", "error", "server", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Redirect route
app.get("/:code", async (req, res) => {
  const code = req.params.code;
  const entry = urlStore.get(code);

  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found" });
  }
  if (new Date() > entry.expiry) {
    return res.status(410).json({ error: "Link expired" });
  }

  // Track click
  entry.clicks.push({
    timestamp: new Date(),
    referrer: req.get("referer") || "direct",
    ip: req.ip || req.connection.remoteAddress
  });

  await logger.log("backend", "info", "redirect", `Shortlink ${code} clicked`);

  res.redirect(entry.url);
});

// Stats route
app.get("/shorturls/:code", async (req, res) => {
  const code = req.params.code;
  const entry = urlStore.get(code);

  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found" });
  }

  res.json({
    originalUrl: entry.url,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    totalClicks: entry.clicks.length,
    clicks: entry.clicks
  });
});

// ===== Server Startup =====
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
