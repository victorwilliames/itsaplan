import { usePathname } from 'next/navigation';
import { useShellRoute } from '@/hooks/useShellRoute';
import { useTranslations } from 'next-intl';
import {
  BookOpenText,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  ListTodo,
  RefreshCw,
  SquareKanban,
  StickyNote,
  Target,
} from 'lucide-react';
import {
  cyclesPath,
  dashboardsPath,
  documentsPath,
  inboxPath,
  initiativesPath,
  notesPath,
  projectPath,
  viewPath,
} from '@/utils/paths';
import { usePermissions } from '@/hooks/usePermissions';
import { useProjectFeatures } from '@/hooks/useProjectFeatures';
import { useInboxUnread } from '@/hooks/useInboxUnread';
import { useViewsQuery } from '@/services/views.service';
import { viewIcon } from '@/utils/viewIcons';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import SidebarNavItem from '@/components/layout/SidebarNavItem';
import SidebarNavSubmenu, {
  type SidebarNavSubmenuItem,
} from '@/components/layout/SidebarNavSubmenu';

// The top sidebar group. An entry appears only when its project feature is on and
// the user may read the section.
//
// FORK (APPLANO): reorganizado a pedido do dono —
// - "Tarefas" agrupa o quadro, as views favoritas, Epics e Ciclos (fechado por padrão);
// - "Ver mais" agrupa Documentos e Notas;
// - rótulos em PT-BR direto no código (fork-only).
export default function SidebarWorkNav({
  projectKey,
  projectId,
}: {
  projectKey: string | null;
  projectId: number | null;
}) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const routeSub = useShellRoute().sub;
  const { can } = usePermissions();
  const features = useProjectFeatures();
  const disabled = !projectKey;
  const { data: inboxUnread } = useInboxUnread(projectKey, projectId);
  const { data: views } = useViewsQuery(projectKey);
  const favorites = views?.filter((v) => v.favorite) ?? [];

  // "Work items" is the default view: active on the project root and any segment
  // that is not one of the other top-level destinations.
  const onWorkItems =
    !!projectKey &&
    (pathname === projectPath(projectKey) ||
      pathname.startsWith(`${projectPath(projectKey)}/view`) ||
      routeSub === 'issue');

  const onInitiatives = !!projectKey && pathname.includes('/initiatives');
  const onCycles = !!projectKey && pathname.includes('/cycles');
  const showInitiatives = features.initiatives && can('initiatives', 'read');
  const showCycles = features.cycles && can('cycles', 'read');

  // "Tarefas": o quadro, as favoritas, e os agrupamentos (Epics, Ciclos).
  const tarefasItems: SidebarNavSubmenuItem[] = [];
  if (projectKey) {
    tarefasItems.push({
      key: 'all',
      href: projectPath(projectKey),
      icon: SquareKanban,
      label: 'Todas as tarefas',
      active: onWorkItems && !favorites.some((v) => pathname === viewPath(projectKey, v.id)),
    });
    for (const v of favorites) {
      tarefasItems.push({
        key: String(v.id),
        href: viewPath(projectKey, v.id),
        icon: viewIcon(v.icon),
        label: v.name,
        active: pathname === viewPath(projectKey, v.id),
      });
    }
    if (showInitiatives) {
      tarefasItems.push({
        key: 'epics',
        href: initiativesPath(projectKey),
        icon: Target,
        label: 'Epics (SubProjetos)',
        active: onInitiatives,
      });
    }
    if (showCycles) {
      tarefasItems.push({
        key: 'cycles',
        href: cyclesPath(projectKey),
        icon: RefreshCw,
        label: 'Ciclos (Sprints)',
        active: onCycles,
      });
    }
  }

  // "Ver mais": o resto, fora do caminho diário.
  const verMaisItems: SidebarNavSubmenuItem[] = [];
  if (projectKey) {
    if (features.documents && can('documents', 'read')) {
      verMaisItems.push({
        key: 'documents',
        href: documentsPath(projectKey),
        icon: BookOpenText,
        label: t('documents'),
        active: pathname.includes('/docs'),
      });
    }
    if (features.notes && can('note_boards', 'read')) {
      verMaisItems.push({
        key: 'notes',
        href: notesPath(projectKey),
        icon: StickyNote,
        label: t('notes'),
        active: pathname.includes('/notes'),
      });
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarNavItem
            href={projectKey ? inboxPath(projectKey) : '#'}
            icon={Inbox}
            label={t('inbox')}
            active={pathname.endsWith('/inbox')}
            disabled={disabled}
            badge={inboxUnread}
          />
          {features.dashboards && can('dashboards', 'read') && (
            <SidebarNavItem
              href={projectKey ? dashboardsPath(projectKey) : '#'}
              icon={LayoutDashboard}
              label={t('dashboards')}
              active={pathname.includes('/dashboard')}
              disabled={disabled}
            />
          )}
          {!disabled && tarefasItems.length > 0 && (
            <SidebarNavSubmenu
              icon={ListTodo}
              label="Tarefas"
              items={tarefasItems}
              defaultOpen={false}
            />
          )}
          {verMaisItems.length > 0 && (
            <>
              <SidebarSeparator />
              <SidebarNavSubmenu
                icon={ChevronDown}
                label="Ver mais"
                items={verMaisItems}
                defaultOpen={false}
              />
            </>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
