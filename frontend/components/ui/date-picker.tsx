'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePopover } from '@/components/ui/use-popover';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIso(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

function formatDisplay(iso: string): string {
  const parsed = parseIso(iso);
  return parsed
    ? `${pad(parsed.day)}/${pad(parsed.month + 1)}/${parsed.year}`
    : '';
}

function maskDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseDisplay(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  if (year < 1900 || year > 2100) return null;

  const date = new Date(Date.UTC(year, month, day));
  const real =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month &&
    date.getUTCDate() === day;
  return real ? toIso(year, month, day) : null;
}

// "Hoje" no fuso do estúdio, como no resto do sistema.
function todayInStudio(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function buildMonthGrid(year: number, month: number) {
  const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(Date.UTC(year, month, 1 - offset + index));
    return {
      iso: toIso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month,
    };
  });
}

function formatMonthLabel(year: number, month: number): string {
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export interface DatePickerProps {
  id?: string;
  label?: string;
  value: string; // AAAA-MM-DD ou ""
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  clearable?: boolean;
}

export function DatePicker({
  id,
  label,
  value,
  onValueChange,
  disabled = false,
  error,
  helperText,
  clearable = false,
}: DatePickerProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { open, position, panelRef, openPopover, close } = usePopover(
    inputRef,
    {
      height: 340,
      minWidth: 280,
    },
  );

  // Enquanto a pessoa digita uma data incompleta ou inválida, o texto fica em "draft".
  const [draft, setDraft] = React.useState<string | null>(null);
  const [view, setView] = React.useState({ year: 0, month: 0 });

  const parsedValue = parseIso(value);
  const todayIso = todayInStudio();

  function openCalendar() {
    const base = parsedValue ?? parseIso(todayIso);
    if (base) setView({ year: base.year, month: base.month });
    openPopover();
  }

  function shiftMonth(step: number) {
    setView((current) => {
      const date = new Date(Date.UTC(current.year, current.month + step, 1));
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
    });
  }

  function choose(iso: string) {
    setDraft(null);
    onValueChange(iso);
    close();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const text = maskDigits(event.target.value);
    if (text === '') {
      setDraft(null);
      onValueChange('');
      return;
    }
    const iso = parseDisplay(text);
    if (iso) {
      setDraft(null);
      onValueChange(iso);
    } else {
      setDraft(text);
      onValueChange('');
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Tab') close();
    if (
      event.key === 'ArrowDown' &&
      !open &&
      event.currentTarget instanceof HTMLInputElement
    ) {
      event.preventDefault();
      openCalendar();
    }
  }

  const cells = buildMonthGrid(view.year, view.month);

  return (
    <>
      <Input
        ref={inputRef}
        id={inputId}
        label={label}
        error={error}
        helperText={helperText}
        disabled={disabled}
        inputMode='numeric'
        autoComplete='off'
        placeholder='dd/mm/aaaa'
        maxLength={10}
        value={draft ?? formatDisplay(value)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rightElement={
          <Button
            type='button'
            variant='icon'
            size='icon'
            className='h-7 w-7'
            disabled={disabled}
            aria-label='Abrir calendário'
            aria-expanded={open}
            onClick={() => (open ? close() : openCalendar())}
            onKeyDown={handleKeyDown}
          >
            <CalendarDays className='h-4 w-4' />
          </Button>
        }
      />

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            role='dialog'
            aria-label='Escolher data'
            style={{
              left: position.left,
              width: position.width,
              top: position.top,
              bottom: position.bottom,
            }}
            className='fixed z-[70] rounded-[var(--radius)] border border-border bg-card p-3 shadow-xl shadow-black/40 animate-in fade-in duration-100'
          >
            <div className='mb-2 flex items-center justify-between'>
              <Button
                type='button'
                variant='icon'
                size='icon'
                className='h-7 w-7'
                aria-label='Mês anterior'
                onClick={() => shiftMonth(-1)}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-xs font-semibold text-foreground'>
                {formatMonthLabel(view.year, view.month)}
              </span>
              <Button
                type='button'
                variant='icon'
                size='icon'
                className='h-7 w-7'
                aria-label='Próximo mês'
                onClick={() => shiftMonth(1)}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>

            <div className='grid grid-cols-7 text-center text-3xs font-medium text-muted-foreground/70'>
              {WEEKDAYS.map((weekday, index) => (
                <span key={index} className='py-1'>
                  {weekday}
                </span>
              ))}
            </div>

            <div className='mt-1 grid grid-cols-7 gap-0.5'>
              {cells.map((cell) => {
                const isSelected = cell.iso === value;
                const isToday = cell.iso === todayIso;

                return (
                  <Button
                    key={cell.iso}
                    type='button'
                    variant='ghost'
                    size='icon'
                    aria-label={formatDisplay(cell.iso)}
                    aria-pressed={isSelected}
                    onClick={() => choose(cell.iso)}
                    className={cn(
                      'h-8 w-full text-xs',
                      !cell.inMonth && 'text-muted-foreground/40',
                      cell.inMonth && 'text-foreground',
                      isToday && !isSelected && 'font-semibold text-primary',
                      isSelected &&
                        'bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                    )}
                  >
                    {cell.day}
                  </Button>
                );
              })}
            </div>

            <div className='mt-2 flex items-center justify-between border-t border-border/60 pt-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => choose(todayIso)}
              >
                Hoje
              </Button>
              {clearable && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => choose('')}
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
