import React, { useCallback, useState } from 'react';
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
import { escolasApi } from 'features/escolas/api/escolasApi';

const escolaSchema = z.object({
  nome: z.string().min(3, 'Informe o nome da escola.'),
  email: z.string().email('Informe um e-mail válido.'),
  telefone: z.string().min(8, 'Informe um telefone válido.'),
  endereco: z.string().min(5, 'Informe o endereço completo.'),
});

type EscolaFormValues = z.infer<typeof escolaSchema>;

export const CadastroEscola: React.FC = () => {
  const { showSnackbar } = useMuiSnackbar();
  const [codigoGerado, setCodigoGerado] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EscolaFormValues>({
    resolver: zodResolver(escolaSchema),
    defaultValues: { nome: '', email: '', telefone: '', endereco: '' },
  });

  const mutation = useMutation({
    mutationFn: escolasApi.cadastrar,
    onSuccess: (escola) => {
      setCodigoGerado(escola.codigoVerificacao);
      showSnackbar('Escola cadastrada com sucesso!', 'success');
      reset();
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Erro ao cadastrar escola.', 'error');
    },
  });

  const onSubmit = useCallback(
    (values: EscolaFormValues) => {
      mutation.mutate(values);
    },
    [mutation]
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Cadastro de Escola"
        subtitle="Preencha os dados da instituição para gerar o código de acesso dos servidores."
        backTo="/comecar"
        showUserActions={false}
      />

      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              {codigoGerado && (
                <Alert severity="success">
                  Escola registrada! Código de verificação para servidores:{' '}
                  <strong>{codigoGerado}</strong>
                </Alert>
              )}

              <Typography variant="h6">Dados da Instituição</Typography>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    id="escola-nome"
                    label="Nome da escola"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.nome)}
                    helperText={errors.nome?.message}
                    {...register('nome')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="escola-email"
                    label="E-mail institucional"
                    type="email"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    {...register('email')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="escola-telefone"
                    label="Telefone"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.telefone)}
                    helperText={errors.telefone?.message}
                    {...register('telefone')}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    id="escola-endereco"
                    label="Endereço"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.endereco)}
                    helperText={errors.endereco?.message}
                    {...register('endereco')}
                  />
                </Grid>
              </Grid>

              <Alert severity="info">
                Após o cadastro, compartilhe o código gerado com coordenadores e professores da
                escola para que possam criar suas contas.
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

export default CadastroEscola;
