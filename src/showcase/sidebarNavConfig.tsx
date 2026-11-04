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

export type ShowcaseTab =
  // L0. Foundations (foundation and variables)
  | 'overview'
  | 'foundations'
  // L1. Primitives (Atomic base primitives)
  | 'badges'
  | 'tabs'
  // L2. Layout & Shells (Layout and Skeleton)
  | 'stacks'
  | 'cards'
  | 'play-cards'
  | 'panels'
  // L3. Compounds (Composite interaction control)
  | 'composable-nesting'
  | 'dialogue'
  | 'quick-notification'
  // L4. Motion (Animation and transition engine)
  | 'animation'
  | 'navigation'
  // L5. Specials (Game and telemetry exclusive)
  | 'hud-elements'
  | 'center-upper-info'
  | 'takeover'
  | 'temporal-overlay'
  | 'charts-curves'
  | 'viewport-safe-area'
  | 'loading-preview'
  | 'name-tag-tuner'
  // L6. Patterns (Scene templates and reference recipes)
  | 'recipes'
  | 'live-preview'
  | 'edge-inspector'
  | 'floating-windows'
  // L7. Sandboxes (Integrated drill and sandbox)
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
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  // L0. Foundations
  {
    id: 'overview',
    label: 'Architecture overview and unidirectional dependency pyramid',
    icon: <BookOpen className="h-4 w-4 text-amber-500" />,
    layer: 'L0',
  },
  {
    id: 'foundations',
    label: 'Tokens color/corner radius/spacing/Easing',
    icon: <Coins className="h-4 w-4" />,
    layer: 'L0',
  },

  // L1. Primitives
  {
    id: 'badges',
    label: 'Badge / Keycap / Button',
    icon: <Tag className="h-4 w-4" />,
    layer: 'L1',
  },
  {
    id: 'tabs',
    label: 'Tabs / Switch / Slider Step',
    icon: <Sliders className="h-4 w-4" />,
    layer: 'L1',
  },

  // L2. Layout & Shells
  {
    id: 'stacks',
    label: 'Stack & HudAnchorStage Space',
    icon: <Layers className="h-4 w-4" />,
    layer: 'L2',
  },
  {
    id: 'cards',
    label: 'Card & SelectableCard',
    icon: <Square className="h-4 w-4" />,
    layer: 'L2',
  },
  {
    id: 'play-cards',
    label: '2B · PlayCard Three mode card styles',
    icon: <Square className="h-4 w-4 text-amber-500" />,
    layer: 'L2',
  },
  {
    id: 'panels',
    label: 'Panel (3-Stage Compound)',
    icon: <LayoutTemplate className="h-4 w-4" />,
    layer: 'L2',
  },

  // L3. Compounds
  {
    id: 'composable-nesting',
    label: 'Dropdown & Tuner Tuning Controls',
    icon: <Boxes className="h-4 w-4 text-amber-500" />,
    layer: 'L3',
  },
  {
    id: 'dialogue',
    label: 'Dialogue Zero-mask relief popup',
    icon: <MessageSquare className="h-4 w-4 text-amber-500" />,
    layer: 'L3',
  },
  {
    id: 'quick-notification',
    label: 'Quick Notification Quick Notification',
    icon: <BellDot className="h-4 w-4 text-amber-500" />,
    layer: 'L3',
  },

  // L4. Motion
  {
    id: 'animation',
    label: 'MorphContainer & HIG animation',
    icon: <Activity className="h-4 w-4 text-purple-500" />,
    layer: 'L4',
  },
  {
    id: 'navigation',
    label: 'MorphingShell & Route Transition',
    icon: <Compass className="h-4 w-4" />,
    layer: 'L4',
  },

  // L5. Specials (5A / T5A / 5B / 5C / 5D / 5E)
  {
    id: 'hud-elements',
    label: '5A · Match HUD Independent Gauge',
    icon: <Crosshair className="h-4 w-4 text-red-500" />,
    layer: 'L5',
  },
  {
    id: 'temporal-overlay',
    label: 'T5A · Temporal Archive (Replay & Hourglass)',
    icon: <Activity className="h-4 w-4 text-rose-500" />,
    layer: 'L5',
  },
  {
    id: 'charts-curves',
    label: '5B · High-Clarity Telemetry Chart',
    icon: <LineChart className="h-4 w-4 text-emerald-500" />,
    layer: 'L5',
  },
  {
    id: 'viewport-safe-area',
    label: '5C · Viewport & Safe Area',
    icon: <Monitor className="h-4 w-4 text-amber-500" />,
    layer: 'L5',
  },
  {
    id: 'loading-preview',
    label: '5D · Loading Two-layer progress pipeline',
    icon: <Loader2 className="h-4 w-4 text-sky-500" />,
    layer: 'L5',
  },
  {
    id: 'center-upper-info',
    label: '5E · Center-Upper Alert Message',
    icon: <Megaphone className="h-4 w-4 text-amber-500" />,
    layer: 'L5',
  },
  {
    id: 'takeover',
    label: '5G · Takeover Handoff & Vignette',
    icon: <Crosshair className="h-4 w-4 text-emerald-500" />,
    layer: 'L5',
  },
  {
    id: 'name-tag-tuner',
    label: '5H · Multiplayer Name Tag & Boost',
    icon: <Tag className="h-4 w-4 text-teal-400" />,
    layer: 'L5',
  },

  // L6. Patterns & Recipes
  {
    id: 'recipes',
    label: '6A · Layer 1-2-3 Menu Code Map',
    icon: <FileCode2 className="h-4 w-4 text-sky-500" />,
    layer: 'L6',
  },
  {
    id: 'live-preview',
    label: '6C · Live Preview Sidebar Storage',
    icon: <Eye className="h-4 w-4 text-amber-500" />,
    layer: 'L6',
  },
  {
    id: 'floating-windows',
    label: '6D · Floating Window orchestration',
    icon: <AppWindow className="h-4 w-4 text-amber-500" />,
    layer: 'L6',
  },
  {
    id: 'edge-inspector',
    label: '6E · Edge Inspector Side Inspector',
    icon: <PanelRightClose className="h-4 w-4 text-amber-500" />,
    layer: 'L6',
  },

  // L7. Sandboxes & Integration Demos
  {
    id: 'layer-preview',
    label: '7A · Menu Layer full-link sandbox',
    icon: <Layers className="h-4 w-4 text-rose-500" />,
    layer: 'L7',
  },
  {
    id: 'notification-integration',
    label: '7B · Notification Concurrent Integration Test',
    icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
    layer: 'L7',
  },
];
