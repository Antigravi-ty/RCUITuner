import React from 'react';
import type {
  PresetConfig,
  FloatingWindowVisibilityTier,
} from '../../../ui-core/stores/floatingPresets';
import { AuditTicketHeader } from '../../components/AuditTicketHeader';

export interface FloatingWindowsAuditSectionProps {
  isLight: boolean;
  tier: FloatingWindowVisibilityTier;
  fwMode: 'inspector' | 'matrix' | 'stack';
  currentIndex: number;
  currentPreset: PresetConfig | undefined;
  activeSubTab: string;
}

export const FloatingWindowsAuditSection: React.FC<FloatingWindowsAuditSectionProps> = ({
  isLight,
  tier,
  fwMode,
  currentIndex,
  currentPreset,
  activeSubTab,
}) => {
  if (fwMode === 'matrix' || !currentPreset) return null;
  return (
        <div
          className={`px-3.5 py-2.5 rounded-xl border ${
            isLight
              ? 'bg-white border-neutral-200 shadow-2xs'
              : 'bg-neutral-900/80 border-neutral-800'
          }`}
        >
          <AuditTicketHeader
            index={currentIndex + 1}
            label={
              currentPreset.tabs && currentPreset.tabs.length > 0
                ? `${currentPreset.title} · [${activeSubTab || currentPreset.tabs[0].id}]`
                : currentPreset.title
            }
            description={currentPreset.summary}
            referenceCode={`6D.${tier === 'user' ? 'U' : 'D'}${currentIndex + 1}`}
            componentName={currentPreset.component || currentPreset.id}
            sourceFile={
              currentPreset.sourcePath ||
              `src/ui-core/panels/${tier === 'user' ? 'user' : 'dev'}/${
                currentPreset.component || currentPreset.id
              }.tsx`
            }
            stateId={
              currentPreset.tabs && currentPreset.tabs.length > 0
                ? `${currentPreset.id}:${activeSubTab || currentPreset.tabs[0].id}`
                : `${currentPreset.id}:default`
            }
            activeProps={{
              windowId: currentPreset.id,
              tier,
              ...(currentPreset.tabs && currentPreset.tabs.length > 0
                ? { activeTab: activeSubTab || currentPreset.tabs[0].id }
                : {}),
            }}
            badgeColor={tier === 'user' ? 'emerald' : 'amber'}
            tunerStatus="direct-store"
            isLight={isLight}
          />
        </div>
  );
};
