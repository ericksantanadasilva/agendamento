'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ManagedItemRow,
  ManagedList,
  ManagedListSkeleton,
} from '@/components/admin/managed-list';
import { PageHeader } from '@/components/layout/page-header';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/use-users';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ROLE_LABELS } from '@/lib/roles';
import { useToast } from '@/lib/toast-context';
import type { ApiUser } from '@/types/auth';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const { users, error, reload } = useUsers(isAdmin);

  const [isCreating, setIsCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<ApiUser | null>(null);

  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/');
  }, [user, router]);

  const changeActive = React.useCallback(
    async (target: ApiUser, active: boolean) => {
      try {
        await apiClient(`/users/${target.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ active }),
        });
        showToast(active ? 'Usuário ativado.' : 'Usuário desativado.');
        reload();
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : 'Não foi possível alterar o usuário.',
          'error',
        );
      }
    },
    [reload, showToast],
  );

  if (!isAdmin) return null;

  return (
    <div className='flex min-w-0 flex-1 flex-col space-y-6'>
      <PageHeader
        title='Usuários'
        description='Gerencie quem tem acesso ao sistema e com qual papel.'
        action={
          <Button
            size='sm'
            className='gap-1.5'
            onClick={() => setIsCreating(true)}
          >
            <Plus className='h-3.5 w-3.5' />
            Novo usuário
          </Button>
        }
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
      ) : users === null ? (
        <ManagedListSkeleton />
      ) : (
        <>
          <ManagedList>
            {users.map((item) => {
              const isSelf = item.id === user?.id;
              return (
                <ManagedItemRow
                  key={item.id}
                  title={item.name}
                  subtitle={`${item.email} · ${ROLE_LABELS[item.role]}${isSelf ? ' · você' : ''}`}
                  active={item.active}
                  deactivateDisabled={isSelf}
                  onEdit={() => setEditing(item)}
                  onSetActive={(active) => void changeActive(item, active)}
                />
              );
            })}
          </ManagedList>
          <p className='text-2xs text-muted-foreground'>
            Desativar um usuário impede novos logins, mas quem já está logado
            continua com acesso até o token expirar (até 8 horas). As reservas
            dele não são canceladas. Mudanças de papel valem a partir do próximo
            login da pessoa.
          </p>
        </>
      )}

      {isCreating && (
        <UserFormDialog
          user={null}
          isSelf={false}
          onClose={() => setIsCreating(false)}
          onSaved={reload}
        />
      )}
      {editing && (
        <UserFormDialog
          user={editing}
          isSelf={editing.id === user?.id}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </div>
  );
}
