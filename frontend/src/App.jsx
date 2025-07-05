import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Box, Button, Stack, IconButton, useScrollTrigger, Slide, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LoginIcon from '@mui/icons-material/Login';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import theme from './theme';
import Home from './pages/Home';
import Services from './pages/Services';
import BookAppointment from './pages/BookAppointment';
import PatientLogin from './pages/PatientLogin';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const navLinks = [
  { label: 'Home', to: '/', icon: <HomeIcon /> },
  { label: 'Services', to: '/services', icon: <MedicalServicesIcon /> },
  { label: 'Book', to: '/book', icon: <EventAvailableIcon /> },
  { label: 'Patient Login', to: '/login', icon: <LoginIcon /> },
];

const AppHeader = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar position="sticky" color="primary" elevation={4} sx={{ background: 'linear-gradient(90deg, #1976d2 60%, #00bfae 100%)' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" sx={{ mr: 2 }} component={Link} to="/">
          <LocalHospitalIcon fontSize="large" />
        </IconButton>
        <Typography variant="h5" fontWeight={800} sx={{ flexGrow: 1, letterSpacing: 1 }}>
          PhysioCare
        </Typography>
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon fontSize="large" />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 250, p: 2 }} role="presentation" onClick={() => setDrawerOpen(false)}>
                <List>
                  {navLinks.map(link => (
                    <ListItem key={link.to} disablePadding>
                      <ListItemButton component={Link} to={link.to}>
                        <ListItemIcon>{link.icon}</ListItemIcon>
                        <ListItemText primary={link.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="/admin">
                      <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                      <ListItemText primary="Admin" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Stack direction="row" spacing={2}>
            {navLinks.map(link => (
              <Button key={link.to} color="inherit" component={Link} to={link.to} startIcon={link.icon} sx={{ fontWeight: 600 }}>
                {link.label}
              </Button>
            ))}
            <Button color="secondary" variant="contained" component={Link} to="/admin" sx={{ fontWeight: 700 }} startIcon={<AdminPanelSettingsIcon />}>
              Admin
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <HideOnScroll>
          <AppHeader />
        </HideOnScroll>
        <Box sx={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(120deg, #f7fafd 60%, #e3f2fd 100%)', py: { xs: 2, md: 4 } }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/login" element={<PatientLogin />} />
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
