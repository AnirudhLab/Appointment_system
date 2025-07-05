import React, { useState } from 'react';
import { Paper, Typography, Box, Button, TextField, Stack, Alert, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const bgImg = 'https://images.unsplash.com/photo-1519821172143-ecb1df1b1d1b?auto=format&fit=crop&w=800&q=80';

const PatientLogin = () => {
  const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/request-otp', { email });
      setStep(2);
      setSuccess('OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/verify-otp', { email, otp });
      setSuccess('Login successful!');
      localStorage.setItem('patient_email', email);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      sx={{
        width: '100%',
        background: `linear-gradient(120deg, #f7fafd 60%, #e3f2fd 100%), url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: { xs: 2, md: 6 },
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 2, md: 5 }, width: '100%', maxWidth: 400, mx: 'auto', borderRadius: 4 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
          Patient Login
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Login securely with your email. An OTP will be sent to your registered email address.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" disabled={loading || !email} sx={{ fontWeight: 700 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Request OTP'}
              </Button>
            </Stack>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <Stack spacing={2}>
              <TextField
                label="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" disabled={loading || !otp} sx={{ fontWeight: 700 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
              </Button>
              <Button onClick={() => { setStep(1); setOtp(''); setSuccess(''); setError(''); }} color="secondary">
                Back
              </Button>
            </Stack>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default PatientLogin; 