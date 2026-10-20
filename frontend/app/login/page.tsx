"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, apiClient } from "@/lib/api";
import { setToken } from "@/lib/auth-storage";

interface LoginResponse {
    access_token: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await apiClient<LoginResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            setToken(data.access_token);
            router.replace('/');
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message)
            } else {
                setError('Não foi possível conectar ao servidor.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <form
             onSubmit={handleSubmit}
             className="w-full max-w-sm space-y-5 rounded-[var(--radius)] border border-border bg-card p-6"
            >
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold">Agendamento</h1>
                    <p className="text-xs text-muted-foreground">
                        Entre para ver a agenda dos estúdios.
                    </p>
                </div>

                <Input
                 label="E-mail"
                 type="email"
                 autoComplete="username"
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                 label="Senha"
                 type="password"
                 autoComplete="current-password"
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <p role='alert' className="text-xs font-medium text-destructive">
                        {error}
                    </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>
        </main>
    );
}