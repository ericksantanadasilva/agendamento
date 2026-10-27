'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiClient, logoutRequest, refreshSession } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth-storage';
import type { CurrentUser } from '@/types/auth';

interface AuthContextValue {
  user: CurrentUser | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    if (isLoginPage || user) return;
    let cancelled = false;

    async function load() {
      if (!getToken()) {
        const result = await refreshSession();
        if (cancelled) return;
        if (result === 'denied') {
          router.replace('/login');
          return;
        }
        if (result === 'error') {
          setFailed(true);
          return;
        }
      }

      try {
        const me = await apiClient<CurrentUser>('/users/me');
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, user, router, attempt]);

  const signOut = React.useCallback(async () => {
    await logoutRequest();
    clearToken();
    setUser(null);
    router.replace('/login');
  }, [router]);

  const refreshUser = React.useCallback(async () => {
    const me = await apiClient<CurrentUser>('/users/me');
    setUser(me);
  }, []);

  const retry = React.useCallback(() => {
    setFailed(false);
    setAttempt((current) => current + 1);
  }, []);

  if (!isLoginPage && !user) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-3 text-xs text-muted-foreground'>
        {failed ? (
          <>
            <p>Não foi possível conectar ao servidor.</p>
            <Button variant='outline' size='sm' onClick={retry}>
              Tentar de novo
            </Button>
          </>
        ) : (
          'Carregando...'
        )}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro do AuthProvider');
  }
  return context;
}
