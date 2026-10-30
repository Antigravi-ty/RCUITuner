import React, { useState } from 'react';
import { NotebookPen, Video, Crosshair, Volume2, SmilePlus, Palette, } from 'lucide-react';
import { BounceSolidSvg } from '../../../ui-core/primitives/packagedSvgIcons';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { Badge } from '../../../ui-core/primitives/Badge';
import { SettingActionRow } from '../../../ui-core/compounds/SettingActionRow';
import { SettingToggleRow } from '../../../ui-core/compounds/SettingToggleRow';
import { SettingSliderRow } from '../../../ui-core/compounds/SettingSliderRow';
import { SettingSegmentedRow } from '../../../ui-core/compounds/SettingSegmentedRow';
import { SettingPresetCustomRow } from '../../../ui-core/compounds/SettingPresetCustomRow';
import { SettingDeveloperStatusRow } from '../../../ui-core/compounds/SettingDeveloperStatusRow';
import { TelemetryConfigCard } from '../../../ui-core/compounds/TelemetryConfigCard';
import { CodeBlock } from '../../CodeBlock';
import { useSettingActionRowStore } from '../../../ui-core/stores/settingRowStore';

export interface SettingActionRowArchetypeSectionsProps {
  isLight: boolean;
  showStandalonePreview: boolean;
  showCode: boolean;
}

export const SettingActionRowArchetypeSections: React.FC<
  SettingActionRowArchetypeSectionsProps
> = ({ isLight, showStandalonePreview, showCode }) => {
  const {
    paddingX,
    rowGap,
    titleFontSize,
    buttonFontSize,
    buttonPaddingX,
    buttonPaddingY,
    buttonRadius,
    trajectoryRowLayout,
    sliderLayout,
    sliderTrackWidth,
    sliderShowStepper,
    sliderEditableInUserMode,
    sliderEditableInDevMode,
    sliderValueFontSize,
    segmentedLayout,
    pacingPriorityControl,
    advancedBordered,
    advancedShowBadges,
    presetCustomVariation,
    presetCustomSliderWidth,
    presetCustomAnimDuration,
    devStatusAccentColor,
    devStatusInteractiveToggle,
    telemetryVariation,
    telemetryTriggerPosition,
    telemetryDefaultCollapsed,
    floatingOpacityOrder,
    setToken,
    exportConfigCode,
  } = useSettingActionRowStore();

  const [perRowColorDemo, setPerRowColorDemo] = useState<string>('');
  const [demoBallCam, setDemoBallCam] = useState(true);
  const [demoTrajectory, setDemoTrajectory] = useState(true);
  const [demoVolume, setDemoVolume] = useState(80);
  const [demoPacing, setDemoPacing] = useState<
    'competitive' | 'balanced' | 'motion' | 'input-consistency'
  >('balanced');
  const [demoUiScaleVal, setDemoUiScaleVal] = useState(115);
  const [demoDevMode, setDemoDevMode] = useState(false);

  return (
    <>
      {/* Group 3: Archetype-Specific Decoupled Controls (Slider / Composite / Segmented / Advanced) */}
      <div className="flex flex-col gap-3.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
            3 · Decoupled layout and interaction strategy for each setting row (Slider Inline Progress Bar · User/Dev Number Input · Ballistic Compound Row · Advanced Noise Reduction)
          </span>
        </div>

        {/* 3A: Slider Row Controls */}
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3 ${ isLight
          ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/40 border-neutral-800/80' }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold">A. Slider Row (`SettingSliderRow`):</span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'inline', label: 'Single Row Inline (Title + Progress bar + Value Inline)' },
                    { id: 'stacked', label: 'Double Row Stacked (Top Row Title+Value / Full-width bottom progress bar)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('sliderLayout', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      sliderLayout === opt.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <ToggleSwitch checked={sliderEditableInUserMode}
                onCheckedChange={(v) => setToken('sliderEditableInUserMode', v)} label="User Mode Allow text input for values"
                variant="neutral" isLight={isLight} />
              <ToggleSwitch checked={sliderEditableInDevMode}
                onCheckedChange={(v) => setToken('sliderEditableInDevMode', v)} label="Developer Mode Allow text input for values"
                variant="amber" isLight={isLight} />
              <ToggleSwitch checked={sliderShowStepper} onCheckedChange={(v) => setToken('sliderShowStepper', v)}
                label="show -/+ Stepper Buttons" variant="neutral" isLight={isLight} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <SliderControl label="Single-line progress bar track width (sliderTrackWidth)" value={sliderTrackWidth} min={100} max={320}
              step={4} unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="emerald"
              onChange={(v) => setToken('sliderTrackWidth', v)} isLight={isLight} />
            <SliderControl label="Slider Value Font Size (sliderValueFontSize)" value={sliderValueFontSize} min={10} max={16}
              step={1} unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="emerald"
              onChange={(v) => setToken('sliderValueFontSize', v)} isLight={isLight} />
          </div>
        </div>

        {/* 3B: Composite Row + Segmented / Dropdown + Advanced Cleanup */}
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3 ${ isLight
          ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/40 border-neutral-800/80' }`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Ball Trajectory Predictor Layout */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-300">
                B. Ball Trajectory Predictor (Switch + Configure):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'inline', label: 'Inline Compact ([Configure] + [Switch])' },
                    { id: 'stacked', label: 'Split into Two Rows (Top Switch / Down Configure)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('trajectoryRowLayout', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      trajectoryRowLayout === opt.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Segmented Control Default Layout */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-300">
                C. Standard segment toggle row (`SettingSegmentedRow`):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'inline', label: 'Same Row Right (Title ... Segmented)' },
                    { id: 'stacked', label: 'Double Row (Top Title / Down Segmented)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('segmentedLayout', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      segmentedLayout === opt.id
                        ? 'bg-sky-500 text-white border-sky-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Priority Control */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-300">
                D. Experience Priority (Gameplay · 5Level Preference Includes Custom):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'segmented-inline', label: 'Same-row right segmentation (default)' },
                    { id: 'segmented-stacked', label: 'Separate segment in row below' },
                    { id: 'dropdown', label: 'Dropdown Dropdown Menu' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('pacingPriorityControl', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      pacingPriorityControl === opt.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Bordered & Badge Toggles */}
          <div className="flex items-center gap-6 flex-wrap pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <ToggleSwitch checked={advancedBordered} onCheckedChange={(v) => setToken('advancedBordered', v)}
              label="Advanced Complex block independent stroke (Default Off: Reduce Grid Clutter, Ensure right-side switch alignment)" variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={advancedShowBadges} onCheckedChange={(v) => setToken('advancedShowBadges', v)}
              label="Advanced Color status next to title Badge (Default Off: Reduce Visual Noise)" variant="neutral" isLight={isLight} />
          </div>
        </div>

        {/* 3C: New Decoupled Component Variations (UI Scaling/Render Scale + Developer Status Badge + Show Telemetry Summary + Order) */}
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3.5 ${ isLight
          ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/40 border-neutral-800/80' }`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            4 · Specialized decoupled component variant lab (UI Scaling / Render Scale Component Linkage · Developer Status Badge · Show Telemetry Summary)
          </span>

          {/* Sub-section 1: SettingPresetCustomRow (UI Scaling & Render Scale) */}
          <div id="setting-preset-custom-tuner" className="scroll-mt-24 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-mono font-bold text-[11px]">
                  6A.4S-E
                </span>
                <span className="text-xs font-bold">
                  E. `SettingPresetCustomRow` (UI Scaling &amp; Render Scale Shared Presets+Custom Slider Variant):
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'slide-reveal', label: '① Slide-Reveal (click Custom Shift Left+Background slide-out integration · 0Increase Height)' },
                    { id: 'morph-pill', label: '② Morph-Pill (CustomCapsule-embedded slider extension)' },
                    { id: 'popover-scrub', label: '③ Apple Popover (Adjustment Popover · Do not crowd bottom row)' },
                    { id: 'below-row', label: '④ Below-Row (Traditional expanded second row Custom Slider)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('presetCustomVariation', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      presetCustomVariation === opt.id
                        ? 'bg-amber-500 text-white border-amber-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <SliderControl label="Custom Slide-out Track Width (presetCustomSliderWidth)" value={presetCustomSliderWidth}
                min={96} max={280} step={4} unit="px" editable={true} allowOutOfBoundsInput={true}
                colorScheme="amber" onChange={(v) => setToken('presetCustomSliderWidth', v)} isLight={isLight} />
              <SliderControl label="Left shift and transition duration (presetCustomAnimDuration)" value={presetCustomAnimDuration}
                min={120} max={600} step={20} unit="ms" editable={true} allowOutOfBoundsInput={true}
                colorScheme="amber" onChange={(v) => setToken('presetCustomAnimDuration', v)} isLight={isLight} />
            </div>
          </div>

          {/* Sub-section 2: SettingDeveloperStatusRow & Floating Window Opacity Order */}
          <div id="setting-dev-status-tuner"
            className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-mono font-bold text-[11px]">
                  6A.4S-F
                </span>
                <span className="text-xs font-bold">
                  F. `SettingDeveloperStatusRow` (Advanced First Position · Disabled / Active Color Customization):
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(
                  [
                    { id: 'emerald', label: 'Emerald Active Badge + Green Icon (Emerald)' },
                    { id: 'amber', label: 'warm orange Active Badge + Orange Icon (Amber)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('devStatusAccentColor', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      devStatusAccentColor === opt.id
                        ? opt.id === 'emerald'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-amber-500 text-white border-amber-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <ToggleSwitch checked={devStatusInteractiveToggle}
                  onCheckedChange={(v) => setToken('devStatusInteractiveToggle', v)}
                  label="Allow Clicks Badge Toggle Active/Disabled" variant="neutral" isLight={isLight} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold">
                G. Advanced · Floating Window Opacity Sort Position (`floatingOpacityOrder`):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'last', label: 'Fix last digit (Last · default)' },
                    { id: 'first-when-inactive', label: 'Bring Forward When Inactive / Send to Bottom When Active' },
                    { id: 'first', label: 'Pin to Front (Follow Developer Settings)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('floatingOpacityOrder', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      floatingOpacityOrder === opt.id
                        ? 'bg-sky-500 text-white border-sky-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-section 3: Show Telemetry Summary (TelemetryConfigCard) Variations */}
          <div id="setting-telemetry-summary-tuner"
            className="scroll-mt-24 flex flex-col gap-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 font-mono font-bold text-xs">
                  6A.4S-H
                </span>
                <Badge variant="primary" size="sm" isLight={isLight}>
                  L3.8 TelemetryConfigCard
                </Badge>
                <span className="text-xs font-bold">
                  H. `Show Telemetry Summary` (`TelemetryConfigCard` Collapsed and embedded alignment variants + live preview):
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'underline-disclosure', label: '① Underlined Show ▾ + Expand light frame wrap (Collapse by Default)' },
                    { id: 'apple-grouped-inset', label: '② Apple System Settings Integrated inline group box (Grouped Inset)' },
                    { id: 'flush-aligned', label: '③ Flush Horizontal + Left Vertical Guide (Fix left-right misalignment)' },
                    { id: 'tree-guide', label: '④ Tree indentation guide lines (Tree Guide)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setToken('telemetryVariation', opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      telemetryVariation === opt.id
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-neutral-400">Underlined `Show ▾` Position:</span>
                {(
                  [
                    { id: 'left', label: 'Toggle left (Left)' },
                    { id: 'right', label: 'Toggle right (Right)' },
                  ] as const
                ).map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setToken('telemetryTriggerPosition', pos.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                      telemetryTriggerPosition === pos.id
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                        : isLight
                        ? 'bg-white border-neutral-200 text-neutral-600'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              <ToggleSwitch checked={telemetryDefaultCollapsed}
                onCheckedChange={(v) => setToken('telemetryDefaultCollapsed', v)}
                label="Collapse Below by Default 5 Sub-indicator (click Show ▾ expand)" variant="neutral" isLight={isLight} />
            </div>

            {/* Live Co-located Preview of TelemetryConfigCard right inside 6A.4S-H */}
            <div className={`p-3.5 rounded-xl border ${ isLight ? 'bg-white border-emerald-200/80 shadow-2xs'
              : 'bg-neutral-950/90 border-emerald-900/40' }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-emerald-500">
                  [6A.4S-H / L3.8] Show Telemetry Summary Real-time interaction preview (click Show ▾ / Hide ▴ Test Expand)
                </span>
                <span className="text-[10px] font-mono opacity-60">
                  Current Variant: {telemetryVariation} · Trigger: {telemetryTriggerPosition}
                </span>
              </div>
              <TelemetryConfigCard isLight={isLight} />
            </div>
          </div>
        </div>
      </div>

      {/* Optional Standalone Live Preview (shown on L1 TabsPage) */}
      {showStandalonePreview && (
        <div className={`p-4 rounded-xl border flex flex-col ${ isLight ? 'bg-neutral-100/60 border-neutral-200/80'
          : 'bg-neutral-950/70 border-neutral-800' }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <span className="text-[11px] font-mono font-bold text-amber-500">
              live preview (Include All 5 Unified setting row prototype · Title Uniform {titleFontSize}px · Uniform right edge {paddingX}px)
            </span>
            <div className="flex items-center gap-3 flex-wrap text-[10px] font-mono">
              <ToggleSwitch checked={demoDevMode} onCheckedChange={setDemoDevMode}
                label={demoDevMode ? 'Preview Mode: Developer Mode' : 'Preview Mode: User Mode'} variant="amber" isLight={isLight} />
              <span className="text-neutral-400">No.1Row iconColor:</span>
              {[
                { val: '', label: 'Default Gray' },
                { val: 'text-amber-500', label: 'amber' },
                { val: '#10b981', label: '#10b981' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setPerRowColorDemo(opt.val)}
                  className={`px-2 py-0.5 rounded border cursor-pointer ${
                    perRowColorDemo === opt.val
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-600'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full" style={{ gap: `${rowGap}px` }}>
            <SettingActionRow icon={NotebookPen} iconColor={perRowColorDemo || undefined}
              title="Training Mode Configuration"
              description="Boost mode, goal barrier & car hitbox collision overlay" isLight={isLight} />
            <SettingActionRow icon={Video} title="Camera Settings"
              description="Field of view, distance, height, angle & tracking stiffness" isLight={isLight} />
            <SettingToggleRow icon={Crosshair} title="Ball Cam Indicator"
              description="Show directional indicator arrow when the ball is off-screen" checked={demoBallCam}
              onCheckedChange={setDemoBallCam} isLight={isLight} />
            <SettingActionRow icon={BounceSolidSvg} title="Ball Trajectory Predictor"
              description="Real-time physics path & bounce arc visualization in training" isLight={isLight}
              rightSlot={ <div className="flex items-center gap-2.5"> {trajectoryRowLayout === 'inline' && (
              <button type="button" disabled={!demoTrajectory} style={{ fontSize: `${buttonFontSize}px`,
              paddingLeft: `${buttonPaddingX}px`, paddingRight: `${buttonPaddingX}px`,
              paddingTop: `${buttonPaddingY}px`, paddingBottom: `${buttonPaddingY}px`,
              borderRadius: `${buttonRadius}px`, }}
              className={`inline-flex items-center font-semibold border transition-all ${ demoTrajectory ? isLight
              ? 'bg-white border-neutral-200/90 text-neutral-700 shadow-2xs cursor-pointer'
              : 'bg-neutral-900 border-neutral-700/80 text-neutral-200 cursor-pointer'
              : 'opacity-40 cursor-not-allowed border-transparent' }`} > Configure </button> )}
              <ToggleSwitch checked={demoTrajectory} onCheckedChange={setDemoTrajectory} variant="amber"
              isLight={isLight} /> </div> } />
            <SettingSliderRow icon={Volume2} label="Master Volume"
              description="Overall game sound output level across all audio buses." value={demoVolume} min={0}
              max={100} step={1} unit="%" developerMode={demoDevMode} onChange={setDemoVolume} isLight={isLight} />
            <SettingSegmentedRow icon={SmilePlus} label="Experience Priority"
              description="Balance competitive responsiveness, frame motion, and input consistency."
              value={demoPacing} onChange={setDemoPacing}
              controlType={pacingPriorityControl === 'dropdown' ? 'dropdown' : 'segmented'}
              layout={pacingPriorityControl === 'segmented-stacked' ? 'stacked' : 'inline'} options={[
              { value: 'competitive', label: 'Competitive' }, { value: 'balanced', label: 'Balanced' },
              { value: 'motion', label: 'Motion' }, { value: 'input-consistency', label: 'Input Consistency' },
              { value: 'custom', label: 'Custom' }, ]} isLight={isLight} />
            <SettingPresetCustomRow icon={Palette} label="UI Scaling"
              description="Preset scales or smooth slide-reveal custom scale factor." value={demoUiScaleVal}
              presets={[ { value: 100, label: '100%' }, { value: 125, label: '125%' },
              { value: 150, label: '150%' }, ]} defaultCustomValue={115} min={75} max={150} step={1} unit="%"
              onChange={setDemoUiScaleVal} isLight={isLight} />
            <SettingDeveloperStatusRow
              developerMode={demoDevMode}
              onDeveloperModeChange={setDemoDevMode}
              isLight={isLight}
            />
          </div>
        </div>
      )}

      {showCode && (
        <CodeBlock
          isLight={isLight}
          title="src/tokens/settingRowStore.ts & Six types of decoupled setting row primitives"
          code={`${exportConfigCode()}

// 1. Nav Button Row (SettingActionRow)
<SettingActionRow icon={NotebookPen} title="Training Mode Configuration" onAction={onNavigateTrainingDetail}
  isLight={isLight} />

// 2. Switch Row (SettingToggleRow - Auto-align Right paddingX)
<SettingToggleRow icon={Crosshair} title="Ball Cam Indicator" checked={ballCamIndicator}
  onCheckedChange={setBallCamIndicator} isLight={isLight} />

// 3. Slider Row (SettingSliderRow - Unified read-only drag value, User/Dev Disable Manual Entry, Dev Handled By Developer Menu Override)
<SettingSliderRow icon={Volume2} label="Master Volume" value={masterVol} min={0} max={100} unit="%"
  developerMode={developerMode} onChange={setMasterVol} isLight={isLight} />`}
        />
      )}
    </>
  );
};
