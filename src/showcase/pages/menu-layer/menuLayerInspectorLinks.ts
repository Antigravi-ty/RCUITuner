import type { ShowcaseTab } from '../../Sidebar';
import type { ActiveMenuRoute } from './menuLayerRouteConfig';

export interface InspectorJumpTarget {
  code: string;
  componentName: string;
  label: string;
  tab: ShowcaseTab;
  targetId?: string;
}

export interface NodePathInspectorResolution {
  /** Primary standalone recipe tuner for the active menu route (in 6A RecipesPage) */
  pageRecipeTarget: InspectorJumpTarget;
  /** Underlying L1–L6 elements & primitives rendered inside the active menu route / subtab */
  elementTargets: InspectorJumpTarget[];
  /** Whether the active view renders SettingActionRow (e.g. Settings -> Gameplay / Audio) */
  usesSettingActionRow: boolean;
}

const ROUTE_TO_6A_RECIPE_TARGET: Record<ActiveMenuRoute, InspectorJumpTarget> = {
  'layer-0': {
    code: '5C / 6D',
    componentName: 'Layer0ActiveMatch',
    label: '6D Floating window arrangement and match stage',
    tab: 'floating-windows',
  },
  'main-menu': {
    code: '6A.1',
    componentName: 'Layer1MainMenuRecipe',
    label: '6A.1 Main menu size and button spacing tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-1-main',
  },
  play: {
    code: '6A.2',
    componentName: 'Layer2PlayRecipe',
    label: '6A.2 Play Mode selection panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-2-play',
  },
  garage: {
    code: '6A.3',
    componentName: 'Layer2GarageRecipe',
    label: '6A.3 Garage Garage Panel Tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-3-garage',
  },
  settings: {
    code: '6A.4',
    componentName: 'Layer2SettingsRecipe',
    label: '6A.4 Settings Panel and navigation row tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-4-settings',
  },
  'additional-preview': {
    code: '6A.4',
    componentName: 'Layer2SettingsRecipe',
    label: '6A.4 Settings Panel Tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-4-settings',
  },
  'room-host-control': {
    code: '6A.8',
    componentName: 'Layer2RoomHostControlRecipe',
    label: '6A.8 Host console tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-8-host-ctrl',
  },
  'audio-eq': {
    code: '6A.7',
    componentName: 'Layer3AudioEqRecipe',
    label: '6A.7 Audio equalizer panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-7-audio',
  },
  trajectory: {
    code: '6A.12C',
    componentName: 'Layer3BallTrajectoryRecipe',
    label: '6A.12C Trajectory prediction panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-12c-trajectory',
  },
  'online-warmup': {
    code: '6A.6A',
    componentName: 'Layer3HostMatchRecipe',
    label: '6A.6A Online lobby page tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-6a-host',
  },
  'host-match': {
    code: '6A.6A',
    componentName: 'Layer3HostMatchRecipe',
    label: '6A.6A Host Match Room Creation Page Tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-6a-host',
  },
  'host-training': {
    code: '6A.6A',
    componentName: 'Layer3HostTrainingRecipe',
    label: '6A.6A Host Training Online training lobby tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-6a-host',
  },
  'custom-play': {
    code: '6A.2',
    componentName: 'Layer3CustomPlayRecipe',
    label: '6A.2 Play / Custom Panel Tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-2-play',
  },
  'join-room': {
    code: '6A.6B',
    componentName: 'Layer3JoinRoomRecipe',
    label: '6A.6B Join Room Room Entry Page Tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-6b-join',
  },
  'exhibition': {
    code: '6A.9',
    componentName: 'Layer3ExhibitionRecipe',
    label: '6A.9 Exhibition Offline race panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-9-bot-diff',
  },
  'self-training': {
    code: '6A.10',
    componentName: 'Layer3SelfTrainingRecipe',
    label: '6A.10 Self-Training Four-Grid Tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-10-self-train',
  },
  'kickoff-training': {
    code: '6A.11',
    componentName: 'Layer3KickoffTrainingRecipe',
    label: '6A.11 Kickoff Kickoff training panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-11-kickoff',
  },
  training: {
    code: '6A.18',
    componentName: 'Layer3TrainingRecipe',
    label: '6A.18 Training Training configuration panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-18-training',
  },
  'camera': {
    code: '6A.12',
    componentName: 'Layer3CameraRecipe',
    label: '6A.12 Camera Camera settings panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-12-camera',
  },
  keybindings: {
    code: '6A.12B',
    componentName: 'Layer3KeybindingsRecipe',
    label: '6A.12B Key Bindings Key Mapping Tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-12b-keybindings',
  },
  'exp-multi-bots': {
    code: '6A.13',
    componentName: 'Layer3ExpMultiBotsRecipe',
    label: '6A.13 3v3 multi Bot Orchestration Panel Tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-13-multibots',
  },
  'dev-subsystem-isolation': {
    code: '6A.20',
    componentName: 'Layer3DevSubsystemIsolationRecipe',
    label: '6A.20 Subsystem isolation chamber and sandbox panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-20-dev-isolation',
  },
  'dev-active-tuners': {
    code: '6A.21',
    componentName: 'Layer3DevActiveTunersRecipe',
    label: '6A.21 Active tuner panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-21-dev-tuners',
  },
  'dev-calibrated-presets': {
    code: '6A.22',
    componentName: 'Layer3DevCalibratedPresetsRecipe',
    label: '6A.22 Tuner library calibrated',
    tab: 'recipes',
    targetId: 'recipe-6a-22-dev-presets',
  },
  'dev-under-development': {
    code: '6A.23',
    componentName: 'Layer3DevUnderDevelopmentRecipe',
    label: '6A.23 Dev feature panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-23-dev-under-dev',
  },
  'static-training-pack': {
    code: '6A.14',
    componentName: 'Layer4StaticTrainingPackBrowseRecipe',
    label: '6A.14 .RCSPack Browser panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-14-rcspack',
  },
  'advanced-audio': {
    code: '6A.15',
    componentName: 'Layer4AdvancedAudioRecipe',
    label: '6A.15 Advanced audio synthesis pool panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-15-adv-audio',
  },
  'controller-settings': {
    code: '6A.16',
    componentName: 'Layer4ControllerSettingsRecipe',
    label: '6A.16 Advanced controller curve panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-16-adv-ctrl',
  },
  'event-trigger-rules': {
    code: '6A.17',
    componentName: 'Layer4EventTriggerRulesRecipe',
    label: '6A.17 Trigger rule engine panel tuning',
    tab: 'recipes',
    targetId: 'recipe-6a-17-triggers',
  },
};

const PANEL_SHELL_TARGET: InspectorJumpTarget = {
  code: '6A.2S',
  componentName: 'PanelShellTuner',
  label: '6A.2S 3-Stage Panel Shell Tuning (top bar/Content/bottom bar Padding)',
  tab: 'recipes',
  targetId: 'panel-shell-tuner',
};

const SETTING_ACTION_ROW_TARGET: InspectorJumpTarget = {
  code: '6A.4S',
  componentName: 'SettingActionRowTuner',
  label: '6A.4S SettingActionRow Tuner (border/Description/Padding/SVG Color)',
  tab: 'recipes',
  targetId: 'setting-action-row-tuner',
};

const UNDERLINE_TABS_TARGET: InspectorJumpTarget = {
  code: '6A.4T',
  componentName: 'UnderlineTabsTuner',
  label: '6A.4T UnderlineTabs Top bar tab tuner',
  tab: 'recipes',
  targetId: 'underline-tabs-tuner',
};

const SEGMENTED_SWITCH_TARGET: InspectorJumpTarget = {
  code: 'L1.2',
  componentName: 'SegmentedSwitch',
  label: 'SegmentedSwitch (Segmented Switcher)',
  tab: 'tabs',
  targetId: 'l1-segmented-switch',
};

const SLIDER_CONTROL_TARGET: InspectorJumpTarget = {
  code: 'L1.3',
  componentName: 'SliderControl',
  label: 'SliderControl (Stepper Slider)',
  tab: 'tabs',
  targetId: 'l1-slider-control',
};

const DUAL_GRABBER_TARGET: InspectorJumpTarget = {
  code: 'L1.4',
  componentName: 'DualGrabberSlider',
  label: 'DualGrabberSlider (Dual-cursor deadzone slider)',
  tab: 'tabs',
  targetId: 'l1-dual-grabber-slider',
};

const TOGGLE_SWITCH_TARGET: InspectorJumpTarget = {
  code: 'L1.6',
  componentName: 'ToggleSwitch',
  label: 'ToggleSwitch (Toggle Switch)',
  tab: 'tabs',
  targetId: 'l1-toggle-switch',
};

/**
 * Pure decoupled resolver that inspects the active 7A node path
 * (`currentRoute` + `settingsTab` + `garageTab`) and returns direct jump links
 * to both the current page's 6A Recipe Tuner and its internal L1–L6 elements.
 */
export function resolveNodePathInspectorLinks(
  currentRoute: ActiveMenuRoute,
  settingsTab: string = 'gameplay',
  garageTab: string = 'car'
): NodePathInspectorResolution {
  const pageRecipeTarget =
    ROUTE_TO_6A_RECIPE_TARGET[currentRoute] ?? ROUTE_TO_6A_RECIPE_TARGET['main-menu'];

  if (currentRoute === 'layer-0') {
    return {
      pageRecipeTarget,
      elementTargets: [
        { code: '6D', componentName: 'FloatingWindowManager',
          label: 'Floating Window Floating Window and Stack Tray', tab: 'floating-windows' },
        { code: '5C', componentName: 'SafeAreaHud', label: 'Viewport & Safe Area Viewport Safe Area', tab: 'viewport-safe-area' },
      ],
      usesSettingActionRow: false,
    };
  }

  if (currentRoute === 'main-menu') {
    return {
      pageRecipeTarget,
      elementTargets: [
        { code: '6A.1M', componentName: 'MainMenuStyleTuner', label: '6A.1M MENU Minimalist large-text and font-outline tuning workbench',
          tab: 'recipes', targetId: 'main-menu-style-tuner' },
        { code: 'L4.Nav', componentName: 'MenuContainer & MainMenuRow',
          label: 'MainMenuRow List items and shortcut badges', tab: 'navigation' },
        { code: 'L1.Badge', componentName: 'KeycapBadge', label: 'KeycapBadge Keycap Primitive', tab: 'badges' },
      ],
      usesSettingActionRow: false,
    };
  }

  if (currentRoute === 'settings') {
    if (settingsTab === 'gameplay') {
      return {
        pageRecipeTarget,
        elementTargets: [
          SETTING_ACTION_ROW_TARGET,
          SEGMENTED_SWITCH_TARGET,
          PANEL_SHELL_TARGET,
          UNDERLINE_TABS_TARGET,
          TOGGLE_SWITCH_TARGET,
        ],
        usesSettingActionRow: true,
      };
    }
    if (settingsTab === 'audio') {
      return {
        pageRecipeTarget,
        elementTargets: [
          SETTING_ACTION_ROW_TARGET,
          SLIDER_CONTROL_TARGET,
          TOGGLE_SWITCH_TARGET,
          PANEL_SHELL_TARGET,
        ],
        usesSettingActionRow: true,
      };
    }
    if (settingsTab === 'display') {
      return {
        pageRecipeTarget,
        elementTargets: [
          SETTING_ACTION_ROW_TARGET,
          {
            code: '6A.4S-E',
            componentName: 'SettingPresetCustomRow',
            label: '6A.4S-E SettingPresetCustomRow (UI Scaling & Render Scale Slide Merge)',
            tab: 'recipes',
            targetId: 'setting-preset-custom-tuner',
          },
          SEGMENTED_SWITCH_TARGET,
          SLIDER_CONTROL_TARGET,
          PANEL_SHELL_TARGET,
          { code: '5C', componentName: 'ViewportSafeArea', label: '5C Viewport scaling and safe area', tab: 'viewport-safe-area' },
        ],
        usesSettingActionRow: true,
      };
    }
    if (settingsTab === 'advanced') {
      return {
        pageRecipeTarget,
        elementTargets: [
          {
            code: '6A.4S-H',
            componentName: 'TelemetryConfigCard',
            label: '6A.4S-H Show Telemetry Summary (Show ▾ Collapsed and embedded telemetry configuration tuning)',
            tab: 'recipes',
            targetId: 'setting-telemetry-summary-tuner',
          },
          { code: 'L3.8', componentName: 'TelemetryConfigCard', label: 'L3.8 TelemetryConfigCard (Level 1 Nested telemetry matrix page)',
            tab: 'composable-tuner', targetId: 'l3-telemetry-matrix' },
          {
            code: '6A.4S-F',
            componentName: 'SettingDeveloperStatusRow',
            label: '6A.4S-F SettingDeveloperStatusRow (Developer Disabled/Active Badge)',
            tab: 'recipes',
            targetId: 'setting-dev-status-tuner',
          },
          SETTING_ACTION_ROW_TARGET,
          {
            code: '6A.5',
            componentName: 'AudioDebugSection',
            label: '6A.5 AudioDebugSection (Settings Full Preview · Audio pipeline diagnostic suite)',
            tab: 'recipes',
            targetId: 'recipe-6a-5-settings-preview',
          },
          DUAL_GRABBER_TARGET,
          SEGMENTED_SWITCH_TARGET,
          { code: '6D', componentName: 'FloatingWindowCard',
            label: 'Floating Window Floating Launcher', tab: 'floating-windows' },
          PANEL_SHELL_TARGET,
        ],
        usesSettingActionRow: true,
      };
    }
    // developer tab
    return {
      pageRecipeTarget,
      elementTargets: [
        SETTING_ACTION_ROW_TARGET,
        SEGMENTED_SWITCH_TARGET,
        TOGGLE_SWITCH_TARGET,
        PANEL_SHELL_TARGET,
        { code: '6D', componentName: 'FloatingWindowManager', label: '6D Developer parameter overlay', tab: 'floating-windows' },
      ],
      usesSettingActionRow: true,
    };
  }

  if (currentRoute === 'garage') {
    const garageElements: InspectorJumpTarget[] = [PANEL_SHELL_TARGET, UNDERLINE_TABS_TARGET];
    if (garageTab === 'car') {
      garageElements.unshift({
        code: 'L2.Card',
        componentName: 'SelectableCard',
        label: 'SelectableCard (Vehicle preset selection card)',
        tab: 'cards',
      });
    } else if (garageTab === 'colour') {
      garageElements.unshift({
        code: 'L3.5',
        componentName: 'PriorityQueueList',
        label: 'PriorityQueueList (Livery priority queue)',
        tab: 'composable-tuner',
        targetId: 'l3-5-priority-event-matrix',
      });
    } else if (garageTab === 'materials') {
      garageElements.unshift({
        code: 'L3.3',
        componentName: 'UVTransformControl & ColorSwatchInput',
        label: 'UVTransformControl & Swatch Input',
        tab: 'composable-tuner',
        targetId: 'l3-3-uv-color-tuner',
      });
    }
    return {
      pageRecipeTarget,
      elementTargets: garageElements,
      usesSettingActionRow: false,
    };
  }

  if (currentRoute === 'play' || currentRoute === 'self-training') {
    return {
      pageRecipeTarget,
      elementTargets: [
        ...(currentRoute === 'play'
          ? [
              { code: 'L2.2B', componentName: 'PlayModeCard',
                label: 'PlayModeCard (Tri-Style/watermark/Icon Color Page)', tab: 'play-cards' as ShowcaseTab },
            ]
          : []),
        { code: 'L2.Card', componentName: 'Card & SelectableCard', label: 'Card Grid mode card container', tab: 'cards' },
        PANEL_SHELL_TARGET,
      ],
      usesSettingActionRow: false,
    };
  }

  if (currentRoute === 'trajectory' || currentRoute === 'camera') {
    return {
      pageRecipeTarget,
      elementTargets: [
        ...(currentRoute === 'camera'
          ? [
              {
                code: '6A.12M',
                componentName: 'CameraSettingsStyleTuner',
                label: '6A.12M Camera Settings Center Aligned · Checkbox · Red large button tuning console',
                tab: 'recipes' as ShowcaseTab,
                targetId: 'camera-settings-style-tuner',
              },
              { code: 'L1.7', componentName: 'Checkbox', label: 'L1.7 Checkbox Checkbox atomic primitive',
                tab: 'tabs' as ShowcaseTab, targetId: 'l1-checkbox' },
              { code: 'L3.2', componentName: 'Dialogue',
                label: 'L3.2 Dialogue Red secondary confirmation popup', tab: 'dialogue' as ShowcaseTab },
            ]
          : []),
        { code: '6C', componentName: 'LivePreviewDock', label: '6C Live Preview Side pill storage unit', tab: 'live-preview' },
        SLIDER_CONTROL_TARGET,
        PANEL_SHELL_TARGET,
      ],
      usesSettingActionRow: false,
    };
  }

  if (
    currentRoute === 'training' ||
    currentRoute === 'dev-subsystem-isolation' ||
    currentRoute === 'dev-active-tuners' ||
    currentRoute === 'dev-calibrated-presets'
  ) {
    return {
      pageRecipeTarget,
      elementTargets: [
        SETTING_ACTION_ROW_TARGET,
        PANEL_SHELL_TARGET,
        SLIDER_CONTROL_TARGET,
        SEGMENTED_SWITCH_TARGET,
      ],
      usesSettingActionRow: true,
    };
  }

  if (currentRoute === 'keybindings') {
    return {
      pageRecipeTarget,
      elementTargets: [
        { code: 'L1.Keycap', componentName: 'KeycapBadge & Button', label: 'KeycapBadge Keycap and button primitives', tab: 'badges' },
        PANEL_SHELL_TARGET,
      ],
      usesSettingActionRow: false,
    };
  }

  if (currentRoute === 'controller-settings') {
    return {
      pageRecipeTarget,
      elementTargets: [
        { code: '5B', componentName: 'CubicBezierCurveEditor', label: '5B Bezier joystick transfer curve editor', tab: 'charts-curves' },
        { code: 'L3.11', componentName: 'CameraSwivelSimulatorCard', label: 'L3.11 View rotation simulator',
          tab: 'composable-tuner', targetId: 'l3-11-swivel-kickoff-duel' },
        PANEL_SHELL_TARGET,
      ],
      usesSettingActionRow: false,
    };
  }

  return {
    pageRecipeTarget,
    elementTargets: [PANEL_SHELL_TARGET, SLIDER_CONTROL_TARGET, SEGMENTED_SWITCH_TARGET],
    usesSettingActionRow: false,
  };
}
