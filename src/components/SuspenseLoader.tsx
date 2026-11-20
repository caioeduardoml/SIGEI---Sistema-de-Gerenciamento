import React, { Component, Suspense } from 'react';
import { Box, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class LocalErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Erro ao carregar os dados.',
    };
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ maxWidth: 640, mx: 'auto', p: 3 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Não foi possível carregar esta seção
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              {this.state.errorMessage}
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRetry}
            >
              Tentar novamente
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export const DefaultSkeletonFallback: React.FC = () => (
  <Box sx={{ maxWidth: 1120, mx: 'auto', p: { xs: 2, md: 4 } }}>
    <Stack spacing={2.5}>
      <Skeleton variant="rounded" height={72} />
      <Skeleton variant="rounded" height={220} />
      <Skeleton variant="rounded" height={140} />
    </Stack>
  </Box>
);

interface SuspenseLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({ children, fallback }) => (
  <LocalErrorBoundary>
    <Suspense fallback={fallback ?? <DefaultSkeletonFallback />}>{children}</Suspense>
  </LocalErrorBoundary>
);

export default SuspenseLoader;
