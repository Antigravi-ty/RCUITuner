import React from 'react';
import { Layer1MainMenuRecipe } from '../../../ui-core/recipes/Layer1MainMenuRecipe';
import type { Layer1MenuContextMode } from '../../../ui-core/recipes/layer1MenuContextSpecs';
import { Layer2PlayRecipe } from '../../../ui-core/recipes/Layer2PlayRecipe';
import { Layer2GarageRecipe } from '../../../ui-core/recipes/Layer2GarageRecipe';
import { Layer2SettingsRecipe } from '../../../ui-core/recipes/Layer2SettingsRecipe';
import { Layer2ManageRoomRecipe, resolveOnlineSessionContextId } from '../../../ui-core/recipes/Layer2ManageRoomRecipe';
import { Layer3AcousticsEqualizerRecipe } from '../../../ui-core/recipes/Layer3AcousticsEqualizerRecipe';
import { Layer3BallTrajectoryRecipe } from '../../../ui-core/recipes/Layer3BallTrajectoryRecipe';
import { Layer3HostMatchRecipe } from '../../../ui-core/recipes/Layer3HostMatchRecipe';
import { Layer3HostTrainingRecipe } from '../../../ui-core/recipes/Layer3HostTrainingRecipe';
import { Layer3CustomPlayRecipe } from '../../../ui-core/recipes/Layer3CustomPlayRecipe';
import { Layer3JoinRoomRecipe } from '../../../ui-core/recipes/Layer3JoinRoomRecipe';
import { Layer3ExhibitionRecipe } from '../../../ui-core/recipes/Layer3ExhibitionRecipe';
import { Layer3SelfTrainingRecipe } from '../../../ui-core/recipes/Layer3SelfTrainingRecipe';
import { Layer3KickoffTrainingRecipe } from '../../../ui-core/recipes/Layer3KickoffTrainingRecipe';
import { Layer3TrainingConfigRecipe } from '../../../ui-core/recipes/Layer3TrainingConfigRecipe';
import { Layer3CameraRecipe } from '../../../ui-core/recipes/Layer3CameraRecipe';
import { Layer3KeybindingsRecipe } from '../../../ui-core/recipes/Layer3KeybindingsRecipe';
import { Layer3ExpMultiBotsRecipe } from '../../../ui-core/recipes/Layer3ExpMultiBotsRecipe';
import { Layer3ExpBotPackRecipe } from '../../../ui-core/recipes/Layer3ExpBotPackRecipe';
import { Layer3DevSandboxesRecipe } from '../../../ui-core/recipes/Layer3DevSandboxesRecipe';
import { Layer3DevActiveTunersRecipe } from '../../../ui-core/recipes/Layer3DevActiveTunersRecipe';
import { Layer3DevCalibratedPresetsRecipe } from '../../../ui-core/recipes/Layer3DevCalibratedPresetsRecipe';
import { Layer3DevSelfTestRecipe } from '../../../ui-core/recipes/Layer3DevSelfTestRecipe';
import { Layer3DevUnderDevelopmentRecipe } from '../../../ui-core/recipes/Layer3DevUnderDevelopmentRecipe';
import { Layer3DevRemoteProfileRecipe } from '../../../ui-core/recipes/Layer3DevRemoteProfileRecipe';
import { Layer3DevQuickActionsRecipe } from '../../../ui-core/recipes/Layer3DevQuickActionsRecipe';
import { Layer4StaticTrainingPackBrowseRecipe } from '../../../ui-core/recipes/Layer4StaticTrainingPackBrowseRecipe';
import { Layer4AdvancedAudioRecipe } from '../../../ui-core/recipes/Layer4AdvancedAudioRecipe';
import { Layer4ControllerSettingsRecipe } from '../../../ui-core/recipes/Layer4ControllerSettingsRecipe';
import { Layer4EventTriggerRulesRecipe } from '../../../ui-core/recipes/Layer4EventTriggerRulesRecipe';
import { Layer4DevSignalingLabRecipe } from '../../../ui-core/recipes/Layer4DevSignalingLabRecipe';
import { floatingStore } from '../../../ui-core/stores/floatingStore';
import { StoreSnapshotScope } from '../../../ui-core/stores/storeSnapshotScope';
import { PRESET_WINDOWS } from '../../../ui-core/stores/devFloatingPresets';
import {
  MENU_ROUTE_CONFIG,
  type ActiveMenuRoute,
  type Layer3StepProgressStatus,
} from './menuLayerRouteConfig';
import { useMenuLayerSandbox } from './MenuLayerSandboxContext';

export interface Layer3StepOverrideState {
  progressStatus?: Layer3StepProgressStatus;
  currentStep?: number;
  defaultEditingConfig?: boolean;
}

export interface MenuLayerStageRecipeRouterProps {
  isLight: boolean;
}

export const MenuLayerStageRecipeRouter = React.memo<MenuLayerStageRecipeRouterProps>(({
  isLight,
}) => {
  const {
    visibilityTier,
    layer1ContextMode,
    setLayer1ContextMode: onChangeLayer1ContextMode,
    touchMode,
    displayedRoute,
    handleSelectRoute,
    handleNavigateBack,
    showToast,
    settingsTab,
    setSettingsTab,
    garageTab,
    setGarageTab,
    bgRenderPaused,
    setLastParentRoute,
    setLiveAnimPhase,
    handleTriggerCollapse,
    layer3StepOverride,
  } = useMenuLayerSandbox();
  const [touchInputAgent, setTouchInputAgent] = React.useState<'none' | 'necto' | 'nexto'>('none');

  const goBack = () => {
    if (handleNavigateBack) {
      handleNavigateBack();
      return;
    }
    const fallbackParent = MENU_ROUTE_CONFIG[displayedRoute]?.parentRoute ?? 'main-menu';
    handleSelectRoute(fallbackParent, { pushHistory: false });
  };

  const navigateToGarageSync = () => {
    setLastParentRoute(displayedRoute);
    setGarageTab('sync');
    handleSelectRoute('garage');
    showToast('Navigated To Garage -> Sync');
  };

  const spawnPresetById = (windowId: string, activeTab?: string) => {
    const preset = PRESET_WINDOWS.find((p) => p.id === windowId);
    if (preset) {
      floatingStore.spawnWindow({ ...preset, startMinimized: false });
      handleSelectRoute('layer-0');
      showToast(`[ok] Floating window opened: ${preset.title}${activeTab ? ` (${activeTab})` : ''}`);
    } else {
      showToast(`Open Floating Window: ${windowId}`);
    }
  };

  return (
    <>
      {displayedRoute === 'main-menu' && (
        <StoreSnapshotScope
          overrides={{
            appStore: {
              touchMode,
              touchInputAgent,
              setTouchInputAgent,
              menuPowerSave: bgRenderPaused ? 'extreme' : '30',
            },
          }}
        >
          <Layer1MainMenuRecipe
            isLight={isLight}
            activeTab={layer1ContextMode}
            onBack={() => {
              handleSelectRoute('layer-0');
              showToast('Enter Level Zero Match (Layer 0 · No Menu State)');
            }}
            onTabChange={(target) => {
              if (target === 'play') handleSelectRoute('play');
              else if (target === 'garage') handleSelectRoute('garage');
              else if (target.startsWith('settings')) {
                const tab = target.split(':')[1];
                if (tab) setSettingsTab(tab);
                handleSelectRoute('settings');
              } else if (target === 'manage-room') handleSelectRoute('manage-room');
              else if (target === 'exp-multi-bots') handleSelectRoute('exp-multi-bots');
              else if (target === 'return-freeplay') {
                onChangeLayer1ContextMode?.('freeplay');
                showToast('Returned Free Play Base Menu (MENU)');
              } else if (target === 'leave-room') {
                onChangeLayer1ContextMode?.('freeplay');
                showToast('Left Room/Match and Return Free Play (MENU)');
              } else if (target === 'exit-edit-mode') {
                handleSelectRoute('static-training-pack');
                showToast('Exited Edit Training Pack Return to training pack browser');
              }
            }}
          />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'play' && (
        <Layer2PlayRecipe
          isLight={isLight}
          onBack={goBack}
          onTabChange={(m) => {
            setLastParentRoute('play');
            if (m === 'exhibition') handleSelectRoute('exhibition');
            else if (m === 'host-match' || m === 'multiplayer-match') handleSelectRoute('host-match');
            else if (m === 'join-room' || m === 'multiplayer-custom') handleSelectRoute('join-room');
            else if (m === 'self-training') handleSelectRoute('self-training');
            else if (m === 'host-training' || m === 'multiplayer-training' || m === 'online-training') handleSelectRoute('host-training');
            else if (m === 'advanced') handleSelectRoute('custom-play');
            else {
              onChangeLayer1ContextMode?.('freeplay');
              handleSelectRoute('main-menu');
              showToast(`Match context switched to: ${m}`);
            }
          }}
        />
      )}

      {displayedRoute === 'garage' && (
        <Layer2GarageRecipe
          isLight={isLight}
          activeTab={garageTab}
          onTabChange={setGarageTab}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'settings' && (
        <StoreSnapshotScope
          overrides={{
            appStore: {
              settingsTargetTab: settingsTab,
              developerMode: visibilityTier === 'developer',
              navigate: (route: string) => {
                setLastParentRoute('settings');
                if (route === 'trajectory') {
                  setLiveAnimPhase('expanded');
                  handleSelectRoute('trajectory');
                  showToast(
                    'Enter Submenu: Ball Trajectory Predictor (support TAB Side collapsed real-time preview)'
                  );
                } else {
                  handleSelectRoute(route as ActiveMenuRoute);
                }
              },
            },
          }}
        >
          <Layer2SettingsRecipe
            isLight={isLight}
            onBack={goBack}
            activeTab={settingsTab}
            onTabChange={(tab) => setSettingsTab(tab as typeof settingsTab)}
          />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'manage-room' && (
        <StoreSnapshotScope
          overrides={{
            appStore: {
              developerMode: visibilityTier === 'developer',
            },
            onlineRoomStore: {
              sessionContext: resolveOnlineSessionContextId(layer1ContextMode),
              onSessionContextChange: (ctx: string) => {
                onChangeLayer1ContextMode?.(ctx as Layer1MenuContextMode);
                showToast(`Room status view switched: ${ctx}`);
              },
              onOpenNetHud: () => spawnPresetById('network-monitor'),
              onNavigateAdvancedSettings: () => {
                setLastParentRoute('manage-room');
                handleSelectRoute('exp-multi-bots');
              },
              onCloseRoom: () => {
                onChangeLayer1ContextMode?.('freeplay');
                handleSelectRoute('main-menu');
                showToast('Closed/Leave room and return Free Play');
              },
            },
          }}
        >
          <Layer2ManageRoomRecipe
            isLight={isLight}
            activeTab={resolveOnlineSessionContextId(layer1ContextMode)}
            onBack={goBack}
          />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'audio-eq' && (
        <StoreSnapshotScope
          overrides={{ appStore: { developerMode: visibilityTier === 'developer' } }}
        >
          <Layer3AcousticsEqualizerRecipe isLight={isLight} onBack={goBack} />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'dev-quick-actions' && (
        <Layer3DevQuickActionsRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'host-match' && (
        <StoreSnapshotScope
          overrides={{
            appStore: {
              developerMode: visibilityTier === 'developer',
            },
            onlineRoomStore: {
              progressStatus: layer3StepOverride?.progressStatus,
              currentStep: layer3StepOverride?.currentStep,
              defaultEditingConfig: layer3StepOverride?.defaultEditingConfig,
              onNavigateGarageSync: navigateToGarageSync,
              onNavigateAdvancedSettings: () => {
                setLastParentRoute('host-match');
                handleSelectRoute('exp-multi-bots');
              },
              onStartHost: () => {
                onChangeLayer1ContextMode?.('match-lobby-host');
                setLastParentRoute('main-menu');
                handleSelectRoute('manage-room');
                showToast('[ok] Completed 5 Step Create and Enter Room Configure Room (Match Lobby · Host)');
              },
            },
          }}
        >
          <Layer3HostMatchRecipe isLight={isLight} onBack={goBack} />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'host-training' && (
        <StoreSnapshotScope
          overrides={{
            onlineRoomStore: {
              progressStatus: layer3StepOverride?.progressStatus,
              currentStep: layer3StepOverride?.currentStep,
              onNavigateGarageSync: navigateToGarageSync,
              onStartTraining: () => {
                onChangeLayer1ContextMode?.('online-warmup-host');
                setLastParentRoute('main-menu');
                handleSelectRoute('manage-room');
                showToast('[ok] Created Online Warmup Room and Enter Configure Room (Warmup · Host)');
              },
            },
          }}
        >
          <Layer3HostTrainingRecipe isLight={isLight} onBack={goBack} />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'custom-play' && (
        <Layer3CustomPlayRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'join-room' && (
        <StoreSnapshotScope
          overrides={{
            onlineRoomStore: {
              progressStatus: layer3StepOverride?.progressStatus,
              currentStep: layer3StepOverride?.currentStep,
              onNavigateGarageSync: navigateToGarageSync,
              onJoinRoom: () => {
                onChangeLayer1ContextMode?.('match-lobby-client');
                setLastParentRoute('main-menu');
                handleSelectRoute('manage-room');
                showToast('[ok] Joined room and entered Room Info (Match Lobby · Client)');
              },
            },
          }}
        >
          <Layer3JoinRoomRecipe isLight={isLight} onBack={goBack} />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'exhibition' && (
        <Layer3ExhibitionRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'self-training' && (
        <Layer3SelfTrainingRecipe
          isLight={isLight}
          onBack={goBack}
          onTabChange={(mode) => {
            setLastParentRoute('self-training');
            if (mode === 'static-training-pack') {
              handleSelectRoute('static-training-pack');
            } else if (mode === 'dynamic-training-pack') {
              handleSelectRoute('custom-play');
            } else if (mode === 'kickoff-training') {
              handleSelectRoute('kickoff-training');
            } else if (mode === 'replay-viewer') {
              spawnPresetById('replay-viewer');
            } else if (mode === 'free-play') {
              onChangeLayer1ContextMode?.('freeplay');
              handleSelectRoute('main-menu');
              showToast('Entered Free Play Free training context');
            } else {
              handleSelectRoute('training-config');
            }
          }}
        />
      )}

      {displayedRoute === 'kickoff-training' && (
        <Layer3KickoffTrainingRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'training-config' && (
        <Layer3TrainingConfigRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'camera' && (
        <StoreSnapshotScope
          overrides={{
            appStore: {
              developerMode: visibilityTier === 'developer',
              setLivePreviewCollapsed: handleTriggerCollapse,
            },
          }}
        >
          <Layer3CameraRecipe
            isLight={isLight}
            onBack={() => {
              setLiveAnimPhase('expanded');
              goBack();
            }}
          />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'keybindings' && (
        <StoreSnapshotScope
          overrides={{
            appStore: {
              navigate: (route: string) => {
                if (route === 'controller-settings') {
                  setLastParentRoute('keybindings');
                  handleSelectRoute('controller-settings');
                }
              },
            },
          }}
        >
          <Layer3KeybindingsRecipe isLight={isLight} onBack={goBack} />
        </StoreSnapshotScope>
      )}

      {displayedRoute === 'exp-multi-bots' && (
        <Layer3ExpMultiBotsRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'exp-botpack-9700488' && (
        <Layer3ExpBotPackRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-sandboxes' && (
        <Layer3DevSandboxesRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-active-tuners' && (
        <Layer3DevActiveTunersRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-calibrated-presets' && (
        <Layer3DevCalibratedPresetsRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-self-test' && (
        <Layer3DevSelfTestRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-under-development' && (
        <Layer3DevUnderDevelopmentRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-remote-profile' && (
        <Layer3DevRemoteProfileRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'static-training-pack' && (
        <Layer4StaticTrainingPackBrowseRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-tem-pack-converter' && (
        <Layer4StaticTrainingPackBrowseRecipe
          isLight={isLight}
          isDevMode={true}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'advanced-audio' && (
        <Layer4AdvancedAudioRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'controller-settings' && (
        <Layer4ControllerSettingsRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'event-trigger-rules' && (
        <Layer4EventTriggerRulesRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-signaling-lab' && (
        <Layer4DevSignalingLabRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'trajectory' && (
        <StoreSnapshotScope
          overrides={{
            appStore: {
              developerMode: visibilityTier === 'developer',
              setLivePreviewCollapsed: handleTriggerCollapse,
            },
          }}
        >
          <Layer3BallTrajectoryRecipe
            isLight={isLight}
            onBack={() => {
              setLiveAnimPhase('expanded');
              goBack();
            }}
          />
        </StoreSnapshotScope>
      )}
    </>
  );
});

MenuLayerStageRecipeRouter.displayName = 'MenuLayerStageRecipeRouter';
