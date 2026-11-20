import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

import AppHeader from 'components/AppHeader';
import SuspenseLoader from 'components/SuspenseLoader';
import { turmasApi } from 'features/turmas/api/turmasApi';
import { professoresApi } from 'features/professores/api/professoresApi';

const AmbienteContent: React.FC = () => {
  const { data: turmas } = useSuspenseQuery({
    queryKey: ['turmas'],
    queryFn: turmasApi.listar,
  });

  const { data: professores } = useSuspenseQuery({
    queryKey: ['professores', '', ''],
    queryFn: () => professoresApi.listar(),
  });

  const cards = [
    {
      to: '/coordturmas',
      title: 'Visualizar Turmas',
      description: 'Acesse todas as turmas de Informática e Biologia e consulte seus horários.',
      icon: <ClassIcon sx={{ fontSize: 44 }} color="primary" />,
      kpi: `${turmas.length} turmas cadastradas`,
      kpiColor: 'primary' as const,
    },
    {
      to: '/coordgrade',
      title: 'Grade de Aulas',
      description: 'Edite disciplinas e aloque professores na grade semanal sem conflitos.',
      icon: <CalendarViewWeekIcon sx={{ fontSize: 44 }} color="secondary" />,
      kpi: '0 conflitos ativos',
      kpiColor: 'secondary' as const,
    },
    {
      to: '/coordprof',
      title: 'Gestão de Professores',
      description: 'Filtre docentes, acompanhe a carga horária e registre aulas efetivadas ou faltas.',
      icon: <PeopleAltIcon sx={{ fontSize: 44 }} color="primary" />,
      kpi: `${professores.length} professores ativos`,
      kpiColor: 'primary' as const,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid key={card.to} size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                transition: 'border-color 200ms ease',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardActionArea
                component={RouterLink}
                to={card.to}
                sx={{
                  height: '100%',
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ mb: 2 }}>{card.icon}</Box>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h5" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2">{card.description}</Typography>
                  </CardContent>
                </Box>

                <Stack direction="row" sx={{ mt: 3 }}>
                  <Chip
                    label={card.kpi}
                    size="small"
                    color={card.kpiColor}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export const Ambiente: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Ambiente do Coordenador"
        subtitle="Gerencie turmas, grades semanais e o acompanhamento dos professores."
        backTo="/"
      />
      <SuspenseLoader>
        <AmbienteContent />
      </SuspenseLoader>
    </Box>
  );
};

export default Ambiente;
