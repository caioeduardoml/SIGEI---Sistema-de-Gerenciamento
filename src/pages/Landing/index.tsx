import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import logo from '../../assets/images/logo_sigei.svg';
import schoolIllustration from '../../assets/images/schoo.svg';

const FEATURES = [
  {
    icon: <CalendarMonthIcon color="primary" fontSize="large" />,
    title: 'Grades Semanais Dinamicas',
    description:
      'Organize horarios por turma com deteccao automatica de conflitos de docentes.',
  },
  {
    icon: <GroupsIcon color="primary" fontSize="large" />,
    title: 'Gestao de Professores',
    description:
      'Acompanhe aulas efetivadas, carga horaria restante e faltas em tempo real.',
  },
  {
    icon: <FactCheckIcon color="primary" fontSize="large" />,
    title: 'Onboarding por Codigo',
    description:
      'Cadastre sua escola e libere um codigo exclusivo para coordenadores e docentes.',
  },
];

export const Landing: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      {/* Secao Hero com fundo roxo dedicado para garantir contraste em qualquer resolucao */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
          pt: { xs: 2, md: 3 },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          {/* Barra de navegacao superior */}
          <Box
            component="nav"
            aria-label="Navegacao principal"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src={logo}
                alt="Logotipo SIGEI"
                sx={{ height: 42, width: 'auto' }}
              />
            </Box>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                component={RouterLink}
                to="/sobre"
                variant="text"
                startIcon={<InfoOutlinedIcon />}
                sx={{ color: '#FFFFFF', '&:hover': { bgcolor: 'rgba(255,255,255,0.14)' } }}
              >
                Sobre
              </Button>
              <Button
                component={RouterLink}
                to="/entrar"
                variant="contained"
                color="secondary"
                startIcon={<LoginIcon />}
              >
                Entrar
              </Button>
            </Stack>
          </Box>

          {/* Hero Section */}
          <Grid container spacing={4} alignItems="center" sx={{ mt: { xs: 2, md: 4 } }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  lineHeight: 1.15,
                  mb: 2,
                }}
              >
                Gerenciamento escolar inteligente e sem conflitos.
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#EDE9FE', fontSize: '1.1rem', mb: 4, maxWidth: 520 }}
              >
                Uma plataforma completa para coordenadores e professores gerenciarem grades de horarios,
                turmas e carga horaria docente com agilidade.
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    component={RouterLink}
                    to="/cadastroescola"
                    variant="contained"
                    fullWidth
                    startIcon={<DomainAddIcon />}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: '#4C1D95',
                      '&:hover': { bgcolor: '#F3E8FF' },
                    }}
                  >
                    Cadastro de Escolas
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    component={RouterLink}
                    to="/cadastrocoord"
                    variant="outlined"
                    fullWidth
                    startIcon={<SupervisorAccountIcon />}
                    sx={{
                      color: '#FFFFFF',
                      bgcolor: 'rgba(255, 255, 255, 0.12)',
                      borderColor: 'rgba(255, 255, 255, 0.75)',
                      '&:hover': {
                        borderColor: '#FFFFFF',
                        bgcolor: 'rgba(255, 255, 255, 0.22)',
                      },
                    }}
                  >
                    Cadastro Coordenador
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    component={RouterLink}
                    to="/cadastroprof"
                    variant="outlined"
                    fullWidth
                    startIcon={<PersonAddIcon />}
                    sx={{
                      color: '#FFFFFF',
                      bgcolor: 'rgba(255, 255, 255, 0.12)',
                      borderColor: 'rgba(255, 255, 255, 0.75)',
                      '&:hover': {
                        borderColor: '#FFFFFF',
                        bgcolor: 'rgba(255, 255, 255, 0.22)',
                      },
                    }}
                  >
                    Cadastro Professor
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Button
                    component={RouterLink}
                    to="/coordambiente"
                    variant="contained"
                    color="secondary"
                    fullWidth
                  >
                    Acessar Painel Demo
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src={schoolIllustration}
                alt="Ilustracao de ambiente escolar SIGEI"
                sx={{
                  width: '100%',
                  maxWidth: 440,
                  height: 'auto',
                  filter: 'drop-shadow(0 18px 36px rgba(15, 23, 42, 0.25))',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Cards de Funcionalidades */}
      <Container maxWidth="lg" sx={{ mt: { xs: 3, md: -4 } }}>
        <Grid container spacing={3}>
          {FEATURES.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 1.5 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing;
