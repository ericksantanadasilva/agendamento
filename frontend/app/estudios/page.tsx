"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StudioFormDialog } from "@/components/studios/studio-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudios } from "@/hooks/use-studios";
import { apiClient } from "@/lib/api";
import type { ApiStudio } from "@/lib/agenda";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function StudiosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "ADMIN";
  const { studios, error, reload } = useStudios(isAdmin);

  const [isCreating, setIsCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<ApiStudio | null>(null);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/");
  }, [user, router]);

  const changeActive = React.useCallback(
    async (studio: ApiStudio, active: boolean) => {
      setConfirmingId(null);
      try {
        await apiClient(`/studios/${studio.id}`, {
          method: "PATCH",
          body: JSON.stringify({ active }),
        });
        showToast(active ? "Estúdio ativado." : "Estúdio desativado.");
        reload();
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Não foi possível alterar o estúdio.",
          "error",
        );
      }
    },
    [reload, showToast],
  );

  function handleDeactivate(studio: ApiStudio) {
    if (confirmingId !== studio.id) {
      setConfirmingId(studio.id);
      return;
    }
    void changeActive(studio, false);
  }

  if (!isAdmin) return null;

  const newStudioButton = (
    <Button size="sm" className="gap-1.5" onClick={() => setIsCreating(true)}>
      <Plus className="h-3.5 w-3.5" />
      Novo estúdio
    </Button>
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col space-y-6">
      <PageHeader
        title="Estúdios"
        description="Cadastre e organize os estúdios disponíveis para reserva."
        action={newStudioButton}
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
        <div className="animate-pulse divide-y divide-border/60 rounded-[var(--radius)] border border-border/60">
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
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Nenhum estúdio cadastrado.
            </p>
            <p className="text-xs text-muted-foreground">
              Crie o primeiro estúdio para começar.
            </p>
          </div>
          {newStudioButton}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border/60 rounded-[var(--radius)] border border-border bg-card">
            {studios.map((studio) => (
              <li
                key={studio.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
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
                <div className="flex shrink-0 items-center gap-2">
                  <Badge
                    className="w-28 justify-center"
                    dotClassName={
                      studio.active ? "bg-primary" : "bg-muted-foreground/50"
                    }
                  >
                    {studio.active ? "Ativo" : "Desativado"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(studio)}
                  >
                    Editar
                  </Button>
                  {studio.active ? (
                    <Button
                      variant={confirmingId === studio.id ? "destructive" : "ghost"}
                      size="sm"
                      className="min-w-24"
                      onClick={() => handleDeactivate(studio)}
                    >
                      {confirmingId === studio.id
                        ? "Confirmar desativação?"
                        : "Desativar"}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-w-24"
                      onClick={() => void changeActive(studio, true)}
                    >
                      Ativar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-2xs text-muted-foreground">
            Desativar um estúdio o esconde do calendário e do formulário de
            reserva para quem não é administrador. As reservas futuras dele não
            são canceladas.
          </p>
        </>
      )}

      {isCreating && (
        <StudioFormDialog
          studio={null}
          onClose={() => setIsCreating(false)}
          onSaved={reload}
        />
      )}
      {editing && (
        <StudioFormDialog
          studio={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </div>
  );
}