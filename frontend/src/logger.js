// frontend/src/logger.js
const LOG_ENDPOINT = process.env.REACT_APP_LOG_ENDPOINT || 'http://20.244.56.144/evaluation-service/logs';
const LOG_TOKEN = process.env.REACT_APP_LOG_TOKEN;

export async function log(stack, level, pkg, message) {
  if (!LOG_TOKEN) return; // don't try if token missing
  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOG_TOKEN}`
      },
      body: JSON.stringify({ stack, level, package: pkg, message })
    });
  } catch (err) {
    // swallow network errors (do not use console.log)
  }
}
