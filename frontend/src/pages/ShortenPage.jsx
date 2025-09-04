import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Chip,
  Alert,
  Snackbar,
  Divider,
  alpha,
  useTheme,
  styled
} from "@mui/material";
import {
  Add,
  Delete,
  ContentCopy,
  OpenInNew,
  QrCode2,
  AutoAwesome,
  Link
} from "@mui/icons-material";
import { createShortUrl } from "../api";

// Styled components for enhanced UI
const GlassCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  borderRadius: '50px',
  padding: '10px 24px',
  fontWeight: '600',
  textTransform: 'none',
  boxShadow: '0 4px 15px 0 rgba(116, 79, 168, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 20px 0 rgba(116, 79, 168, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&.Mui-disabled': {
    background: theme.palette.grey[300],
  },
}));

const AnimatedCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[8],
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

export default function ShortenPage() {
  const theme = useTheme();
  const [urls, setUrls] = useState([
    { url: "", validity: 30, shortcode: "" },
  ]);
  const [results, setResults] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Add new form row
  const handleAdd = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: "", validity: 30, shortcode: "" }]);
    } else {
      setSnackbar({
        open: true,
        message: "Maximum 5 URLs allowed at once",
        severity: "info"
      });
    }
  };

  // Delete a row
  const handleDelete = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  // Update input field
  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  // Copy short URL to clipboard
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
    setSnackbar({
      open: true,
      message: "Copied to clipboard!",
      severity: "success"
    });
  };

  // Submit URLs
  const handleSubmit = async () => {
    try {
      const promises = urls.map((u) =>
        createShortUrl({
          url: u.url,
          validity: u.validity,
          ...(u.shortcode ? { shortcode: u.shortcode } : {}), // shortcode optional
        })
      );

      const responses = await Promise.allSettled(promises);
      setResults(responses.map((r) => (r.status === "fulfilled" ? r.value : r.reason)));
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred while creating short URLs",
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if at least one URL is filled
  const isSubmitDisabled = () => {
    return !urls.some(u => u.url.trim() !== "");
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
      }}
    >
      <Fade in timeout={800}>
        <Box>
          <Box
            sx={{
              textAlign: 'center',
              mb: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <Typography variant="h3" fontWeight="700" gutterBottom>
              <AutoAwesome sx={{ fontSize: 36, verticalAlign: 'middle', mr: 1 }} />
              Shorten Your URLs
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Create shortened URLs with custom codes and expiration times. Share them easily across platforms.
            </Typography>
          </Box>

          <GlassCard sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="600">
                URL Shortener
              </Typography>
              <Chip 
                icon={<Link />} 
                label={`${urls.length}/5 URLs`} 
                variant="outlined" 
                color="primary" 
              />
            </Box>

            {urls.map((u, i) => (
              <Slide in direction="up" timeout={(i + 1) * 150} key={i}>
                <Box sx={{ mb: 3 }}>
                  <AnimatedCard sx={{ p: 2, borderRadius: '12px' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          label="Long URL"
                          fullWidth
                          value={u.url}
                          placeholder="https://example.com/very-long-url-path"
                          onChange={(e) => handleChange(i, "url", e.target.value)}
                          InputProps={{
                            startAdornment: <Link color="primary" sx={{ mr: 1, opacity: 0.7 }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <StyledTextField
                          label="Validity (mins)"
                          type="number"
                          fullWidth
                          value={u.validity}
                          onChange={(e) => handleChange(i, "validity", e.target.value)}
                          inputProps={{ min: 1, max: 1440 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <StyledTextField
                          label="Custom Code (optional)"
                          fullWidth
                          value={u.shortcode}
                          placeholder="my-custom-link"
                          onChange={(e) => handleChange(i, "shortcode", e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={1} sx={{ textAlign: 'center' }}>
                        {urls.length > 1 && (
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(i)}
                            aria-label="delete"
                            sx={{ 
                              borderRadius: '8px',
                              background: alpha(theme.palette.error.main, 0.1),
                              '&:hover': {
                                background: alpha(theme.palette.error.main, 0.2),
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  </AnimatedCard>
                </Box>
              </Slide>
            ))}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAdd}
                disabled={urls.length >= 5}
                sx={{ 
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: '600',
                }}
              >
                Add Another URL
              </Button>
              
              <GradientButton
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitDisabled()}
                sx={{ minWidth: '200px' }}
              >
                Create Short URLs
              </GradientButton>
            </Box>
          </GlassCard>

          {results.length > 0 && (
            <Box id="results-section" mt={6}>
              <Typography variant="h4" fontWeight="700" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                Your Shortened URLs
              </Typography>
              
              <Grid container spacing={3}>
                {results.map((res, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Zoom in timeout={800} style={{ transitionDelay: `${i * 100}ms` }}>
                      <GlassCard 
                        sx={{ 
                          p: 3, 
                          height: '100%',
                          background: res.shortLink ? 
                            `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.1)} 100%)` :
                            `linear-gradient(135deg, ${alpha(theme.palette.error.light, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`
                        }}
                      >
                        {res.shortLink ? (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Chip 
                                label="Active" 
                                color="success" 
                                variant="outlined" 
                                size="small" 
                                icon={<AutoAwesome sx={{ fontSize: 16 }} />} 
                              />
                              <Typography variant="body2" color="text.secondary">
                                #{i + 1}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Original URL
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                mb: 2, 
                                wordBreak: 'break-all',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {urls[i].url}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Shortened URL
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box 
                                component="a" 
                                href={res.shortLink} 
                                target="_blank" 
                                rel="noreferrer"
                                sx={{
                                  flexGrow: 1,
                                  fontFamily: 'monospace',
                                  fontWeight: '600',
                                  fontSize: '1.1rem',
                                  color: 'primary.main',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {res.shortLink}
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(res.shortLink, i)}
                                sx={{ 
                                  ml: 1,
                                  background: copiedIndex === i ? alpha(theme.palette.success.main, 0.1) : 'transparent',
                                  color: copiedIndex === i ? 'success.main' : 'inherit'
                                }}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                              <Chip
                                icon={<QrCode2 />}
                                label="QR Code"
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  setSnackbar({
                                    open: true,
                                    message: "QR Code feature coming soon!",
                                    severity: "info"
                                  });
                                }}
                              />
                              <Chip
                                icon={<OpenInNew />}
                                label="Open"
                                variant="outlined"
                                size="small"
                                onClick={() => window.open(res.shortLink, '_blank')}
                              />
                            </Box>
                            
                            <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                              <Typography variant="body2" color="text.secondary">
                                Expires: {new Date(res.expiry).toLocaleString()}
                              </Typography>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Chip 
                                label="Error" 
                                color="error" 
                                variant="outlined" 
                                size="small" 
                              />
                              <Typography variant="body2" color="text.secondary">
                                #{i + 1}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Original URL
                            </Typography>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                mb: 2, 
                                wordBreak: 'break-all',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {urls[i].url}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Alert severity="error" sx={{ borderRadius: '12px' }}>
                              <Typography variant="body2">
                                {res.message || "An error occurred while shortening this URL"}
                              </Typography>
                            </Alert>
                            
                            <Button 
                              variant="outlined" 
                              fullWidth 
                              sx={{ mt: 2, borderRadius: '12px' }}
                              onClick={() => {
                                const newUrls = [...urls];
                                setResults(results.filter((_, idx) => idx !== i));
                                if (newUrls[i]) {
                                  newUrls[i].url = "";
                                  newUrls[i].shortcode = "";
                                  setUrls(newUrls);
                                }
                              }}
                            >
                              Try Again
                            </Button>
                          </>
                        )}
                      </GlassCard>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setUrls([{ url: "", validity: 30, shortcode: "" }]);
                    setResults([]);
                  }}
                  sx={{ borderRadius: '50px', px: 4 }}
                >
                  Create New URLs
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Fade>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ borderRadius: '12px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}