import React from 'react';
import {
  Check,
  AlertCircle,
  Sliders,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import { Badge } from '../../../ui-core/primitives/Badge';
import { type MenuPanelId } from '../../../ui-core/stores/menuLayoutStore';
import {
  useCameraSettingsStyleStore,
  CAMERA_SETTINGS_STYLE_PRESETS,
  type CameraSettingsPresetId,
} from '../../../ui-core/stores/cameraSettingsStyleStore';
import { useQuickNotificationStore } from '../../../ui-core/stores/quickNotificationStore';
import { dispatchOnlineRoomErrorNotification } from '../../../ui-core/recipes/Layer3OnlineWarmupRecipe';
import type { ShowcaseTab } from '../../Sidebar';
import {
  type ActiveMenuRoute,
  type MenuVisibilityTier,
  MENU_ROUTE_CONFIG,
  USER_LINEAR_PLAYLIST,
} from './menuLayerRouteConfig';
import type { Layer3StepOverrideState } from './MenuLayerStageRecipeRouter';
import { resolveNodePathInspectorLinks } from './menuLayerInspectorLinks';

export interface MenuLayerDeepRoutesAndFooterProps {
  isLight: boolean;
  visibilityTier: MenuVisibilityTier;
  currentRoute: ActiveMenuRoute;
  handleSelectRoute: (route: ActiveMenuRoute) => void;
  getPanelWidth: (panelId: MenuPanelId) => number;
  simulateLayer3Error: boolean;
  setSimulateLayer3Error: (enabled: boolean) => void;
  showToast: (msg: string) => void;
  showInlineTuner: boolean;
  onToggleInlineTuner?: () => void;
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  settingsTab: string;
  garageTab: string;
  currentStepBreadcrumb?: string;
  activeRouteSizeModeLabel: string;
  feedbackToast: string | null;
  layer3StepOverride?: Layer3StepOverrideState;
  onChangeLayer3StepOverride?: (next: Layer3StepOverrideState) => void;
}

export const MenuLayerDeepRoutesAndFooter: React.FC<
  MenuLayerDeepRoutesAndFooterProps
> = ({
  isLight,
  visibilityTier,
  currentRoute,
  handleSelectRoute,
  getPanelWidth,
  simulateLayer3Error,
  setSimulateLayer3Error,
  showToast,
  showInlineTuner,
  onToggleInlineTuner,
  onNavigateShowcase,
  settingsTab,
  garageTab,
  currentStepBreadcrumb,
  activeRouteSizeModeLabel,
  feedbackToast,
  layer3StepOverride,
  onChangeLayer3StepOverride,
}) => {
  const cameraStyle = useCameraSettingsStyleStore();
  const inspectorLinks = resolveNodePathInspectorLinks(
    currentRoute,
    settingsTab,
    garageTab
  );
  const { pageRecipeTarget, elementTargets } = inspectorLinks;
  const routeProgressSteps = React.useMemo(
    () =>
      USER_LINEAR_PLAYLIST.filter(
        (s) => s.route === currentRoute && s.progressStatus !== undefined
      ),
    [currentRoute]
  );

  return (
    <>
      {/* Layer 3: Tertiary Sub-Menus (Strictly filtered by User vs Developer) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
          <Badge variant="success" size="sm" isLight={isLight}>
            Layer 3
          </Badge>
          <span>Three-level independent submenu</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(visibilityTier === 'user'
            ? [
                {
                  route: 'host-match' as const,
                  label: 'Host Match (Create Room)',
                  panel: 'layer3-host-match' as const,
                },
                {
                  route: 'host-training' as const,
                  label: 'Host Training (Online Training)',
                  panel: 'layer3-host-training' as const,
                },
                {
                  route: 'custom-play' as const,
                  label: 'Custom (In Development)',
                  panel: 'layer3-custom-play' as const,
                },
                {
                  route: 'join-room' as const,
                  label: 'Join Room (Join Room)',
                  panel: 'layer3-join-room' as const,
                },
                {
                  route: 'exhibition' as const,
                  label: 'Exhibition Setup (Offline AI)',
                  panel: 'layer3-exhibition' as const,
                },
                {
                  route: 'self-training' as const,
                  label: 'Self-Training Hub (Solo Training)',
                  panel: 'layer3-self-training' as const,
                },
                {
                  route: 'kickoff-training' as const,
                  label: 'Kickoff Training (Rhythm Kickoff)',
                  panel: 'layer3-kickoff-training' as const,
                },
                {
                  route: 'training' as const,
                  label: 'Training Config (Training & Replay)',
                  panel: 'layer3-training' as const,
                },
                {
                  route: 'camera' as const,
                  label: 'Camera Settings (Camera Geometry)',
                  panel: 'layer3-camera' as const,
                },
                {
                  route: 'keybindings' as const,
                  label: 'Key Bindings (Key and controller mapping)',
                  panel: 'layer3-keybindings' as const,
                },
                {
                  route: 'trajectory' as const,
                  label: 'Ball Trajectory (Live Preview)',
                  panel: 'layer3-ball-trajectory' as const,
                },
              ]
            : [
                {
                  route: 'dev-subsystem-isolation' as const,
                  label: 'Sandboxes & Isolation (6-Tab Isolation Chamber)',
                  panel: 'layer3-dev-subsystem-isolation' as const,
                },
                {
                  route: 'exp-multi-bots' as const,
                  label: 'Multi-Bots (3v3 orchestration)',
                  panel: 'layer3-exp-multi-bots' as const,
                },
                {
                  route: 'dev-active-tuners' as const,
                  label: 'Active Tuners (Phase matrix and audio)',
                  panel: 'layer3-dev-active-tuners' as const,
                },
                {
                  route: 'dev-calibrated-presets' as const,
                  label: 'Calibrated Presets (Calibrated Tuner)',
                  panel: 'layer3-dev-calibrated-presets' as const,
                },
                {
                  route: 'dev-under-development' as const,
                  label: 'Under Development (Feature in Development)',
                  panel: 'layer3-dev-under-development' as const,
                },
                {
                  route: 'audio-eq' as const,
                  label: 'Acoustics & EQ (Acoustic Equalization)',
                  panel: 'layer3-audio-eq' as const,
                },
              ]
          ).map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleSelectRoute(item.route)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-2xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 shadow-2xs'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {getPanelWidth(item.panel)}px
                </span>
              </button>
            );
          })}

          {visibilityTier === 'user' && (
            <button
              type="button"
              onClick={() => {
                const next = !simulateLayer3Error;
                setSimulateLayer3Error(next);
                if (next) {
                  dispatchOnlineRoomErrorNotification();
                  const st = useQuickNotificationStore.getState();
                  if (st.activeNotification) {
                    st.collapseActive();
                  }
                  st.setStackOpen(false);
                  showToast(
                    'Triggered level-3 menu single-line error (click Check notification ↗ Expandable top-right notification)'
                  );
                } else {
                  showToast('Cleared level-3 menu single-line error');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                simulateLayer3Error
                  ? 'bg-rose-500 text-white border-rose-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                  : 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-800/70 text-rose-300'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                {simulateLayer3Error ? 'Inline Error: Enabling' : 'Simulate level 3 inline error'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar when Host Match / Host Training / Join Room is active: Exhaustive Progress State Switcher */}
      {routeProgressSteps.length > 0 && (
        <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
            <span>
              Exhaustive 5-Step Progress &amp; Error State Enumeration (also navigable via ArrowLeft / ArrowRight):
            </span>
            <span className="text-amber-500 font-semibold">
              status={(layer3StepOverride?.progressStatus ?? 'idle').toUpperCase()} · step={layer3StepOverride?.currentStep ?? 1}/5
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {routeProgressSteps.map((step) => {
              const active =
                (layer3StepOverride?.progressStatus ?? 'idle') === step.progressStatus &&
                (layer3StepOverride?.currentStep ?? 1) === (step.currentStep ?? 1) &&
                Boolean(layer3StepOverride?.defaultEditingConfig) === Boolean(step.defaultEditingConfig);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    onChangeLayer3StepOverride?.({
                      progressStatus: step.progressStatus,
                      currentStep: step.currentStep ?? 1,
                      defaultEditingConfig: Boolean(step.defaultEditingConfig),
                    });
                    showToast(`Switched to state: ${step.label}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    active
                      ? step.progressStatus === 'error'
                        ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-2xs'
                        : 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-bar when Camera Settings is active: 5 Spine & Checkbox Presets + Inline Tuner Toggle */}
      {currentRoute === 'camera' && (
        <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
            <span>
              7A.12 Camera Settings New layout toggle (Slider Center Aligned · Right-Aligned None Icon text · Left-Aligned Numeric Box · Checkbox · Red secondary confirmation button):
            </span>
            <div className="flex items-center gap-3">
              {onToggleInlineTuner && (
                <button
                  type="button"
                  onClick={onToggleInlineTuner}
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
                >
                  <span>
                    {showInlineTuner
                      ? 'collapse 7A In-place fine-tune drawer ^'
                      : 'expand 7A In-place fine-tune drawer (Adjust Centering/spacing/Checkbox) v'}
                  </span>
                </button>
              )}
              {onNavigateShowcase && (
                <button
                  type="button"
                  onClick={() =>
                    onNavigateShowcase('recipes', 'camera-settings-style-tuner')
                  }
                  className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                >
                  <span>open 6A.12M Specialized Tuning Bench</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              Object.keys(
                CAMERA_SETTINGS_STYLE_PRESETS
              ) as CameraSettingsPresetId[]
            ).map((presetKey) => {
              const p = CAMERA_SETTINGS_STYLE_PRESETS[presetKey];
              const active = cameraStyle.preset === presetKey;
              return (
                <button
                  key={presetKey}
                  type="button"
                  onClick={() => {
                    cameraStyle.applyPreset(presetKey);
                    showToast(`Toggled Camera Settings Layout: ${p.shortLabel}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    active
                      ? 'bg-emerald-500 text-white border-emerald-500 font-bold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {p.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Layer 4: Deep Sub-Menus (Strictly filtered by User vs Developer) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
          <Badge variant="primary" size="sm" isLight={isLight}>
            Layer 4
          </Badge>
          <span>Level-4 depth page</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(visibilityTier === 'user'
            ? [
                {
                  route: 'static-training-pack' as const,
                  label: '.RCSPack Browser (Training Pack Browser)',
                  panel: 'layer4-static-training-pack' as const,
                },
                {
                  route: 'controller-settings' as const,
                  label: 'Controller Settings (Advanced Stick Curve)',
                  panel: 'layer4-controller-settings' as const,
                },
              ]
            : [
                {
                  route: 'advanced-audio' as const,
                  label: 'Advanced Audio Pool (Audio Stage Pool)',
                  panel: 'layer4-advanced-audio' as const,
                },
                {
                  route: 'event-trigger-rules' as const,
                  label: 'Event & Trigger Rules (Trigger rule engine)',
                  panel: 'layer4-event-trigger-rules' as const,
                },
              ]
          ).map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleSelectRoute(item.route)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 shadow-2xs'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200 shadow-2xs'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] opacity-75">
                  {getPanelWidth(item.panel)}px
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status & Cascade Breadcrumb Footer + Node-Path Aware Quick Jump & Element Inspector */}
      <div
        className={`flex flex-col gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
          isLight
            ? 'bg-neutral-50/90 border-neutral-200/80 text-neutral-600'
            : 'bg-neutral-950/50 border-neutral-800/80 text-neutral-400'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Compass className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-neutral-400">Current detection node path:</span>
            <span className="font-bold text-amber-500">
              {currentStepBreadcrumb ||
                MENU_ROUTE_CONFIG[currentRoute]?.label ||
                currentRoute}{' '}
              ({activeRouteSizeModeLabel})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {feedbackToast && (
              <div className="text-amber-500 font-semibold flex items-center gap-1.5 animate-pulse mr-1">
                <Check className="h-3.5 w-3.5" />
                <span>{feedbackToast}</span>
              </div>
            )}

            {onToggleInlineTuner && (
              <button
                type="button"
                onClick={onToggleInlineTuner}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer active:scale-95 ${
                  showInlineTuner
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-2xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800 shadow-2xs'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200 shadow-2xs'
                }`}
                title="No Need to Leave 7A Sandbox, Expand directly on current page/Collapse this node panel and SettingActionRow Internal row real-time tuner"
              >
                <Sliders className="h-3 w-3" />
                <span>
                  {showInlineTuner ? 'Collapse Inline Quick-Tuning' : 'Quick in-place node adjustment'}
                </span>
              </button>
            )}

            {onNavigateShowcase && (
              <button
                type="button"
                onClick={() =>
                  onNavigateShowcase(
                    pageRecipeTarget.tab,
                    pageRecipeTarget.targetId
                  )
                }
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer active:scale-95 bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 shadow-2xs"
                title={`One-click jump to independent tuning page: [${pageRecipeTarget.code}] ${pageRecipeTarget.componentName}`}
              >
                <span>Jump to current page settings [{pageRecipeTarget.code}]</span>
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {onNavigateShowcase && elementTargets.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-neutral-200/70 dark:border-neutral-800/70">
            <span className="text-[11px] text-neutral-400 shrink-0">
              Internal element tuning jump for current page:
            </span>
            {elementTargets.map((target) => (
              <button
                key={`${target.code}-${target.componentName}`}
                type="button"
                onClick={() => onNavigateShowcase(target.tab, target.targetId)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-all cursor-pointer active:scale-95 ${
                  isLight
                    ? 'bg-white hover:bg-amber-50 border-neutral-200/90 hover:border-amber-400 text-neutral-700 hover:text-amber-700 shadow-2xs'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-amber-500/60 text-neutral-300 hover:text-amber-300'
                }`}
                title={`Jump to independent underlying component tuning page: [${target.code}] ${target.componentName}`}
              >
                <span className="px-1 py-0.2 rounded text-[9.5px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  {target.code}
                </span>
                <span>{target.label}</span>
                <ArrowUpRight className="h-3 w-3 opacity-70" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
