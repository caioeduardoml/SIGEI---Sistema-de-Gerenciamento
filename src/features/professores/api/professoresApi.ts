import { apiClient } from 'lib/apiClient';
import type { Professor, TipoRegistroAula } from 'types/sigei';

export const professoresApi = {
  listar: (nome?: string, disciplina?: string): Promise<Professor[]> => {
    const params = new URLSearchParams();
    if (nome?.trim()) params.set('nome', nome.trim());
    if (disciplina?.trim()) params.set('disciplina', disciplina.trim());
    const qs = params.toString();
    return apiClient.get<Professor[]>(`/professores${qs ? `?${qs}` : ''}`);
  },

  registrarAula: (professorId: string, tipo: TipoRegistroAula, quantidade = 1): Promise<Professor> =>
    apiClient.patch<Professor>(`/professores/${professorId}/aulas`, { tipo, quantidade }),
};
