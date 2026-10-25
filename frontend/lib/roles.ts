import type { UserRole } from '@/types/auth';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  USER: 'Usuário',
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'USER', label: ROLE_LABELS.USER },
  { value: 'OPERATOR', label: ROLE_LABELS.OPERATOR },
  { value: 'ADMIN', label: ROLE_LABELS.ADMIN },
];
