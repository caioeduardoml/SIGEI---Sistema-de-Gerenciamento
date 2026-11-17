import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';

import { sigeiTheme } from 'theme/theme';
import { queryClient } from 'lib/queryClient';
import { SnackbarProvider } from 'components/SnackbarProvider';
import AppRoutes from './routers';
import './assets/styles/global.css';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={sigeiTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <AppRoutes />
        </SnackbarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
