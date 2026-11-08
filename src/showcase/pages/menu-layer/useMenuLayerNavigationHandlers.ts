import { useEffect } from 'react';
import { dialogue } from '../../../ui-core/compounds/dialogue/dialogueStore';
import { floatingStore } from '../../../ui-core/stores/floatingStore';
import { useStaticTrainingPackStore } from '../../../ui-core/stores/staticTrainingPackStore';
import type { ContainerTransitionMode } from '../../../ui-core/tokens/easing';
import {
  resolveLayer1ContextSpec,
  type Layer1MenuContextMode,
} from '../../../ui-core/recipes/layer1MenuContextSpecs';
import { createScopedSyncedState } from '../../stores/crossClientSync';
import { readUrlParams } from '../../stores/urlSync';
import type { Layer3StepOverrideState } from './MenuLayerStageRecipeRouter';
import {
  MENU_ROUTE_CONFIG,
  normalizeMenuRoute,
  type ActiveMenuRoute,
  type LinearPlaylistStep,
  type LivePreviewAnimPhase,
  type MenuVisibilityTier,
} from './menuLayerRouteConfig';
import {
  USER_LINEAR_PLAYLIST,
  DEV_LINEAR_PLAYLIST,
  findPlaylistStepIndex,
  resolveRouteAuditInfo,
} from './menuLayerLinearPlaylists';
import {
  doesViewMatchPlaylistStep,
  formatActiveViewRoamLabel,
} from './menuLayerFreeRoamUtils';
import { useMenuLayerUrlSync } from './useMenuLayerUrlSync';

const useState = createScopedSyncedState('page:menu-layer-v2');

export interface UseMenuLayerNavigationHandlersParams {
  showToast: (msg: string) => void;
}

export function useMenuLayerNavigationHandlers({
  showToast,
}: UseMenuLayerNavigationHandlersParams) {
  const [rawVisibilityTier, setVisibilityTier] = useState<MenuVisibilityTier>(() => {
    const p = readUrlParams();
    return p.tier === 'developer' ? 'developer' : 'user';
  }, 'visibilityTier');
  const visibilityTier: MenuVisibilityTier =
    rawVisibilityTier === 'developer' ? 'developer' : 'user';

  const [rawStickySessionContext, setRawStickySessionContext] =
    useState<Layer1MenuContextMode>(() => {
      const p = readUrlParams();
      return resolveLayer1ContextSpec(p.ctx).id;
    }, 'layer1ContextMode');
  const stickySessionContext = resolveLayer1ContextSpec(rawStickySessionContext).id;
  const layer1ContextMode: Layer1MenuContextMode = stickySessionContext;
  const setStickySessionContext = (mode: Layer1MenuContextMode) => {
    setRawStickySessionContext(resolveLayer1ContextSpec(mode).id);
  };
  const setLayer1ContextMode = setStickySessionContext;

  const [rawCurrentRoute, setCurrentRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return normalizeMenuRoute(p.route) ?? 'main-menu';
  }, 'currentRoute');
  const currentRoute: ActiveMenuRoute = normalizeMenuRoute(rawCurrentRoute) ?? 'main-menu';

  const [rawDisplayedRoute, setDisplayedRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return normalizeMenuRoute(p.route) ?? 'main-menu';
  }, 'displayedRoute');
  const displayedRoute: ActiveMenuRoute = normalizeMenuRoute(rawDisplayedRoute) ?? currentRoute;

  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>(
    'fluid-morph',
    'transitionMode'
  );
  const [settingsTab, setSettingsTab] = useState<string>(() => {
    const p = readUrlParams();
    return p.route !== 'garage' && p.subtab ? p.subtab : 'gameplay';
  }, 'settingsTab');
  const [garageTab, setGarageTab] = useState<string>(() => {
    const p = readUrlParams();
    return p.route === 'garage' && p.subtab ? p.subtab : 'car';
  }, 'garageTab');

  const [lastParentRoute, setLastParentRoute] = useState<ActiveMenuRoute>(
    'main-menu',
    'lastParentRoute'
  );
  const [routeHistory, setRouteHistory] = useState<ActiveMenuRoute[]>([], 'routeHistory');
  const [liveAnimPhase, setLiveAnimPhase] = useState<LivePreviewAnimPhase>(
    'expanded',
    'liveAnimPhase'
  );
  const [stepPhase, setStepPhase] = useState<'idle' | 'fadeOut' | 'resize' | 'fadeIn'>(
    'idle',
    'stepPhase'
  );
  const [layer3StepOverride, setLayer3StepOverride] = useState<Layer3StepOverrideState>(
    { progressStatus: 'idle', currentStep: 1, defaultEditingConfig: false, memberSlots: 3 },
    'layer3StepOverride'
  );

  const activePlaylist = visibilityTier === 'user' ? USER_LINEAR_PLAYLIST : DEV_LINEAR_PLAYLIST;

  const [rawAnchorIndex, setAnchorIndex] = useState<number>(() => {
    const p = readUrlParams();
    const initTier = p.tier === 'developer' ? 'developer' : 'user';
    const initPlaylist = initTier === 'user' ? USER_LINEAR_PLAYLIST : DEV_LINEAR_PLAYLIST;
    const initRoute = normalizeMenuRoute(p.route) ?? 'main-menu';
    const initCtx = resolveLayer1ContextSpec(p.ctx).id;
    const initSettingsTab = p.route !== 'garage' && p.subtab ? p.subtab : 'gameplay';
    const initGarageTab = p.route === 'garage' && p.subtab ? p.subtab : 'car';
    return findPlaylistStepIndex(
      initPlaylist,
      initRoute,
      initCtx,
      initSettingsTab,
      initGarageTab
    );
  }, 'anchorIndex');

  const anchorIndex = Math.max(0, Math.min(activePlaylist.length - 1, rawAnchorIndex));
  const anchorPlaylistStep = activePlaylist[anchorIndex] || activePlaylist[0];

  const activeViewSummary = {
    route: currentRoute,
    contextMode: stickySessionContext,
    settingsTab,
    garageTab,
    layer3StepOverride,
  };

  const isFreeRoaming = !doesViewMatchPlaylistStep(anchorPlaylistStep, activeViewSummary);
  const activeViewRoamLabel = formatActiveViewRoamLabel(activeViewSummary);

  const matchedStepIdx = findPlaylistStepIndex(
    activePlaylist,
    currentRoute,
    stickySessionContext,
    settingsTab,
    garageTab,
    layer3StepOverride
  );
  const activePlaylistIdx = anchorIndex;
  const activePlaylistStep =
    (doesViewMatchPlaylistStep(activePlaylist[matchedStepIdx], activeViewSummary)
      ? activePlaylist[matchedStepIdx]
      : undefined) || anchorPlaylistStep;

  useMenuLayerUrlSync({
    visibilityTier,
    setVisibilityTier,
    currentRoute,
    setCurrentRoute,
    setDisplayedRoute,
    settingsTab,
    setSettingsTab,
    garageTab,
    setGarageTab,
    layer1ContextMode: stickySessionContext,
    setLayer1ContextMode: setStickySessionContext,
  });

  const auditInfo = resolveRouteAuditInfo(currentRoute, visibilityTier);

  const applyPlaylistStepState = (step: LinearPlaylistStep, nextIdx: number) => {
    setAnchorIndex(nextIdx);
    setRouteHistory([]);
    if (step.contextMode) {
      setStickySessionContext(step.contextMode);
    }
    if (step.route === 'settings' && step.subtab) setSettingsTab(step.subtab);
    if (step.route === 'garage' && step.subtab) setGarageTab(step.subtab);
    setLayer3StepOverride({
      progressStatus: step.progressStatus ?? 'idle',
      currentStep: step.currentStep ?? 1,
      defaultEditingConfig: Boolean(step.defaultEditingConfig),
      memberSlots: step.memberSlots ?? layer3StepOverride.memberSlots ?? 3,
    });
    handleSelectRoute(step.route, { pushHistory: false });
  };

  const handleChangeVisibilityTier = (nextTier: MenuVisibilityTier) => {
    setVisibilityTier(nextTier);
    setAnchorIndex(0);
    setRouteHistory([]);
    if (nextTier === 'developer') {
      if (stickySessionContext !== 'dev-test-lab' && stickySessionContext !== 'exp-multi-bots') {
        setStickySessionContext('dev-test-lab');
      }
      setSettingsTab('developer');
      const cfg = MENU_ROUTE_CONFIG[currentRoute];
      if (cfg && cfg.tier === 'user') {
        setCurrentRoute('settings');
        setDisplayedRoute('settings');
      }
    } else {
      if (stickySessionContext === 'dev-test-lab' || stickySessionContext === 'exp-multi-bots') {
        setStickySessionContext('freeplay');
      }
      if (settingsTab === 'developer') {
        setSettingsTab('gameplay');
      }
      const cfg = MENU_ROUTE_CONFIG[currentRoute];
      if (cfg && cfg.tier === 'developer') {
        setCurrentRoute('main-menu');
        setDisplayedRoute('main-menu');
      }
    }
  };

  const handleSelectRoute = (
    rawTargetRoute: ActiveMenuRoute,
    options?: { pushHistory?: boolean }
  ) => {
    const targetRoute = normalizeMenuRoute(rawTargetRoute) ?? rawTargetRoute;
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
      (currentRoute === 'trajectory' || currentRoute === 'camera') &&
      liveAnimPhase === 'collapsed'
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
    const fallbackParent = MENU_ROUTE_CONFIG[currentRoute]?.parentRoute ?? 'main-menu';
    handleSelectRoute(fallbackParent, { pushHistory: false });
  };

  const stepPlaylistToIndex = (rawIndex: number) => {
    const nextIdx = (rawIndex + activePlaylist.length) % activePlaylist.length;
    const step = activePlaylist[nextIdx];
    if (!step) return;
    applyPlaylistStepState(step, nextIdx);
    showToast(`[${nextIdx + 1}/${activePlaylist.length}] ${step.label}`);
  };

  const stepPlaylistBy = (delta: 1 | -1) => {
    stepPlaylistToIndex(anchorIndex + delta);
  };

  const handleReturnToAnchor = () => {
    const step = activePlaylist[anchorIndex];
    if (!step) return;
    applyPlaylistStepState(step, anchorIndex);
    showToast(`Returned to #${anchorIndex + 1} ${step.label}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || dialogue.getCount() > 0) return;
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
        } else if (
          currentRoute === 'layer-0' &&
          stickySessionContext === 'static-training-edit'
        ) {
          e.preventDefault();
          useStaticTrainingPackStore.getState().toggleEdgeInspectorExpanded();
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
    stickySessionContext,
    liveAnimPhase,
    lastParentRoute,
    routeHistory,
    activePlaylist,
    anchorIndex,
  ]);

  return {
    visibilityTier,
    layer1ContextMode: stickySessionContext,
    setLayer1ContextMode: setStickySessionContext,
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
  };
}
