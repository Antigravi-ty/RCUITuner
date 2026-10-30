import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Box,
  Cpu,
  ShieldCheck,
  ArrowUpRight,
  GitBranch,
} from 'lucide-react';
import { CodeBlock } from '../CodeBlock';
import type { ShowcaseTab } from '../Sidebar';

export interface OverviewPageProps {
  isLight?: boolean;
  onSelectTab?: (tab: ShowcaseTab) => void;
}

interface PyramidRow {
  code: string;
  name: string;
  rule: string;
  importPath: string;
  badgeColor: string;
  modules: {
    label: string;
    tab: ShowcaseTab;
    items: string;
  }[];
}

const PYRAMID_SPEC: PyramidRow[] = [
  {
    code: 'L0. Foundation',
    name: 'Foundations (foundation and variables)',
    rule: 'Pure Static Constants, Type contract and theme Store, No Business Logic JSX, No Upper-level Dependencies (L1~L7) Dependency. ',
    importPath: 'src/tokens/*',
    badgeColor: 'bg-neutral-500/15 text-neutral-700 dark:text-neutral-300 border-neutral-400/40',
    modules: [
      {
        label: 'Tokens & Theme Store',
        tab: 'foundations',
        items: 'colors, radius, spacing, easing, themeStore, morphContext, syncBridge',
      },
    ],
  },
  {
    code: 'L1. Primitives',
    name: 'Primitives (Atomic base primitives)',
    rule: 'Minimalist presentation component. No business context, pure Props driver, Zero horizontal coupling, dependency only L0. ',
    importPath: 'src/primitives/*',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40',
    modules: [
      {
        label: 'Badge / Keycap / Button',
        tab: 'badges',
        items: 'Badge, KeycapBadge, Button (includes composable Universal nesting mode)',
      },
      {
        label: 'Tabs / Switch / Slider Step',
        tab: 'tabs',
        items: 'UnderlineTabs, SegmentedSwitch, ToggleSwitch, SliderControl (includes centered Bidirectional), DualGrabberSlider, PrecisionDigitPicker',
      },
    ],
  },
  {
    code: 'L2. Layout',
    name: 'Layout & Shells (Layout and Skeleton)',
    rule: 'Pure structural space container, Grid Layout Management, Card Encapsulation And 3-Stage Optical padding (px-6 pt-5 pb-4), Contains no complex business state, dependency only L0~L1. ',
    importPath: 'src/layout/*',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/40',
    modules: [
      {
        label: 'Stacks Grid Flow',
        tab: 'stacks',
        items: 'VStack, HStack, GridStack (Zero Coupling, Shared L0 StackGap Contract)',
      },
      {
        label: 'Card Card Container',
        tab: 'cards',
        items: 'Card, CardHeader, CardBody, CardFooter, SelectableCard',
      },
      {
        label: '2B · PlayCard Three mode card styles',
        tab: 'play-cards',
        items: 'PlayModeCard, MainMenuRow (Style 1 Icon+Badge+Title+Desc · Style 2 Icon+Title+Desc · Style 3 JetBrains Mono + Giant Watermark)',
      },
      {
        label: 'Panel & MenuContainer',
        tab: 'panels',
        items: 'PanelContainer, PanelHeader, PanelContent, PanelFooter (3-Stage Compound), MenuContainer (p-2 Buffering)',
      },
    ],
  },
  {
    code: 'L3. Compounds',
    name: 'Compound Controls (Composite interaction control)',
    rule: 'Self-contained universal interactive control assembled from primitives and layouts. With internal micro-states, No specific game business logic locked, dependency only L0~L2. ',
    importPath: 'src/compounds/*',
    badgeColor: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/40',
    modules: [
      {
        label: 'Dropdown & Tuner Composite Control',
        tab: 'composable-tuner',
        items: 'DropdownMenu, TunerControls, UVTransformControl, ColorSwatchInput, PriorityQueueList, EventFilterMatrix, CollapsibleNumberedRailList, SettingActionRow, MenuItem',
      },
      {
        label: 'Dialogue Modaless Popup',
        tab: 'dialogue',
        items: 'Dialogue, DialogueModal, DialogueStackContainer, dialogue.show',
      },
      {
        label: 'Quick Notification Drawer Notification',
        tab: 'quick-notification',
        items: 'QuickNotificationDrawer (Temporary / Persistent / Ongoing Tri-state Rendering)',
      },
    ],
  },
  {
    code: 'L4. Navigation',
    name: 'Navigation & Transitions (Navigation and motion engine)',
    rule: 'Focus on container geometry deformation, Three-stage state machine and modal focus shell. Any panel can be delegated for deformation, dependency only L0~L3. ',
    importPath: 'src/navigation/*',
    badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/40',
    modules: [
      {
        label: 'MorphContainer & HIG animation',
        tab: 'animation',
        items: 'MorphContainer, FluidMorphTransition (0.28s), SequencedStepTransition (100+150+100ms), UI_EASING',
      },
      {
        label: 'MorphingShell & Side storage shell',
        tab: 'navigation',
        items: 'MorphingShell, MorphingStageShell, LivePreviewDock, EdgeInspectorDrawer (TAB Zero-mask side drawer)',
      },
    ],
  },
  {
    code: 'L5. Specials',
    name: 'Game Specials (Game and telemetry exclusive)',
    rule: 'Professional visualization with strong domain semantics/Telemetry Unit. 5A/5B/5C/5D/5E/5F Six sub-domains are fully orthogonal, Independent, Keep Pure Props driver. ',
    importPath: 'src/hud/* | src/charts/* | src/viewport/* | src/loading/*',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
    modules: [
      {
        label: '5A · Match HUD Independent Gauge',
        tab: 'hud-elements',
        items: 'StepperScoreboardHUD, EdgePlayerHudStrip, BallCameraIndicator, VelocityProgressBar, CircularBoostGauge, CompactTelemetryBarHUD, FlipIndicatorPillHUD, ReplayControlBannerHUD, KickoffRhythmOverlayHUD, StaticTrainingPackHUD',
      },
      {
        label: '5B · High-Clarity Telemetry Chart',
        tab: 'charts-curves',
        items: 'TelemetrySparklineChart, EventImpulseScatterChart, ParametricTrajectoryChart, CubicBezierCurveEditor (0 External Dependency)',
      },
      {
        label: '5C · Viewport & Safe Area',
        tab: 'viewport-safe-area',
        items: 'GameViewport (18:9 Pillarbox & 1:1 Portrait Gate), SafeAreaHud (-5%~+10% Overscan), viewportStore',
      },
      {
        label: '5D · Loading Two-layer progress pipeline',
        tab: 'loading-preview',
        items: 'DualProgressBar (Global Step + Micro Step MB/s / Shimmer Wave + Circuit Breaker Alert), LoadingScreen',
      },
      {
        label: '5E · Center-Upper Alert Message',
        tab: 'center-upper-info',
        items: 'CenterUpperInfoHUD (HudAnchorStage upper-center · JetBrains Mono Thin 3-2-1-GO 750ms · Regular+Thin Winner · Out Glow)',
      },
      {
        label: '5F · Stats Event Status Event Stream',
        tab: 'stats-event-feed',
        items: 'StatsEventFeedHUD (Icon + Text + Capsule + Footnote · Crossbar / Bounce Single line solid / High-Five 2³=8 / Tactics 1:1 / Strategy 2²=4)',
      },
    ],
  },
  {
    code: 'L6. Patterns',
    name: 'Patterns & Recipes (Scene templates and reference recipes)',
    rule: 'By L0~L5 Complete reusable business panel recipe assembled from components (Recipes) With Window/Notification Orchestrator (Orchestrators), Copy and Use. ',
    importPath: 'src/recipes/* | src/panels/*',
    badgeColor: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/40',
    modules: [
      {
        label: '6A · Layer 1-2-3 Menu Code Map',
        tab: 'recipes',
        items: 'Layer1MainMenuRecipe, Layer2PlayRecipe, Layer2GarageRecipe, Layer2SettingsRecipe, Layer3KeybindingsRecipe, Layer3AudioEqRecipe',
      },
      {
        label: '6B · Post-Match Post-match Candidate List',
        tab: 'menus',
        items: 'Layer1MatchPostRecipe (420px), Layer2MatchStatsRecipe (580px)',
      },
      {
        label: '6C · Live Preview Sidebar Storage',
        tab: 'live-preview',
        items: 'LivePreviewDock, MorphingStageShell, Layer3BallTrajectoryRecipe, livePreviewStore',
      },
      {
        label: '6D · Floating Window Multi-window layout',
        tab: 'floating-windows',
        items: 'FloatingWindowManager, FloatingStackIcon, floatingStore, QuickNotificationSystem',
      },
      {
        label: '6D+ · Floating 3-Stage Variant Test',
        tab: 'floating-window-3stage',
        items: 'FloatingThreeStageWindowManager (L2 PanelHeader + PanelContent + PanelFooter + Carved Footer Resize Grip / Edge Resize)',
      },
      {
        label: '6E · Edge Inspector Side hover inspection',
        tab: 'edge-inspector',
        items: 'EdgeInspectorDrawer (Right/Left + Top/Bottom Offset + 0% Backdrop), Layer5StaticTrainingPackEditRecipe, StaticTrainingShotInspectorView',
      },
    ],
  },
  {
    code: 'L7. Sandboxes',
    name: 'Sandboxes & Demos (Integrated drill and sandbox)',
    rule: 'Top-level host simulation and stress testing field. Move L0~L6 Perform high-level permutations for panoramic preview and automated regression testing, Strictly prohibit reverse referencing of lower-level components L7. ',
    importPath: 'src/showcase/pages/*',
    badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/40',
    modules: [
      {
        label: '7A · Menu Layer full-link sandbox',
        tab: 'layer-preview',
        items: 'MenuLayerPreviewPage (Layer 0 Match ⇄ Layer 1-2-3 Menu Tree + Dual Animation + Side pill folding + Floating window tray sync)',
      },
      {
        label: '7C · Notification Concurrent Integration Test',
        tab: 'notification-integration',
        items: 'NotificationIntegrationPage (Persistent notification preemption recovery + Ongoing Yield + Multi-layer Dialogue 6 Large automation regression suite)',
      },
    ],
  },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({ isLight = true, onSelectTab }) => {
  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Hero header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>RLCleanWASM & UIStorybook · L0–L7 Precise pyramid architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Design Philosophy And L0–L7 Unidirectional dependency pyramid
        </h1>
        <p className={`text-base font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
          Strict Adherence"Unidirectional Dependency, point and act"· Binary Choice, Unambiguous
        </p>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          For RocketSim WASM / Three.js Game And Modern Web Apply tailored standardized component reference library. 
          Repository converged and upgraded to strictly follow unidirectional dependency flow (<code className="font-mono">L0 ← L1 ← L2 ← L3 ← L4 ← L5 ← L6 ← L7</code>) , Each module follows a deterministic eight-level pyramid architecture. 
        </p>
      </div>

      {/* Section 1: L0–L7 Pyramid Matrix */}
      <div
        className={`flex flex-col gap-5 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" />
            <span>Precise 8 Layer pyramid panoramic view (L0 Foundations → L7 Sandboxes)</span>
          </h2>
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            0 Circular Dependencies · 100% Unidirectional
          </span>
        </div>

        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          <strong>L0 ~ L6 Responsible for"Define standards and reusable recipes"</strong>, <strong>L7 Responsible for"High-order permutation and combination simulation and stress test"</strong>. 
          Click any module card below to jump directly to its corresponding specification or practice page: 
        </p>

        <div className="flex flex-col gap-3">
          {PYRAMID_SPEC.map((row) => (
            <div
              key={row.code}
              className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                isLight
                  ? 'bg-neutral-50/80 border-neutral-200/90 hover:border-neutral-300'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-mono font-extrabold border ${row.badgeColor}`}
                  >
                    {row.code}
                  </span>
                  <span className="font-bold text-sm">{row.name}</span>
                </div>
                <code
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    isLight ? 'bg-neutral-200/70 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {row.importPath}
                </code>
              </div>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                <strong>Positioning and access rules: </strong>
                {row.rule}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {row.modules.map((mod) => (
                  <button
                    key={mod.tab + mod.label}
                    type="button"
                    onClick={() => onSelectTab?.(mod.tab)}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer group ${
                      isLight
                        ? 'bg-white hover:bg-amber-50/40 border-neutral-200/90 hover:border-amber-400/70'
                        : 'bg-neutral-950/70 hover:bg-neutral-800/80 border-neutral-800 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs group-hover:text-amber-500 transition-colors">
                        {mod.label}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-amber-500 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <span className={`text-[11px] font-mono leading-snug ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {mod.items}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Decoupling Audit ("point and act" Architectural Guarantee) */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <span>Decoupling Audit: How to truly achieve"point and act, Local change, no global impact"? </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>1. zero Barrel Forwarding and direct module addressing</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              Full-warehouse redundancy elimination <code className="font-mono">index.ts</code> Barrel Forward File, All imports point directly to specific physical files (e.g. <code className="font-mono">src/tokens/spacing</code>, <code className="font-mono">src/compounds/Dialogue</code>) , Eliminate implicit circular dependencies and full-project recompilation. 
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>2. Zero lateral coupling between same-layer primitives and layout</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              L1 of <code className="font-mono">DualGrabberSlider</code> and <code className="font-mono">SliderControl</code> Completely Independent; L2 of <code className="font-mono">VStack</code>, <code className="font-mono">HStack</code>, <code className="font-mono">GridStack</code> Individually consumed L0 <code className="font-mono">spacing.ts</code>, No cross-referencing. 
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>3. L5 Four major professional domains 100% Orthogonal Isolation</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              5A (<code className="font-mono">src/hud</code>), 5B (<code className="font-mono">src/charts</code>), 5C (<code className="font-mono">src/viewport</code>), 5D (<code className="font-mono">src/loading</code>) No cross-module lines between import; Wherein 5B Chart library even for L1~L4 Also Zero Dependency, Single file copy-and-use. 
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/40 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>4. L6 Recipes and L5 Zero-reverse type coupling</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              <code className="font-mono">src/recipes/*</code> All Under 26 Top-level menu panels concentrated in root directory, With optional callback Props Communicate With Outer Layer, Ensure Each Recipe Independently portable. 
            </p>
          </div>
        </div>
      </div>

      {/* Core Question 1: Package vs Recipe Registry */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Box className="h-5 w-5 text-amber-500" />
          <span>Core Decision: Why Recommended"Code Reference Guide (Recipe Registry)"Rather Than"NPM Package"? </span>
        </h2>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          In game frontend and AI Agent In Collaboration Scenarios, Traditional NPM Package Mechanism has severe critical pain points. We strongly recommend using class <strong>shadcn/ui</strong> of"Code style reference library + Plug and Play"Model: 
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Why NOT NPM package */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-red-50/70 border-red-200' : 'bg-red-950/40 border-red-800/80'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-red-500">
              <XCircle className="h-4 w-4" />
              <span>NPM Package Pattern Drawbacks</span>
            </div>
            <ul className={`text-xs space-y-2 list-disc list-inside ${isLight ? 'text-neutral-700' : 'text-neutral-200'}`}>
              <li><strong>Agent Become a black-box blind</strong>: Components located at after packing <code className="font-mono">node_modules</code> in, AI Agent Cannot directly read source code and DOM Structure, Difficult To Fine-tune. </li>
              <li><strong>Heavy release cycle</strong>: Modify One padding Or Add A Slot, Requires Rebundling, Publish, Version Increment, Dependency installation friction. </li>
              <li><strong>Tailwind Conflict with bundler styles</strong>: Cross-package style bundling easily leads to CSS Conflict or lack of specificity. </li>
              <li><strong>Game Binding Barrier</strong>: Game UI Often Requires Binding Three.js Animation And WASM Data Flow, External black-box libraries are difficult to debug at the hardware level. </li>
            </ul>
          </div>

          {/* Why Recipe Registry */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/40 border-emerald-800/80'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>UIStorybook Absolute advantage of code reference library mode</span>
            </div>
            <ul className={`text-xs space-y-2 list-disc list-inside ${isLight ? 'text-neutral-700' : 'text-neutral-200'}`}>
              <li><strong>Zero Black-box Transparency (Zero Black-Box)</strong>: Each component code is clean and clear, AI Agent Directly understandable, Precise copy and instant project embedding. </li>
              <li><strong>100% Tailwind Native</strong>: Use semantically clear utility classes, No Dynamic Elements CSS-in-JS Or Proprietary Style Locks. </li>
              <li><strong>Prompt Instruction Standardization</strong>: To Agent When Sending Instructions, Just Declare"Use L1 UnderlineTabs + L2 3-Stage Panel Build Panel", Agent Direct access to standard implementation. </li>
              <li><strong>L7 Interactive validation sandbox</strong>: Provides full-featured scenario practice and automated regression matrices, Ensure local change only. </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Core Question 2: Decoupling Logic & Presentation */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-500" />
          <span>Decoupled Architecture: "Logic Separation, Style Separation"</span>
        </h2>

        <CodeBlock
          isLight={isLight}
          title="Example: Import by physical hierarchy, Pure presentation layer component passed Props driver"
          code={`// src/ui-core/recipes/Layer3AudioEqRecipe.tsx
import React, { useState } from 'react';
// L2 Layout: 3-Stage Panel Shell
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../../ui-core/layout/Panel';
// L3 Compounds & L1 Primitives: Import required atomic sliders and tabs
import { UnderlineTabs } from '../../ui-core/primitives/UnderlineTabs';
import { SliderControl } from '../../ui-core/primitives/SliderControl';

export const AudioSettingsPanel: React.FC<{ isLight?: boolean; onBack?: () => void }> = ({
  isLight = false,
  onBack,
}) => {
  const [soundVolume, setSoundVolume] = useState(80);
  const [activeTab, setActiveTab] = useState('master');

  return (
    <PanelContainer isLight={isLight}>
      <PanelHeader title="AUDIO SETTINGS" onBack={onBack} isLight={isLight} />
      <UnderlineTabs
        tabs={[
          { id: 'master', label: 'Master' },
          { id: 'eq', label: 'Equalizer' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLight={isLight}
      />
      <PanelContent>
        <SliderControl
          label="Sound Volume"
          value={soundVolume}
          min={0}
          max={100}
          unit="%"
          onChange={setSoundVolume}
          isLight={isLight}
        />
      </PanelContent>
      <PanelFooter defaultDescription="Adjust master audio gain" isLight={isLight} />
    </PanelContainer>
  );
};`}
        />
      </div>
    </div>
  );
};
