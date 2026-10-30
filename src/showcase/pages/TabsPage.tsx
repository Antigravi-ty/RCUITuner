import React from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { Volume2, Monitor, Gamepad2, Check } from 'lucide-react';

const useState = createScopedSyncedState('page:tabs');
import { UnderlineTabs, TabItem } from '../../ui-core/primitives/UnderlineTabs';
import { SegmentedSwitch } from '../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../ui-core/primitives/ToggleSwitch';
import { Checkbox } from '../../ui-core/primitives/Checkbox';
import { SliderControl } from '../../ui-core/primitives/SliderControl';
import { DualGrabberSlider } from '../../ui-core/primitives/DualGrabberSlider';
import { PrecisionDigitPicker, TunerPrecisionContext } from '../../ui-core/primitives/PrecisionDigitPicker';
import { Badge } from '../../ui-core/primitives/Badge';
import { CodeBlock } from '../CodeBlock';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import { SettingActionRowTuner } from './tabs/SettingActionRowTuner';
import { UnderlineTabsTuner } from './tabs/UnderlineTabsTuner';

const L1_TABS_JUMP_ITEMS: JumpDirectoryItem[] = [
  { id: 'l1-setting-action-row', code: 'L1.0', name: 'SettingActionRow',
    label: 'Set nav row (border · Description · Padding · font size · SVG Color tuning)', badge: 'L1 ⇄ L6 ⇄ L7' },
  { id: 'l1-underline-tabs', code: 'L1.1', name: 'UnderlineTabs',
    label: 'Sliding underline tab bar (font size · Icon Size · spacing · Real-time font weight tuning)', badge: 'L1 ⇄ L6 ⇄ L7' },
  { id: 'l1-segmented-switch', code: 'L1.2', name: 'SegmentedSwitch', label: 'Rounded rectangle tactile segment controller', badge: 'L1 Primitive' },
  { id: 'l1-slider-control', code: 'L1.3', name: 'SliderControl',
    label: 'Stepper slider and Centered Center bidirectional fill variant', badge: 'L1 Primitive' },
  { id: 'l1-dual-grabber-slider', code: 'L1.4', name: 'DualGrabberSlider',
    label: 'Dual-slider center deadzone and free-range controller', badge: 'L1 Primitive' },
  { id: 'l1-precision-digit-picker', code: 'L1.5', name: 'PrecisionDigitPicker',
    label: '1.00000 Decimal step precision selector', badge: 'L1 Primitive' },
  { id: 'l1-toggle-switch', code: 'L1.6', name: 'ToggleSwitch', label: 'Apple HIG Haptic toggle', badge: 'L1 Primitive' },
  { id: 'l1-checkbox', code: 'L1.7', name: 'Checkbox',
    label: 'Haptic rounded checkbox (Support palette · corner radius · Stroke weight · Indeterminate state)', badge: 'L1 Primitive' },
];

export const TabsPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // Tabs State (testing multiple independent instances)
  const [activeTab1, setActiveTab1] = useState('audio');
  const [activeTab2, setActiveTab2] = useState('all');

  // Segmented Switch States (testing multiple independent instances)
  const [switch1, setSwitch1] = useState('performance');
  const [switch2, setSwitch2] = useState('mid');
  const [switch3, setSwitch3] = useState('long-label');
  const [switch4, setSwitch4] = useState('proportional-2');

  // Sliders State
  const [sliderNeutral, setSliderNeutral] = useState(75);
  const [sliderAmber, setSliderAmber] = useState(50);
  const [sliderCentered, setSliderCentered] = useState(18);
  const [sliderTrim, setSliderTrim] = useState(-24);
  const [sliderUnityGain, setSliderUnityGain] = useState(180);

  // Dual-Grabber Slider States (from RLCleanWASM SettingTwoGrabberSliderRow)
  const [bufferTargetAlpha, setBufferTargetAlpha] = useState(3);
  const [deadbandOffsets, setDeadbandOffsets] = useState<[number, number]>([-2, 2]);
  const [freeBand, setFreeBand] = useState<[number, number]>([120, 340]);

  // Precision Digit Picker State (from RLCleanWASM DriftwoodsTunerControls)
  const [precisionStep, setPrecisionStep] = useState(0.001);
  const [uvScaleX, setUvScaleX] = useState(1.0425);
  const [lineSmoothness, setLineSmoothness] = useState(0.0512);

  // Toggles State
  const [toggleGreen, setToggleGreen] = useState(true);
  const [toggleBlack, setToggleBlack] = useState(true);
  const [toggleOrange, setToggleOrange] = useState(true);

  const tabs1: TabItem[] = [
    { id: 'audio', label: 'Audio', icon: <Volume2 className="h-4 w-4" /> },
    { id: 'video', label: 'Graphics', icon: <Monitor className="h-4 w-4" />, badge: <Badge size="sm" variant="amber" isLight={isLight}>NEW</Badge> },
    { id: 'gameplay', label: 'Gameplay', icon: <Gamepad2 className="h-4 w-4" /> },
  ];

  const tabs2: TabItem[] = [
    { id: 'all', label: 'All items' },
    { id: 'installed', label: 'Assembled components', badge: <Badge size="sm" variant="neutral" isLight={isLight}>8</Badge> },
    { id: 'locked', label: 'Locked', disabled: true },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tabs & Controls Atomic controls and setting row primitives</h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Lightweight high-order atomic interaction controls: Contains decoupled setting navigation row primitives (<code className="font-mono">SettingActionRow</code>), Warm orange underline, Rounded rectangle segmented controller, Supports bidirectional filling from center zero point SliderControl, Dual-slider deadzone controller (DualGrabberSlider), Decimal step precision selector (PrecisionDigitPicker) And physical switch. 
        </p>
      </div>

      <PageJumpDirectory title="L1 · Tabs / Switch / Slider / SettingActionRow Jump-to directory"
        subtitle="Click the card to smoothly scroll to the corresponding atomic control or tuner, Supports one-click copy of standardized component codes" items={L1_TABS_JUMP_ITEMS} isLight={isLight} />

      {/* 0. SettingActionRow Standalone Primitive & Tuner */}
      <div id="l1-setting-action-row" className="scroll-mt-6 flex flex-col gap-3">
        <SettingActionRowTuner
          isLight={isLight}
          title="0. Set navigation row primitives and independent tuner (SettingActionRow · border / Description Visibility / Padding / SVG Icon color)"
          showStandalonePreview={true}
        />
      </div>

      {/* 1. Underline Tabs Standalone Tuner & Multi-Instance Preview */}
      <div id="l1-underline-tabs" className="scroll-mt-6 flex flex-col gap-4">
        <UnderlineTabsTuner
          isLight={isLight}
          title="1. Apple/Linear Sliding underline label primitive and independent tuner (UnderlineTabs · font size / Icon Size / spacing / Font Weight)"
          showStandalonePreview={true}
        />

        <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
          isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs">Multi-instance isolation verification (React useId() Standalone layoutId)</span>
            <Badge size="sm" variant="amber" isLight={isLight}>Orange underline / Multi-instance non-preemptive indicator</Badge>
          </div>

          {/* Instance A */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-neutral-400">Instance A (With icon and Badge):</span>
            <UnderlineTabs
              items={tabs1}
              activeId={activeTab1}
              onChange={setActiveTab1}
              isLight={isLight}
            />
          </div>

          {/* Instance B */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <span className="text-xs font-semibold text-neutral-400">Instance B (Includes disabled state and count Badge):</span>
            <UnderlineTabs
              items={tabs2}
              activeId={activeTab2}
              onChange={setActiveTab2}
              isLight={isLight}
            />
          </div>
        </div>
      </div>

      {/* 2. Segmented Switch */}
      <div id="l1-segmented-switch" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-6 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">2. Haptic segment controller (SegmentedSwitch)</span>
          <Badge size="sm" variant="neutral" isLight={isLight}>rounded rectangle / Multi-instance isolation</Badge>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Fix over-rounded capsule issue, Adopt standard rounded rectangle (<code className="font-mono text-amber-500">rounded-lg / rounded-md</code>) ; Comprehensive solution for multi-instance indicator conflicts; Supports <strong>Auto Compact</strong>, <strong>Equidistant (Equal)</strong>, <strong>Content proportional distribution (Proportional)</strong> Three width distributions. 
        </p>

        {/* Feature 1: Multi-instance Coexistence Demonstration */}
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Check className="h-4 w-4 text-emerald-500" />
            <span>Feature 1: Multi-instance concurrency (Render respective white/Highlight active indicator) </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono text-neutral-400">Controller 1:</span>
              <SegmentedSwitch value={switch1} onValueChange={setSwitch1} isLight={isLight} options={[
                { value: 'quality', label: 'Quality' }, { value: 'balanced', label: 'Balanced' },
                { value: 'performance', label: 'Performance' }, ]} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono text-neutral-400">Controller 2 (Independent activation):</span>
              <SegmentedSwitch value={switch2} onValueChange={setSwitch2} isLight={isLight} options={[
                { value: 'low', label: 'Low' }, { value: 'mid', label: 'Medium' },
                { value: 'high', label: 'High' }, ]} />
            </div>
          </div>
        </div>

        {/* Feature 2: Width Distribution Modes */}
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold text-neutral-400">Feature 2: Width distribution mode (Width Distribution Modes)</span>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">
                A. align left / Content length adaptation (<code className="font-mono text-amber-500">distribution="auto"</code>):
              </span>
              <span className="text-[11px] text-neutral-400">Long text occupies more proportion, Short text occupies less ratio</span>
            </div>
            <SegmentedSwitch value={switch3} onValueChange={setSwitch3} isLight={isLight} distribution="auto"
              options={[ { value: 'short', label: 'Short' }, { value: 'medium-label', label: 'Medium length label' },
              { value: 'long-label', label: 'Long detailed setting options (Longer Content)' }, ]} />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">
                B. Equal spacing / Distribute evenly (<code className="font-mono text-amber-500">distribution="equal" / fullWidth</code>):
              </span>
              <span className="text-[11px] text-neutral-400">Regardless of length, Each segment strictly divides width equally</span>
            </div>
            <SegmentedSwitch value={switch3} onValueChange={setSwitch3} isLight={isLight} distribution="equal"
              options={[ { value: 'short', label: 'Short' }, { value: 'medium-label', label: 'Medium length label' },
              { value: 'long-label', label: 'Longer options (Distribute align)' }, ]} />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-400">
                C. Fill proportionally by width (<code className="font-mono text-amber-500">distribution="proportional"</code>):
              </span>
              <span className="text-[11px] text-neutral-400">Fill full row width, Maintain content weight and spacing</span>
            </div>
            <SegmentedSwitch value={switch4} onValueChange={setSwitch4} isLight={isLight}
              distribution="proportional" options={[ { value: 'proportional-1', label: 'Compact' },
              { value: 'proportional-2', label: 'Balanced Proportion' },
              { value: 'proportional-3', label: 'Expanded High Priority Segment' }, ]} />
          </div>
        </div>
      </div>

      {/* 3. Slider Control (Default + Centered Bipolar Variation + Custom Anchor) */}
      <div id="l1-slider-control" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm">3. Stepped slider fine-tuner (SliderControl - Includes center-zero bidirectional fill variant)</span>
          <Badge size="sm" variant="amber" isLight={isLight}>support Centered Bidirectional fill / Input enabled</Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Completely remove harsh blue highlights. Support standard left-to-right fill (<code className="font-mono text-amber-500">variation="default"</code>) Reference from center zero or arbitrary anchor point to the left/Bidirectional right fill (<code className="font-mono text-amber-500">variation="centered"</code>), Supports one-click reset to baseline and direct inline input (<code className="font-mono text-amber-500">editable={'{true}'}</code>). 
        </p>

        {/* Neutral Monochrome Default */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-neutral-400">A. Default left-to-right unidirectional fill (Neutral Mono Scheme):</span>
          <SliderControl label="Field of View (FOV)" description="Adjust 3D perspective camera field of view (FOV) (Neutral black and white non-saturated track segment) "
            value={sliderNeutral} min={60} max={120} step={1} unit="°" onChange={setSliderNeutral}
            colorScheme="neutral" isLight={isLight} />
        </div>

        {/* Warm Amber Variant */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <span className="text-xs font-semibold text-neutral-400">B. Warm orange theme (Warm Amber Scheme):</span>
          <SliderControl label="Master Volume" description="Master mix output gain (Soft warm track) " value={sliderAmber} min={0} max={100}
            step={5} unit="%" onChange={setSliderAmber} colorScheme="amber" isLight={isLight} />
        </div>

        {/* Centered / Bipolar Variation (Positive & Negative bi-directional fill from origin) */}
        <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-amber-500">C. Centrally symmetric / Anchor bidirectional fill variant (Centered / Bipolar Variation):</span>
            <Badge size="sm" variant="amber" isLight={isLight}>variation="centered" · Bidirectional fill</Badge>
          </div>
          <p className={`text-[11px] ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
            When slider has positive/negative values (e.g. <code className="font-mono">-50 ~ +50</code> or <code className="font-mono">-180° ~ +180°</code>) Or specific unit reference point (e.g. <code className="font-mono">100%</code> Standard gain) Time, No longer rigidly filling from the far left, Instead of <code className="font-mono">origin</code> Center-to-left (Negative offset) Or to the right (Positive offset) Dynamic fill, Double-click the track segment or click the zero-badge to reset to zero: 
          </p>

          <SliderControl label="Steering Trim (Balance fine-tuning · Center 0 Point)" description="By center 0% As base point: Positive fill right, Negative fill left, Support color-coded positive/negative"
            value={sliderCentered} min={-50} max={50} step={1} unit="%" onChange={setSliderCentered}
            variation="centered" origin={0} showSign={true} colorScheme="neutral" isLight={isLight} />

          <SliderControl label="Boost Pad Symmetry Rotation (Boost pad symmetry rotation · Positive/negative contrast)"
            description="Negative angle from 0° Fill left with sky blue, Positive angle from 0° Fill right with warm orange, Support direct input of precise angles" value={sliderTrim} min={-180} max={180}
            step={1} unit="°" onChange={setSliderTrim} variation="centered" origin={0} showSign={true}
            colorScheme="amber" negativeColorScheme="sky" editable={true} isLight={isLight} />

          <SliderControl label="Acoustic Bus Gain (0% ~ 500% Volume matrix · Custom anchor origin=100%)"
            description="benchmark RLCleanWASM Layer 4 Advanced audio matrix: By 100% (Unity Gain) For non-centered anchor point, Lower than 100% Decay left, Higher than 100% Amplify right"
            value={sliderUnityGain} min={0} max={500} step={5} unit="%" onChange={setSliderUnityGain}
            variation="centered" origin={100} colorScheme="emerald" negativeColorScheme="amber" editable={true}
            isLight={isLight} />
        </div>
      </div>

      {/* 4. Dual-Grabber Slider (Modularized from RLCleanWASM SettingTwoGrabberSliderRow) */}
      <div id="l1-dual-grabber-slider" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm">4. Dual-slider center deadzone and range controller (DualGrabberSlider)</span>
          <Badge size="sm" variant="amber" isLight={isLight}>RLCleanWASM Modular extraction / [-α .. +α]</Badge>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          From <code className="font-mono text-amber-500">RLCleanWASM</code> Decoupled extraction of network input buffer dead-zone controller. support <strong>Center-split deadzone mode (<code className="font-mono">mode="centered-deadband"</code>)</strong> (Left slider limit <code className="font-mono">[-α .. 0]</code> Control Catch-up Catch-up threshold, Right slider limited to <code className="font-mono">[0 .. +α]</code> Control Skip Frame drop threshold, Both can be centered 0 Point convergence) and <strong>Free range mode (<code className="font-mono">mode="free-range"</code>)</strong>. 
        </p>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-neutral-400">A. Center deadzone bidirectional dual-slider (Centered Split-Domain Deadband):</span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="text-neutral-400">Target α:</span>
            {[2, 3, 4, 6].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setBufferTargetAlpha(a);
                  setDeadbandOffsets(([l, r]) => [Math.max(-a, l), Math.min(a, r)]);
                }}
                className={`px-2 py-0.5 rounded border cursor-pointer ${
                  bufferTargetAlpha === a
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
              >
                α={a}
              </button>
            ))}
          </div>
        </div>

        <DualGrabberSlider
          label="Threshold Tolerance Deadband"
          subtitle={`Allowed server input queue jitter around target α (${bufferTargetAlpha}). Catch-up triggers below, step skip triggers above.`}
          target={bufferTargetAlpha}
          value={deadbandOffsets}
          onChange={setDeadbandOffsets}
          mode="centered-deadband"
          colorScheme="amber"
          isLight={isLight}
        />

        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-400">B. Free dual-slider range selection (Free-Range Interval Mode):</span>
          <DualGrabberSlider
            label="Collision Impulse Bandpass Filter"
            subtitle="Trigger collision sound effects only within the lower and upper impulse thresholds"
            min={0}
            max={500}
            step={10}
            unit=" N·s"
            value={freeBand}
            onChange={setFreeBand}
            mode="free-range"
            leftLabel="Min Gate"
            rightLabel="Max Gate"
            colorScheme="emerald"
            isLight={isLight}
          />
        </div>
      </div>

      {/* 5. Precision Digit Picker (Modularized from RLCleanWASM DriftwoodsTunerControls) */}
      <div id="l1-precision-digit-picker" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm">5. Decimal place step precision selector (PrecisionDigitPicker)</span>
          <Badge size="sm" variant="success" isLight={isLight}>1 . 0 0 0 0 0 Precision decoupled context</Badge>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          From <code className="font-mono text-emerald-500">RLCleanWASM</code> of Driftwoods Stadium texture tuner decoupling standardization. click <code className="font-mono">1 . 0 0 0 0 0</code> Click any digit to toggle stepping granularity (from <code className="font-mono">±1.0</code> Until <code className="font-mono">±0.00001</code>) , Combine with <code className="font-mono">TunerPrecisionContext</code> Set children <code className="font-mono">SliderControl</code> Supports lossless decimal fine-tuning via keyboard arrow keys. 
        </p>

        <TunerPrecisionContext.Provider value={{ step: precisionStep, setStep: setPrecisionStep }}>
          <PrecisionDigitPicker
            step={precisionStep}
            onStepChange={setPrecisionStep}
            colorScheme="emerald"
            isLight={isLight}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/50 border-neutral-800'}`}>
              <SliderControl label="Ground UV Scale X" description="Press after focusing input ↑ / ↓ Experience current selected digital step" value={uvScaleX}
                min={0.5} max={2.0} step={0.0001} origin={1.0} variation="centered" colorScheme="emerald"
                editable={true} usePrecisionContext={true} onChange={setUvScaleX} isLight={isLight} />
            </div>

            <div className={`p-3 rounded-xl border ${isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/50 border-neutral-800'}`}>
              <SliderControl label="Shader Line Smoothness" description="Support up to 5 Zero-truncated floating-point precision adjustment"
                value={lineSmoothness} min={0.001} max={0.15} step={0.0001} colorScheme="emerald" editable={true}
                usePrecisionContext={true} onChange={setLineSmoothness} isLight={isLight} />
            </div>
          </div>
        </TunerPrecisionContext.Provider>
      </div>

      {/* 6. Toggle Switch */}
      <div id="l1-toggle-switch" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">6. Haptic toggle (ToggleSwitch)</span>
          <Badge size="sm" variant="success" isLight={isLight}>Apple green / Apple black</Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Imitate Apple HIG Physical switch spec, Classic recommended Apple Green And minimalist high-contrast Apple Black, Avoid harsh blue. 
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between gap-3">
            <ToggleSwitch label="Apple Green (Classic green)" description="iOS Standard green design" checked={toggleGreen}
              onCheckedChange={setToggleGreen} variant="green" isLight={isLight} />
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between gap-3">
            <ToggleSwitch label="Apple Black (Minimal black)" description="Desaturated neutral design" checked={toggleBlack}
              onCheckedChange={setToggleBlack} variant="black" isLight={isLight} />
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between gap-3">
            <ToggleSwitch label="Warm Orange (warm orange)" description="Soft warm-tone variant" checked={toggleOrange}
              onCheckedChange={setToggleOrange} variant="orange" isLight={isLight} />
          </div>
        </div>
      </div>

      {/* 7. Checkbox (L1.7) */}
      <div id="l1-checkbox" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200/80 shadow-xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 font-mono font-bold text-xs">
                L1.7
              </span>
              <h2 className="text-base font-bold">Checkbox (Haptic rounded checkbox primitive)</h2>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Dedicated to Camera Settings Atomic checkbox controls for compact central-axis forms, Multi-palette support, corner radius, Outline thickness and left/right label layout. 
            </p>
          </div>
          <Badge variant="success" size="sm" isLight={isLight}>
            L1 Primitive
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
            <Checkbox
              label="Invert Swivel (Amber)"
              description="Amber primary color + 5px Squircle"
              checked={toggleGreen}
              onCheckedChange={setToggleGreen}
              variant="amber"
              isLight={isLight}
            />
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
            <Checkbox
              label="Camera Shake (Neutral)"
              description="Desaturated monochrome minimalist"
              checked={toggleBlack}
              onCheckedChange={setToggleBlack}
              variant="neutral"
              isLight={isLight}
            />
          </div>

          <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
            <Checkbox
              label="Right-Aligned Label"
              description="Left-aligned text, right-aligned + right Checkbox"
              labelPosition="left"
              checked={toggleOrange}
              onCheckedChange={setToggleOrange}
              variant="emerald"
              isLight={isLight}
            />
          </div>
        </div>
      </div>

      {/* Code Snippet for AI Agents */}
      <CodeBlock
        isLight={isLight}
        title="Agent code recipe (Tabs, Centered Sliders, Dual-Grabber & Precision Picker)"
        code={`import {
  UnderlineTabs, SegmentedSwitch, SliderControl, DualGrabberSlider,
  PrecisionDigitPicker, TunerPrecisionContext, ToggleSwitch,
} from '@/ui-core/primitives/UnderlineTabs';

// 1. Centrally symmetric bidirectional fill slider (Support positive/negative or custom origin Anchor + Direct input)
<SliderControl
  label="Steering Trim"
  value={trim} min={-50} max={50} unit="%"
  variation="centered"          // By origin Center-to-left(Negative)/Right(Positive)Bidirectional fill
  origin={0}                    // Default is 0, Can also be set to 100 (e.g. 0~500% Volume Gain)
  showSign={true}               // Show Positive '+' Prefix
  negativeColorScheme="sky"     // Optional: Use independent color for negative axis
  editable={true}               // Optional: Enable right-side direct value input
  onChange={setTrim}
  isLight={isLight}
/>

// 2. Dual-slider center deadzone controller ([-α .. +α] Bidirectional independent adjustment)
<DualGrabberSlider
  label="Threshold Tolerance Deadband"
  target={3}                    // Auto Set [-3 .. +3] With Center 0 Point Anchor
  value={[-2, 2]}               // [Catch-up Negative offset, Skip Positive offset]
  mode="centered-deadband"      // or 'free-range'
  onChange={setDeadband}
  isLight={isLight}
/>

// 3. Decimal place step precision selector (1 . 0 0 0 0 0)
<TunerPrecisionContext.Provider value={{ step, setStep }}>
  <PrecisionDigitPicker step={step} onStepChange={setStep} isLight={isLight} />
  <SliderControl label="UV Scale X" value={scaleX} min={0.5} max={2.0} step={0.0001}
    editable={true} usePrecisionContext={true} onChange={setScaleX} isLight={isLight} />
</TunerPrecisionContext.Provider>`}
      />
    </div>
  );
};
