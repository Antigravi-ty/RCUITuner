import React from 'react';
import {
  Gamepad2, Wrench, Settings, Play,
  Server, ChevronLeft, ChevronRight, User,
  Terminal, Smartphone, ArrowUpRight, Sliders,
} from 'lucide-react';
import { Badge } from '../../../ui-core/primitives/Badge';
import { UnderlineTabs } from '../../../ui-core/primitives/UnderlineTabs';
import { useMenuLayoutStore, DEFAULT_PANEL_SIZING, type MenuPanelId } from '../../../ui-core/stores/menuLayoutStore';
import { usePlayCardStyleStore, type PlayCardStyleVariant, } from '../../../ui-core/stores/playCardStyleStore';
import { useMainMenuStyleStore, MAIN_MENU_STYLE_PRESETS, } from '../../../ui-core/stores/mainMenuStyleStore';
import { Layer1ContextGroupedSelector, resolveLayer1ContextSpec, type Layer1MenuContextMode } from '../../../ui-core/recipes/Layer1MainMenuRecipe';
import { ONLINE_SESSION_CONTEXT_SPECS, resolveOnlineSessionContextId } from '../../../ui-core/recipes/Layer2RoomHostControlRecipe';
import type { ShowcaseTab } from '../../Sidebar';
import {
  type ActiveMenuRoute, type MenuVisibilityTier, USER_SETTINGS_QUICK_TABS,
  DEV_SETTINGS_QUICK_TABS, GARAGE_QUICK_TABS, USER_LINEAR_PLAYLIST, DEV_LINEAR_PLAYLIST,
  findPlaylistStepIndex,
} from './menuLayerRouteConfig';
import type { Layer3StepOverrideState } from './MenuLayerStageRecipeRouter';
import { MenuLayerDeepRoutesAndFooter } from './MenuLayerDeepRoutesAndFooter';

export interface MenuLayerRouteSelectorBarProps {
  isLight: boolean;
  visibilityTier: MenuVisibilityTier;
  onChangeVisibilityTier: (tier: MenuVisibilityTier) => void;
  layer1ContextMode: Layer1MenuContextMode;
  onChangeLayer1ContextMode: (mode: Layer1MenuContextMode) => void;
  touchMode: boolean;
  onToggleTouchMode: (enabled: boolean) => void;
  currentRoute: ActiveMenuRoute;
  handleSelectRoute: (route: ActiveMenuRoute) => void;
  settingsTab: string;
  setSettingsTab: (tab: string) => void;
  garageTab: string;
  setGarageTab: (tab: string) => void;
  showToast: (msg: string) => void;
  isDockState: boolean;
  activeRouteSizeModeLabel: string;
  feedbackToast: string | null;
  onNavigateToPlayCards?: () => void;
  onNavigateShowcase?: (tab: ShowcaseTab, targetId?: string) => void;
  showInlineTuner?: boolean;
  onToggleInlineTuner?: () => void;
  layer3StepOverride?: Layer3StepOverrideState;
  onChangeLayer3StepOverride?: (next: Layer3StepOverrideState) => void;
}

export const MenuLayerRouteSelectorBar = React.memo<MenuLayerRouteSelectorBarProps>(({
  isLight, visibilityTier, onChangeVisibilityTier, layer1ContextMode,
  onChangeLayer1ContextMode, touchMode, onToggleTouchMode, currentRoute,
  handleSelectRoute, settingsTab, setSettingsTab, garageTab, setGarageTab,
  showToast, activeRouteSizeModeLabel, feedbackToast,
  onNavigateToPlayCards, onNavigateShowcase, showInlineTuner = false,
  onToggleInlineTuner, layer3StepOverride, onChangeLayer3StepOverride,
}) => {
  const { panels, simulateLayer3Error, setToken } = useMenuLayoutStore();
  const { variant: playCardVariant, setVariant: setPlayCardVariant } = usePlayCardStyleStore();
  const mainMenuStyle = useMainMenuStyleStore();
  const getPanelWidth = (panelId: MenuPanelId) =>
    (panels?.[panelId] ?? DEFAULT_PANEL_SIZING[panelId])?.width ?? 480;

  const activePlaylist = visibilityTier === 'user' ? USER_LINEAR_PLAYLIST : DEV_LINEAR_PLAYLIST;
  const normalizedLayer1Ctx = resolveLayer1ContextSpec(layer1ContextMode).id;

  const currentPlaylistIndex = findPlaylistStepIndex(
    activePlaylist,
    currentRoute,
    normalizedLayer1Ctx,
    settingsTab,
    garageTab,
    layer3StepOverride
  );

  const currentStep = activePlaylist[currentPlaylistIndex] || activePlaylist[0];

  const applyPlaylistStep = (idx: number) => {
    const wrapped = (idx + activePlaylist.length) % activePlaylist.length;
    const step = activePlaylist[wrapped];
    if (!step) return;
    if (step.contextMode) {
      onChangeLayer1ContextMode(step.contextMode);
    }
    if (step.route === 'settings' && step.subtab) {
      setSettingsTab(step.subtab);
    }
    if (step.route === 'garage' && step.subtab) {
      setGarageTab(step.subtab);
    }
    if (step.progressStatus) {
      onChangeLayer3StepOverride?.({
        progressStatus: step.progressStatus,
        currentStep: step.currentStep ?? 1,
        defaultEditingConfig: Boolean(step.defaultEditingConfig),
      });
    } else {
      onChangeLayer3StepOverride?.({
        progressStatus: 'idle',
        currentStep: 1,
        defaultEditingConfig: false,
      });
    }
    handleSelectRoute(step.route);
    showToast(`[${wrapped + 1}/${activePlaylist.length}] ${step.label}`);
  };

  return (
    <div className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-colors ${
      isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800' }`}>
      {/* Top Bar: Strict User Only vs Developer Only Split + < Prev Page | Next Page > Linear Scanner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        {/* Strict Tier Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">View isolation (Strict Tier):</span>
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-neutral-100/80 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => onChangeVisibilityTier('user')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                visibilityTier === 'user'
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>User Only ({USER_LINEAR_PLAYLIST.length} Pages)</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeVisibilityTier('developer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                visibilityTier === 'developer'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Developer Only ({DEV_LINEAR_PLAYLIST.length} Pages)</span>
            </button>
          </div>

          {visibilityTier === 'developer' && (
            <button
              type="button"
              onClick={() => onToggleTouchMode(!touchMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold cursor-pointer transition-colors ${
                touchMode
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                  : isLight
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-600'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title="Simulate ?touch=1 Touch Controls Agent Switcher in Layer 1 Main Menu"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>?touch={touchMode ? '1' : '0'}</span>
            </button>
          )}
        </div>

        {/* Linear Playlist Scanner (< Prev Page | [N/M] | Next Page >) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => applyPlaylistStep(currentPlaylistIndex - 1)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
            }`}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev Page</span>
          </button>

          <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-2 ${ isLight
            ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
            : 'bg-neutral-950 border-neutral-800 text-neutral-200' }`}>
            <span className="font-bold text-amber-500">[{currentPlaylistIndex + 1} / {activePlaylist.length}]</span>
            <span className="truncate max-w-[230px] font-semibold">{currentStep?.label}</span>
          </div>

          <button
            type="button"
            onClick={() => applyPlaylistStep(currentPlaylistIndex + 1)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
            }`}
          >
            <span>Next Page</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Layer 0: Active Match (Shown in User Mode) */}
      {visibilityTier === 'user' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="neutral" size="sm" isLight={isLight}>
              Layer 0
            </Badge>
            <span>Level Zero Match (No Menu)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectRoute('layer-0')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                currentRoute === 'layer-0'
                  ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                  : isLight
                  ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Active Match (Level Zero Real-Time Match · No Menu State)</span>
              <span className="font-mono text-[10px] opacity-75">0px</span>
            </button>
          </div>
        </div>
      )}

      {/* Layer 1: Main Menu + Dynamic Context Variations */}
      <div className="flex flex-col gap-2 text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="primary" size="sm" isLight={isLight}>
              Layer 1
            </Badge>
            <span>Primary root menu variant</span>
          </div>

          <Layer1ContextGroupedSelector
            activeContext={normalizedLayer1Ctx}
            onSelectContext={(ctx) => {
              onChangeLayer1ContextMode(ctx);
              handleSelectRoute('main-menu');
            }}
            tierFilter={visibilityTier}
            isRouteActive={currentRoute === 'main-menu'}
            isLight={isLight}
          />
        </div>

        {/* Sub-bar when Layer 1 Main Menu is active: Quick Style Presets + Toggles + Jump to 6A.1M */}
        {currentRoute === 'main-menu' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>
                L1 MENU Minimalist large-font menu switching (current: {mainMenuStyle.titleFontSizePx}px{' '}
                {mainMenuStyle.titleFontFamily === 'mono' ? 'JetBrains Mono' : 'Apple Sans'} ·{' '}
                {mainMenuStyle.showDescription ? 'includes Description' : 'none Description'} ·{' '}
                {mainMenuStyle.conciseResumeLabel ? 'Resume Short Title' : 'Resume Match'}):
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                {onToggleInlineTuner && (
                  <button type="button" onClick={onToggleInlineTuner}
                    className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-bold cursor-pointer">
                    <Sliders className="h-3 w-3" />
                    <span>{showInlineTuner ? 'Collapse in-place full-parameter tuner ^' : 'Expand in-place full-parameter tuner v'}</span>
                  </button>
                )}
                {onNavigateShowcase && (
                  <button
                    type="button"
                    onClick={() => onNavigateShowcase('recipes', 'main-menu-style-tuner')}
                    className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                  >
                    <span>open 6A.1M MENU Full-parameter workbench and three-scheme side-by-side comparison</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {MAIN_MENU_STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    mainMenuStyle.applyPreset(preset.params);
                    showToast(`Toggled L1 MENU Style To: ${preset.label}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    isLight
                      ? 'bg-neutral-50 hover:bg-amber-50/70 border-neutral-200 hover:border-amber-400 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 hover:border-amber-500/60 text-neutral-200'
                  }`}
                  title={preset.subtitle}
                >
                  {preset.label.split(' · ')[0]} · {preset.label.split(' · ')[1] || ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Layer 2: Secondary Menus (Strictly separated by User vs Developer) */}
      <div className="flex flex-col gap-2 text-xs pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 min-w-[130px] shrink-0 font-semibold text-neutral-500 dark:text-neutral-400">
            <Badge variant="warning" size="sm" isLight={isLight}>
              Layer 2
            </Badge>
            <span>Secondary function menu</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visibilityTier === 'user' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSelectRoute('play')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    currentRoute === 'play'
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Gamepad2 className="h-3.5 w-3.5" />
                  <span>Play (6 Game Mode Grid)</span>
                  <span className="font-mono text-[10px] opacity-75">{getPanelWidth('layer2-play')}px</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoute('garage')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    currentRoute === 'garage'
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Garage (5 Tabs includes Materials)</span>
                  <span className="font-mono text-[10px] opacity-75">{getPanelWidth('layer2-garage')}px</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (settingsTab === 'developer') setSettingsTab('gameplay');
                    handleSelectRoute('settings');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    currentRoute === 'settings'
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Settings (User 4 Tabs · icon+text)</span>
                  <span className="font-mono text-[10px] opacity-75">{getPanelWidth('layer2-settings')}px</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRoute('room-host-control')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    currentRoute === 'room-host-control'
                      ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <Server className="h-3.5 w-3.5" />
                  <span>Room Host Control (Host Console)</span>
                  <span className="font-mono text-[10px] opacity-75">{getPanelWidth('layer2-room-host-control')}px</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSettingsTab('developer');
                  handleSelectRoute('settings');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  currentRoute === 'settings'
                    ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Settings → Developer Tab (5 Developer center portal)</span>
                <span className="font-mono text-[10px] opacity-75">{getPanelWidth('layer2-settings')}px</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-bar when Play is active: 3 Card Styles Quick Switcher + Jump to L2 PlayCardPage */}
        {currentRoute === 'play' && visibilityTier === 'user' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>L2 Play Menu card style switching (PlayModeCard 3 Archetypes):</span>
              {onNavigateToPlayCards && (
                <button type="button" onClick={onNavigateToPlayCards}
                  className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold cursor-pointer">
                  <span>open L2 · 2B PlayCard Three-style parameter tuning page</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'icon-badge-top', label: 'style 1: [Icon + Badge] / Title / Desc' },
                  { id: 'icon-title-inline', label: 'style 2: [Icon + Title] (none Badge) / Desc' },
                  { id: 'mono-giant-watermark', label: 'Style 3 (default): JetBrains Mono Large Text + 30% extra large background Icon' },
                ] as { id: PlayCardStyleVariant; label: string }[]
              ).map((item) => {
                const active = playCardVariant === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPlayCardVariant(item.id);
                      showToast(`Toggled L2 Play Card To: ${item.label}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                        : isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sub-tab bar when Garage is active */}
        {currentRoute === 'garage' && visibilityTier === 'user' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>Garage 5-Tab Cascading Toggle (Car / Colour / Materials / Anthem / Sync):</span>
              <span className="text-amber-500 font-semibold">current: {garageTab.toUpperCase()}</span>
            </div>
            <UnderlineTabs
              items={GARAGE_QUICK_TABS}
              activeId={garageTab}
              onChange={(tabId) => {
                setGarageTab(tabId);
                showToast(`Switched to Garage -> ${tabId}`);
              }}
              isLight={isLight}
              size="sm"
              fullWidth={false}
            />
          </div>
        )}

        {/* Sub-tab bar when Settings is active */}
        {currentRoute === 'settings' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>
                {visibilityTier === 'user'
                  ? 'Settings User Tab Synchronization (Gameplay / Audio / Display / Advanced):'
                  : 'Settings Developer Exclusive Tab (Show Only Developer Hub):'}
              </span>
              <span className="text-amber-500 font-semibold">current: {settingsTab.toUpperCase()}</span>
            </div>
            <UnderlineTabs
              items={visibilityTier === 'user' ? USER_SETTINGS_QUICK_TABS : DEV_SETTINGS_QUICK_TABS}
              activeId={settingsTab}
              onChange={(tabId) => {
                setSettingsTab(tabId);
                showToast(`Switched to Settings -> ${tabId}`);
              }}
              isLight={isLight}
              size="sm"
              fullWidth={false}
            />
          </div>
        )}

        {/* Sub-tab bar when Room Host Control is active */}
        {currentRoute === 'room-host-control' && (
          <div className="w-full pt-2 flex flex-col gap-1.5 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span>Online Room Control 6 State Context Synchronization (Match Lobby / During Match / Online Warmup · Host & Client):</span>
              <span className="text-amber-500 font-semibold">
                current: {resolveOnlineSessionContextId(layer1ContextMode).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {ONLINE_SESSION_CONTEXT_SPECS.map((spec) => {
                const active = resolveOnlineSessionContextId(layer1ContextMode) === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => {
                      onChangeLayer1ContextMode(spec.id);
                      showToast(`Room control panel switched to: ${spec.shortLabel} (${spec.role.toUpperCase()})`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                        : isLight
                        ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {spec.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <MenuLayerDeepRoutesAndFooter
        isLight={isLight}
        visibilityTier={visibilityTier}
        currentRoute={currentRoute}
        handleSelectRoute={handleSelectRoute}
        getPanelWidth={getPanelWidth}
        simulateLayer3Error={simulateLayer3Error}
        setSimulateLayer3Error={(next) => setToken('simulateLayer3Error', next)}
        showToast={showToast}
        showInlineTuner={showInlineTuner}
        onToggleInlineTuner={onToggleInlineTuner}
        onNavigateShowcase={onNavigateShowcase}
        settingsTab={settingsTab}
        garageTab={garageTab}
        currentStepBreadcrumb={currentStep?.breadcrumb}
        activeRouteSizeModeLabel={activeRouteSizeModeLabel}
        feedbackToast={feedbackToast}
        layer3StepOverride={layer3StepOverride}
        onChangeLayer3StepOverride={onChangeLayer3StepOverride}
      />
    </div>
  );
});

MenuLayerRouteSelectorBar.displayName = 'MenuLayerRouteSelectorBar';

