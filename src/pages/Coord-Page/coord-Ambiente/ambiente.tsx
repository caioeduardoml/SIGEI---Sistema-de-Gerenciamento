import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import ClassIcon from '@mui/icons-material/Class';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

import AppHeader from 'components/AppHeader';

const CARDS = [
  {
    to: '/coordturmas',
    title: 'Visualizar Turmas',
    description: 'Acesse todas as turmas de Informatica e Biologia e consulte seus horarios.',
    icon: <ClassIcon sx={{ fontSize: 44 }} color="primary" />,
  },
  {
    to: '/coordgrade',
    title: 'Grade de Aulas',
    description: 'Edite disciplinas e aloque professores na grade semanal sem conflitos.',
    icon: <CalendarViewWeekIcon sx={{ fontSize: 44 }} color="secondary" />,
  },
  {
    to: '/coordprof',
    title: 'Professores',
    description: 'Filtre docentes, acompanhe carga horaria e registre aulas efetivadas ou faltas.',
    icon: <PeopleAltIcon sx={{ fontSize: 44 }} color="success" />,
  },
];

export const Ambiente: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Ambiente do Coordenador"
        subtitle="Gerencie turmas, grades semanais e o acompanhamento dos professores."
        backTo="/"
      />

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {CARDS.map((card) => (
            <Grid key={card.to} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'box-shadow 200ms ease, border-color 200ms ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 10px 30px rgba(124, 58, 237, 0.14)',
                  },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to={card.to}
                  sx={{ height: '100%', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                >
                  <Box sx={{ mb: 2 }}>{card.icon}</Box>
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h5" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2">{card.description}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Ambiente;
