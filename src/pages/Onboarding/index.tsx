import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';

import AppHeader from 'components/AppHeader';

type PerfilOnboarding = 'escola' | 'coordenador' | 'professor';

const OPCOES_ONBOARDING: {
  id: PerfilOnboarding;
  titulo: string;
  descricao: string;
  rota: string;
  cta: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'escola',
    titulo: 'Cadastrar Instituição',
    descricao:
      'Para diretores ou gestores que desejam registrar uma nova escola e gerar o código de acesso dos servidores.',
    rota: '/cadastroescola',
    cta: 'Cadastrar escola',
    icon: <DomainAddIcon color="primary" sx={{ fontSize: 36 }} />,
  },
  {
    id: 'coordenador',
    titulo: 'Sou Coordenador(a)',
    descricao:
      'Crie sua conta de coordenação usando o código de verificação fornecido pela sua escola.',
    rota: '/cadastrocoord',
    cta: 'Cadastrar coordenador',
    icon: <SupervisorAccountIcon color="primary" sx={{ fontSize: 36 }} />,
  },
  {
    id: 'professor',
    titulo: 'Sou Professor(a)',
    descricao:
      'Crie seu acesso docente usando o código de verificação da instituição para acompanhar suas turmas.',
    rota: '/cadastroprof',
    cta: 'Cadastrar professor',
    icon: <PersonAddIcon color="primary" sx={{ fontSize: 36 }} />,
  },
];

export const Onboarding: React.FC = () => {
  const [selecionado, setSelecionado] = useState<PerfilOnboarding>('escola');
  const opcaoAtiva = OPCOES_ONBOARDING.find((o) => o.id === selecionado) ?? OPCOES_ONBOARDING[0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Começar no SIGEI"
        subtitle="Selecione seu perfil para iniciar o cadastro na plataforma."
        backTo="/"
        showUserActions={false}
      />

      <Container maxWidth="md">
        <Stack spacing={3}>
          <Grid container spacing={2.5}>
            {OPCOES_ONBOARDING.map((opcao) => {
              const ativo = opcao.id === selecionado;
              return (
                <Grid key={opcao.id} size={{ xs: 12, md: 4 }}>
                  <Card
                    sx={{
                      height: '100%',
                      borderColor: ativo ? 'primary.main' : 'divider',
                      borderWidth: ativo ? 2 : 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <CardActionArea
                      onClick={() => setSelecionado(opcao.id)}
                      sx={{ height: '100%', p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                    >
                      <Box sx={{ mb: 1.5 }}>{opcao.icon}</Box>
                      <CardContent sx={{ p: 0 }}>
                        <Typography variant="h6" gutterBottom>
                          {opcao.titulo}
                        </Typography>
                        <Typography variant="body2">{opcao.descricao}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={2}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {opcaoAtiva.titulo}
                  </Typography>
                  <Typography variant="body2">
                    Já possui uma conta ativa?{' '}
                    <RouterLink to="/entrar" style={{ color: '#287F78', fontWeight: 700 }}>
                      Fazer login
                    </RouterLink>
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to="/entrar"
                    variant="outlined"
                    startIcon={<LoginIcon />}
                  >
                    Já tenho conta
                  </Button>
                  <Button
                    component={RouterLink}
                    to={opcaoAtiva.rota}
                    variant="contained"
                    color="primary"
                  >
                    {opcaoAtiva.cta}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default Onboarding;
