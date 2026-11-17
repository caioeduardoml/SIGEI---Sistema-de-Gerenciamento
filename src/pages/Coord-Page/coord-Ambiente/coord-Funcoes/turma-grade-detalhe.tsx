import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import AppHeader from 'components/AppHeader';
import SuspenseLoader from 'components/SuspenseLoader';
import { useMuiSnackbar } from 'components/SnackbarProvider';
import { turmasApi } from 'features/turmas/api/turmasApi';
import { professoresApi } from 'features/professores/api/professoresApi';
import { DIA_SEMANA_LABEL, type DiaSemana, type HorarioSlot } from 'types/sigei';

const DIAS: DiaSemana[] = [1, 2, 3, 4, 5];

const DISCIPLINA_COR: Record<string, string> = {
  Portugues: '#EDE9FE',
  Matematica: '#DBEAFE',
  Fisica: '#FEF3C7',
  Quimica: '#D1FAE5',
  Geografia: '#FCE7F3',
  Historia: '#FFEDD5',
  Ingles: '#E0E7FF',
};

interface GradeTabelaProps {
  codigo: string;
}

export const GradeTabelaContent: React.FC<GradeTabelaProps> = ({ codigo }) => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useMuiSnackbar();

  const { data: turma } = useSuspenseQuery({
    queryKey: ['turma-grade', codigo],
    queryFn: () => turmasApi.obterComGrade(codigo),
  });

  const { data: professores } = useSuspenseQuery({
    queryKey: ['professores', '', ''],
    queryFn: () => professoresApi.listar(),
  });

  const [slotEmEdicao, setSlotEmEdicao] = useState<HorarioSlot | null>(null);
  const [disciplina, setDisciplina] = useState('');
  const [professorId, setProfessorId] = useState('');

  const abrirEdicao = useCallback((slot: HorarioSlot) => {
    if (slot.ehIntervalo) return;
    setSlotEmEdicao(slot);
    setDisciplina(slot.disciplina);
    setProfessorId(slot.professorId ?? '');
  }, []);

  const fecharEdicao = useCallback(() => {
    setSlotEmEdicao(null);
  }, []);

  const atualizarMutation = useMutation({
    mutationFn: turmasApi.atualizarHorario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turma-grade', codigo] });
      showSnackbar('Horario atualizado com sucesso!', 'success');
      fecharEdicao();
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Nao foi possivel atualizar o horario.', 'error');
    },
  });

  const salvarEdicao = useCallback(() => {
    if (!slotEmEdicao) return;
    atualizarMutation.mutate({
      horarioId: slotEmEdicao.id,
      disciplina,
      professorId: professorId || null,
    });
  }, [slotEmEdicao, disciplina, professorId, atualizarMutation]);

  // Agrupa slots por ordem/faixa de horario para montar as linhas da tabela
  const linhas = useMemo(() => {
    const mapa = new Map<number, { faixa: string; ehIntervalo: boolean; porDia: Partial<Record<DiaSemana, HorarioSlot>> }>();
    for (const slot of turma.horarios) {
      const atual = mapa.get(slot.ordem) ?? {
        faixa: slot.faixaHorario,
        ehIntervalo: slot.ehIntervalo,
        porDia: {},
      };
      atual.porDia[slot.diaSemana] = slot;
      mapa.set(slot.ordem, atual);
    }
    return Array.from(mapa.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, val]) => val);
  }, [turma.horarios]);

  return (
    <Container maxWidth="lg">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h5">{turma.nome}</Typography>
          <Typography variant="body2">
            Curso: {turma.curso} • Turno: {turma.turno} • Clique em uma aula para editar
          </Typography>
        </Box>
        <Chip label={`Codigo: ${turma.codigo}`} color="primary" variant="outlined" />
      </Stack>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table aria-label={`Grade de horarios da turma ${turma.nome}`} sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#4C1D95' }}>
              <TableCell sx={{ color: '#FFFFFF', fontWeight: 700, width: 130 }}>Hora</TableCell>
              {DIAS.map((dia) => (
                <TableCell key={dia} sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                  {DIA_SEMANA_LABEL[dia]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {linhas.map((linha) => (
              <TableRow key={linha.faixa}>
                <TableCell sx={{ fontWeight: 700, bgcolor: linha.ehIntervalo ? '#F1F5F9' : '#FAF5FF' }}>
                  {linha.faixa}
                </TableCell>
                {DIAS.map((dia) => {
                  const slot = linha.porDia[dia];
                  if (!slot) {
                    return <TableCell key={dia}>-</TableCell>;
                  }
                  if (slot.ehIntervalo) {
                    return (
                      <TableCell
                        key={slot.id}
                        sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }}
                      >
                        {slot.disciplina}
                      </TableCell>
                    );
                  }
                  const bg = DISCIPLINA_COR[slot.disciplina] ?? '#F8FAFC';
                  return (
                    <TableCell
                      key={slot.id}
                      onClick={() => abrirEdicao(slot)}
                      sx={{
                        bgcolor: bg,
                        cursor: 'pointer',
                        transition: 'filter 150ms ease',
                        '&:hover': { filter: 'brightness(0.95)' },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="text.primary">
                            {slot.disciplina}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {slot.nomeProfessor}
                          </Typography>
                        </Box>
                        <EditOutlinedIcon sx={{ fontSize: 16, color: '#64748B', mt: 0.3 }} />
                      </Stack>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(slotEmEdicao)} onClose={fecharEdicao} fullWidth maxWidth="xs">
        <DialogTitle>Editar Horario</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {slotEmEdicao && (
              <Typography variant="body2">
                {DIA_SEMANA_LABEL[slotEmEdicao.diaSemana]} • {slotEmEdicao.faixaHorario}
              </Typography>
            )}
            <TextField
              id="slot-disciplina"
              label="Disciplina"
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
            />
            <TextField
              id="slot-professor"
              select
              label="Professor"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
            >
              <MenuItem value="">Sem professor definido</MenuItem>
              {professores.map((prof) => (
                <MenuItem key={prof.id} value={prof.id}>
                  {prof.nome} ({prof.disciplina})
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={fecharEdicao}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvarEdicao}
            disabled={atualizarMutation.isPending || !disciplina.trim()}
          >
            {atualizarMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export const TurmaGradeDetalhe: React.FC = () => {
  const { codigo = '1BInfo' } = useParams<{ codigo: string }>();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title={`Grade da Turma ${codigo}`}
        subtitle="Visualizacao semanal de disciplinas e docentes alocados."
        backTo="/coordturmas"
      />
      <SuspenseLoader>
        <GradeTabelaContent codigo={codigo} />
      </SuspenseLoader>
    </Box>
  );
};

export default TurmaGradeDetalhe;
