'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCheck, PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/types/auth';
import { Button } from '../ui/button';
import { getNavItems } from './nav-items';
import { ROLE_LABELS } from '@/lib/roles';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const navItems = getNavItems(user?.role);

  return (
    <aside
      suppressHydrationWarning
      className={cn(
        'hidden md:flex flex-col sticky top-0 h-screen border-r border-border bg-card select-none shrink-0 transition-all duration-300 ease-in-out z-30',
        isCollapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Brand Header & Collapse Trigger */}
      <div
        className={cn(
          'h-14 flex items-center border-b border-border transition-all px-3',
          isCollapsed ? 'justify-center' : 'justify-between px-4',
        )}
      >
        <div className='flex items-center gap-2.5 overflow-hidden'>
          <div className='w-6 h-6 rounded-[var(--radius)] bg-muted border border-border flex items-center justify-center text-foreground font-mono font-bold text-2xs shrink-0 relative'>
            <span className='text-foreground'>AG</span>
            <span className='absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary' />
          </div>
          {!isCollapsed && (
            <span className='text-xs font-semibold tracking-wider uppercase text-foreground truncate whitespace-nowrap'>
              Agendamento
            </span>
          )}
        </div>

        <button
          type='button'
          onClick={onToggle}
          title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          className={cn(
            'p-1.5 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer',
            isCollapsed && 'hidden',
          )}
        >
          <PanelLeftClose className='w-4 h-4' />
        </button>
      </div>

      {/* Botão de expansão quando colapsado */}
      {isCollapsed && (
        <div className='flex justify-center pt-3 pb-1'>
          <button
            type='button'
            onClick={onToggle}
            title='Expandir sidebar'
            className='p-1.5 rounded-[var(--radius)] text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer'
          >
            <PanelLeftOpen className='w-4 h-4' />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className='flex-1 px-2.5 py-4 space-y-1 overflow-y-auto overflow-x-hidden'>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-2.5 py-2 text-xs transition-colors group relative rounded-[var(--radius)]',
                isCollapsed ? 'justify-center px-0 h-9 w-full' : 'px-2.5',
                isActive
                  ? 'bg-muted text-foreground font-medium border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              {!isCollapsed && (
                <span className='truncate whitespace-nowrap'>{item.label}</span>
              )}

              {/* Tooltip flutuante discreto no modo colapsado */}
              {isCollapsed && (
                <span className='absolute left-full ml-2 px-2 py-1 bg-muted border border-border text-2xs font-medium text-foreground rounded shadow-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50'>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className='p-2.5 border-t border-border space-y-1.5'>
        <div
          className={cn(
            'flex items-center rounded-[var(--radius)] bg-muted/40 border border-border/60 transition-all',
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2',
          )}
          title={user ? `${user.name} (${user.email})` : undefined}
        >
          <div className='w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0'>
            <UserCheck className='w-3.5 h-3.5' />
          </div>
          {!isCollapsed && (
            <div className='flex-1 min-w-0 overflow-hidden'>
              <p className='text-xs font-medium text-foreground truncate'>
                {user?.name}
              </p>
              <p className='text-3xs text-muted-foreground truncate font-mono'>
                {user ? ROLE_LABELS[user.role] : ''}
              </p>
            </div>
          )}
        </div>

        <Button
          type='button'
          variant='ghost'
          size={isCollapsed ? 'icon' : 'sm'}
          onClick={signOut}
          title='sair'
          className={cn(isCollapsed ? 'flex mx-auto' : 'w-full justify-start')}
        >
          <LogOut className='w-4 h-4 shrink-0' />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
