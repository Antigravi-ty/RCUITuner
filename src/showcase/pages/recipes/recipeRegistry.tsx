import React, { Suspense, lazy } from 'react';
import { Badge } from '../../../ui-core/primitives/Badge';
import { AuditTicketHeader } from '../../components/AuditTicketHeader';
import { readUrlParams, type UrlParamMap } from '../../stores/urlSync';
import { LocalPanelSizingTuner, RECIPES_JUMP_ITEMS } from './LocalPanelSizingTuner';
import { DEEP_LAYER_RECIPE_SPECS, SingleDeepLayerRecipeCard } from './DeepLayerRecipesSection';
import { Layer1MainMenuSyncedStage } from './Layer1MainMenuSyncedStage';
import {
  LAYER2_GARAGE_STATES,
  LAYER2_SETTINGS_STATES,
  LAYER3_HOST_MATCH_STATES,
  LAYER3_JOIN_ROOM_STATES,
} from '../../../ui-core/recipes/recipeStateMatrixSpecs';
import type { JumpDirectoryItem } from '../../PageJumpDirectory';

const Layer2PlayRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer2PlayRecipe').then((m) => ({
    default: m.Layer2PlayRecipe,
  }))
);
const Layer2SettingsRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer2SettingsRecipe').then((m) => ({
    default: m.Layer2SettingsRecipe,
  }))
);
const Layer2GarageRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer2GarageRecipe').then((m) => ({
    default: m.Layer2GarageRecipe,
  }))
);
const Layer3AudioEqRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3AudioEqRecipe').then((m) => ({
    default: m.Layer3AudioEqRecipe,
  }))
);
const Layer3HostMatchRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3HostMatchRecipe').then((m) => ({
    default: m.Layer3HostMatchRecipe,
  }))
);
const Layer3JoinRoomRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3JoinRoomRecipe').then((m) => ({
    default: m.Layer3JoinRoomRecipe,
  }))
);
const MainMenuStyleTuner = lazy(() =>
  import('./MainMenuStyleTuner').then((m) => ({
    default: m.MainMenuStyleTuner,
  }))
);
const PanelShellTuner = lazy(() =>
  import('../panels/PanelShellTuner').then((m) => ({
    default: m.PanelShellTuner,
  }))
);
const SettingActionRowTuner = lazy(() =>
  import('../tabs/SettingActionRowTuner').then((m) => ({
    default: m.SettingActionRowTuner,
  }))
);
const UnderlineTabsTuner = lazy(() =>
  import('../tabs/UnderlineTabsTuner').then((m) => ({
    default: m.UnderlineTabsTuner,
  }))
);
const CameraSettingsStyleTuner = lazy(() =>
  import('./CameraSettingsStyleTuner').then((m) => ({
    default: m.CameraSettingsStyleTuner,
  }))
);

export const SETTING_ROW_SUB_ANCHOR_TO_ITEM_ID: Record<string, string> = {
  'setting-preset-custom-tuner': 'setting-action-row-tuner',
  '6A.4S-E': 'setting-action-row-tuner',
  'setting-dev-status-tuner': 'setting-action-row-tuner',
  '6A.4S-F': 'setting-action-row-tuner',
  'setting-telemetry-summary-tuner': 'setting-telemetry-summary-tuner',
  '6A.4S-H': 'setting-telemetry-summary-tuner',
};

const ROUTE_PARAM_TO_RECIPE_ID: Record<string, string> = {
  'main-menu': 'recipe-6a-1-main',
  play: 'recipe-6a-2-play',
  garage: 'recipe-6a-3-garage',
  settings: 'recipe-6a-4-settings',
  'additional-preview': 'recipe-6a-5-settings-preview',
  'room-host-control': 'recipe-6a-8-host-ctrl',
  'audio-eq': 'recipe-6a-7-audio',
  trajectory: 'recipe-6a-12c-trajectory',
  'online-warmup': 'recipe-6a-6a-host',
  'host-match': 'recipe-6a-6a-host',
  'join-room': 'recipe-6a-6b-join',
  'exhibition': 'recipe-6a-9-bot-diff',
  'self-training': 'recipe-6a-10-self-train',
  'kickoff-training': 'recipe-6a-11-kickoff',
  training: 'recipe-6a-18-training',
  camera: 'recipe-6a-12-camera',
  keybindings: 'recipe-6a-12b-keybindings',
  'exp-multi-bots': 'recipe-6a-13-multibots',
  'dev-subsystem-isolation': 'recipe-6a-20-dev-isolation',
  'dev-active-tuners': 'recipe-6a-21-dev-tuners',
  'dev-calibrated-presets': 'recipe-6a-22-dev-presets',
  'dev-under-development': 'recipe-6a-23-dev-under-dev',
  'static-training-pack': 'recipe-6a-14-rcspack',
  'advanced-audio': 'recipe-6a-15-adv-audio',
  'controller-settings': 'recipe-6a-16-adv-ctrl',
  'event-trigger-rules': 'recipe-6a-17-triggers',
};

export interface ResolvedRecipeTarget {
  itemId: string;
  subAnchorId?: string;
}

export function matchRecipeToken(rawToken?: string | null): ResolvedRecipeTarget | null {
  if (!rawToken) return null;
  const clean = rawToken.startsWith('#') ? rawToken.slice(1).trim() : rawToken.trim();
  if (!clean) return null;
  const upper = clean.toUpperCase();
  const direct = RECIPES_JUMP_ITEMS.find(
    (it) => (it.id || it.targetId) === clean || it.code.toUpperCase() === upper
  );
  if (direct) {
    const id = direct.id || direct.targetId || 'recipe-6a-1-main';
    return {
      itemId: id,
      subAnchorId:
        id === 'setting-telemetry-summary-tuner' ? 'setting-telemetry-summary-tuner' : undefined,
    };
  }
  const mappedSub =
    SETTING_ROW_SUB_ANCHOR_TO_ITEM_ID[clean] || SETTING_ROW_SUB_ANCHOR_TO_ITEM_ID[upper];
  if (mappedSub) {
    const subDomId =
      upper === '6A.4S-E'
        ? 'setting-preset-custom-tuner'
        : upper === '6A.4S-F'
        ? 'setting-dev-status-tuner'
        : upper === '6A.4S-H'
        ? 'setting-telemetry-summary-tuner'
        : clean;
    return {
      itemId: mappedSub,
      subAnchorId: subDomId,
    };
  }
  return null;
}

export function resolveActiveRecipeFromUrl(
  params: UrlParamMap = readUrlParams(),
  hash: string = typeof window !== 'undefined' ? window.location.hash : ''
): ResolvedRecipeTarget {
  const fromHash = matchRecipeToken(hash);
  if (fromHash) return fromHash;
  const fromRecipeParam = matchRecipeToken(params.recipe);
  if (fromRecipeParam) return fromRecipeParam;
  if (params.route && ROUTE_PARAM_TO_RECIPE_ID[params.route]) {
    return { itemId: ROUTE_PARAM_TO_RECIPE_ID[params.route] };
  }
  return { itemId: 'recipe-6a-1-main' };
}

export function getRelatedRecipeItems(activeItemId: string): JumpDirectoryItem[] {
  const pick = (ids: string[]) =>
    ids
      .filter((id) => id !== activeItemId)
      .map((id) => RECIPES_JUMP_ITEMS.find((it) => (it.id || it.targetId) === id))
      .filter((it): it is JumpDirectoryItem => Boolean(it));
  if (activeItemId === 'recipe-6a-1-main' || activeItemId === 'main-menu-style-tuner') {
    return pick(['recipe-6a-1-main', 'main-menu-style-tuner', 'panel-shell-tuner']);
  }
  if (activeItemId === 'recipe-6a-12-camera' || activeItemId === 'camera-settings-style-tuner') {
    return pick(['recipe-6a-12-camera', 'camera-settings-style-tuner', 'panel-shell-tuner']);
  }
  if (
    activeItemId === 'recipe-6a-4-settings' ||
    activeItemId === 'underline-tabs-tuner' ||
    activeItemId === 'setting-action-row-tuner' ||
    activeItemId === 'setting-telemetry-summary-tuner' ||
    activeItemId === 'recipe-6a-5-settings-preview'
  ) {
    return pick([
      'recipe-6a-4-settings',
      'underline-tabs-tuner',
      'setting-action-row-tuner',
      'setting-telemetry-summary-tuner',
      'recipe-6a-5-settings-preview',
      'panel-shell-tuner',
    ]);
  }
  if (
    activeItemId === 'recipe-6a-6a-host' ||
    activeItemId === 'recipe-6a-6b-join' ||
    activeItemId === 'recipe-6a-8-host-ctrl'
  ) {
    return pick([
      'recipe-6a-6a-host',
      'recipe-6a-6b-join',
      'recipe-6a-8-host-ctrl',
      'panel-shell-tuner',
    ]);
  }
  if (
    activeItemId.startsWith('recipe-6a-20') ||
    activeItemId.startsWith('recipe-6a-21') ||
    activeItemId.startsWith('recipe-6a-22') ||
    activeItemId.startsWith('recipe-6a-23')
  ) {
    return pick([
      'recipe-6a-20-dev-isolation',
      'recipe-6a-21-dev-tuners',
      'recipe-6a-22-dev-presets',
      'recipe-6a-23-dev-under-dev',
      'panel-shell-tuner',
    ]);
  }
  return pick(['panel-shell-tuner', 'setting-action-row-tuner']);
}

export interface SingleRecipeRenderContext {
  isLight: boolean;
  simulateLayer3Error: boolean;
  onToggleLayer3Error: (enabled: boolean) => void;
  onSelectRecipeId: (itemId: string) => void;
}

const noop = () => {};

export const OnDemandRecipeStage: React.FC<
  SingleRecipeRenderContext & { itemId: string }
> = React.memo(({ itemId, isLight, onSelectRecipeId }) => {
  const previewWrapClass = `flex justify-center p-6 rounded-2xl border transition-colors ${
    isLight
      ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
      : 'border-neutral-800 bg-neutral-950/60'
  }`;
  const suspenseFallback = (
    <div className="py-12 text-xs font-mono text-neutral-400 text-center">
      Loading on Demand 6A Module...
    </div>
  );
  const deepSpec = DEEP_LAYER_RECIPE_SPECS.find((s) => s.id === itemId);
  if (deepSpec) {
    return <SingleDeepLayerRecipeCard spec={deepSpec} isLight={isLight} />;
  }
  switch (itemId) {
    case 'recipe-6a-1-main':
      return (
        <Layer1MainMenuSyncedStage
          isLight={isLight}
          previewWrapClass={previewWrapClass}
          suspenseFallback={suspenseFallback}
          onSelectRecipeId={onSelectRecipeId}
        />
      );
    case 'main-menu-style-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <MainMenuStyleTuner isLight={isLight} codeBadge="6A.1M" />
        </Suspense>
      );
    case 'camera-settings-style-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <CameraSettingsStyleTuner isLight={isLight} codeBadge="6A.12M" />
        </Suspense>
      );
    case 'panel-shell-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <PanelShellTuner
            isLight={isLight}
            codeBadge="6A.2S"
            title="Layer 2+ Universal three-segment panel shell tuner (Header font size/Back Button/padding · Content padding · Footer padding)"
          />
        </Suspense>
      );
    case 'recipe-6a-2-play':
      return (
        <div id="recipe-6a-2-play" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.2
            </span>
            <h2 className="text-base font-bold">
              Layer 2 Game mode selection panel menu (Play · Single view grid recommendation Auto-Fit)
            </h2>
          </div>
          <LocalPanelSizingTuner
            code="6A.2"
            panelId="layer2-play"
            label="Layer 2 Play Mode Selection"
            recommendation="recommended Auto-Fit: No Inner Tab Toggle, Auto-fit Height 2×3 Mode Card"
            isLight={isLight}
          />
          <div className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <Layer2PlayRecipe isLight={isLight} onBack={noop} />
            </Suspense>
          </div>
        </div>
      );
    case 'recipe-6a-3-garage':
      return (
        <div id="recipe-6a-3-garage" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
                6A.3
              </span>
              <h2 className="text-base font-bold">
                Layer 2 Garage Loadout (Flat 5-Tab Audit Matrix · Car / Paint / Loadout / Anthem / Sync)
              </h2>
            </div>
            <Badge variant="amber" size="sm" isLight={isLight}>
              5-Tab Flat Matrix · CSS Grid 0px Jump Locked
            </Badge>
          </div>
          <LocalPanelSizingTuner
            code="6A.3"
            panelId="layer2-garage"
            label="Layer 2 Garage Loadout Config"
            recommendation="Flat 5-Tab Matrix: Renders Car, Paint, Loadout, Anthem, and Sync tabs side by side with locked 417px envelope height."
            isLight={isLight}
          />
          <div className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
                {LAYER2_GARAGE_STATES.map((st, idx) => (
                  <div key={st.id} className="flex flex-col gap-2 items-center w-full">
                    <AuditTicketHeader
                      index={idx + 1}
                      label={st.label}
                      description={st.description}
                      referenceCode="6A.3"
                      componentName={st.componentName || 'Layer2GarageRecipe'}
                      sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer2GarageRecipe.tsx'}
                      subViewFile={st.subViewFile}
                      stateId={st.id}
                      activeProps={st.props}
                      badgeColor="amber"
                      isLight={isLight}
                    />
                    <Layer2GarageRecipe isLight={isLight} {...st.props} onBack={noop} />
                  </div>
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      );
    case 'recipe-6a-4-settings':
    case 'recipe-6a-5-settings-preview':
      return (
        <div id={itemId} className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-mono font-bold text-xs">
                {itemId === 'recipe-6a-5-settings-preview' ? '6A.5' : '6A.4'}
              </span>
              <h2 className="text-base font-bold">
                Layer 2 System Settings (Flat 5-Tab Audit Matrix · Gameplay / Audio / Display / Advanced / Developer)
              </h2>
            </div>
            <Badge variant="neutral" size="sm" isLight={isLight}>
              5-Tab Flat Matrix · CSS Grid 0px Jump Locked
            </Badge>
          </div>
          <LocalPanelSizingTuner
            code="6A.4"
            panelId="layer2-settings"
            label="Layer 2 System Settings"
            recommendation="Flat 5-Tab Matrix: Renders Gameplay, Audio, Display, Advanced, and Developer tabs side by side with locked 457px envelope height."
            isLight={isLight}
          />
          <div id="recipe-6a-5-settings-preview" className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
                {LAYER2_SETTINGS_STATES.map((st, idx) => (
                  <div key={st.id} className="flex flex-col gap-2 items-center w-full">
                    <AuditTicketHeader
                      index={idx + 1}
                      label={st.label}
                      description={st.description}
                      referenceCode="6A.4"
                      componentName={st.componentName || 'Layer2SettingsRecipe'}
                      sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer2SettingsRecipe.tsx'}
                      subViewFile={st.subViewFile}
                      stateId={st.id}
                      activeProps={st.props}
                      badgeColor="indigo"
                      isLight={isLight}
                    />
                    <Layer2SettingsRecipe isLight={isLight} {...st.props} onBack={noop} />
                  </div>
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      );
    case 'underline-tabs-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <UnderlineTabsTuner
            isLight={isLight}
            codeBadge="6A.4T"
            showStandalonePreview={true}
            title="Layer 2 Settings · UnderlineTabs Top bar tab tuner (font size · Icon Size · spacing · Font Weight)"
          />
        </Suspense>
      );
    case 'setting-action-row-tuner':
    case 'setting-telemetry-summary-tuner':
      return (
        <Suspense fallback={suspenseFallback}>
          <SettingActionRowTuner
            isLight={isLight}
            codeBadge={itemId === 'setting-telemetry-summary-tuner' ? '6A.4S-H' : '6A.4S'}
            showStandalonePreview={true}
            title="Layer 2 Settings · SettingActionRow Internal navigation row tuner (border · Description Visibility · Padding · SVG Icon color · Telemetry Collapse)"
          />
        </Suspense>
      );
    case 'recipe-6a-6a-host':
      return (
        <div id="recipe-6a-6a-host" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.6A
            </span>
            <h2 className="text-base font-bold">
              Layer 3 Host Match (Flat 5-State Matrix · Idle Collapsed / Idle Expanded / Step 3 / Completed / Error Step 3)
            </h2>
            <Badge variant="amber" size="sm" isLight={isLight}>
              Host Room States
            </Badge>
          </div>
          <LocalPanelSizingTuner
            code="6A.6A"
            panelId="layer3-host-match"
            label="Layer 3 Host Match (Create Room Page)"
            recommendation="Auto-Fit: Renders all 5 lifecycle states side by side with per-card Audit Ticket copy buttons."
            isLight={isLight}
          />
          <div
            className={`relative p-6 rounded-2xl border transition-colors overflow-hidden ${
              isLight
                ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
                : 'border-neutral-800 bg-neutral-950/60'
            }`}
          >
            <Suspense fallback={suspenseFallback}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
                {LAYER3_HOST_MATCH_STATES.map((st, idx) => (
                  <div key={st.id} className="flex flex-col gap-2 items-center w-full">
                    <AuditTicketHeader
                      index={idx + 1}
                      label={st.label}
                      description={st.description}
                      referenceCode="6A.6A"
                      componentName={st.componentName || 'Layer3HostMatchRecipe'}
                      sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer3HostMatchRecipe.tsx'}
                      subViewFile={st.subViewFile}
                      stateId={st.id}
                      activeProps={st.props}
                      badgeColor="amber"
                      isLight={isLight}
                    />
                    <Layer3HostMatchRecipe isLight={isLight} {...st.props} onBack={noop} />
                  </div>
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      );
    case 'recipe-6a-6b-join':
      return (
        <div id="recipe-6a-6b-join" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.6B
            </span>
            <h2 className="text-base font-bold">
              Layer 3 Join Room (Flat 5-State Matrix · Idle / Handshake Step 2 / Step 4 / Connected / Error Step 3)
            </h2>
            <Badge variant="primary" size="sm" isLight={isLight}>
              Client Join States
            </Badge>
          </div>
          <LocalPanelSizingTuner
            code="6A.6B"
            panelId="layer3-join-room"
            label="Layer 3 Join Room (Client Join Page)"
            recommendation="Auto-Fit: Renders all client connection lifecycle states side by side with per-card Audit Ticket copy buttons."
            isLight={isLight}
          />
          <div
            className={`relative p-6 rounded-2xl border transition-colors overflow-hidden ${
              isLight
                ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
                : 'border-neutral-800 bg-neutral-950/60'
            }`}
          >
            <Suspense fallback={suspenseFallback}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
                {LAYER3_JOIN_ROOM_STATES.map((st, idx) => (
                  <div key={st.id} className="flex flex-col gap-2 items-center w-full">
                    <AuditTicketHeader
                      index={idx + 1}
                      label={st.label}
                      description={st.description}
                      referenceCode="6A.6B"
                      componentName={st.componentName || 'Layer3JoinRoomRecipe'}
                      sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer3JoinRoomRecipe.tsx'}
                      subViewFile={st.subViewFile}
                      stateId={st.id}
                      activeProps={st.props}
                      badgeColor="rose"
                      isLight={isLight}
                    />
                    <Layer3JoinRoomRecipe isLight={isLight} {...st.props} onBack={noop} />
                  </div>
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      );
    case 'recipe-6a-7-audio':
      return (
        <div id="recipe-6a-7-audio" className="scroll-mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.7
            </span>
            <h2 className="text-base font-bold">Layer 3 Advanced audio equalizer menu (Acoustics & EQ)</h2>
          </div>
          <LocalPanelSizingTuner
            code="6A.7"
            panelId="layer3-audio-eq"
            label="Layer 3 Acoustics & EQ"
            recommendation="recommended Fixed: Lock height and automatically compress internal card spacing on error"
            isLight={isLight}
          />
          <div className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <Layer3AudioEqRecipe isLight={isLight} onBack={noop} />
            </Suspense>
          </div>
        </div>
      );
    default:
      return null;
  }
});
OnDemandRecipeStage.displayName = 'OnDemandRecipeStage';
