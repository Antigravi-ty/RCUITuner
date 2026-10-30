import React from 'react';
import { Layer1MainMenuRecipe, type Layer1MenuContextMode } from '../../../ui-core/recipes/Layer1MainMenuRecipe';
import { Layer2PlayRecipe } from '../../../ui-core/recipes/Layer2PlayRecipe';
import { Layer2GarageRecipe } from '../../../ui-core/recipes/Layer2GarageRecipe';
import { Layer2SettingsRecipe } from '../../../ui-core/recipes/Layer2SettingsRecipe';
import { Layer2RoomHostControlRecipe, resolveOnlineSessionContextId } from '../../../ui-core/recipes/Layer2RoomHostControlRecipe';
import { Layer3AudioEqRecipe } from '../../../ui-core/recipes/Layer3AudioEqRecipe';
import { Layer3BallTrajectoryRecipe } from '../../../ui-core/recipes/Layer3BallTrajectoryRecipe';
import { Layer3OnlineWarmupRecipe } from '../../../ui-core/recipes/Layer3OnlineWarmupRecipe';
import { Layer3HostMatchRecipe } from '../../../ui-core/recipes/Layer3HostMatchRecipe';
import { Layer3HostTrainingRecipe } from '../../../ui-core/recipes/Layer3HostTrainingRecipe';
import { Layer3CustomPlayRecipe } from '../../../ui-core/recipes/Layer3CustomPlayRecipe';
import { Layer3JoinRoomRecipe } from '../../../ui-core/recipes/Layer3JoinRoomRecipe';
import { Layer3ExhibitionRecipe } from '../../../ui-core/recipes/Layer3ExhibitionRecipe';
import { Layer3SelfTrainingRecipe } from '../../../ui-core/recipes/Layer3SelfTrainingRecipe';
import { Layer3KickoffTrainingRecipe } from '../../../ui-core/recipes/Layer3KickoffTrainingRecipe';
import { Layer3TrainingRecipe } from '../../../ui-core/recipes/Layer3TrainingRecipe';
import { Layer3CameraRecipe } from '../../../ui-core/recipes/Layer3CameraRecipe';
import { Layer3KeybindingsRecipe } from '../../../ui-core/recipes/Layer3KeybindingsRecipe';
import { Layer3ExpMultiBotsRecipe } from '../../../ui-core/recipes/Layer3ExpMultiBotsRecipe';
import { Layer3DevSubsystemIsolationRecipe } from '../../../ui-core/recipes/Layer3DevSubsystemIsolationRecipe';
import { Layer3DevActiveTunersRecipe } from '../../../ui-core/recipes/Layer3DevActiveTunersRecipe';
import { Layer3DevCalibratedPresetsRecipe } from '../../../ui-core/recipes/Layer3DevCalibratedPresetsRecipe';
import { Layer3DevUnderDevelopmentRecipe } from '../../../ui-core/recipes/Layer3DevUnderDevelopmentRecipe';
import { Layer4StaticTrainingPackBrowseRecipe } from '../../../ui-core/recipes/Layer4StaticTrainingPackBrowseRecipe';
import { Layer4AdvancedAudioRecipe } from '../../../ui-core/recipes/Layer4AdvancedAudioRecipe';
import { Layer4ControllerSettingsRecipe } from '../../../ui-core/recipes/Layer4ControllerSettingsRecipe';
import { Layer4EventTriggerRulesRecipe } from '../../../ui-core/recipes/Layer4EventTriggerRulesRecipe';
import { floatingStore, type FloatingWindowItem } from '../../../ui-core/stores/floatingStore';
import { PRESET_WINDOWS, type PresetConfig } from '../../../ui-core/stores/floatingPresets';
import {
  MENU_ROUTE_CONFIG,
  type ActiveMenuRoute,
  type Layer3StepProgressStatus,
  type LivePreviewAnimPhase,
  type MenuVisibilityTier,
} from './menuLayerRouteConfig';

export interface Layer3StepOverrideState {
  progressStatus?: Layer3StepProgressStatus;
  currentStep?: number;
  defaultEditingConfig?: boolean;
}

export interface MenuLayerStageRecipeRouterProps {
  isLight: boolean;
  visibilityTier: MenuVisibilityTier;
  onSwitchTier?: (tier: MenuVisibilityTier) => void;
  layer1ContextMode: Layer1MenuContextMode;
  onChangeLayer1ContextMode?: (mode: Layer1MenuContextMode) => void;
  touchMode: boolean;
  onToggleTouchMode?: (enabled: boolean) => void;
  displayedRoute: ActiveMenuRoute;
  handleSelectRoute: (route: ActiveMenuRoute, options?: { pushHistory?: boolean }) => void;
  handleNavigateBack?: () => void;
  showToast: (msg: string) => void;
  settingsTab: string;
  setSettingsTab: (tab: string) => void;
  garageTab: string;
  setGarageTab: (tab: string) => void;
  bgRenderPaused: boolean;
  setBgRenderPaused: (val: boolean) => void;
  lastParentRoute: ActiveMenuRoute;
  setLastParentRoute: (route: ActiveMenuRoute) => void;
  handleAddPresetWindow: (preset: PresetConfig, e: React.MouseEvent<HTMLButtonElement>) => void;
  windows: FloatingWindowItem[];
  minimizedCount: number;
  totalCount: number;
  closeWindow: (id: string) => void;
  setLiveAnimPhase: (phase: LivePreviewAnimPhase) => void;
  handleTriggerCollapse: () => void;
  layer3StepOverride?: Layer3StepOverrideState;
}

export const MenuLayerStageRecipeRouter = React.memo<MenuLayerStageRecipeRouterProps>(({
  isLight, visibilityTier, onSwitchTier, layer1ContextMode, onChangeLayer1ContextMode,
  touchMode, onToggleTouchMode, displayedRoute, handleSelectRoute, handleNavigateBack,
  showToast, settingsTab, setSettingsTab, garageTab, setGarageTab, bgRenderPaused,
  setBgRenderPaused, lastParentRoute, setLastParentRoute, handleAddPresetWindow,
  windows, minimizedCount, totalCount, closeWindow, setLiveAnimPhase, handleTriggerCollapse,
  layer3StepOverride,
}) => {
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
      floatingStore.spawnWindow({
        id: preset.id, title: preset.title, category: preset.category,
        width: preset.width, height: preset.height, minWidth: preset.minWidth,
        minHeight: preset.minHeight, maxWidth: preset.maxWidth, maxHeight: preset.maxHeight,
        autoFitHeight: preset.autoFitHeight, resizable: preset.resizable,
        singleton: preset.singleton, startMinimized: false,
      });
      handleSelectRoute('layer-0');
      showToast(`[ok] Floating window opened: ${preset.title}${activeTab ? ` (${activeTab})` : ''}`);
    } else {
      showToast(`Open Floating Window: ${windowId}`);
    }
  };

  return (
    <>
      {displayedRoute === 'main-menu' && (
        <Layer1MainMenuRecipe
          isLight={isLight}
          contextMode={layer1ContextMode}
          touchMode={touchMode}
          touchInputAgent={touchInputAgent}
          onTouchInputAgentChange={setTouchInputAgent}
          onResume={() => {
            handleSelectRoute('layer-0');
            showToast('Enter Level Zero Match (Layer 0 · No Menu State)');
          }}
          onNavigatePlay={() => handleSelectRoute('play')}
          onNavigateGarage={() => handleSelectRoute('garage')}
          onNavigateSettings={(tab) => {
            if (tab) setSettingsTab(tab);
            handleSelectRoute('settings');
          }}
          onNavigatePreviews={() => handleSelectRoute('additional-preview')}
          onNavigateRoomControl={() => handleSelectRoute('room-host-control')}
          onNavigateTrainingConfig={() => handleSelectRoute('training')}
          onNavigateKickoffConfig={() => handleSelectRoute('kickoff-training')}
          onNavigateStaticTrainingPack={() => handleSelectRoute('static-training-pack')}
          onNavigateExpMultiBots={() => handleSelectRoute('exp-multi-bots')}
          onReturnToFreeplay={() => {
            onChangeLayer1ContextMode?.('freeplay');
            showToast('Returned Free Play Base Menu (MENU)');
          }}
          onLeaveRoom={() => {
            onChangeLayer1ContextMode?.('freeplay');
            showToast('Left Room/Match and Return Free Play (MENU)');
          }}
          onExitEditMode={() => {
            handleSelectRoute('static-training-pack');
            showToast('Exited Edit Training Pack Return to training pack browser');
          }}
          onOpenFloatingWindow={(id) => spawnPresetById(id)}
          backgroundRenderPaused={bgRenderPaused}
        />
      )}

      {displayedRoute === 'play' && (
        <Layer2PlayRecipe
          isLight={isLight}
          onBack={goBack}
          onSelectMode={(m) => {
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
          initialTab={garageTab}
          activeTab={garageTab}
          onTabChange={setGarageTab}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'settings' && (
        <Layer2SettingsRecipe
          isLight={isLight}
          onBack={goBack}
          initialTab={settingsTab}
          activeTab={settingsTab}
          onTabChange={(tab) => setSettingsTab(tab)}
          developerModeEnabled={visibilityTier === 'developer'}
          onToggleDeveloperMode={(enabled) => {
            onSwitchTier?.(enabled ? 'developer' : 'user');
            if (enabled) {
              setSettingsTab('developer');
              showToast('Enabled Developer Mode, Switch To Developer Exclusive View');
            } else {
              setSettingsTab('advanced');
              showToast('Closed Developer Mode, Back User Exclusive View');
            }
          }}
          touchControlsEnabled={touchMode}
          onToggleTouchControls={onToggleTouchMode}
          backgroundRenderPaused={bgRenderPaused}
          onToggleBackgroundRender={setBgRenderPaused}
          onSpawnDiagnosticWindow={(win) => floatingStore.spawnWindow(win)}
          onAddPresetWindow={handleAddPresetWindow}
          activeWindows={windows}
          onClosePresetWindow={closeWindow}
          onNavigateTrainingDetail={() => { setLastParentRoute('settings'); handleSelectRoute('training'); }}
          onNavigateCameraSettings={() => { setLastParentRoute('settings'); handleSelectRoute('camera'); }}
          onNavigateCameraDetail={() => { setLastParentRoute('settings'); handleSelectRoute('camera'); }}
          onNavigateKeybindingsDetail={() => { setLastParentRoute('settings'); handleSelectRoute('keybindings'); }}
          onNavigateAdvancedController={() => { setLastParentRoute('settings'); handleSelectRoute('controller-settings'); }}
          onNavigateAudioDetail={() => { setLastParentRoute('settings'); handleSelectRoute('audio-eq'); }}
          onNavigateTrajectoryDetail={() => {
            setLastParentRoute('settings');
            setLiveAnimPhase('expanded');
            handleSelectRoute('trajectory');
            showToast('Enter Submenu: Ball Trajectory Predictor (support TAB Side collapsed real-time preview)');
          }}
          onNavigateTrajectory={() => {
            setLastParentRoute('settings');
            setLiveAnimPhase('expanded');
            handleSelectRoute('trajectory');
            showToast('Enter Submenu: Ball Trajectory Predictor (support TAB Side collapsed real-time preview)');
          }}
          onNavigateDevSandboxes={() => { setLastParentRoute('settings'); handleSelectRoute('dev-subsystem-isolation'); }}
          onNavigateDevSubsystemIsolation={() => { setLastParentRoute('settings'); handleSelectRoute('dev-subsystem-isolation'); }}
          onNavigateExpMultiBots={() => { setLastParentRoute('settings'); handleSelectRoute('exp-multi-bots'); }}
          onNavigateDevActiveTuners={() => { setLastParentRoute('settings'); handleSelectRoute('dev-active-tuners'); }}
          onNavigateDevCalibratedPresets={() => { setLastParentRoute('settings'); handleSelectRoute('dev-calibrated-presets'); }}
          onNavigateDevUnderDevelopment={() => { setLastParentRoute('settings'); handleSelectRoute('dev-under-development'); }}
          onNavigateAdvancedAudio={() => { setLastParentRoute('settings'); handleSelectRoute('advanced-audio'); }}
          onNavigateEventAndTriggerer={() => { setLastParentRoute('settings'); handleSelectRoute('event-trigger-rules'); }}
        />
      )}

      {displayedRoute === 'room-host-control' && (
        <Layer2RoomHostControlRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          sessionContext={resolveOnlineSessionContextId(layer1ContextMode)}
          onSessionContextChange={(ctx) => {
            onChangeLayer1ContextMode?.(ctx);
            showToast(`Room status view switched: ${ctx}`);
          }}
          onOpenNetHud={() => spawnPresetById('network-monitor')}
          onNavigateAdvancedSettings={() => {
            setLastParentRoute('room-host-control');
            handleSelectRoute('exp-multi-bots');
          }}
          onCloseRoom={() => {
            onChangeLayer1ContextMode?.('freeplay');
            handleSelectRoute('main-menu');
            showToast('Closed/Leave room and return Free Play');
          }}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'audio-eq' && (
        <Layer3AudioEqRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'online-warmup' && (
        <Layer3OnlineWarmupRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'host-match' && (
        <Layer3HostMatchRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          progressStatus={layer3StepOverride?.progressStatus}
          currentStep={layer3StepOverride?.currentStep}
          defaultEditingConfig={layer3StepOverride?.defaultEditingConfig}
          onNavigateGarageSync={navigateToGarageSync}
          onNavigateAdvancedSettings={() => {
            setLastParentRoute('host-match');
            handleSelectRoute('exp-multi-bots');
          }}
          onStartHost={() => {
            onChangeLayer1ContextMode?.('match-lobby-host');
            setLastParentRoute('main-menu');
            handleSelectRoute('room-host-control');
            showToast('[ok] Completed 5 Step Create and Enter Room Configure Room (Match Lobby · Host)');
          }}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'host-training' && (
        <Layer3HostTrainingRecipe
          isLight={isLight}
          progressStatus={layer3StepOverride?.progressStatus}
          currentStep={layer3StepOverride?.currentStep}
          onNavigateGarageSync={navigateToGarageSync}
          onStartTraining={() => {
            onChangeLayer1ContextMode?.('online-warmup-host');
            setLastParentRoute('main-menu');
            handleSelectRoute('room-host-control');
            showToast('[ok] Created Online Warmup Room and Enter Configure Room (Warmup · Host)');
          }}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'custom-play' && (
        <Layer3CustomPlayRecipe
          isLight={isLight}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'join-room' && (
        <Layer3JoinRoomRecipe
          isLight={isLight}
          progressStatus={layer3StepOverride?.progressStatus}
          currentStep={layer3StepOverride?.currentStep}
          onNavigateGarageSync={navigateToGarageSync}
          onJoinRoom={() => {
            onChangeLayer1ContextMode?.('match-lobby-client');
            setLastParentRoute('main-menu');
            handleSelectRoute('room-host-control');
            showToast('[ok] Joined room and entered Room Info (Match Lobby · Client)');
          }}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'exhibition' && (
        <Layer3ExhibitionRecipe
          isLight={isLight}
          onBack={goBack}
          onNavigateAdvancedMutators={() => {
            setLastParentRoute('exhibition');
            handleSelectRoute('exp-multi-bots');
          }}
        />
      )}

      {displayedRoute === 'self-training' && (
        <Layer3SelfTrainingRecipe
          isLight={isLight}
          onBack={goBack}
          onSelectMode={(mode) => {
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
              handleSelectRoute('training');
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

      {displayedRoute === 'training' && (
        <Layer3TrainingRecipe
          isLight={isLight}
          onBack={goBack}
          onNavigateTrajectory={() => {
            setLastParentRoute('training');
            handleSelectRoute('trajectory');
          }}
          onAddPresetWindow={handleAddPresetWindow}
          activeWindows={windows}
          onClosePresetWindow={closeWindow}
        />
      )}

      {displayedRoute === 'camera' && (
        <Layer3CameraRecipe
          isLight={isLight}
          developerMode={visibilityTier === 'developer'}
          onBack={() => {
            setLiveAnimPhase('expanded');
            goBack();
          }}
          onCollapsePreview={handleTriggerCollapse}
        />
      )}

      {displayedRoute === 'keybindings' && (
        <Layer3KeybindingsRecipe
          standalone
          isLight={isLight}
          onBack={goBack}
          onNavigateAdvancedController={() => {
            setLastParentRoute('keybindings');
            handleSelectRoute('controller-settings');
          }}
        />
      )}

      {displayedRoute === 'exp-multi-bots' && (
        <Layer3ExpMultiBotsRecipe
          isLight={isLight}
          onLaunchFloatingControl={() => spawnPresetById('experimental-multi-bots')}
          onBack={goBack}
        />
      )}

      {displayedRoute === 'dev-subsystem-isolation' && (
        <Layer3DevSubsystemIsolationRecipe
          isLight={isLight}
          onBack={goBack}
          onNavigateExpMultiBots={() => {
            setLastParentRoute('dev-subsystem-isolation');
            handleSelectRoute('exp-multi-bots');
          }}
          onEnterBench={(tabId) =>
            tabId === 'exp-multi-bots'
              ? handleSelectRoute('exp-multi-bots')
              : spawnPresetById('subsystem-isolation-lab', tabId)
          }
          onLaunchIsolationTab={(tabId) =>
            tabId === 'exp-multi-bots'
              ? handleSelectRoute('exp-multi-bots')
              : spawnPresetById('subsystem-isolation-lab', tabId)
          }
        />
      )}

      {displayedRoute === 'dev-active-tuners' && (
        <Layer3DevActiveTunersRecipe
          isLight={isLight}
          onBack={goBack}
          onNavigateAdvancedAudio={() => handleSelectRoute('advanced-audio')}
          onNavigateEventAndTriggerer={() => handleSelectRoute('event-trigger-rules')}
          onNavigateEventTriggerer={() => handleSelectRoute('event-trigger-rules')}
          onAddPresetWindow={handleAddPresetWindow}
          activeWindows={windows}
          onClosePresetWindow={closeWindow}
        />
      )}

      {displayedRoute === 'dev-calibrated-presets' && (
        <Layer3DevCalibratedPresetsRecipe
          isLight={isLight}
          onBack={goBack}
          onAddPresetWindow={handleAddPresetWindow}
          activeWindows={windows}
          onClosePresetWindow={closeWindow}
        />
      )}

      {displayedRoute === 'dev-under-development' && (
        <Layer3DevUnderDevelopmentRecipe
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

      {displayedRoute === 'trajectory' && (
        <Layer3BallTrajectoryRecipe
          isLight={isLight}
          transparent={true}
          developerMode={visibilityTier === 'developer'}
          onBack={() => {
            setLiveAnimPhase('expanded');
            goBack();
          }}
          onCollapsePreview={handleTriggerCollapse}
        />
      )}
    </>
  );
});

MenuLayerStageRecipeRouter.displayName = 'MenuLayerStageRecipeRouter';
