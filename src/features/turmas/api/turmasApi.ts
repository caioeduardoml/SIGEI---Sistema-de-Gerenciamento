import { apiClient } from 'lib/apiClient';
import type { HorarioSlot, TurmaGrade, TurmaResumo } from 'types/sigei';

export interface CriarTurmaPayload {
  codigo: string;
  nome: string;
  curso: string;
  turno: string;
}

export interface AtualizarTurmaPayload {
  id: string;
  nome: string;
  curso: string;
  turno: string;
}

export interface AtualizarHorarioPayload {
  horarioId: string;
  disciplina: string;
  professorId?: string | null;
  nomeProfessorCustomizado?: string | null;
}

export const turmasApi = {
  listar: (): Promise<TurmaResumo[]> => apiClient.get<TurmaResumo[]>('/turmas'),

  obterComGrade: (codigoOuId: string): Promise<TurmaGrade> =>
    apiClient.get<TurmaGrade>(`/turmas/${encodeURIComponent(codigoOuId)}`),

  criar: (payload: CriarTurmaPayload): Promise<TurmaResumo> =>
    apiClient.post<TurmaResumo>('/turmas', payload),

  atualizar: ({ id, ...body }: AtualizarTurmaPayload): Promise<TurmaResumo> =>
    apiClient.put<TurmaResumo>(`/turmas/${id}`, body),

  excluir: (id: string): Promise<void> => apiClient.delete(`/turmas/${id}`),

  atualizarHorario: ({ horarioId, ...body }: AtualizarHorarioPayload): Promise<HorarioSlot> =>
    apiClient.put<HorarioSlot>(`/turmas/horarios/${horarioId}`, body),
};
