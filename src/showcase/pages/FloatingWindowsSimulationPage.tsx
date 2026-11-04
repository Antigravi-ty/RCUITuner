import React, { useRef, useEffect } from 'react';
import { quickNotification } from '../../ui-core/stores/quickNotificationStore';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { readUrlParams, updateUrlParams } from '../stores/urlSync';
import { AppWindow } from 'lucide-react';
import { floatingSandboxStore, useFloatingStore } from '../../ui-core/stores/floatingStore';
import {
  USER_PRESET_WINDOWS,
  type PresetConfig,
  type FloatingWindowVisibilityTier,
} from '../../ui-core/stores/floatingPresets';
import {
  DEV_PRESET_WINDOWS,
  PRESET_WINDOWS,
} from '../../ui-core/stores/devFloatingPresets';
import { FloatingWindowsCanvasStage } from './floating-windows/FloatingWindowsCanvasStage';
import { FloatingWindowsFlatMatrixWall } from './floating-windows/FloatingWindowsFlatMatrixWall';
import { FloatingWindowsScannerControlBar } from './floating-windows/FloatingWindowsScannerControlBar';
import { FloatingWindowsStageToolbar } from './floating-windows/FloatingWindowsStageToolbar';
import { FloatingWindowsAuditSection } from './floating-windows/FloatingWindowsAuditSection';
import { useFloatingWindowsCalibration } from './floating-windows/useFloatingWindowsCalibration';

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
    spawnWithFlight,
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

  const { manualMinWidths, manualMinHeights } = useFloatingWindowsCalibration(currentPreset);

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
    const savedManualMinH =
      typeof manualMinHeights[currentPreset.id] === 'number'
        ? Math.round(manualMinHeights[currentPreset.id])
        : undefined;
    floatingSandboxStore.clearAll();
    floatingSandboxStore.spawnWindow({
      id: currentPreset.id,
      title: currentPreset.title,
      subtitle: currentPreset.summary,
      category: currentPreset.category,
      width: savedManualMinW ?? currentPreset.minWidth ?? currentPreset.width,
      height:
        savedManualMinH !== undefined
          ? Math.max(savedManualMinH, currentPreset.height)
          : currentPreset.height,
      minWidth: currentPreset.minWidth,
      manualMinWidth: savedManualMinW,
      minHeight: currentPreset.minHeight,
      manualMinHeight: savedManualMinH,
      maxWidth: currentPreset.maxWidth,
      maxHeight: currentPreset.maxHeight,
      autoFitHeight: currentPreset.autoFitHeight,
      resizable: currentPreset.resizable,
      singleton: true,
      startMinimized: false,
    });
  }, [fwMode, currentPreset?.id]);

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
      const savedManualMinH =
        typeof manualMinHeights[preset.id] === 'number'
          ? Math.round(manualMinHeights[preset.id])
          : undefined;
      floatingSandboxStore.spawnWindow({
        id: preset.id,
        title: preset.title,
        subtitle: preset.summary,
        category: preset.category,
        width: savedManualMinW ?? preset.minWidth ?? preset.width,
        height:
          savedManualMinH !== undefined
            ? Math.max(savedManualMinH, preset.height)
            : preset.height,
        minWidth: preset.minWidth,
        manualMinWidth: savedManualMinW,
        minHeight: preset.minHeight,
        manualMinHeight: savedManualMinH,
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
  }, [currentIndex, activeTierWindows, fwMode, manualMinWidths, manualMinHeights]);

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
      {/* Static Page Header (Nothing above the View Box ever changes) */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <AppWindow className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              6D · Floating Window Suite
            </h1>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Static top-pinned View Box stage — all window scanners, boundary locks, mode switchers, and Clear All Windows actions operate below the View Box.
            </p>
          </div>
        </div>
      </div>

      {/* 1. TOP-PINNED VIEW BOX STAGE (Directly below static page header so nothing above it ever changes vertically or horizontally) */}
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

      {/* 2. LINEAR SCANNER, BOUNDARY LOCK, MODE SWITCHER & CLEAR ALL WINDOWS (Placed BELOW the View Box) */}
      <FloatingWindowsStageToolbar
        isLight={isLight}
        tier={tier}
        fwMode={fwMode}
        setFwMode={setFwMode}
        currentIndex={currentIndex}
        activeTierWindows={activeTierWindows}
        currentPreset={currentPreset}
        boundary={{
          containerPreset,
          setContainerPreset,
          boundaryLocked,
          effectiveBoundaryW,
          effectiveBoundaryH,
          setManualBoundarySize,
          handleChangeManualBoundarySize,
          handleToggleBoundaryLock,
        }}
        handleSwitchTier={handleSwitchTier}
        handleStepWindow={handleStepWindow}
        totalCount={totalCount}
        clearAll={clearAll}
      />
      <FloatingWindowsAuditSection
        isLight={isLight}
        tier={tier}
        fwMode={fwMode}
        currentIndex={currentIndex}
        currentPreset={currentPreset}
        activeSubTab={activeSubTab}
      />

      {/* Strict User vs Developer Control Bar + Window Pill Grid & Calibration (Below the preview stage) */}
      <FloatingWindowsScannerControlBar
        isLight={isLight}
        tier={tier}
        fwMode={fwMode}
        currentIndex={currentIndex}
        activeTierWindows={activeTierWindows}
        currentPreset={currentPreset}
        containerPreset={containerPreset}
        setContainerPreset={setContainerPreset}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        handleSwitchTier={handleSwitchTier}
        handleStepWindow={handleStepWindow}
        handleSelectPreset={handleSelectPreset}
      />
    </div>
  );
};
