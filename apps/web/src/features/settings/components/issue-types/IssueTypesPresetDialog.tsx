'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Modal from '@/components/common/overlay/Modal';
import { Button } from '@/components/ui/button';
import NewProjectPreset from '@/components/layout/NewProjectPreset';
import { PRESETS, type PresetKey } from '@/utils/projectPresets';
import type { IssueType } from '@/lib/api/endpoints/issueTypes';
import { useApplyIssueTypePreset } from '../../services/settings.service';

// Applies an issue-type preset to an existing project: picks the preset, shows
// which of its types are still missing, and inserts them on confirm. Types the
// project already has are never duplicated.
export default function IssueTypesPresetDialog({
  projectKey,
  types,
  onClose,
}: {
  projectKey: string;
  types: IssueType[];
  onClose: () => void;
}) {
  const t = useTranslations('settings.issueTypes');
  const tCommon = useTranslations('common');
  const [preset, setPreset] = useState<PresetKey>('software');
  const [busy, setBusy] = useState(false);
  const applyPreset = useApplyIssueTypePreset(projectKey);

  const existing = useMemo(
    () => new Set(types.map((type) => type.name.toLowerCase())),
    [types],
  );
  const missing = useMemo(() => {
    const selected = PRESETS.find((p) => p.key === preset);
    return selected?.types.filter((type) => !existing.has(type.name.toLowerCase())) ?? [];
  }, [preset, existing]);

  async function apply() {
    setBusy(true);
    try {
      // The endpoint returns exactly the created types, which is what was
      // missing; the mutation itself is typed as unknown, so count locally.
      const createdCount = missing.length;
      await applyPreset.mutateAsync(preset);
      toast.success(t('presetApplied', { count: createdCount }));
      onClose();
    } catch {
      // The failed mutation is toasted by the global handler; keep the dialog open.
      setBusy(false);
    }
  }

  return (
    <Modal title={t('presetTitle')} onClose={onClose}>
      <div className="space-y-4">
        <NewProjectPreset value={preset} onChange={setPreset} hideDefaultNote />
        <p className="text-xs text-muted-foreground">{t('presetSummary', { count: missing.length })}</p>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={() => void apply()} disabled={busy || missing.length === 0}>
            {t('presetApply')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
