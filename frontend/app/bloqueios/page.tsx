'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ManagedItemRow,
  ManagedList,
  ManagedListSkeleton,
} from '@/components/admin/managed-list';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useBlocks } from '@/hooks/use-blocks';
import { useNow } from '@/hooks/use-now';
import { useStudios } from '@/hooks/use-studios';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatBlockRange, type ApiBlock } from '@/lib/blocks';
import { useToast } from '@/lib/toast-context';

export default function BlocksPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isStaff = user !== null && user.role !== 'USER';
  const now = useNow(60_000);

  const {
    studios,
    error: studiosError,
    reload: reloadStudios,
  } = useStudios(isStaff);
  const [chosenId, setChosenId] = React.useState<string | null>(null);
  const studioId = chosenId ?? studios?.[0]?.id ?? null;
  const {
    blocks,
    error: blocksError,
    reload: reloadBlocks,
  } = useBlocks(studioId);
  const [showPast, setShowPast] = React.useState(false);

  React.useEffect(() => {
    if (user && user.role === 'USER') router.replace('/');
  }, [user, router]);

  const deactivate = React.useCallback(
    async (block: ApiBlock) => {
      try {
        await apiClient(`/blocks/${block.id}/deactivate`, { method: 'PATCH' });
        showToast('Bloqueio desativado.');
        reloadBlocks();
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : 'Não foi possível desativar o bloqueio.',
          'error',
        );
      }
    },
    [reloadBlocks, showToast],
  );

  if (!isStaff) return null;

  const loadError = studiosError ?? blocksError;

  function retry() {
    reloadStudios();
    reloadBlocks();
  }

  const visible = (blocks ?? [])
    .filter((block) => showPast || new Date(block.endAt).getTime() > now)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  const hiddenCount = (blocks?.length ?? 0) - visible.length;

  return (
    <div className="flex min-w-0 flex-1 flex-col space-y-6">
      <PageHeader
        title="Bloqueios"
        description="Bloqueie um estúdio por um período, como manutenção, feriado ou evento. Nesse periíodo, ninguém consegue reservá-lo."
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
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum estúdio cadastrado.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="w-full max-w-xs">
              <Select
                id="blocks-studio"
                label="Estúdio"
                value={studioId ?? ''}
                onChange={(e) => setChosenId(e.target.value)}
              >
                {studios.map((studio) => (
                  <option key={studio.id} value={studio.id}>
                    {studio.name}
                    {studio.active ? '' : ' (desativado)'}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPast((current) => !current)}
            >
              {showPast ? 'Ocultar passados' : 'Mostrar passados'}
            </Button>
          </div>

          {blocks === null ? (
            <ManagedListSkeleton />
          ) : visible.length === 0 ? (
            <div className="space-y-1 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                Nenhum bloqueio{' '}
                {showPast ? 'neste estúdio' : 'futuro neste estúdio'}.
              </p>
              {!showPast && hiddenCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Há {hiddenCount} bloqueio(s) passado(s) escondido(s).
                </p>
              )}
            </div>
          ) : (
            <ManagedList>
              {visible.map((block) => (
                <ManagedItemRow
                  key={block.id}
                  title={formatBlockRange(block.startAt, block.endAt)}
                  monoTitle
                  subtitle={block.reason ?? 'Sem motivo informado'}
                  active={block.active}
                  canReactivate={false}
                  onSetActive={() => void deactivate(block)}
                />
              ))}
            </ManagedList>
          )}

          <p className="text-2xs text-muted-foreground">
            Desativar um bloqueio libera o horário para novas reservas. As
            reservas que foram canceladas quando o bloqueio foi criado não
            voltam, e um bloqueio desativado não pode ser reativado: crie outro.
          </p>
        </>
      )}
    </div>
  );
}
