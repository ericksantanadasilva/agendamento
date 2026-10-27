import { clearToken, getToken } from './auth-storage';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  statusCode: number;
  body: unknown;

  constructor(message: string, statusCode: number, body?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.body = body;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let body: unknown;
    let message = `Erro na requisição (${response.status})`;
    try {
      body = await response.json();
      const apiMessage = (body as { message?: string | string[] }).message;
      if (Array.isArray(apiMessage)) {
        message = apiMessage.join('. ');
      } else if (typeof apiMessage === 'string') {
        message = apiMessage;
      }
    } catch {
      // resposta sem JSON: fica a mensagem padrão
    }

    if (response.status === 429) {
      message =
        'Muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo.';
    }

    if (response.status === 401 && path !== '/auth/login') {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.assign('/login');
      }
    }

    throw new ApiError(message, response.status, body);
  }

  return response.json();
}
