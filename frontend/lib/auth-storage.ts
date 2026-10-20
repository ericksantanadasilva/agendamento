const TOKEN_KEY = 'agendamento.token';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token: string): void {
    if (typeof token !== 'string' || token.split('.').length !== 3) {
        throw new Error('Token inválido recebido do servidor');
    }
    try {
        window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
        // armazenamento indisponível: o usuário precisará logar de novo
    }
}

export function clearToken(): void {
    try {
        window.localStorage.removeItem(TOKEN_KEY);
    } catch {
        // nada a fazer
    }
}