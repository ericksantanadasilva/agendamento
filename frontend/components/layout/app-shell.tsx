'use client';

import * as React from 'react';
import { Sidebar } from './sidebar';
import { FloatingBottomNav } from './floating-bottom-nav';
import { usePathname } from 'next/navigation';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Carrega a preferência salva no carregamento
  React.useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const handleToggle = React.useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }, []);

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
