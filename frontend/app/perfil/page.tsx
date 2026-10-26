'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ROLE_LABELS } from '@/lib/roles';
import { useToast } from '@/lib/toast-context';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

type PasswordErrors = Partial<Record<'current' | 'next' | 'confirm', string>>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = React.useState(user?.name ?? '');
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [savingName, setSavingName] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordErrors, setPasswordErrors] = React.useState<PasswordErrors>(
    {},
  );
  const [savingPassword, setSavingPassword] = React.useState(false);

  if (!user) return null;

  function clearPasswordError(key: keyof PasswordErrors) {
    setPasswordErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSaveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Informe o seu nome');
      return;
    }

    setSavingName(true);
    try {
      await apiClient('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: trimmed }),
      });
      await refreshUser();
      showToast('Nome atualizado.');
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar o nome.',
        'error',
      );
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: PasswordErrors = {};
    if (!currentPassword) nextErrors.current = 'Informe a senha atual';
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.next = `A senha ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`;
    } else if (newPassword === currentPassword) {
      nextErrors.next = 'A senha precisa ser diferente da atual';
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirm = 'As senhas não coincidem';
    }
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      return;
    }

    setSavingPassword(true);
    try {
      await apiClient('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ password: newPassword, currentPassword }),
      });
      showToast('Senha alterada.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof ApiError && err.message === 'Senha atual incorreta') {
        setPasswordErrors({ current: err.message });
      } else {
        showToast(
          err instanceof Error
            ? err.message
            : 'Não foi possível alterar a senha.',
          'error',
        );
      }
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className='flex min-w-0 flex-1 flex-col space-y-8'>
      <PageHeader
        title='Meu perfil'
        description='Veja os seus dados e altere o seu nome e a sua senha.'
      />

      <form onSubmit={handleSaveName} className='max-w-md space-y-4'>
        <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          Dados
        </h2>
        <Input
          id='profile-name'
          label='Nome'
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(null);
          }}
          error={nameError ?? undefined}
        />
        <Input
          id='profile-email'
          label='E-mail'
          value={user.email}
          disabled
          helperText='O e-mail não pode ser alterado.'
        />
        <Input
          id='profile-role'
          label='Papel'
          value={ROLE_LABELS[user.role]}
          disabled
        />
        <Button
          type='submit'
          size='sm'
          disabled={savingName || name.trim() === user.name}
        >
          {savingName ? 'Salvando...' : 'Salvar nome'}
        </Button>
      </form>

      <form
        onSubmit={handleChangePassword}
        className='max-w-md space-y-4 border-t border-border/60 pt-8'
      >
        <h2 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
          Trocar senha
        </h2>
        <Input
          id='profile-current-password'
          label='Senha atual'
          type='password'
          autoComplete='current-password'
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            clearPasswordError('current');
          }}
          error={passwordErrors.current}
        />
        <Input
          id='profile-new-password'
          label='Senha nova'
          type='password'
          autoComplete='new-password'
          maxLength={MAX_PASSWORD_LENGTH}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            clearPasswordError('next');
          }}
          error={passwordErrors.next}
          helperText={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres.`}
        />
        <Input
          id='profile-confirm-password'
          label='Confirmar senha nova'
          type='password'
          autoComplete='new-password'
          maxLength={MAX_PASSWORD_LENGTH}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearPasswordError('confirm');
          }}
          error={passwordErrors.confirm}
        />
        <Button
          type='submit'
          size='sm'
          disabled={
            savingPassword ||
            !currentPassword ||
            !newPassword ||
            !confirmPassword
          }
        >
          {savingPassword ? 'Alterando...' : 'Trocar senha'}
        </Button>
      </form>
    </div>
  );
}
