'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { StudioFormDialog } from '@/components/studios/studio-form-dialog';
import {
  ManagedItemRow,
  ManagedList,
  ManagedListSkeleton,
} from '@/components/admin/managed-list';
import { Button } from '@/components/ui/button';
import { useStudios } from '@/hooks/use-studios';
import { apiClient } from '@/lib/api';
import type { ApiStudio } from '@/lib/agenda';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

export default function StudiosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const { studios, error, reload } = useStudios(isAdmin);

  const [isCreating, setIsCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<ApiStudio | null>(null);

  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/');
  }, [user, router]);

  const changeActive = React.useCallback(
    async (studio: ApiStudio, active: boolean) => {
      try {
        await apiClient(`/studios/${studio.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ active }),
        });
        showToast(active ? 'Estúdio ativado.' : 'Estúdio desativado.');
        reload();
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : 'Não foi possível alterar o estúdio.',
          'error',
        );
      }
    },
    [reload, showToast],
  );

  if (!isAdmin) return null;

  const newStudioButton = (
    <Button size='sm' className='gap-1.5' onClick={() => setIsCreating(true)}>
      <Plus className='h-3.5 w-3.5' />
      Novo estúdio
    </Button>
  );

  return (
    <div className='flex min-w-0 flex-1 flex-col space-y-6'>
      <PageHeader
        title='Estúdios'
        description='Cadastre e organize os estúdios disponíveis para reserva.'
        action={newStudioButton}
      />

      {error ? (
        <div className='space-y-3'>
          <p role='alert' className='text-xs font-medium text-destructive'>
            {error}
          </p>
          <Button variant='outline' size='sm' onClick={reload}>
            Tentar de novo
          </Button>
        </div>
      ) : studios === null ? (
        <ManagedListSkeleton />
      ) : studios.length === 0 ? (
        <div className='flex flex-col items-center gap-3 py-10 text-center'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-foreground'>
              Nenhum estúdio cadastrado.
            </p>
            <p className='text-xs text-muted-foreground'>
              Crie o primeiro estúdio para começar.
            </p>
          </div>
          {newStudioButton}
        </div>
      ) : (
        <>
          <ManagedList>
            {studios.map((studio) => (
              <ManagedItemRow
                key={studio.id}
                title={studio.name}
                subtitle={studio.description}
                active={studio.active}
                onEdit={() => setEditing(studio)}
                onSetActive={(active) => void changeActive(studio, active)}
              />
            ))}
          </ManagedList>
          <p className='text-2xs text-muted-foreground'>
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
