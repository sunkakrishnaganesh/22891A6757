// frontend/src/pages/StatsPage.jsx
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getStats } from '../api';
import { log } from '../logger';

function StatsPage() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  async function loadStats() {
    setLoading(true);
    await log('frontend','info','stats','Loading stats page');
    const stored = JSON.parse(localStorage.getItem('shortlinks') || '[]');
    const resArr = [];
    for (const it of stored) {
      try {
        const stats = await getStats(it.code);
        resArr.push({ ...it, stats });
      } catch (e) {
        resArr.push({ ...it, stats: { error: e.message }});
      }
    }
    setItems(resArr);
    setLoading(false);
  }

  React.useEffect(()=>{ loadStats(); }, []);

  return (
    <div>
      <Typography variant="h5" gutterBottom>Shortlinks Statistics</Typography>
      <Button onClick={loadStats} disabled={loading} variant="contained">Refresh</Button>
      {loading && <CircularProgress sx={{ ml: 2 }} />}

      {items.length === 0 && <Typography mt={2}>No shortlinks found. Create some on the Shorten page.</Typography>}

      {items.map((it) => (
        <Accordion key={it.code} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ width: '60%' }}>{it.shortLink}</Typography>
            <Typography>Total clicks: {it.stats && it.stats.totalClicks ? it.stats.totalClicks : 0}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Original: {it.stats && it.stats.originalUrl ? it.stats.originalUrl : it.originalUrl}</Typography>
            <Typography>Created: {new Date(it.stats?.createdAt || it.createdAt).toLocaleString()}</Typography>
            <Typography>Expiry: {new Date(it.stats?.expiry || it.expiry).toLocaleString()}</Typography>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>Clicks</Typography>
            {it.stats && it.stats.clicks && it.stats.clicks.length > 0 ? (
              it.stats.clicks.map((c, idx) => (
                <div key={idx}>
                  <Typography>- {new Date(c.timestamp).toLocaleString()} | Referrer: {c.referrer} | IP: {c.ip}</Typography>
                </div>
              ))
            ) : (
              <Typography>No clicks yet.</Typography>
            )}
            {it.stats && it.stats.error && <Typography color="error">Error fetching stats: {it.stats.error}</Typography>}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}

export default StatsPage;
