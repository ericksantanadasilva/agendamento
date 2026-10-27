// O token de acesso vive só na memória: some ao recarregar a página, e a sessão
// é recuperada pelo cookie de renovação (httpOnly), que o JavaScript não lê.
let accessToken: string | null = null;

const LEGACY_KEY = 'agendamento.token';

export function getToken(): string | null {
  return accessToken;
}

export function setToken(token: string): void {
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('Token inválido recebido do servidor');
  }
  accessToken = token;
}

export function clearToken(): void {
  accessToken = null;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    // armazenamento indisponível: nada a limpar
  }
}
