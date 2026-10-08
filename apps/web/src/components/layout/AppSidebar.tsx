'use client';

import type { Project } from '@/lib/api/endpoints/projects';
import { useSettingsNavGroups } from '@/hooks/useSettingsNavGroups';
import { useSidebarSide } from '@/hooks/useSidebarSide';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import ProjectSwitcher from '@/components/layout/ProjectSwitcher';
import SidebarMainNav from '@/components/layout/SidebarMainNav';
import SidebarSettingsNav from '@/components/layout/SidebarSettingsNav';
import SidebarBrandFooter from '@/components/brand/SidebarBrandFooter';
import SidebarPinControl from '@/components/layout/SidebarPinControl';

// The app sidebar. It has two modes driven by the route: the main work
// navigation, and the project settings navigation reached through the "Project
// settings" entry. The project switcher header and the footer (brand mark) are
// shared by both modes. Creating and deleting a project live in the team panel
// on Manage teams, not here.
// FORK (APPLANO): Docs da API, Servidor MCP e Modo god saíram do rodapé e
// agora vivem dentro do "Ver mais" (SidebarWorkNav).
export default function AppSidebar({
  projects,
  currentProjectKey,
  onSelectProject,
}: {
  projects: Project[];
  currentProjectKey: string | null;
  onSelectProject: (key: string) => void;
}) {
  const projectId = projects.find((p) => p.ref === currentProjectKey)?.id ?? null;

  // Settings mode is on whenever the route matches one of the settings nav items.
  // Members and the AI Team pages are not in those groups, so they keep the main
  // sidebar.
  const settingsNav = useSettingsNavGroups(currentProjectKey);
  const settingsMode = settingsNav.groups.some((g) => g.items.some((i) => i.active));
  const side = useSidebarSide();

  return (
    <Sidebar collapsible="icon" side={side}>
      <SidebarHeader>
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <ProjectSwitcher
              projects={projects}
              currentProjectKey={currentProjectKey}
              onSelectProject={onSelectProject}
            />
          </div>
          {/* FORK (APPLANO): fixar/soltar o menu (auto-fecha em 60s). */}
          <SidebarPinControl />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {settingsMode ? (
          <SidebarSettingsNav projectKey={currentProjectKey} />
        ) : (
          <SidebarMainNav projectKey={currentProjectKey} projectId={projectId} />
        )}
      </SidebarContent>

      <SidebarFooter>
        {/* FORK (APPLANO): Docs da API, Servidor MCP e Modo god agora vivem
            dentro do "Ver mais" (SidebarWorkNav) — rodapé só com a marca. */}
        <SidebarBrandFooter />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
