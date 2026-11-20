import React, { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import AppHeader from 'components/AppHeader';
import SuspenseLoader from 'components/SuspenseLoader';
import { useMuiSnackbar } from 'components/SnackbarProvider';
import { turmasApi } from 'features/turmas/api/turmasApi';
import type { TurmaResumo } from 'types/sigei';

interface FormTurmaState {
  codigo: string;
  nome: string;
  curso: string;
  turno: string;
}

const FORM_INICIAL: FormTurmaState = {
  codigo: '',
  nome: '',
  curso: 'Informática',
  turno: 'Integral',
};

const TurmasListContent: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useMuiSnackbar();

  const [cursoFiltro, setCursoFiltro] = useState<string>('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [turmaEmEdicao, setTurmaEmEdicao] = useState<TurmaResumo | null>(null);
  const [formState, setFormState] = useState<FormTurmaState>(FORM_INICIAL);
  const [turmaParaExcluir, setTurmaParaExcluir] = useState<TurmaResumo | null>(null);

  const { data: turmas } = useSuspenseQuery({
    queryKey: ['turmas'],
    queryFn: turmasApi.listar,
  });

  const invalidarTurmas = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['turmas'] });
  }, [queryClient]);

  const criarMutation = useMutation({
    mutationFn: turmasApi.criar,
    onSuccess: (nova) => {
      invalidarTurmas();
      showSnackbar(`Turma ${nova.nome} criada com sucesso!`, 'success');
      setModalAberto(false);
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao criar turma.', 'error');
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: turmasApi.atualizar,
    onSuccess: (atualizada) => {
      invalidarTurmas();
      showSnackbar(`Turma ${atualizada.nome} atualizada com sucesso!`, 'success');
      setModalAberto(false);
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao atualizar turma.', 'error');
    },
  });

  const excluirMutation = useMutation({
    mutationFn: turmasApi.excluir,
    onSuccess: () => {
      invalidarTurmas();
      showSnackbar('Turma excluída com sucesso.', 'success');
      setTurmaParaExcluir(null);
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao excluir turma.', 'error');
    },
  });

  const abrirNovaTurma = useCallback(() => {
    setTurmaEmEdicao(null);
    setFormState(FORM_INICIAL);
    setModalAberto(true);
  }, []);

  const abrirEditarTurma = useCallback((turma: TurmaResumo) => {
    setTurmaEmEdicao(turma);
    setFormState({
      codigo: turma.codigo,
      nome: turma.nome,
      curso: turma.curso,
      turno: turma.turno,
    });
    setModalAberto(true);
  }, []);

  const salvarTurma = useCallback(() => {
    if (turmaEmEdicao) {
      atualizarMutation.mutate({
        id: turmaEmEdicao.id,
        nome: formState.nome,
        curso: formState.curso,
        turno: formState.turno,
      });
    } else {
      criarMutation.mutate(formState);
    }
  }, [turmaEmEdicao, formState, atualizarMutation, criarMutation]);

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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={abrirNovaTurma}
        >
          Nova Turma
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        {turmasFiltradas.map((turma) => (
          <Grid key={turma.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 200ms ease',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <CardActionArea
                component={RouterLink}
                to={`/turmas/${turma.codigo}`}
                sx={{ flex: 1, p: 2.5, alignItems: 'flex-start' }}
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
                    Código: {turma.codigo} • Turno: {turma.turno}
                  </Typography>
                </CardContent>
              </CardActionArea>

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={0.5}
                sx={{ px: 1.5, pb: 1, borderTop: '1px solid #E0DDD8' }}
              >
                <Tooltip title="Editar turma">
                  <IconButton
                    size="small"
                    aria-label={`Editar ${turma.nome}`}
                    onClick={() => abrirEditarTurma(turma)}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir turma">
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Excluir ${turma.nome}`}
                    onClick={() => setTurmaParaExcluir(turma)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal Criar / Editar Turma */}
      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} fullWidth maxWidth="xs">
        <DialogTitle>{turmaEmEdicao ? 'Editar Turma' : 'Nova Turma'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {!turmaEmEdicao && (
              <TextField
                id="form-turma-codigo"
                label="Código (ex.: 1AInfo)"
                slotProps={{ inputLabel: { shrink: true } }}
                value={formState.codigo}
                onChange={(e) => setFormState((s) => ({ ...s, codigo: e.target.value }))}
              />
            )}
            <TextField
              id="form-turma-nome"
              label="Nome (ex.: 1º Ano A Info)"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formState.nome}
              onChange={(e) => setFormState((s) => ({ ...s, nome: e.target.value }))}
            />
            <TextField
              id="form-turma-curso"
              label="Curso"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formState.curso}
              onChange={(e) => setFormState((s) => ({ ...s, curso: e.target.value }))}
            />
            <TextField
              id="form-turma-turno"
              label="Turno"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formState.turno}
              onChange={(e) => setFormState((s) => ({ ...s, turno: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModalAberto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvarTurma}
            disabled={criarMutation.isPending || atualizarMutation.isPending}
          >
            {criarMutation.isPending || atualizarMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Confirmar Exclusao */}
      <Dialog open={Boolean(turmaParaExcluir)} onClose={() => setTurmaParaExcluir(null)} fullWidth maxWidth="xs">
        <DialogTitle>Excluir Turma</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Deseja realmente excluir a turma <strong>{turmaParaExcluir?.nome}</strong>? Toda a grade
            de horários vinculada será removida.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTurmaParaExcluir(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            disabled={excluirMutation.isPending}
            onClick={() => turmaParaExcluir && excluirMutation.mutate(turmaParaExcluir.id)}
          >
            {excluirMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export const CoordTurmas: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Turmas"
        subtitle="Gerencie as turmas e selecione uma delas para visualizar ou editar sua grade semanal."
        backTo="/coordambiente"
      />
      <SuspenseLoader>
        <TurmasListContent />
      </SuspenseLoader>
    </Box>
  );
};

export default CoordTurmas;
