'use client';

import { Pin, PinOff } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useSidebarAutoCollapse } from '@/hooks/useSidebarAutoCollapse';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// FORK (APPLANO): botão de fixar o menu + o temporizador de 60s para fechar
// sozinho quando não fixado. Só aparece com o menu aberto.
export default function SidebarPinControl() {
  const { state } = useSidebar();
  const { pinned, setPinned } = useSidebarAutoCollapse();

  if (state !== 'expanded') return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={pinned ? 'Soltar menu' : 'Fixar menu'}
          aria-pressed={pinned}
          onClick={() => setPinned(!pinned)}
        >
          {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{pinned ? 'Soltar menu' : 'Fixar menu'}</TooltipContent>
    </Tooltip>
  );
}
