import React, { Suspense, lazy } from 'react';
import { LocalPanelSizingTuner } from './LocalPanelSizingTuner';
import { AuditTicketHeader } from '../../components/AuditTicketHeader';
import type { MenuPanelId } from '../../../ui-core/stores/menuLayoutStore';
import {
  LAYER2_ROOM_HOST_CONTROL_STATES,
  LAYER3_HOST_TRAINING_STATES,
} from '../../../ui-core/recipes/recipeStateMatrixSpecs';

const Layer2RoomHostControlRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer2RoomHostControlRecipe').then((m) => ({
    default: m.Layer2RoomHostControlRecipe,
  }))
);
const Layer3HostTrainingRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3HostTrainingRecipe').then((m) => ({
    default: m.Layer3HostTrainingRecipe,
  }))
);
const Layer3ExhibitionRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3ExhibitionRecipe').then((m) => ({
    default: m.Layer3ExhibitionRecipe,
  }))
);
const Layer3SelfTrainingRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3SelfTrainingRecipe').then((m) => ({
    default: m.Layer3SelfTrainingRecipe,
  }))
);
const Layer3KickoffTrainingRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3KickoffTrainingRecipe').then((m) => ({
    default: m.Layer3KickoffTrainingRecipe,
  }))
);
const Layer3TrainingRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3TrainingRecipe').then((m) => ({
    default: m.Layer3TrainingRecipe,
  }))
);
const Layer3CameraRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3CameraRecipe').then((m) => ({
    default: m.Layer3CameraRecipe,
  }))
);
const CameraSettingsStyleTuner = lazy(() =>
  import('./CameraSettingsStyleTuner').then((m) => ({
    default: m.CameraSettingsStyleTuner,
  }))
);
const Layer3KeybindingsRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3KeybindingsRecipe').then((m) => ({
    default: m.Layer3KeybindingsRecipe,
  }))
);
const Layer3BallTrajectoryRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3BallTrajectoryRecipe').then((m) => ({
    default: m.Layer3BallTrajectoryRecipe,
  }))
);
const Layer3ExpMultiBotsRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3ExpMultiBotsRecipe').then((m) => ({
    default: m.Layer3ExpMultiBotsRecipe,
  }))
);
const Layer3DevSubsystemIsolationRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3DevSubsystemIsolationRecipe').then((m) => ({
    default: m.Layer3DevSubsystemIsolationRecipe,
  }))
);
const Layer3DevActiveTunersRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3DevActiveTunersRecipe').then((m) => ({
    default: m.Layer3DevActiveTunersRecipe,
  }))
);
const Layer3DevCalibratedPresetsRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3DevCalibratedPresetsRecipe').then((m) => ({
    default: m.Layer3DevCalibratedPresetsRecipe,
  }))
);
const Layer3DevUnderDevelopmentRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3DevUnderDevelopmentRecipe').then((m) => ({
    default: m.Layer3DevUnderDevelopmentRecipe,
  }))
);
const Layer4StaticTrainingPackBrowseRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer4StaticTrainingPackBrowseRecipe').then((m) => ({
    default: m.Layer4StaticTrainingPackBrowseRecipe,
  }))
);
const Layer4AdvancedAudioRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer4AdvancedAudioRecipe').then((m) => ({
    default: m.Layer4AdvancedAudioRecipe,
  }))
);
const Layer4ControllerSettingsRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer4ControllerSettingsRecipe').then((m) => ({
    default: m.Layer4ControllerSettingsRecipe,
  }))
);
const Layer4EventTriggerRulesRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer4EventTriggerRulesRecipe').then((m) => ({
    default: m.Layer4EventTriggerRulesRecipe,
  }))
);

export interface DeepLayerRecipeSpec {
  id: string;
  code: string;
  badgeColor: 'emerald' | 'amber' | 'sky';
  title: string;
  panelId: MenuPanelId;
  tunerLabel: string;
  recommendation: string;
  renderPreview: (isLight: boolean) => React.ReactNode;
}

const noop = () => {};

/**
 * Decoupled declarative specifications for 6A.8 – 6A.23 recipes.
 * Each recipe is code-split via React.lazy and isolated so adding, modifying, or
 * resolving merge conflicts on any single panel never couples with other panels.
 */
export const DEEP_LAYER_RECIPE_SPECS: DeepLayerRecipeSpec[] = [
  {
    id: 'recipe-6a-8-host-ctrl',
    code: '6A.8',
    badgeColor: 'emerald',
    title: 'Layer 2 Online Room Control Hub (6-State Flat Matrix · Match Lobby / During Match / Online Warmup · Host & Client)',
    panelId: 'layer2-room-host-control',
    tunerLabel: 'Layer 2 Online Room Control Hub (Online Room Console)',
    recommendation: 'Flat 6-state matrix rendering Match Lobby, During Match, and Online Warmup for both Host and Client roles simultaneously.',
    renderPreview: (isLight) => (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
        {LAYER2_ROOM_HOST_CONTROL_STATES.map((st, idx) => (
          <div key={st.id} className="flex flex-col gap-2 items-center w-full">
            <AuditTicketHeader
              index={idx + 1}
              label={st.label}
              description={st.description}
              referenceCode="6A.8"
              componentName={st.componentName || 'Layer2RoomHostControlRecipe'}
              sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer2RoomHostControlRecipe.tsx'}
              subViewFile={st.subViewFile}
              stateId={st.id}
              activeProps={st.props}
              badgeColor="amber"
              isLight={isLight}
            />
            <Layer2RoomHostControlRecipe
              isLight={isLight}
              {...st.props}
              onBack={noop}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'recipe-6a-19-host-train',
    code: '6A.19',
    badgeColor: 'emerald',
    title: 'Layer 3 Host Training (Flat 4-State Matrix · Idle / Registering Step 3 / Ready Step 5 / Error Step 3)',
    panelId: 'layer3-host-training',
    tunerLabel: 'Layer 3 Host Training (Online Shared Training Setup)',
    recommendation: 'Flat 4-state matrix rendering Host Training room creation lifecycle states side by side.',
    renderPreview: (isLight) => (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
        {LAYER3_HOST_TRAINING_STATES.map((st, idx) => (
          <div key={st.id} className="flex flex-col gap-2 items-center w-full">
            <AuditTicketHeader
              index={idx + 1}
              label={st.label}
              description={st.description}
              referenceCode="6A.19"
              componentName={st.componentName || 'Layer3HostTrainingRecipe'}
              sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer3HostTrainingRecipe.tsx'}
              subViewFile={st.subViewFile}
              stateId={st.id}
              activeProps={st.props}
              badgeColor="emerald"
              isLight={isLight}
            />
            <Layer3HostTrainingRecipe
              isLight={isLight}
              {...st.props}
              onBack={noop}
            />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'recipe-6a-9-bot-diff',
    code: '6A.9',
    badgeColor: 'emerald',
    title: 'Layer 3 Exhibition Match Setup (Offline Exhibition and Nexto/Necto Difficulty Settings)',
    panelId: 'layer3-exhibition',
    tunerLabel: 'Layer 3 Exhibition Match Setup',
    recommendation: 'Configure Offline Format, Nexto/Necto Difficulty and match duration',
    renderPreview: (isLight) => <Layer3ExhibitionRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-10-self-train',
    code: '6A.10',
    badgeColor: 'emerald',
    title: 'Layer 3 Self-Training Hub (Solo training 2x2 grid entry)',
    panelId: 'layer3-self-training',
    tunerLabel: 'Layer 3 Self-Training Hub',
    recommendation: 'Solo training four-grid entry',
    renderPreview: (isLight) => <Layer3SelfTrainingRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-11-kickoff',
    code: '6A.11',
    badgeColor: 'emerald',
    title: 'Layer 3 Kickoff Training Setup (Kickoff training sub-mode and 120Hz Rhythm Track Settings)',
    panelId: 'layer3-kickoff-training',
    tunerLabel: 'Layer 3 Kickoff Training Setup',
    recommendation: 'Kick-off training sub-mode, AI Mirrored Position and 120Hz Rhythm Track Toggle',
    renderPreview: (isLight) => <Layer3KickoffTrainingRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-12-camera',
    code: '6A.12',
    badgeColor: 'emerald',
    title: 'Layer 3 Camera Settings (Camera geometry parameters and Hold Live Preview [TAB])',
    panelId: 'layer3-camera',
    tunerLabel: 'Layer 3 Camera Settings',
    recommendation: 'Camera geometry parameters and Hold Live Preview [TAB]',
    renderPreview: (isLight) => <Layer3CameraRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-12b-keybindings',
    code: '6A.12B',
    badgeColor: 'emerald',
    title: 'Layer 3 Key Bindings & Controls (Three-column key and controller mapping table + Advanced Stick Settings)',
    panelId: 'layer3-keybindings',
    tunerLabel: 'Layer 3 Key Bindings & Controls',
    recommendation: 'Three-column key and controller mapping table + Advanced Stick Settings',
    renderPreview: (isLight) => <Layer3KeybindingsRecipe isLight={isLight} standalone={true} onBack={noop} />,
  },
  {
    id: 'recipe-6a-12c-trajectory',
    code: '6A.12C',
    badgeColor: 'emerald',
    title: 'Layer 3 Ball Trajectory Predictor (Trajectory Prediction Time, Dashed line interval and color config)',
    panelId: 'layer3-ball-trajectory',
    tunerLabel: 'Layer 3 Ball Trajectory Predictor (Live Preview)',
    recommendation: 'Trajectory Prediction Time, Dashed line interval and color config',
    renderPreview: (isLight) => <Layer3BallTrajectoryRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-13-multibots',
    code: '6A.13',
    badgeColor: 'amber',
    title: 'Layer 3 Experimental Multi-Bots 3v3 (Dual Team 6 Independent Slots ONNX Bot Layout & POV Select)',
    panelId: 'layer3-exp-multi-bots',
    tunerLabel: 'Layer 3 Experimental Multi-Bots (3v3)',
    recommendation: 'Dual Team 6 Independent Slots ONNX Bot Layout & POV Select',
    renderPreview: (isLight) => <Layer3ExpMultiBotsRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-14-rcspack',
    code: '6A.14',
    badgeColor: 'sky',
    title: 'Layer 4 Static Training Pack Browser (.RCSPack Dual-column training pack browser and metadata inspector)',
    panelId: 'layer4-static-training-pack',
    tunerLabel: 'Layer 4 Static Training Pack Browser (.RCSPack)',
    recommendation: 'Dual-column training pack browser and metadata inspector',
    renderPreview: (isLight) => <Layer4StaticTrainingPackBrowseRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-15-adv-audio',
    code: '6A.15',
    badgeColor: 'sky',
    title: 'Layer 4 Advanced Audio Synthesis Pool (Boost and Rumble Stage sample matrix tuning)',
    panelId: 'layer4-advanced-audio',
    tunerLabel: 'Layer 4 Advanced Audio Synthesis Pool',
    recommendation: 'Boost and Rumble Stage sample matrix tuning',
    renderPreview: (isLight) => <Layer4AdvancedAudioRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-16-adv-ctrl',
    code: '6A.16',
    badgeColor: 'sky',
    title: 'Layer 4 Controller Settings (Controller Axis Mapping and Turning / Dodging Deadzone Visualization)',
    panelId: 'layer4-controller-settings',
    tunerLabel: 'Layer 4 Controller Settings',
    recommendation: 'Gamepad input device detection, 4-Axis Mapping, Deadzone / Dodge Deadzone High-performance dual-graph deadzone visualization',
    renderPreview: (isLight) => <Layer4ControllerSettingsRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-17-triggers',
    code: '6A.17',
    badgeColor: 'sky',
    title: 'Layer 4 Event & Trigger Rules Engine (Dual-cursor threshold conditions and automatic training action trigger engine)',
    panelId: 'layer4-event-trigger-rules',
    tunerLabel: 'Layer 4 Event & Trigger Rules Engine',
    recommendation: 'Dual-cursor threshold conditions and automatic training action trigger engine',
    renderPreview: (isLight) => <Layer4EventTriggerRulesRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-18-training',
    code: '6A.18',
    badgeColor: 'emerald',
    title: 'Layer 3 Training Configuration (Trajectory Prediction Toggle, Goal Barrier and TAS Rewinder Timeline Access)',
    panelId: 'layer3-training',
    tunerLabel: 'Layer 3 Training Configuration',
    recommendation: 'Trajectory Prediction Toggle, Goal Barrier and TAS Rewinder Timeline Access',
    renderPreview: (isLight) => <Layer3TrainingRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-20-dev-isolation',
    code: '6A.20',
    badgeColor: 'amber',
    title: 'Layer 3 Subsystem Isolation Lab (6 Physics & AI Independent subsystem verification sandbox)',
    panelId: 'layer3-dev-subsystem-isolation',
    tunerLabel: 'Layer 3 Subsystem Isolation Lab (6-Tab Launcher)',
    recommendation: '6 Physics & AI Independent subsystem verification sandbox',
    renderPreview: (isLight) => <Layer3DevSubsystemIsolationRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-21-dev-tuners',
    code: '6A.21',
    badgeColor: 'amber',
    title: 'Layer 3 Active Tuners & Phase Matrix (Active tuning floating window launcher and phase matrix)',
    panelId: 'layer3-dev-active-tuners',
    tunerLabel: 'Layer 3 Active Tuners & Phase Matrix',
    recommendation: 'Active parameter tuning floating window launcher and L3 PhaseVariationMatrix Phase Matrix',
    renderPreview: (isLight) => <Layer3DevActiveTunersRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-22-dev-presets',
    code: '6A.22',
    badgeColor: 'amber',
    title: 'Layer 3 Calibrated Presets & Tuners (10 Physical baseline solidified/Camera/Shader tuner floating window summary)',
    panelId: 'layer3-dev-calibrated-presets',
    tunerLabel: 'Layer 3 Calibrated Presets & Tuners',
    recommendation: '10 Physical baseline solidified/Camera/Shader tuner floating window summary',
    renderPreview: (isLight) => <Layer3DevCalibratedPresetsRecipe isLight={isLight} onBack={noop} />,
  },
  {
    id: 'recipe-6a-23-dev-under-dev',
    code: '6A.23',
    badgeColor: 'amber',
    title: 'Layer 3 Under Development (Three-Wheeler · Throwback Stadium · Per-Car Boost · Camera Shake)',
    panelId: 'layer3-dev-under-development',
    tunerLabel: 'Layer 3 Under Development (Experimental features lab)',
    recommendation: '3-Wheel Mode, Retro Arena, Bike Boost Fine-tuning and collision camera shake parameter panel',
    renderPreview: (isLight) => <Layer3DevUnderDevelopmentRecipe isLight={isLight} onBack={noop} />,
  },
];

const BADGE_COLOR_CLASS: Record<DeepLayerRecipeSpec['badgeColor'], string> = {
  emerald: 'bg-emerald-500/20 text-emerald-500',
  amber: 'bg-amber-500/20 text-amber-500',
  sky: 'bg-sky-500/20 text-sky-500',
};

export const SingleDeepLayerRecipeCard = React.memo<{
  spec: DeepLayerRecipeSpec;
  isLight: boolean;
}>(({ spec, isLight }) => {
  const cardClass = `flex justify-center p-6 rounded-2xl border transition-colors ${
    isLight
      ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
      : 'border-neutral-800 bg-neutral-950/60'
  }`;

  return (
    <div id={spec.id} className="scroll-mt-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 rounded-md ${BADGE_COLOR_CLASS[spec.badgeColor]} flex items-center justify-center font-mono font-bold text-xs`}
        >
          {spec.code}
        </span>
        <h2 className="text-base font-bold">{spec.title}</h2>
      </div>
      <LocalPanelSizingTuner
        code={spec.code}
        panelId={spec.panelId}
        label={spec.tunerLabel}
        recommendation={spec.recommendation}
        isLight={isLight}
      />
      {spec.id === 'recipe-6a-12-camera' && (
        <Suspense fallback={null}>
          <CameraSettingsStyleTuner
            isLight={isLight}
            codeBadge="6A.12M"
            showStandalonePreview={false}
          />
        </Suspense>
      )}
      <div className={cardClass}>
        <Suspense
          fallback={
            <div className="py-12 text-xs font-mono text-neutral-400">
              Loading on Demand [{spec.code}] Menu Module...
            </div>
          }
        >
          {spec.renderPreview(isLight)}
        </Suspense>
      </div>
    </div>
  );
});

SingleDeepLayerRecipeCard.displayName = 'SingleDeepLayerRecipeCard';

export interface DeepLayerRecipesSectionProps {
  isLight: boolean;
  /** Optional target recipe ID; when provided, only that recipe is mounted on-demand */
  activeRecipeId?: string;
}

export const DeepLayerRecipesSection = React.memo<DeepLayerRecipesSectionProps>(
  ({ isLight, activeRecipeId }) => {
    const specsToRender = React.useMemo(() => {
      if (!activeRecipeId) return DEEP_LAYER_RECIPE_SPECS;
      return DEEP_LAYER_RECIPE_SPECS.filter(
        (s) => s.id === activeRecipeId || s.code === activeRecipeId
      );
    }, [activeRecipeId]);

    if (specsToRender.length === 0) return null;

    return (
      <div className="flex flex-col gap-10">
        {specsToRender.map((spec) => (
          <SingleDeepLayerRecipeCard key={spec.id} spec={spec} isLight={isLight} />
        ))}
      </div>
    );
  }
);

DeepLayerRecipesSection.displayName = 'DeepLayerRecipesSection';
