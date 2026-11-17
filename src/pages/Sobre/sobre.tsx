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
import Gaby from '../../assets/images/prof-gabriella.jpg';
import Caio from '../../assets/images/prof-caio.jpg';
import Biliu from '../../assets/images/prof-biliu.jpg';

const EQUIPE = [
  { nome: 'Gabriella', papel: 'Idealizacao & Matematica', foto: Gaby },
  { nome: 'Caio Gilberto', papel: 'Arquitetura & Fisica', foto: Caio },
  { nome: 'Joao Vitor (Biliu)', papel: 'Produto & Linguagens', foto: Biliu },
];

export const Sobre: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Sobre o SIGEI"
        subtitle="Conheca nossa plataforma de gerenciamento pedagogico e escolar."
        backTo="/"
        showUserActions={false}
      />

      <Container maxWidth="md">
        <Stack spacing={4}>
          <Card>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h5" gutterBottom>
                Nossa Missao
              </Typography>
              <Typography variant="body1" color="text.secondary">
                O SIGEI e um sistema criado para proporcionar melhor desempenho e organizacao das
                atividades pedagogicas no ambiente escolar. Com ele, e possivel montar grades
                semanais sem conflitos, contabilizar aulas efetivadas e faltas de docentes e
                facilitar a comunicacao entre coordenacao e professores.
              </Typography>
            </CardContent>
          </Card>

          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              Equipe
            </Typography>
            <Grid container spacing={2.5}>
              {EQUIPE.map((membro) => (
                <Grid key={membro.nome} size={{ xs: 12, sm: 4 }}>
                  <Card sx={{ textAlign: 'center', height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Avatar
                        src={membro.foto}
                        alt={`Foto de ${membro.nome}`}
                        sx={{ width: 88, height: 88, mx: 'auto', mb: 2 }}
                      />
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
