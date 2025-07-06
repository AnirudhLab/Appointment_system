import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Stack, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  Chip,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { format, isSameDay, parseISO } from 'date-fns';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

// Hardcoded admin email for simplicity, not recommended for production security.
const ADMIN_EMAIL = 'venkateshmanick@gmail.com';

const AdminDashboard = () => {
  // OTP login state
  const [step, setStep] = useState(localStorage.getItem('admin_email') ? 3 : 1); // 1: enter email, 2: enter OTP, 3: dashboard
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prescription upload state
  const [prescEmail, setPrescEmail] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientUploadLoading, setPatientUploadLoading] = useState(false);
  const [patientUploadError, setPatientUploadError] = useState('');
  const [patientUploadSuccess, setPatientUploadSuccess] = useState('');
  const [patientUploadDetails, setPatientUploadDetails] = useState('');

  const navigate = useNavigate();

  // Load appointments and reports when dashboard is active
  useEffect(() => {
    if (step === 3) {
      loadAppointments();
      loadReports();
      loadPatients();
    }
  }, [step]);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data.appointments || []);
    } catch (err) {
      setError('Failed to load appointments');
    }
  };

  const loadReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data);
    } catch (err) {
      setError('Failed to load reports');
    }
  };

  const loadPatients = async () => {
    try {
      const response = await api.get('/appointments');
      const all = response.data.appointments || [];
      // Group by email
      const map = {};
      all.forEach(row => {
        const email = (row.email || '').toLowerCase();
        if (!map[email]) map[email] = [];
        map[email].push(row);
      });
      const uniquePatients = Object.values(map).map(rows => {
        // Sort by appointment date
        const sorted = rows.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
        return {
          name: sorted[0].name,
          email: sorted[0].email,
          phone: sorted[0].phone,
          firstVisit: sorted[0].date,
          latestVisit: sorted[sorted.length - 1].visit_date || sorted[sorted.length - 1].date,
          allVisits: sorted
        };
      });
      setPatients(uniquePatients);
    } catch (err) {
      setError('Failed to load patients');
    }
  };

  // Get appointments for selected date
  const getAppointmentsForDate = (date) => {
    return appointments.filter(appt => {
      if (!appt.date) return false;
      try {
        const apptDate = parseISO(appt.date);
        return isSameDay(apptDate, date);
      } catch {
        // Try different date formats
        const apptDateStr = appt.date;
        if (apptDateStr.includes('/')) {
          const [day, month, year] = apptDateStr.split('/');
          const apptDate = new Date(year, month - 1, day);
          return isSameDay(apptDate, date);
        }
        return false;
      }
    });
  };

  // OTP handlers
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await api.post('/request-otp', { email });
      setStep(2);
      setOtpSuccess('OTP sent to your email!');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    // Only allow admin email(s), case-insensitive
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setOtpError('Unauthorized: Only the configured admin email can log in.');
      setOtpLoading(false);
      return;
    }
    try {
      await api.post('/verify-otp', { email, otp });
      setStep(3);
      setOtpSuccess('Login successful!');
      localStorage.setItem('admin_email', email);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('admin_email');
    setStep(1);
    setEmail('');
    setOtp('');
    setOtpSuccess('');
    setOtpError('');
    navigate('/admin');
  };

  // Prescription upload handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      await api.post('/upload-prescription', { email: prescEmail, details, date });
      setUploadSuccess('Prescription uploaded successfully!');
      setPrescEmail('');
      setDetails('');
      setDate('');
      // Reload appointments and reports
      loadAppointments();
      loadReports();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload prescription.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setDrawerOpen(true);
    setPatientUploadDetails('');
    setPatientUploadError('');
    setPatientUploadSuccess('');
  };

  const handlePatientUpload = async (e) => {
    e.preventDefault();
    setPatientUploadLoading(true);
    setPatientUploadError('');
    setPatientUploadSuccess('');
    try {
      await api.post('/upload-prescription', {
        email: selectedPatient.email,
        details: patientUploadDetails
      });
      setPatientUploadSuccess('Prescription uploaded successfully!');
      setPatientUploadDetails('');
      // Refresh patient data
      loadPatients();
      loadAppointments();
      loadReports();
    } catch (err) {
      setPatientUploadError(err.response?.data?.message || 'Failed to upload prescription.');
    } finally {
      setPatientUploadLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setOtpError('');
    setOtpSuccess('');
    if (value && value.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setEmailError('Only the configured admin email can log in.');
    } else {
      setEmailError('');
    }
  };

  const renderCalendar = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Appointment Calendar
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <StaticDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              renderDay={(day, _value, DayComponentProps) => {
                const dayAppointments = getAppointmentsForDate(day);
                return (
                  <Box
                    {...DayComponentProps}
                    sx={{
                      position: 'relative',
                      ...(dayAppointments.length > 0 && {
                        backgroundColor: 'primary.light',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        }
                      })
                    }}
                  >
                    {day.getDate()}
                    {dayAppointments.length > 0 && (
                      <Chip
                        label={dayAppointments.length}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          backgroundColor: 'secondary.main',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 16
                        }}
                      />
                    )}
                  </Box>
                );
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Appointments for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <Typography color="text.secondary">No appointments for this date</Typography>
            ) : (
              <Stack spacing={1}>
                {getAppointmentsForDate(selectedDate).map((appt, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {appt.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appt.time} • {appt.phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appt.email}
                      </Typography>
                      {appt.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Notes: {appt.notes}
                        </Typography>
                      )}
                      {appt.prescription && (
                        <Chip 
                          label="Prescription Uploaded" 
                          size="small" 
                          color="success" 
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReports = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Reports & Analytics
      </Typography>
      {reports ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Appointments (Unique Bookings)
                </Typography>
                <Typography variant="h4" color="primary">
                  {reports.total_appointments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Visits (All Prescriptions)
                </Typography>
                <Typography variant="h4" color="success.main">
                  {reports.total_visits}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pending Appointments (No Prescription)
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {reports.pending_appointments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Visit & Appointment Statistics (Last 6 Months)
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Appointments</TableCell>
                        <TableCell align="right">Visits</TableCell>
                        <TableCell align="right">Completion Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.monthly_stats.map((stat, index) => (
                        <TableRow key={index}>
                          <TableCell>{stat.month} {stat.year}</TableCell>
                          <TableCell align="right">{stat.appointments}</TableCell>
                          <TableCell align="right">{stat.visits}</TableCell>
                          <TableCell align="right">
                            {stat.appointments > 0 
                              ? `${Math.round((stat.visits / stat.appointments) * 100)}%`
                              : '0%'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <CircularProgress />
      )}
    </Box>
  );

  const renderAllAppointments = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        All Appointments
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appt, index) => (
              <TableRow key={index}>
                <TableCell>{appt.name}</TableCell>
                <TableCell>{appt.email}</TableCell>
                <TableCell>{appt.phone}</TableCell>
                <TableCell>{appt.date}</TableCell>
                <TableCell>{appt.time}</TableCell>
                <TableCell>{appt.notes}</TableCell>
                <TableCell>
                  {appt.prescription ? (
                    <Chip label="Completed" color="success" size="small" />
                  ) : (
                    <Chip label="Pending" color="warning" size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderPatients = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Patients</Typography>
      <TextField
        placeholder="Search by name or email"
        value={patientSearch}
        onChange={e => setPatientSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        sx={{ mb: 2, width: 350 }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>First Visit</TableCell>
              <TableCell>Latest Visit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.filter(p =>
              p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
              p.email.toLowerCase().includes(patientSearch.toLowerCase())
            ).map((p, idx) => (
              <TableRow key={idx} hover style={{ cursor: 'pointer' }} onClick={() => handlePatientClick(p)}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.phone}</TableCell>
                <TableCell>{p.firstVisit}</TableCell>
                <TableCell>{p.latestVisit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          {selectedPatient && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedPatient.name} ({selectedPatient.email})
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Phone: {selectedPatient.phone}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>Prescription History</Typography>
              <List>
                {selectedPatient.allVisits
                  .filter(v => v.prescription)
                  .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))
                  .map((v, idx) => (
                    <ListItem key={idx} alignItems="flex-start">
                      <ListItemText
                        primary={`Date: ${v.visit_date || 'N/A'}`}
                        secondary={<>
                          <div>Prescription: <b>{v.prescription}</b></div>
                          <div>Appointment: {v.date || 'N/A'} {v.time || ''}</div>
                        </>}
                      />
                    </ListItem>
                  ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>Upload New Prescription</Typography>
              {patientUploadError && <Alert severity="error" sx={{ mb: 2 }}>{patientUploadError}</Alert>}
              {patientUploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>{patientUploadSuccess}</Alert>}
              <form onSubmit={handlePatientUpload}>
                <TextField
                  label="Prescription Details"
                  value={patientUploadDetails}
                  onChange={e => setPatientUploadDetails(e.target.value)}
                  required
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="primary" disabled={patientUploadLoading} fullWidth>
                  {patientUploadLoading ? <CircularProgress size={24} color="inherit" /> : 'Upload Prescription'}
                </Button>
              </form>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" sx={{ width: '100%', px: { xs: 1, md: 0 }, py: { xs: 2, md: 6 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 5 }, width: '100%', maxWidth: 1200, borderRadius: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Admin Dashboard
          </Typography>
          {step === 3 && (
            <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ ml: 2, fontWeight: 700 }}>
              Logout
            </Button>
          )}
        </Box>
        
        {step === 1 && (
          <>
            <Typography variant="h6" color="primary" gutterBottom>
              Admin OTP Login
            </Typography>
            {otpError && <Alert severity="error" sx={{ mb: 2 }}>{otpError}</Alert>}
            {otpSuccess && <Alert severity="success" sx={{ mb: 2 }}>{otpSuccess}</Alert>}
            <form onSubmit={handleRequestOtp}>
              <Stack spacing={2}>
                <TextField
                  label="Admin Email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  fullWidth
                  error={!!emailError}
                  helperText={emailError}
                />
                <Button type="submit" variant="contained" color="primary" disabled={otpLoading || !email || !!emailError}>
                  {otpLoading ? <CircularProgress size={24} color="inherit" /> : 'Request OTP'}
                </Button>
              </Stack>
            </form>
          </>
        )}
        
        {step === 2 && (
          <>
            <Typography variant="h6" color="primary" gutterBottom>
              Enter OTP
            </Typography>
            {otpError && <Alert severity="error" sx={{ mb: 2 }}>{otpError}</Alert>}
            {otpSuccess && <Alert severity="success" sx={{ mb: 2 }}>{otpSuccess}</Alert>}
            <form onSubmit={handleVerifyOtp}>
              <Stack spacing={2}>
                <TextField
                  label="OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" color="primary" disabled={otpLoading || !otp}>
                  {otpLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
                </Button>
                <Button onClick={() => { setStep(1); setOtp(''); setOtpSuccess(''); setOtpError(''); }} color="secondary">
                  Back
                </Button>
              </Stack>
            </form>
          </>
        )}
        
        {step === 3 && (
          <>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Calendar" />
              <Tab label="Reports" />
              <Tab label="All Appointments" />
              <Tab label="Patients" />
              <Tab label="Upload Prescription" />
            </Tabs>
            
            {activeTab === 0 && renderCalendar()}
            {activeTab === 1 && renderReports()}
            {activeTab === 2 && renderAllAppointments()}
            {activeTab === 3 && renderPatients()}
            {activeTab === 4 && (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  Upload Prescription
                </Typography>
                {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
                {uploadSuccess && <Alert severity="success" sx={{ mb: 2 }}>{uploadSuccess}</Alert>}
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Patient Email"
                      type="email"
                      value={prescEmail}
                      onChange={e => setPrescEmail(e.target.value)}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Prescription Details"
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      required
                      multiline
                      rows={3}
                      fullWidth
                    />
                    <Button type="submit" variant="contained" color="primary" disabled={uploadLoading}>
                      {uploadLoading ? <CircularProgress size={24} color="inherit" /> : 'Upload Prescription'}
                    </Button>
                  </Stack>
                </form>
              </>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AdminDashboard; 