'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { getNavItems, PROFILE_ITEM } from './nav-items';

const PRESS_CLASS = 'transition active:scale-90 motion-reduce:active:scale-100';

const BAR_ITEM_CLASS = `flex h-9 w-16 flex-col items-center justify-center rounded-full text-3xs font-medium ${PRESS_CLASS}`;

export function FloatingBottomNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const items = getNavItems(user?.role);
  const barItems = [...items.filter((item) => !item.section), PROFILE_ITEM];
  const moreItems = items.filter((item) => item.section === 'admin');
  const moreActive = moreItems.some((item) => pathname === item.href);

  React.useEffect(() => {
    if (!moreOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moreOpen]);

  return (
    <>
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          className='fixed inset-0 z-40 animate-in bg-background/60 fade-in duration-300 ease-out motion-reduce:animate-none md:hidden'
          aria-hidden='true'
        />
      )}

      <div className='pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 md:hidden'>
        {moreOpen && (
          <nav
            aria-label='Mais opções'
            className='pointer-events-auto w-full max-w-xs animate-in divide-y divide-border/60 overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-md shadow-black/20 fade-in slide-in-from-bottom-6 duration-300 ease-out motion-reduce:animate-none'
          >
            {moreItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-3 text-xs transition-colors active:bg-muted',
                    isActive
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <nav className='pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-md shadow-black/20'>
          {barItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  BAR_ITEM_CLASS,
                  isActive
                    ? 'font-semibold text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className='h-3.5 w-3.5' />
                <span className='mt-0.5'>{item.label}</span>
              </Link>
            );
          })}

          {moreItems.length > 0 && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((open) => !open)}
              className={cn(
                'h-9 w-16 flex-col gap-0 rounded-full text-3xs',
                PRESS_CLASS,
                (moreOpen || moreActive) && 'text-primary',
                moreOpen && '-translate-y-0.5 motion-reduce:translate-y-0',
              )}
            >
              <MoreHorizontal className='h-3.5 w-3.5' />
              <span className='mt-0.5'>Mais</span>
            </Button>
          )}

          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={signOut}
            className={cn(
              'h-9 w-16 flex-col gap-0 rounded-full text-3xs',
              PRESS_CLASS,
            )}
          >
            <LogOut className='h-3.5 w-3.5' />
            <span className='mt-0.5'>Sair</span>
          </Button>
        </nav>
      </div>
    </>
  );
}
