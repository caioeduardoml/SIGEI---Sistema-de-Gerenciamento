const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

interface ProblemDetailsPayload {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let payload: ProblemDetailsPayload | null = null;
    try {
      payload = (await response.json()) as ProblemDetailsPayload;
    } catch {
      payload = null;
    }

    const message =
      payload?.detail ??
      payload?.title ??
      `Erro na comunicacao com o servidor (HTTP ${response.status}).`;
    throw new ApiError(message, response.status, payload?.errors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = void>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
