import React, { useRef, useEffect } from 'react';
import { quickNotification } from '../../ui-core/stores/quickNotificationStore';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { readUrlParams, updateUrlParams } from '../stores/urlSync';
import { AppWindow, X, Eye, Layers, LayoutGrid } from 'lucide-react';
import { Button } from '../../ui-core/primitives/Button';
import { floatingSandboxStore, useFloatingStore } from '../../ui-core/stores/floatingStore';
import {
  USER_PRESET_WINDOWS,
  DEV_PRESET_WINDOWS,
  PRESET_WINDOWS,
  type PresetConfig,
  type FloatingWindowVisibilityTier,
} from '../../ui-core/stores/floatingPresets';
import { FloatingWindowsCanvasStage } from './floating-windows/FloatingWindowsCanvasStage';
import { FloatingWindowsFlatMatrixWall } from './floating-windows/FloatingWindowsFlatMatrixWall';
import { FloatingWindowsScannerControlBar } from './floating-windows/FloatingWindowsScannerControlBar';
import { AuditTicketHeader } from '../components/AuditTicketHeader';

const useState = createScopedSyncedState('page:floating-windows-v2');

export interface FloatingWindowsSimulationPageProps {
  isLight?: boolean;
}

export const FloatingWindowsSimulationPage: React.FC<FloatingWindowsSimulationPageProps> = ({
  isLight = false,
}) => {
  const {
    windows,
    minimizedCount,
    totalCount,
    opacity,
    setOpacity,
    spawnWithFlight,
    updateSize,
    updateMinWidth,
    closeWindow,
    clearAll,
  } = useFloatingStore(floatingSandboxStore);

  const [rawTier, setTier] = useState<FloatingWindowVisibilityTier>(() => {
    const params = readUrlParams();
    if (params.fw) {
      const match = PRESET_WINDOWS.find((p) => p.id === params.fw);
      if (match?.tier) return match.tier;
    }
    return params.tier === 'developer' ? 'developer' : 'user';
  }, 'tier');
  const tier: FloatingWindowVisibilityTier = rawTier === 'developer' ? 'developer' : 'user';
  const [rawFwMode, setFwMode] = useState<'inspector' | 'stack' | 'matrix'>(() => {
    const params = readUrlParams();
    if (params.fwMode === 'stack') return 'stack';
    if (params.fwMode === 'matrix') return 'matrix';
    return 'inspector';
  }, 'fwMode');
  const fwMode: 'inspector' | 'stack' | 'matrix' =
    rawFwMode === 'stack' ? 'stack' : rawFwMode === 'matrix' ? 'matrix' : 'inspector';
  const [selectedWindowId, setSelectedWindowId] = useState<string>(() => {
    const params = readUrlParams();
    if (params.fw && PRESET_WINDOWS.some((p) => p.id === params.fw)) {
      return params.fw;
    }
    return USER_PRESET_WINDOWS[0].id;
  }, 'selectedWindowId');
  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    const params = readUrlParams();
    if (params.fwTab) return params.fwTab;
    if (params.fw) {
      const match = PRESET_WINDOWS.find((p) => p.id === params.fw);
      if (match?.tabs && match.tabs.length > 0) return match.tabs[0].id;
    }
    return '';
  }, 'activeSubTab');

  const [containerPreset, setContainerPreset] = useState<'full' | '1080p-compact' | 'small-squeeze'>(
    'full',
    'containerPreset'
  );

  // Manual minWidth calibration map (strictly 1px integer standard units)
  const [manualMinWidths, setManualMinWidths] = useState<Record<string, number>>(
    {},
    'manualMinWidths'
  );
  const [minWidthDraft, setMinWidthDraft] = React.useState<string>('');
  const [isEditingMinWidth, setIsEditingMinWidth] = React.useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const activeTierWindows = tier === 'user' ? USER_PRESET_WINDOWS : DEV_PRESET_WINDOWS;
  const currentIndex = Math.max(
    0,
    activeTierWindows.findIndex((w) => w.id === selectedWindowId)
  );
  const currentPreset = activeTierWindows[currentIndex] || activeTierWindows[0];

  const activeWindowInstance = windows.find(
    (w) => w.id === currentPreset?.id || (currentPreset && w.id.startsWith(currentPreset.id))
  );
  const resolvedAutoMinW = Math.round(
    activeWindowInstance?.autoMinWidth ?? currentPreset?.minWidth ?? 340
  );
  const resolvedScrollbarReserve = Math.round(
    activeWindowInstance?.scrollbarReservePx ?? (currentPreset?.resizable ? 16 : 0)
  );
  const activeManualMinW =
    currentPreset && typeof manualMinWidths[currentPreset.id] === 'number'
      ? Math.round(manualMinWidths[currentPreset.id])
      : activeWindowInstance?.manualMinWidth;
  const resolvedEffectiveMinW = Math.round(activeManualMinW ?? resolvedAutoMinW);

  useEffect(() => {
    if (!isEditingMinWidth) {
      setMinWidthDraft(String(resolvedEffectiveMinW));
    }
  }, [resolvedEffectiveMinW, isEditingMinWidth, currentPreset?.id]);

  // 2) Continuously synchronize active floating window state to URL address bar
  useEffect(() => {
    updateUrlParams({
      tier,
      fw: currentPreset?.id || null,
      fwTab:
        currentPreset?.tabs && currentPreset.tabs.length > 0
          ? activeSubTab || currentPreset.tabs[0].id
          : null,
      fwMode,
    });
  }, [tier, currentPreset, activeSubTab, fwMode]);

  // 3) In 'inspector' mode, automatically keep the currently selected preset window open in the isolated 6D canvas stage
  useEffect(() => {
    if (fwMode !== 'inspector' || !currentPreset) return;
    const savedManualMinW =
      typeof manualMinWidths[currentPreset.id] === 'number'
        ? Math.round(manualMinWidths[currentPreset.id])
        : undefined;
    floatingSandboxStore.clearAll();
    floatingSandboxStore.spawnWindow({
      id: currentPreset.id,
      title: currentPreset.title,
      subtitle: currentPreset.summary,
      category: currentPreset.category,
      width:
        savedManualMinW !== undefined
          ? Math.max(savedManualMinW, currentPreset.width)
          : currentPreset.width,
      height: currentPreset.height,
      minWidth: currentPreset.minWidth,
      manualMinWidth: savedManualMinW,
      minHeight: currentPreset.minHeight,
      maxWidth: currentPreset.maxWidth,
      maxHeight: currentPreset.maxHeight,
      autoFitHeight: currentPreset.autoFitHeight,
      resizable: currentPreset.resizable,
      singleton: true,
      startMinimized: false,
    });
  }, [fwMode, currentPreset?.id]);

  const applyManualMinWidth = (nextRawPx: number) => {
    if (!currentPreset) return;
    const clampedPx = Math.max(240, Math.min(960, Math.round(nextRawPx)));
    setManualMinWidths((prev) => ({
      ...(prev && typeof prev === 'object' ? prev : {}),
      [currentPreset.id]: clampedPx,
    }));
    setMinWidthDraft(String(clampedPx));
    updateMinWidth(currentPreset.id, clampedPx);
    updateSize(
      currentPreset.id,
      { width: clampedPx, height: activeWindowInstance?.height ?? currentPreset.height },
      true
    );
  };

  const handleResetAutoMinWidth = () => {
    if (!currentPreset) return;
    setManualMinWidths((prev) => {
      const next = { ...(prev && typeof prev === 'object' ? prev : {}) };
      delete next[currentPreset.id];
      return next;
    });
    updateMinWidth(currentPreset.id, undefined);
    updateSize(
      currentPreset.id,
      { width: Math.max(resolvedAutoMinW, currentPreset.width), height: currentPreset.height },
      false
    );
    quickNotification.info(
      `Reset ${currentPreset.title} minWidth to Auto-Detected ${resolvedAutoMinW}px (incl. ${resolvedScrollbarReserve}px scrollbar reserve).`
    );
  };

  const handleSnapToMinWidth = (withVerticalScrollbar: boolean) => {
    if (!currentPreset) return;
    const targetH = withVerticalScrollbar
      ? Math.round(currentPreset.minHeight ?? 240)
      : Math.round(currentPreset.height);
    updateSize(
      currentPreset.id,
      { width: resolvedEffectiveMinW, height: targetH },
      withVerticalScrollbar
    );
  };

  const handleCopyCalibratedParams = () => {
    if (!currentPreset) return;
    const payload = {
      id: currentPreset.id,
      title: currentPreset.title,
      minWidth: resolvedEffectiveMinW,
      autoMinWidth: resolvedAutoMinW,
      scrollbarReservePx: resolvedScrollbarReserve,
      mode: activeManualMinW !== undefined ? 'manual-calibrated' : 'auto-detected',
      defaultWidth: Math.max(resolvedEffectiveMinW, currentPreset.width),
      defaultHeight: currentPreset.height,
      minHeight: currentPreset.minHeight ?? 220,
      ...(Object.keys(manualMinWidths || {}).length > 0
        ? { allManualMinWidths: manualMinWidths }
        : {}),
    };
    const jsonText = JSON.stringify(payload, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonText).catch(() => {});
    }
    quickNotification.success(
      `Copied calibrated params for ${currentPreset.title}: minWidth=${resolvedEffectiveMinW}px (Auto=${resolvedAutoMinW}px, Scrollbar=${resolvedScrollbarReserve}px).`
    );
  };

  const handleSwitchTier = (nextTier: FloatingWindowVisibilityTier) => {
    setTier(nextTier);
    const list = nextTier === 'user' ? USER_PRESET_WINDOWS : DEV_PRESET_WINDOWS;
    const first = list[0];
    if (first) {
      setSelectedWindowId(first.id);
      setActiveSubTab(first.tabs?.[0]?.id || '');
    }
  };

  const handleSelectPreset = (preset: PresetConfig) => {
    setSelectedWindowId(preset.id);
    setActiveSubTab(preset.tabs?.[0]?.id || '');
    if (fwMode === 'stack') {
      const savedManualMinW =
        typeof manualMinWidths[preset.id] === 'number'
          ? Math.round(manualMinWidths[preset.id])
          : undefined;
      floatingSandboxStore.spawnWindow({
        id: preset.id,
        title: preset.title,
        subtitle: preset.summary,
        category: preset.category,
        width:
          savedManualMinW !== undefined
            ? Math.max(savedManualMinW, preset.width)
            : preset.width,
        height: preset.height,
        minWidth: preset.minWidth,
        manualMinWidth: savedManualMinW,
        minHeight: preset.minHeight,
        maxWidth: preset.maxWidth,
        maxHeight: preset.maxHeight,
        autoFitHeight: preset.autoFitHeight,
        resizable: preset.resizable,
        singleton: preset.singleton,
        startMinimized: false,
      });
    }
  };

  const handleStepWindow = (delta: number) => {
    const nextIdx = (currentIndex + delta + activeTierWindows.length) % activeTierWindows.length;
    const nextPreset = activeTierWindows[nextIdx];
    if (nextPreset) {
      handleSelectPreset(nextPreset);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepWindow(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepWindow(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, activeTierWindows, fwMode, manualMinWidths]);

  const handleAddPresetToStack = (
    preset: PresetConfig,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!canvasRef.current) return;
    spawnWithFlight(preset, e.currentTarget, canvasRef.current);
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <AppWindow className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              6D · Floating Window Suite (6 User + 19 Developer)
            </h1>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Strict separation of <strong>User Only (6 Player Windows)</strong> and{' '}
              <strong>Developer Only (19 Engineering Tuners &amp; Labs)</strong>. Supports Direct Inspector, Multi-Window Stack, and Flat Matrix Audit Wall.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Inspector vs Flat Matrix Wall vs Multi-Window Stack Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100/80 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs">
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
              Clear Window ({totalCount})
            </Button>
          )}
        </div>
      </div>

      {/* Strict User vs Developer Control Bar + < Prev Window | Next Window > Scanner */}
      <FloatingWindowsScannerControlBar
        isLight={isLight}
        tier={tier}
        fwMode={fwMode}
        currentIndex={currentIndex}
        activeTierWindows={activeTierWindows}
        currentPreset={currentPreset}
        windows={windows}
        resolvedEffectiveMinW={resolvedEffectiveMinW}
        resolvedAutoMinW={resolvedAutoMinW}
        resolvedScrollbarReserve={resolvedScrollbarReserve}
        activeManualMinW={activeManualMinW}
        activeWindowInstance={activeWindowInstance}
        containerPreset={containerPreset}
        setContainerPreset={setContainerPreset}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        opacity={opacity}
        setOpacity={setOpacity}
        minWidthDraft={minWidthDraft}
        setMinWidthDraft={setMinWidthDraft}
        setIsEditingMinWidth={setIsEditingMinWidth}
        applyManualMinWidth={applyManualMinWidth}
        handleSnapToMinWidth={handleSnapToMinWidth}
        handleResetAutoMinWidth={handleResetAutoMinWidth}
        handleCopyCalibratedParams={handleCopyCalibratedParams}
        handleSwitchTier={handleSwitchTier}
        handleStepWindow={handleStepWindow}
        handleSelectPreset={handleSelectPreset}
      />

      {/* Quick-Copy Audit Header in Direct Inspector Mode */}
      {fwMode !== 'matrix' && currentPreset && (
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
      )}

      {/* Stage Area: Flat Matrix Audit Wall vs Interactive Canvas Stage */}
      {fwMode === 'matrix' ? (
        <FloatingWindowsFlatMatrixWall
          isLight={isLight}
          tier={tier}
          selectedPreset={currentPreset}
        />
      ) : (
        <FloatingWindowsCanvasStage
          isLight={isLight}
          canvasRef={canvasRef}
          containerPreset={containerPreset}
          opacity={opacity}
          totalCount={totalCount}
          minimizedCount={minimizedCount}
          currentPreset={currentPreset}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          fwMode={fwMode}
          tier={tier}
          activeTierWindows={activeTierWindows}
          windows={windows}
          closeWindow={closeWindow}
          handleAddPresetToStack={handleAddPresetToStack}
        />
      )}
    </div>
  );
};
