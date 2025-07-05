import React from 'react';
import { Box, Typography, Button, Stack, Grid, useTheme, useMediaQuery, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const heroImg = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 3,
        px: { xs: 2, md: 0 },
        py: { xs: 2, md: 6 },
        width: '100%',
      }}
    >
      <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ maxWidth: 1200, width: '100%' }}>
        <Grid item xs={12} md={6}>
          <Typography variant={isMobile ? 'h4' : 'h2'} fontWeight={800} gutterBottom color="primary.main">
            Welcome to Physio Hospital
          </Typography>
          <Typography variant={isMobile ? 'h6' : 'h5'} color="text.secondary" gutterBottom>
            Your health, our priority. Get the best physiotherapy care with us.
          </Typography>
          <Stack direction={isMobile ? 'column' : 'row'} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              to="/book"
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, width: isMobile ? '100%' : 'auto' }}
            >
              Book Appointment
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              component={Link}
              to="/services"
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, width: isMobile ? '100%' : 'auto' }}
            >
              View Services
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 420,
              mx: 'auto',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: 6,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.04)',
                boxShadow: 12,
              },
            }}
          >
            <img
              src={heroImg}
              alt="Physiotherapy Hero"
              style={{ width: '100%', display: 'block', objectFit: 'cover', height: isMobile ? 180 : 320 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home; 