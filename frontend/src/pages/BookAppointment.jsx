import React, { useState } from 'react';
import {
  Paper, Typography, Box, TextField, Button, Stack, Alert, CircularProgress, MenuItem, Grid, useTheme, useMediaQuery
} from '@mui/material';
import api from '../api/api';

const heroImg = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd07?auto=format&fit=crop&w=800&q=80';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  notes: '',
};

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00'
];

const BookAppointment = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10,}$/.test(form.phone.replace(/\D/g, ''))) errs.phone = 'Invalid phone number';
    if (!form.date) errs.date = 'Date is required';
    if (!form.time) errs.time = 'Time is required';
    return errs;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setApiError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      await api.post('/appointments', form);
      setSubmitted(true);
      setForm(initialForm);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" sx={{ width: '100%' }}>
      <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ maxWidth: 1200, width: '100%' }}>
        <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 5 }, width: '100%', maxWidth: 500, mx: 'auto', borderRadius: 4 }}>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
              Book an Appointment
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Fill out the form below to schedule your visit with our expert physiotherapists.
            </Typography>
            {submitted && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Appointment request submitted! We will contact you soon.
              </Alert>
            )}
            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  fullWidth
                  type="email"
                />
                <TextField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                  fullWidth
                  type="tel"
                />
                <TextField
                  label="Preferred Date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  error={!!errors.date}
                  helperText={errors.date}
                  required
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Preferred Time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  error={!!errors.time}
                  helperText={errors.time}
                  required
                  fullWidth
                  select
                  InputLabelProps={{ shrink: true }}
                >
                  {TIME_SLOTS.map(slot => (
                    <MenuItem key={slot} value={slot}>
                      {slot.slice(0, 2) + ':' + slot.slice(3)} {parseInt(slot) < 12 ? 'AM' : 'PM'}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Notes (optional)"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  fullWidth
                />
                <Button variant="contained" color="primary" size="large" type="submit" disabled={loading} sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Book Appointment'}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 420,
              mx: 'auto',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: 6,
              mb: { xs: 3, md: 0 },
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.04)',
                boxShadow: 12,
              },
            }}
          >
            <img
              src={heroImg}
              alt="Physiotherapy Booking"
              style={{ width: '100%', display: 'block', objectFit: 'cover', height: isMobile ? 180 : 320 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookAppointment; 