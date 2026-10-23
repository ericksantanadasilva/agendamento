"use client";

import * as React from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { DurationFormDialog } from "@/components/durations/duration-form-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useDurations } from "@/hooks/use-durations"
import { apiClient } from "@/lib/api"
import type { ApiDuration } from "@/lib/agenda"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"

export default function DurationsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const isAdmin = user?.role === "ADMIN";
    const { durations, error, reload } = useDurations(isAdmin);

    const [isCreating, setIsCreating] = React.useState(false);
    const [editing, setEditing] = React.useState<ApiDuration | null>(null);
    const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (user && user.role !== "ADMIN") router.replace("/");
    }, [user, router]);

    const changeActive = React.useCallback(
        async (duration: ApiDuration, active: boolean) => {
            setConfirmingId(null);
            try {
                await apiClient(`/durations/${duration.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ active }),
                });
                showToast(active ? "Duração ativada." : "Duração desativada.");
                reload();
            } catch (err) {
                showToast(
                    err instanceof Error ? err.message : "Não foi possível alterar a duração.",
                    "error",
                );
            }
        },
        [reload, showToast],
    );

    function handleDeactivate(duration: ApiDuration) {
        if  (confirmingId !== duration.id) {
            setConfirmingId(duration.id);
            return;
        }
        void changeActive(duration, false);
    }

    if (!isAdmin) return null;

    const newDurationButton = (
        <Button size="sm" className="gap-1.5" onClick={() => setIsCreating(true)}>
            <Plus className="h-3.5 w-3.5" />
            Nova duração
        </Button>
    );

    return (
        <div className="flex min-w-0 flex-1 flex-col space-y-6">
            <PageHeader
             title="Durações"
             description="Defina as durações que podem ser escolhidas as reservar um estúdio."
             action={newDurationButton}
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
            ) : durations === null ? (
                <div className="animate-pulse divide-y divide-border/60 rounded-[var(--radius)] border border-border/60">
                    {[0, 1, 2].map((row) => (
                        <div key={row} className="flex items-center justify-between p-4">
                            <div className="space-y-2">
                                <div className="h-3 w-40 rounded bg-muted/50" />
                                <div className="h-2.5 w-16 rounded bg-muted/30" />
                            </div>
                            <div className="h-5 w-16 rounded bg-muted/40" />
                        </div>
                    ))}
                </div>
            ) : durations.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                            Nenhuma duração cadastrada.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Sem durações ativas, ninguém consegue reservar. Crie a primeira.
                        </p>
                    </div>
                    {newDurationButton}
                </div>
            ) : (
                <>
                    <ul className="divide-y divide-border/60 rounded-[var(--radius)] border border-border bg-card">
                        {durations.map((duration) => (
                            <li
                             key={duration.id}
                             className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {duration.name}
                                    </p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {duration.minutes} min
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Badge
                                     className="w-28 justify-center"
                                     dotClassName={
                                        duration.active ? "bg-primary" : "bg-muted-foreground/50"
                                     }
                                    >
                                        {duration.active ? "Ativa" : "Desativada"}
                                    </Badge>
                                    <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => setEditing(duration)}
                                    >
                                        Editar
                                    </Button>
                                    {duration.active ? (
                                        <Button
                                         variant={confirmingId === duration.id ? "destructive" : "ghost"}
                                         size="sm"
                                         className="min-w-24"
                                         onClick={() => handleDeactivate(duration)}
                                        >
                                            {confirmingId === duration.id
                                             ? "Confirmar desativação?"
                                             : "Desativar"}
                                        </Button>
                                    ) : (
                                        <Button
                                         variant="ghost"
                                         size="sm"
                                         className="min-w-24"
                                         onClick={() => void changeActive(duration, true)}
                                        >
                                            Ativar
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p className="text-2xs text-muted-foreground">
                        Desativar uma duração a remove do formulário de reserva. As reservas
                        já feitas continuam como estão, e alterar os minutos de uma duração
                        não mudao horário de término delas.
                    </p>
                </>
            )}

            {isCreating && (
                <DurationFormDialog
                 duration={null}
                 onClose={() => setIsCreating(false)}
                 onSaved={reload}
                />
            )}
            {editing && (
                <DurationFormDialog
                 duration={editing}
                 onClose={() => setEditing(null)}
                 onSaved={reload}
                />
            )}
        </div>
    )
}