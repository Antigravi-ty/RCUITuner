import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAccentStore } from './stores/themeStore';
import { AccentColor } from '../ui-core/tokens/colors';
import {
  PYRAMID_LAYERS,
  SIDEBAR_NAV_ITEMS,
  type ShowcaseTab,
  type SidebarLayerMeta,
} from './sidebarNavConfig';

export interface SidebarProps {
  activeTab: ShowcaseTab;
  onSelectTab: (tab: ShowcaseTab) => void;
  isLight: boolean;
  onToggleTheme: () => void;
  /** Optional controlled collapsed state (defaults to per-window local state so observation devices can collapse independently) */
  collapsed?: boolean;
  /** Optional callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
}

const SIDEBAR_COLLAPSED_SESSION_KEY = 'rc-ui-tuner:sidebar-collapsed';

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isLight,
  onToggleTheme,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const { accent, tokens, setAccent } = useAccentStore();

  // Per-window/per-device local collapse state (intentionally NOT synced via crossClientSync
  // so an observation device can collapse the sidebar while a tuning device keeps it open)
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      return (
        typeof sessionStorage !== 'undefined' &&
        sessionStorage.getItem(SIDEBAR_COLLAPSED_SESSION_KEY) === '1'
      );
    } catch {
      return false;
    }
  });

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const setCollapsed = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof next === 'function' ? next(isCollapsed) : next;
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(resolved);
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SIDEBAR_COLLAPSED_SESSION_KEY, resolved ? '1' : '0');
          }
        } catch {
          // ignore storage errors
        }
      }
      onCollapsedChange?.(resolved);
    },
    [controlledCollapsed, isCollapsed, onCollapsedChange]
  );

  // Keyboard shortcut: Cmd+B / Ctrl+B toggles sidebar collapse on current device
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCollapsed]);

  const layerKeys = Object.keys(PYRAMID_LAYERS) as (keyof typeof PYRAMID_LAYERS)[];

  const accentOptions: { key: AccentColor; label: string; dotClass: string }[] = [
    { key: 'amber', label: 'warm orange', dotClass: 'bg-amber-500' },
    { key: 'neutral', label: 'Neutral Monochrome (default)', dotClass: 'bg-neutral-900 dark:bg-neutral-100' },
    { key: 'sky', label: 'Classic Blue', dotClass: 'bg-sky-500' },
  ];

  return (
    <>
      {isCollapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand side navigation (Expand Sidebar · Current Window Only/Device Active [⌘B / Ctrl+B])"
          aria-label="Expand Sidebar"
          className={`absolute left-0 top-3 z-30 flex items-center gap-1.5 pl-2 pr-2.5 py-2 rounded-r-xl border border-l-0 text-xs font-mono font-medium shadow-md backdrop-blur transition-all cursor-pointer ${
            isLight
              ? 'bg-white/95 hover:bg-neutral-100 border-neutral-300 text-neutral-700 hover:text-neutral-950'
              : 'bg-neutral-900/95 hover:bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
          }`}
        >
          <PanelLeftOpen className="h-4 w-4 shrink-0" />
        </button>
      )}

      <aside
        aria-hidden={isCollapsed}
        className={`${
          isCollapsed
            ? 'w-0 border-r-0 opacity-0 pointer-events-none'
            : 'w-68 border-r opacity-100'
        } shrink-0 overflow-hidden flex flex-col justify-between transition-all duration-200 ease-out ${
          isLight
            ? 'bg-[#fbfbfd] border-neutral-200/80 text-neutral-800'
            : 'bg-neutral-950/80 border-neutral-800 text-neutral-200'
        }`}
      >
        <div className="w-68 flex flex-col p-4 overflow-y-auto flex-1 min-h-0">
          {/* Brand header + Local Collapse Button */}
          <div
            className={`flex items-center justify-between gap-2 pb-4 mb-4 border-b transition-colors ${
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
                <span className="font-bold text-sm tracking-tight truncate">RCUITuner</span>
                <span
                  className={`text-[10px] font-mono truncate ${
                    isLight ? 'text-neutral-500' : 'text-neutral-400'
                  }`}
                >
                  L0–L7 Pyramid v2.0
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Collapse side navigation · Current Window Only/Device Active, Suitable for full-screen spectator view (⌘B / Ctrl+B)"
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

          {/* Global Accent Theme Selector */}
          <div className="mb-4 pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <Palette className="h-3 w-3" />
              <span>Visual Tone (Accent Theme)</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-neutral-200/50 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-300/40 dark:border-neutral-800">
              {accentOptions.map((opt) => {
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
                      {opt.key === 'amber' ? 'warm orange' : opt.key === 'neutral' ? 'Neutral' : 'Classic'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* L0 – L7 Pyramid Navigation Categories */}
          <div className="flex flex-col gap-4">
            {layerKeys.map((layerKey) => {
              const meta = PYRAMID_LAYERS[layerKey];
              const items = SIDEBAR_NAV_ITEMS.filter((item) => item.layer === layerKey);
              return (
                <div key={layerKey} className="flex flex-col gap-1">
                  <div className="px-2 mb-0.5 flex items-center gap-1.5" title={meta.rule}>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold border ${meta.badgeColor}`}
                    >
                      {meta.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold tracking-tight truncate ${
                        isLight ? 'text-neutral-600' : 'text-neutral-300'
                      }`}
                    >
                      {meta.title}
                    </span>
                  </div>
                  {items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTab(item.id)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer outline-none ${
                          isActive
                            ? isLight
                              ? tokens.activeItemLight
                              : tokens.activeItemDark
                            : isLight
                            ? 'text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900'
                            : 'text-neutral-400 hover:bg-neutral-900/80 hover:text-neutral-200'
                        }`}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme Switcher Bottom Bar */}
        <div
          className={`w-68 p-4 border-t flex items-center justify-between transition-colors ${
            isLight ? 'border-neutral-200/80 bg-neutral-100/40' : 'border-neutral-800/60'
          }`}
        >
          <span className={`text-xs font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Dark / Light
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800 shadow-2xs'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
            }`}
          >
            {isLight ? (
              <Sun className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-neutral-300" />
            )}
            <span>{isLight ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
