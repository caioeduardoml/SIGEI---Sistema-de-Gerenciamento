import { createTheme } from '@mui/material/styles';

// Tema SIGEI baseado no Design System: contraste >= 4.5:1, foco visivel e tipografia Plus Jakarta Sans
export const sigeiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#4C1D95',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F97316',
      light: '#FB923C',
      dark: '#C2410C',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#059669',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF5FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, color: '#4C1D95' },
    h2: { fontWeight: 700, color: '#4C1D95' },
    h3: { fontWeight: 700, color: '#0F172A' },
    h4: { fontWeight: 700, color: '#0F172A' },
    h5: { fontWeight: 600, color: '#0F172A' },
    h6: { fontWeight: 600, color: '#0F172A' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, color: '#475569' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 44,
          paddingInline: 20,
          cursor: 'pointer',
          transition: 'background-color 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
          '&:focus-visible': {
            outline: '3px solid #A78BFA',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.06)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
  },
});
