'use client';

import * as React from 'react';

const GAP = 4;
const MARGIN = 8;

export interface PopoverPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

export interface PopoverOptions {
  height: number;
  minWidth?: number;
}

export function usePopover(
  anchorRef: React.RefObject<HTMLElement | null>,
  { height, minWidth = 0 }: PopoverOptions,
) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<PopoverPosition | null>(null);

  const openPopover = React.useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const width = Math.max(rect.width, minWidth);
    const left = Math.max(
      MARGIN,
      Math.min(rect.left, window.innerWidth - width - MARGIN),
    );
    const spaceBelow = window.innerHeight - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;
    const openUp = spaceBelow < height && spaceAbove > spaceBelow;

    setPosition(
      openUp
        ? {
            left,
            width,
            bottom: window.innerHeight - rect.top + GAP,
            maxHeight: Math.min(height, spaceAbove - GAP),
          }
        : {
            left,
            width,
            top: rect.bottom + GAP,
            maxHeight: Math.min(height, spaceBelow - GAP),
          },
    );
    setOpen(true);
  }, [anchorRef, height, minWidth]);

  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
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
  }, [open, anchorRef]);

  return { open, position, panelRef, openPopover, close };
}
