import type { MenuPanelId } from '../../../ui-core/tokens/menuLayoutTokens';
import type { TabItem } from '../../../ui-core/primitives/UnderlineTabs';
import type { JumpDirectoryItem } from '../../PageJumpDirectory';
import type { Layer1MenuContextMode } from '../../../ui-core/recipes/layer1MenuContextSpecs';

export type MenuVisibilityTier = 'user' | 'developer';

export type ActiveMenuRoute =
  | 'layer-0'
  | 'main-menu'
  | 'play'
  | 'garage'
  | 'settings'
  | 'manage-room'
  | 'audio-eq'
  | 'trajectory'
  | 'host-match'
  | 'host-training'
  | 'custom-play'
  | 'join-room'
  | 'exhibition'
  | 'self-training'
  | 'kickoff-training'
  | 'training-config'
  | 'camera'
  | 'keybindings'
  | 'exp-multi-bots'
  | 'exp-botpack-9700488'
  | 'dev-sandboxes'
  | 'dev-active-tuners'
  | 'dev-calibrated-presets'
  | 'dev-self-test'
  | 'dev-under-development'
  | 'dev-remote-profile'
  | 'dev-quick-actions'
  | 'dev-tem-pack-converter'
  | 'static-training-pack'
  | 'advanced-audio'
  | 'controller-settings'
  | 'event-trigger-rules'
  | 'dev-signaling-lab';

export const ROUTE_TO_PANEL_ID: Record<Exclude<ActiveMenuRoute, 'layer-0'>, MenuPanelId> = {
  'main-menu': 'layer1-main',
  'play': 'layer2-play',
  'garage': 'layer2-garage',
  'settings': 'layer2-settings',
  'manage-room': 'layer2-manage-room',
  'audio-eq': 'layer3-acoustics-equalizer',
  'trajectory': 'layer3-ball-trajectory',
  'host-match': 'layer3-host-match',
  'host-training': 'layer3-host-training',
  'custom-play': 'layer3-custom-play',
  'join-room': 'layer3-join-room',
  'exhibition': 'layer3-exhibition',
  'self-training': 'layer3-self-training',
  'kickoff-training': 'layer3-kickoff-training',
  'training-config': 'layer3-training-config',
  'camera': 'layer3-camera',
  'keybindings': 'layer3-keybindings',
  'exp-multi-bots': 'layer3-exp-multi-bots',
  'exp-botpack-9700488': 'layer3-exp-botpack',
  'dev-sandboxes': 'layer3-dev-sandboxes',
  'dev-active-tuners': 'layer3-dev-active-tuners',
  'dev-calibrated-presets': 'layer3-dev-calibrated-presets',
  'dev-self-test': 'layer3-dev-self-test',
  'dev-under-development': 'layer3-dev-under-development',
  'dev-remote-profile': 'layer3-dev-remote-profile',
  'dev-quick-actions': 'layer3-dev-quick-actions',
  'dev-tem-pack-converter': 'layer4-static-training-pack',
  'static-training-pack': 'layer4-static-training-pack',
  'advanced-audio': 'layer4-advanced-audio',
  'controller-settings': 'layer4-controller-settings',
  'event-trigger-rules': 'layer4-event-trigger-rules',
  'dev-signaling-lab': 'layer4-dev-signaling-lab',
};

export interface SandboxJumpEntry extends JumpDirectoryItem {
  route: ActiveMenuRoute;
  tier: MenuVisibilityTier;
}

const STAGE_TARGET_ID = 'rc-ui-tuner-preview-stage';

export const MENU_SANDBOX_JUMP_ITEMS: SandboxJumpEntry[] = [
  // --- User Tier ---
  { code: '7A.0', componentName: 'MenuLayerStageCanvas', label: 'Level 0 menu-less game state (0px)', targetId: STAGE_TARGET_ID, tag: 'Layer 0 · User', route: 'layer-0', tier: 'user' },
  { code: '7A.1', componentName: 'Layer1MainMenuRecipe', label: 'Main pause root menu (11 User Contexts)', targetId: STAGE_TARGET_ID, tag: 'Layer 1 · User', route: 'main-menu', tier: 'user' },
  { code: '7A.2', componentName: 'Layer2PlayRecipe', label: 'Mode Selection 2×3 Grid (Play)', targetId: STAGE_TARGET_ID, tag: 'Layer 2 · User', route: 'play', tier: 'user' },
  { code: '7A.3', componentName: 'Layer2GarageRecipe', label: 'Garage Preset (5 Tabs includes Loadout)', targetId: STAGE_TARGET_ID, tag: 'Layer 2 · User', route: 'garage', tier: 'user' },
  { code: '7A.4', componentName: 'Layer2SettingsRecipe', label: '5-Tab icon+Text Settings (User 4 Tabs)', targetId: STAGE_TARGET_ID, tag: 'Layer 2 · User', route: 'settings', tier: 'user' },
  { code: '7A.5', componentName: 'Layer2ManageRoomRecipe', label: 'Online room control console (6 Contexts)', targetId: STAGE_TARGET_ID, tag: 'Layer 2 · User', route: 'manage-room', tier: 'user' },
  { code: '7A.6', componentName: 'Layer3HostMatchRecipe', label: 'Create online room page (Host Match)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'host-match', tier: 'user' },
  { code: '7A.6T', componentName: 'Layer3HostTrainingRecipe', label: 'Create online training room (Host Training)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'host-training', tier: 'user' },
  { code: '7A.6C', componentName: 'Layer3CustomPlayRecipe', label: 'Custom mode under development (Custom · In Development)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'custom-play', tier: 'user' },
  { code: '7A.7', componentName: 'Layer3JoinRoomRecipe', label: 'Join online room page (Join Room)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'join-room', tier: 'user' },
  { code: '7A.8', componentName: 'Layer3ExhibitionRecipe', label: 'Exhibition Offline Race Config', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'exhibition', tier: 'user' },
  { code: '7A.9', componentName: 'Layer3SelfTrainingRecipe', label: 'Single-player training vertical five-item entry (Self-Training)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'self-training', tier: 'user' },
  { code: '7A.10', componentName: 'Layer3KickoffTrainingRecipe', label: 'Kickoff rhythm training config (Kickoff)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'kickoff-training', tier: 'user' },
  { code: '7A.11', componentName: 'Layer3TrainingConfigRecipe', label: 'Training Assist & Rewinder config (Training)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'training-config', tier: 'user' },
  { code: '7A.12', componentName: 'Layer3CameraRecipe', label: 'Camera Geometry Settings (Camera)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'camera', tier: 'user' },
  { code: '7A.13', componentName: 'Layer3KeybindingsRecipe', label: 'Key binding and advanced controller entry (Keybindings)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'keybindings', tier: 'user' },
  { code: '7A.14', componentName: 'Layer3BallTrajectoryRecipe', label: 'Side-docked trajectory prediction (Live Preview)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · User', route: 'trajectory', tier: 'user' },
  { code: '7A.15', componentName: 'Layer4StaticTrainingPackBrowseRecipe', label: '.RCSPack Static training pack browser', targetId: STAGE_TARGET_ID, tag: 'Layer 4 · User', route: 'static-training-pack', tier: 'user' },
  { code: '7A.16', componentName: 'Layer4ControllerSettingsRecipe', label: 'Advanced controller curves and deadzones (Controller)', targetId: STAGE_TARGET_ID, tag: 'Layer 4 · User', route: 'controller-settings', tier: 'user' },

  // --- Developer Tier ---
  { code: '7A.D1', componentName: 'Layer1MainMenuRecipe', label: 'Root Menu (Dev Test Lab / Multi-Bots Context)', targetId: STAGE_TARGET_ID, tag: 'Layer 1 · Dev', route: 'main-menu', tier: 'developer' },
  { code: '7A.D2', componentName: 'Layer2SettingsRecipe', label: 'Settings -> Developer Tab Developer Center', targetId: STAGE_TARGET_ID, tag: 'Layer 2 · Dev', route: 'settings', tier: 'developer' },
  { code: '7A.D4', componentName: 'Layer3DevSandboxesRecipe', label: '6-Tab Subsystem Isolation Lab & Sandboxes', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'dev-sandboxes', tier: 'developer' },
  { code: '7A.D5', componentName: 'Layer3ExpMultiBotsRecipe', label: 'Experimental Multi-Bots (3v3 ONNX)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'exp-multi-bots', tier: 'developer' },
  { code: '7A.D5B', componentName: 'Layer3ExpBotPackRecipe', label: 'BotPack_9700488 Showcase (6 Bots)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'exp-botpack-9700488', tier: 'developer' },
  { code: '7A.D6', componentName: 'Layer3DevActiveTunersRecipe', label: 'Active Tuners & Phase Matrix', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'dev-active-tuners', tier: 'developer' },
  { code: '7A.D7', componentName: 'Layer3DevCalibratedPresetsRecipe', label: 'Calibrated Presets & Tuners', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'dev-calibrated-presets', tier: 'developer' },
  { code: '7A.D8', componentName: 'Layer3DevSelfTestRecipe', label: 'Self Test Suites & Harnesses', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'dev-self-test', tier: 'developer' },
  { code: '7A.D9', componentName: 'Layer3DevUnderDevelopmentRecipe', label: 'Under Development (Staging)', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'dev-under-development', tier: 'developer' },
  { code: '7A.D9R', componentName: 'Layer3DevRemoteProfileRecipe', label: 'Remote Profile & Account Management', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'dev-remote-profile', tier: 'developer' },
  { code: '7A.D9Q', componentName: 'Layer3DevQuickActionsRecipe', label: 'Quick Actions & Match Toggles', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'dev-quick-actions', tier: 'developer' },
  { code: '7A.D10', componentName: 'Layer3AcousticsEqualizerRecipe', label: 'Acoustics & EQ Detail', targetId: STAGE_TARGET_ID, tag: 'Layer 3 · Dev', route: 'audio-eq', tier: 'developer' },
  { code: '7A.D11', componentName: 'Layer4AdvancedAudioRecipe', label: 'Advanced Audio Synthesis Pool', targetId: STAGE_TARGET_ID, tag: 'Layer 4 · Dev', route: 'advanced-audio', tier: 'developer' },
  { code: '7A.D12', componentName: 'Layer4EventTriggerRulesRecipe', label: 'Event & Trigger Rules Engine', targetId: STAGE_TARGET_ID, tag: 'Layer 4 · Dev', route: 'event-trigger-rules', tier: 'developer' },
  { code: '7A.D13', componentName: 'Layer4DevSignalingLabRecipe', label: '4-Server Signaling & Dual Bridge Lab', targetId: STAGE_TARGET_ID, tag: 'Layer 4 · Dev', route: 'dev-signaling-lab', tier: 'developer' },
  { code: '7A.D14', componentName: 'Layer4StaticTrainingPackBrowseRecipe', label: 'Dev .tem -> .RCSPack Pack Converter', targetId: STAGE_TARGET_ID, tag: 'Layer 4 · Dev', route: 'dev-tem-pack-converter', tier: 'developer' },
];

export interface LayerRouteConfig {
  id: ActiveMenuRoute;
  label: string;
  layer: 0 | 1 | 2 | 3 | 4;
  width: number;
  tier: MenuVisibilityTier | 'both';
  parentRoute?: ActiveMenuRoute;
}

export const MENU_ROUTE_CONFIG: Record<ActiveMenuRoute, LayerRouteConfig> = {
  'layer-0': { id: 'layer-0', label: 'Active Match (Layer 0)', layer: 0, width: 0, tier: 'both' },
  'main-menu': { id: 'main-menu', label: 'Main Menu', layer: 1, width: 420, tier: 'both' },
  'play': { id: 'play', label: 'Play Modes', layer: 2, width: 600, tier: 'user', parentRoute: 'main-menu' },
  'garage': { id: 'garage', label: 'Garage Loadout', layer: 2, width: 640, tier: 'user', parentRoute: 'main-menu' },
  'settings': { id: 'settings', label: 'Game Settings', layer: 2, width: 680, tier: 'both', parentRoute: 'main-menu' },
  'manage-room': { id: 'manage-room', label: 'Online Room Control', layer: 2, width: 720, tier: 'user', parentRoute: 'play' },
  'audio-eq': { id: 'audio-eq', label: 'Acoustics & EQ', layer: 3, width: 480, tier: 'developer', parentRoute: 'settings' },
  'trajectory': { id: 'trajectory', label: 'Ball Trajectory Predictor', layer: 3, width: 560, tier: 'both', parentRoute: 'settings' },
  'host-match': { id: 'host-match', label: 'Host Match Room', layer: 3, width: 520, tier: 'user', parentRoute: 'play' },
  'host-training': { id: 'host-training', label: 'Host Training Room', layer: 3, width: 500, tier: 'user', parentRoute: 'play' },
  'custom-play': { id: 'custom-play', label: 'Custom Mode (In Development)', layer: 3, width: 500, tier: 'user', parentRoute: 'play' },
  'join-room': { id: 'join-room', label: 'Join Online Room', layer: 3, width: 500, tier: 'user', parentRoute: 'play' },
  'exhibition': { id: 'exhibition', label: 'Exhibition Match Setup', layer: 3, width: 480, tier: 'user', parentRoute: 'play' },
  'self-training': { id: 'self-training', label: 'Self-Training Hub', layer: 3, width: 560, tier: 'user', parentRoute: 'play' },
  'kickoff-training': { id: 'kickoff-training', label: 'Kickoff Training Setup', layer: 3, width: 500, tier: 'user', parentRoute: 'self-training' },
  'training-config': { id: 'training-config', label: 'Training Configuration', layer: 3, width: 600, tier: 'user', parentRoute: 'self-training' },
  'camera': { id: 'camera', label: 'Camera Settings', layer: 3, width: 560, tier: 'user', parentRoute: 'settings' },
  'keybindings': { id: 'keybindings', label: 'Key Bindings & Controls', layer: 3, width: 560, tier: 'user', parentRoute: 'settings' },
  'exp-multi-bots': { id: 'exp-multi-bots', label: 'Experimental Multi-Bots (3v3)', layer: 3, width: 720, tier: 'developer', parentRoute: 'settings' },
  'exp-botpack-9700488': { id: 'exp-botpack-9700488', label: 'BotPack_9700488 Showcase (6 Bots)', layer: 3, width: 580, tier: 'developer', parentRoute: 'dev-sandboxes' },
  'dev-sandboxes': { id: 'dev-sandboxes', label: 'Sandboxes', layer: 3, width: 560, tier: 'developer', parentRoute: 'settings' },
  'dev-active-tuners': { id: 'dev-active-tuners', label: 'Active Tuners', layer: 3, width: 600, tier: 'developer', parentRoute: 'settings' },
  'dev-calibrated-presets': { id: 'dev-calibrated-presets', label: 'Calibrated Presets', layer: 3, width: 560, tier: 'developer', parentRoute: 'settings' },
  'dev-self-test': { id: 'dev-self-test', label: 'Self Test', layer: 3, width: 560, tier: 'developer', parentRoute: 'settings' },
  'dev-under-development': { id: 'dev-under-development', label: 'Under Development', layer: 3, width: 600, tier: 'developer', parentRoute: 'settings' },
  'dev-remote-profile': { id: 'dev-remote-profile', label: 'Remote Profile & Account Management', layer: 3, width: 620, tier: 'developer', parentRoute: 'settings' },
  'dev-quick-actions': { id: 'dev-quick-actions', label: 'Quick Actions & Match Toggles', layer: 3, width: 560, tier: 'developer', parentRoute: 'main-menu' },
  'dev-tem-pack-converter': { id: 'dev-tem-pack-converter', label: 'Dev .tem Pack Converter', layer: 4, width: 680, tier: 'developer', parentRoute: 'dev-sandboxes' },
  'static-training-pack': { id: 'static-training-pack', label: 'Static Training Pack (.RCSPack)', layer: 4, width: 700, tier: 'user', parentRoute: 'self-training' },
  'advanced-audio': { id: 'advanced-audio', label: 'Advanced Audio Synthesis Pool', layer: 4, width: 720, tier: 'developer', parentRoute: 'dev-active-tuners' },
  'controller-settings': { id: 'controller-settings', label: 'Controller Settings', layer: 4, width: 640, tier: 'user', parentRoute: 'keybindings' },
  'event-trigger-rules': { id: 'event-trigger-rules', label: 'Event & Trigger Rules Engine', layer: 4, width: 640, tier: 'developer', parentRoute: 'dev-active-tuners' },
  'dev-signaling-lab': { id: 'dev-signaling-lab', label: '4-Server Signaling & Bridge Lab', layer: 4, width: 760, tier: 'developer', parentRoute: 'dev-self-test' },
};

export const USER_SETTINGS_QUICK_TABS: TabItem[] = [
  { id: 'gameplay', label: 'Gameplay' },
  { id: 'audio', label: 'Audio' },
  { id: 'display', label: 'Display' },
  { id: 'advanced', label: 'Advanced' },
];

export const DEV_SETTINGS_QUICK_TABS: TabItem[] = [
  { id: 'developer', label: 'Developer' },
];

export const SETTINGS_QUICK_TABS: TabItem[] = [
  ...USER_SETTINGS_QUICK_TABS,
  ...DEV_SETTINGS_QUICK_TABS,
];

export const GARAGE_QUICK_TABS: TabItem[] = [
  { id: 'car', label: 'Car' },
  { id: 'paint', label: 'Paint' },
  { id: 'loadout', label: 'Loadout' },
  { id: 'anthem', label: 'Anthem' },
  { id: 'sync', label: 'Sync' },
];

export type Layer3StepProgressStatus = 'idle' | 'running' | 'error' | 'completed';

export interface LinearPlaylistStep {
  id: string;
  tier: MenuVisibilityTier;
  route: ActiveMenuRoute;
  subtab?: string;
  contextMode?: Layer1MenuContextMode;
  progressStatus?: Layer3StepProgressStatus;
  currentStep?: number;
  defaultEditingConfig?: boolean;
  layer: 0 | 1 | 2 | 3 | 4;
  label: string;
  breadcrumb: string;
}

export const isLayer3RouteAvailable = (
  panelRoute: ActiveMenuRoute,
  currentRoute: ActiveMenuRoute
): boolean => {
  const cfg = MENU_ROUTE_CONFIG[panelRoute];
  if (!cfg || (cfg.layer !== 3 && cfg.layer !== 4)) return false;
  if (panelRoute === 'trajectory') {
    return (
      currentRoute === 'settings' ||
      currentRoute === 'training-config' ||
      currentRoute === 'trajectory'
    );
  }
  return true;
};

export type LivePreviewAnimPhase =
  | 'expanded'
  | 'collapsing_content'
  | 'collapsing_resize'
  | 'collapsed'
  | 'expanding_content'
  | 'expanding_resize';
