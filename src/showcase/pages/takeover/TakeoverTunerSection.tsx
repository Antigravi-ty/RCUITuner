import React from 'react';
import { RotateCcw, Copy, Check, Code2, Eye, ArrowLeftRight } from 'lucide-react';
import {
  CenterUpperTypographyConfig,
  CenterUpperTimingConfig,
} from '../../../ui-core/hud/CenterUpperInfoHUD';
import {
  TakeoverVignetteConfig,
  TakeoverVignetteRenderMode,
  TakeoverGlowConfig,
  DEFAULT_TAKEOVER_VIGNETTE,
  formatVignetteEndpointRgba,
  computeVignetteAxisOffsets,
} from '../../../ui-core/hud/TakeoverCountdownHUD';
import { CubicBezierCurveEditor, type CubicBezierPreset } from '../../../ui-core/charts/CubicBezierCurveEditor';
import { Badge } from '../../../ui-core/primitives/Badge';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { ColorSwatchInput } from '../../../ui-core/compounds/tuner/ColorSwatchInput';
import { CodeBlock } from '../../CodeBlock';
import { TakeoverOffsetAndMotionCard } from './TakeoverOffsetAndMotionCard';
import { TakeoverGlowAndTypographyCards, BLUE_TEAM_SWATCHES, ORANGE_TEAM_SWATCHES } from './TakeoverGlowAndTypographyCards';

export { BLUE_TEAM_SWATCHES, ORANGE_TEAM_SWATCHES };

export const VIGNETTE_BEZIER_PRESETS: CubicBezierPreset[] = [
  { name: 'Smooth Seamless (Default)', value: { p1x: 0.36, p1y: 0.0, p2x: 0.22, p2y: 1.0 } },
  { name: 'Calibrated Rect', value: { p1x: 0.28, p1y: 0.01, p2x: 0.0, p2y: 1.01 } },
  { name: 'Soft Gaussian Feather', value: { p1x: 0.42, p1y: 0.0, p2x: 0.58, p2y: 1.0 } },
  { name: 'Deep Corner Pinch', value: { p1x: 0.68, p1y: 0.0, p2x: 0.88, p2y: 0.35 } },
  { name: 'Linear Falloff', value: { p1x: 0.33, p1y: 0.33, p2x: 0.67, p2y: 0.67 } },
];

export const VIGNETTE_COLOR_SWATCHES = ['#000000', '#090D16', '#0F172A', '#1E1B4B', '#042F2E', '#27120B'];

export interface TakeoverTunerSectionProps {
  isLight: boolean;
  showExportedCode: boolean;
  setShowExportedCode: React.Dispatch<React.SetStateAction<boolean>>;
  copiedConfig: boolean;
  handleCopyConfig: () => void;
  handleResetDefaults: () => void;
  buildExportCode: () => string;
  myTeamSide: 'blue' | 'orange';
  setMyTeamSide: (val: 'blue' | 'orange' | ((prev: 'blue' | 'orange') => 'blue' | 'orange')) => void;
  vignetteConfig: TakeoverVignetteConfig;
  setVignetteConfig: (val: TakeoverVignetteConfig | ((prev: TakeoverVignetteConfig) => TakeoverVignetteConfig)) => void;
  alwaysPreviewVignette: boolean;
  setAlwaysPreviewVignette: (val: boolean | ((prev: boolean) => boolean)) => void;
  glowConfig: TakeoverGlowConfig;
  setGlowConfig: (val: TakeoverGlowConfig | ((prev: TakeoverGlowConfig) => TakeoverGlowConfig)) => void;
  syncGlowWithText: boolean;
  setSyncGlowWithText: (val: boolean | ((prev: boolean) => boolean)) => void;
  timingConfig: CenterUpperTimingConfig;
  setTimingConfig: (val: CenterUpperTimingConfig | ((prev: CenterUpperTimingConfig) => CenterUpperTimingConfig)) => void;
  typoConfig: CenterUpperTypographyConfig;
  setTypoConfig: (val: CenterUpperTypographyConfig | ((prev: CenterUpperTypographyConfig) => CenterUpperTypographyConfig)) => void;
  countdownIntervalMs: number;
  setCountdownIntervalMs: (val: number | ((prev: number) => number)) => void;
  bottomOffsetPx: number;
  setBottomOffsetPx: (val: number | ((prev: number) => number)) => void;
  setIsVisibleOnStage: (val: boolean | ((prev: boolean) => boolean)) => void;
  setTriggerNonce: (val: number | ((prev: number) => number)) => void;
}

export const TakeoverTunerSection: React.FC<TakeoverTunerSectionProps> = ({
  isLight,
  showExportedCode,
  setShowExportedCode,
  copiedConfig,
  handleCopyConfig,
  handleResetDefaults,
  buildExportCode,
  myTeamSide,
  setMyTeamSide,
  vignetteConfig,
  setVignetteConfig,
  alwaysPreviewVignette,
  setAlwaysPreviewVignette,
  glowConfig,
  setGlowConfig,
  syncGlowWithText,
  setSyncGlowWithText,
  timingConfig,
  setTimingConfig,
  typoConfig,
  setTypoConfig,
  countdownIntervalMs,
  setCountdownIntervalMs,
  bottomOffsetPx,
  setBottomOffsetPx,
  setIsVisibleOnStage,
  setTriggerNonce,
}) => {
  const axisGeo = computeVignetteAxisOffsets(vignetteConfig);
  const activeRenderMode: TakeoverVignetteRenderMode =
    vignetteConfig.renderMode ?? 'sdf-smooth';

  return (
    <section id="takeover-tuner" className="grid grid-cols-1 lg:grid-cols-2 gap-5 scroll-mt-24">
      {/* Top Export & Solidify Default Parameters Bar across all columns */}
      <div
        className={`lg:col-span-2 p-4 rounded-2xl border flex flex-col gap-3 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-md'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="amber" size="sm" isLight={isLight}>
              5G-2
            </Badge>
            <span className="text-sm font-bold font-mono">
              Takeover Parameter Tuner &amp; One-Click Config Exporter
            </span>
            <span className="text-xs font-mono opacity-65">
              Adjust seamless rounded-rect vignette (Independent X/Y depth, blur feather, corner radius, Bezier curve), team-colored `Takeover in...`, and bottom offset
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowExportedCode((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                showExportedCode
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 font-bold'
                  : isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showExportedCode ? 'Collapse Parameter Code' : 'View Default Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyConfig}
              data-ui-action="export-takeover-config"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                copiedConfig
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400'
              }`}
            >
              {copiedConfig ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied Takeover Config (Copied!)</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Takeover Config (Export Snapshot)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              title="Reset all Takeover parameters to calibrated defaults"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {showExportedCode && (
          <CodeBlock
            title="Current Takeover Parameter Snapshot (Seamless Rounded-Rect Vignette + Team Top Label + Bottom-Center Offset + Typography)"
            language="typescript"
            isLight={isLight}
            code={buildExportCode()}
          />
        )}
      </div>

      {/* Card 1: Seamless Rounded-Rectangle 4-Edge Vignette Tuner */}
      <div
        className={`p-5 rounded-3xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold font-mono">
              1. Seamless Rounded-Rect Vignette (Independent X/Y Depth - Feather - Curve)
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setVignetteConfig((prev) => ({
                  ...prev,
                  innerColor: prev.color,
                  innerIntensityPct: prev.intensityPct,
                  color: prev.innerColor ?? '#000000',
                  intensityPct: prev.innerIntensityPct ?? 0,
                }))
              }
              title="Swap Inner Opening RGBA (t=0) and Outer Edge RGBA (t=1)"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold border border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 cursor-pointer transition-colors"
            >
              <ArrowLeftRight className="h-3 w-3" />
              <span>Swap Inner/Outer RGBA</span>
            </button>
            <button
              type="button"
              onClick={() => setVignetteConfig({ ...DEFAULT_TAKEOVER_VIGNETTE })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Vignette Default</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <ToggleSwitch
            label="Enable Rounded-Rect Vignette Mask"
            checked={vignetteConfig.enabled}
            onCheckedChange={(v) => setVignetteConfig((prev) => ({ ...prev, enabled: v }))}
            isLight={isLight}
          />
          <ToggleSwitch
            label="Pin Vignette Visible for Tuning"
            checked={alwaysPreviewVignette}
            onCheckedChange={setAlwaysPreviewVignette}
            isLight={isLight}
          />
        </div>

        {/* Render Engine Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-sky-400">
              Vignette Compositing Engine (Zero Staircase Steps)
            </span>
            <span className="text-[10px] font-mono opacity-65">
              X: -{axisGeo.offsetX.toFixed(0)}px | Top: -{axisGeo.offsetTop.toFixed(0)}px | Bot: -{axisGeo.offsetBottom.toFixed(0)}px | vOffset: {axisGeo.verticalOffsetPx > 0 ? `+${axisGeo.verticalOffsetPx}` : axisGeo.verticalOffsetPx}px
            </span>
          </div>
          <SegmentedSwitch
            size="sm"
            fullWidth
            isLight={isLight}
            value={activeRenderMode}
            onValueChange={(v) =>
              setVignetteConfig((prev) => ({
                ...prev,
                renderMode: v as TakeoverVignetteRenderMode,
              }))
            }
            options={[
              { value: 'sdf-smooth', label: 'SDF + Dither (Safe)' },
              { value: 'css-inset', label: 'CSS Inset (Ref)' },
              { value: 'hybrid', label: 'Hybrid (SDF + CSS)' },
            ]}
          />
        </div>

        {/* Asymmetric Top/Bottom + Vertical Offset + Feather Controls */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col gap-3 ${
            isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-amber-500">
              Symmetric X &amp; Asymmetric Top/Bottom Y Depth + Vertical Offset
            </span>
            <button
              type="button"
              onClick={() =>
                setVignetteConfig((prev) => ({
                  ...prev,
                  depthTopPct: prev.depthYPct ?? 58,
                  depthBottomPct: prev.depthYPct ?? 58,
                  verticalOffsetPx: 0,
                }))
              }
              className="px-2 py-0.5 rounded text-[10px] font-mono border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
            >
              Sync Top/Bottom &amp; Zero Offset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SliderControl
              label="Vertical Depth (Y - Linked Master)"
              description="Default 58% (links Top & Bottom depth)"
              value={vignetteConfig.depthYPct ?? 58}
              min={0}
              max={140}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) =>
                setVignetteConfig((prev) => ({
                  ...prev,
                  depthYPct: v,
                  depthTopPct: v,
                  depthBottomPct: v,
                }))
              }
              isLight={isLight}
            />
            <SliderControl
              label="Horizontal Depth (X - Left/Right)"
              description="Default 17% (symmetric side feathering)"
              value={vignetteConfig.depthXPct ?? 17}
              min={0}
              max={100}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              onChange={(v) => setVignetteConfig((prev) => ({ ...prev, depthXPct: v }))}
              isLight={isLight}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SliderControl
              label="Top Edge Depth (Y-Top)"
              description="Lower = shorter top shadow"
              value={vignetteConfig.depthTopPct ?? vignetteConfig.depthYPct ?? 58}
              min={0}
              max={140}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              onChange={(v) => setVignetteConfig((prev) => ({ ...prev, depthTopPct: v }))}
              isLight={isLight}
            />
            <SliderControl
              label="Bottom Edge Depth (Y-Bottom)"
              description="Higher = taller bottom shadow"
              value={vignetteConfig.depthBottomPct ?? vignetteConfig.depthYPct ?? 58}
              min={0}
              max={140}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) => setVignetteConfig((prev) => ({ ...prev, depthBottomPct: v }))}
              isLight={isLight}
            />
            <SliderControl
              label="Vertical Offset (Y Shift)"
              description="+px: shorter top & taller bottom"
              value={vignetteConfig.verticalOffsetPx ?? 0}
              min={-200}
              max={200}
              step={2}
              unit="px"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) => setVignetteConfig((prev) => ({ ...prev, verticalOffsetPx: v }))}
              isLight={isLight}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SliderControl
              label="Feather Range (Blur)"
              description="Default 164px continuous transition span"
              value={vignetteConfig.blurPx ?? 164}
              min={20}
              max={350}
              step={2}
              unit="px"
              editable
              allowOutOfBoundsInput
              onChange={(v) => setVignetteConfig((prev) => ({ ...prev, blurPx: v }))}
              isLight={isLight}
            />
            <SliderControl
              label="Corner Smoothness (Radius)"
              description="Default 0px rounded corner contour"
              value={vignetteConfig.cornerRadiusPx ?? 0}
              min={0}
              max={150}
              step={2}
              unit="px"
              editable
              allowOutOfBoundsInput
              onChange={(v) => setVignetteConfig((prev) => ({ ...prev, cornerRadiusPx: v }))}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Dual RGBA Endpoint Cards: Endpoint A (t=0 Inner Opening) -> Endpoint B (t=1 Outer Edge) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Endpoint A: Inner Opening RGBA (t = 0) */}
          <div
            className={`p-3 rounded-2xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-mono font-bold text-emerald-500">
                Endpoint A - Inner Opening RGBA (t=0)
              </span>
              <span className="text-[10px] font-mono opacity-75">
                {formatVignetteEndpointRgba(
                  vignetteConfig.innerColor ?? '#000000',
                  vignetteConfig.innerIntensityPct ?? 0
                )}
              </span>
            </div>
            <ColorSwatchInput
              label="Inner RGB Color (t=0)"
              description="Color inside the center opening rectangle"
              value={vignetteConfig.innerColor ?? '#000000'}
              onChange={(hex) => setVignetteConfig((prev) => ({ ...prev, innerColor: hex }))}
              presets={VIGNETTE_COLOR_SWATCHES}
              isLight={isLight}
            />
            <SliderControl
              label="Inner Alpha / Opacity (t=0)"
              description="Default 0% (100% transparent center)"
              value={vignetteConfig.innerIntensityPct ?? 0}
              min={0}
              max={100}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              onChange={(v) => setVignetteConfig((prev) => ({ ...prev, innerIntensityPct: v }))}
              isLight={isLight}
            />
          </div>

          {/* Endpoint B: Outer Screen Edge RGBA (t = 1) */}
          <div
            className={`p-3 rounded-2xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-mono font-bold text-amber-500">
                Endpoint B - Outer Edge RGBA (t=1)
              </span>
              <span className="text-[10px] font-mono opacity-75">
                {formatVignetteEndpointRgba(vignetteConfig.color, vignetteConfig.intensityPct)}
              </span>
            </div>
            <ColorSwatchInput
              label="Outer Edge RGB Color (t=1)"
              description="Color at the 4 screen edges"
              value={vignetteConfig.color}
              onChange={(hex) => setVignetteConfig((prev) => ({ ...prev, color: hex }))}
              presets={VIGNETTE_COLOR_SWATCHES}
              isLight={isLight}
            />
            <SliderControl
              label="Vignette Density / Opacity (t=1)"
              description="Default 100% darkening at outer perimeter"
              value={vignetteConfig.intensityPct}
              min={0}
              max={100}
              step={1}
              unit="%"
              editable
              allowOutOfBoundsInput
              colorScheme="amber"
              onChange={(v) => setVignetteConfig((prev) => ({ ...prev, intensityPct: v }))}
              isLight={isLight}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderControl
            label="Clear Center Rect Distance (t=0)"
            description="Default 40% clear center opening scale"
            value={vignetteConfig.distancePct}
            min={0}
            max={95}
            step={1}
            unit="%"
            editable
            allowOutOfBoundsInput
            onChange={(v) => setVignetteConfig((prev) => ({ ...prev, distancePct: v }))}
            isLight={isLight}
          />
          <SliderControl
            label="Outer Full-Density Reach (t=1)"
            description="Default 160% feather reach factor"
            value={vignetteConfig.outerReachPct}
            min={35}
            max={160}
            step={1}
            unit="%"
            editable
            allowOutOfBoundsInput
            onChange={(v) => setVignetteConfig((prev) => ({ ...prev, outerReachPct: v }))}
            isLight={isLight}
          />
        </div>

        <CubicBezierCurveEditor
          title="Rounded-Rect Vignette Falloff Curve (t=0 Inner RGBA -> t=1 Outer RGBA)"
          p1x={vignetteConfig.curve.p1x}
          p1y={vignetteConfig.curve.p1y}
          p2x={vignetteConfig.curve.p2x}
          p2y={vignetteConfig.curve.p2y}
          presets={VIGNETTE_BEZIER_PRESETS}
          isLight={isLight}
          onChange={(nextCurve) =>
            setVignetteConfig((prev) => ({
              ...prev,
              curve: nextCurve,
            }))
          }
        />

        <div className="grid grid-cols-2 gap-3 pt-1">
          <SliderControl
            label="Vignette Fade-In"
            value={vignetteConfig.fadeInMs}
            min={0}
            max={1200}
            step={20}
            unit="ms"
            editable
            allowOutOfBoundsInput
            onChange={(v) => setVignetteConfig((prev) => ({ ...prev, fadeInMs: v }))}
            isLight={isLight}
          />
          <SliderControl
            label="Vignette Fade-Out"
            value={vignetteConfig.fadeOutMs}
            min={0}
            max={1200}
            step={20}
            unit="ms"
            editable
            allowOutOfBoundsInput
            onChange={(v) => setVignetteConfig((prev) => ({ ...prev, fadeOutMs: v }))}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Card 2: Bottom-Center Upward Offset + Motion Envelope Tuner */}
      <TakeoverOffsetAndMotionCard
        isLight={isLight}
        bottomOffsetPx={bottomOffsetPx}
        setBottomOffsetPx={setBottomOffsetPx}
        timingConfig={timingConfig}
        setTimingConfig={setTimingConfig}
        countdownIntervalMs={countdownIntervalMs}
        setCountdownIntervalMs={setCountdownIntervalMs}
        setIsVisibleOnStage={setIsVisibleOnStage}
        setTriggerNonce={setTriggerNonce}
      />

      {/* Cards 3 & 4: Team-Colored Top Label + Digit Glow + Typography Hierarchy */}
      <TakeoverGlowAndTypographyCards
        isLight={isLight}
        myTeamSide={myTeamSide}
        setMyTeamSide={setMyTeamSide}
        glowConfig={glowConfig}
        setGlowConfig={setGlowConfig}
        syncGlowWithText={syncGlowWithText}
        setSyncGlowWithText={setSyncGlowWithText}
        typoConfig={typoConfig}
        setTypoConfig={setTypoConfig}
        setIsVisibleOnStage={setIsVisibleOnStage}
      />
    </section>
  );
};
