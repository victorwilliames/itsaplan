import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useShellRoute } from '@/hooks/useShellRoute';
import { useTranslations } from 'next-intl';
import {
  Bell,
  BookOpenText,
  Braces,
  Inbox,
  LayoutDashboard,
  Minus,
  Plus,
  RefreshCw,
  Server,
  Settings,
  Shield,
  SquareKanban,
  StickyNote,
  Target,
  Users,
} from 'lucide-react';
import {
  aiAgentsPath,
  aiTeamPath,
  apiDocsPath,
  cyclesPath,
  dashboardsPath,
  documentsPath,
  godPath,
  inboxPath,
  initiativesPath,
  mcpServerPath,
  membersPath,
  notesPath,
  notificationsPath,
  projectPath,
  viewPath,
} from '@/utils/paths';
import { AI_AGENTS_SECTION, AI_TEAM_SECTIONS } from '@/utils/settingsSections';
import { GOD_SECTIONS } from '@/utils/godSections';
import { useSettingsSectionText } from '@/hooks/useSectionLabels';
import { useSettingsNavGroups } from '@/hooks/useSettingsNavGroups';
import { usePermissions } from '@/hooks/usePermissions';
import { useProjectFeatures } from '@/hooks/useProjectFeatures';
import { useInboxUnread } from '@/hooks/useInboxUnread';
import { useViewsQuery } from '@/services/views.service';
import { useSession } from '@/lib/auth-client';
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
// FORK (APPLANO): reorganizado a pedido do dono — menu limpo com Quadro e views
// direto; "Ver mais" (grudado embaixo) agrupa TODO o resto (Epics, Ciclos,
// Documentos, Notas, Time de IA, Configuração, Docs da API, Servidor MCP, Modo god).
// Rótulos em PT-BR direto no código (fork-only).
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
  const { data: session } = useSession();
  // FORK (APPLANO): mesmo padrão do AppSidebar — ler a sessão só após o mount
  // para não quebrar a hidratação.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isGod = mounted && session?.user.role === 'god';

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

  // Tarefas: o quadro e as favoritas, direto no menu (sem colapso).
  // FORK (APPLANO): Epics e Ciclos foram para o "Ver mais".
  const tarefasItems: SidebarNavSubmenuItem[] = [];
  if (projectKey) {
    tarefasItems.push({
      key: 'all',
      href: projectPath(projectKey),
      icon: SquareKanban,
      label: 'Tarefas',
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
  }

  // "Ver mais": o resto, fora do caminho diário — com as categorias de antes.
  const verMaisItems: SidebarNavSubmenuItem[] = [];
  if (projectKey) {
    if (showInitiatives) {
      verMaisItems.push({
        key: 'epics',
        href: initiativesPath(projectKey),
        icon: Target,
        label: 'Epics (SubProjetos)',
        active: onInitiatives,
      });
    }
    if (showCycles) {
      verMaisItems.push({
        key: 'cycles',
        href: cyclesPath(projectKey),
        icon: RefreshCw,
        label: 'Ciclos (Sprints)',
        active: onCycles,
      });
    }
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
        group: t('aiTeam'),
      });
    }
    if (can(AI_AGENTS_SECTION.resource, 'read')) {
      verMaisItems.push({
        key: 'ai-agents',
        href: aiAgentsPath(projectKey),
        icon: AI_AGENTS_SECTION.icon,
        label: sectionText(AI_AGENTS_SECTION.slug).label,
        active: pathname.endsWith('/agents'),
        group: t('aiTeam'),
      });
    }
    if (can('members_manage', 'read')) {
      verMaisItems.push({
        key: 'members',
        href: membersPath(projectKey),
        icon: Users,
        label: t('members'),
        active: pathname.includes('/members'),
        group: t('configuration'),
      });
    }
    if (isMember) {
      verMaisItems.push({
        key: 'notifications',
        href: notificationsPath(projectKey),
        icon: Bell,
        label: t('notifications'),
        active: pathname === notificationsPath(projectKey),
        group: t('configuration'),
      });
    }
    if (firstHref) {
      verMaisItems.push({
        key: 'project-settings',
        href: firstHref,
        icon: Settings,
        // FORK (APPLANO): rótulo curto em PT-BR (fork-only).
        label: 'Config Projeto',
        active: false,
        group: t('configuration'),
      });
    }
    // FORK (APPLANO): Docs da API, Servidor MCP e Modo god saíram do rodapé
    // e vieram para dentro do "Ver mais".
    verMaisItems.push({
      key: 'api-docs',
      href: projectKey ? apiDocsPath(projectKey) : '#',
      icon: Braces,
      label: t('apiDocs'),
      active: pathname.endsWith('/api'),
    });
    verMaisItems.push({
      key: 'mcp-server',
      href: projectKey ? mcpServerPath(projectKey) : '#',
      icon: Server,
      label: t('mcpServer'),
      active: pathname.endsWith('/mcp'),
    });
    if (isGod) {
      verMaisItems.push({
        key: 'god-mode',
        href: godPath(GOD_SECTIONS[0]!.slug),
        icon: Shield,
        label: t('godMode'),
        active: false,
      });
    }
  }

  return (
    <>
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
            {!disabled &&
              tarefasItems.map((item) => (
                <SidebarNavItem
                  key={item.key}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={item.active}
                  disabled={disabled}
                />
              ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {verMaisItems.length > 0 && (
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {/* FORK (APPLANO): separador acima do "Ver mais". */}
              <SidebarSeparator className="mb-1" />
              <SidebarNavSubmenu
                icon={Plus}
                label="Ver mais"
                // FORK (APPLANO): quando expandido vira "Ver menos".
                openLabel="Ver menos"
                openIcon={Minus}
                items={verMaisItems}
                defaultOpen={false}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}
