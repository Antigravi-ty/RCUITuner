import React from 'react';
import {
  X,
  Layers,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react';
import { Button } from '../../../ui-core/primitives/Button';
import {
  USER_PRESET_WINDOWS,
  type PresetConfig,
  type FloatingWindowVisibilityTier,
} from '../../../ui-core/stores/floatingPresets';
import { DEV_PRESET_WINDOWS } from '../../../ui-core/stores/devFloatingPresets';

export interface FloatingWindowsBoundaryControls {
  containerPreset: 'full' | '1080p-compact' | 'small-squeeze';
  setContainerPreset: (preset: 'full' | '1080p-compact' | 'small-squeeze') => void;
  boundaryLocked: boolean;
  effectiveBoundaryW: number;
  effectiveBoundaryH: number;
  setManualBoundarySize: (next: { width: number; height: number }) => void;
  handleChangeManualBoundarySize: (next: { width: number; height: number }) => void;
  handleToggleBoundaryLock: () => void;
}

export interface FloatingWindowsStageToolbarProps {
  isLight: boolean;
  tier: FloatingWindowVisibilityTier;
  fwMode: 'inspector' | 'matrix' | 'stack';
  setFwMode: (mode: 'inspector' | 'matrix' | 'stack') => void;
  currentIndex: number;
  activeTierWindows: PresetConfig[];
  currentPreset: PresetConfig | undefined;
  boundary: FloatingWindowsBoundaryControls;
  handleSwitchTier: (tier: FloatingWindowVisibilityTier) => void;
  handleStepWindow: (delta: number) => void;
  totalCount: number;
  clearAll: () => void;
}

export const FloatingWindowsStageToolbar: React.FC<FloatingWindowsStageToolbarProps> = ({
  isLight,
  tier,
  fwMode,
  setFwMode,
  currentIndex,
  activeTierWindows,
  currentPreset,
  boundary: {
    containerPreset,
    setContainerPreset,
    boundaryLocked,
    effectiveBoundaryW,
    effectiveBoundaryH,
    setManualBoundarySize,
    handleChangeManualBoundarySize,
    handleToggleBoundaryLock,
  },
  handleSwitchTier,
  handleStepWindow,
  totalCount,
  clearAll,
}) => {
  return (
      <div
        className={`flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl border text-xs font-mono ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs'
            : 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`inline-flex items-center p-0.5 rounded-lg border ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}
          >
            <button
              type="button"
              onClick={() => handleSwitchTier('user')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                tier === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              User ({USER_PRESET_WINDOWS.length})
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTier('developer')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                tier === 'developer'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Dev ({DEV_PRESET_WINDOWS.length})
            </button>
          </div>

          {fwMode !== 'matrix' && (
            <>
              <button
                type="button"
                onClick={() => handleStepWindow(-1)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border font-bold cursor-pointer transition-all active:scale-95 ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev (←)</span>
              </button>

              <button
                type="button"
                onClick={() => handleStepWindow(1)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border font-bold cursor-pointer transition-all active:scale-95 ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
                }`}
              >
                <span>Next (→)</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
                [{currentIndex + 1}/{activeTierWindows.length}] {currentPreset?.title}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {fwMode !== 'matrix' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Canvas Boundary:</span>
              {(
                [
                  { id: 'full', label: 'Auto' },
                  { id: '1080p-compact', label: '760×520' },
                  { id: 'small-squeeze', label: '520×380' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setContainerPreset(preset.id);
                    if (preset.id === '1080p-compact' && boundaryLocked) {
                      setManualBoundarySize({ width: 760, height: 520 });
                    } else if (preset.id === 'small-squeeze' && boundaryLocked) {
                      setManualBoundarySize({ width: 520, height: 380 });
                    }
                  }}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] cursor-pointer transition-all ${
                    containerPreset === preset.id && !boundaryLocked
                      ? 'bg-amber-500 text-white border-amber-500 font-bold'
                      : isLight
                      ? 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl border ${
                  boundaryLocked
                    ? 'border-sky-500/60 bg-sky-500/10 text-sky-500'
                    : isLight
                    ? 'border-neutral-200 bg-neutral-50 text-neutral-700'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300'
                }`}
              >
                <input
                  type="number"
                  min={320}
                  max={2560}
                  step={10}
                  value={Math.round(effectiveBoundaryW)}
                  onChange={(e) =>
                    handleChangeManualBoundarySize({
                      width: Number(e.target.value) || effectiveBoundaryW,
                      height: effectiveBoundaryH,
                    })
                  }
                  className={`w-14 px-1 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-900'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                  }`}
                />
                <span className="opacity-60">×</span>
                <input
                  type="number"
                  min={260}
                  max={1600}
                  step={10}
                  value={Math.round(effectiveBoundaryH)}
                  onChange={(e) =>
                    handleChangeManualBoundarySize({
                      width: effectiveBoundaryW,
                      height: Number(e.target.value) || effectiveBoundaryH,
                    })
                  }
                  className={`w-14 px-1 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-900'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                  }`}
                />
                <span className="text-[10px] opacity-60">px</span>
                <button
                  type="button"
                  onClick={handleToggleBoundaryLock}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                    boundaryLocked
                      ? 'bg-sky-500 text-white border-sky-400 shadow-2xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                      : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {boundaryLocked ? (
                    <>
                      <Lock className="h-3 w-3" />
                      <span>Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3 w-3" />
                      <span>Lock W×H</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs font-sans">
            <button
              type="button"
              onClick={() => setFwMode('inspector')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                fwMode === 'inspector'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Direct Inspector</span>
            </button>
            <button
              type="button"
              onClick={() => setFwMode('matrix')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                fwMode === 'matrix'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Flat Matrix Audit Wall</span>
            </button>
            <button
              type="button"
              onClick={() => setFwMode('stack')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-all ${
                fwMode === 'stack'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Multi-Window Stack</span>
            </button>
          </div>

          {totalCount > 0 && fwMode !== 'matrix' && (
            <Button
              variant="danger"
              size="sm"
              isLight={isLight}
              icon={<X className="h-4 w-4" />}
              onClick={clearAll}
            >
              Clear All Windows ({totalCount})
            </Button>
          )}
        </div>
      </div>
  );
};
