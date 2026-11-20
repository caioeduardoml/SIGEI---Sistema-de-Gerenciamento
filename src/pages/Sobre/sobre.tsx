import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';

import AppHeader from 'components/AppHeader';

const EQUIPE = [
  { nome: 'Gabriella', papel: 'Idealização & Matemática', inicial: 'G' },
  { nome: 'Caio Gilberto', papel: 'Arquitetura & Física', inicial: 'C' },
  { nome: 'João Vitor (Biliu)', papel: 'Produto & Linguagens', inicial: 'J' },
];

export const Sobre: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Sobre o SIGEI"
        subtitle="Conheça nossa plataforma de gerenciamento pedagógico e escolar."
        backTo="/"
        showUserActions={false}
      />

      <Container maxWidth="md">
        <Stack spacing={4}>
          <Card>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" gutterBottom>
                Nossa Missão
              </Typography>
              <Typography variant="body1" color="text.secondary">
                O SIGEI é um sistema criado para proporcionar melhor desempenho e organização das
                atividades pedagógicas no ambiente escolar. Com ele, é possível montar grades
                semanais sem conflitos, contabilizar aulas efetivadas e faltas de docentes e
                facilitar a comunicação entre coordenação e professores.
              </Typography>
            </CardContent>
          </Card>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Equipe
            </Typography>
            <Grid container spacing={2.5}>
              {EQUIPE.map((membro, idx) => (
                <Grid key={membro.nome} size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ textAlign: 'center', height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: -4,
                            bgcolor: idx % 2 === 0 ? 'primary.main' : 'secondary.main',
                            borderRadius: '44% 56% 52% 48% / 48% 42% 58% 52%',
                          }}
                        />
                        <Avatar
                          aria-label={`Avatar de ${membro.nome}`}
                          sx={{
                            position: 'relative',
                            width: 88,
                            height: 88,
                            bgcolor: idx % 2 === 0 ? 'primary.main' : 'secondary.main',
                            color: '#FFFFFF',
                            fontFamily: "'Dosis', sans-serif",
                            fontSize: '2rem',
                            fontWeight: 800,
                            border: '3px solid #F9F6F3',
                            borderRadius: '44% 56% 52% 48% / 48% 42% 58% 52%',
                          }}
                        >
                          {membro.inicial}
                        </Avatar>
                      </Box>
                      <Typography variant="h6">{membro.nome}</Typography>
                      <Typography variant="body2">{membro.papel}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Card>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" gutterBottom>
                Suporte
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <EmailOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="body2">suporte@sigei.com</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PhoneOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="body2">(11) 3740-2510</Typography>
                </Stack>
                <Typography variant="body2">Instagram: @SIGEI • Facebook: SIGEI</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default Sobre;
