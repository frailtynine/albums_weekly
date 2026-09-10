import { createTheme } from '@mui/material/styles';

export const cmsTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#88f7d2',
    },
    secondary: {
      main: '#8ea5ff',
    },
    background: {
      default: '#09111f',
      paper: 'rgba(16, 27, 48, 0.9)',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(14px)',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
  },
});
