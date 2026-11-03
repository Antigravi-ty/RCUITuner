import { useEffect } from 'react';
import { floatingStore } from '../../../ui-core/stores/floatingStore';
import type { ContainerTransitionMode } from '../../../ui-core/tokens/easing';
import type { Layer1MenuContextMode } from '../../../ui-core/recipes/layer1MenuContextSpecs';
import type { Layer3StepOverrideState } from './MenuLayerStageRecipeRouter';
import {
  MENU_ROUTE_CONFIG,
  type ActiveMenuRoute,
  type LivePreviewAnimPhase,
  type MenuVisibilityTier,
  type LinearPlaylistStep,
} from './menuLayerRouteConfig';

export interface UseMenuLayerNavigationHandlersParams {
  currentRoute: ActiveMenuRoute;
  setCurrentRoute: (next: ActiveMenuRoute | ((prev: ActiveMenuRoute) => ActiveMenuRoute)) => void;
  setDisplayedRoute: (next: ActiveMenuRoute | ((prev: ActiveMenuRoute) => ActiveMenuRoute)) => void;
  routeHistory: ActiveMenuRoute[];
  setRouteHistory: (
    next: ActiveMenuRoute[] | ((prev: ActiveMenuRoute[]) => ActiveMenuRoute[])
  ) => void;
  lastParentRoute: ActiveMenuRoute;
  transitionMode: ContainerTransitionMode;
  setStepPhase: (next: 'idle' | 'fadeOut' | 'resize' | 'fadeIn') => void;
  liveAnimPhase: LivePreviewAnimPhase;
  setLiveAnimPhase: (next: LivePreviewAnimPhase) => void;
  activePlaylist: LinearPlaylistStep[];
  activePlaylistIdx: number;
  setLayer1ContextMode: (next: Layer1MenuContextMode) => void;
  setSettingsTab: (next: string) => void;
  setGarageTab: (next: string) => void;
  setLayer3StepOverride: (next: Layer3StepOverrideState) => void;
  layer1ContextMode: Layer1MenuContextMode;
  settingsTab: string;
  setVisibilityTier: (next: MenuVisibilityTier) => void;
  showToast: (msg: string) => void;
}

export function useMenuLayerNavigationHandlers({
  currentRoute,
  setCurrentRoute,
  setDisplayedRoute,
  routeHistory,
  setRouteHistory,
  lastParentRoute,
  transitionMode,
  setStepPhase,
  liveAnimPhase,
  setLiveAnimPhase,
  activePlaylist,
  activePlaylistIdx,
  setLayer1ContextMode,
  setSettingsTab,
  setGarageTab,
  setLayer3StepOverride,
  layer1ContextMode,
  settingsTab,
  setVisibilityTier,
  showToast,
}: UseMenuLayerNavigationHandlersParams) {
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

  return {
    handleChangeVisibilityTier,
    handleSelectRoute,
    handleTriggerCollapse,
    handleTriggerExpand,
    handleNavigateBack,
    stepPlaylistBy,
  };
}
