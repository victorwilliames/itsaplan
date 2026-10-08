import { usePathname } from 'next/navigation';
import { useShellRoute } from '@/hooks/useShellRoute';
import { useTranslations } from 'next-intl';
import {
  Bell,
  BookOpenText,
  ChevronDown,
  Inbox,
  LayoutDashboard,
  ListTodo,
  RefreshCw,
  Settings,
  SquareKanban,
  StickyNote,
  Target,
  Users,
} from 'lucide-react';
import {
  aiAgentsPath,
  aiTeamPath,
  cyclesPath,
  dashboardsPath,
  documentsPath,
  inboxPath,
  initiativesPath,
  membersPath,
  notesPath,
  notificationsPath,
  projectPath,
  viewPath,
} from '@/utils/paths';
import { AI_AGENTS_SECTION, AI_TEAM_SECTIONS } from '@/utils/settingsSections';
import { useSettingsSectionText } from '@/hooks/useSectionLabels';
import { useSettingsNavGroups } from '@/hooks/useSettingsNavGroups';
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
// - "Ver mais" agrupa TUDO o resto (Documentos, Notas, Time de IA, Configuração);
// - rótulos em PT-BR direto no código (fork-only).
// SidebarAiTeamNav e SidebarConfigNav não são mais renderizados (ver SidebarMainNav).
export default function SidebarWorkNav({
  projectKey,
  projectId,
}: {
  projectKey: string | null;
  projectId: number | null;
}) {
  const t = useTranslations('nav');
  const sectionText = useSettingsSectionText();
  const pathname = usePathname();
  const routeSub = useShellRoute().sub;
  const { can, isMember } = usePermissions();
  const features = useProjectFeatures();
  const disabled = !projectKey;
  const { data: inboxUnread } = useInboxUnread(projectKey, projectId);
  const { data: views } = useViewsQuery(projectKey);
  const favorites = views?.filter((v) => v.favorite) ?? [];
  const { firstHref } = useSettingsNavGroups(projectKey);

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

  // "Ver mais": o resto, fora do caminho diário — documentos, notas,
  // time de IA e configuração.
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
    for (const s of AI_TEAM_SECTIONS.filter((x) => can(x.resource, 'read'))) {
      verMaisItems.push({
        key: `ai-${s.slug}`,
        href: aiTeamPath(projectKey, s.slug),
        icon: s.icon,
        label: sectionText(s.slug).label,
        active: pathname.endsWith(`/agents/${s.slug}`),
      });
    }
    if (can(AI_AGENTS_SECTION.resource, 'read')) {
      verMaisItems.push({
        key: 'ai-agents',
        href: aiAgentsPath(projectKey),
        icon: AI_AGENTS_SECTION.icon,
        label: sectionText(AI_AGENTS_SECTION.slug).label,
        active: pathname.endsWith('/agents'),
      });
    }
    if (can('members_manage', 'read')) {
      verMaisItems.push({
        key: 'members',
        href: membersPath(projectKey),
        icon: Users,
        label: t('members'),
        active: pathname.includes('/members'),
      });
    }
    if (isMember) {
      verMaisItems.push({
        key: 'notifications',
        href: notificationsPath(projectKey),
        icon: Bell,
        label: t('notifications'),
        active: pathname === notificationsPath(projectKey),
      });
    }
    if (firstHref) {
      verMaisItems.push({
        key: 'project-settings',
        href: firstHref,
        icon: Settings,
        label: t('projectSettings'),
        active: false,
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
