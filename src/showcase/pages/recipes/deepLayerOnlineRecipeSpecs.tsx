import React, { lazy } from 'react';
import { AuditTicketHeader } from '../../components/AuditTicketHeader';
import {
  LAYER2_ROOM_HOST_CONTROL_STATES,
  LAYER3_HOST_TRAINING_STATES,
} from '../../../ui-core/recipes/recipeStateMatrixSpecs';
import type { MenuPanelId } from '../../../ui-core/tokens/menuLayoutTokens';

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

const Layer2OnlineRoomControlRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer2OnlineRoomControlRecipe').then((m) => ({
    default: m.Layer2OnlineRoomControlRecipe,
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

const noop = () => {};

export const DEEP_LAYER_ONLINE_AND_USER_RECIPE_SPECS: DeepLayerRecipeSpec[] = [
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
            <Layer2OnlineRoomControlRecipe
              isLight={isLight}
              {...st.props}
              onBack={noop}
            />
            <AuditTicketHeader
              index={idx + 1}
              label={st.label}
              description={st.description}
              referenceCode="6A.8"
              componentName={st.componentName || 'Layer2OnlineRoomControlRecipe'}
              sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer2OnlineRoomControlRecipe.tsx'}
              subViewFile={st.subViewFile}
              stateId={st.id}
              activeProps={st.props}
              badgeColor="amber"
              isLight={isLight}
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
            <Layer3HostTrainingRecipe
              isLight={isLight}
              {...st.props}
              onBack={noop}
            />
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
    id: 'recipe-6a-18-training',
    code: '6A.18',
    badgeColor: 'emerald',
    title: 'Layer 3 Training Configuration (Trajectory Prediction Toggle, Goal Barrier and TAS Rewinder Timeline Access)',
    panelId: 'layer3-training',
    tunerLabel: 'Layer 3 Training Configuration',
    recommendation: 'Trajectory Prediction Toggle, Goal Barrier and TAS Rewinder Timeline Access',
    renderPreview: (isLight) => <Layer3TrainingRecipe isLight={isLight} onBack={noop} />,
  },
];
