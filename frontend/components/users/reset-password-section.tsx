"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

export interface ResetPasswordSectionProps {
    userId: string;
    userName: string;
}

export function ResetPasswordSection({
    userId,
    userName,
}: ResetPasswordSectionProps) {
    const { showToast } = useToast();
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);
    const [submitting, setSubmitting] = React.useState(false);

    async function handleReset() {
        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`);
            return;
        }

        setSubmitting(true);
        try {
            await apiClient(`/users/${userId}/password`, {
                method: "PATCH",
                body: JSON.stringify({ password }),
            });
            showToast(`Senha de ${userName} redifinada.`);
            setPassword("");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Não foi possível redefinir a senha.",
                "error",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="space-y-3 border-t border-border/60 p-5 text-xs">
            <div className="space-y-1">
                <h3 className="text-xs font-semibold text-foreground">Redefinir senha</h3>
                <p className="text-2xs text-muted-foreground">
                    Defina uma senha nova e avise a pessoa, porque o sistema não envia
                    e-mail. Quem já está logado continua com acesso até o token expirar.
                </p>
            </div>
            <Input
                id="reset-password"
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                maxLength={MAX_PASSWORD_LENGTH}
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        void handleReset();
                    }
                }}
                error={error ?? undefined}
                helperText={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres.`}
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={submitting || !password}
            >
                {submitting ? "Redefinindo..." : "Redefinir senha"}
            </Button>
        </section>
    )
}