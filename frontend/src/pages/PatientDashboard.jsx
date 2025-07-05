import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

// For demo: get email from localStorage or prompt (replace with real auth/session in production)
const getPatientEmail = () => {
  return localStorage.getItem('patient_email') || '';
};

const PatientDashboard = () => {
  const [email, setEmail] = useState(getPatientEmail());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      setError('No patient email found. Please log in.');
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/patient-data?email=${encodeURIComponent(email)}`)
      .then(res => {
        setData(res.data);
        setError('');
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to fetch patient data.');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem('patient_email');
    navigate('/login');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" sx={{ width: '100%', px: { xs: 1, md: 0 }, py: { xs: 2, md: 6 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 5 }, width: '100%', maxWidth: 600, borderRadius: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Patient Dashboard
          </Typography>
          <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ ml: 2, fontWeight: 700 }}>
            Logout
          </Button>
        </Box>
        {loading && <CircularProgress />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {data && (
          <>
            <Typography variant="h6" color="primary" gutterBottom>
              First Visit: {data.first_visit || 'N/A'}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              Latest Visit: {data.latest_visit || 'N/A'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Visit & Prescription History
            </Typography>
            {(!data.visits || data.visits.length === 0) ? (
              <Typography>No visits or prescriptions found.</Typography>
            ) : (
              <List>
                {data.visits
                  .slice()
                  .sort((a, b) => {
                    // Sort by visit_date descending (latest first)
                    const dateA = new Date(a.visit_date || a.appointment_date || '1970-01-01');
                    const dateB = new Date(b.visit_date || b.appointment_date || '1970-01-01');
                    return dateB - dateA;
                  })
                  .map((visit, idx) => (
                    <ListItem key={idx} alignItems="flex-start">
                      <ListItemText
                        primary={`Visit Date: ${visit.visit_date || visit.appointment_date || 'N/A'}`}
                        secondary={
                          <>
                            <div>Prescription: <b>{visit.prescription || 'N/A'}</b></div>
                            <div>Appointment Booked For: {visit.appointment_date || 'N/A'} {visit.appointment_time || ''}</div>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PatientDashboard; 