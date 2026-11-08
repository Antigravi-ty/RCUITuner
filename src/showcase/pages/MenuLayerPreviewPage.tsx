import React, { useState as useLocalState, useEffect, useRef } from 'react';
import { Layers } from 'lucide-react';
import type { MenuPanelWidthAdaptiveMode } from '../../ui-core/navigation/menuPanelAdaptive';
import { crossClientSync, createScopedSyncedState } from '../stores/crossClientSync';
import { useViewportStore } from '../../ui-core/stores/viewportStore';
const useState = createScopedSyncedState('page:menu-layer-v2');
import { floatingStore, useFloatingStore } from '../../ui-core/stores/floatingStore';
import { type PresetConfig } from '../../ui-core/stores/floatingPresets';
import { TunerConfigExporterBar } from '../components/tuner/TunerConfigExporterBar';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import {
  type ActiveMenuRoute,
  MENU_SANDBOX_JUMP_ITEMS,
} from './menu-layer/menuLayerRouteConfig';
import { MenuLayerRouteSelectorBar } from './menu-layer/MenuLayerRouteSelectorBar';
import { MenuLayerAdaptiveControlDeck } from './menu-layer/MenuLayerAdaptiveControlDeck';
import { MenuLayerScannerAndAuditSection } from './menu-layer/MenuLayerScannerAndAuditSection';
import { MenuLayerStageCanvas } from './menu-layer/MenuLayerStageCanvas';
import { useMenuLayerAdaptiveMetrics } from './menu-layer/useMenuLayerAdaptiveMetrics';
import { useMenuLayerNavigationHandlers } from './menu-layer/useMenuLayerNavigationHandlers';
import { MenuLayerSandboxProvider } from './menu-layer/MenuLayerSandboxContext';
import { RapidReviewTriageBar } from '../components/review/RapidReviewTriageBar';
import type { ShowcaseTab } from '../sidebarNavConfig';

export interface MenuLayerPreviewPageProps {
  isLight?: boolean;
  onNavigateToPlayCards?: () => void;
  /** Cross-page anchor jump callback: from 7A Jump directly to the independent tuning page for the currently active node (6A / L1 / L2 etc) and scroll to */
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  /** Background shadow/Mask transition duration (Unit: ms), default 250ms, Allow modification */
  backdropDuration?: number;
}

export const MenuLayerPreviewPage: React.FC<MenuLayerPreviewPageProps> = ({
  isLight = true,
  onNavigateToPlayCards,
  onNavigateShowcase,
  backdropDuration = 250,
}) => {
  const { renderScale } = useViewportStore();
  const [touchMode, setTouchMode] = useState<boolean>(false, 'touchMode');
  const [bgRenderPaused, setBgRenderPaused] = useState<boolean>(true, 'bgRenderPaused');
  const [feedbackToast, setFeedbackToast] = useLocalState<string | null>(null);
  const [showInlineTuner, setShowInlineTuner] = useLocalState<boolean>(false);
  const [isPillHovered, setIsPillHovered] = useLocalState(false);
  const [ballSimSpeed] = useState(128, 'ballSimSpeed');
  const { windows, isStackDismissed, minimizedCount, totalCount, closeWindow } = useFloatingStore();
  const hasStackIcon = !(isStackDismissed && minimizedCount === 0);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2400);
  };

  const {
    visibilityTier,
    layer1ContextMode,
    setLayer1ContextMode,
    stickySessionContext,
    setStickySessionContext,
    currentRoute,
    displayedRoute,
    transitionMode,
    setTransitionMode,
    settingsTab,
    setSettingsTab,
    garageTab,
    setGarageTab,
    lastParentRoute,
    setLastParentRoute,
    liveAnimPhase,
    setLiveAnimPhase,
    stepPhase,
    layer3StepOverride,
    setLayer3StepOverride,
    activePlaylist,
    activePlaylistIdx,
    activePlaylistStep,
    anchorIndex,
    anchorPlaylistStep,
    isFreeRoaming,
    activeViewRoamLabel,
    auditInfo,
    handleChangeVisibilityTier,
    handleSelectRoute,
    handleTriggerCollapse,
    handleTriggerExpand,
    handleNavigateBack,
    stepPlaylistBy,
    stepPlaylistToIndex,
    handleReturnToAnchor,
  } = useMenuLayerNavigationHandlers({ showToast });

  const isCursorHidden = currentRoute === 'layer-0' && !hasStackIcon;

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useLocalState({ width: 900, height: 620 });
  const [isShaking, setIsShaking] = useLocalState(false);
  const shakeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => {
      setIsShaking(false);
    }, 360);
  };
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);
  useEffect(() => {
    if (!stageRef.current) return;
    const update = () => {
      if (stageRef.current) {
        setStageSize({
          width: stageRef.current.clientWidth,
          height: stageRef.current.clientHeight,
        });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stageRef.current);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [renderScale]);

  const [containerPreset, setContainerPreset] = useState<
    'full' | '1080p-compact' | 'small-squeeze'
  >('full', 'containerPreset');
  const [boundaryLocked, setBoundaryLocked] = useState<boolean>(false, 'boundaryLocked');
  const [manualBoundarySize, setManualBoundarySize] = useState<{
    width: number;
    height: number;
  }>({ width: 960, height: 640 }, 'manualBoundarySize');
  const [widthMode, setWidthMode] = useState<MenuPanelWidthAdaptiveMode>(
    'design-auto-expand',
    'widthMode'
  );
  const [manualMinWidths, setManualMinWidths] = useState<Record<string, number>>(
    {},
    'manualMinWidths'
  );
  const [minWidthDraft, setMinWidthDraft] = useLocalState<string>('');
  const [isEditingMinWidth, setIsEditingMinWidth] = useLocalState<boolean>(false);

  const {
    contentWrapperRef,
    panelOuterRadius,
    getRouteMetricKey,
    resolveRouteGeometry,
  } = useMenuLayerAdaptiveMetrics({
    currentRoute,
    displayedRoute,
    visibilityTier,
    layer1ContextMode,
    touchMode,
    stageSize,
    containerPreset,
    boundaryLocked,
    manualBoundarySize,
    widthMode,
    manualMinWidths,
  });

  const handleAddPresetWindow = (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!stageRef.current) return;
    floatingStore.spawnWithFlight(preset, e.currentTarget, stageRef.current);
    showToast(`[ok] Has set "${preset.title}" Collapse to top-right corner Stack`);
  };

  const isDockState =
    (currentRoute === 'trajectory' || currentRoute === 'camera') &&
    (liveAnimPhase === 'collapsed' ||
      liveAnimPhase === 'collapsing_resize' ||
      liveAnimPhase === 'expanding_content');
  const dockW = 88;
  const dockH = 38;
  const activeRouteSize = resolveRouteGeometry(currentRoute);
  const expandedW = activeRouteSize.width || 480;
  const expandedH = activeRouteSize.height || 540;
  const activeMetricKey = getRouteMetricKey(currentRoute);
  const hasManualMinOverride =
    currentRoute !== 'layer-0' && typeof manualMinWidths[activeMetricKey] === 'number';

  useEffect(() => {
    if (!isEditingMinWidth && currentRoute !== 'layer-0') {
      setMinWidthDraft(String(Math.round(activeRouteSize.effectiveMinWidth)));
    }
  }, [currentRoute, activeMetricKey, activeRouteSize.effectiveMinWidth, isEditingMinWidth]);

  const applyManualMinWidth = (nextVal: number) => {
    if (currentRoute === 'layer-0' || !Number.isFinite(nextVal)) return;
    const clamped = Math.max(260, Math.min(1100, Math.round(nextVal)));
    setManualMinWidths((prev) => ({
      ...prev,
      [activeMetricKey]: clamped,
    }));
    setMinWidthDraft(String(clamped));
  };

  const handleResetAutoMinWidth = () => {
    if (currentRoute === 'layer-0') return;
    setManualMinWidths((prev) => {
      const next = { ...prev };
      delete next[activeMetricKey];
      return next;
    });
    showToast(
      `[ok] Restored ${activeMetricKey} Auto-detect minimum width (${activeRouteSize.autoMinWidth}px)`
    );
  };

  const autoResolvedStageW =
    containerPreset === '1080p-compact'
      ? Math.min(stageSize.width, 760)
      : containerPreset === 'small-squeeze'
      ? Math.min(stageSize.width, 520)
      : stageSize.width;
  const autoResolvedStageH =
    containerPreset === '1080p-compact'
      ? 520
      : containerPreset === 'small-squeeze'
      ? 380
      : currentRoute !== 'layer-0' && !isDockState
      ? Math.max(stageSize.height, 620, Math.min(980, expandedH + 48))
      : Math.max(stageSize.height, 620);

  const effectiveStageW = boundaryLocked ? manualBoundarySize.width : autoResolvedStageW;
  const effectiveStageH = boundaryLocked ? manualBoundarySize.height : autoResolvedStageH;

  const handleToggleBoundaryLock = () => {
    if (!boundaryLocked) {
      const snapW = Math.max(320, Math.round(autoResolvedStageW));
      const snapH = Math.max(260, Math.round(autoResolvedStageH));
      setManualBoundarySize({ width: snapW, height: snapH });
      setBoundaryLocked(true);
      showToast(`[ok] Canvas Boundary Locked at ${snapW}×${snapH}px`);
    } else {
      setBoundaryLocked(false);
      showToast('[ok] Canvas Boundary Unlocked (Auto-Adaptive)');
    }
  };

  const handleChangeManualBoundarySize = (next: { width: number; height: number }) => {
    setManualBoundarySize({
      width: Math.max(320, Math.min(2560, Math.round(next.width))),
      height: Math.max(260, Math.min(1600, Math.round(next.height))),
    });
    setBoundaryLocked(true);
  };

  const xExpanded =
    currentRoute !== 'layer-0'
      ? activeRouteSize.x
      : Math.max(16, Math.round((effectiveStageW - expandedW) / 2));
  const yExpanded =
    currentRoute !== 'layer-0'
      ? activeRouteSize.y
      : Math.max(16, Math.round((effectiveStageH - expandedH) / 2));
  const xDock = Math.max(16, Math.round(effectiveStageW - 16 - dockW));
  const yDock = Math.max(16, Math.round((effectiveStageH - dockH) / 2));
  const targetX = isDockState ? xDock : xExpanded;
  const targetY = isDockState ? yDock : yExpanded;
  const targetW = isDockState ? dockW : expandedW;
  const targetH = isDockState ? dockH : expandedH;
  const targetRadius = isDockState ? 12 : panelOuterRadius;
  const isContentVisible =
    currentRoute !== 'layer-0' &&
    !isDockState &&
    (transitionMode === 'fluid-morph'
      ? liveAnimPhase === 'expanded'
      : stepPhase !== 'fadeOut' && stepPhase !== 'resize' && liveAnimPhase === 'expanded');
  const isPillContentVisible = liveAnimPhase === 'collapsed';

  const sandboxContextValue = {
    stageRef,
    contentWrapperRef,
    containerPreset,
    setContainerPreset,
    boundaryLocked,
    manualBoundarySize,
    setManualBoundarySize,
    effectiveStageW,
    effectiveStageH,
    handleToggleBoundaryLock,
    handleChangeManualBoundarySize,
    isCursorHidden,
    currentRoute,
    displayedRoute,
    isDockState,
    ballSimSpeed,
    hasStackIcon,
    backdropDuration,
    triggerShake,
    showToast,
    feedbackToast,
    handleSelectRoute,
    handleNavigateBack,
    isShaking,
    targetX,
    targetY,
    targetW,
    targetH,
    targetRadius,
    handleTriggerExpand,
    handleTriggerCollapse,
    isPillHovered,
    setIsPillHovered,
    isPillContentVisible,
    isContentVisible,
    visibilityTier,
    handleChangeVisibilityTier,
    layer1ContextMode,
    setLayer1ContextMode,
    stickySessionContext,
    setStickySessionContext,
    touchMode,
    setTouchMode,
    settingsTab,
    setSettingsTab,
    garageTab,
    setGarageTab,
    bgRenderPaused,
    setBgRenderPaused,
    lastParentRoute,
    setLastParentRoute,
    handleAddPresetWindow,
    windows,
    minimizedCount,
    totalCount,
    closeWindow,
    setLiveAnimPhase,
    layer3StepOverride,
    setLayer3StepOverride,
    stepPlaylistBy,
    stepPlaylistToIndex,
    handleReturnToAnchor,
    anchorIndex,
    anchorPlaylistStep,
    isFreeRoaming,
    activeViewRoamLabel,
    activePlaylistIdx,
    activePlaylist,
    activePlaylistStep,
    transitionMode,
    setTransitionMode,
    auditInfo,
    showInlineTuner,
    setShowInlineTuner,
    onNavigateShowcase,
    onNavigateToPlayCards,
    widthMode,
    setWidthMode,
    activeRouteSize,
    minWidthDraft,
    setMinWidthDraft,
    setIsEditingMinWidth,
    hasManualMinOverride,
    applyManualMinWidth,
    handleResetAutoMinWidth,
  };

  const handleReset7ADefaults = () => {
    crossClientSync.resetAll({ scopePrefix: 'page:menu-layer-v2:' });
    showToast('[ok] Reset 7A Menu Layer adaptive engine and route sandbox defaults');
  };

  const build7AExportCode = () => {
    const snapshot = {
      routeState: {
        visibilityTier,
        currentRoute,
        layer1ContextMode,
        settingsTab,
        garageTab,
        transitionMode,
      },
      adaptiveEngine: {
        widthMode,
        containerPreset,
        boundaryLocked,
        effectiveStageSizePx: {
          width: Math.round(effectiveStageW),
          height: Math.round(effectiveStageH),
        },
        manualBoundarySize,
        manualMinWidths,
      },
      stageOptions: {
        touchMode,
        bgRenderPaused,
        ballSimSpeed,
      },
    };
    return `// 7A Menu Layer Adaptive Engine & Route Sandbox Default Snapshot\nexport const DEFAULT_7A_MENU_LAYER_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};`;
  };

  return (
    <MenuLayerSandboxProvider value={sandboxContextValue}>
      <div className="flex flex-col gap-5 w-full">
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">7A · Menu Layer Live Preview</h1>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Static top-pinned View Box stage — all route scanners, boundary locks, and layout tuners operate below the View Box so nothing above it ever changes.
              </p>
            </div>
          </div>
        </div>

        {/* 1. TOP-PINNED VIEW BOX (<MenuLayerStageCanvas />) & BELOW-STAGE SCANNER / ACTION / AUDIT BARS */}
        <div className="flex flex-col gap-3">
          <MenuLayerStageCanvas isLight={isLight} />
          <MenuLayerScannerAndAuditSection isLight={isLight} />
        </div>

        {/* 2. ADAPTIVE ENGINE & ROUTE CONTROL DECKS */}
        <MenuLayerAdaptiveControlDeck isLight={isLight} />
        <MenuLayerRouteSelectorBar isLight={isLight} />

        <TunerConfigExporterBar
          badge="7A-EXPORT"
          title="Menu Layer Adaptive Engine & Route Sandbox One-Click Config Exporter"
          subtitle="Exports 7A adaptive widthMode, canvas boundary lock, manual min-width overrides, transitionMode & active route/tier snapshot"
          copyLabel="Copy 7A Menu Layer Config (Export Snapshot)"
          codeTitle="Current 7A Menu Layer Adaptive & Route Parameter Snapshot (Paste directly into DEFAULT_7A_MENU_LAYER_SNAPSHOT)"
          actionId="export-7a-menu-layer-config"
          isLight={isLight}
          buildExportCode={build7AExportCode}
          onResetDefaults={handleReset7ADefaults}
        />

        <PageJumpDirectory
          title={`7A · Menu Layer Full-link sandbox quick-jump directory (${
            visibilityTier === 'user' ? 'User Only View' : 'Developer Only View'
          })`}
          subtitle="Click any card to immediately load the L6 Menu component into the fluid stage above · Click copy icon to copy standard reference name"
          items={MENU_SANDBOX_JUMP_ITEMS.filter((item) => item.tier === visibilityTier)}
          onSelect={(item) => {
            const r = (item as JumpDirectoryItem & { route?: ActiveMenuRoute }).route;
            if (r) handleSelectRoute(r);
          }}
          isLight={isLight}
        />

        <RapidReviewTriageBar isLight={isLight} />
      </div>
    </MenuLayerSandboxProvider>
  );
};
