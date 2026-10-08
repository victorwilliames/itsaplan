'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const PIN_KEY = 'applano:sidebar-pinned';
const AUTO_CLOSE_MS = 60_000;

// FORK (APPLANO): auto-collapse do menu. O menu começa fechado; ao abrir sem
// estar fixado, fecha sozinho após 60s. O estado de fixado fica no localStorage.
export function useSidebarAutoCollapse() {
  const { open, setOpen, isMobile } = useSidebar();
  const [pinned, setPinnedState] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      setPinnedState(localStorage.getItem(PIN_KEY) === '1');
    } catch {
      setPinnedState(false);
    }
  }, []);

  const setPinned = useCallback((value: boolean) => {
    setPinnedState(value);
    try {
      localStorage.setItem(PIN_KEY, value ? '1' : '0');
    } catch {
      /* storage indisponível: mantém só em memória */
    }
  }, []);

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (open && !isMobile && !pinned) {
      timer.current = setTimeout(() => setOpen(false), AUTO_CLOSE_MS);
    }
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [open, isMobile, pinned, setOpen]);

  return { pinned, setPinned };
}
