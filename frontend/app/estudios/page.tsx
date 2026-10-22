"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudios } from "@/hooks/use-studios";
import { useAuth } from "@/lib/auth-context";

export default function StudiosPage() {
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const { studios, error, reload } = useStudios(isAdmin);

    React.useEffect(() => {
        if (user && user.role !== "ADMIN") router.replace('/');
    }, [user, router]);

    if (!isAdmin) return null;

    return (
        <div className="flex min-w-0 flex-1 flex-col space-y-6">
            <PageHeader
             title="Estúdios"
             description="Cadastre e organize os estúdios disponíveis para reserva."
            />

            {error ? (
                <div className="space-y-3">
                    <p role="alert" className="text-xs font-medium text-destructive">
                        {error}
                    </p>
                    <Button variant="outline" size="sm" onClick={reload}>
                        Tentar de novo
                    </Button>
                </div>
            ) : studios === null ? (
                <div className="animate-pulse divide-border/60 rounded-[var(--radius)] border border-border/60">
                    {[0, 1, 2].map((row) => (
                        <div key={row} className="flex items-center justify-between p-4">
                            <div className="space-y-2">
                                <div className="h-3 w-40 rounded bg-muted/50" />
                                <div className="h-2.5 w-56 rounded bg-muted/30" />
                            </div>
                            <div className="h-5 w-16 rounded bg-muted/40" />
                        </div>
                    ))}
                </div>
            ) : studios.length === 0 ? (
                <div className="space-y-1 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">
                        Nenhum estúdio cadastrado.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Crie o primeiro estúdio para começar.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-border/60 rounded-[var(--radius)] border border-border bg-card">
                    {studios.map((studio) => (
                        <li
                         key={studio.id}
                         className="flex items-center justify-between gap-4 p-4"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                    {studio.name}
                                </p>
                                {studio.description && (
                                    <p className="truncate text-xs text-muted-foreground">
                                        {studio.description}
                                    </p>
                                )}
                            </div>
                            <Badge
                             dotClassName={
                                studio.active ? "bg-primary" : "bg-muted-foreground/50"
                             }
                            >
                                {studio.active ? "Ativo" : "Desativado"}
                            </Badge>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}