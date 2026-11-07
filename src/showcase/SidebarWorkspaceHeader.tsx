import React from 'react';
import {
  Palette,
  PanelLeftClose,
  Search,
  X,
  CheckCircle2,
  FlaskConical,
  ClipboardCheck,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { useAccentStore } from './stores/themeStore';
import { AccentColor } from '../ui-core/tokens/colors';
import {
  WORKSPACE_SPECS,
  type ApprovalLedgerSummary,
  type ShowcaseTab,
  type TunerWorkspaceId,
  type WorkspaceSectionMeta,
} from './workspaceSpecs';
import { ViewportControls } from './ViewportControls';

export interface JumpOriginRecord {
  fromTab: ShowcaseTab;
  fromHref: string;
  fromDesc: string;
  toTab: ShowcaseTab;
  targetId?: string;
}

export interface TopWorkspaceHeaderBarProps {
  isLight: boolean;
  activeTab: ShowcaseTab;
  activeNavLabel?: string;
  activeSectionMeta?: WorkspaceSectionMeta;
  activeWorkspace: TunerWorkspaceId;
  onSelectWorkspace: (ws: TunerWorkspaceId) => void;
  ledgerSummary: ApprovalLedgerSummary;
}

export const TopWorkspaceHeaderBar: React.FC<TopWorkspaceHeaderBarProps> = ({
  isLight,
  activeTab,
  activeNavLabel,
  activeSectionMeta,
  activeWorkspace,
  onSelectWorkspace,
  ledgerSummary,
}) => {
  const { tokens } = useAccentStore();
  return (
    <header
      className={`h-16 px-4 md:px-6 border-b flex items-center justify-between gap-3 shrink-0 z-20 transition-colors ${
        isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-950 border-neutral-800'
      }`}
    >
      <div className="flex items-center gap-2.5 text-xs min-w-0">
        <span className="font-bold tracking-tight shrink-0">RCUITuner</span>
        <span className="text-neutral-400 shrink-0">/</span>
        {activeSectionMeta && (
          <span
            className={`hidden lg:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold border shrink-0 ${activeSectionMeta.badgeColor}`}
          >
            {activeSectionMeta.code}
          </span>
        )}
        <span className={`font-mono font-medium truncate ${tokens.text}`}>
          {activeNavLabel ?? activeTab}
        </span>
      </div>

      <div
        className={`flex items-center gap-1 p-1 rounded-xl border shrink-0 ${
          isLight ? 'bg-neutral-100/90 border-neutral-200/90' : 'bg-neutral-900/90 border-neutral-800'
        }`}
      >
        {(['alpha', 'bravo'] as const).map((wsId) => {
          const isSelected = activeWorkspace === wsId;
          const isAlpha = wsId === 'alpha';
          return (
            <button
              key={wsId}
              type="button"
              onClick={() => onSelectWorkspace(wsId)}
              data-top-workspace={wsId}
              title={`${WORKSPACE_SPECS[wsId].title} · ${WORKSPACE_SPECS[wsId].subtitle} (Alt+${isAlpha ? '1' : '2'})`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                isSelected
                  ? isLight
                    ? isAlpha
                      ? 'bg-white text-amber-800 font-bold shadow-xs border border-amber-400/60'
                      : 'bg-white text-sky-800 font-bold shadow-xs border border-sky-400/60'
                    : isAlpha
                    ? 'bg-neutral-800 text-amber-300 font-bold shadow-xs border border-amber-500/50'
                    : 'bg-neutral-800 text-sky-300 font-bold shadow-xs border border-sky-500/50'
                  : isLight
                  ? 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
              }`}
            >
              {isAlpha ? (
                <FlaskConical className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              ) : (
                <ClipboardCheck className="h-3.5 w-3.5 text-sky-500 shrink-0" />
              )}
              <span>{isAlpha ? 'Workspace Alpha' : 'Workspace Bravo'}</span>
              <span className="hidden xl:inline text-[10px] opacity-75">
                {isAlpha ? '· Primitives & Lab' : '· Approval & Calibration'}
              </span>
              {!isAlpha && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  <span>
                    {ledgerSummary.approvedCount}/{ledgerSummary.totalSurfaces}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ViewportControls isLight={isLight} />
      </div>
    </header>
  );
};

export interface JumpOriginReturnBannerProps {
  isLight: boolean;
  lastJumpOrigin: JumpOriginRecord;
  onReturn: () => void;
  onDismiss: () => void;
}

export const JumpOriginReturnBanner: React.FC<JumpOriginReturnBannerProps> = ({
  isLight,
  lastJumpOrigin,
  onReturn,
  onDismiss,
}) => (
  <div
    className={`sticky top-0 z-40 px-6 py-2 border-b flex items-center justify-between gap-3 text-xs font-mono backdrop-blur-md ${
      isLight
        ? 'bg-amber-50/95 border-amber-200/90 text-amber-900 shadow-2xs'
        : 'bg-neutral-900/95 border-amber-500/30 text-amber-200 shadow-md'
    }`}
  >
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) window.history.back();
          else onReturn();
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all cursor-pointer active:scale-95 shadow-2xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return ({lastJumpOrigin.fromDesc})</span>
      </button>
      <span className="opacity-80">
        History stack{lastJumpOrigin.targetId ? ` · #${lastJumpOrigin.targetId}` : ''}
      </span>
    </div>
    <button
      type="button"
      onClick={onDismiss}
      className="px-2 py-0.5 rounded opacity-60 hover:opacity-100 cursor-pointer"
    >
      Dismiss x
    </button>
  </div>
);

export interface SidebarWorkspaceHeaderProps {
  activeWorkspace: TunerWorkspaceId;
  onSelectWorkspace: (ws: TunerWorkspaceId) => void;
  showAllPyramidLayers: boolean;
  onTogglePyramidLayers: () => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  ledgerSummary: ApprovalLedgerSummary;
  onCollapse: () => void;
  isLight: boolean;
}

const ACCENT_OPTIONS: { key: AccentColor; label: string; dotClass: string }[] = [
  { key: 'amber', label: 'warm orange', dotClass: 'bg-amber-500' },
  {
    key: 'neutral',
    label: 'Neutral Monochrome (default)',
    dotClass: 'bg-neutral-900 dark:bg-neutral-100',
  },
  { key: 'sky', label: 'Classic Blue', dotClass: 'bg-sky-500' },
];

export const SidebarWorkspaceHeader: React.FC<SidebarWorkspaceHeaderProps> = ({
  activeWorkspace,
  onSelectWorkspace,
  showAllPyramidLayers,
  onTogglePyramidLayers,
  searchQuery,
  onSearchQueryChange,
  ledgerSummary,
  onCollapse,
  isLight,
}) => {
  const { accent, tokens, setAccent } = useAccentStore();
  const activeWsSpec = WORKSPACE_SPECS[activeWorkspace];

  return (
    <div className="flex flex-col gap-3">
      {/* Brand Header + Collapse Button */}
      <div
        className={`flex items-center justify-between gap-2 pb-3 border-b transition-colors ${
          isLight ? 'border-neutral-200/80' : 'border-neutral-800/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`h-8 w-8 shrink-0 rounded-lg ${tokens.badge} flex items-center justify-center font-bold text-base shadow-sm transition-colors`}
          >
            UI
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight truncate">
              RCUITuner
            </span>
            <span
              className={`text-[10px] font-mono truncate ${
                isLight ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              Dual-Workspace SPA v3.0
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCollapse}
          title="Collapse side navigation · Current Window Only (Cmd+B / Ctrl+B)"
          aria-label="Collapse Sidebar"
          className={`h-7 w-7 shrink-0 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-neutral-100 border-neutral-200/90 text-neutral-500 hover:text-neutral-900 shadow-2xs'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-neutral-100'
          }`}
        >
          <PanelLeftClose className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Dual-Workspace Switcher Card (Alpha ⇄ Bravo) */}
      <div
        className={`p-2 rounded-xl border flex flex-col gap-2 ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-2xs'
            : 'bg-neutral-900/70 border-neutral-800'
        }`}
      >
        <div className="grid grid-cols-2 gap-1 bg-neutral-200/60 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-300/40 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => onSelectWorkspace('alpha')}
            data-workspace-switch="alpha"
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
              activeWorkspace === 'alpha' && !showAllPyramidLayers
                ? isLight
                  ? 'bg-white text-amber-700 font-bold shadow-xs border border-amber-400/50'
                  : 'bg-neutral-800 text-amber-300 font-bold shadow-xs border border-amber-500/40'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            title="Switch to Workspace Alpha: L0–L5 Foundations, Universal 3-Stage Shells & HUD/Spatial Labs (Alt+1)"
          >
            <FlaskConical className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span className="truncate">Alpha · Primitives</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectWorkspace('bravo')}
            data-workspace-switch="bravo"
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
              activeWorkspace === 'bravo' && !showAllPyramidLayers
                ? isLight
                  ? 'bg-white text-sky-700 font-bold shadow-xs border border-sky-400/50'
                  : 'bg-neutral-800 text-sky-300 font-bold shadow-xs border border-sky-500/40'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
            title="Switch to Workspace Bravo: L6–L7 Menu Recipes, 29 Floating Windows & 3-Layer Approval Pipeline (Alt+2)"
          >
            <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-sky-500" />
            <span className="truncate">Bravo · Approval</span>
          </button>
        </div>

        <div className="px-1 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold border ${activeWsSpec.badgeColor}`}
            >
              {activeWsSpec.code}
            </span>
            {activeWorkspace === 'bravo' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span>
                  {ledgerSummary.approvedCount}/{ledgerSummary.totalSurfaces}{' '}
                  Approved
                </span>
              </span>
            ) : (
              <span
                className={`text-[10px] font-mono ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                Shell #{ledgerSummary.templateHash.slice(0, 6)}
              </span>
            )}
          </div>
          <p
            className={`text-[11px] font-semibold truncate ${
              isLight ? 'text-neutral-800' : 'text-neutral-200'
            }`}
          >
            {activeWsSpec.title}
          </p>
          <p
            className={`text-[10px] leading-snug ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            {activeWsSpec.subtitle}
          </p>
        </div>
      </div>

      {/* Search & Pyramid Mode Filter Bar */}
      <div className="flex items-center gap-1.5">
        <div
          className={`flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
            isLight
              ? 'bg-white border-neutral-200/90 text-neutral-800'
              : 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
          }`}
        >
          <Search className="h-3 w-3 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Filter tabs / codes..."
            className="w-full bg-transparent outline-none text-[11px] font-mono placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              aria-label="Clear filter"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onTogglePyramidLayers}
          title="Toggle between Workspace Sections and full L0–L7 Pyramid view"
          className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
            showAllPyramidLayers
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-300'
              : isLight
              ? 'bg-white hover:bg-neutral-100 border-neutral-200/90 text-neutral-500'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
          }`}
        >
          <Layers className="h-3 w-3" />
          <span>L0–L7</span>
        </button>
      </div>

      {/* Global Accent Theme Selector */}
      <div className="pb-2.5 border-b border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          <Palette className="h-3 w-3" />
          <span>Visual Tone (Accent Theme)</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-neutral-200/50 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-300/40 dark:border-neutral-800">
          {ACCENT_OPTIONS.map((opt) => {
            const isSelected = accent === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setAccent(opt.key)}
                className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-white text-neutral-900 font-bold shadow-xs'
                      : 'bg-neutral-800 text-white font-bold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title={opt.label}
              >
                <span className={`h-2 w-2 rounded-full ${opt.dotClass} shrink-0`} />
                <span className="truncate">
                  {opt.key === 'amber'
                    ? 'warm orange'
                    : opt.key === 'neutral'
                    ? 'Neutral'
                    : 'Classic'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
