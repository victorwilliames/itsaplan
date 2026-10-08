import type { ReactNode } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePermissions } from '@/hooks/usePermissions';
import { useHotkeyLabel } from '@/context/useHotkeys';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import UserMenu from '@/components/layout/UserMenu';

// The slim header inside the sidebar inset, shared by the project view and the
// settings pages.
//
// FORK (APPLANO): os botões de Chat IA, idioma e tema saíram do topo e foram
// para dentro do menu do perfil (UserMenu). Só o "+" ficou. (fork-only)
export default function AppHeader({
  title,
  hasProject,
  onOpenCommand,
  onNewIssue,
  chatActive,
  onToggleChat,
}: {
  title: ReactNode;
  hasProject: boolean;
  onOpenCommand: () => void;
  onNewIssue: () => void;
  chatActive: boolean;
  onToggleChat: () => void;
}) {
  const t = useTranslations('nav');
  const { can } = usePermissions();
  const paletteKey = useHotkeyLabel('palette.toggle');
  const newIssueKey = useHotkeyLabel('issue.new');
  const canCreateIssue = hasProject && can('work_items', 'create');
  const canUseChat = hasProject && can('ai_agents', 'read');
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="me-1 h-4" />
        <div className="min-w-0 truncate text-sm font-medium">{title}</div>
      </div>

      {/* FORK (APPLANO): centered, subtle, no shortcut badge. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onOpenCommand}
            aria-label={t('searchHint', { key: paletteKey ?? '' })}
            className="flex h-8 shrink-0 items-center justify-center gap-2 rounded-md border border-transparent bg-muted/40 px-3 text-sm text-muted-foreground/50 transition-colors hover:bg-accent hover:text-muted-foreground"
          >
            <Search className="size-4 shrink-0" />
            <span className="hidden truncate sm:inline">{t('search')}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>{t('searchHint', { key: paletteKey ?? '' })}</TooltipContent>
      </Tooltip>

      <div className="flex flex-1 items-center justify-end gap-2">
        {canCreateIssue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0"
                aria-label={t('newIssueHint', { key: newIssueKey ?? '' })}
                onClick={onNewIssue}
              >
                <Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('newIssueHint', { key: newIssueKey ?? '' })}</TooltipContent>
          </Tooltip>
        )}

        <UserMenu chatActive={chatActive} onToggleChat={onToggleChat} canUseChat={canUseChat} />
      </div>
    </header>
  );
}
