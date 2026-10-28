'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { FloatingBottomNav } from './floating-bottom-nav';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'sidebar_collapsed';
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  // O evento "storage" avisa quando outra aba muda o valor.
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

function saveCollapsed(next: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // armazenamento indisponível: a preferência vale só até recarregar
  }
  listeners.forEach((listener) => listener());
}

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isCollapsed = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const handleToggle = React.useCallback(() => {
    saveCollapsed(!isCollapsed);
  }, [isCollapsed]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      {/* Sidebar Desktop Fixa (sem scroll junto com a página) */}
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggle} />

      {/* Main Content Area (rolagem independente) */}
      <div className='flex-1 flex flex-col min-w-0 min-h-screen'>
        <main
          className='flex-1 w-full p-4 sm:p-6 pb-24 md:pb-8 flex flex-col'
          suppressHydrationWarning
        >
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Nav */}
      <FloatingBottomNav />
    </div>
  );
}
