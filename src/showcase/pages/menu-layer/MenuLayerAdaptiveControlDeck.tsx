import React from 'react';
import { Layers, Ruler, Lock, Unlock } from 'lucide-react';
import type { ContainerTransitionMode } from '../../../ui-core/navigation/transitions';
import type {
  ClampedMenuPanelGeometry,
  MenuPanelWidthAdaptiveMode,
} from '../../../ui-core/navigation/menuPanelAdaptive';
import type { Layer1MenuContextMode } from '../../../ui-core/recipes/Layer1MainMenuRecipe';
import type { ShowcaseTab } from '../../Sidebar';
import {
  type ActiveMenuRoute,
  ROUTE_TO_PANEL_ID,
} from './menuLayerRouteConfig';
import { resolveNodePathInspectorLinks } from './menuLayerInspectorLinks';
import { LocalPanelSizingTuner } from '../recipes/LocalPanelSizingTuner';
import { MainMenuStyleTuner } from '../recipes/MainMenuStyleTuner';
import { SettingActionRowTuner } from '../tabs/SettingActionRowTuner';
import { UnderlineTabsTuner } from '../tabs/UnderlineTabsTuner';
import { CameraSettingsStyleTuner } from '../recipes/CameraSettingsStyleTuner';

export interface MenuLayerTopHeaderBarProps {
  isLight: boolean;
  currentRoute: ActiveMenuRoute;
  transitionMode: ContainerTransitionMode;
  setTransitionMode: (mode: ContainerTransitionMode) => void;
  showToast: (msg: string) => void;
}

export const MenuLayerTopHeaderBar: React.FC<MenuLayerTopHeaderBarProps> = ({
  isLight,
  currentRoute,
  transitionMode,
  setTransitionMode,
  showToast,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Layers className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Menu Layer live preview</h1>
      </div>

      <div className="flex items-center gap-3 text-xs flex-wrap">
        <button
          type="button"
          onClick={async () => {
            const previewStage = document.getElementById('storybook-preview-stage');
            if (!previewStage) return;

            const winW = window.innerWidth;
            const winH = window.innerHeight;
            const shellEl = previewStage.querySelector<HTMLElement>(
              '[data-morph-container="true"], [data-panel="container"]'
            );
            const headerEl = previewStage.querySelector<HTMLElement>(
              '[data-ui-element="panel-header"]'
            );
            const tabsEl = previewStage.querySelector<HTMLElement>('[role="tablist"]');
            const tabButtons = Array.from(
              previewStage.querySelectorAll<HTMLElement>('[role="tab"]')
            );
            const contentEl = previewStage.querySelector<HTMLElement>(
              '[data-ui-element="panel-content"]'
            );
            const footerEl = previewStage.querySelector<HTMLElement>(
              '[data-ui-element="panel-footer"]'
            );

            const getPadStr = (cs: CSSStyleDeclaration) =>
              `top=${cs.paddingTop} right=${cs.paddingRight} bottom=${cs.paddingBottom} left=${cs.paddingLeft}`;
            const getRectStr = (r: DOMRect) =>
              `${Math.round(r.width * 10) / 10}px × ${Math.round(r.height * 10) / 10}px (x: ${Math.round(r.x)}, y: ${Math.round(r.y)})`;

            const lines: string[] = [];
            lines.push(
              '========================================================================'
            );
            lines.push(
              ` [UI STORYBOOK SNAPSHOT] ROUTE: [${currentRoute.toUpperCase()}]`
            );
            lines.push(
              '========================================================================'
            );
            lines.push(`• Window Viewport: ${winW}px × ${winH}px`);

            if (shellEl) {
              const sRect = shellEl.getBoundingClientRect();
              const sCs = window.getComputedStyle(shellEl);
              lines.push('\n[1. MENU CONTAINER (OUTER SHELL)]');
              lines.push(`  • Size:         ${getRectStr(sRect)}`);
              lines.push(`  • Padding:      ${getPadStr(sCs)}`);
            }

            if (headerEl) {
              const hRect = headerEl.getBoundingClientRect();
              lines.push(
                `\n[2. PANEL HEADER] Size: ${getRectStr(hRect)} | Title: "${headerEl.querySelector('h1, h2')?.textContent?.trim() || ''}"`
              );
            }

            if (tabsEl) {
              lines.push(`\n[3. TABS] Total ${tabButtons.length} tab(s)`);
            }

            if (contentEl) {
              const cRect = contentEl.getBoundingClientRect();
              lines.push(
                `\n[4. PANEL CONTENT] Size: ${getRectStr(cRect)} | ScrollH: ${contentEl.scrollHeight}px`
              );
            }

            if (footerEl) {
              lines.push(
                `\n[5. PANEL FOOTER] Content: "${footerEl.textContent?.replace(/\s+/g, ' ').trim() || ''}"`
              );
            }

            lines.push(
              '========================================================================\n'
            );
            const report = lines.join('\n');
            console.log(report);
            if (navigator.clipboard?.writeText) {
              try {
                await navigator.clipboard.writeText(report);
                showToast('[ok] Preview layout data exported to console and copied to clipboard');
              } catch (_) {
                showToast('[ok] Preview layout data output to console');
              }
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-medium transition-all active:scale-95 cursor-pointer bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 shadow-2xs"
          title="Print and copy current Storybook Real-time preview of element dimensions, Margin, Padding Data"
        >
          <Ruler className="h-3.5 w-3.5 text-amber-500" />
          <span>Export current preview layout data</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`font-medium ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            Transition Effect:
          </span>
          <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-neutral-100/70 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setTransitionMode('fluid-morph')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                transitionMode === 'fluid-morph'
                  ? 'bg-amber-500 text-white font-bold shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Apple HIG 0.28s Continuous fluid morph"
            >
              FluidMorph (Continuous fluid)
            </button>
            <button
              type="button"
              onClick={() => setTransitionMode('sequenced-step')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                transitionMode === 'sequenced-step'
                  ? 'bg-amber-500 text-white font-bold shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="100ms fade out -> 150ms Size Transformation -> 100ms Fade In"
            >
              SequencedStep (Three-step)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface MenuLayerAdaptiveControlDeckProps {
  isLight: boolean;
  currentRoute: ActiveMenuRoute;
  settingsTab: string;
  garageTab: string;
  layer1ContextMode: Layer1MenuContextMode;
  setLayer1ContextMode: (mode: Layer1MenuContextMode) => void;
  showInlineTuner: boolean;
  setShowInlineTuner: (show: boolean) => void;
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  widthMode: MenuPanelWidthAdaptiveMode;
  setWidthMode: (mode: MenuPanelWidthAdaptiveMode) => void;
  isDockState: boolean;
  targetW: number;
  targetH: number;
  activeRouteSize: ClampedMenuPanelGeometry;
  minWidthDraft: string;
  setMinWidthDraft: (v: string) => void;
  setIsEditingMinWidth: (v: boolean) => void;
  hasManualMinOverride: boolean;
  applyManualMinWidth: (nextVal: number) => void;
  handleResetAutoMinWidth: () => void;
  containerPreset: 'full' | '1080p-compact' | 'small-squeeze';
  setContainerPreset: (preset: 'full' | '1080p-compact' | 'small-squeeze') => void;
  effectiveStageW?: number;
  effectiveStageH?: number;
  boundaryLocked?: boolean;
  onToggleBoundaryLock?: () => void;
  manualBoundarySize?: { width: number; height: number };
  onChangeManualBoundarySize?: (next: { width: number; height: number }) => void;
}

export const MenuLayerAdaptiveControlDeck: React.FC<
  MenuLayerAdaptiveControlDeckProps
> = ({
  isLight,
  currentRoute,
  settingsTab,
  garageTab,
  layer1ContextMode,
  setLayer1ContextMode,
  showInlineTuner,
  setShowInlineTuner,
  onNavigateShowcase,
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
  onToggleBoundaryLock,
  manualBoundarySize,
  onChangeManualBoundarySize,
}) => {
  const displayBoundaryW = Math.round(
    boundaryLocked && manualBoundarySize ? manualBoundarySize.width : effectiveStageW
  );
  const displayBoundaryH = Math.round(
    boundaryLocked && manualBoundarySize ? manualBoundarySize.height : effectiveStageH
  );

  return (
    <>
      {showInlineTuner &&
        (() => {
          const inspectorInfo = resolveNodePathInspectorLinks(
            currentRoute,
            settingsTab,
            garageTab
          );
          const activePanelId =
            currentRoute !== 'layer-0' ? ROUTE_TO_PANEL_ID[currentRoute] : undefined;
          return (
            <div
              className={`rounded-2xl border p-4 space-y-4 transition-colors ${
                isLight
                  ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                  : 'bg-neutral-900/80 border-amber-500/30 shadow-inner'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    [Boost] 7A Quick in-place node adjustment:
                  </span>
                  <span
                    className={
                      isLight
                        ? 'text-neutral-700 font-semibold'
                        : 'text-neutral-200 font-semibold'
                    }
                  >
                    {inspectorInfo.pageRecipeTarget.componentName} (
                    {inspectorInfo.pageRecipeTarget.label})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onNavigateShowcase && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateShowcase(
                          inspectorInfo.pageRecipeTarget.tab,
                          inspectorInfo.pageRecipeTarget.targetId
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer transition-colors ${
                        isLight
                          ? 'bg-white border-neutral-200 text-neutral-700 hover:border-amber-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-amber-500/50'
                      }`}
                    >
                      Open full standalone page [{inspectorInfo.pageRecipeTarget.code}] ↗
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowInlineTuner(false)}
                    className="px-2 py-1 rounded-lg text-[11px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    collapse ^
                  </button>
                </div>
              </div>

              {activePanelId && (
                <LocalPanelSizingTuner
                  panelId={activePanelId}
                  label={`${inspectorInfo.pageRecipeTarget.code} · ${inspectorInfo.pageRecipeTarget.componentName} Container size contract`}
                  recommendation="Real-time link below 7A Stage Container And 6A Standalone Page"
                  isLight={isLight}
                />
              )}

              {currentRoute === 'main-menu' && (
                <MainMenuStyleTuner
                  isLight={isLight}
                  compact
                  contextMode={layer1ContextMode}
                  onChangeContextMode={setLayer1ContextMode}
                />
              )}

              {(currentRoute === 'settings' || currentRoute === 'garage') && (
                <UnderlineTabsTuner isLight={isLight} showStandalonePreview={false} />
              )}

              {currentRoute === 'camera' && (
                <CameraSettingsStyleTuner
                  isLight={isLight}
                  showStandalonePreview={false}
                  compact
                />
              )}

              {inspectorInfo.usesSettingActionRow && currentRoute !== 'camera' && (
                <SettingActionRowTuner
                  isLight={isLight}
                  showStandalonePreview={false}
                />
              )}
            </div>
          );
        })()}

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
