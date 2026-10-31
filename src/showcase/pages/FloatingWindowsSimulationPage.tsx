import React, { useRef, useEffect } from 'react';
import { quickNotification } from '../../ui-core/stores/quickNotificationStore';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { readUrlParams, updateUrlParams } from '../stores/urlSync';
import { AppWindow, X, Eye, Layers, LayoutGrid, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
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
  const [boundaryLocked, setBoundaryLocked] = useState<boolean>(
    false,
    'boundaryLocked'
  );
  const [manualBoundarySize, setManualBoundarySize] = useState<{
    width: number;
    height: number;
  }>({ width: 960, height: 700 }, 'manualBoundarySize');
  const [measuredCanvasSize, setMeasuredCanvasSize] = React.useState<{
    width: number;
    height: number;
  }>({ width: 960, height: 700 });

  // Manual minWidth calibration map (strictly 1px integer standard units)
  const [manualMinWidths, setManualMinWidths] = useState<Record<string, number>>(
    {},
    'manualMinWidths'
  );
  const [minWidthDraft, setMinWidthDraft] = React.useState<string>('');
  const [isEditingMinWidth, setIsEditingMinWidth] = React.useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const update = () => {
      if (canvasRef.current) {
        setMeasuredCanvasSize({
          width: canvasRef.current.clientWidth || 960,
          height: canvasRef.current.clientHeight || 700,
        });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(canvasRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [fwMode]);

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

  const autoBoundaryW =
    containerPreset === '1080p-compact'
      ? Math.min(measuredCanvasSize.width, 760)
      : containerPreset === 'small-squeeze'
      ? Math.min(measuredCanvasSize.width, 520)
      : measuredCanvasSize.width;
  const autoBoundaryH =
    containerPreset === '1080p-compact'
      ? 520
      : containerPreset === 'small-squeeze'
      ? 380
      : 700;
  const effectiveBoundaryW = boundaryLocked ? manualBoundarySize.width : autoBoundaryW;
  const effectiveBoundaryH = boundaryLocked ? manualBoundarySize.height : autoBoundaryH;

  const handleToggleBoundaryLock = () => {
    if (!boundaryLocked) {
      const snapW = Math.max(320, Math.round(autoBoundaryW));
      const snapH = Math.max(260, Math.round(autoBoundaryH));
      setManualBoundarySize({ width: snapW, height: snapH });
      setBoundaryLocked(true);
      quickNotification.info(`Canvas Boundary Locked at ${snapW}×${snapH}px.`);
    } else {
      setBoundaryLocked(false);
      quickNotification.info('Canvas Boundary Unlocked (Auto-Adaptive).');
    }
  };

  const handleChangeManualBoundarySize = (next: { width: number; height: number }) => {
    setManualBoundarySize({
      width: Math.max(320, Math.min(2560, Math.round(next.width))),
      height: Math.max(260, Math.min(1600, Math.round(next.height))),
    });
    setBoundaryLocked(true);
  };

  return (
    <div className="flex flex-col gap-5 w-full relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <AppWindow className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              6D · Floating Window Suite ({USER_PRESET_WINDOWS.length} User + {DEV_PRESET_WINDOWS.length} Developer)
            </h1>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Strict separation of <strong>User Only ({USER_PRESET_WINDOWS.length} Player Windows)</strong> and{' '}
              <strong>Developer Only ({DEV_PRESET_WINDOWS.length} Engineering Tuners &amp; Labs)</strong>. Supports Direct Inspector, Multi-Window Stack, and Flat Matrix Audit Wall.
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

      {/* 1. TOP-PINNED PREVIEW STAGE & LINEAR SCANNER / BOUNDARY LOCK BAR */}
      {fwMode !== 'matrix' && (
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

            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
              [{currentIndex + 1}/{activeTierWindows.length}] {currentPreset?.title}
            </span>

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
          </div>

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
        </div>
      )}

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

      {/* Stage Area: Flat Matrix Audit Wall vs Interactive Canvas Stage (At the top so control bar layout changes below never push the stage) */}
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
          boundaryLocked={boundaryLocked}
          manualBoundarySize={manualBoundarySize}
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

      {/* Strict User vs Developer Control Bar + Window Pill Grid & Calibration (Below the preview stage) */}
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
    </div>
  );
};
