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
  type ActiveMenuRoute,
  type LivePreviewAnimPhase,
  type MenuVisibilityTier,
} from './menuLayerRouteConfig';
import {
  USER_LINEAR_PLAYLIST,
  DEV_LINEAR_PLAYLIST,
  findPlaylistStepIndex,
  resolveRouteAuditInfo,
} from './menuLayerLinearPlaylists';
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

  const [rawLayer1ContextMode, setLayer1ContextMode] = useState<Layer1MenuContextMode>(() => {
    const p = readUrlParams();
    return resolveLayer1ContextSpec(p.ctx).id;
  }, 'layer1ContextMode');
  const layer1ContextMode: Layer1MenuContextMode =
    resolveLayer1ContextSpec(rawLayer1ContextMode).id;

  const [rawCurrentRoute, setCurrentRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return p.route && p.route in MENU_ROUTE_CONFIG ? (p.route as ActiveMenuRoute) : 'main-menu';
  }, 'currentRoute');
  const currentRoute: ActiveMenuRoute =
    rawCurrentRoute && rawCurrentRoute in MENU_ROUTE_CONFIG ? rawCurrentRoute : 'main-menu';

  const [rawDisplayedRoute, setDisplayedRoute] = useState<ActiveMenuRoute>(() => {
    const p = readUrlParams();
    return p.route && p.route in MENU_ROUTE_CONFIG ? (p.route as ActiveMenuRoute) : 'main-menu';
  }, 'displayedRoute');
  const displayedRoute: ActiveMenuRoute =
    rawDisplayedRoute && rawDisplayedRoute in MENU_ROUTE_CONFIG ? rawDisplayedRoute : currentRoute;

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
    { progressStatus: 'idle', currentStep: 1, defaultEditingConfig: false },
    'layer3StepOverride'
  );

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
    layer1ContextMode,
    setLayer1ContextMode,
  });

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

  const handleChangeVisibilityTier = (nextTier: MenuVisibilityTier) => {
    setVisibilityTier(nextTier);
    if (nextTier === 'developer') {
      if (layer1ContextMode !== 'dev-test-lab' && layer1ContextMode !== 'exp-multi-bots') {
        setLayer1ContextMode('dev-test-lab');
      }
      setSettingsTab('developer');
      const cfg = MENU_ROUTE_CONFIG[currentRoute];
      if (cfg && cfg.tier === 'user') {
        setCurrentRoute('settings');
        setDisplayedRoute('settings');
      }
    } else {
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
      }
    }
  };

  const handleSelectRoute = (
    targetRoute: ActiveMenuRoute,
    options?: { pushHistory?: boolean }
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
          layer1ContextMode === 'static-training-edit'
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
    layer1ContextMode,
    liveAnimPhase,
    lastParentRoute,
    routeHistory,
    activePlaylist,
    activePlaylistIdx,
  ]);

  return {
    visibilityTier,
    layer1ContextMode,
    setLayer1ContextMode,
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
    auditInfo,
    handleChangeVisibilityTier,
    handleSelectRoute,
    handleTriggerCollapse,
    handleTriggerExpand,
    handleNavigateBack,
    stepPlaylistBy,
  };
}
