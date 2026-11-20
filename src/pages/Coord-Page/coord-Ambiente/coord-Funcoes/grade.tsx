import React, { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Box, Container, MenuItem, TextField } from '@mui/material';

import AppHeader from 'components/AppHeader';
import SuspenseLoader from 'components/SuspenseLoader';
import { turmasApi } from 'features/turmas/api/turmasApi';
import { GradeTabelaContent } from './turma-grade-detalhe';

const GradeSelectorContent: React.FC = () => {
  const { data: turmas } = useSuspenseQuery({
    queryKey: ['turmas'],
    queryFn: turmasApi.listar,
  });

  const [codigoSelecionado, setCodigoSelecionado] = useState<string>(
    turmas[0]?.codigo ?? '1BInfo'
  );

  return (
    <>
      <Container maxWidth="lg" sx={{ mb: 3 }}>
        <TextField
          id="selecionar-turma-grade"
          select
          label="Selecione a turma para gerenciar a grade"
          value={codigoSelecionado}
          onChange={(e) => setCodigoSelecionado(e.target.value)}
          sx={{ maxWidth: 360, bgcolor: '#FFFFFF' }}
        >
          {turmas.map((t) => (
            <MenuItem key={t.id} value={t.codigo}>
              {t.nome} ({t.curso})
            </MenuItem>
          ))}
        </TextField>
      </Container>

      <GradeTabelaContent codigo={codigoSelecionado} />
    </>
  );
};

export const GradeCoord: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <AppHeader
        title="Grade de Aulas"
        subtitle="Alterne entre as turmas e ajuste horários com detecção automática de conflitos."
        backTo="/coordambiente"
      />
      <SuspenseLoader>
        <GradeSelectorContent />
      </SuspenseLoader>
    </Box>
  );
};

export default GradeCoord;
