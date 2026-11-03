import React from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { Compass, Play, Car, Settings, Keyboard, ExternalLink, ArrowLeft, Volume2, Gamepad2, Wrench } from 'lucide-react';

const useState = createScopedSyncedState('page:navigation');
import { MorphingShell } from '../../ui-core/navigation/MorphingShell';
import { ContainerTransitionMode } from '../../ui-core/tokens/easing';
import { Layer1MainMenuRecipe } from '../../ui-core/recipes/Layer1MainMenuRecipe';
import { Layer2PlayRecipe } from '../../ui-core/recipes/Layer2PlayRecipe';
import { Layer2SettingsRecipe } from '../../ui-core/recipes/Layer2SettingsRecipe';
import { Layer2GarageRecipe } from '../../ui-core/recipes/Layer2GarageRecipe';
import { Layer3AudioEqRecipe } from '../../ui-core/recipes/Layer3AudioEqRecipe';
import { Layer3BallTrajectoryRecipe } from '../../ui-core/recipes/Layer3BallTrajectoryRecipe';
import { Button } from '../../ui-core/primitives/Button';
import { Badge } from '../../ui-core/primitives/Badge';
import { CodeBlock } from '../CodeBlock';

type DemoRoute = 'main' | 'play' | 'garage' | 'settings' | 'audio-eq' | 'trajectory';

export const NavigationPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<DemoRoute>('main');
  const [history, setHistory] = useState<DemoRoute[]>(['main']);
  const [targetSettingsTab, setTargetSettingsTab] = useState<string>('gameplay');
  const [bgRenderPaused, setBgRenderPaused] = useState<boolean>(true);

  const routeWidthMap: Record<DemoRoute, number> = {
    main: 420,
    play: 680,
    garage: 680,
    settings: 680,
    'audio-eq': 480,
    trajectory: 560,
  };

  const navigateTo = (r: DemoRoute) => {
    setHistory((prev) => [...prev, r]);
    setCurrentRoute(r);
  };

  const goBack = () => {
    if (history.length > 1) {
      const next = history.slice(0, -1);
      setHistory(next);
      setCurrentRoute(next[next.length - 1]);
    } else {
      setIsOpen(false);
    }
  };

  const isLayer1 = currentRoute === 'main';

  const [transitionMode, setTransitionMode] = useState<ContainerTransitionMode>('fluid-morph');

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Navigation Navigation and modal system</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          New benchmarking game ESC Real-time menu hierarchy: Layer 1 (420px Center MENU Root Menu) → Layer 2 (Play Mode / Garage Modify / Settings Settings, All are 680px) → Layer 3 (audio EQ 480px). 
          Level-one menu instant launch (No background blur or dimming, Surrounding projection highlight) ; Secondary and tertiary menu background 250ms Gradient fade no blur, Support direct click to exit, support FluidMorph Continuous fluid and SequencedStep Three-step. 
        </p>
      </div>

      {/* Interactive Trigger Card */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-bold text-sm">Real-time interaction sandbox: Open global game popup (Launch Morphing Menu)</span>
            <span className="text-xs text-neutral-400">Three-part layout MENU Root Menu, click Play, Garage or Settings Smoothly morph to secondary menu</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                setCurrentRoute('main');
                setHistory(['main']);
                setIsOpen(true);
              }}
              isLight={isLight}
            >
              Launch Morphing Menu
            </Button>
          </div>
        </div>

        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono p-3 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200 text-neutral-700' : 'border-neutral-800 bg-neutral-950/40 text-neutral-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={isLight ? 'text-neutral-500' : 'text-neutral-400'}>Current route:</span>
            <Badge variant="primary" size="sm" isLight={isLight}>
              {currentRoute.toUpperCase()}
            </Badge>
            <span className="text-neutral-400">|</span>
            <span className={isLight ? 'text-neutral-500' : 'text-neutral-400'}>
              Hierarchy: <strong className="text-amber-500">
                {currentRoute === 'main' ? 'Layer 1 (MENU Root Menu)' : currentRoute === 'audio-eq' ? 'Layer 3 (Depth panel)' : 'Layer 2 (Secondary features)'}
              </strong>
            </span>
            <span className="text-neutral-400">|</span>
            <span className={isLight ? 'text-neutral-500' : 'text-neutral-400'}>
              Width: <strong className="text-amber-500">{routeWidthMap[currentRoute]}px</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-[11px]">animation:</span>
            <button
              type="button"
              onClick={() => setTransitionMode('fluid-morph')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer border ${
                transitionMode === 'fluid-morph'
                  ? 'bg-amber-500 text-white border-amber-500 font-bold'
                  : isLight
                  ? 'bg-white border-neutral-300 text-neutral-700'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              FluidMorph
            </button>
            <button
              type="button"
              onClick={() => setTransitionMode('sequenced-step')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer border ${
                transitionMode === 'sequenced-step'
                  ? 'bg-amber-500 text-white border-amber-500 font-bold'
                  : isLight
                  ? 'bg-white border-neutral-300 text-neutral-700'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              SequencedStep
            </button>
          </div>
        </div>
      </div>

      {/* The Morphing Shell Modal */}
      <MorphingShell
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setCurrentRoute('main');
            setHistory(['main']);
          }
        }}
        width={routeWidthMap[currentRoute]}
        currentKey={currentRoute}
        isLight={isLight}
        isLayer1={isLayer1}
        onBack={goBack}
        transitionMode={transitionMode}
        enableDiagnostics={true}
      >
        {/* Layer 1: Root MENU */}
        {currentRoute === 'main' && (
          <Layer1MainMenuRecipe
            isLight={isLight}
            onResume={() => setIsOpen(false)}
            onNavigatePlay={() => navigateTo('play')}
            onNavigateGarage={() => navigateTo('garage')}
            onNavigateSettings={(tab) => {
              if (tab) setTargetSettingsTab(tab);
              navigateTo('settings');
            }}
            backgroundRenderPaused={bgRenderPaused}
          />
        )}

        {/* Layer 2: Play Modes (2x3 Grid) */}
        {currentRoute === 'play' && (
          <Layer2PlayRecipe
            isLight={isLight}
            onBack={goBack}
            onSelectMode={(mode) => alert(`Selected mode: ${mode}`)}
          />
        )}

        {/* Layer 2: Garage Loadout (Car, Colour, Anthem, Player Name) */}
        {currentRoute === 'garage' && (
          <Layer2GarageRecipe
            isLight={isLight}
            onBack={goBack}
          />
        )}

        {/* Layer 2: Settings (Gameplay, Camera, Controls, Interface, Video, Audio, Chat, Extra, Advanced, Developer) */}
        {currentRoute === 'settings' && (
          <Layer2SettingsRecipe
            isLight={isLight}
            onBack={goBack}
            initialTab={targetSettingsTab}
            backgroundRenderPaused={bgRenderPaused}
            onToggleBackgroundRender={setBgRenderPaused}
            onNavigateAudioDetail={() => navigateTo('audio-eq')}
            onNavigateTrajectoryDetail={() => navigateTo('trajectory')}
          />
        )}

        {/* Layer 3: Audio Detail EQ */}
        {currentRoute === 'audio-eq' && (
          <Layer3AudioEqRecipe
            isLight={isLight}
            onBack={goBack}
          />
        )}

        {/* Layer 3: Ball Trajectory Predictor Configuration (Live Preview enabled) */}
        {currentRoute === 'trajectory' && (
          <Layer3BallTrajectoryRecipe
            isLight={isLight}
            onBack={goBack}
          />
        )}
      </MorphingShell>

      {/* Code Snippet */}
      <CodeBlock
        isLight={isLight}
        title="Agent code recipe (Morphing Shell Navigation Recipe)"
        code={`import { MorphingShell } from '@/ui-core/navigation/MorphingShell';
import { Layer1MainMenuRecipe } from '@/ui-core/recipes/Layer1MainMenuRecipe';
import { Layer2PlayRecipe } from '@/ui-core/recipes/Layer2PlayRecipe';
import { Layer2GarageRecipe } from '@/ui-core/recipes/Layer2GarageRecipe';
import { Layer2SettingsRecipe } from '@/ui-core/recipes/Layer2SettingsRecipe';
import { Layer3AudioEqRecipe } from '@/ui-core/recipes/Layer3AudioEqRecipe';

// Routing and size mapping config (Complete three-level hierarchy)
const ROUTES = {
  main: { id: 'main', width: 420, isLayer1: true },
  play: { id: 'play', width: 680, isLayer1: false },
  garage: { id: 'garage', width: 680, isLayer1: false },
  settings: { id: 'settings', width: 680, isLayer1: false },
  'audio-eq': { id: 'audio-eq', width: 480, isLayer1: false },
};

// Globally Shell Automatically responds to route width changes with smooth morphing animations
<MorphingShell
  open={isOpen}
  onOpenChange={setIsOpen}
  width={ROUTES[activeRoute].width}
  isLayer1={activeRoute === 'main'}
  onBack={goBack}
  isLight={isLight}
>
  {activeRoute === 'main' && <Layer1MainMenuRecipe onResume={...} onNavigatePlay={...} onNavigateGarage={...} onNavigateSettings={...} />}
  {activeRoute === 'play' && <Layer2PlayRecipe onBack={goBack} />}
  {activeRoute === 'garage' && <Layer2GarageRecipe onBack={goBack} />}
  {activeRoute === 'settings' && <Layer2SettingsRecipe onBack={goBack} onNavigateAudioDetail={() => setRoute('audio-eq')} />}
  {activeRoute === 'audio-eq' && <Layer3AudioEqRecipe onBack={goBack} />}
</MorphingShell>`}
      />
    </div>
  );
};
