import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import HealingIcon from '@mui/icons-material/Healing';

const services = [
  'Physiotherapy Consultation',
  'Rehabilitation Programs',
  'Pain Management',
  'Sports Injury Treatment',
  'Post-Surgical Recovery',
];

const heroImg = 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=800&q=80';

const Services = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ width: '100%', py: { xs: 2, md: 6 }, px: { xs: 2, md: 0 }, minHeight: '60vh' }}>
      <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
              Our Services
            </Typography>
            <List>
              {services.map((service, idx) => (
                <ListItem key={service}>
                  <ListItemIcon>
                    <HealingIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={service} />
                </ListItem>
              ))}
            </List>
          </Paper>
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
              alt="Physiotherapy Services"
              style={{ width: '100%', display: 'block', objectFit: 'cover', height: isMobile ? 180 : 320 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Services; 