import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Code2,
  AlertOctagon,
  Sparkles,
  AlignRight,
  AlignLeft,
} from 'lucide-react';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { Button } from '../../../ui-core/primitives/Button';
import { Badge } from '../../../ui-core/primitives/Badge';
import { dialogue } from '../../../ui-core/compounds/dialogue/dialogueStore';
import {
  useCameraSettingsStyleStore,
  CAMERA_SETTINGS_STYLE_PRESETS,
  type CameraSettingsPresetId,
  type CameraReadoutContainerMode,
  type CameraReadoutTextAlign,
  type CameraLabelTextAlign,
  type CameraSliderColorScheme,
} from '../../../ui-core/stores/cameraSettingsStyleStore';
import { DEFAULT_CAMERA_SETTINGS } from '../../../ui-core/recipes/camera/cameraConfigSpecs';
import { Layer3CameraRecipe } from '../../../ui-core/recipes/Layer3CameraRecipe';
import { CodeBlock } from '../../CodeBlock';
import { CameraSettingsCheckboxSection } from './CameraSettingsCheckboxSection';
import { CameraSettingsResetSection } from './CameraSettingsResetSection';

export interface CameraSettingsStyleTunerProps {
  isLight?: boolean;
  title?: string;
  codeBadge?: string;
  /** Whether to render the standalone 1:1 Layer3CameraRecipe live preview inside the tuner */
  showStandalonePreview?: boolean;
  /** Compact mode when embedded inside 7A inline tuner drawer */
  compact?: boolean;
}

/**
 * [Decoupled Tuner] CameraSettingsStyleTuner (6A.12M / 7A.12)
 * Dedicated visual & geometric inspector for `Layer3CameraRecipe` and the `<Checkbox>` primitive:
 * - Spine-aligned equal-length Sliders forming a clean center dividing line
 * - Right-aligned icon-free labels flowing leftward from the Slider's left edge
 * - Left-aligned value readout containers (uniform longest container width vs hug content) with left-to-right text
 * - Checkbox placement & visual effect tuning (Invert Swivel & Camera Shake)
 * - Big Reset Camera Defaults button with red double-check `Dialogue` confirmation
 */
export const CameraSettingsStyleTuner: React.FC<CameraSettingsStyleTunerProps> = React.memo(({
  isLight = false,
  title = '6A.12M · Camera Settings Center-Aligned Slider · Checkbox · Destructive Reset Confirmation Tuning Workbench',
  codeBadge = '6A.12M',
  showStandalonePreview = true,
  compact = false,
}) => {
  const store = useCameraSettingsStyleStore();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCopy = async () => {
    const code = store.exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestDialogue = () => {
    dialogue.show({
      id: 'camera-settings-tuner-test-confirm',
      title: store.resetDialogueTitle || 'RESET CAMERA DEFAULTS',
      tone: 'error',
      icon: 'octagon-alert',
      isLight,
      content: (
        <div className="flex flex-col gap-2 text-xs leading-relaxed">
          <p className={isLight ? 'text-neutral-700 font-medium' : 'text-neutral-200 font-medium'}>
            Are you sure you want to restore all Camera Settings to their factory competitive defaults?
          </p>
          <div
            className={`p-2.5 rounded-lg border font-mono text-[11px] grid grid-cols-2 gap-x-4 gap-y-1 ${
              isLight
                ? 'bg-rose-50/70 border-rose-200/80 text-rose-900'
                : 'bg-rose-950/35 border-rose-800/60 text-rose-200'
            }`}
          >
            <span>FOV: {DEFAULT_CAMERA_SETTINGS.fovDeg}°</span>
            <span>Distance: {DEFAULT_CAMERA_SETTINGS.distanceUu} UU</span>
            <span>Height: {DEFAULT_CAMERA_SETTINGS.heightUu} UU</span>
            <span>Pitch Angle: {DEFAULT_CAMERA_SETTINGS.angleDeg}°</span>
            <span>Stiffness: {DEFAULT_CAMERA_SETTINGS.stiffness}</span>
            <span>Swivel Speed: {DEFAULT_CAMERA_SETTINGS.swivelSpeed}</span>
            <span>Transition: {DEFAULT_CAMERA_SETTINGS.transitionSpeed}</span>
            <span>Shake / Invert: Off</span>
          </div>
        </div>
      ),
      buttons: [
        { label: 'Reset Camera Defaults', variant: 'danger' },
        { label: 'Cancel', variant: 'outline' },
      ],
    });
  };

  const sectionCardClass = `p-4 rounded-xl border flex flex-col gap-3.5 ${
    isLight
      ? 'bg-neutral-50/80 border-neutral-200/90'
      : 'bg-neutral-950/60 border-neutral-800/90'
  }`;

  return (
    <div
      id="camera-settings-style-tuner"
      className={`scroll-mt-6 p-5 rounded-2xl border flex flex-col gap-5 transition-colors ${
        isLight
          ? 'bg-white border-neutral-200/90 shadow-2xs'
          : 'bg-neutral-900/75 border-neutral-800'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 font-mono font-bold text-xs">
            {codeBadge}
          </span>
          <Sliders className="h-4 w-4 text-emerald-500 shrink-0" />
          <h3 className="text-sm font-bold">{title}</h3>
          <Badge variant="success" size="sm" isLight={isLight}>
            Decoupled Store · Zero-Coupling Tuning
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="danger"
            isLight={isLight}
            icon={<AlertOctagon className="h-3.5 w-3.5" />}
            onClick={handleTestDialogue}
          >
            Test Confirmation Dialogue
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            icon={<Code2 className="h-3.5 w-3.5" />}
            onClick={() => setShowCode((prev) => !prev)}
          >
            {showCode ? 'Hide TS Config' : 'View TS Config'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            icon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            onClick={handleCopy}
          >
            {copied ? 'Config Copied' : 'Copy Config Code'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isLight={isLight}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={store.resetToDefaults}
          >
            Reset to Default
          </Button>
        </div>
      </div>

      {/* Curated Presets Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Camera Settings Layout Presets (5 Variants):</span>
          </span>
          <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
            active: {CAMERA_SETTINGS_STYLE_PRESETS[store.preset]?.shortLabel ?? store.preset}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {(Object.keys(CAMERA_SETTINGS_STYLE_PRESETS) as CameraSettingsPresetId[]).map((presetKey) => {
            const p = CAMERA_SETTINGS_STYLE_PRESETS[presetKey];
            const isSelected = store.preset === presetKey;
            return (
              <button
                key={presetKey}
                type="button"
                onClick={() => store.applyPreset(presetKey)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : isLight
                    ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-950/70 hover:bg-neutral-900 border-neutral-800 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold leading-snug">{p.shortLabel}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] opacity-75 line-clamp-2 leading-relaxed">
                  {p.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6-Domain Parameter Grid */}
      <div className={`grid grid-cols-1 ${compact ? 'lg:grid-cols-2' : ' md:grid-cols-2 xl:grid-cols-3'} gap-4`}>
        {/* 1. Spine Alignment & Centering */}
        <div className={sectionCardClass}>
          <div className="flex items-center justify-between border-b pb-2 border-neutral-200/70 dark:border-neutral-800">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <AlignRight className="h-3.5 w-3.5 text-amber-500" />
              <span>1. Central Spine Boundary & Centered Geometry</span>
            </span>
            <Badge variant="amber" size="sm" isLight={isLight}>
              Spine & Centering
            </Badge>
          </div>

          <ToggleSwitch
            checked={store.centerFormBlock}
            onCheckedChange={(v) => store.setParam('centerFormBlock', v)}
            label="Horizontally Center Form Block (Center Spine Block)"
            isLight={isLight}
          />

          <ToggleSwitch
            checked={store.showSpineGuideLine}
            onCheckedChange={(v) => store.setParam('showSpineGuideLine', v)}
            label="Show Left-Aligned Slider Spine Guide Line"
            isLight={isLight}
          />

          <ToggleSwitch
            checked={store.showRowHoverBg}
            onCheckedChange={(v) => store.setParam('showRowHoverBg', v)}
            label="Enable Row Hover Background Highlight"
            isLight={isLight}
          />

          <SliderControl
            label="Horizontal Block Offset (formOffsetX)"
            min={-60}
            max={60}
            step={2}
            value={store.formOffsetXPx}
            unit="px"
            variation="centered"
            origin={0}
            onChange={(v) => store.setParam('formOffsetXPx', v)}
            isLight={isLight}
          />

          <SliderControl
            label="Row Vertical Gap (rowGap)"
            min={0}
            max={12}
            step={1}
            value={store.rowGapPx}
            unit="px"
            onChange={(v) => store.setParam('rowGapPx', v)}
            isLight={isLight}
          />

          <SliderControl
            label="Row Vertical Padding (rowPaddingY)"
            min={2}
            max={14}
            step={1}
            value={store.rowPaddingYPx}
            unit="px"
            onChange={(v) => store.setParam('rowPaddingYPx', v)}
            isLight={isLight}
          />
        </div>

        {/* 2. Left Label Column (Right-Aligned, Icon-Free) */}
        <div className={sectionCardClass}>
          <div className="flex items-center justify-between border-b pb-2 border-neutral-200/70 dark:border-neutral-800">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <AlignRight className="h-3.5 w-3.5 text-sky-500" />
              <span>2. Icon-Free Right-Aligned Label Column</span>
            </span>
            <Badge variant="primary" size="sm" isLight={isLight}>
              Right-to-Left Label
            </Badge>
          </div>

          <ToggleSwitch
            checked={store.showRowIcon}
            onCheckedChange={(v) => store.setParam('showRowIcon', v)}
            label="Show Leading Row Icon (Off by Default)"
            isLight={isLight}
          />

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Label Alignment (Right-Align to Slider Spine vs Left-Align)
            </span>
            <SegmentedSwitch
              value={store.labelTextAlign}
              onValueChange={(v) => store.setParam('labelTextAlign', v as CameraLabelTextAlign)}
              options={[
                { value: 'right', label: 'Right-Aligned (Snap to Spine)' },
                { value: 'left', label: 'Left-Aligned (Standard)' },
              ]}
              size="sm"
              fullWidth
              isLight={isLight}
            />
          </div>

          <SliderControl
            label="Label Column Width (labelColumnWidth)"
            min={110}
            max={210}
            step={2}
            value={store.labelColumnWidthPx}
            unit="px"
            onChange={(v) => store.setParam('labelColumnWidthPx', v)}
            isLight={isLight}
          />

          <SliderControl
            label="Label-to-Slider Gap (labelToControlGap)"
            min={6}
            max={32}
            step={1}
            value={store.labelToControlGapPx}
            unit="px"
            onChange={(v) => store.setParam('labelToControlGapPx', v)}
            isLight={isLight}
          />

          <SliderControl
            label="Label Font Size (labelFontSize)"
            min={11}
            max={16}
            step={1}
            value={store.labelFontSizePx}
            unit="px"
            onChange={(v) => store.setParam('labelFontSizePx', v)}
            isLight={isLight}
          />

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Label Font Weight (labelFontWeight)
            </span>
            <SegmentedSwitch
              value={String(store.labelFontWeight)}
              onValueChange={(v) => store.setParam('labelFontWeight', Number(v))}
              options={[
                { value: '400', label: '400' },
                { value: '500', label: '500' },
                { value: '600', label: '600' },
                { value: '700', label: '700' },
              ]}
              size="sm"
              fullWidth
              isLight={isLight}
            />
          </div>
        </div>

        {/* 3. Center Equal-Length Slider Spine & Right Readout Container */}
        <div className={sectionCardClass}>
          <div className="flex items-center justify-between border-b pb-2 border-neutral-200/70 dark:border-neutral-800">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <AlignLeft className="h-3.5 w-3.5 text-emerald-500" />
              <span>3. Equal-Length Slider Spine & Readout Box</span>
            </span>
            <Badge variant="success" size="sm" isLight={isLight}>
              Slider & Readout
            </Badge>
          </div>

          <SliderControl
            label="Uniform Slider Track Width (sliderTrackWidth)"
            min={120}
            max={260}
            step={4}
            value={store.sliderTrackWidthPx}
            unit="px"
            onChange={(v) => store.setParam('sliderTrackWidthPx', v)}
            isLight={isLight}
          />

          <SliderControl
            label="Slider Track Height (sliderTrackHeight)"
            min={4}
            max={12}
            step={1}
            value={store.sliderTrackHeightPx}
            unit="px"
            onChange={(v) => store.setParam('sliderTrackHeightPx', v)}
            isLight={isLight}
          />

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Slider Track Fill Color (sliderColorScheme)
            </span>
            <SegmentedSwitch
              value={store.sliderColorScheme}
              onValueChange={(v) => store.setParam('sliderColorScheme', v as CameraSliderColorScheme)}
              options={[
                { value: 'neutral', label: 'Monochrome' },
                { value: 'amber', label: 'Amber' },
                { value: 'sky', label: 'Sky Blue' },
                { value: 'emerald', label: 'Emerald' },
                { value: 'rose', label: 'Rose Pink' },
              ]}
              size="sm"
              fullWidth
              isLight={isLight}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Readout Container Width Mode (Uniform Longest vs Hug Content)
            </span>
            <SegmentedSwitch
              value={store.readoutContainerMode}
              onValueChange={(v) =>
                store.setParam('readoutContainerMode', v as CameraReadoutContainerMode)
              }
              options={[
                { value: 'uniform-longest', label: 'Uniform Longest' },
                { value: 'hug-content', label: 'Hug Content' },
                { value: 'plain-text', label: 'Plain Text (Borderless)' },
              ]}
              size="sm"
              fullWidth
              isLight={isLight}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Numeric Readout Text Alignment
            </span>
            <SegmentedSwitch
              value={store.readoutTextAlign}
              onValueChange={(v) => store.setParam('readoutTextAlign', v as CameraReadoutTextAlign)}
              options={[
                { value: 'left', label: 'Left-Aligned' },
                { value: 'center', label: 'Centered' },
                { value: 'right', label: 'Right-Aligned' },
              ]}
              size="sm"
              fullWidth
              isLight={isLight}
            />
          </div>

          <SliderControl
            label="Slider-to-Readout Gap (controlToReadoutGap)"
            min={6}
            max={28}
            step={1}
            value={store.controlToReadoutGapPx}
            unit="px"
            onChange={(v) => store.setParam('controlToReadoutGapPx', v)}
            isLight={isLight}
          />
        </div>

        <CameraSettingsCheckboxSection
          isLight={isLight}
          sectionCardClass={sectionCardClass}
        />

        <CameraSettingsResetSection
          isLight={isLight}
          sectionCardClass={sectionCardClass}
        />
      </div>

      {showCode && (
        <CodeBlock
          isLight={isLight}
          title="cameraSettingsStyleStore.ts · Camera Settings Tuning Config Snapshot"
          code={store.exportConfigCode()}
        />
      )}

      {showStandalonePreview && (
        <div className="flex flex-col gap-3 pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              1:1 Live Synchronized Preview (Synced with 7A Menu Layer Camera Settings)
            </span>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              Click the bottom red &ldquo;{store.resetButtonLabel}&rdquo; button to trigger the confirmation Dialogue
            </span>
          </div>

          <div
            className={`flex justify-center p-6 rounded-2xl border transition-colors ${
              isLight
                ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
                : 'border-neutral-800 bg-neutral-950/60'
            }`}
          >
            <Layer3CameraRecipe isLight={isLight} />
          </div>
        </div>
      )}
    </div>
  );
});

CameraSettingsStyleTuner.displayName = 'CameraSettingsStyleTuner';

