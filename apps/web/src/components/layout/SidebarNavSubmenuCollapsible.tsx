import { Fragment, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { SidebarNavSubmenuItem } from '@/components/layout/SidebarNavSubmenu';

// The expanded form of SidebarNavSubmenu. It starts open when the current page is
// one of its items, so a reload keeps the sub-list visible — unless defaultOpen
// is given, which forces the initial state.
export default function SidebarNavSubmenuCollapsible({
  icon: Icon,
  label,
  items,
  defaultOpen,
  openLabel,
  openIcon,
}: {
  icon: LucideIcon;
  label: string;
  items: SidebarNavSubmenuItem[];
  defaultOpen?: boolean;
  // FORK (APPLANO): rótulo e ícone alternativos quando expandido.
  openLabel?: string;
  openIcon?: LucideIcon;
}) {
  // FORK (APPLANO): estado controlado para trocar rótulo/ícone quando abre.
  const [open, setOpen] = useState(defaultOpen ?? items.some((i) => i.active));
  const OpenIcon = openIcon ?? Icon;
  const shownLabel = open && openLabel ? openLabel : label;
  const ShownIcon = open && openIcon ? OpenIcon : Icon;
  return (
    <Collapsible asChild open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={items.some((i) => i.active)}>
            <ShownIcon />
            <span>{shownLabel}</span>
            {/* FORK (APPLANO): fechado aponta pra baixo, aberto aponta pra cima. */}
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item, idx) => {
              // FORK (APPLANO): mostra o cabeçalho do grupo quando ele muda,
              // com mais respiro entre categorias.
              const showGroup = item.group && (idx === 0 || items[idx - 1]?.group !== item.group);
              return (
                <Fragment key={item.key}>
                  {showGroup && (
                    <li className="px-2 pt-4 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      {item.group}
                    </li>
                  )}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={item.active}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </Fragment>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
