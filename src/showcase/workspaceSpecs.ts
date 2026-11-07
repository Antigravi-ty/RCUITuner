import {
  SURFACE_CALIBRATION_OVERRIDES,
  UI_APPROVAL_LEDGER,
} from '../ui-core/manifest/surfaceCalibration';
import type { ShowcaseTab } from './sidebarNavConfig';

export type TunerWorkspaceId = 'alpha' | 'bravo';

export type WorkspaceSectionId =
  | 'alpha-0'
  | 'alpha-1'
  | 'alpha-2'
  | 'alpha-3'
  | 'alpha-4'
  | 'bravo-1'
  | 'bravo-2'
  | 'bravo-3';

export interface TunerWorkspaceSpec {
  id: TunerWorkspaceId;
  code: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  defaultTab: ShowcaseTab;
  badgeColor: string;
}

export const WORKSPACE_SPECS: Record<TunerWorkspaceId, TunerWorkspaceSpec> = {
  alpha: {
    id: 'alpha',
    code: 'WORKSPACE ALPHA',
    shortLabel: 'Alpha · 母版与组件实验室',
    title: '底层母版与独立组件实验室',
    subtitle:
      'L0–L5 Tokens, Atomic Primitives, Universal 3-Stage Shells & In-Game HUD/Spatial Labs',
    defaultTab: 'panels',
    badgeColor:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  bravo: {
    id: 'bravo',
    code: 'WORKSPACE BRAVO',
    shortLabel: 'Bravo · 面板审批与精调流水线',
    title: '集成面板审批与精调流水线',
    subtitle:
      'L6–L7 Menu Recipes, Floating Windows, 3-Layer Semantic Approval & Calibration Overlay',
    defaultTab: 'recipes',
    badgeColor:
      'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
};

export interface WorkspaceSectionMeta {
  id: WorkspaceSectionId;
  workspace: TunerWorkspaceId;
  code: string;
  title: string;
  rule: string;
  badgeColor: string;
}

export const WORKSPACE_SECTIONS: Record<WorkspaceSectionId, WorkspaceSectionMeta> = {
  'alpha-0': {
    id: 'alpha-0',
    workspace: 'alpha',
    code: 'ALPHA-0',
    title: 'Architecture & Dependency Pyramid',
    rule: 'Unidirectional L0→L7 dependency contract & zero-barrel module addressing',
    badgeColor:
      'bg-neutral-500/15 text-neutral-600 dark:text-neutral-300 border-neutral-400/30',
  },
  'alpha-1': {
    id: 'alpha-1',
    workspace: 'alpha',
    code: 'ALPHA-1',
    title: 'Design Tokens & Foundations (L0)',
    rule: 'Static color, corner radius, spacing, easing & visual tone tokens',
    badgeColor:
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  'alpha-2': {
    id: 'alpha-2',
    workspace: 'alpha',
    code: 'ALPHA-2',
    title: 'Atomic Primitives & Compounds (L1/L3)',
    rule: 'UnderlineTabs, SliderControl, SettingActionRow, Dialogue & QuickNotification',
    badgeColor:
      'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  },
  'alpha-3': {
    id: 'alpha-3',
    workspace: 'alpha',
    code: 'ALPHA-3',
    title: 'Universal 3-Stage Shells & Motion (L2/L4)',
    rule: 'Menu & Floating 3-Stage Shell, PlayModeCard, Stacks & Morphing Transitions',
    badgeColor:
      'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  'alpha-4': {
    id: 'alpha-4',
    workspace: 'alpha',
    code: 'ALPHA-4',
    title: 'In-Game HUD & Spatial Projection (L5)',
    rule: '5A Match HUD · 5B Charts · 5C Safe Area · 5D Loading · 5E Alert · 5G Takeover · 5H NameTag',
    badgeColor:
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  'bravo-1': {
    id: 'bravo-1',
    workspace: 'bravo',
    code: 'BRAVO-1',
    title: 'Menu Recipes & State Matrix Stage (6A/7A)',
    rule: 'Store-First Menu Recipes, Multi-State Matrix Shootout & Full-Tree Sandbox',
    badgeColor:
      'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  'bravo-2': {
    id: 'bravo-2',
    workspace: 'bravo',
    code: 'BRAVO-2',
    title: 'Floating Windows & Flat Matrix Wall (6D)',
    rule: 'User & Dev Floating Windows, Sizing Calibration & Multi-Tab Matrix Audit',
    badgeColor:
      'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  'bravo-3': {
    id: 'bravo-3',
    workspace: 'bravo',
    code: 'BRAVO-3',
    title: 'Dock, Edge Inspector & Stress Suites (6C/6E/7B)',
    rule: 'Live Preview Dock, Edge Inspector Drawer & Concurrent Notification Regression',
    badgeColor:
      'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
};

export interface ApprovalLedgerSummary {
  totalSurfaces: number;
  menuRecipeCount: number;
  floatingWindowCount: number;
  approvedCount: number;
  pendingOrDriftCount: number;
  calibratedCount: number;
  templateHash: string;
}

export function getApprovalLedgerSummary(): ApprovalLedgerSummary {
  const surfaces = Object.values(UI_APPROVAL_LEDGER.surfaces ?? {});
  let menuRecipeCount = 0;
  let floatingWindowCount = 0;
  let approvedCount = 0;

  for (const rec of surfaces) {
    if (rec.surfaceKind === 'floating-window') floatingWindowCount += 1;
    else menuRecipeCount += 1;

    if (
      rec.status === 'approved' &&
      rec.templateHash === UI_APPROVAL_LEDGER.templateHash
    ) {
      approvedCount += 1;
    }
  }

  return {
    totalSurfaces: surfaces.length,
    menuRecipeCount,
    floatingWindowCount,
    approvedCount,
    pendingOrDriftCount: Math.max(0, surfaces.length - approvedCount),
    calibratedCount: Object.keys(SURFACE_CALIBRATION_OVERRIDES ?? {}).length,
    templateHash: UI_APPROVAL_LEDGER.templateHash || 'n/a',
  };
}

export function syncWorkspaceUrlParam(workspace: TunerWorkspaceId): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('workspace') !== workspace) {
      url.searchParams.set('workspace', workspace);
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  } catch {
    // ignore history errors
  }
}
