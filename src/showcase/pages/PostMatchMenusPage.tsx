import React from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:menus');
import { 
  FolderTree, 
  Play, 
  Trophy, 
  Sparkles, 
  ExternalLink,
  Layers,
  ArrowRight,
  Maximize2,
  BookmarkCheck
} from 'lucide-react';
import { MorphingShell } from '../../ui-core/navigation/MorphingShell';
import { ContainerTransitionMode } from '../../ui-core/tokens/easing';
import { Button } from '../../ui-core/primitives/Button';
import { Badge } from '../../ui-core/primitives/Badge';
import { CodeBlock } from '../CodeBlock';
import { Layer1MatchPostRecipe } from '../../ui-core/recipes/Layer1MatchPostRecipe';
import { Layer2MatchStatsRecipe } from '../../ui-core/recipes/Layer2MatchStatsRecipe';

export type ReservedMenuRouteId = 'match-post' | 'match-stats';

interface ReservedMenuCardDef {
  id: ReservedMenuRouteId;
  title: string;
  level: 'Layer 1 (Root Reserved)' | 'Layer 2 (Telemetry Reserved)';
  layerNum: 1 | 2;
  width: number;
  description: string;
  tags: string[];
  renderComponent: (isLight: boolean, onNavigate: (r: ReservedMenuRouteId) => void, onBack?: () => void) => React.ReactNode;
}

export interface MenusPageProps {
  isLight?: boolean;
  onNavigateToLayers?: () => void;
}

export const MenusPage: React.FC<MenusPageProps> = ({ 
  isLight = true,
  onNavigateToLayers
}) => {
  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<ReservedMenuRouteId>('match-post');
  const [routeHistory, setRouteHistory] = useState<ReservedMenuRouteId[]>(['match-post']);

  const routeWidthMap: Record<ReservedMenuRouteId, number> = {
    'match-post': 420,
    'match-stats': 580,
  };

  const navigateTo = (route: ReservedMenuRouteId) => {
    setRouteHistory((prev) => [...prev, route]);
    setCurrentRoute(route);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentRoute('match-post');
    setRouteHistory(['match-post']);
  };

  const goBack = () => {
    if (routeHistory.length > 1) {
      const next = routeHistory.slice(0, -1);
      setRouteHistory(next);
      setCurrentRoute(next[next.length - 1]);
    } else {
      closeModal();
    }
  };

  const openModalAt = (route: ReservedMenuRouteId) => {
    setCurrentRoute(route);
    setRouteHistory([route]);
    setModalOpen(true);
  };

  const menuDefinitions: ReservedMenuCardDef[] = [
    {
      id: 'match-post',
      title: 'Layer 1: Match Post / Post-match report root menu (Reserved)',
      level: 'Layer 1 (Root Reserved)',
      layerNum: 1,
      width: 420,
      description: 'Global root menu for match end or halftime pause. Display match result status badge, rematch action, match stats entry, Garage modification and system settings navigation. Not yet in main loop, Retained as a candidate architecture. ',
      tags: ['Layer 1', 'Reserved Root', 'Match Post', 'Width: 420px'],
      renderComponent: (light, onNav) => (
        <Layer1MatchPostRecipe
          isLight={light}
          onRematch={() => alert('trigger Next Match Quick match')}
          onNavigateStats={() => onNav('match-stats')}
          onNavigateGarage={() => alert('View active garage[Menu Layer live preview]')}
          onNavigateSettings={() => alert('View active settings[Menu Layer live preview]')}
          onNavigateKeybindings={() => alert('View active buttons[Menu Layer live preview]')}
          onExitLobby={() => alert('Back to lobby')}
        />
      ),
    },
    {
      id: 'match-stats',
      title: 'Layer 2: Match Stats / Post-match data and tactical telemetry (Reserved)',
      level: 'Layer 2 (Telemetry Reserved)',
      layerNum: 2,
      width: 580,
      description: 'Secondary specialized data page. Display blue-orange score board, Goals/Assists/Saves/Telemetry grids for hit rate and rank-up experience bars. ',
      tags: ['Layer 2', 'Reserved Sub-Menu', 'Telemetry', 'Width: 580px'],
      renderComponent: (light, _onNav, onBack) => (
        <Layer2MatchStatsRecipe
          isLight={light}
          onBack={onBack}
          onRematch={() => alert('Next Match')}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-6 w-6 text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">Menu Reserved report and candidate specs</h1>
        </div>
        <p className={`text-xs mt-1.5 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          This page specifically retains previously designed<strong>Unused menu template</strong> (Post-match summary report <code>Match Post</code> With post-match telemetry dashboard <code>Match Stats</code>) . 
          All active level-one pauses, Secondary garage/Settings/Keybind, And tertiary audio equalizer, All migrated to the new <strong>[Menu Layer live preview]</strong> Engine. 
        </p>
      </div>

      {/* Migration Notice Banner */}
      {onNavigateToLayers && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
            isLight ? 'bg-amber-50/80 border-amber-200/90 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs">Active layer migrated to new[Menu Layer live preview]Page</span>
              <span className={`text-[11px] ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                Support top-level non-intrusive direct selection, Single Container Replace, Level-three audio equalizer switching and Apple Ease animation. 
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={onNavigateToLayers}
            isLight={isLight}
            icon={<ArrowRight className="h-3.5 w-3.5" />}
          >
            Navigate to Menu Layer live preview
          </Button>
        </div>
      )}

      {/* Global Interactive Playground & Control Bar */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-sm block">Reserved match report popup Morphing Animation playground</span>
            <span className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Test Match Post (420px) To Match Stats (580px) Smooth morphing between
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => openModalAt('match-post')}
              isLight={isLight}
              icon={<Play className="h-4 w-4" />}
            >
              Open match report popup
            </Button>
          </div>
        </div>

        {/* Transition Mode Switcher */}
        <div
          className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-semibold shrink-0 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Switch animation mode:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTransitionMode('fluid-morph')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  transitionMode === 'fluid-morph'
                    ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
                title="Apple Ease 0.28s Continuous fluid morph"
              >
                FluidMorph (Continuous fluid)
              </button>
              <button
                type="button"
                onClick={() => setTransitionMode('sequenced-step')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  transitionMode === 'sequenced-step'
                    ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
                title="100ms fade out -> 150ms Container Morph -> 100ms Fade in"
              >
                SequencedStep (Three-step)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Cards Display Grid */}
      <div className="flex flex-col gap-8">
        {menuDefinitions.map((card) => (
          <div
            key={card.id}
            className={`p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
              isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
            }`}
          >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base tracking-tight">{card.title}</span>
                  <Badge
                    size="sm"
                    variant={card.layerNum === 1 ? 'primary' : 'warning'}
                    isLight={isLight}
                  >
                    {card.level}
                  </Badge>
                </div>
                <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {card.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openModalAt(card.id)}
                  isLight={isLight}
                  icon={<Maximize2 className="h-3.5 w-3.5" />}
                >
                  Test in popup
                </Button>
              </div>
            </div>

            {/* Embedded Live Preview Container */}
            <div
              className={`p-6 rounded-xl border flex items-center justify-center overflow-x-auto transition-colors ${
                isLight ? 'bg-neutral-100/60 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
              }`}
            >
              <div style={{ width: `${card.width}px` }} className="max-w-full">
                {card.renderComponent(isLight, openModalAt, () => alert('Return to previous menu'))}
              </div>
            </div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {card.tags.map((t) => (
                <Badge key={t} size="sm" variant="default" isLight={isLight}>
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Developer Integration Code Recipe */}
      <CodeBlock
        isLight={isLight}
        title="Reserved match report component specification (Reserved Match Recipe Invocation)"
        code={`// Independent invocation of reserved post-match settlement and telemetry panels: 
import { Layer1MatchPostRecipe } from '@/ui-core/recipes/Layer1MatchPostRecipe';
import { Layer2MatchStatsRecipe } from '@/ui-core/recipes/Layer2MatchStatsRecipe';

<Layer1MatchPostRecipe
  isLight={isLight}
  onRematch={() => startNextMatch()}
  onNavigateStats={() => navigateToStats()}
  onExitLobby={() => returnToLobby()}
/>

<Layer2MatchStatsRecipe
  isLight={isLight}
  onBack={() => navigateBack()}
  onRematch={() => startNextMatch()}
/>`}
      />

      {/* Interactive Morphing Shell Modal for Reserved Items */}
      <MorphingShell
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          } else {
            setModalOpen(true);
          }
        }}
        width={routeWidthMap[currentRoute]}
        currentKey={currentRoute}
        isLight={isLight}
        isLayer1={currentRoute === 'match-post'}
        onBack={goBack}
        transitionMode={transitionMode}
        enableDiagnostics={true}
      >
        {currentRoute === 'match-post' && (
          <Layer1MatchPostRecipe
            isLight={isLight}
            onRematch={() => setModalOpen(false)}
            onNavigateStats={() => navigateTo('match-stats')}
            onExitLobby={() => setModalOpen(false)}
          />
        )}

        {currentRoute === 'match-stats' && (
          <Layer2MatchStatsRecipe
            isLight={isLight}
            onBack={goBack}
            onRematch={() => setModalOpen(false)}
          />
        )}
      </MorphingShell>
    </div>
  );
};
