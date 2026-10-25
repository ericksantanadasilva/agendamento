"use client";

import * as React from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { DurationFormDialog } from "@/components/durations/duration-form-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { 
    ManagedItemRow,
    ManagedList,
    ManagedListSkeleton,
 } from "@/components/admin/managed-list";
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

    React.useEffect(() => {
        if (user && user.role !== "ADMIN") router.replace("/");
    }, [user, router]);

    const changeActive = React.useCallback(
        async (duration: ApiDuration, active: boolean) => {
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
                <ManagedListSkeleton />
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
                    <ManagedList>
                        {durations.map((duration) => (
                            <ManagedItemRow
                                key={duration.id}
                                title={duration.name}
                                subtitle={`${duration.minutes} min`}
                                active={duration.active}
                                labels={{ active: "Ativa", inactive: "Desativada" }}
                                onEdit={() => setEditing(duration)}
                                onSetActive={(active) => void changeActive(duration, active)}
                            />
                        ))}
                    </ManagedList>
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