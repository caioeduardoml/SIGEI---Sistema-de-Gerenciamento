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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import FactCheckIcon from '@mui/icons-material/FactCheck';

import {
  HandDrawnArrow,
  HandDrawnBolt,
  HandDrawnSparkle,
} from 'components/OrganicDecorations';
import schoolIllustration from '../../assets/images/schoo.svg';

const FEATURES = [
  {
    icon: <CalendarMonthIcon color="primary" fontSize="large" />,
    title: 'Grades Semanais Dinâmicas',
    description:
      'Organize horários por turma com detecção automática de conflitos entre docentes.',
  },
  {
    icon: <GroupsIcon color="primary" fontSize="large" />,
    title: 'Gestão de Professores',
    description:
      'Acompanhe aulas efetivadas, carga horária restante e faltas em tempo real.',
  },
  {
    icon: <FactCheckIcon color="primary" fontSize="large" />,
    title: 'Onboarding por Código',
    description:
      'Cadastre sua instituição e libere um código exclusivo para coordenadores e docentes.',
  },
];

export const Landing: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 3 } }}>
        {/* Barra de navegacao superior editorial */}
        <Box
          component="nav"
          aria-label="Navegação principal"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 2,
            borderBottom: '1px solid #E0DDD8',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px 16px 12px 18px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontFamily: "'Dosis', sans-serif",
                fontWeight: 800,
                fontSize: '1.15rem',
              }}
            >
              S
            </Box>
            <Typography
              variant="h5"
              component="span"
              sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.03em' }}
            >
              SIGEI
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              component={RouterLink}
              to="/sobre"
              variant="text"
              startIcon={<InfoOutlinedIcon />}
              sx={{ color: 'text.primary' }}
            >
              Sobre
            </Button>
            <Button
              component={RouterLink}
              to="/entrar"
              variant="outlined"
              color="primary"
              startIcon={<LoginIcon />}
            >
              Entrar
            </Button>
          </Stack>
        </Box>

        {/* Hero Section com composicao editorial assimetrica */}
        <Grid
          container
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          sx={{ mt: { xs: 3, md: 6 }, mb: { xs: 6, md: 9 } }}
        >
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <HandDrawnSparkle size={22} color="#FFA000" />
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.04em' }}
              >
                GESTÃO ESCOLAR HUMANIZADA
              </Typography>
            </Stack>

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.35rem', sm: '3rem', md: '3.5rem' },
                lineHeight: 1.08,
                mb: 2.5,
              }}
            >
              Gerenciamento escolar{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                inteligente
              </Box>{' '}
              e sem conflitos.
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', fontSize: '1.1rem', mb: 4, maxWidth: 520 }}
            >
              Plataforma completa para coordenadores e professores gerenciarem grades de horários,
              turmas e carga horária docente com agilidade.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                component={RouterLink}
                to="/comecar"
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 3.5, py: 1.5, fontSize: '1rem', color: '#FFFFFF' }}
              >
                Começar agora
              </Button>

              <Button
                component={RouterLink}
                to="/coordambiente"
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<PlayCircleOutlineIcon />}
              >
                Acessar Painel Demo
              </Button>
            </Stack>

            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, mt: 2, ml: 2 }}>
              <HandDrawnArrow color="#287F78" />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Configure sua escola em poucos minutos
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            {/* Blocos de cores sobrepostos com formas organicas arredondadas */}
            <Box
              sx={{
                position: 'relative',
                maxWidth: 400,
                mx: 'auto',
                p: 3,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 8,
                  width: '82%',
                  height: '86%',
                  bgcolor: 'primary.main',
                  borderRadius: '36% 64% 58% 42% / 44% 38% 62% 56%',
                  zIndex: 0,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 6,
                  left: 10,
                  width: 110,
                  height: 110,
                  bgcolor: 'secondary.main',
                  borderRadius: '54% 46% 38% 62% / 48% 58% 42% 52%',
                  zIndex: 0,
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  bgcolor: 'rgba(249, 246, 243, 0.94)',
                  borderRadius: '28px',
                  boxShadow: '0 12px 32px rgba(37, 35, 33, 0.08)',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Box sx={{ position: 'absolute', top: -16, left: -12 }}>
                  <HandDrawnBolt color="#FFA000" />
                </Box>
                <Box sx={{ position: 'absolute', bottom: -14, right: 16 }}>
                  <HandDrawnSparkle color="#287F78" size={32} />
                </Box>
                <Box
                  component="img"
                  src={schoolIllustration}
                  alt="Ilustração de ambiente escolar SIGEI"
                  sx={{ width: '100%', maxWidth: 270, height: 'auto' }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Cards de Funcionalidades */}
        <Grid container spacing={3}>
          {FEATURES.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3.5 }}>
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
