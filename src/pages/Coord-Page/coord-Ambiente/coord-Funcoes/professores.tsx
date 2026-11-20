import React, { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddTaskIcon from '@mui/icons-material/AddTask';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';

import AppHeader from 'components/AppHeader';
import SuspenseLoader from 'components/SuspenseLoader';
import { useMuiSnackbar } from 'components/SnackbarProvider';
import { professoresApi } from 'features/professores/api/professoresApi';
import type { Professor, TipoRegistroAula } from 'types/sigei';

interface ConfirmacaoRegistro {
  professor: Professor;
  tipo: TipoRegistroAula;
}

interface FormProfessorState {
  nome: string;
  matricula: string;
  cpf: string;
  areaAtuacao: string;
  email: string;
  senha: string;
  aulasTotaisSemestre: number;
}

const FORM_INICIAL: FormProfessorState = {
  nome: '',
  matricula: '',
  cpf: '',
  areaAtuacao: '',
  email: '',
  senha: '',
  aulasTotaisSemestre: 50,
};

const ProfessoresListContent: React.FC = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useMuiSnackbar();

  const [buscaNome, setBuscaNome] = useState('');
  const [buscaDisciplina, setBuscaDisciplina] = useState('');
  const [confirmacao, setConfirmacao] = useState<ConfirmacaoRegistro | null>(null);
  const [observacao, setObservacao] = useState('');

  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [profEmEdicao, setProfEmEdicao] = useState<Professor | null>(null);
  const [formState, setFormState] = useState<FormProfessorState>(FORM_INICIAL);
  const [profParaExcluir, setProfParaExcluir] = useState<Professor | null>(null);

  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [loteTipo, setLoteTipo] = useState<TipoRegistroAula | null>(null);
  const [loteQuantidade, setLoteQuantidade] = useState<number>(1);

  const { data: professores } = useSuspenseQuery({
    queryKey: ['professores', '', ''],
    queryFn: () => professoresApi.listar(),
  });

  const invalidarProfessores = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['professores'] });
  }, [queryClient]);

  const registrarMutation = useMutation({
    mutationFn: ({ id, tipo }: { id: string; tipo: TipoRegistroAula }) =>
      professoresApi.registrarAula(id, tipo, 1),
    onSuccess: (profAtualizado) => {
      invalidarProfessores();
      showSnackbar(`Registro atualizado para ${profAtualizado.nome}.`, 'success');
      setConfirmacao(null);
      setObservacao('');
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao registrar aula.', 'error');
    },
  });

  const registrarLoteMutation = useMutation({
    mutationFn: ({ ids, tipo, quantidade }: { ids: string[]; tipo: TipoRegistroAula; quantidade: number }) =>
      professoresApi.registrarAulasEmLote(ids, tipo, quantidade),
    onSuccess: (atualizados) => {
      invalidarProfessores();
      showSnackbar(
        `Registro em lote concluído para ${atualizados.length} professor(es).`,
        'success'
      );
      setLoteTipo(null);
      setLoteQuantidade(1);
      setSelecionados([]);
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao registrar em lote.', 'error');
    },
  });

  const criarMutation = useMutation({
    mutationFn: professoresApi.criar,
    onSuccess: (novo) => {
      invalidarProfessores();
      showSnackbar(`Professor ${novo.nome} criado com sucesso!`, 'success');
      setModalFormAberto(false);
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao criar professor.', 'error');
    },
  });

  const atualizarMutation = useMutation({
    mutationFn: professoresApi.atualizar,
    onSuccess: (atualizado) => {
      invalidarProfessores();
      showSnackbar(`Professor ${atualizado.nome} atualizado com sucesso!`, 'success');
      setModalFormAberto(false);
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao atualizar professor.', 'error');
    },
  });

  const excluirMutation = useMutation({
    mutationFn: professoresApi.excluir,
    onSuccess: () => {
      invalidarProfessores();
      showSnackbar('Professor excluído com sucesso.', 'success');
      setProfParaExcluir(null);
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao excluir professor.', 'error');
    },
  });

  const abrirNovoProfessor = useCallback(() => {
    setProfEmEdicao(null);
    setFormState(FORM_INICIAL);
    setModalFormAberto(true);
  }, []);

  const abrirEditarProfessor = useCallback((prof: Professor) => {
    setProfEmEdicao(prof);
    setFormState({
      nome: prof.nome,
      matricula: prof.matricula,
      cpf: '',
      areaAtuacao: prof.disciplina,
      email: prof.email,
      senha: '',
      aulasTotaisSemestre: prof.aulasTotaisSemestre,
    });
    setModalFormAberto(true);
  }, []);

  const salvarProfessor = useCallback(() => {
    if (profEmEdicao) {
      atualizarMutation.mutate({
        id: profEmEdicao.id,
        nome: formState.nome,
        matricula: formState.matricula,
        cpf: formState.cpf || '000.000.000-00',
        areaAtuacao: formState.areaAtuacao,
        email: formState.email,
        aulasTotaisSemestre: Number(formState.aulasTotaisSemestre),
      });
    } else {
      criarMutation.mutate({
        nome: formState.nome,
        matricula: formState.matricula,
        cpf: formState.cpf,
        areaAtuacao: formState.areaAtuacao,
        email: formState.email,
        senha: formState.senha,
        aulasTotaisSemestre: Number(formState.aulasTotaisSemestre),
      });
    }
  }, [profEmEdicao, formState, atualizarMutation, criarMutation]);

  const confirmarRegistro = useCallback(() => {
    if (!confirmacao) return;
    registrarMutation.mutate({
      id: confirmacao.professor.id,
      tipo: confirmacao.tipo,
    });
  }, [confirmacao, registrarMutation]);

  const filtrados = useMemo(() => {
    const n = buscaNome.trim().toLowerCase();
    const d = buscaDisciplina.trim().toLowerCase();
    return professores.filter((p) => {
      const matchNome = !n || p.nome.toLowerCase().includes(n);
      const matchDisc = !d || p.disciplina.toLowerCase().includes(d);
      return matchNome && matchDisc;
    });
  }, [professores, buscaNome, buscaDisciplina]);

  const alternarSelecao = useCallback((id: string) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const todosSelecionados =
    filtrados.length > 0 && filtrados.every((p) => selecionados.includes(p.id));

  const alternarTodos = useCallback(() => {
    if (todosSelecionados) {
      setSelecionados([]);
    } else {
      setSelecionados(filtrados.map((p) => p.id));
    }
  }, [todosSelecionados, filtrados]);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              id="filtro-prof-nome"
              label="Filtrar por nome"
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                },
              }}
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              id="filtro-prof-disciplina"
              label="Filtrar por disciplina"
              slotProps={{ inputLabel: { shrink: true } }}
              value={buscaDisciplina}
              onChange={(e) => setBuscaDisciplina(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button variant="outlined" onClick={alternarTodos} fullWidth>
              {todosSelecionados ? 'Limpar seleção' : 'Selecionar todos'}
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={abrirNovoProfessor}
              fullWidth
            >
              Novo Professor
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {selecionados.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: '#FFFFFF',
            borderColor: 'primary.main',
            borderWidth: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
          >
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              {selecionados.length}{' '}
              {selecionados.length === 1 ? 'professor selecionado' : 'professores selecionados'}
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddTaskIcon />}
                onClick={() => setLoteTipo(1)}
              >
                Registrar Presença (+ Aula)
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<EventBusyIcon />}
                onClick={() => setLoteTipo(2)}
              >
                Registrar Falta (+ Falta)
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      <Grid container spacing={2.5}>
        {filtrados.map((prof: Professor) => {
          const progresso =
            prof.aulasTotaisSemestre > 0
              ? Math.round((prof.aulasEfetivadas / prof.aulasTotaisSemestre) * 100)
              : 0;

          const estaSelecionado = selecionados.includes(prof.id);

          return (
            <Grid key={prof.id} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: '100%',
                  borderColor: estaSelecionado ? 'primary.main' : 'divider',
                  borderWidth: estaSelecionado ? 2 : 1,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Checkbox
                      checked={estaSelecionado}
                      onChange={() => alternarSelecao(prof.id)}
                      inputProps={{ 'aria-label': `Selecionar ${prof.nome}` }}
                      color="primary"
                    />
                    <Avatar
                      aria-label={`Iniciais de ${prof.nome}`}
                      sx={{ width: 52, height: 52, bgcolor: 'primary.main', fontWeight: 700 }}
                    >
                      {prof.nome.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{prof.nome}</Typography>
                      <Typography variant="body2">{prof.disciplina}</Typography>
                    </Box>
                    <Chip label={prof.matricula} size="small" variant="outlined" />
                    <Tooltip title="Editar professor">
                      <IconButton
                        aria-label={`Editar ${prof.nome}`}
                        onClick={() => abrirEditarProfessor(prof)}
                        size="small"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir professor">
                      <IconButton
                        aria-label={`Excluir ${prof.nome}`}
                        color="error"
                        onClick={() => setProfParaExcluir(prof)}
                        size="small"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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

                  <Grid container spacing={1} sx={{ mb: 1 }}>
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
                      <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                        {prof.aulasEfetivadas}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Restantes
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {prof.aulasRestantes}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="caption" color="text.secondary">
                        Faltas
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="secondary.dark">
                        {prof.faltas}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 2 }}>
                    <Tooltip title="Carga Total = Efetivadas + Restantes + Faltas. As faltas abatem do saldo restante e exigem reposição.">
                      <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      Carga Total = Efetivadas + Restantes + Faltas (faltas exigem reposição)
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<AddTaskIcon />}
                      disabled={registrarMutation.isPending}
                      onClick={() => setConfirmacao({ professor: prof, tipo: 1 })}
                    >
                      + Aula
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<EventBusyIcon />}
                      disabled={registrarMutation.isPending}
                      onClick={() => setConfirmacao({ professor: prof, tipo: 2 })}
                    >
                      + Falta
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Modal Criar / Editar Professor */}
      <Dialog open={modalFormAberto} onClose={() => setModalFormAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>{profEmEdicao ? 'Editar Professor' : 'Novo Professor'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              id="form-prof-nome"
              label="Nome completo"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formState.nome}
              onChange={(e) => setFormState((s) => ({ ...s, nome: e.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="form-prof-matricula"
                  label="Matrícula"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formState.matricula}
                  onChange={(e) => setFormState((s) => ({ ...s, matricula: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  id="form-prof-cpf"
                  label="CPF"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formState.cpf}
                  onChange={(e) => setFormState((s) => ({ ...s, cpf: e.target.value }))}
                />
              </Grid>
            </Grid>
            <TextField
              id="form-prof-area"
              label="Disciplina / Área de Atuação"
              slotProps={{ inputLabel: { shrink: true } }}
              value={formState.areaAtuacao}
              onChange={(e) => setFormState((s) => ({ ...s, areaAtuacao: e.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  id="form-prof-email"
                  label="E-mail"
                  type="email"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formState.email}
                  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  id="form-prof-aulas"
                  label="Carga Semestral"
                  type="number"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formState.aulasTotaisSemestre}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, aulasTotaisSemestre: Number(e.target.value) }))
                  }
                />
              </Grid>
            </Grid>
            {!profEmEdicao && (
              <TextField
                id="form-prof-senha"
                label="Senha inicial (mínimo 6 caracteres)"
                type="password"
                slotProps={{ inputLabel: { shrink: true } }}
                value={formState.senha}
                onChange={(e) => setFormState((s) => ({ ...s, senha: e.target.value }))}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setModalFormAberto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvarProfessor}
            disabled={criarMutation.isPending || atualizarMutation.isPending}
          >
            {criarMutation.isPending || atualizarMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Confirmar Exclusao */}
      <Dialog open={Boolean(profParaExcluir)} onClose={() => setProfParaExcluir(null)} fullWidth maxWidth="xs">
        <DialogTitle>Excluir Professor</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Deseja realmente excluir o docente <strong>{profParaExcluir?.nome}</strong>? Os horários
            vinculados a ele ficarão sem professor atribuído.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setProfParaExcluir(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color="error"
            disabled={excluirMutation.isPending}
            onClick={() => profParaExcluir && excluirMutation.mutate(profParaExcluir.id)}
          >
            {excluirMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Confirmar + Aula / + Falta */}
      <Dialog open={Boolean(confirmacao)} onClose={() => setConfirmacao(null)} fullWidth maxWidth="xs">
        <DialogTitle>
          {confirmacao?.tipo === 1 ? 'Confirmar Aula Efetivada' : 'Confirmar Registro de Falta'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {confirmacao && (
              <Typography variant="body2">
                Docente: <strong>{confirmacao.professor.nome}</strong> ({confirmacao.professor.disciplina})
              </Typography>
            )}
            <TextField
              id="registro-observacao"
              label="Observação / Data (opcional)"
              placeholder="Ex.: Reposição ou atestado em 20/11"
              slotProps={{ inputLabel: { shrink: true } }}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmacao(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color={confirmacao?.tipo === 1 ? 'primary' : 'secondary'}
            disabled={registrarMutation.isPending}
            onClick={confirmarRegistro}
          >
            {registrarMutation.isPending ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Confirmar Registro em Lote */}
      <Dialog open={loteTipo !== null} onClose={() => setLoteTipo(null)} fullWidth maxWidth="xs">
        <DialogTitle>
          {loteTipo === 1 ? 'Registrar Presença em Lote' : 'Registrar Falta em Lote'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              Aplicar para <strong>{selecionados.length}</strong> professor(es) selecionado(s).
            </Typography>
            <TextField
              id="lote-quantidade"
              label="Quantidade de aulas por professor"
              type="number"
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 1 } }}
              value={loteQuantidade}
              onChange={(e) => setLoteQuantidade(Math.max(1, Number(e.target.value)))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setLoteTipo(null)}>Cancelar</Button>
          <Button
            variant="contained"
            color={loteTipo === 1 ? 'primary' : 'secondary'}
            disabled={registrarLoteMutation.isPending}
            onClick={() =>
              loteTipo !== null &&
              registrarLoteMutation.mutate({
                ids: selecionados,
                tipo: loteTipo,
                quantidade: loteQuantidade,
              })
            }
          >
            {registrarLoteMutation.isPending ? 'Aplicando...' : 'Confirmar em Lote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export const ProfCoord: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Gestão de Professores"
        subtitle="Cadastre docentes, acompanhe a carga horária e registre aulas efetivadas ou faltas."
        backTo="/coordambiente"
      />
      <SuspenseLoader>
        <ProfessoresListContent />
      </SuspenseLoader>
    </Box>
  );
};

export default ProfCoord;
