"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "./api";
import { clearToken, getToken } from "./auth-storage";
import type { CurrentUser } from "@/types/auth";

interface AuthContextValue {
    user: CurrentUser | null;
    signOut: () => void;
}


const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';
    const [user, setUser] = React.useState<CurrentUser | null>(null);
    const [failed, setFailed] = React.useState(false);

    React.useEffect(() => {
        if (isLoginPage || user) return;

        if(!getToken()) {
            router.replace('/login');
            return;
        }

        let cancelled = false;
        apiClient<CurrentUser>('/users/me')
         .then((me) => {
            if (!cancelled) setUser(me);
         })
         .catch(() => {
            if (!cancelled) setFailed(true);
         });

        return () => {
            cancelled = true;
        };
    }, [isLoginPage, user, router]);

    const signOut = React.useCallback(() => {
        clearToken();
        setUser(null);
        router.replace('/login');
    }, [router]);

    if (!isLoginPage && !user) {
        return (
            <div className="flex min-h-screen items-center justify-center text-xs text-muted-foreground">
                {failed ? 'Não foi possível conectar ao servidor.' : 'Carregando...'}
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth precisa ser usado dentrodo AuthProvider');
    }
    return context;
}