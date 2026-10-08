import { useEffect, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { toast } from 'sonner';
import { ChevronDown, Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  buildGroups,
  buildMaps,
  groupDefaults,
  groupIssues,
  positionsAt,
  sortIssues,
  type WorkItemsViewProps,
  type IssueGroup,
} from '@/utils/project';
import { isActiveFilterSet } from '@/utils/filters';
import { useBoardDnd } from '../../hooks/useBoardDnd';
import { useSortedOrderMessage } from '../../hooks/useSortedOrderMessage';
import { useWipLimitMessage } from '../../hooks/useWipLimitMessage';
import { countEntering, wipAllows, wipStateFor } from '../../utils/wipLimit';
import { useGroupLabels } from '@/hooks/useGroupLabels';
import { useSelection } from '../../context/useSelection';
import { boardCollision, issuesToMove } from '../../utils/kanban';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { GroupDot } from '../shared/GroupDot';
import { CardOverlay } from './CardOverlay';
import { BoardColumn } from './BoardColumn';
import { CollapsedColumn } from './CollapsedColumn';
import { WipCount } from './WipCount';

// Flat board: one vertically-virtualized column per group, in a horizontal row. A
// trailing "Hidden" panel holds the columns that the user hid.
export default function FlatBoard({
  project,
  filters,
  columnCounts,
  settings,
  onSettingsChange,
  onOpenIssue,
  onAddIssue,
  readOnly,
}: WorkItemsViewProps) {
  const t = useTranslations('workItems');
  const groupLabels = useGroupLabels();
  const sortedOrderMessage = useSortedOrderMessage();
  const wipLimitMessage = useWipLimitMessage();
  const dnd = useBoardDnd(project, readOnly);
  const selection = useSelection();
  const filtered = isActiveFilterSet(filters);

  // Hidden columns are stored in the view's display (settings.hiddenGroups). A
  // toggle writes through onSettingsChange. On a saved view that is a display edit,
  // applied on Save. On the All tab it reaches localStorage at once.
  const hiddenSet = new Set(settings.hiddenGroups);
  const setHidden = (key: string, hide: boolean) =>
    onSettingsChange({
      ...settings,
      hiddenGroups: hide
        ? [...settings.hiddenGroups, key]
        : settings.hiddenGroups.filter((k) => k !== key),
      // A hidden column is off the board, so it cannot stay pinned.
      pinnedGroup: hide && settings.pinnedGroup === key ? null : settings.pinnedGroup,
    });

  // Collapsed columns keep their position as a narrow strip. The state is stored in
  // the view's display (settings.collapsedGroups) and persists the same way as
  // hiddenGroups.
  const collapsedSet = new Set(settings.collapsedGroups);
  // FORK (APPLANO): empty columns the user explicitly expanded stay open.
  const [expandedEmpty, setExpandedEmpty] = useState<Set<string>>(new Set());
  const setCollapsed = (key: string, collapse: boolean) => {
    // FORK (APPLANO): expanding an empty column tracks it locally so the
    // auto-collapse does not immediately close it again.
    if (!collapse) {
      setExpandedEmpty((prev) => new Set(prev).add(key));
    } else {
      setExpandedEmpty((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
    onSettingsChange({
      ...settings,
      collapsedGroups: collapse
        ? [...settings.collapsedGroups, key]
        : settings.collapsedGroups.filter((k) => k !== key),
    });
  };

  const groups = buildGroups(project, settings.group, groupLabels, filters);
  const sorted = sortIssues(project.issues, settings.sort, project);
  const issuesByGroup = groupIssues(groups, sorted, settings.group);
  const maps = buildMaps(project);

  // FORK (APPLANO): empty columns collapse on their own; a column that
  // receives cards expands on its own. Manual collapse/expand always wins:
  // expanding an empty column is tracked locally so it stays open.
  const groupCount = (key: string) => issuesByGroup.get(key)?.length ?? 0;
  const isCollapsed = (key: string) =>
    (collapsedSet.has(key) || groupCount(key) === 0) && !expandedEmpty.has(key);

  useEffect(() => {
    // Auto-expand manually-collapsed columns that received cards.
    const gotCards = settings.collapsedGroups.filter((k) => groupCount(k) > 0);
    if (gotCards.length > 0) {
      onSettingsChange({
        ...settings,
        collapsedGroups: settings.collapsedGroups.filter((k) => groupCount(k) === 0),
      });
    }
    // Drop the local override for columns that now have cards.
    setExpandedEmpty((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const k of prev) {
        if (groupCount(k) > 0) {
          next.delete(k);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // issuesByGroup identity changes every render; the length checks above keep
    // this from writing on every pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // Empty groups are removed when "Show empty columns" is off. A manual hide moves
  // any of the remaining groups into the "Hidden" panel.
  const baseGroups = settings.showEmptyGroups
    ? groups
    : groups.filter((g) => (issuesByGroup.get(g.key)?.length ?? 0) > 0);
  const visibleGroups = baseGroups.filter((g) => !hiddenSet.has(g.key));
  const hiddenGroups = baseGroups.filter((g) => hiddenSet.has(g.key));

  // The pinned column renders first. A key that names no group on the board
  // (another grouping field, a since-deleted column) pins nothing.
  const pinnedGroup = visibleGroups.find((g) => g.key === settings.pinnedGroup) ?? null;
  const orderedGroups = pinnedGroup
    ? [pinnedGroup, ...visibleGroups.filter((g) => g !== pinnedGroup)]
    : visibleGroups;

  // A reorder inside a column only holds when the view is ordered manually. With
  // any other sort field, the card returns to the position that the sort gives it.
  // The board then skips cards that are already in the target column. A drop with
  // no card left to move is refused, and the reason is shown. A card from another
  // column is still moved, because that changes the grouping field, not the order.
  const manualOrder = settings.sort.field === 'manual';

  const wipOf = (group: IssueGroup) => wipStateFor(group, project.columns, columnCounts);

  function moveIssue(issueIds: number[], group: IssueGroup, index: number) {
    const assign = group.assign;
    if (!assign) return;
    const target = issuesByGroup.get(group.key) ?? [];
    const ids = issuesToMove(issueIds, sorted, target, manualOrder);
    if (ids.length === 0) {
      toast.info(sortedOrderMessage(settings.sort.field));
      return;
    }
    // The board refuses the move instead of the server, because the move is
    // optimistic. The card would otherwise appear in the column and then return to
    // its old column.
    const wip = wipOf(group);
    if (wip && !wipAllows(wip, countEntering(ids, sorted, group))) {
      toast.info(wipLimitMessage(group.name, wip.limit));
      return;
    }
    const positions = positionsAt(target, index, ids.length);
    ids.forEach((id, n) => dnd.move(id, assign, positions[n]));
  }

  function addIssueTo(group: IssueGroup) {
    onAddIssue(groupDefaults(group.assign));
  }

  return (
    <DndContext
      sensors={dnd.sensors}
      collisionDetection={boardCollision}
      onDragStart={dnd.onDragStart}
      onDragCancel={dnd.onDragCancel}
      onDragEnd={dnd.onDragEnd}
    >
      <div
        className="flex h-full gap-3 overflow-x-auto p-4"
        onClick={() => selection.isSelecting && selection.clear()}
      >
        {orderedGroups.map((group) =>
          isCollapsed(group.key) ? (
            <CollapsedColumn
              key={group.key}
              group={group}
              count={issuesByGroup.get(group.key)?.length ?? 0}
              wip={wipOf(group)}
              pinned={group === pinnedGroup}
              onExpand={() => setCollapsed(group.key, false)}
              onAddIssue={() => addIssueTo(group)}
              readOnly={readOnly}
            />
          ) : (
            <BoardColumn
              key={group.key}
              project={project}
              group={group}
              issues={issuesByGroup.get(group.key) ?? []}
              maps={maps}
              properties={settings.properties}
              manualOrder={manualOrder}
              wip={wipOf(group)}
              filtered={filtered}
              boardIssues={sorted}
              onMoveIssue={moveIssue}
              onOpenIssue={onOpenIssue}
              onAddIssue={() => addIssueTo(group)}
              onCollapse={() => setCollapsed(group.key, true)}
              pinned={group === pinnedGroup}
              readOnly={readOnly}
            />
          ),
        )}

        {hiddenGroups.length > 0 && (
          <div className="ml-auto w-64 shrink-0 self-start rounded-md border p-2">
            <div className="flex w-full items-center gap-1.5 px-1 py-1 text-sm font-medium text-muted-foreground">
              <ChevronDown className="size-4" />
              {settings.group === 'status' ? t('hiddenColumns') : t('hiddenGroups')}
            </div>
            <div className="mt-1 flex flex-col gap-1">
              {hiddenGroups.map((group) => (
                <div
                  key={group.key}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent/40"
                >
                  <div className="flex items-center gap-2 text-foreground">
                    <GroupDot group={group} />
                    {group.name}
                    <WipCount
                      filteredCount={issuesByGroup.get(group.key)?.length ?? 0}
                      wip={wipOf(group)}
                      filtered={filtered}
                    />
                  </div>
                  {!readOnly && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground"
                          onClick={() => setHidden(group.key, false)}
                          aria-label={t('show')}
                        >
                          <Eye />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('show')}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CardOverlay
        activeId={dnd.activeId}
        count={dnd.activeCount}
        issues={project.issues}
        maps={maps}
        properties={settings.properties}
      />
    </DndContext>
  );
}
