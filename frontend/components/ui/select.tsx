'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const PANEL_MAX_HEIGHT = 240;
const PANEL_GAP = 4;
const VIEWPORT_MARGIN = 8;
const OPTION_HEIGHT = 36;

interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled: boolean;
}

interface PanelPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

// Lê os <option> que o formulário passa como filhos, inclusive os dentro de fragmentos.
function collectOptions(children: React.ReactNode): SelectOption[] {
  const result: SelectOption[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === React.Fragment) {
      const inner = (child.props as { children?: React.ReactNode }).children;
      result.push(...collectOptions(inner));
      return;
    }

    if (child.type === 'option') {
      const props =
        child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
      result.push({
        value: String(props.value ?? ''),
        label: props.children,
        disabled: Boolean(props.disabled),
      });
    }
  });

  return result;
}

export interface SelectProps {
  id?: string;
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
  children: React.ReactNode;
}

export function Select({
  id,
  label,
  value,
  onValueChange,
  disabled = false,
  error,
  helperText,
  placeholder = 'Selecione...',
  className,
  children,
}: SelectProps) {
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const labelId = `${triggerId}-label`;
  const listId = `${triggerId}-list`;

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<PanelPosition | null>(null);
  const [highlighted, setHighlighted] = React.useState(0);

  const options = collectOptions(children);
  // O "Selecione..." desabilitado serve só de texto do campo: não entra na lista.
  const visibleOptions = options.filter(
    (option) => !(option.disabled && option.value === ''),
  );
  const selected = options.find((option) => option.value === value);
  const showPlaceholder = !selected || selected.disabled;

  function openPanel() {
    const trigger = triggerRef.current;
    if (!trigger || disabled || visibleOptions.length === 0) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - VIEWPORT_MARGIN;
    const wanted = Math.min(
      PANEL_MAX_HEIGHT,
      visibleOptions.length * OPTION_HEIGHT + 8,
    );
    const openUp = spaceBelow < wanted && spaceAbove > spaceBelow;

    setPosition(
      openUp
        ? {
            left: rect.left,
            width: rect.width,
            bottom: window.innerHeight - rect.top + PANEL_GAP,
            maxHeight: Math.min(PANEL_MAX_HEIGHT, spaceAbove - PANEL_GAP),
          }
        : {
            left: rect.left,
            width: rect.width,
            top: rect.bottom + PANEL_GAP,
            maxHeight: Math.min(PANEL_MAX_HEIGHT, spaceBelow - PANEL_GAP),
          },
    );

    const selectedIndex = visibleOptions.findIndex((o) => o.value === value);
    const firstEnabled = visibleOptions.findIndex((o) => !o.disabled);
    setHighlighted(
      selectedIndex >= 0 ? selectedIndex : Math.max(firstEnabled, 0),
    );
    setOpen(true);
  }

  function choose(option: SelectOption) {
    if (option.disabled) return;
    onValueChange(option.value);
    setOpen(false);
  }

  function moveHighlight(step: 1 | -1) {
    setHighlighted((current) => {
      let next = current;
      for (let i = 0; i < visibleOptions.length; i++) {
        next = (next + step + visibleOptions.length) % visibleOptions.length;
        if (!visibleOptions[next].disabled) return next;
      }
      return current;
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openPanel();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveHighlight(-1);
        break;
      case 'Home':
        event.preventDefault();
        setHighlighted(
          Math.max(
            visibleOptions.findIndex((o) => !o.disabled),
            0,
          ),
        );
        break;
      case 'End': {
        event.preventDefault();
        const last = visibleOptions.map((o) => o.disabled).lastIndexOf(false);
        setHighlighted(Math.max(last, 0));
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const option = visibleOptions[highlighted];
        if (option) choose(option);
        break;
      }
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleScroll = (event: Event) => {
      if (panelRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    // Captura: o Esc fecha só o painel, antes de chegar ao Dialog.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
      }
    };
    const handleResize = () => setOpen(false);

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${listId}-${highlighted}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, highlighted, listId]);

  return (
    <div className='w-full space-y-1.5'>
      {label && (
        <span
          id={labelId}
          className='block select-none text-xs font-medium text-muted-foreground'
        >
          {label}
        </span>
      )}

      <button
        ref={triggerRef}
        id={triggerId}
        type='button'
        role='combobox'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={label ? labelId : undefined}
        aria-invalid={error ? true : undefined}
        aria-activedescendant={open ? `${listId}-${highlighted}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius)] border border-border bg-card px-3 py-1.5 text-left text-xs text-foreground transition-colors sm:text-sm',
          'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
          'disabled:cursor-not-allowed disabled:opacity-40',
          open && 'border-primary ring-1 ring-primary/40',
          error &&
            'border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/30',
          className,
        )}
      >
        <span
          className={cn(
            'truncate',
            showPlaceholder && 'text-muted-foreground/70',
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {error && (
        <p className='mt-1 text-2xs font-medium text-destructive'>{error}</p>
      )}
      {!error && helperText && (
        <p className='mt-1 text-2xs text-muted-foreground'>{helperText}</p>
      )}

      {open &&
        position &&
        createPortal(
          <div
            ref={panelRef}
            id={listId}
            role='listbox'
            aria-labelledby={label ? labelId : undefined}
            style={{
              left: position.left,
              width: position.width,
              top: position.top,
              bottom: position.bottom,
              maxHeight: position.maxHeight,
            }}
            className='fixed z-[70] overflow-y-auto rounded-[var(--radius)] border border-border bg-card py-1 shadow-xl shadow-black/40 animate-in fade-in duration-100'
          >
            {visibleOptions.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <div
                  key={`${option.value}-${index}`}
                  id={`${listId}-${index}`}
                  role='option'
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => {
                    if (!option.disabled) setHighlighted(index);
                  }}
                  onClick={() => choose(option)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-xs sm:text-sm',
                    index === highlighted && 'bg-muted/70',
                    isSelected
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                    option.disabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <span className='truncate'>{option.label}</span>
                  {isSelected && (
                    <Check className='h-3.5 w-3.5 shrink-0 text-primary' />
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
