import React from 'react';
import {
  BookOpen,
  Tag,
  Sliders,
  Layers,
  Square,
  LayoutTemplate,
  Compass,
  FileCode2,
  Activity,
  Eye,
  AppWindow,
  Loader2,
  Crosshair,
  MessageSquare,
  BellDot,
  ShieldCheck,
  LineChart,
  Boxes,
  Monitor,
  Coins,
  PanelRightClose,
  Megaphone,
} from 'lucide-react';
import {
  WORKSPACE_SECTIONS,
  WORKSPACE_SPECS,
  getApprovalLedgerSummary,
  syncWorkspaceUrlParam,
  type ApprovalLedgerSummary,
  type TunerWorkspaceId,
  type TunerWorkspaceSpec,
  type WorkspaceSectionId,
  type WorkspaceSectionMeta,
} from './workspaceSpecs';

export {
  WORKSPACE_SECTIONS,
  WORKSPACE_SPECS,
  getApprovalLedgerSummary,
  syncWorkspaceUrlParam,
  type ApprovalLedgerSummary,
  type TunerWorkspaceId,
  type TunerWorkspaceSpec,
  type WorkspaceSectionId,
  type WorkspaceSectionMeta,
};

export type ShowcaseTab =
  | 'overview'
  | 'foundations'
  | 'badges'
  | 'tabs'
  | 'stacks'
  | 'cards'
  | 'play-cards'
  | 'panels'
  | 'composable-nesting'
  | 'dialogue'
  | 'quick-notification'
  | 'animation'
  | 'navigation'
  | 'hud-elements'
  | 'center-upper-info'
  | 'takeover'
  | 'temporal-overlay'
  | 'charts-curves'
  | 'viewport-safe-area'
  | 'loading-preview'
  | 'name-tag-tuner'
  | 'recipes'
  | 'live-preview'
  | 'edge-inspector'
  | 'floating-windows'
  | 'layer-preview'
  | 'notification-integration';

export interface SidebarLayerMeta {
  code: string;
  title: string;
  rule: string;
  badgeColor: string;
}

export const PYRAMID_LAYERS: Record<string, SidebarLayerMeta> = {
  L0: {
    code: 'L0',
    title: 'Foundations foundation and variables',
    rule: 'Static Constants and Token · zero JSX',
    badgeColor: 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-300 border-neutral-400/30',
  },
  L1: {
    code: 'L1',
    title: 'Primitives Atomic base primitives',
    rule: 'Minimalist display only · pure Props driver',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  L2: {
    code: 'L2',
    title: 'Layout & Shells Layout and Skeleton',
    rule: 'Pure space container and optical padding · No Complex Interaction',
    badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  },
  L3: {
    code: 'L3',
    title: 'Compounds Composite interaction control',
    rule: 'Self-consistent primitive assembly · No business context lock',
    badgeColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  },
  L4: {
    code: 'L4',
    title: 'Motion Animation and transition engine',
    rule: 'Container Morph, Three-stage sequencer and modal shell',
    badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  },
  L5: {
    code: 'L5',
    title: 'Specials Game and telemetry exclusive',
    rule: '5A HUD · 5B Chart · 5C Viewport · 5D Loading · 5E Critical Alert · 5F State Flow · 5G Takeover · 5H Name Tag',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  L6: {
    code: 'L6',
    title: 'Patterns Scene templates and recipes',
    rule: 'Reusable menu tree, Sidebar Storage, Floating window and code map',
    badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  L7: {
    code: 'L7',
    title: 'Sandboxes Integrated Sandbox',
    rule: 'High-level cross-module permutation simulation and concurrent integration testing',
    badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
};

export interface SidebarNavItem {
  id: ShowcaseTab;
  label: string;
  icon: React.ReactNode;
  layer: keyof typeof PYRAMID_LAYERS;
  workspace: TunerWorkspaceId;
  workspaceSection: WorkspaceSectionId;
  badgeText?: string;
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { id: 'overview', label: 'Architecture overview and unidirectional dependency pyramid', icon: <BookOpen className="h-4 w-4 text-amber-500" />, layer: 'L0', workspace: 'alpha', workspaceSection: 'alpha-0', badgeText: 'L0–L7' },
  { id: 'foundations', label: 'Tokens color/corner radius/spacing/Easing', icon: <Coins className="h-4 w-4" />, layer: 'L0', workspace: 'alpha', workspaceSection: 'alpha-1', badgeText: 'Tokens' },
  { id: 'badges', label: 'Badge / Keycap / Button', icon: <Tag className="h-4 w-4" />, layer: 'L1', workspace: 'alpha', workspaceSection: 'alpha-2' },
  { id: 'tabs', label: 'Tabs / Switch / Slider Step', icon: <Sliders className="h-4 w-4" />, layer: 'L1', workspace: 'alpha', workspaceSection: 'alpha-2' },
  { id: 'composable-nesting', label: 'Dropdown & Tuner Tuning Controls', icon: <Boxes className="h-4 w-4 text-amber-500" />, layer: 'L3', workspace: 'alpha', workspaceSection: 'alpha-2' },
  { id: 'dialogue', label: 'Dialogue Zero-mask relief popup', icon: <MessageSquare className="h-4 w-4 text-amber-500" />, layer: 'L3', workspace: 'alpha', workspaceSection: 'alpha-2' },
  { id: 'quick-notification', label: 'Quick Notification Quick Notification', icon: <BellDot className="h-4 w-4 text-amber-500" />, layer: 'L3', workspace: 'alpha', workspaceSection: 'alpha-2' },
  { id: 'panels', label: 'Panel (3-Stage Universal Shell)', icon: <LayoutTemplate className="h-4 w-4 text-indigo-500" />, layer: 'L2', workspace: 'alpha', workspaceSection: 'alpha-3', badgeText: '3-Stage' },
  { id: 'cards', label: 'Card & SelectableCard', icon: <Square className="h-4 w-4" />, layer: 'L2', workspace: 'alpha', workspaceSection: 'alpha-3' },
  { id: 'play-cards', label: '2B · PlayCard Three mode card styles', icon: <Square className="h-4 w-4 text-amber-500" />, layer: 'L2', workspace: 'alpha', workspaceSection: 'alpha-3', badgeText: '2B' },
  { id: 'stacks', label: 'Stack & HudAnchorStage Space', icon: <Layers className="h-4 w-4" />, layer: 'L2', workspace: 'alpha', workspaceSection: 'alpha-3' },
  { id: 'animation', label: 'MorphContainer & HIG animation', icon: <Activity className="h-4 w-4 text-purple-500" />, layer: 'L4', workspace: 'alpha', workspaceSection: 'alpha-3' },
  { id: 'navigation', label: 'MorphingShell & Route Transition', icon: <Compass className="h-4 w-4" />, layer: 'L4', workspace: 'alpha', workspaceSection: 'alpha-3' },
  { id: 'hud-elements', label: '5A · Match HUD Independent Gauge', icon: <Crosshair className="h-4 w-4 text-red-500" />, layer: 'L5', workspace: 'alpha', workspaceSection: 'alpha-4', badgeText: '5A' },
  { id: 'temporal-overlay', label: 'T5A · Temporal Archive (Replay & Hourglass)', icon: <Activity className="h-4 w-4 text-rose-500" />, layer: 'L5', workspace: 'alpha', workspaceSection: 'alpha-4', badgeText: 'T5A' },
  { id: 'charts-curves', label: '5B · High-Clarity Telemetry Chart', icon: <LineChart className="h-4 w-4 text-emerald-500" />, layer: 'L5', workspace: 'alpha', workspaceSection: 'alpha-4', badgeText: '5B' },
  { id: 'viewport-safe-area', label: '5C · Viewport & Safe Area', icon: <Monitor className="h-4 w-4 text-amber-500" />, layer: 'L5', workspace: 'alpha', workspaceSection: 'alpha-4', badgeText: '5C' },
  { id: 'loading-preview', label: '5D · Loading Two-layer progress pipeline', icon: <Loader2 className="h-4 w-4 text-sky-500" />, layer: 'L5', workspace: 'alpha', workspaceSection: 'alpha-4', badgeText: '5D' },
  { id: 'center-upper-info', label: '5E · Center-Upper Alert Message', icon: <Megaphone className="h-4 w-4 text-amber-500" />, layer: 'L5', workspace: 'alpha', workspaceSection: 'alpha-4', badgeText: '5E' },
  { id: 'takeover', label: '5G · Takeover Handoff & Vignette', icon: <Crosshair className="h-4 w-4 text-emerald-500" />, layer: 'L5', workspace: 'alpha', workspaceSection: 'alpha-4', badgeText: '5G' },
  { id: 'name-tag-tuner', label: '5H · Multiplayer Name Tag & Boost', icon: <Tag className="h-4 w-4 text-teal-400" />, layer: 'L5', workspace: 'alpha', workspaceSection: 'alpha-4', badgeText: '5H' },
  { id: 'recipes', label: '6A · Layer 1-2-3 Menu Code Map & Matrix', icon: <FileCode2 className="h-4 w-4 text-sky-500" />, layer: 'L6', workspace: 'bravo', workspaceSection: 'bravo-1', badgeText: '35 Surfaces' },
  { id: 'layer-preview', label: '7A · Menu Layer full-link sandbox', icon: <Layers className="h-4 w-4 text-rose-500" />, layer: 'L7', workspace: 'bravo', workspaceSection: 'bravo-1', badgeText: 'Live Tree' },
  { id: 'floating-windows', label: '6D · Floating Window orchestration & Wall', icon: <AppWindow className="h-4 w-4 text-amber-500" />, layer: 'L6', workspace: 'bravo', workspaceSection: 'bravo-2', badgeText: '29 Windows' },
  { id: 'live-preview', label: '6C · Live Preview Sidebar Storage', icon: <Eye className="h-4 w-4 text-amber-500" />, layer: 'L6', workspace: 'bravo', workspaceSection: 'bravo-3', badgeText: '6C' },
  { id: 'edge-inspector', label: '6E · Edge Inspector Side Inspector', icon: <PanelRightClose className="h-4 w-4 text-amber-500" />, layer: 'L6', workspace: 'bravo', workspaceSection: 'bravo-3', badgeText: '6E' },
  { id: 'notification-integration', label: '7B · Notification Concurrent Integration Test', icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, layer: 'L7', workspace: 'bravo', workspaceSection: 'bravo-3', badgeText: '7B' },
];

const TAB_TO_WORKSPACE_MAP: Record<ShowcaseTab, TunerWorkspaceId> = SIDEBAR_NAV_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item.workspace;
    return acc;
  },
  {} as Record<ShowcaseTab, TunerWorkspaceId>
);

export function isValidShowcaseTab(value: string | undefined | null): value is ShowcaseTab {
  if (!value) return false;
  return Object.prototype.hasOwnProperty.call(TAB_TO_WORKSPACE_MAP, value);
}

export function getWorkspaceForTab(tab: ShowcaseTab): TunerWorkspaceId {
  return TAB_TO_WORKSPACE_MAP[tab] ?? 'alpha';
}

export function getNavItemMeta(tab: ShowcaseTab): SidebarNavItem | undefined {
  return SIDEBAR_NAV_ITEMS.find((item) => item.id === tab);
}

export function readWorkspaceFromUrl(fallbackTab: ShowcaseTab): TunerWorkspaceId {
  if (typeof window === 'undefined') return getWorkspaceForTab(fallbackTab);
  try {
    const sp = new URLSearchParams(window.location.search);
    const rawWs = sp.get('workspace');
    if (rawWs === 'alpha' || rawWs === 'bravo') return rawWs;
  } catch {
    // ignore URL parse error
  }
  return getWorkspaceForTab(fallbackTab);
}
