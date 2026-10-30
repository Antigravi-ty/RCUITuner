import React from 'react';
import { RotateCcw, Timer, Palette, Sliders, Layers, Copy, Check, Code2, } from 'lucide-react';
import {
  CenterUpperGlowConfig, CenterUpperTypographyConfig, CenterUpperTimingConfig, DEFAULT_RL_COUNTDOWN_GLOW,
  DEFAULT_CENTER_UPPER_TYPOGRAPHY, DEFAULT_CENTER_UPPER_TIMING,
} from '../../../ui-core/hud/CenterUpperInfoHUD';
import { Badge } from '../../../ui-core/primitives/Badge';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { ColorSwatchInput } from '../../../ui-core/compounds/tuner/ColorSwatchInput';
import { CodeBlock } from '../../CodeBlock';
import { RL_GLOW_SWATCHES } from './CenterUpperArchetypesAndBackdrop';

export interface CenterUpperTunerSectionProps {
  isLight: boolean;
  showExported5ECode: boolean;
  setShowExported5ECode: React.Dispatch<React.SetStateAction<boolean>>;
  copied5EConfig: boolean;
  handleCopy5EConfig: () => void;
  handleReset5EDefaults: () => void;
  build5EExportCode: () => string;
  glowConfig: CenterUpperGlowConfig;
  setGlowConfig: (
    val:
      | CenterUpperGlowConfig
      | ((prev: CenterUpperGlowConfig) => CenterUpperGlowConfig)
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
  upperCenterTopPct: number;
  setUpperCenterTopPct: (val: number | ((prev: number) => number)) => void;
  setIsVisibleOnStage: (val: boolean | ((prev: boolean) => boolean)) => void;
  setTriggerNonce: (val: number | ((prev: number) => number)) => void;
}

export const CenterUpperTunerSection: React.FC<CenterUpperTunerSectionProps> = ({
  isLight,
  showExported5ECode,
  setShowExported5ECode,
  copied5EConfig,
  handleCopy5EConfig,
  handleReset5EDefaults,
  build5EExportCode,
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
  upperCenterTopPct,
  setUpperCenterTopPct,
  setIsVisibleOnStage,
  setTriggerNonce,
}) => {
  return (
    <section id="center-upper-tuner" className="grid grid-cols-1 lg:grid-cols-3 gap-5 scroll-mt-24">
      {/* Top Export & Solidify Default Parameters Bar across all 3 columns */}
      <div className={`lg:col-span-3 p-4 rounded-2xl border flex flex-col gap-3 ${ isLight
        ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-md' }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="amber" size="sm" isLight={isLight}>
              5E-2
            </Badge>
            <span className="text-sm font-bold font-mono">Parameter fine-tuning and export (Tuner &amp; Default Solidifier)</span>
            <span className="text-xs font-mono opacity-65">All sliders support clicking the value to input precise numbers; One-click copy after adjustment JSON/TS Solidify as default parameters</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowExported5ECode((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                showExported5ECode
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 font-bold'
                  : isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showExported5ECode ? 'Collapse Parameter Code' : 'View default code'}</span>
            </button>

            <button type="button" onClick={handleCopy5EConfig} data-ui-action="export-5e-config"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
              copied5EConfig ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400' }`}>
              {copied5EConfig ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied 5E Configuration (Copied!)</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Export 5E Configuration (Copy 5E Config)</span>
                </>
              )}
            </button>

            <button type="button" onClick={handleReset5EDefaults} title="reset 5E Reset all parameters to default"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
              isLight ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
              : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300' }`}>
              <RotateCcw className="h-3.5 w-3.5" />
              <span>reset 5E Default Parameters</span>
            </button>
          </div>
        </div>

        {showExported5ECode && (
          <CodeBlock title="current 5E Parameter Snapshot (Paste directly to set as default value)" language="typescript" isLight={isLight}
            code={build5EExportCode()} />
        )}
      </div>

      {/* Column 1: Rocket League Yellow & Outer Glow (`Out Glow`) Parameters */}
      <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${ isLight
        ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold font-mono">1. Color and Glow (Out Glow Tuner)</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setGlowConfig({ ...DEFAULT_RL_COUNTDOWN_GLOW });
              setIsVisibleOnStage(true);
            }}
            title="Reset to default outer glow preset (Intensity 100%, Kernel 0, Middle Layer 28, Background 0, Soft Light 0)"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>RL Default</span>
          </button>
        </div>

        <ColorSwatchInput label="Primary Text Color (Main Thin Text Color)" description="Rocket League Countdown default yellow #FFE600"
          value={glowConfig.textColor} onChange={(hex) => { setGlowConfig((prev) => ({ ...prev, textColor: hex,
          ...(syncGlowWithText ? { glowColor: hex, topLabelGlowColor: hex } : {}), })); setIsVisibleOnStage(true);
          }} presets={RL_GLOW_SWATCHES} isLight={isLight} />

        <div className="flex items-center justify-between px-1">
          <ToggleSwitch label="Outer glow color follows main text" checked={syncGlowWithText} onCheckedChange={(sync) => {
            setSyncGlowWithText(sync); if (sync) { setGlowConfig((prev) => ({ ...prev, glowColor: prev.textColor,
            topLabelGlowColor: prev.textColor, })); } setIsVisibleOnStage(true); }} isLight={isLight} />
        </div>

        <ColorSwatchInput label="Outer Glow Color (Out Glow Color)" description="Multi-layer Glow Color (Default Amber Gold #F59E0B)"
          value={glowConfig.glowColor} onChange={(hex) => { setGlowConfig((prev) => ({ ...prev, glowColor: hex,
          topLabelGlowColor: hex, })); setIsVisibleOnStage(true); }} presets={RL_GLOW_SWATCHES} isLight={isLight} />

        <ColorSwatchInput label="Top Regular Title Color (Top Label)" description="Winner / Status Top small text color"
          value={glowConfig.topLabelColor ?? '#FFFFFF'} onChange={(hex) => { setGlowConfig((prev) => ({ ...prev,
          topLabelColor: hex, })); setIsVisibleOnStage(true); }}
          presets={['#FFFFFF', '#FEF08A', '#E0F2FE', '#FFEDD5', '#FFE600', '#94A3B8']} isLight={isLight} />

        <SliderControl label="Out Glow Total Glow Intensity (Glow Intensity)" value={glowConfig.intensityPct} min={0} max={200}
          step={1} unit="%" editable allowOutOfBoundsInput colorScheme="amber" onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, intensityPct: v })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <SliderControl label="Core close to halo radius (Inner Core Blur)" value={glowConfig.innerBlurPx} min={0} max={40} step={1}
          unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, innerBlurPx: v })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <SliderControl label="Mid-layer glow radius (Outer Glow Blur)" value={glowConfig.outerBlurPx} min={0} max={80} step={1}
          unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, outerBlurPx: v })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <SliderControl label="Distant atmosphere glow radius (Ambient Halo Blur)" value={glowConfig.ambientBlurPx} min={0} max={120}
          step={1} unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, ambientBlurPx: v })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <SliderControl label="Radial soft light background (Backdrop Bloom)" value={glowConfig.backdropBloomPct ?? 0} min={0} max={100}
          step={1} unit="%" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, backdropBloomPct: v })); setIsVisibleOnStage(true); }}
          isLight={isLight} />

        <SliderControl label="Glyph stroke width (Text Stroke Width)" value={glowConfig.strokeWidthPx ?? 0} min={0} max={3}
          step={0.1} unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setGlowConfig((prev) => ({ ...prev, strokeWidthPx: v })); setIsVisibleOnStage(true); }} isLight={isLight} />
      </div>

      {/* Column 2: Duration (2000ms Default) & Animation Envelope Tuner */}
      <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${ isLight
        ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold font-mono">2. Duration and animation envelope (Duration &amp; Motion)</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setTimingConfig((prev) => ({
                ...DEFAULT_CENTER_UPPER_TIMING,
                persistentInspect: prev.persistentInspect,
              }));
              setCountdownIntervalMs(1000);
              setUpperCenterTopPct(40);
              setIsVisibleOnStage(true);
              setTriggerNonce((n) => n + 1);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>2000ms Default</span>
          </button>
        </div>

        <SliderControl label="Single display duration (Hold Duration before Exit)"
          description="default 2000ms (>1s); Full Appearance 2000ms Post-entry 400ms Fade Out, Directly overwrite when new data arrives midway" value={timingConfig.durationMs}
          min={200} max={5000} step={50} unit="ms" editable allowOutOfBoundsInput colorScheme="amber"
          onChange={(v) => { setTimingConfig((prev) => ({ ...prev, durationMs: v })); setIsVisibleOnStage(true); }}
          isLight={isLight} />

        {/* Quick Duration Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono opacity-65 mr-1">Quick Hold Duration:</span>
          {[1000, 1500, 2000, 2500, 3000].map((ms) => {
            const active = timingConfig.durationMs === ms;
            return (
              <button
                key={ms}
                type="button"
                onClick={() => {
                  setTimingConfig((prev) => ({ ...prev, durationMs: ms }));
                  setIsVisibleOnStage(true);
                  setTriggerNonce((n) => n + 1);
                }}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] border cursor-pointer transition-all ${
                  active
                    ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                    : isLight
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
              >
                {ms === 2000 ? '2000ms (Default)' : `${ms}ms`}
              </button>
            );
          })}
        </div>

        <SliderControl label="Entry zoom impact multiplier (Entry Scale Pop)" description="default 1.50x (from 1.50 Scale Retraction 1.00 Times); Support direct numeric input for arbitrary precision"
          value={timingConfig.entryScale} min={0.5} max={2.5} step={0.01} unit="x" editable allowOutOfBoundsInput
          formatValue={(v) => v.toFixed(2)} onChange={(v) => { setTimingConfig((prev) => ({ ...prev,
          entryScale: Number(v.toFixed(2)), })); setIsVisibleOnStage(true); setTriggerNonce((n) => n + 1); }}
          isLight={isLight} />

        <SliderControl label="Entry animation duration (Entry Pop Duration)" description="default 400ms, from 1.50x Rapid collapse to 1.00x"
          value={timingConfig.entryDurationMs} min={0} max={1000} step={10} unit="ms" editable
          allowOutOfBoundsInput onChange={(v) => { setTimingConfig((prev) => ({ ...prev, entryDurationMs: v }));
          setIsVisibleOnStage(true); setTriggerNonce((n) => n + 1); }} isLight={isLight} />

        <SliderControl label="Tail fade duration (Exit Fade Duration)" description="default 400ms; When no new data, Full Hold 2000ms Execute After 400ms Fade Out"
          value={timingConfig.exitDurationMs} min={0} max={1000} step={10} unit="ms" editable allowOutOfBoundsInput
          onChange={(v) => { setTimingConfig((prev) => ({ ...prev, exitDurationMs: v }));
          setIsVisibleOnStage(true); setTriggerNonce((n) => n + 1); }} isLight={isLight} />

        <SliderControl label="3-2-1-GO Step Overlay Interval (Sequence Step Interval)"
          description="default 1000ms; The entry animation is replayed by the next step before the previous step finishes exiting" value={countdownIntervalMs} min={200} max={3000}
          step={50} unit="ms" editable allowOutOfBoundsInput onChange={(v) => setCountdownIntervalMs(v)}
          isLight={isLight} />

        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold font-mono">HudAnchorStage Spatial Anchor Position (Upper-Center)</span>
          </div>
          <SliderControl label="Center anchor position (Upper-Center Top %)" description="default 40% (50% To screen center)"
            value={upperCenterTopPct} min={15} max={60} step={1} unit="%" editable allowOutOfBoundsInput
            onChange={(v) => { setUpperCenterTopPct(v); setIsVisibleOnStage(true); }} isLight={isLight} />
        </div>
      </div>

      {/* Column 3: Typography Tuner (JetBrains Mono Thin 100 & Regular 400) */}
      <div className={`p-5 rounded-3xl border flex flex-col gap-4 ${ isLight
        ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
        : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-bold font-mono">3. Font hierarchy tuning (JetBrains Mono)</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setTypoConfig({ ...DEFAULT_CENTER_UPPER_TYPOGRAPHY });
              setIsVisibleOnStage(true);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>

        <SliderControl label="Primary Font Size (Main Thin Font Size)"
          description="For 3-2-1-GO, BLUE/ORANGE TEAM, WAITING FOR PLAYERS" value={typoConfig.mainFontSizePx} min={36}
          max={136} step={1} unit="px" editable allowOutOfBoundsInput onChange={(v) => {
          setTypoConfig((prev) => ({ ...prev, mainFontSizePx: v })); setIsVisibleOnStage(true); }}
          isLight={isLight} />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">Primary Font Weight (Main Font Weight · default Thin 100)</span>
          <SegmentedSwitch size="sm" fullWidth isLight={isLight} value={String(typoConfig.mainFontWeight)}
            onValueChange={(v) => { setTypoConfig((prev) => ({ ...prev,
            mainFontWeight: Number(v) as 100 | 200 | 300 | 400, })); setIsVisibleOnStage(true); }} options={[
            { value: '100', label: 'Thin (100)' }, { value: '200', label: 'ExtraLight (200)' },
            { value: '300', label: 'Light (300)' }, { value: '400', label: 'Regular (400)' }, ]} />
        </div>

        <SliderControl label="Main text letter spacing (Main Letter Spacing · default 0)" value={typoConfig.mainLetterSpacingEm}
          min={-0.1} max={0.36} step={0.01} unit="em" editable allowOutOfBoundsInput
          formatValue={(v) => v.toFixed(2)} onChange={(v) => { setTypoConfig((prev) => ({ ...prev,
          mainLetterSpacingEm: Number(v.toFixed(2)), })); setIsVisibleOnStage(true); }} isLight={isLight} />

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex flex-col gap-3">
          <SliderControl label="Top title font size (Top Regular Font Size)" description="For WINNER Or match status prefix"
            value={typoConfig.topFontSizePx} min={12} max={52} step={1} unit="px" editable allowOutOfBoundsInput
            onChange={(v) => { setTypoConfig((prev) => ({ ...prev, topFontSizePx: v })); setIsVisibleOnStage(true);
            }} isLight={isLight} />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold">Top title font weight (Top Font Weight · default Regular 400)</span>
            <SegmentedSwitch size="sm" fullWidth isLight={isLight} value={String(typoConfig.topFontWeight)}
              onValueChange={(v) => { setTypoConfig((prev) => ({ ...prev,
              topFontWeight: Number(v) as 100 | 300 | 400 | 500, })); setIsVisibleOnStage(true); }} options={[
              { value: '100', label: 'Thin (100)' }, { value: '300', label: 'Light (300)' },
              { value: '400', label: 'Regular (400)' }, { value: '500', label: 'Medium (500)' }, ]} />
          </div>

          <SliderControl label="Top header letter spacing (Top Letter Spacing · default 0)" value={typoConfig.topLetterSpacingEm}
            min={-0.1} max={0.6} step={0.01} unit="em" editable allowOutOfBoundsInput
            formatValue={(v) => v.toFixed(2)} onChange={(v) => { setTypoConfig((prev) => ({ ...prev,
            topLetterSpacingEm: Number(v.toFixed(2)), })); setIsVisibleOnStage(true); }} isLight={isLight} />

          <SliderControl label="Vertical line spacing (Line Gap)" value={typoConfig.lineGapPx} min={0} max={28} step={1} unit="px"
            editable allowOutOfBoundsInput onChange={(v) => { setTypoConfig((prev) => ({ ...prev, lineGapPx: v }));
            setIsVisibleOnStage(true); }} isLight={isLight} />

          <div className="flex items-center justify-between pt-1">
            <ToggleSwitch label="Force Uppercase (Uppercase)" checked={typoConfig.uppercase} onCheckedChange={(v) => {
              setTypoConfig((prev) => ({ ...prev, uppercase: v })); setIsVisibleOnStage(true); }} isLight={isLight} />
            <ToggleSwitch label="Italic Motion (Italic)" checked={typoConfig.italic ?? false} onCheckedChange={(v) => {
              setTypoConfig((prev) => ({ ...prev, italic: v })); setIsVisibleOnStage(true); }} isLight={isLight} />
          </div>
        </div>
      </div>
    </section>
  );
};
