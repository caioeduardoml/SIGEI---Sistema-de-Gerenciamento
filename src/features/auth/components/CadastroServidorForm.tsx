import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import AppHeader from 'components/AppHeader';
import { useMuiSnackbar } from 'components/SnackbarProvider';
import { authApi } from 'features/auth/api/authApi';
import type { PerfilUsuario } from 'types/sigei';

const servidorSchema = z
  .object({
    nome: z.string().min(3, 'Informe o nome completo.'),
    matricula: z.string().min(2, 'Informe a matrícula.'),
    cpf: z.string().min(11, 'Informe um CPF válido.'),
    codigoEscola: z.string().min(4, 'Informe o código de verificação da escola (ex.: SIGEI-2026).'),
    area: z.string().min(2, 'Informe a área ou disciplina.'),
    email: z.string().email('Informe um e-mail válido.'),
    senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    confirmarSenha: z.string().min(6, 'Confirme sua senha.'),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  });

type ServidorFormValues = z.infer<typeof servidorSchema>;

interface CadastroServidorFormProps {
  tipo: PerfilUsuario;
}

export const CadastroServidorForm: React.FC<CadastroServidorFormProps> = ({ tipo }) => {
  const navigate = useNavigate();
  const { showSnackbar } = useMuiSnackbar();

  const isCoordenador = tipo === 'Coordenador';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServidorFormValues>({
    resolver: zodResolver(servidorSchema),
    defaultValues: {
      nome: '',
      matricula: '',
      cpf: '',
      codigoEscola: 'SIGEI-2026',
      area: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ServidorFormValues) =>
      isCoordenador
        ? authApi.cadastrarCoordenador(values)
        : authApi.cadastrarProfessor(values),
    onSuccess: (usuario) => {
      showSnackbar(`${tipo} ${usuario.nome} cadastrado com sucesso!`, 'success');
      navigate('/entrar');
    },
    onError: (err: Error) => {
      showSnackbar(err.message || `Erro ao cadastrar ${tipo.toLowerCase()}.`, 'error');
    },
  });

  const onSubmit = useCallback(
    (values: ServidorFormValues) => {
      mutation.mutate(values);
    },
    [mutation]
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title={isCoordenador ? 'Cadastro de Coordenador' : 'Cadastro de Professor'}
        subtitle="Preencha seus dados e informe o código de verificação da escola."
        backTo="/comecar"
        showUserActions={false}
      />

      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Typography variant="h6">Seus Dados</Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="servidor-nome"
                    label="Nome completo"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.nome)}
                    helperText={errors.nome?.message}
                    {...register('nome')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    id="servidor-matricula"
                    label="Matrícula"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.matricula)}
                    helperText={errors.matricula?.message}
                    {...register('matricula')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    id="servidor-cpf"
                    label="CPF"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.cpf)}
                    helperText={errors.cpf?.message}
                    {...register('cpf')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="servidor-codigo-escola"
                    label="Código de verificação da escola"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.codigoEscola)}
                    helperText={errors.codigoEscola?.message ?? 'Código padrão demo: SIGEI-2026'}
                    {...register('codigoEscola')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="servidor-area"
                    label={isCoordenador ? 'Área de Coordenação' : 'Área de Atuação / Disciplina'}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.area)}
                    helperText={errors.area?.message}
                    {...register('area')}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    id="servidor-email"
                    label="E-mail"
                    type="email"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    {...register('email')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="servidor-senha"
                    label="Senha"
                    type="password"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.senha)}
                    helperText={errors.senha?.message}
                    {...register('senha')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="servidor-confirmar-senha"
                    label="Repita a sua senha"
                    type="password"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.confirmarSenha)}
                    helperText={errors.confirmarSenha?.message}
                    {...register('confirmarSenha')}
                  />
                </Grid>
              </Grid>

              <Alert severity="info">
                Verifique o código da escola com a direção ou coordenação antes de concluir.
              </Alert>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  size="large"
                  disabled={mutation.isPending}
                  startIcon={<SaveIcon />}
                >
                  {mutation.isPending ? 'Salvando...' : 'Salvar cadastro'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CadastroServidorForm;
