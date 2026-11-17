import React, { useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Box, Container, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import { authApi } from 'features/auth/api/authApi';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  showUserActions?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  backTo = '/',
  showUserActions = true,
}) => {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      navigate('/');
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
        color: '#FFFFFF',
        pb: { xs: 4, md: 5 },
        mb: { xs: 3, md: 4 },
        boxShadow: '0 8px 30px rgba(76, 29, 149, 0.18)',
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Voltar">
                <IconButton
                  component={RouterLink}
                  to={backTo}
                  aria-label="Voltar para pagina anterior"
                  sx={{
                    color: '#FFFFFF',
                    minWidth: 44,
                    minHeight: 44,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Box
                component={RouterLink}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#FFFFFF',
                  textDecoration: 'none',
                }}
              >
                <SchoolIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700}>
                  SIGEI
                </Typography>
              </Box>
            </Box>

            {showUserActions && (
              <Tooltip title="Sair para inicio">
                <IconButton
                  onClick={handleLogout}
                  aria-label="Sair da sessao"
                  sx={{
                    color: '#FFFFFF',
                    minWidth: 44,
                    minHeight: 44,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' },
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ pt: 1 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: { xs: '1.65rem', md: '2.15rem' } }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body1"
            sx={{ color: '#EDE9FE', mt: 1, maxWidth: 680 }}
          >
            {subtitle}
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default AppHeader;
