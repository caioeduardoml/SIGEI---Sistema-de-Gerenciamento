import { apiClient } from 'lib/apiClient';
import type { Escola } from 'types/sigei';

export interface CadastrarEscolaPayload {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

export const escolasApi = {
  listar: (): Promise<Escola[]> => apiClient.get<Escola[]>('/escolas'),
  cadastrar: (payload: CadastrarEscolaPayload): Promise<Escola> =>
    apiClient.post<Escola>('/escolas', payload),
};
