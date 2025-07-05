import { createTheme } from '@mui/material/styles';
import { red, blue, teal, green, orange } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // vibrant blue
    },
    secondary: {
      main: '#00bfae', // teal
    },
    success: {
      main: green[600],
    },
    warning: {
      main: orange[600],
    },
    error: {
      main: red[600],
    },
    info: {
      main: blue[400],
    },
    background: {
      default: '#f7fafd',
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.08)',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0 4px 16px 0 rgba(25, 118, 210, 0.16)',
            transform: 'translateY(-2px) scale(1.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          transition: 'box-shadow 0.2s, transform 0.2s',
          '&:hover': {
            boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.18)',
            transform: 'scale(1.03)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme; 