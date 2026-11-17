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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import AppHeader from 'components/AppHeader';
import SuspenseLoader from 'components/SuspenseLoader';
import { turmasApi } from 'features/turmas/api/turmasApi';

const ProfTurmasContent: React.FC = () => {
  const { data: turmas } = useSuspenseQuery({
    queryKey: ['turmas'],
    queryFn: turmasApi.listar,
  });

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2.5}>
        {turmas.map((turma) => (
          <Grid key={turma.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardActionArea
                component={RouterLink}
                to={`/turmas/${turma.codigo}`}
                sx={{ p: 2.5 }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <CalendarMonthIcon color="primary" />
                    <Chip label={turma.curso} size="small" color="primary" variant="outlined" />
                  </Stack>
                  <Typography variant="h6">{turma.nome}</Typography>
                  <Typography variant="body2">
                    Clique para consultar a grade semanal ({turma.turno})
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export const TurmaProf: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Portal do Professor"
        subtitle="Consulte as turmas e os horarios das suas aulas na semana."
        backTo="/"
      />
      <SuspenseLoader>
        <ProfTurmasContent />
      </SuspenseLoader>
    </Box>
  );
};

export default TurmaProf;
