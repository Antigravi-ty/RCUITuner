import React from 'react';
import {
  Palette,
  Crosshair,
  Eye,
} from 'lucide-react';
import {
  CenterUpperGlowConfig,
  CenterUpperTypographyConfig,
  CenterUpperTimingConfig,
} from '../../../ui-core/hud/CenterUpperInfoHUD';
import {
  TakeoverCountdownHUD,
  TakeoverVignetteOverlay,
  TakeoverHudPayload,
  TakeoverVignetteConfig,
  TakeoverSignal,
} from '../../../ui-core/hud/TakeoverCountdownHUD';
import { StepperScoreboardHUD } from '../../../ui-core/hud/StepperScoreboardHUD';
import { EdgePlayerHudStrip } from '../../../ui-core/hud/EdgePlayerHudStrip';
import { VelocityProgressBar } from '../../../ui-core/hud/VelocityProgressBar';
import { CircularBoostGauge } from '../../../ui-core/hud/CircularBoostGauge';
import { BallCameraIndicator } from '../../../ui-core/hud/BallCameraIndicator';
import { FlipIndicatorPillHUD } from '../../../ui-core/hud/FlipIndicatorPillHUD';
import { ArenaBackdrop, ArenaLightingPreset } from '../../ArenaBackdrop';
import { createHudTransientChannel } from '../../../ui-core/stores/hudTransientChannel';
import {
  HudAnchorStage,
  HudZone,
  HudSlot,
  HudRelativeAnchor,
} from '../../../ui-core/layout/HudAnchorStage';
import { Badge } from '../../../ui-core/primitives/Badge';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { ColorSwatchInput } from '../../../ui-core/compounds/tuner/ColorSwatchInput';
import { JumpDirectoryItem } from '../../PageJumpDirectory';
import { CodeBlock } from '../../CodeBlock';
import { BG_COLOR_SWATCHES, type StageBgMode } from '../center-upper-info/CenterUpperArchetypesAndBackdrop';

export const TAKEOVER_DIRECTORY_ITEMS: JumpDirectoryItem[] = [
  {
    id: 'takeover-stage',
    code: '5G-1',
    name: 'HudAnchorStage (bottom-center + upward offset)',
    label: 'Takeover live stage · Scoreboard + Team Roster · Bottom-center upward offset · Replacing In -> 3-2-1 -> Cockpit HUD return',
  },
  {
    id: 'takeover-tuner',
    code: '5G-2',
    name: 'Vignette, Typography & Motion Tuner',
    label: '4-edge vignette intensity/distance/Cubic-Bezier curve + Bottom-only scale pop + Force Uppercase OFF + One-click copy config',
  },
  {
    id: 'takeover-archetypes',
    code: '5G-3',
    name: 'Scenario Presets & Integration Recipe',
    label: 'Bot Takeover / Disconnect Reconnect / Mid-Match Handoff presets & decoupled code recipe',
  },
];

export interface TakeoverStageCanvasProps {
  stageBgMode: StageBgMode;
  arenaPreset: ArenaLightingPreset;
  stageBrightness: number;
  showPitchLines: boolean;
  showAnchorGuides: boolean;
  bottomOffsetPx: number;
  activeSignal: TakeoverSignal;
  isCockpitVisible: boolean;
  myTeamSide: 'blue' | 'orange';
  activePayload: TakeoverHudPayload | null;
  glowConfig: CenterUpperGlowConfig;
  typoConfig: CenterUpperTypographyConfig;
  timingConfig: CenterUpperTimingConfig;
  vignetteConfig: TakeoverVignetteConfig;
  vignettePreviewActive: boolean;
  isSequencePlaying: boolean;
  setIsVisibleOnStage: (val: boolean) => void;
  getStageBackgroundStyle: () => React.CSSProperties;
  channel: ReturnType<typeof createHudTransientChannel>;
}

export const TakeoverStageCanvas: React.FC<TakeoverStageCanvasProps> = ({
  stageBgMode,
  arenaPreset,
  stageBrightness,
  showPitchLines,
  showAnchorGuides,
  bottomOffsetPx,
  activeSignal,
  isCockpitVisible,
  myTeamSide,
  activePayload,
  glowConfig,
  typoConfig,
  timingConfig,
  vignetteConfig,
  vignettePreviewActive,
  isSequencePlaying,
  setIsVisibleOnStage,
  getStageBackgroundStyle,
  channel,
}) => {
  const leftTeamColor = myTeamSide === 'blue' ? '#2563EB' : '#EA580C';
  const leftBarColor = myTeamSide === 'blue' ? '#3B82F6' : '#F97316';
  const rightTeamColor = myTeamSide === 'blue' ? '#EA580C' : '#2563EB';

  return (
    <div
      className="relative w-full h-[520px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl transition-colors duration-200"
      style={getStageBackgroundStyle()}
    >
      {stageBgMode === 'arena' && (
        <ArenaBackdrop
          preset={arenaPreset}
          brightness={stageBrightness}
          showPitchMarkings={showPitchLines}
        />
      )}

      {stageBgMode !== 'arena' && showPitchLines && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/70 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-44 h-44 rounded-full border border-white/70 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-white/80 -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* 4-Edge Atmospheric Vignette Layer BELOW the HUD layer (`z-10` under `HudAnchorStage z-20`) */}
      <TakeoverVignetteOverlay
        config={vignetteConfig}
        active={vignettePreviewActive}
      />

      {showAnchorGuides && (
        <div className="absolute inset-0 pointer-events-none z-15">
          <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-amber-400/25 -translate-x-1/2" />
          <div
            className="absolute inset-x-0 h-px border-t border-dashed border-amber-400/55 transition-all duration-150"
            style={{ bottom: `${bottomOffsetPx}px` }}
          >
            <span className="absolute right-3 -top-5 px-1.5 py-0.5 rounded bg-black/75 border border-amber-500/40 text-[10px] font-mono text-amber-300">
              HudZone anchor=&quot;bottom-center&quot; (bottomOffset = +{bottomOffsetPx}px upward)
            </span>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40">
            <Crosshair className="h-4 w-4 text-white" />
            <span className="text-[9px] font-mono text-white bg-black/50 px-1.5 py-0.5 rounded">
              50% Global Center (Clear Car View Zone)
            </span>
          </div>
        </div>
      )}

      {/* Main UI Layer (`z-20`, rendered strictly ABOVE the `z-10` Vignette Overlay) */}
      <HudAnchorStage strategy="reserve" style={{ fontFamily: 'var(--font-jetbrains)' }}>
        {/* 1. TOP-CENTER: Scoreboard always visible during Takeover */}
        <HudZone anchor="top-center" flush zIndexClassName="z-30">
          <StepperScoreboardHUD
            isLight={false}
            leftScore={2}
            rightScore={1}
            leftTeamColor={leftTeamColor}
            rightTeamColor={rightTeamColor}
            seconds={134}
            bestOf={5}
            leftSeriesWins={2}
            rightSeriesWins={1}
            subscribeScoreboard={channel.subscribeScoreboard}
          />
        </HudZone>

        {/* 2. TOP-LEFT: Corresponding Team Teammate Roster always visible during Takeover */}
        <HudZone anchor="top-left" flush className="pt-[56px]">
          <EdgePlayerHudStrip
            side="left"
            teamColor={leftTeamColor}
            barColor={leftBarColor}
            isLight={false}
            viewMode="player-live"
            subscribeRoster={channel.subscribeRoster}
          />
        </HudZone>

        {/* 3. BOTTOM-LEFT: Ball Cam Indicator
            - Hidden (`visible={false}`) during `replacing-in` (3-2-1 countdown)
            - Slides in from bottom-left (`translate3d(-140%, 0, 0) -> 0`) once 3-2-1 finishes */}
        <HudZone anchor="bottom-left">
          <HudSlot
            visible={isCockpitVisible}
            mode="reserve"
            exitOffset="translate3d(-140%, 0, 0)"
          >
            <BallCameraIndicator
              subscribeBallCam={channel.subscribeBallCam}
              shortcut="SPACE"
              label="BALL CAM"
              actionText="TO TOGGLE"
              isLight={false}
              onToggle={() => channel.toggleBallCam()}
            />
          </HudSlot>
        </HudZone>

        {/* 4. BOTTOM-CENTER: Speedometer (`VelocityProgressBar`) + `FlipIndicatorPillHUD`
            - Hidden (`visible={false}`) during `replacing-in` (3-2-1 countdown)
            - Slides up from bottom (`translate3d(0, 220%, 0) -> 0`) once 3-2-1 finishes */}
        <HudZone anchor="bottom-center">
          <HudSlot
            visible={isCockpitVisible}
            mode="reserve"
            exitOffset="translate3d(0, 220%, 0)"
          >
            <HudRelativeAnchor
              placement="top"
              align="start"
              gap={8}
              floating
              attachment={
                <FlipIndicatorPillHUD
                  isLight={false}
                  subscribeFlip={channel.subscribeFlip}
                />
              }
            >
              <div className="w-[360px] max-w-[42vw]">
                <VelocityProgressBar
                  subscribeSpeed={channel.subscribeSpeed}
                  width="100%"
                  height={16}
                />
              </div>
            </HudRelativeAnchor>
          </HudSlot>
        </HudZone>

        {/* 5. BOTTOM-RIGHT: Boost Meter (`CircularBoostGauge`)
            - Hidden (`visible={false}`) during `replacing-in` (3-2-1 countdown)
            - Slides in from right (`translate3d(140%, 0, 0) -> 0`) once 3-2-1 finishes */}
        <HudZone anchor="bottom-right" flush className="pb-4">
          <HudSlot
            visible={isCockpitVisible}
            mode="reserve"
            exitOffset="translate3d(140%, 0, 0)"
            innerClassName="pr-5"
          >
            <CircularBoostGauge
              subscribeBoost={channel.subscribeBoost}
              isLight={false}
            />
          </HudSlot>
        </HudZone>

        {/* 6. BOTTOM-CENTER UPWARD OFFSET: Takeover Countdown Banner
            - Relative to `bottom-center`, offset upward by `bottomOffsetPx` (NOT global center)
            - Top Regular (`Take over in`) stays completely still; Bottom Thin (`3 -> 2 -> 1`) scales */}
        <HudZone
          anchor="bottom-center"
          flush
          zIndexClassName="z-40"
          style={{ bottom: `${bottomOffsetPx}px` }}
        >
          <HudSlot visible={true} mode="reserve">
            <TakeoverCountdownHUD
              payload={activePayload}
              glowConfig={glowConfig}
              typographyConfig={typoConfig}
              timingConfig={timingConfig}
              onStepExpire={() => {
                if (!isSequencePlaying && !timingConfig.persistentInspect) {
                  setIsVisibleOnStage(false);
                }
              }}
            />
          </HudSlot>
        </HudZone>
      </HudAnchorStage>

      {/* Top-Right Telemetry & Signal Readout Pill */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/75 border border-white/15 backdrop-blur-md text-[11px] font-mono text-neutral-200 pointer-events-none">
        <span
          className={`h-2 w-2 rounded-full ${
            activeSignal === 'replacing-in'
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-400'
          }`}
        />
        <span>
          Signal: <strong className="text-amber-400">{activeSignal}</strong>
        </span>
        <span className="opacity-30">|</span>
        <span>
          Cockpit HUD:{' '}
          <strong className={isCockpitVisible ? 'text-emerald-400' : 'text-rose-400'}>
            {isCockpitVisible ? 'DEPLOYED (Live)' : 'RETRACTED (3-2-1)'}
          </strong>
        </span>
        <span className="opacity-30">|</span>
        <span>
          Vignette:{' '}
          <strong className="text-sky-400">
            {vignettePreviewActive ? `${vignetteConfig.intensityPct}%` : 'OFF'}
          </strong>
        </span>
      </div>
    </div>
  );
};

export interface TakeoverStageBackdropBarProps {
  isLight: boolean;
  stageBgMode: StageBgMode;
  setStageBgMode: (val: StageBgMode | ((prev: StageBgMode) => StageBgMode)) => void;
  arenaPreset: ArenaLightingPreset;
  setArenaPreset: (
    val: ArenaLightingPreset | ((prev: ArenaLightingPreset) => ArenaLightingPreset)
  ) => void;
  stageBgColor: string;
  setStageBgColor: (val: string | ((prev: string) => string)) => void;
  stageBgSecondaryColor: string;
  setStageBgSecondaryColor: (val: string | ((prev: string) => string)) => void;
  stageBrightness: number;
  setStageBrightness: (val: number | ((prev: number) => number)) => void;
  showPitchLines: boolean;
  setShowPitchLines: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const TakeoverStageBackdropBar: React.FC<TakeoverStageBackdropBarProps> = ({
  isLight,
  stageBgMode,
  setStageBgMode,
  arenaPreset,
  setArenaPreset,
  stageBgColor,
  setStageBgColor,
  stageBgSecondaryColor,
  setStageBgSecondaryColor,
  stageBrightness,
  setStageBrightness,
  showPitchLines,
  setShowPitchLines,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-4 ${
        isLight
          ? 'bg-neutral-50/80 border-neutral-200'
          : 'bg-neutral-950/60 border-neutral-800'
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-amber-500" />
            <span>Preview Background Mode (Stage Backdrop)</span>
          </span>
        </div>
        <SegmentedSwitch
          size="sm"
          fullWidth
          isLight={isLight}
          value={stageBgMode}
          onValueChange={(v) => setStageBgMode(v as StageBgMode)}
          options={[
            { value: 'arena', label: 'Stadium Preset (Arena)' },
            { value: 'solid', label: 'Solid Background (Solid)' },
            { value: 'gradient', label: 'Dual Gradient (Gradient)' },
          ]}
        />
        {stageBgMode === 'arena' && (
          <SegmentedSwitch
            size="sm"
            fullWidth
            isLight={isLight}
            value={arenaPreset}
            onValueChange={(v) => setArenaPreset(v as ArenaLightingPreset)}
            options={[
              { value: 'night', label: 'Night' },
              { value: 'twilight', label: 'Twilight' },
              { value: 'daylight', label: 'Daylight' },
            ]}
          />
        )}
      </div>

      <div>
        <ColorSwatchInput
          label="Preview Background Main Color (Background Color)"
          description="Verify 4-edge vignette and Out Glow contrast against dark/light stadium tones"
          value={stageBgColor}
          onChange={setStageBgColor}
          presets={BG_COLOR_SWATCHES}
          isLight={isLight}
        />
      </div>

      <div className="flex flex-col justify-between gap-2">
        {stageBgMode === 'gradient' ? (
          <ColorSwatchInput
            label="Gradient Center Secondary Color (Radial Core Color)"
            value={stageBgSecondaryColor}
            onChange={setStageBgSecondaryColor}
            presets={['#1E293B', '#0F172A', '#31102F', '#064E3B', '#3B2F13']}
            isLight={isLight}
          />
        ) : (
          <SliderControl
            label="Background Environment Brightness (Backdrop Brightness)"
            value={stageBrightness}
            min={10}
            max={100}
            step={1}
            unit="%"
            onChange={setStageBrightness}
            isLight={isLight}
          />
        )}
        <div className="flex items-center justify-between pt-1">
          <ToggleSwitch
            label="Stadium Midline/Center Circle Texture"
            checked={showPitchLines}
            onCheckedChange={setShowPitchLines}
            isLight={isLight}
          />
          <span className="text-[11px] font-mono opacity-60">16:9 Safe Stage</span>
        </div>
      </div>
    </div>
  );
};

export interface TakeoverScenarioPreset {
  id: string;
  badge: string;
  title: string;
  topText: string;
  subText: string;
  teamSide: 'blue' | 'orange';
}

export const TAKEOVER_SCENARIO_PRESETS: TakeoverScenarioPreset[] = [
  {
    id: 'bot-handoff',
    badge: '① Bot Takeover · Standard',
    title: 'Take over in · 3 -> 2 -> 1',
    topText: 'Take over in',
    subText: '',
    teamSide: 'blue',
  },
  {
    id: 'reconnect-resume',
    badge: '② Reconnect Handoff · Orange Side',
    title: 'Take over in (Reconnect Resume)',
    topText: 'Take over in',
    subText: 'RECONNECTED · OCTANE_99',
    teamSide: 'orange',
  },
  {
    id: 'training-intervention',
    badge: '③ Replay / Training Intervention',
    title: 'Replacing in · 3 -> 2 -> 1',
    topText: 'Replacing in',
    subText: '',
    teamSide: 'blue',
  },
];

export interface TakeoverArchetypesSectionProps {
  isLight: boolean;
  stageBgColor: string;
  bottomOffsetPx: number;
  topLabelText: string;
  glowConfig: CenterUpperGlowConfig;
  typoConfig: CenterUpperTypographyConfig;
  timingConfig: CenterUpperTimingConfig;
  vignetteConfig: TakeoverVignetteConfig;
  onSelectScenario: (preset: TakeoverScenarioPreset) => void;
}

export const TakeoverArchetypesSection: React.FC<TakeoverArchetypesSectionProps> = ({
  isLight,
  stageBgColor,
  bottomOffsetPx,
  topLabelText,
  glowConfig,
  typoConfig,
  timingConfig,
  vignetteConfig,
  onSelectScenario,
}) => {
  return (
    <section
      id="takeover-archetypes"
      className={`p-5 rounded-3xl border flex flex-col gap-5 scroll-mt-24 ${
        isLight
          ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
          : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="amber" size="sm" isLight={isLight}>
            5G-3
          </Badge>
          <h2 className="text-sm font-bold font-mono">
            Takeover Handoff Scenario Presets &amp; Decoupled Code Recipe
          </h2>
        </div>
        <span className="text-xs font-mono opacity-65">
          Click any card to play the `replacing-in` -&gt; `3-2-1` -&gt; Cockpit HUD deployment sequence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TAKEOVER_SCENARIO_PRESETS.map((preset) => (
          <div
            key={preset.id}
            onClick={() => onSelectScenario(preset)}
            className="group relative h-44 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.01]"
            style={{ backgroundColor: stageBgColor }}
          >
            <span className="absolute top-2.5 left-3 text-[10px] font-mono tracking-wider text-amber-400/90 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
              {preset.badge}
            </span>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontWeight: 400,
                fontSize: '20px',
                color: glowConfig.topLabelColor || '#FFFFFF',
              }}
              className="leading-none select-none"
            >
              {typoConfig.uppercase ? preset.topText.toUpperCase() : preset.topText}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontWeight: 100,
                fontSize: '52px',
                color: glowConfig.textColor,
              }}
              className="leading-none select-none"
            >
              3 · 2 · 1
            </div>
            <span className="absolute bottom-2.5 text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors flex items-center gap-1">
              <Eye className="h-3 w-3 text-amber-400" />
              <span>Click to run {preset.title} sequence →</span>
            </span>
          </div>
        ))}
      </div>

      <CodeBlock
        title="Zero Coupling TakeoverOverlay (`bottom-center` upward offset + `TakeoverVignetteOverlay` + `replacing-in` Signal) Recipe"
        language="tsx"
        isLight={isLight}
        code={`import { HudAnchorStage, HudZone, HudSlot } from '@/ui-core/layout/HudAnchorStage';
import {
  TakeoverCountdownHUD,
  TakeoverVignetteOverlay,
} from '@/ui-core/hud/TakeoverCountdownHUD';

export function MatchTakeoverOverlay({
  isReplacingIn,
  countdownDigit, // '3' | '2' | '1' | null
}: {
  isReplacingIn: boolean;
  countdownDigit: '3' | '2' | '1' | null;
}) {
  const isCockpitVisible = !isReplacingIn;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 1. 4-Edge Vignette Layer underneath the HUD layer (z-10 < HudAnchorStage z-20) */}
      <TakeoverVignetteOverlay
        active={isReplacingIn}
        config={{
          enabled: ${vignetteConfig.enabled},
          color: '${vignetteConfig.color}',
          intensityPct: ${vignetteConfig.intensityPct},
          distancePct: ${vignetteConfig.distancePct},
          outerReachPct: ${vignetteConfig.outerReachPct},
          curve: {
            p1x: ${vignetteConfig.curve.p1x},
            p1y: ${vignetteConfig.curve.p1y},
            p2x: ${vignetteConfig.curve.p2x},
            p2y: ${vignetteConfig.curve.p2y},
          },
          fadeInMs: ${vignetteConfig.fadeInMs},
          fadeOutMs: ${vignetteConfig.fadeOutMs},
        }}
      />

      {/* 2. Main HUD Layer (z-20): Scoreboard & Team Roster stay visible; Cockpit HUD deploys after 3-2-1 */}
      <HudAnchorStage strategy="reserve">
        {/* Bottom-Center Upward Offset (relative to bottom-center, NOT global center) */}
        <HudZone
          anchor="bottom-center"
          flush
          zIndexClassName="z-40"
          style={{ bottom: '${bottomOffsetPx}px' }}
        >
          <HudSlot visible={isReplacingIn} mode="reserve">
            <TakeoverCountdownHUD
              payload={
                countdownDigit
                  ? {
                      topText: '${topLabelText}', // JetBrains Mono Regular (400) — Stationary
                      mainText: countdownDigit, // JetBrains Mono Thin (100) — Scales 3 -> 2 -> 1
                    }
                  : null
              }
              glowConfig={{
                textColor: '${glowConfig.textColor}',
                glowColor: '${glowConfig.glowColor}',
                innerBlurPx: ${glowConfig.innerBlurPx},
                outerBlurPx: ${glowConfig.outerBlurPx},
                ambientBlurPx: ${glowConfig.ambientBlurPx},
                intensityPct: ${glowConfig.intensityPct},
              }}
              typographyConfig={{
                mainFontSizePx: ${typoConfig.mainFontSizePx},
                mainFontWeight: ${typoConfig.mainFontWeight},
                topFontSizePx: ${typoConfig.topFontSizePx},
                topFontWeight: ${typoConfig.topFontWeight},
                lineGapPx: ${typoConfig.lineGapPx},
                uppercase: ${typoConfig.uppercase}, // Default false ('Take over in')
              }}
              timingConfig={{
                durationMs: ${timingConfig.durationMs},
                entryScale: ${timingConfig.entryScale},
                entryDurationMs: ${timingConfig.entryDurationMs},
                exitDurationMs: ${timingConfig.exitDurationMs},
              }}
            />
          </HudSlot>
        </HudZone>
      </HudAnchorStage>
    </div>
  );
}`}
      />
    </section>
  );
};
