import React, { useState as useLocalState, useEffect, useRef } from 'react';
import { ArrowRight, Info, ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { ContainerTransitionMode } from '../../ui-core/navigation/transitions';
import type { MenuPanelWidthAdaptiveMode } from '../../ui-core/navigation/menuPanelAdaptive';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { readUrlParams, updateUrlParams } from '../stores/urlSync';
import { useViewportStore } from '../../ui-core/stores/viewportStore';
const useState = createScopedSyncedState('page:menu-layer-v2');
import { floatingStore, useFloatingStore } from '../../ui-core/stores/floatingStore';
import { type PresetConfig } from '../../ui-core/stores/floatingPresets';
import { resolveLayer1ContextSpec, type Layer1MenuContextMode, } from '../../ui-core/recipes/Layer1MainMenuRecipe';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import { AuditTicketHeader } from '../components/AuditTicketHeader';
import {
  type ActiveMenuRoute, type LayerRouteConfig, type LivePreviewAnimPhase, type MenuVisibilityTier,
  ROUTE_TO_PANEL_ID, MENU_SANDBOX_JUMP_ITEMS, MENU_ROUTE_CONFIG, SETTINGS_QUICK_TABS,
  USER_LINEAR_PLAYLIST, DEV_LINEAR_PLAYLIST, findPlaylistStepIndex, resolveRouteAuditInfo,
  isLayer3RouteAvailable,
} from './menu-layer/menuLayerRouteConfig';
import { MenuLayerRouteSelectorBar } from './menu-layer/MenuLayerRouteSelectorBar';
import { MenuLayerTopHeaderBar, MenuLayerAdaptiveControlDeck, } from './menu-layer/MenuLayerAdaptiveControlDeck';
import { MenuLayerStageCanvas } from './menu-layer/MenuLayerStageCanvas';
import type { Layer3StepOverrideState } from './menu-layer/MenuLayerStageRecipeRouter';
import { useMenuLayerAdaptiveMetrics } from './menu-layer/useMenuLayerAdaptiveMetrics';
import type { ShowcaseTab } from '../Sidebar';
export {
  type ActiveMenuRoute,
  type LayerRouteConfig,
  type LivePreviewAnimPhase,
  type MenuVisibilityTier,
  ROUTE_TO_PANEL_ID,
  MENU_SANDBOX_JUMP_ITEMS,
  MENU_ROUTE_CONFIG,
  SETTINGS_QUICK_TABS,
  isLayer3RouteAvailable,
};

export interface MenuLayerPreviewPageProps {
  isLight?: boolean;
  onNavigateToReserved?: () => void;
  onNavigateToPlayCards?: () => void;
  /** Cross-page anchor jump callback: from 7A Jump directly to the independent tuning page for the currently active node (6A / L1 / L2 etc) and scroll to */
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  /** Background shadow/Mask transition duration (Unit: ms), default 250ms, Allow modification */
  backdropDuration?: number;
}

export const MenuLayerPreviewPage: React.FC<MenuLayerPreviewPageProps> = ({
  isLight = true,
  onNavigateToReserved,
  onNavigateToPlayCards,
  onNavigateShowcase,
  backdropDuration = 250,
}) => {
  const { renderScale } = useViewportStore();
  const contentScale = renderScale / 100;
  const [rawVisibilityTier, setVisibilityTier] = useState<MenuVisibilityTier>(() => {
    const p = readUrlParams();
    return p.tier === 'developer' ? 'developer' : 'user';
  }, 'visibilityTier');
  const visibilityTier: MenuVisibilityTier = rawVisibilityTier === 'developer' ? 'developer' : 'user';
  const [rawLayer1ContextMode, setLayer1ContextMode] = useState<Layer1MenuContextMode>(() => {
    const p = readUrlParams();
    return resolveLayer1ContextSpec(p.ctx).id;
  }, 'layer1ContextMode');
  const layer1ContextMode: Layer1MenuContextMode = resolveLayer1ContextSpec(rawLayer1ContextMode).id;
  const [touchMode, setTouchMode] = useState<boolean>(false, 'touchMode');
  const [rawCurrentRoute, setCurrentRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return p.route && p.route in MENU_ROUTE_CONFIG ? (p.route as ActiveMenuRoute) : 'main-menu';
  }, 'currentRoute');
  const currentRoute: ActiveMenuRoute =
    rawCurrentRoute && rawCurrentRoute in MENU_ROUTE_CONFIG ? rawCurrentRoute : 'main-menu';
  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph', 'transitionMode');
  const [settingsTab, setSettingsTab] = useState<string>(() => {
    const p = readUrlParams();
    return p.route !== 'garage' && p.subtab ? p.subtab : 'gameplay';
  }, 'settingsTab');
  const [rawGarageTab, setGarageTab] = useState<string>(() => {
    const p = readUrlParams();
    return p.route === 'garage' && p.subtab ? p.subtab : 'car';
  }, 'garageTab');
  const garageTab = rawGarageTab === 'player-name' ? 'sync' : rawGarageTab;
  const [bgRenderPaused, setBgRenderPaused] = useState<boolean>(true, 'bgRenderPaused');
  const [feedbackToast, setFeedbackToast] = useLocalState<string | null>(null);
  const [showInlineTuner, setShowInlineTuner] = useLocalState<boolean>(false);
  const [lastParentRoute, setLastParentRoute] = useState<ActiveMenuRoute>('additional-preview', 'lastParentRoute');
  const [routeHistory, setRouteHistory] = useState<ActiveMenuRoute[]>([], 'routeHistory');
  const [liveAnimPhase, setLiveAnimPhase] = useState<LivePreviewAnimPhase>('expanded', 'liveAnimPhase');
  const [isPillHovered, setIsPillHovered] = useLocalState(false);
  const [ballSimSpeed, setBallSimSpeed] = useState(128, 'ballSimSpeed');
  const { windows, isStackDismissed, minimizedCount, totalCount, closeWindow } = useFloatingStore();
  const hasStackIcon = !(isStackDismissed && minimizedCount === 0);
  const isCursorHidden = currentRoute === 'layer-0' && !hasStackIcon;
  const [stepPhase, setStepPhase] = useState<'idle' | 'fadeOut' | 'resize' | 'fadeIn'>('idle', 'stepPhase');
  const [rawDisplayedRoute, setDisplayedRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return p.route && p.route in MENU_ROUTE_CONFIG ? (p.route as ActiveMenuRoute) : 'main-menu';
  }, 'displayedRoute');
  const displayedRoute: ActiveMenuRoute =
    rawDisplayedRoute && rawDisplayedRoute in MENU_ROUTE_CONFIG ? rawDisplayedRoute : currentRoute;
  const isRestoringFromUrlRef = useRef(false);
  const hasMountedUrlSyncRef = useRef(false);
  useEffect(() => {
    const syncFromUrl = () => {
      const p = readUrlParams();
      if (!p.route && !p.tier && !p.subtab && !p.ctx) return;
      isRestoringFromUrlRef.current = true;
      if (p.tier === 'user' || p.tier === 'developer') {
        setVisibilityTier(p.tier);
      }
      if (p.route && p.route in MENU_ROUTE_CONFIG) {
        const nextRoute = p.route as ActiveMenuRoute;
        setCurrentRoute(nextRoute);
        setDisplayedRoute(nextRoute);
      }
      if (p.subtab) {
        if (p.route === 'garage') {
          setGarageTab(p.subtab);
        } else {
          setSettingsTab(p.subtab);
        } }
      if (p.ctx) {
        setLayer1ContextMode(resolveLayer1ContextSpec(p.ctx).id);
      } };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);
  useEffect(() => {
    const subtab =
      currentRoute === 'settings' ? settingsTab
        : currentRoute === 'garage' ? garageTab
        : null;
    const shouldPush = hasMountedUrlSyncRef.current && !isRestoringFromUrlRef.current;
    hasMountedUrlSyncRef.current = true;
    isRestoringFromUrlRef.current = false;
    updateUrlParams(
      { tier: visibilityTier, route: currentRoute,
        subtab, ctx: currentRoute === 'main-menu' ? layer1ContextMode : null },
      { push: shouldPush }
    );
  }, [visibilityTier, currentRoute, settingsTab, garageTab, layer1ContextMode]);
  const handleChangeVisibilityTier = (nextTier: MenuVisibilityTier) => {
    setVisibilityTier(nextTier);
    if (nextTier === 'developer') {
      if (layer1ContextMode !== 'dev-test-lab' && layer1ContextMode !== 'exp-multi-bots') {
        setLayer1ContextMode('dev-test-lab');
      } setSettingsTab('developer');
      const cfg = MENU_ROUTE_CONFIG[currentRoute];
      if (cfg && cfg.tier === 'user') {
        setCurrentRoute('settings');
        setDisplayedRoute('settings');
      } } else {
      if (layer1ContextMode === 'dev-test-lab' || layer1ContextMode === 'exp-multi-bots') {
        setLayer1ContextMode('freeplay');
      }
      if (settingsTab === 'developer') {
        setSettingsTab('gameplay');
      }
      const cfg = MENU_ROUTE_CONFIG[currentRoute];
      if (cfg && cfg.tier === 'developer') {
        setCurrentRoute('main-menu');
        setDisplayedRoute('main-menu');
      } }
  };
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
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2400);
  };
  useEffect(() => {
    if (!stageRef.current) return;
    const update = () => {
      if (stageRef.current) {
        setStageSize({
          width: stageRef.current.clientWidth, height: stageRef.current.clientHeight,
        });
      } };
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
  const [boundaryLocked, setBoundaryLocked] = useState<boolean>(
    false,
    'boundaryLocked'
  );
  const [manualBoundarySize, setManualBoundarySize] = useState<{
    width: number;
    height: number;
  }>({ width: 960, height: 640 }, 'manualBoundarySize');
  const [widthMode, setWidthMode] = useState<MenuPanelWidthAdaptiveMode>(
    'design-auto-expand', 'widthMode'
  );
  const [manualMinWidths, setManualMinWidths] = useState<Record<string, number>>(
    {},
    'manualMinWidths'
  );
  const [minWidthDraft, setMinWidthDraft] = useLocalState<string>('');
  const [isEditingMinWidth, setIsEditingMinWidth] = useLocalState<boolean>(false);
  const {
    contentWrapperRef, panelOuterRadius,
    getRouteMetricKey, resolveRouteGeometry,
  } = useMenuLayerAdaptiveMetrics({
    currentRoute, displayedRoute,
    visibilityTier, layer1ContextMode,
    touchMode, stageSize,
    containerPreset,
    boundaryLocked,
    manualBoundarySize,
    widthMode,
    manualMinWidths,
  });
  const handleSelectRoute = (
    targetRoute: ActiveMenuRoute, options?: { pushHistory?: boolean }
  ) => {
    if (targetRoute === currentRoute) return;
    const shouldPush = options?.pushHistory !== false;
    if (shouldPush && currentRoute !== 'layer-0' && targetRoute !== 'layer-0') {
      setRouteHistory((prev) => {
        const filtered = prev[prev.length - 1] === currentRoute ? prev : [...prev, currentRoute];
        return filtered.slice(-16);
      });
    } else if (targetRoute === 'layer-0' || targetRoute === 'main-menu') {
      setRouteHistory([]);
    }
    if (liveAnimPhase !== 'expanded') {
      setLiveAnimPhase('expanded');
    }
    if (currentRoute === 'layer-0' && targetRoute !== 'layer-0') {
      floatingStore.triggerBatchMinimize();
    }
    if (transitionMode === 'fluid-morph') {
      setCurrentRoute(targetRoute);
      setDisplayedRoute(targetRoute);
      return;
    }
    setStepPhase('fadeOut');
    setTimeout(() => {
      setCurrentRoute(targetRoute);
      setDisplayedRoute(targetRoute);
      setStepPhase('resize');
      setTimeout(() => {
        setStepPhase('fadeIn');
        setTimeout(() => {
          setStepPhase('idle');
        }, 100);
      }, 150);
    }, 100);
  };
  const handleTriggerCollapse = () => {
    if (liveAnimPhase !== 'expanded') return;
    setLiveAnimPhase('collapsing_content');
    setTimeout(() => {
      setLiveAnimPhase('collapsing_resize');
      setTimeout(() => {
        setLiveAnimPhase('collapsed');
      }, 260);
    }, 100);
  };
  const handleTriggerExpand = () => {
    if (liveAnimPhase !== 'collapsed') return;
    setLiveAnimPhase('expanding_content');
    setTimeout(() => {
      setLiveAnimPhase('expanding_resize');
      setTimeout(() => {
        setLiveAnimPhase('expanded');
      }, 260);
    }, 80);
  };
  const handleToggleLivePreview = () => {
    if (liveAnimPhase === 'expanded') {
      handleTriggerCollapse();
    } else if (liveAnimPhase === 'collapsed') {
      handleTriggerExpand();
    }
  };
  const handleNavigateBack = () => {
    if (currentRoute === 'layer-0') {
      floatingStore.triggerBatchMinimize();
      handleSelectRoute('main-menu', { pushHistory: false });
      showToast('ESC: Open Main Menu (Expanded floating window collapsed)');
      return;
    }
    if (currentRoute === 'main-menu') {
      handleSelectRoute('layer-0', { pushHistory: false });
      showToast('ESC: Return to game (Layer 0)');
      return;
    }
    if (
      (currentRoute === 'trajectory' || currentRoute === 'camera') && liveAnimPhase === 'collapsed'
    ) {
      handleTriggerExpand();
      return;
    }
    if (routeHistory.length > 0) {
      const prevRoute = routeHistory[routeHistory.length - 1];
      setRouteHistory((prev) => prev.slice(0, -1));
      handleSelectRoute(prevRoute, { pushHistory: false });
      return;
    }
    const fallbackParent =
      MENU_ROUTE_CONFIG[currentRoute]?.parentRoute ?? 'main-menu';
    handleSelectRoute(fallbackParent, { pushHistory: false });
  };
  const [layer3StepOverride, setLayer3StepOverride] = useState<Layer3StepOverrideState>(
    { progressStatus: 'idle', currentStep: 1, defaultEditingConfig: false },
    'layer3StepOverride'
  );
  const activePlaylist = visibilityTier === 'user' ? USER_LINEAR_PLAYLIST : DEV_LINEAR_PLAYLIST;
  const activePlaylistIdx = findPlaylistStepIndex(
    activePlaylist,
    currentRoute,
    layer1ContextMode,
    settingsTab,
    garageTab,
    layer3StepOverride
  );
  const activePlaylistStep = activePlaylist[activePlaylistIdx] || activePlaylist[0];
  const auditInfo = resolveRouteAuditInfo(currentRoute, visibilityTier);

  const stepPlaylistBy = (delta: 1 | -1) => {
    const nextIdx = (activePlaylistIdx + delta + activePlaylist.length) % activePlaylist.length;
    const step = activePlaylist[nextIdx];
    if (!step) return;
    if (step.contextMode) setLayer1ContextMode(step.contextMode);
    if (step.route === 'settings' && step.subtab) setSettingsTab(step.subtab);
    if (step.route === 'garage' && step.subtab) setGarageTab(step.subtab);
    setLayer3StepOverride({
      progressStatus: step.progressStatus ?? 'idle',
      currentStep: step.currentStep ?? 1,
      defaultEditingConfig: Boolean(step.defaultEditingConfig),
    });
    handleSelectRoute(step.route);
    showToast(`[${nextIdx + 1}/${activePlaylist.length}] ${step.label}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);
      if (e.key === 'Tab') {
        if (currentRoute === 'trajectory' || currentRoute === 'camera') {
          e.preventDefault();
          handleToggleLivePreview();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleNavigateBack();
      } else if (!isEditable && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        stepPlaylistBy(e.key === 'ArrowRight' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentRoute,
    liveAnimPhase,
    lastParentRoute,
    routeHistory,
    activePlaylist,
    activePlaylistIdx,
  ]);
  const handleAddPresetWindow = (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!stageRef.current) return;
    floatingStore.spawnWithFlight(preset, e.currentTarget, stageRef.current);
    showToast(`[ok] Has set "${preset.title}" Collapse to top-right corner Stack`);
  };
  const isDockState = 
    (currentRoute === 'trajectory' || currentRoute === 'camera') && 
    (liveAnimPhase === 'collapsed' || liveAnimPhase === 'collapsing_resize' || liveAnimPhase === 'expanding_content');
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
  }, [
    currentRoute, activeMetricKey,
    activeRouteSize.effectiveMinWidth, isEditingMinWidth,
  ]);
  const applyManualMinWidth = (nextVal: number) => {
    if (currentRoute === 'layer-0' || !Number.isFinite(nextVal)) return;
    const clamped = Math.max(260, Math.min(1100, Math.round(nextVal)));
    setManualMinWidths((prev) => ({
      ...prev, [activeMetricKey]: clamped,
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
    showToast( `[ok] Restored ${activeMetricKey} Auto-detect minimum width (${activeRouteSize.autoMinWidth}px)`
    );
  };
  const autoResolvedStageW =
    containerPreset === '1080p-compact' ? Math.min(stageSize.width, 760)
      : containerPreset === 'small-squeeze' ? Math.min(stageSize.width, 520)
      : stageSize.width;
  const autoResolvedStageH =
    containerPreset === '1080p-compact' ? 520
      : containerPreset === 'small-squeeze' ? 380
      : currentRoute !== 'layer-0' && !isDockState
      ? Math.max(stageSize.height, 620, Math.min(980, expandedH + 48)) : Math.max(stageSize.height, 620);

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
    currentRoute !== 'layer-0' ? activeRouteSize.x
      : Math.max(16, Math.round((effectiveStageW - expandedW) / 2));
  const yExpanded =
    currentRoute !== 'layer-0' ? activeRouteSize.y
      : Math.max(16, Math.round((effectiveStageH - expandedH) / 2));
  const xDock = Math.max(16, Math.round(effectiveStageW - 16 - dockW));
  const yDock = Math.max(16, Math.round((effectiveStageH - dockH) / 2));
  const targetX = isDockState ? xDock : xExpanded;
  const targetY = isDockState ? yDock : yExpanded;
  const targetW = isDockState ? dockW : expandedW;
  const targetH = isDockState ? dockH : expandedH;
  const targetRadius = isDockState ? 12 : panelOuterRadius;
  const isContentVisible = 
    currentRoute !== 'layer-0' && !isDockState &&
    (transitionMode === 'fluid-morph' ? liveAnimPhase === 'expanded' : stepPhase !== 'fadeOut' && stepPhase !== 'resize' && liveAnimPhase === 'expanded');
  const isPillContentVisible = liveAnimPhase === 'collapsed';
  return (
    <div className="flex flex-col gap-5 w-full">
      <MenuLayerTopHeaderBar isLight={isLight} currentRoute={currentRoute} transitionMode={transitionMode}
        setTransitionMode={setTransitionMode} showToast={showToast} />

      {/* 1. TOP-PINNED PREVIEW STAGE & LINEAR SCANNER BAR (Placed at the very top so control deck layout recomputes below never shift or bounce the stage) */}
      <div className="flex flex-col gap-3">
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
                onClick={() => handleChangeVisibilityTier('user')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                  visibilityTier === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                User ({USER_LINEAR_PLAYLIST.length})
              </button>
              <button
                type="button"
                onClick={() => handleChangeVisibilityTier('developer')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                  visibilityTier === 'developer'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                Dev ({DEV_LINEAR_PLAYLIST.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => stepPlaylistBy(-1)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border font-bold cursor-pointer transition-all active:scale-95 ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
              }`}
              title="Previous page in linear inspection playlist (ArrowLeft ←)"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev (←)</span>
            </button>

            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
              [{activePlaylistIdx + 1}/{activePlaylist.length}] {activePlaylistStep?.label || currentRoute}
            </span>

            <button
              type="button"
              onClick={() => stepPlaylistBy(1)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border font-bold cursor-pointer transition-all active:scale-95 ${
                isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
              }`}
              title="Next page in linear inspection playlist (ArrowRight →)"
            >
              <span>Next (→)</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Top Quick Canvas Boundary Manual / Lock W×H */}
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
                value={Math.round(effectiveStageW)}
                onChange={(e) =>
                  handleChangeManualBoundarySize({
                    width: Number(e.target.value) || effectiveStageW,
                    height: effectiveStageH,
                  })
                }
                className={`w-14 px-1 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                  isLight
                    ? 'bg-white border-neutral-300 text-neutral-900'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                }`}
                title="Canvas Boundary Width (px)"
              />
              <span className="opacity-60">×</span>
              <input
                type="number"
                min={260}
                max={1600}
                step={10}
                value={Math.round(effectiveStageH)}
                onChange={(e) =>
                  handleChangeManualBoundarySize({
                    width: effectiveStageW,
                    height: Number(e.target.value) || effectiveStageH,
                  })
                }
                className={`w-14 px-1 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                  isLight
                    ? 'bg-white border-neutral-300 text-neutral-900'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                }`}
                title="Canvas Boundary Height (px)"
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
                title={
                  boundaryLocked
                    ? 'Unlock Canvas Boundary (return to auto-adaptive stage size)'
                    : 'Lock current Canvas Boundary W×H so stepping through pages never jumps or resizes the stage'
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
                    <span>Lock W×H</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={`px-3.5 py-2.5 rounded-xl border ${isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/80 border-neutral-800'}`}>
          <AuditTicketHeader
            index={activePlaylistIdx + 1}
            label={activePlaylistStep?.label || MENU_ROUTE_CONFIG[currentRoute]?.label || currentRoute}
            description={activePlaylistStep?.breadcrumb}
            referenceCode={auditInfo.referenceCode}
            componentName={auditInfo.componentName}
            sourceFile={auditInfo.sourceFile}
            stateId={activePlaylistStep?.id || currentRoute}
            activeProps={{
              route: currentRoute,
              tier: visibilityTier,
              ...(currentRoute === 'main-menu' || currentRoute === 'room-host-control' ? { contextMode: layer1ContextMode } : {}),
              ...(currentRoute === 'settings' ? { activeTab: settingsTab } : {}),
              ...(currentRoute === 'garage' ? { activeTab: garageTab } : {}),
              ...(currentRoute === 'host-match' || currentRoute === 'host-training' || currentRoute === 'join-room'
                ? {
                    progressStatus: layer3StepOverride.progressStatus ?? 'idle',
                    currentStep: layer3StepOverride.currentStep ?? 1,
                    ...(currentRoute === 'host-match' ? { defaultEditingConfig: Boolean(layer3StepOverride.defaultEditingConfig) } : {}),
                  }
                : {}),
            }}
            badgeColor={visibilityTier === 'user' ? 'emerald' : 'amber'}
            tunerStatus={auditInfo.tunerStatus}
            isLight={isLight}
          />
        </div>

        <MenuLayerStageCanvas isLight={isLight} stageRef={stageRef} contentWrapperRef={contentWrapperRef}
          containerPreset={containerPreset} boundaryLocked={boundaryLocked} manualBoundarySize={manualBoundarySize}
          isCursorHidden={isCursorHidden} currentRoute={currentRoute}
          displayedRoute={displayedRoute} isDockState={isDockState} ballSimSpeed={ballSimSpeed}
          hasStackIcon={hasStackIcon} backdropDuration={backdropDuration} triggerShake={triggerShake}
          showToast={showToast} handleSelectRoute={handleSelectRoute} handleNavigateBack={handleNavigateBack}
          isShaking={isShaking} targetX={targetX} targetY={targetY} targetW={targetW} targetH={targetH}
          targetRadius={targetRadius} handleTriggerExpand={handleTriggerExpand}
          handleTriggerCollapse={handleTriggerCollapse} isPillHovered={isPillHovered}
          setIsPillHovered={setIsPillHovered} isPillContentVisible={isPillContentVisible}
          isContentVisible={isContentVisible} visibilityTier={visibilityTier}
          handleChangeVisibilityTier={handleChangeVisibilityTier} layer1ContextMode={layer1ContextMode}
          setLayer1ContextMode={setLayer1ContextMode} touchMode={touchMode} setTouchMode={setTouchMode}
          settingsTab={settingsTab} setSettingsTab={setSettingsTab} garageTab={garageTab} setGarageTab={setGarageTab}
          bgRenderPaused={bgRenderPaused} setBgRenderPaused={setBgRenderPaused} lastParentRoute={lastParentRoute}
          setLastParentRoute={setLastParentRoute} handleAddPresetWindow={handleAddPresetWindow} windows={windows}
          minimizedCount={minimizedCount} totalCount={totalCount} closeWindow={closeWindow}
          setLiveAnimPhase={setLiveAnimPhase} layer3StepOverride={layer3StepOverride} />
      </div>

      {/* 2. ADAPTIVE ENGINE & ROUTE CONTROL DECKS (Below the preview stage so layout recomputations never push the stage) */}
      <MenuLayerAdaptiveControlDeck isLight={isLight} currentRoute={currentRoute} settingsTab={settingsTab}
        garageTab={garageTab} layer1ContextMode={layer1ContextMode} setLayer1ContextMode={setLayer1ContextMode}
        showInlineTuner={showInlineTuner} setShowInlineTuner={setShowInlineTuner}
        onNavigateShowcase={onNavigateShowcase} widthMode={widthMode} setWidthMode={setWidthMode}
        isDockState={isDockState} targetW={targetW} targetH={targetH} activeRouteSize={activeRouteSize}
        minWidthDraft={minWidthDraft} setMinWidthDraft={setMinWidthDraft}
        setIsEditingMinWidth={setIsEditingMinWidth} hasManualMinOverride={hasManualMinOverride}
        applyManualMinWidth={applyManualMinWidth} handleResetAutoMinWidth={handleResetAutoMinWidth}
        containerPreset={containerPreset} setContainerPreset={setContainerPreset}
        effectiveStageW={effectiveStageW} effectiveStageH={effectiveStageH}
        boundaryLocked={boundaryLocked} onToggleBoundaryLock={handleToggleBoundaryLock}
        manualBoundarySize={manualBoundarySize} onChangeManualBoundarySize={handleChangeManualBoundarySize} />

      <MenuLayerRouteSelectorBar
        isLight={isLight} visibilityTier={visibilityTier}
        onChangeVisibilityTier={handleChangeVisibilityTier} layer1ContextMode={layer1ContextMode}
        onChangeLayer1ContextMode={setLayer1ContextMode} touchMode={touchMode}
        onToggleTouchMode={setTouchMode} currentRoute={currentRoute}
        handleSelectRoute={handleSelectRoute} settingsTab={settingsTab}
        setSettingsTab={setSettingsTab} garageTab={garageTab}
        setGarageTab={setGarageTab} showToast={showToast}
        isDockState={isDockState} activeRouteSizeModeLabel={activeRouteSize.modeLabel}
        feedbackToast={feedbackToast} onNavigateToPlayCards={onNavigateToPlayCards}
        onNavigateShowcase={onNavigateShowcase} showInlineTuner={showInlineTuner}
        onToggleInlineTuner={() => setShowInlineTuner((prev) => !prev)}
        layer3StepOverride={layer3StepOverride}
        onChangeLayer3StepOverride={setLayer3StepOverride} />

      <PageJumpDirectory
        title={`7A · Menu Layer Full-link sandbox quick-jump directory (${visibilityTier === 'user' ? 'User Only View' : 'Developer Only View'})`}
        subtitle="Click any card to immediately load the L6 Menu component into the fluid stage above · Click copy icon to copy standard reference name"
        items={MENU_SANDBOX_JUMP_ITEMS.filter((item) => item.tier === visibilityTier)} onSelect={(item) => {
        const r = (item as JumpDirectoryItem & { route?: ActiveMenuRoute }).route; if (r) handleSelectRoute(r); }}
        isLight={isLight} />

      {/* Bottom navigation bar */}
      {onNavigateToReserved && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
          isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800' }`}>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-500 shrink-0" />
            <span className={isLight ? 'text-neutral-600' : 'text-neutral-400'}>
              Post-game summary (Match Post) and telemetry data (Match Stats) Candidates not yet included in the main match are kept on the candidate page. 
            </span>
          </div>
          <button type="button" onClick={onNavigateToReserved}
            className="flex items-center gap-1 font-semibold text-amber-500 hover:text-amber-400 cursor-pointer shrink-0 transition-colors">
            <span>View battle report standards</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
