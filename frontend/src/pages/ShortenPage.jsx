// frontend/src/pages/ShortenPage.jsx
import React from 'react';
import { Box, Grid, TextField, Button, Paper, Typography, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { createShortUrl } from '../api';
import { log } from '../logger';

function ShortenPage() {
  const [rows, setRows] = React.useState(Array.from({length:5}).map(()=>({url:'', validity:'', shortcode:'', errors:{}})));
  const [results, setResults] = React.useState(() => JSON.parse(localStorage.getItem('shortlinks') || '[]'));
  const [loading, setLoading] = React.useState(false);

  function handleChange(index, field, value) {
    const copy = rows.slice();
    copy[index] = { ...copy[index], [field]: value, errors: { ...copy[index].errors, submit: undefined } };
    setRows(copy);
  }

  function validateRow(r) {
    const errors = {};
    try { new URL(r.url); } catch { errors.url = 'Invalid URL'; }
    if (r.validity && !/^\d+$/.test(String(r.validity))) errors.validity = 'Must be integer';
    if (r.shortcode && !/^[a-zA-Z0-9]{4,16}$/.test(r.shortcode)) errors.shortcode = '4-16 alphanumeric';
    return errors;
  }

  async function handleSubmit() {
    setLoading(true);
    await log('frontend','info','shorten','Submitting shorten request');
    const created = [...results];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.url) continue;
      const errors = validateRow(row);
      if (Object.keys(errors).length) {
        const copy = rows.slice(); copy[i].errors = errors; setRows(copy); continue;
      }
      try {
        const payload = { url: row.url };
        if (row.validity) payload.validity = parseInt(row.validity, 10);
        if (row.shortcode) payload.shortcode = row.shortcode;
        const res = await createShortUrl(payload);
        const code = res.shortLink.split('/').pop();
        const item = { code, shortLink: res.shortLink, expiry: res.expiry, originalUrl: row.url, createdAt: new Date().toISOString() };
        created.push(item);
        await log('frontend','info','shorten',`Created ${code}`);
      } catch (e) {
        const copy = rows.slice(); copy[i].errors = { submit: e.message }; setRows(copy);
      }
    }

    setResults(created);
    localStorage.setItem('shortlinks', JSON.stringify(created));
    setLoading(false);
  }

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    await log('frontend','info','ui','Copied shortlink to clipboard');
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Shorten up to 5 URLs</Typography>

      {rows.map((r, idx) => (
        <Paper key={idx} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Long URL" value={r.url} onChange={(e)=>handleChange(idx,'url',e.target.value)} error={!!r.errors.url} helperText={r.errors.url}/>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Validity (minutes)" value={r.validity} onChange={(e)=>handleChange(idx,'validity',e.target.value)} error={!!r.errors.validity} helperText={r.errors.validity}/>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField fullWidth label="Preferred shortcode" value={r.shortcode} onChange={(e)=>handleChange(idx,'shortcode',e.target.value)} error={!!r.errors.shortcode} helperText={r.errors.shortcode}/>
            </Grid>
            {r.errors.submit && <Grid item xs={12}><Typography color="error">{r.errors.submit}</Typography></Grid>}
          </Grid>
        </Paper>
      ))}

      <Button variant="contained" onClick={handleSubmit} disabled={loading}>Create Shortlinks</Button>

      <Box mt={4}>
        <Typography variant="h6">Created Links</Typography>
        {results.length === 0 && <Typography>No links yet.</Typography>}
        {results.map((it) => (
          <Paper key={it.code} sx={{ p: 2, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
            <Box>
              <Typography>{it.originalUrl}</Typography>
              <Typography variant="body2">Short: <a href={it.shortLink} target="_blank" rel="noreferrer">{it.shortLink}</a></Typography>
              <Typography variant="body2">Expires: {new Date(it.expiry).toLocaleString()}</Typography>
            </Box>
            <Box>
              <IconButton onClick={()=>copyToClipboard(it.shortLink)}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default ShortenPage;
