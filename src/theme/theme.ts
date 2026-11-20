import { createTheme } from '@mui/material/styles';

// Identidade Visual Modern Organic Playful:
// Off-white quente (#F9F6F3), Verde petroleo (#287F78), Laranja vibrante (#FFA000), Cards (#F0F0EF)
export const sigeiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#287F78',
      light: '#45A39B',
      dark: '#1D5E59',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFA000',
      light: '#FFB733',
      dark: '#E08C00',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#287F78',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F9F6F3',
      paper: '#F0F0EF',
    },
    text: {
      primary: '#252321',
      secondary: '#77736F',
    },
    divider: '#E0DDD8',
  },
  typography: {
    fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Dosis', sans-serif",
      fontWeight: 800,
      color: '#252321',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontFamily: "'Dosis', sans-serif",
      fontWeight: 700,
      color: '#252321',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: "'Dosis', sans-serif",
      fontWeight: 700,
      color: '#252321',
    },
    h4: {
      fontFamily: "'Dosis', sans-serif",
      fontWeight: 700,
      color: '#252321',
    },
    h5: {
      fontFamily: "'Dosis', sans-serif",
      fontWeight: 700,
      color: '#252321',
    },
    h6: {
      fontFamily: "'Dosis', sans-serif",
      fontWeight: 700,
      color: '#252321',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.65,
      color: '#252321',
    },
    body2: {
      fontSize: '0.9rem',
      lineHeight: 1.55,
      color: '#77736F',
    },
    button: {
      fontFamily: "'Nunito Sans', sans-serif",
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 44,
          paddingInline: 22,
          boxShadow: 'none',
          cursor: 'pointer',
          transition: 'background-color 200ms ease, border-color 200ms ease, transform 150ms ease',
          '&:hover': {
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: '3px solid #FFA000',
            outlineOffset: 2,
          },
        },
        containedSecondary: {
          color: '#FFFFFF',
          backgroundColor: '#FFA000',
          '&:hover': {
            backgroundColor: '#E58F00',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#F0F0EF',
          borderRadius: 20,
          border: '1px solid #E0DDD8',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#F0F0EF',
          borderRadius: 18,
          border: '1px solid #E0DDD8',
          boxShadow: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#F9F6F3',
        },
      },
    },
  },
});
