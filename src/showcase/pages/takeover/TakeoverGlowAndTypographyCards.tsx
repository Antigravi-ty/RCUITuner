import React from 'react';
import {
  RotateCcw,
  Palette,
  Sliders,
  Users,
} from 'lucide-react';
import {
  CenterUpperTypographyConfig,
} from '../../../ui-core/hud/CenterUpperInfoHUD';
import {
  TakeoverGlowConfig,
  TakeoverTopLabelStyleConfig,
  DEFAULT_TAKEOVER_GLOW,
  DEFAULT_TAKEOVER_TOP_LABEL_STYLE,
  DEFAULT_TAKEOVER_TYPOGRAPHY,
} from '../../../ui-core/hud/TakeoverCountdownHUD';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { ColorSwatchInput } from '../../../ui-core/compounds/tuner/ColorSwatchInput';
import { RL_GLOW_SWATCHES } from '../center-upper-info/CenterUpperArchetypesAndBackdrop';

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

export interface TakeoverGlowAndTypographyCardsProps {
  isLight: boolean;
  myTeamSide: 'blue' | 'orange';
  setMyTeamSide: (
    val: 'blue' | 'orange' | ((prev: 'blue' | 'orange') => 'blue' | 'orange')
  ) => void;
  glowConfig: TakeoverGlowConfig;
  setGlowConfig: (
    val:
      | TakeoverGlowConfig
      | ((prev: TakeoverGlowConfig) => TakeoverGlowConfig)
  ) => void;
  syncGlowWithText: boolean;
  setSyncGlowWithText: (val: boolean | ((prev: boolean) => boolean)) => void;
  typoConfig: CenterUpperTypographyConfig;
  setTypoConfig: (
    val:
      | CenterUpperTypographyConfig
      | ((prev: CenterUpperTypographyConfig) => CenterUpperTypographyConfig)
  ) => void;
  setIsVisibleOnStage: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const TakeoverGlowAndTypographyCards: React.FC<
  TakeoverGlowAndTypographyCardsProps
> = ({
  isLight,
  myTeamSide,
  setMyTeamSide,
  glowConfig,
  setGlowConfig,
  syncGlowWithText,
  setSyncGlowWithText,
  typoConfig,
  setTypoConfig,
  setIsVisibleOnStage,
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
    <>
      {/* Card 3: Team-Colored Top Label + Stroke/Glow & Countdown Glow Tuner */}
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
              3. Team-Colored `Takeover in...` + Stroke/Glow &amp; Digit Glow
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
              <span>Top Label (`Takeover in...`): Team Color + Stroke &amp; Glow</span>
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
              description="Default #000000 shadow/stroke"
              value={resolvedTopStyle.strokeColor}
              onChange={(hex) =>
                updateTopLabelStyle({ strokeColor: hex, glowColor: hex })
              }
              presets={['#000000', '#FFFFFF', '#F8FAFC', '#E0F2FE', '#FFFBEB', '#FEF08A']}
              isLight={isLight}
            />
            <div className="grid grid-cols-2 gap-2">
              <SliderControl
                label="Stroke Width"
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
                label="Inner Blur"
                value={resolvedTopStyle.innerBlurPx}
                min={0}
                max={32}
                step={1}
                unit="px"
                editable
                allowOutOfBoundsInput
                onChange={(v) => updateTopLabelStyle({ innerBlurPx: v })}
                isLight={isLight}
              />
              <SliderControl
                label="Outer Blur"
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
              <SliderControl
                label="Ambient Blur"
                value={resolvedTopStyle.ambientBlurPx}
                min={0}
                max={64}
                step={1}
                unit="px"
                editable
                allowOutOfBoundsInput
                onChange={(v) => updateTopLabelStyle({ ambientBlurPx: v })}
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

      {/* Card 4: Typography Hierarchy (uppercase: false by default, mainFontSizePx: 56) */}
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
          label="Bottom Countdown Digit Font Size (3 - 2 - 1, Default 56px)"
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
          label="Top Stationary Label Font Size (Takeover in..., Default 24px)"
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
    </>
  );
};
