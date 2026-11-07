import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useMenuLayerSandbox } from './MenuLayerSandboxContext';
import { MenuLayerInlineNodeTunerDrawer } from './MenuLayerInlineNodeTunerDrawer';

export interface MenuLayerAdaptiveControlDeckProps {
  isLight: boolean;
}

export const MenuLayerAdaptiveControlDeck: React.FC<
  MenuLayerAdaptiveControlDeckProps
> = ({ isLight }) => {
  const {
    currentRoute,
    widthMode,
    setWidthMode,
    isDockState,
    targetW,
    targetH,
    activeRouteSize,
    minWidthDraft,
    setMinWidthDraft,
    setIsEditingMinWidth,
    hasManualMinOverride,
    applyManualMinWidth,
    handleResetAutoMinWidth,
    containerPreset,
    setContainerPreset,
    effectiveStageW = 900,
    effectiveStageH = 620,
    boundaryLocked = false,
    handleToggleBoundaryLock: onToggleBoundaryLock,
    manualBoundarySize,
    handleChangeManualBoundarySize: onChangeManualBoundarySize,
  } = useMenuLayerSandbox();
  const displayBoundaryW = Math.round(
    boundaryLocked && manualBoundarySize ? manualBoundarySize.width : effectiveStageW
  );
  const displayBoundaryH = Math.round(
    boundaryLocked && manualBoundarySize ? manualBoundarySize.height : effectiveStageH
  );

  return (
    <>
      <MenuLayerInlineNodeTunerDrawer isLight={isLight} />

      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border text-xs transition-colors ${
          isLight
            ? 'bg-white/90 border-neutral-200/90 text-neutral-700 shadow-2xs'
            : 'bg-neutral-900/90 border-neutral-800 text-neutral-300'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-amber-500">
              6D→7A Adaptive Engine:
            </span>
            <div
              className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isLight
                  ? 'bg-neutral-100 border-neutral-200'
                  : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <button
                type="button"
                onClick={() => setWidthMode('design-auto-expand')}
                className={`px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-colors ${
                  widthMode === 'design-auto-expand'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="Design width as comfort baseline, Auto-expand if content is wider, Auto-compress if screen is smaller"
              >
                Design Baseline+Auto Expand/Collapse
              </button>
              <button
                type="button"
                onClick={() => setWidthMode('intrinsic-min')}
                className={`px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-colors ${
                  widthMode === 'intrinsic-min'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="Like 6D Floating Window: Width fully fitted DOM Detected non-truncated minimum width (+16px Scrollbar Reserved Space)"
              >
                6D Compact adaptive content only
              </button>
            </div>
          </div>

          {currentRoute !== 'layer-0' && !isDockState && (
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span className="text-neutral-400">Actual Panel:</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                {targetW}×{targetH}px
              </span>
              <span className="text-neutral-400">Total Content Height:</span>
              <span className="font-semibold">{activeRouteSize.intrinsicHeight}px</span>
              <span className="text-neutral-400 ml-1">MinW:</span>
              <button
                type="button"
                onClick={() =>
                  applyManualMinWidth(activeRouteSize.effectiveMinWidth - 1)
                }
                className={`px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
                title="Min Width -1px"
              >
                -1
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={minWidthDraft}
                onFocus={() => setIsEditingMinWidth(true)}
                onChange={(e) => setMinWidthDraft(e.target.value)}
                onBlur={() => {
                  setIsEditingMinWidth(false);
                  const parsed = parseInt(minWidthDraft, 10);
                  if (Number.isFinite(parsed)) {
                    applyManualMinWidth(parsed);
                  } else {
                    setMinWidthDraft(
                      String(Math.round(activeRouteSize.effectiveMinWidth))
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    applyManualMinWidth(
                      activeRouteSize.effectiveMinWidth + (e.shiftKey ? 10 : 1)
                    );
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    applyManualMinWidth(
                      activeRouteSize.effectiveMinWidth - (e.shiftKey ? 10 : 1)
                    );
                  }
                }}
                className={`w-14 px-1.5 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                  hasManualMinOverride
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : isLight
                    ? 'border-neutral-300 bg-white text-neutral-800'
                    : 'border-neutral-700 bg-neutral-950 text-neutral-100'
                }`}
                title="Input integer for min width (Enter confirm, Up/Down Arrow Keys ±1px, Shift+Arrow Keys ±10px)"
              />
              <button
                type="button"
                onClick={() =>
                  applyManualMinWidth(activeRouteSize.effectiveMinWidth + 1)
                }
                className={`px-1.5 py-0.5 rounded border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
                title="Min Width +1px"
              >
                +1
              </button>
              <span
                className="text-[10px] text-emerald-600 dark:text-emerald-400"
                title="Automatically Reserved 16px Vertical scrollbar safe slot, Prevent horizontal text compression when vertical scrollbars trigger on small screens"
              >
                [+{activeRouteSize.scrollbarReservePx}px Scrollbar]
              </span>
              {hasManualMinOverride && (
                <button
                  type="button"
                  onClick={handleResetAutoMinWidth}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-200/80 dark:bg-neutral-800 hover:text-amber-500 cursor-pointer"
                  title={`restore DOM Auto-Detected Value (${activeRouteSize.autoMinWidth}px)`}
                >
                  reset Auto({activeRouteSize.autoMinWidth})
                </button>
              )}
              {(activeRouteSize.isWidthSqueezed ||
                activeRouteSize.isHeightSqueezed) && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 font-bold">
                  Canvas auto-compressing (Ideal {activeRouteSize.desiredWidth}×
                  {activeRouteSize.desiredHeight}px)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <span className="text-neutral-400">Canvas Boundary:</span>
          {(
            [
              { id: 'full', label: 'Full-Width (Auto-Expand)' },
              { id: '1080p-compact', label: '1080p Compact (760×520)' },
              { id: 'small-squeeze', label: 'Small Squeeze (520×380)' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setContainerPreset(preset.id)}
              className={`px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                containerPreset === preset.id && !boundaryLocked
                  ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {preset.label}
            </button>
          ))}

          {/* Live / Manual Canvas Boundary W × H + Lock Toggle */}
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
              boundaryLocked
                ? 'border-sky-500/60 bg-sky-500/10 text-sky-500'
                : isLight
                ? 'border-neutral-200 bg-neutral-50 text-neutral-700'
                : 'border-neutral-800 bg-neutral-950 text-neutral-300'
            }`}
            title="Resolved Canvas Boundary (W × H px). Edit or click Lock to freeze the stage boundary while stepping through pages."
          >
            <span className="text-[10px] opacity-70">
              {boundaryLocked ? 'Manual/Locked:' : 'Auto:'}
            </span>
            <input
              type="number"
              min={320}
              max={2560}
              step={10}
              value={displayBoundaryW}
              onChange={(e) => {
                const nextW = Math.max(320, Math.min(2560, Number(e.target.value) || displayBoundaryW));
                onChangeManualBoundarySize?.({ width: nextW, height: displayBoundaryH });
              }}
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
              value={displayBoundaryH}
              onChange={(e) => {
                const nextH = Math.max(260, Math.min(1600, Number(e.target.value) || displayBoundaryH));
                onChangeManualBoundarySize?.({ width: displayBoundaryW, height: nextH });
              }}
              className={`w-14 px-1 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                isLight
                  ? 'bg-white border-neutral-300 text-neutral-900'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-100'
              }`}
            />
            <span className="text-[10px] opacity-60">px</span>
            <button
              type="button"
              onClick={onToggleBoundaryLock}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                boundaryLocked
                  ? 'bg-sky-500 text-white border-sky-400 shadow-2xs'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title={
                boundaryLocked
                  ? 'Unlock Canvas Boundary (return to auto-adaptive stage bounds)'
                  : 'Lock current Canvas Boundary W×H so stepping through pages never resizes the stage'
              }
            >
              {boundaryLocked ? (
                <>
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" />
                  <span>Lock Boundary</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
