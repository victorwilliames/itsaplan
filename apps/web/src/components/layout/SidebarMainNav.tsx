import SidebarWorkNav from '@/components/layout/SidebarWorkNav';

// The main sidebar body: the work navigation only.
// FORK (APPLANO): SidebarAiTeamNav e SidebarConfigNav foram absorvidos pelo
// "Ver mais" dentro de SidebarWorkNav — o menu fica limpo.
export default function SidebarMainNav({
  projectKey,
  projectId,
}: {
  projectKey: string | null;
  projectId: number | null;
}) {
  return <SidebarWorkNav projectKey={projectKey} projectId={projectId} />;
}
