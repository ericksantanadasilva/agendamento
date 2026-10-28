'use client';

import * as React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from './utils';

type ToastVariant = 'success' | 'error';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const DURATION_MS: Record<ToastVariant, number> = {
  success: 4000,
  error: 6000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const nextId = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = React.useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), DURATION_MS[variant]);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className='pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-2 sm:left-auto sm:w-96'>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-3 rounded-[var(--radius)] border bg-surface-elevated p-3 text-xs text-foreground shadow-md animate-in fade-in slide-in-from-top-1',
              toast.variant === 'error'
                ? 'border-destructive/40'
                : 'border-primary/40',
            )}
          >
            <div className='flex items-center gap-2'>
              {toast.variant === 'error' ? (
                <AlertCircle className='h-4 w-4 shrink-0 text-destructive' />
              ) : (
                <CheckCircle2 className='h-4 w-4 shrink-0 text-primary' />
              )}
              <span className='font-medium'>{toast.message}</span>
            </div>
            <Button
              type='button'
              variant='icon'
              size='icon'
              className='h-6 w-6'
              onClick={() => dismiss(toast.id)}
              aria-label='Fechar aviso'
            >
              <X className='h-3.5 w-3.5' />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast precisa ser usado dentro do ToastProvider');
  }
  return context;
}
