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
  FormControl,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

import AppHeader from 'components/AppHeader';
import { useMuiSnackbar } from 'components/SnackbarProvider';
import { authApi } from 'features/auth/api/authApi';

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
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
      if (data.perfil === 'Coordenador' || data.perfil === 'Diretor') {
        navigate('/coordambiente');
      } else {
        navigate('/profturmas');
      }
    },
    onError: (err: Error) => {
      showSnackbar(err.message || 'Não foi possível autenticar.', 'error');
    },
  });

  const onSubmit = useCallback(
    (values: LoginFormValues) => {
      loginMutation.mutate(values);
    },
    [loginMutation]
  );

  const preencherDemo = useCallback(
    (email: string) => {
      setValue('email', email, { shouldValidate: true });
      setValue('senha', 'Sigei@123', { shouldValidate: true });
    },
    [setValue]
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Acessar o SIGEI"
        subtitle="Entre com suas credenciais de diretor, coordenador ou professor."
        backTo="/"
        showUserActions={false}
      />

      <Container maxWidth="sm">
        <Card sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Alert severity="info" sx={{ alignItems: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="body2">Contas demo (senha Sigei@123):</Typography>
                  <Chip
                    label="Coordenador"
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => preencherDemo('coord@sigei.com')}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="Diretor"
                    size="small"
                    color="secondary"
                    variant="outlined"
                    onClick={() => preencherDemo('diretor@sigei.com')}
                    sx={{ cursor: 'pointer' }}
                  />
                </Stack>
              </Alert>

              {/* Labels fixos acima dos inputs evitam sobreposicao com autofill ou preenchimento programatico */}
              <FormControl fullWidth>
                <Typography
                  component="label"
                  htmlFor="login-email"
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'text.primary', mb: 0.75 }}
                >
                  E-mail
                </Typography>
                <TextField
                  id="login-email"
                  type="email"
                  placeholder="seu.email@escola.com.br"
                  autoComplete="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register('email')}
                />
              </FormControl>

              <FormControl fullWidth>
                <Typography
                  component="label"
                  htmlFor="login-senha"
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'text.primary', mb: 0.75 }}
                >
                  Senha
                </Typography>
                <TextField
                  id="login-senha"
                  type="password"
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  error={Boolean(errors.senha)}
                  helperText={errors.senha?.message}
                  {...register('senha')}
                />
              </FormControl>

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
