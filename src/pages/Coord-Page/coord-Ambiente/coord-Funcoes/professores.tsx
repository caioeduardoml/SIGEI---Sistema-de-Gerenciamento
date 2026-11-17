import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SearchIcon from '@mui/icons-material/Search';

import AppHeader from 'components/AppHeader';
import SuspenseLoader from 'components/SuspenseLoader';
import { useMuiSnackbar } from 'components/SnackbarProvider';
import { professoresApi } from 'features/professores/api/professoresApi';
import type { Professor, TipoRegistroAula } from 'types/sigei';

import ProfGaby from '../../../../assets/images/prof-gabriella.jpg';
import ProfCaio from '../../../../assets/images/prof-caio.jpg';
import ProfBiliu from '../../../../assets/images/prof-biliu.jpg';

const FOTOS_LOCAIS: Record<string, string> = {
  Gabriella: ProfGaby,
  'Caio Gilberto': ProfCaio,
  'Joao Vitor': ProfBiliu,
};

const ProfessoresListContent: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useMuiSnackbar();

  const [buscaNome, setBuscaNome] = useState('');
  const [buscaDisciplina, setBuscaDisciplina] = useState('');

  const { data: professores } = useSuspenseQuery({
    queryKey: ['professores', '', ''],
    queryFn: () => professoresApi.listar(),
  });

  const registrarMutation = useMutation({
    mutationFn: ({ id, tipo }: { id: string; tipo: TipoRegistroAula }) =>
      professoresApi.registrarAula(id, tipo, 1),
    onSuccess: (profAtualizado) => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      showSnackbar(`Registro atualizado para ${profAtualizado.nome}.`, 'success');
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao registrar aula.', 'error');
    },
  });

  const handleRegistrar = useCallback(
    (id: string, tipo: TipoRegistroAula) => {
      registrarMutation.mutate({ id, tipo });
    },
    [registrarMutation]
  );

  const filtrados = useMemo(() => {
    const n = buscaNome.trim().toLowerCase();
    const d = buscaDisciplina.trim().toLowerCase();
    return professores.filter((p) => {
      const matchNome = !n || p.nome.toLowerCase().includes(n);
      const matchDisc = !d || p.disciplina.toLowerCase().includes(d);
      return matchNome && matchDisc;
    });
  }, [professores, buscaNome, buscaDisciplina]);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="filtro-prof-nome"
              label="Filtrar por nome"
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="filtro-prof-disciplina"
              label="Filtrar por disciplina"
              value={buscaDisciplina}
              onChange={(e) => setBuscaDisciplina(e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2.5}>
        {filtrados.map((prof: Professor) => {
          const progresso =
            prof.aulasTotaisSemestre > 0
              ? Math.round((prof.aulasEfetivadas / prof.aulasTotaisSemestre) * 100)
              : 0;
          const foto = prof.fotoUrl ?? FOTOS_LOCAIS[prof.nome];

          return (
            <Grid key={prof.id} size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar
                      src={foto}
                      alt={`Foto de ${prof.nome}`}
                      sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                    >
                      {prof.nome.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{prof.nome}</Typography>
                      <Typography variant="body2">{prof.disciplina}</Typography>
                    </Box>
                    <Chip label={prof.matricula} size="small" variant="outlined" />
                  </Stack>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progresso no semestre
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {progresso}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progresso}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {prof.aulasTotaisSemestre}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Efetivadas
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="success.main">
                        {prof.aulasEfetivadas}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Restantes
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                        {prof.aulasRestantes}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Faltas
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="error.main">
                        {prof.faltas}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Tooltip title="Registrar aula efetivada (+1)">
                      <span>
                        <IconButton
                          color="success"
                          aria-label={`Registrar aula efetivada para ${prof.nome}`}
                          disabled={registrarMutation.isPending}
                          onClick={() => handleRegistrar(prof.id, 1)}
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Registrar falta (+1)">
                      <span>
                        <IconButton
                          color="error"
                          aria-label={`Registrar falta para ${prof.nome}`}
                          disabled={registrarMutation.isPending}
                          onClick={() => handleRegistrar(prof.id, 2)}
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export const ProfCoord: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Professores"
        subtitle="Acompanhe a carga horaria e registre aulas efetivadas ou faltas."
        backTo="/coordambiente"
      />
      <SuspenseLoader>
        <ProfessoresListContent />
      </SuspenseLoader>
    </Box>
  );
};

export default ProfCoord;
