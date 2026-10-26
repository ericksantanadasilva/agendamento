import {
  Ban,
  Calendar,
  CalendarClock,
  Clock,
  Layers,
  UserCircle,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
  section?: 'admin';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Calendário', href: '/', icon: Calendar },
  {
    label: 'Bloqueios',
    href: '/bloqueios',
    icon: Ban,
    roles: ['ADMIN', 'OPERATOR'],
    section: 'admin',
  },
  {
    label: 'Estúdios',
    href: '/estudios',
    icon: Layers,
    roles: ['ADMIN'],
    section: 'admin',
  },
  {
    label: 'Durações',
    href: '/duracoes',
    icon: Clock,
    roles: ['ADMIN'],
    section: 'admin',
  },
  {
    label: 'Horários',
    href: '/horarios',
    icon: CalendarClock,
    roles: ['ADMIN'],
    section: 'admin',
  },
  {
    label: 'Usuários',
    href: '/usuarios',
    icon: Users,
    roles: ['ADMIN'],
    section: 'admin',
  },
];

export const PROFILE_ITEM: NavItem = {
  label: 'Perfil',
  href: '/perfil',
  icon: UserCircle,
};

export function getNavItems(role: UserRole | undefined): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => !item.roles || (role !== undefined && item.roles.includes(role)),
  );
}
