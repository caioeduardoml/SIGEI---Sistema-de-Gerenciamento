import { apiClient } from 'lib/apiClient';
import type { Professor, TipoRegistroAula } from 'types/sigei';

export interface CriarProfessorPayload {
  nome: string;
  matricula: string;
  cpf: string;
  areaAtuacao: string;
  email: string;
  senha: string;
  aulasTotaisSemestre: number;
}

export interface AtualizarProfessorPayload {
  id: string;
  nome: string;
  matricula: string;
  cpf: string;
  areaAtuacao: string;
  email: string;
  aulasTotaisSemestre: number;
}

export const professoresApi = {
  listar: (nome?: string, disciplina?: string): Promise<Professor[]> => {
    const params = new URLSearchParams();
    if (nome?.trim()) params.set('nome', nome.trim());
    if (disciplina?.trim()) params.set('disciplina', disciplina.trim());
    const qs = params.toString();
    return apiClient.get<Professor[]>(`/professores${qs ? `?${qs}` : ''}`);
  },

  criar: (payload: CriarProfessorPayload): Promise<Professor> =>
    apiClient.post<Professor>('/professores/gerenciar', payload),

  atualizar: ({ id, ...body }: AtualizarProfessorPayload): Promise<Professor> =>
    apiClient.put<Professor>(`/professores/${id}`, body),

  excluir: (id: string): Promise<void> => apiClient.delete(`/professores/${id}`),

  registrarAula: (professorId: string, tipo: TipoRegistroAula, quantidade = 1): Promise<Professor> =>
    apiClient.patch<Professor>(`/professores/${professorId}/aulas`, { tipo, quantidade }),

  registrarAulasEmLote: (
    professorIds: string[],
    tipo: TipoRegistroAula,
    quantidade = 1
  ): Promise<Professor[]> =>
    apiClient.post<Professor[]>('/professores/aulas-lote', { professorIds, tipo, quantidade }),
};
