
const fetch = require("node-fetch"); 

const BASE_URL = "http://20.244.56.144/evaluation-service/logs";

class RemoteLogger {
  constructor(token) {
    if (!token) throw new Error("LOG_TOKEN is required");
    this.token = token;
  }

  async log(stack, level, pkg, message) {
    const payload = { stack, level, package: pkg, message };
    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.error("Logger error:", err.message);
    }
  }
}

function expressLogger(logger) {
  return (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const elapsed = Date.now() - start;
      logger.log(
        "backend",
        "info",
        "route",
        `${req.method} ${req.originalUrl} ${res.statusCode} ${elapsed}ms`
      );
    });
    next();
  };
}
module.exports.RemoteLogger = RemoteLogger;
module.exports.expressLogger = expressLogger;
