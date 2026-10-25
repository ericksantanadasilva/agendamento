'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { apiClient } from '@/lib/api';
import { ROLE_OPTIONS } from '@/lib/roles';
import { useToast } from '@/lib/toast-context';
import type { ApiUser, UserRole } from '@/types/auth';
import { ResetPasswordSection } from './reset-password-section';

const FORM_ID = 'user-form';
const MIN_PASSWORD_LENGTH = 8;

type FormErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export interface UserFormDialogProps {
  user: ApiUser | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function UserFormDialog({
  user,
  isSelf,
  onClose,
  onSaved,
}: UserFormDialogProps) {
  const { showToast } = useToast();
  const [name, setName] = React.useState(user?.name ?? '');
  const [email, setEmail] = React.useState(user?.email ?? '');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<UserRole>(user?.role ?? 'USER');
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  function clearError(key: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nextErrors: FormErrors = {};
    if (!trimmedName) nextErrors.name = 'Informe o nome';
    if (!user) {
      if (!trimmedEmail.includes('@'))
        nextErrors.email = 'Informe um e-mail válido';
      if (password.length < MIN_PASSWORD_LENGTH) {
        nextErrors.password = `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`;
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (user) {
        const body: Record<string, string> = {};
        if (trimmedName !== user.name) body.name = trimmedName;
        if (role !== user.role) body.role = role;

        if (Object.keys(body).length === 0) {
          onClose();
          return;
        }

        await apiClient(`/users/${user.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        showToast('Usuário atualizado.');
      } else {
        await apiClient('/users', {
          method: 'POST',
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password,
            role,
          }),
        });
        showToast('Usuário criado.');
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o usuário.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      eyebrow='Acesso'
      title={user ? 'Editar usuário' : 'Novo usuário'}
      onClose={onClose}
      footer={
        <>
          <Button type='button' variant='outline' size='sm' onClick={onClose}>
            Fechar
          </Button>
          <Button
            type='submit'
            form={FORM_ID}
            variant='primary'
            size='sm'
            className='gap-1.5'
            disabled={submitting}
          >
            <Check className='h-3.5 w-3.5' />
            {submitting
              ? 'Salvando...'
              : user
                ? 'Salvar alterações'
                : 'Criar usuário'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className='space-y-4 text-xs'>
        <Input
          id='user-name'
          label='Nome'
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError('name');
          }}
          error={errors.name}
        />
        <Input
          id='user-email'
          label='E-mail'
          type='email'
          autoComplete='off'
          disabled={Boolean(user)}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError('email');
          }}
          error={errors.email}
          helperText={user ? 'O e-mail não pode ser alterado.' : undefined}
        />
        {!user && (
          <Input
            id='user-password'
            label='Senha inicial'
            type='password'
            autoComplete='new-password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError('password');
            }}
            error={errors.password}
            helperText={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres. Avise a pessoa, porque ela nã recebe e-mail.`}
          />
        )}
        <Select
          id='user-role'
          label='Papel'
          value={role}
          disabled={isSelf}
          onChange={(e) => setRole(e.target.value as UserRole)}
          helperText={
            isSelf ? 'Você não pode alterar o seu próprio papel.' : undefined
          }
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </form>
      {user && !isSelf && (
        <ResetPasswordSection userId={user.id} userName={user.name} />
      )}
    </Dialog>
  );
}
