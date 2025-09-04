// frontend/src/api.js
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

export async function createShortUrl(payload) {
  const res = await fetch(`${API_BASE}/shorturls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: res.statusText }));
    throw new Error(err.error || JSON.stringify(err));
  }
  return res.json();
}

export async function getStats(code) {
  const res = await fetch(`${API_BASE}/shorturls/${code}`);
  if (!res.ok) {
    const err = await res.json().catch(()=>({ error: res.statusText }));
    throw new Error(err.error || JSON.stringify(err));
  }
  return res.json();
}
