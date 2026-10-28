'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePopover } from '@/components/ui/use-popover';
import { cn } from '@/lib/utils';

const STEP_MINUTES = 15;
const DEFAULT_START_INDEX = 32; // 08:00

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

const SLOTS = Array.from({ length: (24 * 60) / STEP_MINUTES }, (_, index) => {
  const minutes = index * STEP_MINUTES;
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
});

function maskTime(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length > 0 && Number(digits[0]) > 2) digits = `0${digits}`;
  digits = digits.slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isValidTime(text: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(text);
  if (!match) return false;
  return Number(match[1]) < 24 && Number(match[2]) < 60;
}

// Índice do último horário da lista que não passa de `time`.
function nearestSlotIndex(time: string): number {
  if (!isValidTime(time)) return DEFAULT_START_INDEX;
  let index = 0;
  for (let i = 0; i < SLOTS.length; i++) {
    if (SLOTS[i] <= time) index = i;
    else break;
  }
  return index;
}

export interface TimePickerProps {
  id?: string;
  label?: string;
  value: string; // HH:mm ou ""
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export function TimePicker({
  id,
  label,
  value,
  onValueChange,
  disabled = false,
  error,
  helperText,
}: TimePickerProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const shouldCenter = React.useRef(false);
  const { open, position, panelRef, openPopover, close } = usePopover(
    inputRef,
    {
      height: 240,
      minWidth: 120,
    },
  );

  // Enquanto a pessoa digita um horário incompleto ou inválido, o texto fica em "draft".
  const [draft, setDraft] = React.useState<string | null>(null);
  const [highlighted, setHighlighted] = React.useState(DEFAULT_START_INDEX);

  function openList() {
    setHighlighted(nearestSlotIndex(value));
    shouldCenter.current = true;
    openPopover();
  }

  function choose(slot: string) {
    setDraft(null);
    onValueChange(slot);
    close();
    inputRef.current?.focus();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const text = maskTime(event.target.value);
    if (text === '') {
      setDraft(null);
      onValueChange('');
      return;
    }
    if (isValidTime(text)) {
      setDraft(null);
      onValueChange(text);
    } else {
      setDraft(text);
      onValueChange('');
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Tab') {
      close();
      return;
    }

    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        openList();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((current) => Math.min(current + 1, SLOTS.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      // Escolhe o horário em vez de enviar o formulário.
      event.preventDefault();
      choose(SLOTS[highlighted]);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${highlighted}`)?.scrollIntoView({
      block: shouldCenter.current ? 'center' : 'nearest',
    });
    shouldCenter.current = false;
  }, [open, highlighted, listId]);

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
        placeholder='hh:mm'
        maxLength={5}
        role='combobox'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${highlighted}` : undefined}
        value={draft ?? value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rightElement={
          <Button
            type='button'
            variant='icon'
            size='icon'
            className='h-7 w-7'
            disabled={disabled}
            aria-label='Abrir lista de horários'
            onClick={() => (open ? close() : openList())}
            onKeyDown={(event) => {
              if (event.key === 'Tab') close();
            }}
          >
            <Clock className='h-4 w-4' />
          </Button>
        }
      />

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            id={listId}
            role='listbox'
            aria-label='Horários'
            style={{
              left: position.left,
              width: position.width,
              top: position.top,
              bottom: position.bottom,
              maxHeight: position.maxHeight,
            }}
            className='fixed z-[70] overflow-y-auto rounded-[var(--radius)] border border-border bg-card py-1 shadow-xl shadow-black/40 animate-in fade-in duration-100'
          >
            {SLOTS.map((slot, index) => {
              const isSelected = slot === value;

              return (
                <div
                  key={slot}
                  id={`${listId}-${index}`}
                  role='option'
                  aria-selected={isSelected}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => choose(slot)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 px-3 py-2 font-mono text-xs sm:text-sm',
                    index === highlighted && 'bg-muted/70',
                    isSelected
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  <span>{slot}</span>
                  {isSelected && (
                    <Check className='h-3.5 w-3.5 shrink-0 text-primary' />
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
