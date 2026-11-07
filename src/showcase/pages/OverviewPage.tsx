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
import type { ShowcaseTab } from '../sidebarNavConfig';
import { PYRAMID_SPEC } from './overview/overviewPyramidSpecs';

export interface OverviewPageProps {
  isLight?: boolean;
  onSelectTab?: (tab: ShowcaseTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ isLight = true, onSelectTab }) => {
  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Hero header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Rocket Companion & RCUITuner · L0–L7 Precise pyramid architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Design Philosophy And L0–L7 Unidirectional dependency pyramid
        </h1>
        <p className={`text-base font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
          Strict Adherence"Unidirectional Dependency, point and act"· Binary Choice, Unambiguous
        </p>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          For RocketSim WASM / Three.js Game And Modern Web Apply tailored standardized component
          reference library. Repository converged and upgraded to strictly follow unidirectional
          dependency flow (<code className="font-mono">L0 ← L1 ← L2 ← L3 ← L4 ← L5 ← L6 ← L7</code>
          ), where each module follows a deterministic eight-level pyramid architecture.
        </p>
      </div>

      {/* Section 1: L0–L7 Pyramid Matrix */}
      <div
        className={`flex flex-col gap-5 p-6 rounded-2xl border transition-colors ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-xs'
            : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
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
          <strong>L0 ~ L6 Responsible for"Define standards and reusable recipes"</strong>,{' '}
          <strong>L7 Responsible for"High-order permutation and combination simulation and stress test"</strong>
          . Click any module card below to jump directly to its corresponding specification or
          practice page:
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
                    isLight
                      ? 'bg-neutral-200/70 text-neutral-700'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {row.importPath}
                </code>
              </div>

              <p
                className={`text-xs leading-relaxed ${
                  isLight ? 'text-neutral-600' : 'text-neutral-400'
                }`}
              >
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
                    <span
                      className={`text-[11px] font-mono leading-snug ${
                        isLight ? 'text-neutral-500' : 'text-neutral-400'
                      }`}
                    >
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
          isLight
            ? 'bg-white border-neutral-200/90 shadow-xs'
            : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <span>
            Decoupling Audit: How to truly achieve"point and act, Local change, no global impact"?
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>1. zero Barrel Forwarding and direct module addressing</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              Full-warehouse redundancy elimination <code className="font-mono">index.ts</code>{' '}
              Barrel Forward File. All imports point directly to specific physical files (e.g.{' '}
              <code className="font-mono">src/ui-core/tokens/spacing</code>,{' '}
              <code className="font-mono">src/ui-core/compounds/Dialogue</code>), eliminating
              implicit circular dependencies and full-project recompilation.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>2. Zero lateral coupling between same-layer primitives and layout</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              L1 <code className="font-mono">DualGrabberSlider</code> and{' '}
              <code className="font-mono">SliderControl</code> are completely independent; L2{' '}
              <code className="font-mono">Panel</code>,{' '}
              <code className="font-mono">MenuContainer</code>, and{' '}
              <code className="font-mono">HudAnchorStage</code> individually consume L1 tokens with
              no cross-referencing.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-emerald-950/20 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>3. L5 Four major professional domains 100% Orthogonal Isolation</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              5A (<code className="font-mono">src/ui-core/hud</code>), 5B (
              <code className="font-mono">src/ui-core/charts</code>), and 5C (
              <code className="font-mono">src/ui-core/viewport</code>) have zero cross-module
              imports; 5B chart library has zero dependencies on L1–L4 for single-file portability.
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col gap-2 ${
              isLight
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-emerald-950/40 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <GitBranch className="h-4 w-4" />
              <span>4. L6 Recipes and L5 Zero-reverse type coupling</span>
            </div>
            <p className={`leading-relaxed ${isLight ? 'text-neutral-700' : 'text-neutral-300'}`}>
              <code className="font-mono">src/ui-core/recipes/*</code> top-level menu panels
              co-locate <code className="font-mono">SURFACE_META</code> and communicate via narrow
              Store-First props so each Recipe remains independently portable.
            </p>
          </div>
        </div>
      </div>

      {/* Core Question 1: Package vs Recipe Registry */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-xs'
            : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Box className="h-5 w-5 text-amber-500" />
          <span>
            Core Decision: Why Recommended"Code Reference Guide (Recipe Registry)"Rather Than"NPM
            Package"?
          </span>
        </h2>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          In game frontend and AI Agent collaboration scenarios, traditional NPM package mechanisms
          have critical pain points. We use a <strong>shadcn/ui</strong> style "Code Reference
          Registry + Co-Located Glob Discovery" model:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Why NOT NPM package */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLight
                ? 'bg-red-50/70 border-red-200'
                : 'bg-red-950/40 border-red-800/80'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-red-500">
              <XCircle className="h-4 w-4" />
              <span>NPM Package Pattern Drawbacks</span>
            </div>
            <ul
              className={`text-xs space-y-2 list-disc list-inside ${
                isLight ? 'text-neutral-700' : 'text-neutral-200'
              }`}
            >
              <li>
                <strong>Agent Become a black-box blind</strong>: Components packed inside{' '}
                <code className="font-mono">node_modules</code> prevent AI Agents from inspecting
                source code and DOM structure for fine-tuning.
              </li>
              <li>
                <strong>Heavy release cycle</strong>: Modifying one padding or adding a slot
                requires rebundling, publishing, version bumping, and dependency installation.
              </li>
              <li>
                <strong>Tailwind Conflict with bundler styles</strong>: Cross-package style bundling
                easily leads to CSS conflicts or specificity drift.
              </li>
              <li>
                <strong>Game Binding Barrier</strong>: Game UI requires binding Three.js animation
                and WASM data flows that external black-box libraries cannot easily debug.
              </li>
            </ul>
          </div>

          {/* Why Recipe Registry */}
          <div
            className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLight
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-emerald-950/40 border-emerald-800/80'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>RCUITuner Absolute advantage of code reference library mode</span>
            </div>
            <ul
              className={`text-xs space-y-2 list-disc list-inside ${
                isLight ? 'text-neutral-700' : 'text-neutral-200'
              }`}
            >
              <li>
                <strong>Zero Black-box Transparency (Zero Black-Box)</strong>: Each component code
                is clean and clear, directly understandable by AI Agents.
              </li>
              <li>
                <strong>100% Tailwind Native</strong>: Uses semantically clear utility classes with
                no proprietary CSS-in-JS locks.
              </li>
              <li>
                <strong>Prompt Instruction Standardization</strong>: Declare "Use L1 UnderlineTabs +
                L2 3-Stage Panel" and Agents have direct access to canonical implementations.
              </li>
              <li>
                <strong>L7 Interactive validation sandbox</strong>: Provides full-featured scenario
                practice and automated regression matrices.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Core Question 2: Decoupling Logic & Presentation */}
      <div
        className={`flex flex-col gap-4 p-6 rounded-2xl border transition-colors ${
          isLight
            ? 'bg-white border-neutral-200/90 shadow-xs'
            : 'bg-neutral-900/60 border-neutral-800 shadow-sm'
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
import { PanelContainer, PanelHeader, PanelContent } from '../../ui-core/layout/Panel';
import { PanelFooter } from '../../ui-core/layout/PanelFooter';
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
