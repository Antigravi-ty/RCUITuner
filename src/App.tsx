import React, { Suspense, lazy } from 'react';
import { Sidebar } from './showcase/Sidebar';
import {
  JumpOriginReturnBanner,
  TopWorkspaceHeaderBar,
} from './showcase/SidebarWorkspaceHeader';
import { useWorkspaceUrlAndHotkeySync } from './showcase/useWorkspaceUrlAndHotkeySync';
import { OverviewPage } from './showcase/pages/OverviewPage';

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
import { ShieldAlert } from 'lucide-react';
import { useAccentStore } from './showcase/stores/themeStore';

export const App: React.FC = () => {
  const {
    activeTab,
    isLight,
    setIsLight,
    lastJumpOrigin,
    setLastJumpOrigin,
    activeWorkspace,
    activeNavMeta,
    activeSectionMeta,
    ledgerSummary,
    handleSelectTab,
    handleSelectWorkspace,
    handleNavigateShowcase,
    handleReturnToJumpOrigin,
    handleNavigateToSandboxPlay,
  } = useWorkspaceUrlAndHotkeySync();

  const { safeAreaMargin, renderScale } = useViewportStore();
  const { tokens } = useAccentStore();
  const contentScale = renderScale / 100;

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
        <TopWorkspaceHeaderBar
          isLight={isLight}
          activeTab={activeTab}
          activeNavLabel={activeNavMeta?.label}
          activeSectionMeta={activeSectionMeta}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={handleSelectWorkspace}
          ledgerSummary={ledgerSummary}
        />

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
              <JumpOriginReturnBanner
                isLight={isLight}
                lastJumpOrigin={lastJumpOrigin}
                onReturn={handleReturnToJumpOrigin}
                onDismiss={() => setLastJumpOrigin(null)}
              />
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
                      onNavigateToSandboxPlay={handleNavigateToSandboxPlay}
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
