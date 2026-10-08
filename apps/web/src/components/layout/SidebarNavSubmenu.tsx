'use client';

import type { LucideIcon } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import SidebarNavSubmenuCollapsible from '@/components/layout/SidebarNavSubmenuCollapsible';
import SidebarNavSubmenuMenu from '@/components/layout/SidebarNavSubmenuMenu';

export type SidebarNavSubmenuItem = {
  key: string;
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  // FORK (APPLANO): grupo opcional para categorizar os itens dentro do submenu.
  group?: string;
};

// A sidebar item holding a sub-list of links. Collapsed to icons there is no room
// for a sub-list, so it becomes a dropdown; the mobile sidebar is a sheet at full
// width, never icon-sized.
export default function SidebarNavSubmenu({
  icon,
  label,
  items,
  defaultOpen,
  openLabel,
  openIcon,
}: {
  icon: LucideIcon;
  label: string;
  items: SidebarNavSubmenuItem[];
  // FORK (APPLANO): permite forçar o grupo a começar fechado.
  defaultOpen?: boolean;
  // FORK (APPLANO): rótulo e ícone alternativos quando expandido.
  openLabel?: string;
  openIcon?: LucideIcon;
}) {
  const { state, isMobile } = useSidebar();

  if (state === 'collapsed' && !isMobile)
    return <SidebarNavSubmenuMenu icon={icon} label={label} items={items} />;

  return (
    <SidebarNavSubmenuCollapsible
      icon={icon}
      label={label}
      items={items}
      defaultOpen={defaultOpen}
      openLabel={openLabel}
      openIcon={openIcon}
    />
  );
}
