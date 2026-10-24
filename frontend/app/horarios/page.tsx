"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { AvailabilityFormDialog } from "@/components/availability/availability-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useAvailabilities } from "@/hooks/use-availabilities";
import { useStudios } from "@/hooks/use-studios";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  DAYS,
  formatPeriod,
  type ApiAvailability,
  type DayOfWeek,
} from "@/lib/availability";
import { useToast } from "@/lib/toast-context";

export default function AvailabilityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === "ADMIN";

  const {
    studios,
    error: studiosError,
    reload: reloadStudios,
  } = useStudios(isAdmin);
  const [chosenId, setChosenId] = React.useState<string | null>(null);
  const studioId = chosenId ?? studios?.[0]?.id ?? null;
  const {
    availabilities,
    error: availabilitiesError,
    reload: reloadAvailabilities,
  } = useAvailabilities(studioId);

  const [creatingDay, setCreatingDay] = React.useState<DayOfWeek | null>(null);
  const [editing, setEditing] = React.useState<ApiAvailability | null>(null);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user && user.role !== "ADMIN") router.replace("/");
  }, [user, router]);

  const changeActive = React.useCallback(
    async (period: ApiAvailability, active: boolean) => {
      setConfirmingId(null);
      try {
        await apiClient(`/availabilities/${period.id}`, {
          method: "PATCH",
          body: JSON.stringify({ active }),
        });
        showToast(active ? "Período ativado." : "Período desativado.");
        reloadAvailabilities();
      } catch (err) {
        showToast(
          err instanceof Error ? err.message : "Não foi possível alterar o período.",
          "error",
        );
      }
    },
    [reloadAvailabilities, showToast],
  );

  function handleDeactivate(period: ApiAvailability) {
    if (confirmingId !== period.id) {
      setConfirmingId(period.id);
      return;
    }
    void changeActive(period, false);
  }

  if (!isAdmin) return null;

  const loadError = studiosError ?? availabilitiesError;

  function retry() {
    reloadStudios();
    reloadAvailabilities();
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col space-y-6">
      <PageHeader
        title="Horários de funcionamento"
        description="Defina em quais dias e horários cada estúdio aceita reservas. Dias sem períodos ficam fechados."
      />

      {loadError ? (
        <div className="space-y-3">
          <p role="alert" className="text-xs font-medium text-destructive">
            {loadError}
          </p>
          <Button variant="outline" size="sm" onClick={retry}>
            Tentar de novo
          </Button>
        </div>
      ) : studios === null ? (
        <div className="animate-pulse space-y-3">
          <div className="h-9 w-64 rounded bg-muted/40" />
          <div className="h-40 rounded-[var(--radius)] border border-border/60" />
        </div>
      ) : studios.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Nenhum estúdio cadastrado.
            </p>
            <p className="text-xs text-muted-foreground">
              Cadastre um estúdio antes de definir os horários dele.
            </p>
          </div>
          <Button size="sm" onClick={() => router.push("/estudios")}>
            Ir para Estúdios
          </Button>
        </div>
      ) : (
        <>
          <div className="max-w-xs">
            <Select
              id="availability-studio"
              label="Estúdio"
              value={studioId ?? ""}
              onChange={(e) => {
                setChosenId(e.target.value);
                setConfirmingId(null);
              }}
            >
              {studios.map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                  {studio.active ? "" : " (desativado)"}
                </option>
              ))}
            </Select>
          </div>

          {availabilities === null ? (
            <div className="animate-pulse space-y-3">
              {DAYS.map((day) => (
                <div key={day.value} className="h-14 rounded bg-muted/30" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS.map((day) => {
                const periods = availabilities
                  .filter((a) => a.dayOfWeek === day.value)
                  .sort((a, b) => a.startMinute - b.startMinute);

                return (
                  <section key={day.value} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {day.label}
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setCreatingDay(day.value)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar período
                      </Button>
                    </div>
                    {periods.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Sem horários cadastrados: o estúdio fica fechado neste dia.
                      </p>
                    ) : (
                      <ul className="divide-y divide-border/60 rounded-[var(--radius)] border border-border bg-card">
                        {periods.map((period) => (
                          <li
                            key={period.id}
                            className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                          >
                            <p className="font-mono text-sm text-foreground">
                              {formatPeriod(period.startMinute, period.endMinute)}
                            </p>
                            <div className="flex shrink-0 items-center gap-2">
                              <Badge
                                className="w-28 justify-center"
                                dotClassName={
                                  period.active
                                    ? "bg-primary"
                                    : "bg-muted-foreground/50"
                                }
                              >
                                {period.active ? "Ativo" : "Desativado"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditing(period)}
                              >
                                Editar
                              </Button>
                              {period.active ? (
                                <Button
                                  variant={
                                    confirmingId === period.id
                                      ? "destructive"
                                      : "ghost"
                                  }
                                  size="sm"
                                  className="min-w-24"
                                  onClick={() => handleDeactivate(period)}
                                >
                                  {confirmingId === period.id
                                    ? "Confirmar desativação?"
                                    : "Desativar"}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="min-w-24"
                                  onClick={() => void changeActive(period, true)}
                                >
                                  Ativar
                                </Button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          <p className="text-2xs text-muted-foreground">
            Desativar um período não cancela as reservas que já estão nele, mas
            ninguém consegue reservar naquele horário a partir daí. Para mudar
            o dia de um período, crie um novo e desative o antigo.
          </p>
        </>
      )}

      {creatingDay && studioId && (
        <AvailabilityFormDialog
          studioId={studioId}
          day={creatingDay}
          period={null}
          onClose={() => setCreatingDay(null)}
          onSaved={reloadAvailabilities}
        />
      )}
      {editing && (
        <AvailabilityFormDialog
          studioId={editing.studioId}
          day={editing.dayOfWeek}
          period={editing}
          onClose={() => setEditing(null)}
          onSaved={reloadAvailabilities}
        />
      )}
    </div>
  );
}