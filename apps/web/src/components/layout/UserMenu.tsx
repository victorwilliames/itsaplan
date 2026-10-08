'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Languages, LogOut, MessagesSquare, Moon, Sun } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { signOut, useSession } from '@/lib/auth-client';
import { ACCOUNT_SECTIONS, accountPath } from '@/utils/accountSections';
import { useAccountSectionLabel } from '@/hooks/useSectionLabels';
import { LOCALES, LOCALE_FLAGS, LOCALE_LABELS, type Locale } from '@/i18n/locales';
import { useUpdateAccountPreferences } from '@/services/preferences.service';
import Avatar from '@/components/common/Avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Signed-in user control in the header: shows the account avatar and a menu with
// the email, the role, links to preferences, connected accounts, account security
// (passkeys) and API keys, and sign out.
// Signing out clears the session and the proxy sends the browser back to
// the login page.
//
// FORK (APPLANO): o menu também abriga o Chat de IA, o idioma e o tema —
// os botões saíram do topo. (fork-only)
export default function UserMenu({
  chatActive,
  onToggleChat,
  canUseChat,
}: {
  chatActive?: boolean;
  onToggleChat?: () => void;
  canUseChat?: boolean;
}) {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tChat = useTranslations('aiChat');
  const sectionLabel = useAccountSectionLabel();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const locale = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const updatePreferences = useUpdateAccountPreferences();
  const isDark = resolvedTheme === 'dark';

  // better-auth reads the session on the client, so the server renders no user and
  // the client may already have a cached session. Render the placeholder until
  // mounted so the first client render matches the server and hydration succeeds.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || isPending) return <Skeleton className="size-7 rounded-full" />;
  if (!session) return null;

  const { user } = session;
  const role = (user as { role?: string }).role ?? 'user';
  const image = (user as { image?: string | null }).image ?? null;

  async function onSignOut() {
    await signOut();
    router.push('/login');
    router.refresh();
  }

  function onToggleTheme() {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    updatePreferences.mutate({ theme: next });
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={user.email} className="rounded-full outline-none">
              <Avatar name={user.name || user.email} image={image} className="size-7 text-[11px]" />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{user.email}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="truncate text-sm font-medium">{user.email}</span>
          <span className="text-xs text-muted-foreground capitalize">{t('role', { role })}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ACCOUNT_SECTIONS.map(({ slug, icon: Icon }) => (
          <DropdownMenuItem key={slug} asChild>
            <Link href={accountPath(slug)}>
              <Icon />
              {sectionLabel(slug)}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {/* FORK (APPLANO): Chat de IA, idioma e tema — vindos do topo. */}
        {canUseChat && onToggleChat && (
          <DropdownMenuItem onSelect={onToggleChat}>
            <MessagesSquare />
            {tChat('chatPanel')}
            {chatActive && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages />
            {tCommon('language')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {LOCALES.map((value) => (
              <DropdownMenuItem
                key={value}
                onSelect={() => updatePreferences.mutate({ locale: value })}
              >
                <span aria-hidden>{LOCALE_FLAGS[value]}</span>
                {LOCALE_LABELS[value]}
                {value === (locale as Locale) && <Check className="ml-auto size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={onToggleTheme}>
          {mounted && (isDark ? <Sun /> : <Moon />)}
          {tCommon('toggleTheme')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut />
          {tCommon('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
