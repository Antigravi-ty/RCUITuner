import React from 'react';
import {
  RotateCcw,
  Timer,
  Palette,
  Sliders,
  Layers,
  Copy,
  Check,
  Code2,
  Eye,
  Users,
} from 'lucide-react';
import {
  CenterUpperTypographyConfig,
  CenterUpperTimingConfig,
} from '../../../ui-core/hud/CenterUpperInfoHUD';
import {
  TakeoverVignetteConfig,
  TakeoverGlowConfig,
  TakeoverTopLabelStyleConfig,
  DEFAULT_TAKEOVER_GLOW,
  DEFAULT_TAKEOVER_TOP_LABEL_STYLE,
  DEFAULT_TAKEOVER_TYPOGRAPHY,
  DEFAULT_TAKEOVER_TIMING,
  DEFAULT_TAKEOVER_VIGNETTE,
  DEFAULT_TAKEOVER_LAYOUT,
} from '../../../ui-core/hud/TakeoverCountdownHUD';
import {
  CubicBezierCurveEditor,
  type CubicBezierPreset,
} from '../../../ui-core/charts/CubicBezierCurveEditor';
import { Badge } from '../../../ui-core/primitives/Badge';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { ColorSwatchInput } from '../../../ui-core/compounds/tuner/ColorSwatchInput';
import { CodeBlock } from '../../CodeBlock';
import { RL_GLOW_SWATCHES } from '../center-upper-info/CenterUpperArchetypesAndBackdrop';

export const VIGNETTE_BEZIER_PRESETS: CubicBezierPreset[] = [
  { name: 'Calibrated Rect (Default)', value: { p1x: 0.28, p1y: 0.01, p2x: 0.0, p2y: 1.01 } },
  { name: 'Smooth Edge', value: { p1x: 0.42, p1y: 0.0, p2x: 0.22, p2y: 1.0 } },
  { name: 'Deep Corner Pinch', value: { p1x: 0.68, p1y: 0.0, p2x: 0.88, p2y: 0.35 } },
  { name: 'Linear Falloff', value: { p1x: 0.33, p1y: 0.33, p2x: 0.67, p2y: 0.67 } },
];

export const VIGNETTE_COLOR_SWATCHES = [
  '#000000',
  '#090D16',
  '#0F172A',
  '#1E1B4B',
  '#042F2E',
  '#27120B',
];

export const BLUE_TEAM_SWATCHES = [
  '#2563EB',
  '#3B82F6',
  '#0284C7',
  '#38BDF8',
  '#1D4ED8',
  '#60A5FA',
];

export const ORANGE_TEAM_SWATCHES = [
  '#EA580C',
  '#F97316',
  '#FB923C',
  '#D97706',
  '#EF4444',
  '#F59E0B',
];

export interface TakeoverTunerSectionProps {
  isLight: boolean;
  showExportedCode: boolean;
  setShowExportedCode: React.Dispatch<React.SetStateAction<boolean>>;
  copiedConfig: boolean;
  handleCopyConfig: () => void;
  handleResetDefaults: () => void;
  buildExportCode: () => string;
  myTeamSide: 'blue' | 'orange';
  setMyTeamSide: (
    val: 'blue' | 'orange' | ((prev: 'blue' | 'orange') => 'blue' | 'orange')
  ) => void;
  vignetteConfig: TakeoverVignetteConfig;
  setVignetteConfig: (
    val:
      | TakeoverVignetteConfig
      | ((prev: TakeoverVignetteConfig) => TakeoverVignetteConfig)
  ) => void;
  alwaysPreviewVignette: boolean;
  setAlwaysPreviewVignette: (val: boolean | ((prev: boolean) => boolean)) => void;
  glowConfig: TakeoverGlowConfig;
  setGlowConfig: (
    val:
      | TakeoverGlowConfig
      | ((prev: TakeoverGlowConfig) => TakeoverGlowConfig)
  ) => void;
  syncGlowWithText: boolean;
  setSyncGlowWithText: (val: boolean | ((prev: boolean) => boolean)) => void;
  timingConfig: CenterUpperTimingConfig;
  setTimingConfig: (
    val:
      | CenterUpperTimingConfig
      | ((prev: CenterUpperTimingConfig) => CenterUpperTimingConfig)
  ) => void;
  typoConfig: CenterUpperTypographyConfig;
  setTypoConfig: (
    val:
      | CenterUpperTypographyConfig
      | ((prev: CenterUpperTypographyConfig) => CenterUpperTypographyConfig)
  ) => void;
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
  const resolvedTopStyle: Required<TakeoverTopLabelStyleConfig> = {
    ...DEFAULT_TAKEOVER_TOP_LABEL_STYLE,
    ...(glowConfig.topLabelStyle ?? {}),
  };

  const updateTopLabelStyle = (patch: Partial<TakeoverTopLabelStyleConfig>) => {
    setGlowConfig((prev) => ({
      ...prev,
      topLabelStyle: {
        ...DEFAULT_TAKEOVER_TOP_LABEL_STYLE,
        ...(prev.topLabelStyle ?? {}),
        ...patch,
      },
    }));
    setIsVisibleOnStage(true);
  };

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
              Adjust rounded-rectangle vignette mask, team-colored `Takeover in...` + white glowing stroke, bottom offset, and typography
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
            title="Current Takeover Parameter Snapshot (Rounded-Rect Vignette + Team Top Label + Bottom-Center Offset + Typography)"
            language="typescript"
            isLight={isLight}
            code={buildExportCode()}
          />
        )}
      </div>

      {/* Card 1: Rounded-Rectangle 4-Edge Vignette Tuner */}
      <div
        className={`p-5 rounded-3xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold font-mono">
              1. Rounded-Rect 4-Edge Vignette Mask (Intensity · Distance · Curve)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setVignetteConfig({ ...DEFAULT_TAKEOVER_VIGNETTE })}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Vignette Default</span>
          </button>
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

        <ColorSwatchInput
          label="Vignette Edge Tint Color"
          description="Rendered at z-10 underneath the z-20 HUD layer as a concentric rounded-rectangle mask"
          value={vignetteConfig.color}
          onChange={(hex) => setVignetteConfig((prev) => ({ ...prev, color: hex }))}
          presets={VIGNETTE_COLOR_SWATCHES}
          isLight={isLight}
        />

        <SliderControl
          label="Vignette Edge Intensity (Peak Opacity)"
          description="Controls maximum darkening strength at the 4 screen edges during Takeover (default 50%)"
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

        <SliderControl
          label="Clear Center Rect Distance (Inner Opening)"
          description="Rectangular distance from center (0%–95%, default 40%) that stays 100% clear before edge falloff"
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

        <div className="grid grid-cols-2 gap-3">
          <SliderControl
            label="Outer Full-Density Reach"
            description="Default 120%"
            value={vignetteConfig.outerReachPct}
            min={35}
            max={140}
            step={1}
            unit="%"
            editable
            allowOutOfBoundsInput
            onChange={(v) => setVignetteConfig((prev) => ({ ...prev, outerReachPct: v }))}
            isLight={isLight}
          />
          <SliderControl
            label="Rect Corner Radius"
            description="Rounded-rect mask corner radius"
            value={vignetteConfig.cornerRadiusPx ?? 36}
            min={0}
            max={160}
            step={2}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => setVignetteConfig((prev) => ({ ...prev, cornerRadiusPx: v }))}
            isLight={isLight}
          />
        </div>

        <CubicBezierCurveEditor
          title="Rounded-Rect Vignette Falloff Curve (Inner Clear Rect -> Outer Edge)"
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
      <div
        className={`p-5 rounded-3xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold font-mono">
              2. Bottom-Center Upward Offset &amp; Bottom-Only Scale Motion
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setBottomOffsetPx(DEFAULT_TAKEOVER_LAYOUT.bottomOffsetPx);
              setTimingConfig((prev) => ({
                ...DEFAULT_TAKEOVER_TIMING,
                persistentInspect: prev.persistentInspect,
              }));
              setCountdownIntervalMs(1000);
              setIsVisibleOnStage(true);
              setTriggerNonce((n) => n + 1);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Default Offset &amp; Timing</span>
          </button>
        </div>

        <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col gap-2">
          <span className="text-xs font-mono font-bold text-emerald-500">
            Anchor Reference: Bottom-Center Upward Offset (`anchor=&quot;bottom-center&quot;`, Default 24px)
          </span>
          <SliderControl
            label="Upward Offset from Bottom-Center (Bottom Offset px)"
            description="Strictly anchored to bottom-center and shifted upward (NOT global center)"
            value={bottomOffsetPx}
            min={0}
            max={280}
            step={2}
            unit="px"
            editable
            allowOutOfBoundsInput
            colorScheme="amber"
            onChange={(v) => {
              setBottomOffsetPx(v);
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Timer className="h-4 w-4 text-sky-500" />
          <span className="text-xs font-bold font-mono">
            Bottom `3 -&gt; 2 -&gt; 1` Scale Pop Envelope (Top `Takeover in...` Never Moves)
          </span>
        </div>

        <SliderControl
          label="Bottom Digit Scale Pop Multiplier (Entry Scale)"
          description="Applies ONLY to the bottom Thin countdown digit (3, 2, 1); Top Regular label stays 1.0x stationary"
          value={timingConfig.entryScale}
          min={1.0}
          max={2.4}
          step={0.01}
          unit="x"
          editable
          allowOutOfBoundsInput
          formatValue={(v) => v.toFixed(2)}
          onChange={(v) => {
            setTimingConfig((prev) => ({
              ...prev,
              entryScale: Number(v.toFixed(2)),
            }));
            setIsVisibleOnStage(true);
            setTriggerNonce((n) => n + 1);
          }}
          isLight={isLight}
        />

        <SliderControl
          label="Entry Scale Collapse Duration (Entry Duration)"
          description="Default 380ms cubic-bezier(0.16, 1, 0.3, 1) collapse from entryScale to 1.00x"
          value={timingConfig.entryDurationMs}
          min={50}
          max={900}
          step={10}
          unit="ms"
          editable
          allowOutOfBoundsInput
          onChange={(v) => {
            setTimingConfig((prev) => ({ ...prev, entryDurationMs: v }));
            setIsVisibleOnStage(true);
            setTriggerNonce((n) => n + 1);
          }}
          isLight={isLight}
        />

        <SliderControl
          label="3 -> 2 -> 1 Sequence Step Interval"
          description="Default 1000ms per countdown digit before Cockpit HUD deploys"
          value={countdownIntervalMs}
          min={300}
          max={2500}
          step={50}
          unit="ms"
          editable
          allowOutOfBoundsInput
          onChange={(v) => setCountdownIntervalMs(v)}
          isLight={isLight}
        />

        <div className="grid grid-cols-2 gap-3">
          <SliderControl
            label="Single Step Hold Duration"
            value={timingConfig.durationMs}
            min={200}
            max={3000}
            step={50}
            unit="ms"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setTimingConfig((prev) => ({ ...prev, durationMs: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
          <SliderControl
            label="Step Tail Fade-Out"
            value={timingConfig.exitDurationMs}
            min={0}
            max={800}
            step={10}
            unit="ms"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setTimingConfig((prev) => ({ ...prev, exitDurationMs: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Card 3: Team-Colored Top Label + White Glowing Stroke & Countdown Glow Tuner */}
      <div
        className={`p-5 rounded-3xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold font-mono">
              3. Team-Colored `Takeover in...` + White Glowing Stroke &amp; Digit Glow
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setGlowConfig({ ...DEFAULT_TAKEOVER_GLOW });
              setIsVisibleOnStage(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>RL Default</span>
          </button>
        </div>

        {/* Team-Specific Top Label Section */}
        <div className="p-3.5 rounded-2xl border border-sky-500/30 bg-sky-500/5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>Top Label (`Takeover in...`): Team Color + White Glowing Stroke</span>
            </span>
            <ToggleSwitch
              label="Use Team Color"
              checked={resolvedTopStyle.useTeamColor}
              onCheckedChange={(v) => updateTopLabelStyle({ useTeamColor: v })}
              isLight={isLight}
            />
          </div>

          <SegmentedSwitch
            size="sm"
            fullWidth
            isLight={isLight}
            value={myTeamSide}
            onValueChange={(v) => {
              setMyTeamSide(v as 'blue' | 'orange');
              setIsVisibleOnStage(true);
            }}
            options={[
              {
                value: 'blue',
                label: `Blue Team (${resolvedTopStyle.blueTeamColor})`,
              },
              {
                value: 'orange',
                label: `Orange Team (${resolvedTopStyle.orangeTeamColor})`,
              },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorSwatchInput
              label="Blue Team Top Label Fill"
              value={resolvedTopStyle.blueTeamColor}
              onChange={(hex) => updateTopLabelStyle({ blueTeamColor: hex })}
              presets={BLUE_TEAM_SWATCHES}
              isLight={isLight}
            />
            <ColorSwatchInput
              label="Orange Team Top Label Fill"
              value={resolvedTopStyle.orangeTeamColor}
              onChange={(hex) => updateTopLabelStyle({ orangeTeamColor: hex })}
              presets={ORANGE_TEAM_SWATCHES}
              isLight={isLight}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorSwatchInput
              label="Top Label Stroke & Glow Color"
              description="Default #FFFFFF white glowing stroke"
              value={resolvedTopStyle.strokeColor}
              onChange={(hex) =>
                updateTopLabelStyle({ strokeColor: hex, glowColor: hex })
              }
              presets={['#FFFFFF', '#F8FAFC', '#E0F2FE', '#FFFBEB', '#FEF08A']}
              isLight={isLight}
            />
            <div className="flex flex-col gap-2">
              <SliderControl
                label="White Stroke Width"
                value={resolvedTopStyle.strokeWidthPx}
                min={0}
                max={3}
                step={0.05}
                unit="px"
                editable
                allowOutOfBoundsInput
                formatValue={(v) => v.toFixed(2)}
                onChange={(v) =>
                  updateTopLabelStyle({ strokeWidthPx: Number(v.toFixed(2)) })
                }
                isLight={isLight}
              />
              <SliderControl
                label="White Outer Glow Blur"
                value={resolvedTopStyle.outerBlurPx}
                min={0}
                max={48}
                step={1}
                unit="px"
                editable
                allowOutOfBoundsInput
                onChange={(v) => updateTopLabelStyle({ outerBlurPx: v })}
                isLight={isLight}
              />
            </div>
          </div>
        </div>

        {/* Bottom Countdown Digit Color & Glow */}
        <ColorSwatchInput
          label="Bottom Countdown Digit Color (Main Thin 100)"
          description="Default Rocket League yellow #FFE600"
          value={glowConfig.textColor}
          onChange={(hex) => {
            setGlowConfig((prev) => ({
              ...prev,
              textColor: hex,
              ...(syncGlowWithText ? { glowColor: hex } : {}),
            }));
            setIsVisibleOnStage(true);
          }}
          presets={RL_GLOW_SWATCHES}
          isLight={isLight}
        />

        <div className="flex items-center justify-between px-1">
          <ToggleSwitch
            label="Digit outer glow color follows bottom digit text"
            checked={syncGlowWithText}
            onCheckedChange={(sync) => {
              setSyncGlowWithText(sync);
              if (sync) {
                setGlowConfig((prev) => ({
                  ...prev,
                  glowColor: prev.textColor,
                }));
              }
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
        </div>

        <ColorSwatchInput
          label="Bottom Digit Outer Glow Color (Out Glow Color)"
          description="Default Amber Gold #F59E0B"
          value={glowConfig.glowColor}
          onChange={(hex) => {
            setGlowConfig((prev) => ({
              ...prev,
              glowColor: hex,
            }));
            setIsVisibleOnStage(true);
          }}
          presets={RL_GLOW_SWATCHES}
          isLight={isLight}
        />

        <SliderControl
          label="Bottom Digit Out Glow Total Intensity"
          value={glowConfig.intensityPct}
          min={0}
          max={200}
          step={1}
          unit="%"
          editable
          allowOutOfBoundsInput
          colorScheme="amber"
          onChange={(v) => {
            setGlowConfig((prev) => ({ ...prev, intensityPct: v }));
            setIsVisibleOnStage(true);
          }}
          isLight={isLight}
        />

        <div className="grid grid-cols-3 gap-2">
          <SliderControl
            label="Inner Blur"
            value={glowConfig.innerBlurPx}
            min={0}
            max={40}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, innerBlurPx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
          <SliderControl
            label="Outer Blur"
            value={glowConfig.outerBlurPx}
            min={0}
            max={80}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, outerBlurPx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
          <SliderControl
            label="Ambient Blur"
            value={glowConfig.ambientBlurPx}
            min={0}
            max={120}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setGlowConfig((prev) => ({ ...prev, ambientBlurPx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
        </div>
      </div>

      {/* Card 4: Typography Hierarchy (`uppercase: false` by default, mainFontSizePx: 56) */}
      <div
        className={`p-5 rounded-3xl border flex flex-col gap-4 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-bold font-mono">
              4. Typography Hierarchy (`mainFontSizePx: 56`, `uppercase: false`)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setTypoConfig({ ...DEFAULT_TAKEOVER_TYPOGRAPHY });
              setIsVisibleOnStage(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        <SliderControl
          label="Bottom Countdown Digit Font Size (`3 · 2 · 1`, Default 56px)"
          value={typoConfig.mainFontSizePx}
          min={36}
          max={136}
          step={1}
          unit="px"
          editable
          allowOutOfBoundsInput
          onChange={(v) => {
            setTypoConfig((prev) => ({ ...prev, mainFontSizePx: v }));
            setIsVisibleOnStage(true);
          }}
          isLight={isLight}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">
            Bottom Countdown Font Weight (Default Thin 100)
          </span>
          <SegmentedSwitch
            size="sm"
            fullWidth
            isLight={isLight}
            value={String(typoConfig.mainFontWeight)}
            onValueChange={(v) => {
              setTypoConfig((prev) => ({
                ...prev,
                mainFontWeight: Number(v) as 100 | 200 | 300 | 400,
              }));
              setIsVisibleOnStage(true);
            }}
            options={[
              { value: '100', label: 'Thin (100)' },
              { value: '200', label: 'ExtraLight (200)' },
              { value: '300', label: 'Light (300)' },
              { value: '400', label: 'Regular (400)' },
            ]}
          />
        </div>

        <SliderControl
          label="Top Stationary Label Font Size (`Takeover in...`, Default 24px)"
          value={typoConfig.topFontSizePx}
          min={12}
          max={52}
          step={1}
          unit="px"
          editable
          allowOutOfBoundsInput
          onChange={(v) => {
            setTypoConfig((prev) => ({ ...prev, topFontSizePx: v }));
            setIsVisibleOnStage(true);
          }}
          isLight={isLight}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">
            Top Stationary Label Font Weight (Default Regular 400)
          </span>
          <SegmentedSwitch
            size="sm"
            fullWidth
            isLight={isLight}
            value={String(typoConfig.topFontWeight)}
            onValueChange={(v) => {
              setTypoConfig((prev) => ({
                ...prev,
                topFontWeight: Number(v) as 100 | 300 | 400 | 500,
              }));
              setIsVisibleOnStage(true);
            }}
            options={[
              { value: '100', label: 'Thin (100)' },
              { value: '300', label: 'Light (300)' },
              { value: '400', label: 'Regular (400)' },
              { value: '500', label: 'Medium (500)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SliderControl
            label="Top Letter Spacing"
            value={typoConfig.topLetterSpacingEm}
            min={-0.08}
            max={0.5}
            step={0.01}
            unit="em"
            editable
            allowOutOfBoundsInput
            formatValue={(v) => v.toFixed(2)}
            onChange={(v) => {
              setTypoConfig((prev) => ({
                ...prev,
                topLetterSpacingEm: Number(v.toFixed(2)),
              }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
          <SliderControl
            label="Vertical Line Gap"
            value={typoConfig.lineGapPx}
            min={0}
            max={28}
            step={1}
            unit="px"
            editable
            allowOutOfBoundsInput
            onChange={(v) => {
              setTypoConfig((prev) => ({ ...prev, lineGapPx: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <ToggleSwitch
            label="Force Uppercase (Default OFF for 'Takeover in...')"
            checked={typoConfig.uppercase}
            onCheckedChange={(v) => {
              setTypoConfig((prev) => ({ ...prev, uppercase: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
          <ToggleSwitch
            label="Italic Motion"
            checked={typoConfig.italic ?? false}
            onCheckedChange={(v) => {
              setTypoConfig((prev) => ({ ...prev, italic: v }));
              setIsVisibleOnStage(true);
            }}
            isLight={isLight}
          />
        </div>
      </div>
    </section>
  );
};

