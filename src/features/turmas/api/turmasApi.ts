import { apiClient } from 'lib/apiClient';
import type { HorarioSlot, TurmaGrade, TurmaResumo } from 'types/sigei';

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

  atualizarHorario: ({ horarioId, ...body }: AtualizarHorarioPayload): Promise<HorarioSlot> =>
    apiClient.put<HorarioSlot>(`/turmas/horarios/${horarioId}`, body),
};
