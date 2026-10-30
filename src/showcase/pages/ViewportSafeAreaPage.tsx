import React from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:viewport-safe-area');
import {
  Monitor,
  ShieldAlert,
  Sparkles,
  Maximize2,
  Sliders,
  RotateCcw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { GameViewport } from '../../ui-core/viewport/GameViewport';
import { SafeAreaHud } from '../../ui-core/viewport/SafeAreaHud';
import { useViewportStore, viewportStore } from '../../ui-core/stores/viewportStore';
import { SliderControl } from '../../ui-core/primitives/SliderControl';
import { Badge } from '../../ui-core/primitives/Badge';
import { Button } from '../../ui-core/primitives/Button';
import { CodeBlock } from '../CodeBlock';

interface AspectPreset {
  id: string;
  label: string;
  ratioLabel: string;
  width: number;
  height: number;
  desc: string;
}

const ASPECT_PRESETS: AspectPreset[] = [
  {
    id: '32-9',
    label: '32:9 Super Ultrawide',
    ratioLabel: '3.55 : 1 (> 18:9)',
    width: 760,
    height: 214,
    desc: 'Ultra-Wide Monitor: Auto trigger 18:9 Pillarbox Clamp, Generate dark safe margins on both sides, Prevent HUD Scattered beyond field of view. ',
  },
  {
    id: '21-9',
    label: '21:9 Ultrawide',
    ratioLabel: '2.33 : 1 (> 18:9)',
    width: 720,
    height: 308,
    desc: 'Cinema Ultra-Wide: Render width clamped at Hsafe × 2.0, Auto-calculate horizontal symmetry Pillarbox Side Bar. ',
  },
  {
    id: '18-9',
    label: '18:9 Max Clamp Boundary',
    ratioLabel: '2.00 : 1 (Critical Upper Limit)',
    width: 680,
    height: 340,
    desc: 'Maximum native aspect ratio limit: 100% Fill Safe Area, 0px Pillarbox. ',
  },
  {
    id: '16-9',
    label: '16:9 Esports Standard',
    ratioLabel: '1.78 : 1 (Standard Landscape)',
    width: 640,
    height: 360,
    desc: 'Mainstream esports monitor aspect ratio: Render full active canvas, No Crop No Bars. ',
  },
  {
    id: '1-1',
    label: '1:1 Square Floor',
    ratioLabel: '1.00 : 1 (Narrowest Baseline)',
    width: 400,
    height: 400,
    desc: 'Minimum allowed aspect ratio baseline: Working Normally, Portrait intercept not triggered. ',
  },
  {
    id: '9-16',
    label: '3:4 / 9:16 Portrait',
    ratioLabel: '0.75 : 1 (< 1:1 Intercept)',
    width: 320,
    height: 420,
    desc: 'Narrower Than 1:1 Aspect Ratio: Auto trigger Portrait Gate Portrait mode intercept warning mask, Protect complex landscape telemetry panels from compression and layout breakage. ',
  },
];

export const ViewportSafeAreaPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const { safeAreaMargin, renderScale, showSafeAreaGuides } = useViewportStore();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('21-9');

  const activePreset = ASPECT_PRESETS.find((p) => p.id === selectedPresetId) ?? ASPECT_PRESETS[1];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Layer 5 · 5C Viewport & Safe Area (Viewport and safe area units)</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          5C. Viewport & Safe Area Viewport clamping and safe area engine
        </h1>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          benchmark <code className="font-mono">RLCleanWASM</code> Viewport Geometry Spec (<code className="font-mono">src/viewport/</code>) : 
          Provide <strong>18:9 Ultra-Wide Pillarbox Clamp</strong>, <strong>1:1 Portrait Gate Portrait Baseline Intercept</strong>, And <strong>-5% ~ +10% Safe Area Margin (Include negative overscan Overscan Bleed) </strong>. 
          As L5C Standalone Subsystem, and 5A (Match HUD), 5B (Charts), 5D (Loading) Fully orthogonal decoupling. 
        </p>
      </div>

      {/* 1. Interactive Global Safe Area & Scaling Telemetry Control */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Sliders className="h-4 w-4 text-amber-500" />
            <span>1. Global Safe Area Margin (-5% ~ +10%) and Content Scaling Real-time Controller</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showSafeAreaGuides ? 'primary' : 'secondary'}
              isLight={isLight}
              icon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => viewportStore.toggleSafeAreaGuides()}
            >
              {showSafeAreaGuides ? 'Hide safe area markers (HUD On)' : 'Show safe area guides (HUD Off)'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isLight={isLight}
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => {
                viewportStore.setSafeAreaMargin(0);
                viewportStore.setRenderScale(100);
              }}
            >
              reset (0% / 100%)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <SliderControl
              label="Safe Area Margin (Outer frame safe margin / Overscan)"
              value={safeAreaMargin}
              min={-5}
              max={10}
              step={1}
              origin={0}
              variation="centered"
              showSign
              unit="%"
              colorScheme="amber"
              negativeColorScheme="rose"
              onChange={(v) => viewportStore.setSafeAreaMargin(v)}
              isLight={isLight}
            />
            <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              • Positive Value (0% ~ +10%): Four-side inward safe padding, Avoid Curved Screen/TV Cut Corner. <br />
              • Negative Value (-5% ~ 0%): Overscan extension beyond physical viewport (Overscan Bleed). 
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <SliderControl
              label="Content Render Scale (Content area proportional scaling)"
              value={renderScale}
              min={50}
              max={150}
              step={5}
              origin={100}
              variation="centered"
              unit="%"
              colorScheme="emerald"
              onChange={(v) => viewportStore.setRenderScale(v)}
              isLight={isLight}
            />
            <span className={`text-[11px] font-mono ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              • Only affects the right main content workspace, Header and Sidebar Strictly Fixed 100% Original Size. 
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Aspect Ratio Clamp & Portrait Gate Simulator */}
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-5 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Monitor className="h-4 w-4 text-emerald-500" />
            <span>2. 18:9 Pillarbox Clamp and 1:1 Portrait Gate Interactive simulation sandbox</span>
          </div>
          <Badge variant="amber" size="sm" isLight={isLight}>
            {activePreset.ratioLabel}
          </Badge>
        </div>

        {/* Preset selector pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ASPECT_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPresetId(preset.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-200'
                }`}
              >
                <span className="text-xs font-bold truncate">{preset.label.split(' ')[0]}</span>
                <span className={`text-[10px] font-mono truncate ${isSelected ? 'text-amber-100' : 'text-neutral-400'}`}>
                  {preset.ratioLabel.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          <strong>Current Simulated Viewport ({activePreset.width} × {activePreset.height}px): </strong>
          {activePreset.desc}
        </p>

        {/* Simulated Viewport Frame */}
        <div
          className={`p-6 rounded-2xl border flex items-center justify-center overflow-x-auto ${
            isLight ? 'bg-neutral-100/80 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
          }`}
        >
          <div
            className="rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-xl transition-all duration-300 shrink-0"
            style={{
              width: `${activePreset.width}px`,
              height: `${activePreset.height}px`,
            }}
          >
            <GameViewport isLight={isLight} showTelemetry={true}>
              <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ACTIVE RENDER CANVAS (≤ 18:9)
                  </span>
                  <span className="text-neutral-400">
                    Container: {activePreset.width}×{activePreset.height}
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center gap-1 text-center my-auto">
                  <CheckCircle2 className="h-6 w-6 text-amber-400" />
                  <span className="text-sm font-bold tracking-tight">
                    18:9 Clamped Safe Canvas
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 max-w-md">
                    HUD Anchor points are always fixed to the four corners of this active canvas, Auto-generate on ultra-wide screen sides Pillarbox Guardrail
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>BL Anchor: BallCam</span>
                  <span>BC Anchor: Speedometer</span>
                  <span>BR Anchor: BoostGauge</span>
                </div>
              </div>
            </GameViewport>
          </div>
        </div>
      </div>

      <CodeBlock
        isLight={isLight}
        title="5C. GameViewport & SafeAreaHud Standard Call Example"
        code={`import { GameViewport } from '@/ui-core/viewport/GameViewport';
import { SafeAreaHud } from '@/ui-core/viewport/SafeAreaHud';
import { useViewportStore } from '@/ui-core/stores/viewportStore';

export const MatchStage = ({ isLight }: { isLight: boolean }) => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Physical screen-level safe area auxiliary guidelines */}
      <SafeAreaHud isLight={isLight} />

      {/* Auto Execute 18:9 Pillarbox Clamp and 1:1 Portrait Gate Portrait Protection */}
      <GameViewport isLight={isLight} showTelemetry>
        <HudAnchorStage ... />
      </GameViewport>
    </div>
  );
};`}
      />
    </div>
  );
};
