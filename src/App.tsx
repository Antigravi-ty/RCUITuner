import React, { useEffect, Suspense, lazy, useMemo } from 'react';
import { Sidebar } from './showcase/Sidebar';
import {
  WORKSPACE_SECTIONS,
  WORKSPACE_SPECS,
  getApprovalLedgerSummary,
  getNavItemMeta,
  getWorkspaceForTab,
  isValidShowcaseTab,
  readWorkspaceFromUrl,
  syncWorkspaceUrlParam,
  type ShowcaseTab,
  type TunerWorkspaceId,
} from './showcase/sidebarNavConfig';
import { OverviewPage } from './showcase/pages/OverviewPage';
import { ViewportControls } from './showcase/ViewportControls';

const BadgesPage = lazy(() => import('./showcase/pages/BadgesPage').then((m) => ({ default: m.BadgesPage })));
const TabsPage = lazy(() => import('./showcase/pages/TabsPage').then((m) => ({ default: m.TabsPage })));
const StacksPage = lazy(() => import('./showcase/pages/StacksPage').then((m) => ({ default: m.StacksPage })));
const CardsPage = lazy(() => import('./showcase/pages/CardsPage').then((m) => ({ default: m.CardsPage })));
const PlayCardPage = lazy(() => import('./showcase/pages/PlayCardPage').then((m) => ({ default: m.PlayCardPage })));
const PanelsPage = lazy(() => import('./showcase/pages/PanelsPage').then((m) => ({ default: m.PanelsPage })));
const DialoguePage = lazy(() => import('./showcase/pages/DialoguePage').then((m) => ({ default: m.DialoguePage })));
const QuickNotificationPage = lazy(() => import('./showcase/pages/QuickNotificationPage').then((m) => ({ default: m.QuickNotificationPage })));
const NotificationIntegrationPage = lazy(() => import('./showcase/pages/NotificationIntegrationPage').then((m) => ({ default: m.NotificationIntegrationPage })));
const HudElementsPage = lazy(() => import('./showcase/pages/HudElementsPage').then((m) => ({ default: m.HudElementsPage })));
const CenterUpperInfoPage = lazy(() => import('./showcase/pages/CenterUpperInfoPage').then((m) => ({ default: m.CenterUpperInfoPage })));
const TakeoverPage = lazy(() => import('./showcase/pages/TakeoverPage').then((m) => ({ default: m.TakeoverPage })));
const TemporalOverlayPage = lazy(() => import('./showcase/pages/TemporalOverlayPage').then((m) => ({ default: m.TemporalOverlayPage })));
const MenuLayerPreviewPage = lazy(() => import('./showcase/pages/MenuLayerPreviewPage').then((m) => ({ default: m.MenuLayerPreviewPage })));
const LoadingScreenPreviewPage = lazy(() => import('./showcase/pages/LoadingScreenPreviewPage').then((m) => ({ default: m.LoadingScreenPreviewPage })));
const NavigationPage = lazy(() => import('./showcase/pages/NavigationPage').then((m) => ({ default: m.NavigationPage })));
const AnimationPage = lazy(() => import('./showcase/pages/AnimationPage').then((m) => ({ default: m.AnimationPage })));
const RecipesPage = lazy(() => import('./showcase/pages/RecipesPage').then((m) => ({ default: m.RecipesPage })));
const LivePreviewSimulationPage = lazy(() => import('./showcase/pages/LivePreviewSimulationPage').then((m) => ({ default: m.LivePreviewSimulationPage })));
const EdgeInspectorSimulationPage = lazy(() => import('./showcase/pages/EdgeInspectorSimulationPage').then((m) => ({ default: m.EdgeInspectorSimulationPage })));
const FloatingWindowsSimulationPage = lazy(() => import('./showcase/pages/FloatingWindowsSimulationPage').then((m) => ({ default: m.FloatingWindowsSimulationPage })));
const ChartsAndCurvesPage = lazy(() => import('./showcase/pages/ChartsAndCurvesPage').then((m) => ({ default: m.ChartsAndCurvesPage })));
const ComposableNestingPage = lazy(() => import('./showcase/pages/ComposableNestingPage').then((m) => ({ default: m.ComposableNestingPage })));
const FoundationsPage = lazy(() => import('./showcase/pages/FoundationsPage').then((m) => ({ default: m.FoundationsPage })));
const ViewportSafeAreaPage = lazy(() => import('./showcase/pages/ViewportSafeAreaPage').then((m) => ({ default: m.ViewportSafeAreaPage })));
const NameTagTunerPage = lazy(() => import('./showcase/pages/NameTagTunerPage').then((m) => ({ default: m.NameTagTunerPage })));

import { SafeAreaHud } from './ui-core/viewport/SafeAreaHud';
import { useViewportStore, viewportStore } from './ui-core/stores/viewportStore';
import { DialogueStackContainer } from './ui-core/compounds/Dialogue';
import { SectionErrorBoundary } from './showcase/components/SectionErrorBoundary';
import {
  ShieldAlert,
  ArrowLeft,
  FlaskConical,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAccentStore } from './showcase/stores/themeStore';
import { readUrlParams, updateUrlParams } from './showcase/stores/urlSync';
import { useSyncedState } from './showcase/stores/crossClientSync';

interface JumpOriginRecord {
  fromTab: ShowcaseTab;
  fromHref: string;
  fromDesc: string;
  toTab: ShowcaseTab;
  targetId?: string;
}

function resolveInitialTabFromUrl(): ShowcaseTab {
  const rawTab = readUrlParams().tab;
  if (isValidShowcaseTab(rawTab)) return rawTab;
  const initialWs = readWorkspaceFromUrl('overview');
  return initialWs === 'bravo' ? WORKSPACE_SPECS.bravo.defaultTab : 'overview';
}

export const App: React.FC = () => {
  const initialUrlTab = resolveInitialTabFromUrl();
  const [activeTab, setActiveTab] = useSyncedState<ShowcaseTab>('app:activeTab', initialUrlTab);
  const [isLight, setIsLight] = useSyncedState<boolean>('app:isLight', true);
  const [lastJumpOrigin, setLastJumpOrigin] = React.useState<JumpOriginRecord | null>(null);
  const [lastTabByWorkspace, setLastTabByWorkspace] = React.useState<Record<TunerWorkspaceId, ShowcaseTab>>(() => {
    const ws = getWorkspaceForTab(initialUrlTab);
    return {
      alpha: ws === 'alpha' ? initialUrlTab : WORKSPACE_SPECS.alpha.defaultTab,
      bravo: ws === 'bravo' ? initialUrlTab : WORKSPACE_SPECS.bravo.defaultTab,
    };
  });

  const activeWorkspace: TunerWorkspaceId = getWorkspaceForTab(activeTab);
  const activeNavMeta = useMemo(() => getNavItemMeta(activeTab), [activeTab]);
  const ledgerSummary = useMemo(() => getApprovalLedgerSummary(), []);

  const { safeAreaMargin, renderScale } = useViewportStore();
  const { tokens } = useAccentStore();
  const contentScale = renderScale / 100;

  const scrollToAnchorWithRetry = React.useCallback((targetId?: string) => {
    if (!targetId || typeof document === 'undefined') return;
    const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;
    if (!cleanId) return;
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(cleanId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 18) window.setTimeout(tryScroll, 80);
    };
    window.setTimeout(tryScroll, 60);
  }, []);

  useEffect(() => {
    updateUrlParams({ tab: activeTab });
    syncWorkspaceUrlParam(getWorkspaceForTab(activeTab));
    if (typeof window !== 'undefined' && window.location.hash) {
      scrollToAnchorWithRetry(window.location.hash);
    }
  }, []);

  useEffect(() => {
    const ws = getWorkspaceForTab(activeTab);
    setLastTabByWorkspace((prev) => (prev[ws] === activeTab ? prev : { ...prev, [ws]: activeTab }));
    if (readUrlParams().tab !== activeTab) {
      updateUrlParams({ tab: activeTab });
    }
    syncWorkspaceUrlParam(ws);
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const nextTab = resolveInitialTabFromUrl();
      setActiveTab(nextTab);
      if (window.location.hash) scrollToAnchorWithRetry(window.location.hash);
      setLastJumpOrigin((prev) => (prev && prev.fromTab === nextTab ? null : prev));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, scrollToAnchorWithRetry]);

  const handleSelectTab = React.useCallback(
    (nextTab: ShowcaseTab) => {
      const nextWs = getWorkspaceForTab(nextTab);
      setLastTabByWorkspace((prev) => ({ ...prev, [nextWs]: nextTab }));
      updateUrlParams({ tab: nextTab }, { push: true, hash: null });
      syncWorkspaceUrlParam(nextWs);
      setActiveTab(nextTab);
    },
    [setActiveTab]
  );

  const handleSelectWorkspace = React.useCallback(
    (nextWorkspace: TunerWorkspaceId) => {
      if (nextWorkspace === activeWorkspace) return;
      const targetTab = lastTabByWorkspace[nextWorkspace] ?? WORKSPACE_SPECS[nextWorkspace].defaultTab;
      updateUrlParams({ tab: targetTab }, { push: true, hash: null });
      syncWorkspaceUrlParam(nextWorkspace);
      setActiveTab(targetTab);
    },
    [activeWorkspace, lastTabByWorkspace, setActiveTab]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) {
        return;
      }
      if (e.key === '1') {
        e.preventDefault();
        handleSelectWorkspace('alpha');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSelectWorkspace('bravo');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectWorkspace]);

  const handleNavigateShowcase = React.useCallback(
    (tab: ShowcaseTab, targetId?: string) => {
      if (typeof window !== 'undefined') {
        const p = readUrlParams();
        const routeDesc =
          activeTab === 'layer-preview'
            ? `7A Menu Layer (${p.route || 'main-menu'}${p.subtab ? ` · ${p.subtab}` : ''})`
            : activeTab;
        setLastJumpOrigin({
          fromTab: activeTab,
          fromHref: `${window.location.pathname}${window.location.search}${window.location.hash}`,
          fromDesc: routeDesc,
          toTab: tab,
          targetId,
        });
      }
      const targetWs = getWorkspaceForTab(tab);
      setLastTabByWorkspace((prev) => ({ ...prev, [targetWs]: tab }));
      updateUrlParams(
        { tab, ...(tab === 'recipes' && targetId ? { recipe: targetId } : {}) },
        { push: true, hash: targetId ?? null }
      );
      syncWorkspaceUrlParam(targetWs);
      setActiveTab(tab);
      if (typeof window !== 'undefined') window.dispatchEvent(new HashChangeEvent('hashchange'));
      scrollToAnchorWithRetry(targetId);
    },
    [activeTab, setActiveTab, scrollToAnchorWithRetry]
  );

  const handleReturnToJumpOrigin = React.useCallback(() => {
    if (!lastJumpOrigin) return;
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(window.history.state, '', lastJumpOrigin.fromHref);
      } catch {
        // ignore
      }
    }
    setActiveTab(lastJumpOrigin.fromTab);
    setLastJumpOrigin(null);
  }, [lastJumpOrigin, setActiveTab]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
      document.documentElement.classList.toggle('light', isLight);
      document.documentElement.classList.toggle('dark', !isLight);
      document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
    }
  }, [isLight]);

  const activeSectionMeta = activeNavMeta ? WORKSPACE_SECTIONS[activeNavMeta.workspaceSection] : undefined;

  return (
    <div className={`relative h-screen w-screen overflow-hidden transition-colors duration-150 ${isLight ? 'bg-neutral-800' : 'bg-black'}`}>
      <SafeAreaHud isLight={isLight} />
      <DialogueStackContainer isLight={isLight} />

      {safeAreaMargin < 0 && (
        <div className="fixed bottom-3 right-3 z-[700] flex items-center gap-2.5 bg-neutral-900/95 text-neutral-200 border border-neutral-700/80 rounded-xl px-3 py-1.5 shadow-2xl backdrop-blur text-xs font-mono">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
          <span>Safe Area: <strong className="text-amber-400 font-bold">{safeAreaMargin}%</strong> (Overscan Bleed)</span>
          <button
            type="button"
            onClick={() => viewportStore.setSafeAreaMargin(0)}
            className={`px-2 py-0.5 rounded ${tokens.accent} ${tokens.accentHover} font-sans text-[11px] font-semibold cursor-pointer transition-colors`}
          >
            Reset (0%)
          </button>
        </div>
      )}

      <div
        className={`absolute flex flex-col transition-all duration-150 overflow-hidden ${
          isLight ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-neutral-100'
        }`}
        style={{
          top: `${safeAreaMargin}%`,
          bottom: `${safeAreaMargin}%`,
          left: `${safeAreaMargin}%`,
          right: `${safeAreaMargin}%`,
        }}
      >
        <header
          className={`h-16 px-4 md:px-6 border-b flex items-center justify-between gap-3 shrink-0 z-20 transition-colors ${
            isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-950 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs min-w-0">
            <span className="font-bold tracking-tight shrink-0">RCUITuner</span>
            <span className="text-neutral-400 shrink-0">/</span>
            {activeSectionMeta && (
              <span className={`hidden lg:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold border shrink-0 ${activeSectionMeta.badgeColor}`}>
                {activeSectionMeta.code}
              </span>
            )}
            <span className={`font-mono font-medium truncate ${tokens.text}`}>
              {activeNavMeta?.label ?? activeTab}
            </span>
          </div>

          <div
            className={`flex items-center gap-1 p-1 rounded-xl border shrink-0 ${
              isLight ? 'bg-neutral-100/90 border-neutral-200/90' : 'bg-neutral-900/90 border-neutral-800'
            }`}
          >
            <button
              type="button"
              onClick={() => handleSelectWorkspace('alpha')}
              data-top-workspace="alpha"
              title={`${WORKSPACE_SPECS.alpha.title} · ${WORKSPACE_SPECS.alpha.subtitle} (Shortcut: Alt+1)`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeWorkspace === 'alpha'
                  ? isLight
                    ? 'bg-white text-amber-800 font-bold shadow-xs border border-amber-400/60'
                    : 'bg-neutral-800 text-amber-300 font-bold shadow-xs border border-amber-500/50'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Workspace Alpha</span>
              <span className="hidden xl:inline text-[10px] opacity-75">· 母版与独立实验室</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectWorkspace('bravo')}
              data-top-workspace="bravo"
              title={`${WORKSPACE_SPECS.bravo.title} · ${WORKSPACE_SPECS.bravo.subtitle} (Shortcut: Alt+2)`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeWorkspace === 'bravo'
                  ? isLight
                    ? 'bg-white text-sky-800 font-bold shadow-xs border border-sky-400/60'
                    : 'bg-neutral-800 text-sky-300 font-bold shadow-xs border border-sky-500/50'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
              }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5 text-sky-500 shrink-0" />
              <span>Workspace Bravo</span>
              <span className="hidden xl:inline text-[10px] opacity-75">· 面板审批与精调</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-2.5 w-2.5" />
                <span>{ledgerSummary.approvedCount}/{ledgerSummary.totalSurfaces}</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ViewportControls isLight={isLight} />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            activeWorkspace={activeWorkspace}
            onSelectWorkspace={handleSelectWorkspace}
            isLight={isLight}
            onToggleTheme={() => setIsLight((prev) => !prev)}
          />

          <main className="flex-1 h-full overflow-y-auto overflow-x-auto [overflow-anchor:none] min-w-0 relative select-text bg-white dark:bg-neutral-950">
            {lastJumpOrigin && lastJumpOrigin.toTab === activeTab && (
              <div
                className={`sticky top-0 z-40 px-6 py-2 border-b flex items-center justify-between gap-3 text-xs font-mono backdrop-blur-md ${
                  isLight
                    ? 'bg-amber-50/95 border-amber-200/90 text-amber-900 shadow-2xs'
                    : 'bg-neutral-900/95 border-amber-500/30 text-amber-200 shadow-md'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.history.length > 1) window.history.back();
                      else handleReturnToJumpOrigin();
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to previous page ({lastJumpOrigin.fromDesc})</span>
                  </button>
                  <span className="opacity-80">
                    Jump recorded in browser History stack{lastJumpOrigin.targetId ? ` · Anchor: #${lastJumpOrigin.targetId}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLastJumpOrigin(null)}
                  className="px-2 py-0.5 rounded opacity-60 hover:opacity-100 cursor-pointer"
                >
                  Dismiss x
                </button>
              </div>
            )}

            <div
              className={contentScale > 1.25 ? 'p-4 md:p-6' : 'p-6 md:p-10 lg:p-12'}
              style={contentScale === 1 ? undefined : { zoom: contentScale }}
            >
              <SectionErrorBoundary title={`Page: ${activeTab}`} resetKey={activeTab} isLight={isLight}>
                <Suspense fallback={<div className="py-12 text-xs font-mono text-neutral-400">Loading showcase module...</div>}>
                  {activeTab === 'overview' && <OverviewPage isLight={isLight} onSelectTab={handleSelectTab} />}
                  {activeTab === 'foundations' && <FoundationsPage isLight={isLight} />}
                  {activeTab === 'badges' && <BadgesPage isLight={isLight} />}
                  {activeTab === 'tabs' && <TabsPage isLight={isLight} />}
                  {activeTab === 'composable-nesting' && <ComposableNestingPage isLight={isLight} />}
                  {activeTab === 'charts-curves' && <ChartsAndCurvesPage isLight={isLight} />}
                  {activeTab === 'hud-elements' && <HudElementsPage isLight={isLight} />}
                  {activeTab === 'center-upper-info' && <CenterUpperInfoPage isLight={isLight} />}
                  {activeTab === 'takeover' && <TakeoverPage isLight={isLight} />}
                  {activeTab === 'name-tag-tuner' && <NameTagTunerPage isLight={isLight} />}
                  {activeTab === 'temporal-overlay' && <TemporalOverlayPage isLight={isLight} />}
                  {activeTab === 'viewport-safe-area' && <ViewportSafeAreaPage isLight={isLight} />}
                  {activeTab === 'stacks' && <StacksPage isLight={isLight} />}
                  {activeTab === 'cards' && (
                    <CardsPage isLight={isLight} onNavigateToPlayCards={() => handleNavigateShowcase('play-cards')} />
                  )}
                  {activeTab === 'play-cards' && (
                    <PlayCardPage
                      isLight={isLight}
                      onNavigateToSandboxPlay={() => {
                        updateUrlParams({ tab: 'layer-preview', tier: 'user', route: 'play' }, { push: true, hash: 'rc-ui-tuner-preview-stage' });
                        syncWorkspaceUrlParam('bravo');
                        setActiveTab('layer-preview');
                      }}
                    />
                  )}
                  {activeTab === 'panels' && <PanelsPage isLight={isLight} />}
                  {activeTab === 'dialogue' && <DialoguePage isLight={isLight} />}
                  {activeTab === 'quick-notification' && <QuickNotificationPage isLight={isLight} />}
                  {activeTab === 'notification-integration' && <NotificationIntegrationPage isLight={isLight} />}
                  {activeTab === 'layer-preview' && (
                    <MenuLayerPreviewPage
                      isLight={isLight}
                      onNavigateToPlayCards={() => handleNavigateShowcase('play-cards')}
                      onNavigateShowcase={handleNavigateShowcase}
                    />
                  )}
                  {activeTab === 'loading-preview' && <LoadingScreenPreviewPage isLight={isLight} />}
                  {activeTab === 'navigation' && <NavigationPage isLight={isLight} />}
                  {activeTab === 'live-preview' && <LivePreviewSimulationPage isLight={isLight} />}
                  {activeTab === 'edge-inspector' && <EdgeInspectorSimulationPage isLight={isLight} />}
                  {activeTab === 'floating-windows' && <FloatingWindowsSimulationPage isLight={isLight} />}
                  {activeTab === 'animation' && <AnimationPage isLight={isLight} />}
                  {activeTab === 'recipes' && <RecipesPage isLight={isLight} />}
                </Suspense>
              </SectionErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
