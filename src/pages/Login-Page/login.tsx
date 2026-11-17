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
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

import AppHeader from 'components/AppHeader';
import { useMuiSnackbar } from 'components/SnackbarProvider';
import { authApi } from 'features/auth/api/authApi';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail valido.'),
  senha: z.string().min(6, 'A senha deve ter no minimo 6 caracteres.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useMuiSnackbar();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      showSnackbar(`Bem-vindo(a), ${data.nome}!`, 'success');
      if (data.perfil === 'Coordenador') {
        navigate('/coordambiente');
      } else {
        navigate('/profturmas');
      }
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Falha ao autenticar.', 'error');
    },
  });

  const onSubmit = useCallback(
    (values: LoginFormValues) => {
      loginMutation.mutate(values);
    },
    [loginMutation]
  );

  const preencherDemo = useCallback(() => {
    setValue('email', 'coord@sigei.com', { shouldValidate: true });
    setValue('senha', 'Sigei@123', { shouldValidate: true });
  }, [setValue]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Acessar o SIGEI"
        subtitle="Entre com suas credenciais de coordenador ou professor."
        backTo="/"
        showUserActions={false}
      />

      <Container maxWidth="sm">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Alert severity="info" sx={{ alignItems: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="body2">Conta demo: coord@sigei.com / Sigei@123</Typography>
                  <Chip
                    label="Preencher demo"
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={preencherDemo}
                    sx={{ cursor: 'pointer' }}
                  />
                </Stack>
              </Alert>

              <TextField
                id="login-email"
                label="E-mail"
                type="email"
                autoComplete="email"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email')}
              />

              <TextField
                id="login-senha"
                label="Senha"
                type="password"
                autoComplete="current-password"
                error={Boolean(errors.senha)}
                helperText={errors.senha?.message}
                {...register('senha')}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loginMutation.isPending}
                startIcon={<LoginIcon />}
                fullWidth
              >
                {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
