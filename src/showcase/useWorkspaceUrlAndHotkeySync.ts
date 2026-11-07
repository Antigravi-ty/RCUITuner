import React, { useCallback, useEffect, useMemo } from 'react';
import {
  WORKSPACE_SECTIONS,
  WORKSPACE_SPECS,
  getApprovalLedgerSummary,
  syncWorkspaceUrlParam,
} from './workspaceSpecs';
import {
  getNavItemMeta,
  getWorkspaceForTab,
  isValidShowcaseTab,
  readWorkspaceFromUrl,
  type ShowcaseTab,
  type TunerWorkspaceId,
} from './sidebarNavConfig';
import { readUrlParams, updateUrlParams } from './stores/urlSync';
import { useSyncedState } from './stores/crossClientSync';
import type { JumpOriginRecord } from './SidebarWorkspaceHeader';

export function resolveInitialTabFromUrl(): ShowcaseTab {
  const rawTab = readUrlParams().tab;
  if (isValidShowcaseTab(rawTab)) return rawTab;
  const initialWs = readWorkspaceFromUrl('overview');
  return initialWs === 'bravo' ? WORKSPACE_SPECS.bravo.defaultTab : 'overview';
}

export function useWorkspaceUrlAndHotkeySync() {
  const initialUrlTab = resolveInitialTabFromUrl();
  const [activeTab, setActiveTab] = useSyncedState<ShowcaseTab>(
    'app:activeTab',
    initialUrlTab
  );
  const [isLight, setIsLight] = useSyncedState<boolean>('app:isLight', true);
  const [lastJumpOrigin, setLastJumpOrigin] = React.useState<JumpOriginRecord | null>(
    null
  );
  const [lastTabByWorkspace, setLastTabByWorkspace] = React.useState<
    Record<TunerWorkspaceId, ShowcaseTab>
  >(() => {
    const ws = getWorkspaceForTab(initialUrlTab);
    return {
      alpha: ws === 'alpha' ? initialUrlTab : WORKSPACE_SPECS.alpha.defaultTab,
      bravo: ws === 'bravo' ? initialUrlTab : WORKSPACE_SPECS.bravo.defaultTab,
    };
  });

  const activeWorkspace: TunerWorkspaceId = getWorkspaceForTab(activeTab);
  const activeNavMeta = useMemo(() => getNavItemMeta(activeTab), [activeTab]);
  const ledgerSummary = useMemo(() => getApprovalLedgerSummary(), []);
  const activeSectionMeta = activeNavMeta
    ? WORKSPACE_SECTIONS[activeNavMeta.workspaceSection]
    : undefined;

  const scrollToAnchorWithRetry = useCallback((targetId?: string) => {
    if (!targetId || typeof document === 'undefined') return;
    const cleanId = targetId.startsWith('#') ? targetId.slice(1) : targetId;
    if (!cleanId) return;
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(cleanId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      attempts += 1;
      if (attempts < 18) window.setTimeout(tryScroll, 80);
    };
    window.setTimeout(tryScroll, 60);
  }, []);

  useEffect(() => {
    updateUrlParams({ tab: activeTab });
    syncWorkspaceUrlParam(getWorkspaceForTab(activeTab));
    if (typeof window !== 'undefined' && window.location.hash) {
      scrollToAnchorWithRetry(window.location.hash);
    }
  }, []);

  useEffect(() => {
    const ws = getWorkspaceForTab(activeTab);
    setLastTabByWorkspace((prev) =>
      prev[ws] === activeTab ? prev : { ...prev, [ws]: activeTab }
    );
    if (readUrlParams().tab !== activeTab) {
      updateUrlParams({ tab: activeTab });
    }
    syncWorkspaceUrlParam(ws);
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const nextTab = resolveInitialTabFromUrl();
      setActiveTab(nextTab);
      if (window.location.hash) scrollToAnchorWithRetry(window.location.hash);
      setLastJumpOrigin((prev) => (prev && prev.fromTab === nextTab ? null : prev));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab, scrollToAnchorWithRetry]);

  const handleSelectTab = useCallback(
    (nextTab: ShowcaseTab) => {
      const nextWs = getWorkspaceForTab(nextTab);
      setLastTabByWorkspace((prev) => ({ ...prev, [nextWs]: nextTab }));
      updateUrlParams({ tab: nextTab }, { push: true, hash: null });
      syncWorkspaceUrlParam(nextWs);
      setActiveTab(nextTab);
    },
    [setActiveTab]
  );

  const handleSelectWorkspace = useCallback(
    (nextWorkspace: TunerWorkspaceId) => {
      if (nextWorkspace === activeWorkspace) return;
      const targetTab =
        lastTabByWorkspace[nextWorkspace] ?? WORKSPACE_SPECS[nextWorkspace].defaultTab;
      updateUrlParams({ tab: targetTab }, { push: true, hash: null });
      syncWorkspaceUrlParam(nextWorkspace);
      setActiveTab(targetTab);
    },
    [activeWorkspace, lastTabByWorkspace, setActiveTab]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === '1') {
        e.preventDefault();
        handleSelectWorkspace('alpha');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSelectWorkspace('bravo');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectWorkspace]);

  const handleNavigateShowcase = useCallback(
    (tab: ShowcaseTab, targetId?: string) => {
      if (typeof window !== 'undefined') {
        const p = readUrlParams();
        const routeDesc =
          activeTab === 'layer-preview'
            ? `7A Menu Layer (${p.route || 'main-menu'}${
                p.subtab ? ` · ${p.subtab}` : ''
              })`
            : activeTab;
        setLastJumpOrigin({
          fromTab: activeTab,
          fromHref: `${window.location.pathname}${window.location.search}${window.location.hash}`,
          fromDesc: routeDesc,
          toTab: tab,
          targetId,
        });
      }
      const targetWs = getWorkspaceForTab(tab);
      setLastTabByWorkspace((prev) => ({ ...prev, [targetWs]: tab }));
      updateUrlParams(
        { tab, ...(tab === 'recipes' && targetId ? { recipe: targetId } : {}) },
        { push: true, hash: targetId ?? null }
      );
      syncWorkspaceUrlParam(targetWs);
      setActiveTab(tab);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
      scrollToAnchorWithRetry(targetId);
    },
    [activeTab, setActiveTab, scrollToAnchorWithRetry]
  );

  const handleReturnToJumpOrigin = useCallback(() => {
    if (!lastJumpOrigin) return;
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(window.history.state, '', lastJumpOrigin.fromHref);
      } catch {
        // ignore
      }
    }
    setActiveTab(lastJumpOrigin.fromTab);
    setLastJumpOrigin(null);
  }, [lastJumpOrigin, setActiveTab]);

  const handleNavigateToSandboxPlay = useCallback(() => {
    updateUrlParams(
      { tab: 'layer-preview', tier: 'user', route: 'play' },
      { push: true, hash: 'rc-ui-tuner-preview-stage' }
    );
    syncWorkspaceUrlParam('bravo');
    setActiveTab('layer-preview');
  }, [setActiveTab]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
      document.documentElement.classList.toggle('light', isLight);
      document.documentElement.classList.toggle('dark', !isLight);
      document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
    }
  }, [isLight]);

  return {
    activeTab,
    isLight,
    setIsLight,
    lastJumpOrigin,
    setLastJumpOrigin,
    activeWorkspace,
    activeNavMeta,
    activeSectionMeta,
    ledgerSummary,
    handleSelectTab,
    handleSelectWorkspace,
    handleNavigateShowcase,
    handleReturnToJumpOrigin,
    handleNavigateToSandboxPlay,
  };
}
