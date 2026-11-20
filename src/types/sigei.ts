export type PerfilUsuario = 'Diretor' | 'Coordenador' | 'Professor';

export type DiaSemana = 1 | 2 | 3 | 4 | 5;

export const DIA_SEMANA_LABEL: Record<DiaSemana, string> = {
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
};

export interface LoginResponse {
  usuarioId: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  escolaId: string;
}

export interface Escola {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  codigoVerificacao: string;
}

export interface UsuarioCriado {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  area: string;
  perfil: PerfilUsuario;
  escolaId: string;
}

export interface Professor {
  id: string;
  nome: string;
  disciplina: string;
  email: string;
  matricula: string;
  fotoUrl?: string | null;
  aulasTotaisSemestre: number;
  aulasEfetivadas: number;
  aulasRestantes: number;
  faltas: number;
}

export interface TurmaResumo {
  id: string;
  codigo: string;
  nome: string;
  curso: string;
  turno: string;
}

export interface HorarioSlot {
  id: string;
  diaSemana: DiaSemana;
  faixaHorario: string;
  ordem: number;
  disciplina: string;
  professorId?: string | null;
  nomeProfessor: string;
  ehIntervalo: boolean;
}

export interface TurmaGrade extends TurmaResumo {
  horarios: HorarioSlot[];
}

export type TipoRegistroAula = 1 | 2; // 1 = Efetivada, 2 = Falta
