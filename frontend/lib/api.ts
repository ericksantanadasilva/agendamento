import { clearToken, getToken, setToken } from './auth-storage';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  statusCode: number;
  body: unknown;

  constructor(message: string, statusCode: number, body?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.body = body;
  }
}

export type RefreshResult = 'ok' | 'denied' | 'error';

const AUTH_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

let refreshing: Promise<RefreshResult> | null = null;

async function callRefresh(): Promise<RefreshResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (response.status === 401) return 'denied';
    if (!response.ok) return 'error';

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) return 'error';
    setToken(data.access_token);
    return 'ok';
  } catch {
    return 'error';
  }
}

// Várias chamadas que recebem 401 ao mesmo tempo compartilham uma única renovação.
export function refreshSession(): Promise<RefreshResult> {
  if (!refreshing) {
    refreshing = callRefresh().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

export async function logoutRequest(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // sem conexão: o cookie expira sozinho
  }
}

function send(path: string, options: RequestInit): Promise<Response> {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isAuthPath = AUTH_PATHS.includes(path);

  let response = await send(path, options);
  let refreshResult: RefreshResult | null = null;

  if (response.status === 401 && !isAuthPath) {
    refreshResult = await refreshSession();
    if (refreshResult === 'ok') {
      response = await send(path, options);
    }
  }

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

    if (response.status === 401 && !isAuthPath && refreshResult !== 'error') {
      clearToken();
      if (typeof window !== 'undefined') {
        // Recarregamento completo de propósito: zera o estado em memória da sessão encerrada.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign('/login');
      }
    }

    throw new ApiError(message, response.status, body);
  }

  return response.json();
}
