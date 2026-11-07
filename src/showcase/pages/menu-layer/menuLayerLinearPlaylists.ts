import {
  LAYER1_CONTEXT_VARIATIONS,
  type Layer1MenuContextMode,
} from '../../../ui-core/recipes/layer1MenuContextSpecs';
import {
  DEV_SETTINGS_QUICK_TABS,
  GARAGE_QUICK_TABS,
  MENU_SANDBOX_JUMP_ITEMS,
  USER_SETTINGS_QUICK_TABS,
  type ActiveMenuRoute,
  type Layer3StepProgressStatus,
  type LinearPlaylistStep,
  type MenuVisibilityTier,
} from './menuLayerRouteConfig';

const ROOM_CONTROL_CONTEXT_STEPS: Array<{ ctx: Layer1MenuContextMode; label: string }> = [
  { ctx: 'match-lobby-host', label: 'Match Lobby (Host)' },
  { ctx: 'match-lobby-client', label: 'Match Lobby (Client)' },
  { ctx: 'online-match-host', label: 'During Match (Host)' },
  { ctx: 'online-match-client', label: 'During Match (Client)' },
  { ctx: 'online-warmup-host', label: 'Online Warmup (Host)' },
  { ctx: 'online-warmup-client', label: 'Online Warmup (Client)' },
];

const HOST_MATCH_PROGRESS_STEPS: Array<{
  suffix: string;
  status: Layer3StepProgressStatus;
  step: number;
  editing?: boolean;
  label: string;
}> = [
  { suffix: 'idle', status: 'idle', step: 1, editing: false, label: 'Idle (Summary Card)' },
  { suffix: 'editing', status: 'idle', step: 1, editing: true, label: 'Editing Rules Expanded' },
  { suffix: 'step-1', status: 'running', step: 1, editing: false, label: 'Step 1/5 Validating Loadout' },
  { suffix: 'step-3', status: 'running', step: 3, editing: false, label: 'Step 3/5 Signaling Offer' },
  { suffix: 'error-3', status: 'error', step: 3, editing: false, label: 'Error at Step 3/5 (Timeout)' },
  { suffix: 'completed', status: 'completed', step: 5, editing: false, label: 'Completed Step 5/5 Ready' },
];

const HOST_TRAINING_PROGRESS_STEPS: Array<{
  suffix: string;
  status: Layer3StepProgressStatus;
  step: number;
  label: string;
}> = [
  { suffix: 'idle', status: 'idle', step: 1, label: 'Idle (Default Setup)' },
  { suffix: 'step-3', status: 'running', step: 3, label: 'Step 3/5 Signaling Offer' },
  { suffix: 'error-3', status: 'error', step: 3, label: 'Error at Step 3/5 (Timeout)' },
  { suffix: 'completed', status: 'completed', step: 5, label: 'Completed Step 5/5 Ready' },
];

const JOIN_ROOM_PROGRESS_STEPS: Array<{
  suffix: string;
  status: Layer3StepProgressStatus;
  step: number;
  label: string;
}> = [
  { suffix: 'idle', status: 'idle', step: 1, label: 'Idle (Enter Room Code)' },
  { suffix: 'step-2', status: 'running', step: 2, label: 'Step 2/5 Querying Signaling' },
  { suffix: 'step-4', status: 'running', step: 4, label: 'Step 4/5 ICE Handshake' },
  { suffix: 'error-3', status: 'error', step: 3, label: 'Error at Step 3/5 (Peer Unreachable)' },
  { suffix: 'completed', status: 'completed', step: 5, label: 'Completed Step 5/5 Joined' },
];

/**
 * Complete Linear Playlist of all User-Only vs Developer-Only pages/variations/tabs/states
 * for the `< Prev Page | Next Page >` and ArrowLeft/ArrowRight rapid visual scanner.
 */
export const USER_LINEAR_PLAYLIST: LinearPlaylistStep[] = [
  { id: 'user-l0', tier: 'user', route: 'layer-0', layer: 0, label: 'Active Match (0px)', breadcrumb: 'Layer 0 · Active Match' },
  ...LAYER1_CONTEXT_VARIATIONS.filter((v) => v.tier === 'user').map((v) => ({
    id: `user-l1-${v.id}`, tier: 'user' as const, route: 'main-menu' as const, contextMode: v.id,
    layer: 1 as const, label: `L1 Main Menu · ${v.label}`, breadcrumb: `Layer 1 · ${v.headerTitle} (${v.label})`,
  })),
  { id: 'user-l2-play', tier: 'user', route: 'play', layer: 2, label: 'L2 Play Modes (6-Mode Grid)', breadcrumb: 'Layer 1 → Play' },
  ...GARAGE_QUICK_TABS.map((t) => ({
    id: `user-l2-garage-${t.id}`, tier: 'user' as const, route: 'garage' as const, subtab: t.id,
    layer: 2 as const, label: `L2 Garage · ${t.label} Tab`, breadcrumb: `Layer 1 → Garage → ${t.label}`,
  })),
  ...USER_SETTINGS_QUICK_TABS.map((t) => ({
    id: `user-l2-settings-${t.id}`, tier: 'user' as const, route: 'settings' as const, subtab: t.id,
    layer: 2 as const, label: `L2 Settings · ${t.label} Tab`, breadcrumb: `Layer 1 → Settings → ${t.label}`,
  })),
  ...ROOM_CONTROL_CONTEXT_STEPS.map((rc) => ({
    id: `user-l2-room-host-${rc.ctx}`, tier: 'user' as const, route: 'manage-room' as const, contextMode: rc.ctx,
    layer: 2 as const, label: `L2 Room Control · ${rc.label}`, breadcrumb: `Layer 1 → Room Control → ${rc.label}`,
  })),
  ...HOST_MATCH_PROGRESS_STEPS.map((hm) => ({
    id: `user-l3-host-match-${hm.suffix}`, tier: 'user' as const, route: 'host-match' as const,
    progressStatus: hm.status, currentStep: hm.step, defaultEditingConfig: hm.editing,
    layer: 3 as const, label: `L3 Host Match · ${hm.label}`, breadcrumb: `Play → Host Match → ${hm.label}`,
  })),
  ...HOST_TRAINING_PROGRESS_STEPS.map((ht) => ({
    id: `user-l3-host-training-${ht.suffix}`, tier: 'user' as const, route: 'host-training' as const,
    progressStatus: ht.status, currentStep: ht.step,
    layer: 3 as const, label: `L3 Host Training · ${ht.label}`, breadcrumb: `Play → Host Training → ${ht.label}`,
  })),
  { id: 'user-l3-custom-play', tier: 'user', route: 'custom-play', layer: 3, label: 'L3 Custom Mode (In Development)', breadcrumb: 'Play → Custom' },
  ...JOIN_ROOM_PROGRESS_STEPS.map((jr) => ({
    id: `user-l3-join-room-${jr.suffix}`, tier: 'user' as const, route: 'join-room' as const,
    progressStatus: jr.status, currentStep: jr.step,
    layer: 3 as const, label: `L3 Join Room · ${jr.label}`, breadcrumb: `Play → Join Room → ${jr.label}`,
  })),
  { id: 'user-l3-exhibition', tier: 'user', route: 'exhibition', layer: 3, label: 'L3 Exhibition Bot Setup', breadcrumb: 'Play → Exhibition Setup' },
  { id: 'user-l3-self-training', tier: 'user', route: 'self-training', layer: 3, label: 'L3 Self-Training Hub', breadcrumb: 'Play → Self-Training' },
  { id: 'user-l3-kickoff', tier: 'user', route: 'kickoff-training', layer: 3, label: 'L3 Kickoff Training Setup', breadcrumb: 'Self-Training → Kickoff Training' },
  { id: 'user-l3-training', tier: 'user', route: 'training-config', layer: 3, label: 'L3 Training Configuration', breadcrumb: 'Main Menu → Training Configuration' },
  { id: 'user-l3-camera', tier: 'user', route: 'camera', layer: 3, label: 'L3 Camera Geometry Settings', breadcrumb: 'Settings → Gameplay → Camera Settings' },
  { id: 'user-l3-keybindings', tier: 'user', route: 'keybindings', layer: 3, label: 'L3 Key Bindings & Controls', breadcrumb: 'Settings → Gameplay → Key Bindings' },
  { id: 'user-l3-trajectory', tier: 'user', route: 'trajectory', layer: 3, label: 'L3 Ball Trajectory Live Preview', breadcrumb: 'Settings → Gameplay → Trajectory Live Preview' },
  { id: 'user-l4-rcspack', tier: 'user', route: 'static-training-pack', layer: 4, label: 'L4 Static Training Pack (.RCSPack)', breadcrumb: 'Self-Training → .RCSPack Browser' },
  { id: 'user-l4-controller', tier: 'user', route: 'controller-settings', layer: 4, label: 'L4 Controller Settings', breadcrumb: 'Settings → Key Bindings → Controller Settings' },
];

export const DEV_LINEAR_PLAYLIST: LinearPlaylistStep[] = [
  ...LAYER1_CONTEXT_VARIATIONS.filter((v) => v.tier === 'developer').map((v) => ({
    id: `dev-l1-${v.id}`, tier: 'developer' as const, route: 'main-menu' as const, contextMode: v.id,
    layer: 1 as const, label: `L1 Dev Menu · ${v.label}`, breadcrumb: `Layer 1 (Dev) · ${v.headerTitle} (${v.label})`,
  })),
  ...DEV_SETTINGS_QUICK_TABS.map((t) => ({
    id: `dev-l2-settings-${t.id}`, tier: 'developer' as const, route: 'settings' as const, subtab: t.id,
    layer: 2 as const, label: 'L2 Settings · Developer Tab', breadcrumb: 'Settings → Developer Tab (5 Hub Cards)',
  })),
  { id: 'dev-l3-isolation', tier: 'developer', route: 'dev-sandboxes', layer: 3, label: 'L3 Sandboxes & Isolation Lab (6 Tabs)', breadcrumb: 'Developer → Sandboxes & Isolation Labs' },
  { id: 'dev-l3-multibots', tier: 'developer', route: 'exp-multi-bots', layer: 3, label: 'L3 Experimental Multi-Bots (3v3)', breadcrumb: 'Developer → Experimental Multi-Bots' },
  { id: 'dev-l3-active-tuners', tier: 'developer', route: 'dev-active-tuners', layer: 3, label: 'L3 Active Tuners & Phase Matrix', breadcrumb: 'Developer → Active Tuners' },
  { id: 'dev-l3-calibrated-presets', tier: 'developer', route: 'dev-calibrated-presets', layer: 3, label: 'L3 Calibrated Presets & Tuners', breadcrumb: 'Developer → Calibrated Presets' },
  { id: 'dev-l3-under-dev', tier: 'developer', route: 'dev-under-development', layer: 3, label: 'L3 Under Development', breadcrumb: 'Developer → Under Development' },
  { id: 'dev-l3-audio-eq', tier: 'developer', route: 'audio-eq', layer: 3, label: 'L3 Acoustics & Parametric EQ', breadcrumb: 'Developer → Acoustics & EQ' },
  { id: 'dev-l4-adv-audio', tier: 'developer', route: 'advanced-audio', layer: 4, label: 'L4 Advanced Audio Synthesis Pool', breadcrumb: 'Developer → Active Tuners → Advanced Audio' },
  { id: 'dev-l4-event-trigger-rules', tier: 'developer', route: 'event-trigger-rules', layer: 4, label: 'L4 Event & Trigger Rules Engine', breadcrumb: 'Developer → Active Tuners → Event & Trigger Rules' },
];

const DIRECT_STORE_ONLY_ROUTES = new Set<ActiveMenuRoute>([
  'host-training',
  'custom-play',
]);

export function resolveRouteAuditInfo(
  route: ActiveMenuRoute,
  tier: MenuVisibilityTier
): {
  referenceCode: string;
  componentName: string;
  sourceFile: string;
  tunerStatus: 'dedicated-tuner' | 'direct-store';
} {
  const jumpEntry =
    MENU_SANDBOX_JUMP_ITEMS.find((j) => j.route === route && j.tier === tier) ||
    MENU_SANDBOX_JUMP_ITEMS.find((j) => j.route === route);
  const referenceCode = jumpEntry?.code || '7A';
  const rawComp = (jumpEntry?.componentName || 'Layer1MainMenuRecipe').replace(
    /\s*\(Dev\)$/,
    ''
  );
  const sourceFile =
    route === 'layer-0'
      ? 'src/showcase/pages/menu-layer/MenuLayerStageCanvas.tsx'
      : `src/ui-core/recipes/${rawComp}.tsx`;
  const tunerStatus = DIRECT_STORE_ONLY_ROUTES.has(route)
    ? 'direct-store'
    : 'dedicated-tuner';
  return { referenceCode, componentName: rawComp, sourceFile, tunerStatus };
}

export function findPlaylistStepIndex(
  playlist: LinearPlaylistStep[],
  currentRoute: ActiveMenuRoute,
  normalizedLayer1Ctx: Layer1MenuContextMode,
  settingsTab: string,
  garageTab: string,
  layer3Override?: {
    progressStatus?: Layer3StepProgressStatus;
    currentStep?: number;
    defaultEditingConfig?: boolean;
  }
): number {
  const exactIdx = playlist.findIndex((step) => {
    if (step.route !== currentRoute) return false;
    if (
      (currentRoute === 'main-menu' || currentRoute === 'manage-room') &&
      step.contextMode
    ) {
      return step.contextMode === normalizedLayer1Ctx;
    }
    if (currentRoute === 'settings' && step.subtab) {
      return step.subtab === settingsTab;
    }
    if (currentRoute === 'garage' && step.subtab) {
      return step.subtab === garageTab;
    }
    if (
      (currentRoute === 'host-match' ||
        currentRoute === 'host-training' ||
        currentRoute === 'join-room') &&
      step.progressStatus
    ) {
      const targetStatus = layer3Override?.progressStatus ?? 'idle';
      const targetStep = layer3Override?.currentStep ?? 1;
      const targetEdit = Boolean(layer3Override?.defaultEditingConfig);
      if (step.progressStatus !== targetStatus) return false;
      if ((step.currentStep ?? 1) !== targetStep) return false;
      if (
        currentRoute === 'host-match' &&
        Boolean(step.defaultEditingConfig) !== targetEdit
      ) {
        return false;
      }
      return true;
    }
    return true;
  });
  if (exactIdx >= 0) return exactIdx;
  const routeFallbackIdx = playlist.findIndex((s) => s.route === currentRoute);
  return Math.max(0, routeFallbackIdx);
}
