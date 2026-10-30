import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Code2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { CodeBlock } from '../CodeBlock';
import { Badge } from '../../ui-core/primitives/Badge';
import { Button } from '../../ui-core/primitives/Button';
import { useMenuLayoutStore } from '../../ui-core/stores/menuLayoutStore';
import { readUrlParams, updateUrlParams } from '../stores/urlSync';
import { useQuickNotificationStore } from '../../ui-core/stores/quickNotificationStore';
import { dispatchOnlineRoomErrorNotification } from '../../ui-core/recipes/Layer3OnlineWarmupRecipe';
import { PageJumpDirectory, type JumpDirectoryItem } from '../PageJumpDirectory';
import {
  RECIPES_JUMP_ITEMS,
  RECIPES_CATEGORIES,
} from './recipes/LocalPanelSizingTuner';
import {
  OnDemandRecipeStage,
  resolveActiveRecipeFromUrl,
  getRelatedRecipeItems,
} from './recipes/recipeRegistry';

export const RecipesPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const {
    simulateLayer3Error,
    setToken,
    resetTokens,
    exportConfigCode,
  } = useMenuLayoutStore();

  const [copiedConfig, setCopiedConfig] = useState(false);
  const [showExportBlock, setShowExportBlock] = useState(false);

  // Default to 'single' (on-demand single-module mounting: "Generate on click") to eliminate DOM bloat and scroll lag
  const [renderMode, setRenderMode] = useState<'single' | 'all'>('single');

  const [activeRecipeId, setActiveRecipeId] = useState<string>(() => {
    return resolveActiveRecipeFromUrl().itemId;
  });

  const scrollSubAnchorIntoView = useCallback((anchorId?: string) => {
    if (!anchorId || typeof document === 'undefined') return;
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 12) {
        window.setTimeout(tryScroll, 60);
      }
    };
    window.setTimeout(tryScroll, 40);
  }, []);

  // Sync active recipe when URL hash or history changes (e.g. jumping from 7A or Browser Back/Forward)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncFromLocation = () => {
      const resolved = resolveActiveRecipeFromUrl(readUrlParams(), window.location.hash);
      setActiveRecipeId(resolved.itemId);
      if (resolved.subAnchorId) {
        scrollSubAnchorIntoView(resolved.subAnchorId);
      }
    };
    // Initial check for sub-anchors on mount (e.g., #setting-preset-custom-tuner)
    const initial = resolveActiveRecipeFromUrl(readUrlParams(), window.location.hash);
    if (initial.subAnchorId) {
      scrollSubAnchorIntoView(initial.subAnchorId);
    }

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, [scrollSubAnchorIntoView]);

  const handleSelectRecipeId = useCallback(
    (nextId: string, scrollStage: boolean = false) => {
      setActiveRecipeId(nextId);
      updateUrlParams(
        { tab: 'recipes', recipe: nextId },
        { push: true, hash: nextId }
      );
      if (nextId === 'setting-telemetry-summary-tuner') {
        scrollSubAnchorIntoView('setting-telemetry-summary-tuner');
      } else if (scrollStage && typeof document !== 'undefined') {
        window.setTimeout(() => {
          const stageEl = document.getElementById('recipes-active-workbench-bar');
          if (stageEl) {
            stageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 30);
      }
    },
    [scrollSubAnchorIntoView]
  );

  const handleDirectorySelect = useCallback(
    (item: JumpDirectoryItem) => {
      const targetId = item.targetId || item.id || 'recipe-6a-1-main';
      handleSelectRecipeId(targetId, renderMode === 'single');
      if (renderMode === 'all' && typeof document !== 'undefined') {
        window.setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 40);
      }
    },
    [handleSelectRecipeId, renderMode]
  );

  const handleCopyConfig = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
  };

  const handleToggleLayer3Error = useCallback(
    (enabled: boolean) => {
      setToken('simulateLayer3Error', enabled);
      if (enabled) {
        dispatchOnlineRoomErrorNotification();
        const st = useQuickNotificationStore.getState();
        if (st.activeNotification) {
          st.collapseActive();
        }
        st.setStackOpen(false);
      }
    },
    [setToken]
  );

  const activeIndex = useMemo(() => {
    const idx = RECIPES_JUMP_ITEMS.findIndex(
      (it) => (it.id || it.targetId) === activeRecipeId
    );
    return idx >= 0 ? idx : 0;
  }, [activeRecipeId]);

  const activeItem = RECIPES_JUMP_ITEMS[activeIndex] ?? RECIPES_JUMP_ITEMS[0];
  const prevItem =
    RECIPES_JUMP_ITEMS[
      (activeIndex - 1 + RECIPES_JUMP_ITEMS.length) % RECIPES_JUMP_ITEMS.length
    ];
  const nextItem =
    RECIPES_JUMP_ITEMS[(activeIndex + 1) % RECIPES_JUMP_ITEMS.length];

  const relatedItems = useMemo(
    () => getRelatedRecipeItems(activeRecipeId),
    [activeRecipeId]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (renderMode !== 'single') return;
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
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSelectRecipeId(prevItem.id || prevItem.targetId || 'recipe-6a-1-main');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSelectRecipeId(nextItem.id || nextItem.targetId || 'recipe-6a-1-main');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [renderMode, prevItem, nextItem, handleSelectRecipeId]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      {/* Top Header & Global Export Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">
                6A · Layer 1-2-3 Menu code spectrum and nearby parameter tuner
              </h1>
              <Badge variant="primary" size="sm" isLight={isLight}>
                L0 → L6 → L7 Real-time Sync
              </Badge>
              <Badge variant="amber" size="sm" isLight={isLight}>
                [Boost] On-demand generation mode (Click-to-Mount)
              </Badge>
            </div>
            <p
              className={`text-xs mt-1.5 leading-relaxed ${
                isLight ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              Uses <strong>"Generate on top-level click + Low-coupling independent panel mounting"</strong>Architecture: No need to split left navigation, Click any menu code in the directory above (<code className="font-mono">6A.1</code>–<code className="font-mono">6A.23</code>) , 
              <strong>Renders and displays only the currently selected module</strong>, Eliminate completely 31 Mouse scrolling lag and navigation difficulty caused by mounting multiple panels on one screen; All parameters synced to <strong>7A full-link sandbox</strong>. 
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={<Code2 className="h-3.5 w-3.5" />}
              onClick={() => setShowExportBlock((prev) => !prev)}
            >
              {showExportBlock ? 'Hide hardcoded code' : 'View hardcoded code'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              isLight={isLight}
              icon={copiedConfig ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={handleCopyConfig}
            >
              {copiedConfig ? 'config copied!' : 'Export / Copy all configs'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isLight={isLight}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={resetTokens}
            >
              Reset all defaults
            </Button>
          </div>
        </div>

        {showExportBlock && (
          <CodeBlock
            isLight={isLight}
            title="src/tokens/menuLayoutStore.ts (Export all panel dimensions and layout configuration)"
            code={exportConfigCode()}
          />
        )}

        {/* Top Categorized & Searchable On-Demand Selector Directory */}
        <PageJumpDirectory
          title="6A · Menu recipe generator and categorized search directory (Click-to-Mount Recipe Selector)"
          subtitle="Click any card to mount its specific menu and tuner independently (Isolated change tracking, Zero redundancy DOM Consumption) "
          items={RECIPES_JUMP_ITEMS}
          activeId={activeRecipeId}
          preventDefaultJump={renderMode === 'single'}
          categories={RECIPES_CATEGORIES}
          searchable={true}
          collapsible={true}
          onSelect={handleDirectorySelect}
          isLight={isLight}
          headerExtra={
            <div className="inline-flex items-center rounded-lg border p-0.5 text-[11px] font-mono bg-white/80 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setRenderMode('single')}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                  renderMode === 'single'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="Generate on click: Mount only the currently selected 1 Menu modules, Smooth mouse scrolling"
              >
                <Zap className="h-3 w-3" />
                <span>On-demand single module ({1}/{RECIPES_JUMP_ITEMS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setRenderMode('all')}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                  renderMode === 'all'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
                title="Expand all 31 Modules in a single long list (High resource usage) "
              >
                <Layers className="h-3 w-3" />
                <span>Fully expanded ({RECIPES_JUMP_ITEMS.length})</span>
              </button>
            </div>
          }
        />
      </div>

      {/* Active Module Quick Switcher & Related Sibling Tuners Bar */}
      {renderMode === 'single' && (
        <div
          id="recipes-active-workbench-bar"
          className={`scroll-mt-4 p-3.5 rounded-2xl border flex flex-col gap-2.5 transition-colors ${
            isLight
              ? 'bg-amber-50/55 border-amber-200/90 shadow-2xs'
              : 'bg-neutral-900/85 border-amber-500/30 shadow-md'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-mono font-extrabold text-xs">
                {activeItem.code}
              </span>
              <span className="text-xs font-mono font-bold">
                {activeItem.name || activeItem.componentName}
              </span>
              <span
                className={`text-xs font-semibold ${
                  isLight ? 'text-neutral-700' : 'text-neutral-200'
                }`}
              >
                · {activeItem.label}
              </span>
              {activeItem.badge && (
                <Badge variant="neutral" size="sm" isLight={isLight}>
                  {activeItem.badge}
                </Badge>
              )}
              <span
                className={`text-[11px] font-mono ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                (Module {activeIndex + 1} / {RECIPES_JUMP_ITEMS.length} · Mounting independently)
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  handleSelectRecipeId(prevItem.id || prevItem.targetId || 'recipe-6a-1-main')
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                }`}
                title={`Switch to previous module: [${prevItem.code}] ${prevItem.label}`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous ({prevItem.code})</span>
              </button>

              <select
                aria-label="Quick switch 6A Menu recipe"
                value={activeRecipeId}
                onChange={(e) => handleSelectRecipeId(e.target.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border outline-none cursor-pointer ${
                  isLight
                    ? 'bg-white border-neutral-200 text-neutral-800 focus:border-amber-400'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-200 focus:border-amber-500'
                }`}
              >
                {RECIPES_JUMP_ITEMS.map((it) => {
                  const id = it.id || it.targetId || it.code;
                  return (
                    <option key={id} value={id}>
                      [{it.code}] {it.label} ({it.name || it.componentName})
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() =>
                  handleSelectRecipeId(nextItem.id || nextItem.targetId || 'recipe-6a-1-main')
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                }`}
                title={`Switch to next module: [${nextItem.code}] ${nextItem.label}`}
              >
                <span>Next ({nextItem.code})</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {relatedItems.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-amber-200/60 dark:border-neutral-800">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-mono ${
                  isLight ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                <ArrowRightLeft className="h-3 w-3 text-amber-500" />
                <span>One-click switching for grouped tuners:</span>
              </span>
              {relatedItems.map((rel) => {
                const relId = rel.id || rel.targetId || rel.code;
                return (
                  <button
                    key={relId}
                    type="button"
                    onClick={() => handleSelectRecipeId(relId)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono border cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-white hover:bg-amber-100/70 border-neutral-200/90 hover:border-amber-400 text-neutral-700'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 hover:border-amber-500/50 text-neutral-300'
                    }`}
                  >
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      [{rel.code}]
                    </span>
                    <span>{rel.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Stage Area: Single On-Demand Module (Default) vs All Modules */}
      {renderMode === 'single' ? (
        <OnDemandRecipeStage
          itemId={activeRecipeId}
          isLight={isLight}
          simulateLayer3Error={simulateLayer3Error}
          onToggleLayer3Error={handleToggleLayer3Error}
          onSelectRecipeId={handleSelectRecipeId}
        />
      ) : (
        <div className="flex flex-col gap-12">
          {RECIPES_JUMP_ITEMS.map((item) => {
            const id = item.id || item.targetId || item.code;
            return (
              <OnDemandRecipeStage
                key={id}
                itemId={id}
                isLight={isLight}
                simulateLayer3Error={simulateLayer3Error}
                onToggleLayer3Error={handleToggleLayer3Error}
                onSelectRecipeId={handleSelectRecipeId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
