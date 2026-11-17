import { apiClient } from 'lib/apiClient';
import type { LoginResponse, UsuarioCriado } from 'types/sigei';

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface CadastroServidorPayload {
  nome: string;
  matricula: string;
  cpf: string;
  codigoEscola: string;
  area: string;
  email: string;
  senha: string;
}

export const authApi = {
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth/login', payload),

  logout: (): Promise<void> => apiClient.post<void>('/auth/logout', {}),

  cadastrarCoordenador: (payload: CadastroServidorPayload): Promise<UsuarioCriado> =>
    apiClient.post<UsuarioCriado>('/coordenadores', {
      nome: payload.nome,
      matricula: payload.matricula,
      cpf: payload.cpf,
      codigoEscola: payload.codigoEscola,
      areaCoordenacao: payload.area,
      email: payload.email,
      senha: payload.senha,
    }),

  cadastrarProfessor: (payload: CadastroServidorPayload): Promise<UsuarioCriado> =>
    apiClient.post<UsuarioCriado>('/professores', {
      nome: payload.nome,
      matricula: payload.matricula,
      cpf: payload.cpf,
      codigoEscola: payload.codigoEscola,
      areaAtuacao: payload.area,
      email: payload.email,
      senha: payload.senha,
      aulasTotaisSemestre: 50,
    }),
};
