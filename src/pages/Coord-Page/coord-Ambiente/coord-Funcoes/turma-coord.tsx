import React, { useMemo, useState } from 'react';
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
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';

import AppHeader from 'components/AppHeader';
import SuspenseLoader from 'components/SuspenseLoader';
import { turmasApi } from 'features/turmas/api/turmasApi';

const TurmasListContent: React.FC = () => {
  const [cursoFiltro, setCursoFiltro] = useState<string>('Todos');

  const { data: turmas } = useSuspenseQuery({
    queryKey: ['turmas'],
    queryFn: turmasApi.listar,
  });

  const cursos = useMemo(() => {
    const set = new Set(turmas.map((t) => t.curso));
    return ['Todos', ...Array.from(set)];
  }, [turmas]);

  const turmasFiltradas = useMemo(
    () =>
      cursoFiltro === 'Todos'
        ? turmas
        : turmas.filter((t) => t.curso === cursoFiltro),
    [turmas, cursoFiltro]
  );

  return (
    <Container maxWidth="lg">
      <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        {cursos.map((curso) => (
          <Chip
            key={curso}
            label={curso}
            color={cursoFiltro === curso ? 'primary' : 'default'}
            variant={cursoFiltro === curso ? 'filled' : 'outlined'}
            onClick={() => setCursoFiltro(curso)}
            sx={{ cursor: 'pointer', minHeight: 36 }}
          />
        ))}
      </Stack>

      <Grid container spacing={2.5}>
        {turmasFiltradas.map((turma) => (
          <Grid key={turma.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                height: '100%',
                transition: 'box-shadow 200ms ease, border-color 200ms ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.14)',
                },
              }}
            >
              <CardActionArea
                component={RouterLink}
                to={`/turmas/${turma.codigo}`}
                sx={{ height: '100%', p: 2.5 }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <ClassOutlinedIcon color="primary" />
                    <Chip label={turma.curso} size="small" color="primary" variant="outlined" />
                  </Stack>
                  <Typography variant="h6" gutterBottom>
                    {turma.nome}
                  </Typography>
                  <Typography variant="body2">
                    Codigo: {turma.codigo} • Turno: {turma.turno}
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

export const CoordTurmas: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Turmas"
        subtitle="Selecione uma turma para visualizar ou editar sua grade semanal."
        backTo="/coordambiente"
      />
      <SuspenseLoader>
        <TurmasListContent />
      </SuspenseLoader>
    </Box>
  );
};

export default CoordTurmas;
