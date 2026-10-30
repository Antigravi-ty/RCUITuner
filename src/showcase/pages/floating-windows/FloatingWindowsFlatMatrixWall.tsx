import React, { useState } from 'react';
import { LayoutGrid, Layers, Terminal, User } from 'lucide-react';
import { Badge } from '../../../ui-core/primitives/Badge';
import { AuditTicketHeader } from '../../components/AuditTicketHeader';
import {
  USER_PRESET_WINDOWS,
  DEV_PRESET_WINDOWS,
  type PresetConfig,
  type FloatingWindowVisibilityTier,
} from '../../../ui-core/stores/floatingPresets';
import { renderFloatingWindowPanel } from '../../../ui-core/panels/floatingWindowRegistry';

export interface FloatingWindowsFlatMatrixWallProps {
  isLight: boolean;
  tier: FloatingWindowVisibilityTier;
  selectedPreset?: PresetConfig;
}

interface FlatMatrixCardSpec {
  key: string;
  preset: PresetConfig;
  tabId?: string;
  tabLabel?: string;
  referenceCode: string;
  componentName: string;
  sourceFile: string;
  stateId: string;
  activeProps: Record<string, unknown>;
}

function buildCardsForPreset(
  preset: PresetConfig,
  windowIdx: number,
  tierPrefix: string
): FlatMatrixCardSpec[] {
  const baseCode = `6D.${tierPrefix}${windowIdx + 1}`;
  const compName = preset.component || preset.id;
  const srcFile =
    preset.sourcePath ||
    `src/ui-core/panels/${preset.tier === 'user' ? 'user' : 'dev'}/${compName}.tsx`;

  if (preset.tabs && preset.tabs.length > 0) {
    return preset.tabs.map((tab, tIdx) => ({
      key: `${preset.id}:${tab.id}`,
      preset,
      tabId: tab.id,
      tabLabel: tab.label,
      referenceCode: `${baseCode}.${tIdx + 1}`,
      componentName: compName,
      sourceFile: srcFile,
      stateId: `${preset.id}:${tab.id}`,
      activeProps: { activeTab: tab.id },
    }));
  }

  return [
    {
      key: `${preset.id}:default`,
      preset,
      referenceCode: baseCode,
      componentName: compName,
      sourceFile: srcFile,
      stateId: `${preset.id}:default`,
      activeProps: {},
    },
  ];
}

/**
 * Flat Matrix Audit Wall for 6D Floating Windows.
 * Supports either:
 * 1) Active Window All-Tabs Matrix (renders all tabs of the currently selected window side by side)
 * 2) Full Tier Matrix Wall (renders all windows + all sub-tabs in the active tier on a single page)
 */
export const FloatingWindowsFlatMatrixWall: React.FC<FloatingWindowsFlatMatrixWallProps> =
  React.memo(({ isLight, tier, selectedPreset }) => {
    const [scope, setScope] = useState<'selected' | 'all-tier'>('selected');

    const tierList = tier === 'user' ? USER_PRESET_WINDOWS : DEV_PRESET_WINDOWS;
    const tierPrefix = tier === 'user' ? 'U' : 'D';

    const cards: FlatMatrixCardSpec[] = React.useMemo(() => {
      if (scope === 'selected' && selectedPreset) {
        const idx = Math.max(
          0,
          tierList.findIndex((p) => p.id === selectedPreset.id)
        );
        return buildCardsForPreset(selectedPreset, idx, tierPrefix);
      }
      return tierList.flatMap((preset, idx) =>
        buildCardsForPreset(preset, idx, tierPrefix)
      );
    }, [scope, selectedPreset, tierList, tierPrefix]);

    const shellCardClass = isLight
      ? 'bg-white border-neutral-300 text-neutral-900 shadow-sm'
      : 'bg-neutral-900/95 border-neutral-800 text-neutral-100 shadow-md';

    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Matrix Wall Scope Control Bar */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
            isLight
              ? 'bg-amber-50/50 border-amber-200/80'
              : 'bg-neutral-900/80 border-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={tier === 'user' ? 'success' : 'warning'}
              size="sm"
              isLight={isLight}
            >
              {tier === 'user' ? 'USER TIER' : 'DEVELOPER TIER'}
            </Badge>
            <span className="text-xs font-bold">
              Flat Matrix Audit Wall ({cards.length} Visual State Cards)
            </span>
            <span
              className={`text-[11px] font-mono ${
                isLight ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              Every card renders its controlled tab state independently with one-click Audit Ticket export.
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-white/80 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              type="button"
              onClick={() => setScope('selected')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                scope === 'selected'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>
                Selected Window ({selectedPreset?.tabs?.length || 1} Tabs)
              </span>
            </button>
            <button
              type="button"
              onClick={() => setScope('all-tier')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                scope === 'all-tier'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>
                All {tier === 'user' ? 'User (6)' : 'Developer (19)'} Windows &amp; Tabs
              </span>
            </button>
          </div>
        </div>

        {/* Flat Matrix Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
          {cards.map((card, idx) => (
            <div
              key={card.key}
              className={`p-4 rounded-2xl border flex flex-col gap-3 w-full ${
                isLight
                  ? 'bg-neutral-50/70 border-neutral-200/90'
                  : 'bg-neutral-950/60 border-neutral-800'
              }`}
            >
              <AuditTicketHeader
                index={idx + 1}
                label={
                  card.tabLabel
                    ? `${card.preset.title} · [${card.tabLabel}]`
                    : card.preset.title
                }
                description={card.preset.summary}
                referenceCode={card.referenceCode}
                componentName={card.componentName}
                sourceFile={card.sourceFile}
                stateId={card.stateId}
                activeProps={card.activeProps}
                badgeColor={card.preset.tier === 'user' ? 'emerald' : 'amber'}
                isLight={isLight}
              />

              {/* Simulated Floating Window Frame */}
              <div
                className={`rounded-2xl border overflow-hidden flex flex-col w-full mx-auto ${shellCardClass}`}
                style={{ maxWidth: `${Math.max(480, card.preset.width)}px` }}
              >
                <div
                  className={`px-3.5 py-2 border-b flex items-center justify-between text-xs ${
                    isLight
                      ? 'bg-neutral-100/90 border-neutral-200'
                      : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {card.preset.tier === 'user' ? (
                      <User className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Terminal className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className="font-bold truncate">{card.preset.title}</span>
                    {card.tabLabel && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-semibold">
                        {card.tabLabel}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] opacity-60 shrink-0">
                    {card.preset.width}x{card.preset.height}px
                  </span>
                </div>

                <div className="p-3.5">
                  {renderFloatingWindowPanel(card.preset.id, {
                    isLight,
                    activeTab: card.tabId,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  });

FloatingWindowsFlatMatrixWall.displayName = 'FloatingWindowsFlatMatrixWall';
