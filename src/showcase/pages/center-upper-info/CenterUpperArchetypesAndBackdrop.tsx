import React from 'react';
import { Palette, Crosshair, Megaphone } from 'lucide-react';
import {
  CenterUpperInfoHUD, CenterUpperInfoPayload, CenterUpperGlowConfig, CenterUpperBlueTeamConfig,
  CenterUpperTypographyConfig, CenterUpperTimingConfig, CenterUpperInfoVariant, WinnerTeamPreset,
} from '../../../ui-core/hud/CenterUpperInfoHUD';
import { StepperScoreboardHUD } from '../../../ui-core/hud/StepperScoreboardHUD';
import { EdgePlayerHudStrip } from '../../../ui-core/hud/EdgePlayerHudStrip';
import { VelocityProgressBar } from '../../../ui-core/hud/VelocityProgressBar';
import { CircularBoostGauge } from '../../../ui-core/hud/CircularBoostGauge';
import { BallCameraIndicator } from '../../../ui-core/hud/BallCameraIndicator';
import { ArenaBackdrop, ArenaLightingPreset } from '../../ArenaBackdrop';
import { DEFAULT_INITIAL_ROSTER } from '../../../ui-core/stores/hudTransientChannel';
import { HudAnchorStage, HudZone, HudSlot } from '../../../ui-core/layout/HudAnchorStage';
import { Badge } from '../../../ui-core/primitives/Badge';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { ColorSwatchInput } from '../../../ui-core/compounds/tuner/ColorSwatchInput';
import { JumpDirectoryItem } from '../../PageJumpDirectory';
import { CodeBlock } from '../../CodeBlock';

export type StageBgMode = 'solid' | 'gradient' | 'arena' | 'flow';

export interface CustomAnnouncementPreset {
  id: string;
  label: string;
  topText: string;
  mainText: string;
}

export const DIRECTORY_ITEMS: JumpDirectoryItem[] = [
  { id: 'center-upper-stage', code: '5E-1',
    name: 'HudAnchorStage (upper-center)', label: 'Top-center high-priority live stage + Winner Blue Team RGB menu + ADMIN CONTROL / MATCH PAUSED' },
  {
    id: 'center-upper-tuner',
    code: '5E-2',
    name: 'OutGlow, Winner Blue RGB & Duration Tuner',
    label: 'Winner Blue Team Color (5G presets + manual RGB), Out Glow, 400ms 1.5x Entry Impact, 2000ms Duration & 400ms Tail fade tuner',
  },
  {
    id: 'center-upper-archetypes',
    code: '5E-3',
    name: 'Archetype Gallery & Recipe',
    label: 'Three types of high-priority alert reference cards (Countdown / Winner Blue & Orange / Custom ADMIN CONTROL · MATCH PAUSED)',
  },
];

export const CUSTOM_ANNOUNCEMENT_PRESETS: CustomAnnouncementPreset[] = [
  { id: 'match-paused', label: 'MATCH PAUSED (ADMIN CONTROL)', topText: 'ADMIN CONTROL', mainText: 'MATCH PAUSED' },
  { id: 'overtime', label: 'OVERTIME (Sudden Death)', topText: 'SUDDEN DEATH', mainText: 'OVERTIME' },
  { id: 'goal-scored', label: 'GOAL SCORED (Goal Broadcast)', topText: 'SCORED BY', mainText: 'ZEN_MASTER_RL' },
  { id: 'match-point', label: 'MATCH POINT (Series Alert)', topText: 'SERIES ALERT', mainText: 'MATCH POINT' },
  { id: 'single-line-info', label: 'WAITING FOR PLAYERS (Single Line Thin)', topText: '', mainText: 'WAITING FOR PLAYERS' },
];

export const BG_COLOR_SWATCHES = ['#090D16', '#000000', '#0F172A', '#1E293B', '#18181B', '#0E2218', '#23121B', '#334155', '#CBD5E1', '#F8FAFC'];

export const RL_GLOW_SWATCHES = ['#FFE600', '#FACC15', '#F59E0B', '#FB923C', '#38BDF8', '#22C55E', '#EF4444', '#A855F7', '#FFFFFF'];

export interface CenterUpperStageBackdropBarProps {
  isLight: boolean;
  stageBgMode: StageBgMode;
  setStageBgMode: (val: StageBgMode | ((prev: StageBgMode) => StageBgMode)) => void;
  arenaPreset: ArenaLightingPreset;
  setArenaPreset: (val: ArenaLightingPreset | ((prev: ArenaLightingPreset) => ArenaLightingPreset)) => void;
  stageBgColor: string;
  setStageBgColor: (val: string | ((prev: string) => string)) => void;
  stageBgSecondaryColor: string;
  setStageBgSecondaryColor: (val: string | ((prev: string) => string)) => void;
  stageBrightness: number;
  setStageBrightness: (val: number | ((prev: number) => number)) => void;
  showPitchLines: boolean;
  setShowPitchLines: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const CenterUpperStageBackdropBar: React.FC<CenterUpperStageBackdropBarProps> = ({
  isLight, stageBgMode, setStageBgMode, arenaPreset, setArenaPreset,
  stageBgColor, setStageBgColor, stageBgSecondaryColor, setStageBgSecondaryColor,
  stageBrightness, setStageBrightness, showPitchLines, setShowPitchLines,
}) => (
  <div className={`p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-4 ${ isLight
    ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-amber-500" />
          <span>Preview Background Mode (Stage Backdrop)</span>
        </span>
      </div>
      <SegmentedSwitch size="sm" fullWidth isLight={isLight} value={stageBgMode}
        onValueChange={(v) => setStageBgMode(v as StageBgMode)} options={[
        { value: 'solid', label: 'Solid Background (Solid)' }, { value: 'gradient', label: 'Dual Gradient (Gradient)' },
        { value: 'arena', label: 'Stadium Preset (Arena)' }, ]} />
      {stageBgMode === 'arena' && (
        <SegmentedSwitch size="sm" fullWidth isLight={isLight} value={arenaPreset}
          onValueChange={(v) => setArenaPreset(v as ArenaLightingPreset)} options={[
          { value: 'night', label: 'Night' }, { value: 'twilight', label: 'Twilight' },
          { value: 'daylight', label: 'Daylight' }, { value: 'flow', label: 'Flow' }, ]} />
      )}
    </div>
    <div>
      <ColorSwatchInput label="Preview Background Main Color (Background Color)" description="Toggle Dark/Light/Stadium Color Check Out Glow Contrast"
        value={stageBgColor} onChange={setStageBgColor} presets={BG_COLOR_SWATCHES} isLight={isLight} />
    </div>
    <div className="flex flex-col justify-between gap-2">
      {stageBgMode === 'gradient' ? (
        <ColorSwatchInput label="Gradient Center Secondary Color (Radial Core Color)" value={stageBgSecondaryColor}
          onChange={setStageBgSecondaryColor} presets={['#1E293B', '#0F172A', '#31102F', '#064E3B', '#3B2F13']}
          isLight={isLight} />
      ) : (
        <SliderControl label="Background Environment Brightness (Backdrop Brightness)" value={stageBrightness} min={10} max={100} step={1}
          unit="%" onChange={setStageBrightness} isLight={isLight} />
      )}
      <div className="flex items-center justify-between pt-1">
        <ToggleSwitch label="Stadium Midline/Center Circle Texture" checked={showPitchLines} onCheckedChange={setShowPitchLines}
          isLight={isLight} />
        <span className="text-[11px] font-mono opacity-60">16:9 Safe Stage</span>
      </div>
    </div>
  </div>
);

export interface CenterUpperArchetypesSectionProps {
  isLight: boolean;
  stageBgColor: string;
  winnerTeam: WinnerTeamPreset;
  winnerBlueConfig: CenterUpperBlueTeamConfig;
  activeVariant: CenterUpperInfoVariant;
  upperCenterTopPct: number;
  activePayload: CenterUpperInfoPayload | null;
  glowConfig: CenterUpperGlowConfig;
  typoConfig: CenterUpperTypographyConfig;
  timingConfig: CenterUpperTimingConfig;
  handleSelectVariant: (variant: CenterUpperInfoVariant) => void;
  startCountdownSequence: (stepIntervalOverride?: number) => void;
  handleSelectWinnerTeam: (team: WinnerTeamPreset) => void;
  handleApplyCustomPreset: (preset: CustomAnnouncementPreset) => void;
}

export const CenterUpperArchetypesSection: React.FC<
  CenterUpperArchetypesSectionProps
> = ({
  isLight,
  stageBgColor,
  winnerTeam,
  winnerBlueConfig,
  activeVariant,
  upperCenterTopPct,
  activePayload,
  glowConfig,
  typoConfig,
  timingConfig,
  handleSelectVariant,
  startCountdownSequence,
  handleSelectWinnerTeam,
  handleApplyCustomPreset,
}) => {
  const blueGlowHex = winnerBlueConfig.syncGlowWithText
    ? winnerBlueConfig.textColor
    : winnerBlueConfig.glowColor;

  return (
    <section id="center-upper-archetypes" className={`p-5 rounded-3xl border flex flex-col gap-5 scroll-mt-24 ${
      isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
      : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
      <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="amber" size="sm" isLight={isLight}>
            5E-3
          </Badge>
          <h2 className="text-sm font-bold font-mono">Visual specification for three types of upper-center high-priority alerts (Countdown / Winner / Custom Announcement)</h2>
        </div>
        <span className="text-xs font-mono opacity-65">Click any card to switch text and trigger animations</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 3-2-1-GO Countdown */}
        <div
          onClick={() => {
            handleSelectVariant('countdown');
            startCountdownSequence();
          }}
          className="group relative h-44 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-[1.01]"
          style={{ backgroundColor: stageBgColor }}
        >
          <span className="absolute top-2.5 left-3 text-[10px] font-mono uppercase tracking-wider text-amber-400/90 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
            1. Countdown · 3-2-1-GO · 1.50x Pop
          </span>
          <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 100, fontSize: '68px',
            letterSpacing: '0em', color: '#FFE600', WebkitTextStroke: '1.2px #F59E0B', }}
            className="leading-none select-none">
            3 · 2 · 1 · GO
          </div>
          <span className="absolute bottom-2.5 text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">
            Click to play on main stage 3 -&gt; 2 -&gt; 1 -&gt; GO Sequence -&gt;
          </span>
        </div>

        {/* Card 2: Winner (Regular 400 + Thin 100) */}
        <div
          onClick={() => handleSelectWinnerTeam(winnerTeam === 'blue' ? 'orange' : 'blue')}
          className="group relative h-44 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.01]"
          style={{ backgroundColor: stageBgColor }}
        >
          <span className="absolute top-2.5 left-3 text-[10px] font-mono uppercase tracking-wider text-sky-400/90 bg-black/60 px-2 py-0.5 rounded border border-sky-500/30">
            2. Winner · Top Unchanged + Blue Team Color
          </span>
          <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 400, fontSize: '20px',
            letterSpacing: '0em', color: '#FFFFFF', textShadow: '0 0 18px rgba(245, 158, 11, 0.7)' }}
            className="leading-none select-none">
            WINNER
          </div>
          <div className="flex items-center gap-2 leading-none select-none"
            style={{ fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 100, fontSize: '36px', letterSpacing: '0em' }}>
            <span style={{ color: winnerBlueConfig.textColor, textShadow: `0 0 22px ${blueGlowHex}` }}>
              BLUE
            </span>
            <span className="text-neutral-500 text-2xl">/</span>
            <span style={{ color: '#FFE600', textShadow: '0 0 22px rgba(245, 158, 11, 0.7)' }}>
              ORANGE
            </span>
          </div>
          <span className="absolute bottom-2.5 text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">
            Click to Toggle Blue Team ({winnerBlueConfig.textColor}) / Orange Team -&gt;
          </span>
        </div>

        {/* Card 3: Custom Announcement (ADMIN CONTROL / MATCH PAUSED) */}
        <div
          onClick={() =>
            handleApplyCustomPreset(
              CUSTOM_ANNOUNCEMENT_PRESETS.find((p) => p.id === 'match-paused') ??
                CUSTOM_ANNOUNCEMENT_PRESETS[0]
            )
          }
          className="group relative h-44 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.01]"
          style={{ backgroundColor: stageBgColor }}
        >
          <span className="absolute top-2.5 left-3 text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">
            3. Custom · Forced Uppercase Announcement
          </span>
          <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 400, fontSize: '18px',
            letterSpacing: '0em', color: '#FFFFFF', textShadow: '0 0 18px rgba(245, 158, 11, 0.7)' }}
            className="leading-none select-none uppercase">
            ADMIN CONTROL
          </div>
          <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 100, fontSize: '38px',
            letterSpacing: '0em', color: '#FFE600', textShadow: '0 0 22px rgba(245, 158, 11, 0.7)' }}
            className="leading-none select-none whitespace-nowrap uppercase">
            MATCH PAUSED
          </div>
          <span className="absolute bottom-2.5 text-[10px] font-mono text-neutral-400 group-hover:text-white transition-colors">
            Click to Load ADMIN CONTROL / MATCH PAUSED -&gt;
          </span>
        </div>
      </div>

      {/* Decoupled Integration Recipe */}
      <CodeBlock
        title="Zero Coupling HudAnchorStage (upper-center, top=40%) + CenterUpperInfoHUD Integrated Code Recipe"
        language="tsx"
        isLight={isLight}
        code={`import { HudAnchorStage, HudZone, HudSlot } from '@/ui-core/layout/HudAnchorStage';
import { CenterUpperInfoHUD } from '@/ui-core/hud/CenterUpperInfoHUD';

export function MatchUpperCenterOverlay() {
  return (
    <HudAnchorStage strategy="reserve">
      <HudZone anchor="upper-center" style={{ top: '${upperCenterTopPct}%' }}>
        <HudSlot visible={true} mode="reserve">
          <CenterUpperInfoHUD
            info={{
              variant: '${activeVariant}',
              winnerTeam: '${winnerTeam}',
              topText: '${activePayload?.topText ?? ''}', // JetBrains Mono Regular (400)
              mainText: '${activePayload?.mainText ?? '3'}', // JetBrains Mono Thin (100)
            }}
            glowConfig={{
              textColor: '${glowConfig.textColor}',
              glowColor: '${glowConfig.glowColor}',
              topLabelColor: '${glowConfig.topLabelColor ?? '#FFFFFF'}',
              topLabelGlowColor: '${glowConfig.topLabelGlowColor ?? '#F59E0B'}',
              innerBlurPx: ${glowConfig.innerBlurPx},
              outerBlurPx: ${glowConfig.outerBlurPx},
              ambientBlurPx: ${glowConfig.ambientBlurPx},
              intensityPct: ${glowConfig.intensityPct},
              backdropBloomPct: ${glowConfig.backdropBloomPct ?? 0},
              strokeWidthPx: ${glowConfig.strokeWidthPx ?? 0},
            }}
            winnerBlueConfig={{
              enabled: ${winnerBlueConfig.enabled},
              textColor: '${winnerBlueConfig.textColor}',
              glowColor: '${winnerBlueConfig.glowColor}',
              syncGlowWithText: ${winnerBlueConfig.syncGlowWithText},
              innerBlurPx: ${winnerBlueConfig.innerBlurPx},
              outerBlurPx: ${winnerBlueConfig.outerBlurPx},
              ambientBlurPx: ${winnerBlueConfig.ambientBlurPx},
              intensityPct: ${winnerBlueConfig.intensityPct},
              strokeWidthPx: ${winnerBlueConfig.strokeWidthPx},
              strokeColor: '${winnerBlueConfig.strokeColor}',
            }}
            typographyConfig={{
              mainFontSizePx: ${typoConfig.mainFontSizePx},
              mainFontWeight: ${typoConfig.mainFontWeight},
              mainLetterSpacingEm: ${typoConfig.mainLetterSpacingEm},
              topFontSizePx: ${typoConfig.topFontSizePx},
              topFontWeight: ${typoConfig.topFontWeight},
              topLetterSpacingEm: ${typoConfig.topLetterSpacingEm},
              lineGapPx: ${typoConfig.lineGapPx},
              uppercase: ${typoConfig.uppercase},
              italic: ${typoConfig.italic ?? false},
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
  );
}`}
      />
    </section>
  );
};

export interface CenterUpperStageCanvasProps {
  stageBgMode: StageBgMode;
  arenaPreset: ArenaLightingPreset;
  stageBrightness: number;
  showPitchLines: boolean;
  showAnchorGuides: boolean;
  upperCenterTopPct: number;
  showSurroundingHud: boolean;
  activePayload: CenterUpperInfoPayload | null;
  glowConfig: CenterUpperGlowConfig;
  winnerBlueConfig: CenterUpperBlueTeamConfig;
  typoConfig: CenterUpperTypographyConfig;
  timingConfig: CenterUpperTimingConfig;
  activeVariant: CenterUpperInfoVariant;
  isSequencePlaying: boolean;
  setIsVisibleOnStage: (val: boolean) => void;
  getStageBackgroundStyle: () => React.CSSProperties;
}

export const CenterUpperStageCanvas: React.FC<CenterUpperStageCanvasProps> = ({
  stageBgMode,
  arenaPreset,
  stageBrightness,
  showPitchLines,
  showAnchorGuides,
  upperCenterTopPct,
  showSurroundingHud,
  activePayload,
  glowConfig,
  winnerBlueConfig,
  typoConfig,
  timingConfig,
  activeVariant,
  isSequencePlaying,
  setIsVisibleOnStage,
  getStageBackgroundStyle,
}) => {
  return (
    <div
      className="relative w-full h-[500px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl transition-colors duration-200"
      style={getStageBackgroundStyle()}>
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

      {showAnchorGuides && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-amber-400/25 -translate-x-1/2" />
          <div
            className="absolute inset-x-0 h-px border-t border-dashed border-amber-400/45 transition-all duration-150"
            style={{ top: `${upperCenterTopPct}%` }}>
            <span className="absolute right-3 -top-5 px-1.5 py-0.5 rounded bg-black/65 border border-amber-500/40 text-[10px] font-mono text-amber-300">
              HudZone anchor=&quot;upper-center&quot; (Y = {upperCenterTopPct}%)
            </span>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40">
            <Crosshair className="h-4 w-4 text-white" />
            <span className="text-[9px] font-mono text-white bg-black/50 px-1.5 py-0.5 rounded">
              50% Center (Car Reticle Zone)
            </span>
          </div>
        </div>
      )}

      <HudAnchorStage strategy="reserve" style={{ fontFamily: 'var(--font-jetbrains)' }}>
        {showSurroundingHud && (
          <>
            <HudZone anchor="top-center" flush zIndexClassName="z-30">
              <StepperScoreboardHUD
                isLight={false}
                leftScore={2}
                rightScore={1}
                seconds={134}
                bestOf={5}
                leftSeriesWins={2}
                rightSeriesWins={1}
              />
            </HudZone>

            <HudZone anchor="top-left" flush className="pt-[56px]">
              <EdgePlayerHudStrip
                side="left"
                teamColor="#2563EB"
                barColor="#3B82F6"
                isLight={false}
                viewMode="player-live"
                players={DEFAULT_INITIAL_ROSTER.leftPlayers}
              />
            </HudZone>

            <HudZone anchor="bottom-left">
              <BallCameraIndicator
                active={true}
                shortcut="SPACE"
                label="BALL CAM"
                actionText="TO TOGGLE"
                isLight={false}
              />
            </HudZone>

            <HudZone anchor="bottom-center">
              <div className="w-[320px] max-w-[40vw]">
                <VelocityProgressBar speed={1640} width="100%" height={14} />
              </div>
            </HudZone>

            <HudZone anchor="bottom-right">
              <CircularBoostGauge amount={85} size={118} isLight={false} />
            </HudZone>
          </>
        )}

        <HudZone anchor="upper-center" zIndexClassName="z-40" style={{ top: `${upperCenterTopPct}%` }}>
          <HudSlot visible={true} mode="reserve">
            <CenterUpperInfoHUD
              info={activePayload}
              glowConfig={glowConfig}
              winnerBlueConfig={winnerBlueConfig}
              typographyConfig={typoConfig}
              timingConfig={timingConfig}
              onExpire={() => {
                if (!isSequencePlaying && !timingConfig.persistentInspect) {
                  setIsVisibleOnStage(false);
                }
              }}
            />
          </HudSlot>
        </HudZone>
      </HudAnchorStage>

      <div className="absolute top-3 right-3 z-40 flex items-center gap-2 px-3 py-1 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md text-[11px] font-mono text-neutral-200 pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <span>
          Mode: <strong className="text-amber-400 uppercase">{activeVariant}</strong>
        </span>
        <span className="opacity-30">|</span>
        <span>
          Scale: <strong className="text-emerald-400">{timingConfig.entryScale.toFixed(2)}x</strong>
        </span>
        <span className="opacity-30">|</span>
        <span>
          Hold: <strong className="text-sky-400">{timingConfig.durationMs}ms</strong>
        </span>
        <span className="opacity-30">|</span>
        <span>
          FadeOut: <strong className="text-rose-400">{timingConfig.exitDurationMs}ms</strong>
        </span>
      </div>
    </div>
  );
};

export interface CenterUpperAnnouncementControlsProps {
  isLight: boolean;
  customPresetId: string;
  handleApplyCustomPreset: (preset: CustomAnnouncementPreset) => void;
  showCustomTopLine: boolean;
  setShowCustomTopLine: (val: boolean) => void;
  customTopText: string;
  setCustomTopText: (val: string) => void;
  customMainText: string;
  setCustomMainText: (val: string) => void;
  customSubText: string;
  setCustomSubText: (val: string) => void;
  setIsVisibleOnStage: (val: boolean) => void;
}

export const CenterUpperAnnouncementControls: React.FC<CenterUpperAnnouncementControlsProps> = ({
  isLight,
  customPresetId,
  handleApplyCustomPreset,
  showCustomTopLine,
  setShowCustomTopLine,
  customTopText,
  setCustomTopText,
  customMainText,
  setCustomMainText,
  customSubText,
  setCustomSubText,
  setIsVisibleOnStage,
}) => {
  return (
    <div className="flex flex-col gap-2.5 pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono font-bold flex items-center gap-1 text-emerald-500 mr-1">
            <Megaphone className="h-3.5 w-3.5" />
            <span>Custom Announcement Presets (Forced Uppercase):</span>
          </span>
          {CUSTOM_ANNOUNCEMENT_PRESETS.map((preset) => {
            const isSelected = customPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyCustomPreset(preset)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <Badge variant="success" size="sm" isLight={isLight}>
          Force Uppercase: TOP `ADMIN CONTROL` · MAIN `MATCH PAUSED`
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ToggleSwitch label="Show Top Regular(400) Line" checked={showCustomTopLine} onCheckedChange={(v) => {
          setShowCustomTopLine(v); setIsVisibleOnStage(true); }} isLight={isLight} />
        {showCustomTopLine && (
          <label className="flex items-center gap-1.5 text-xs font-mono">
            <span className="opacity-70">Top Regular(400):</span>
            <input type="text" value={customTopText} onChange={(e) => { setCustomTopText(e.target.value.toUpperCase());
              setIsVisibleOnStage(true); }} className={`w-40 px-2 py-1 rounded-lg border font-mono text-xs uppercase ${
              isLight ? 'bg-white border-neutral-300 text-neutral-900'
              : 'bg-neutral-900 border-neutral-700 text-neutral-100' }`} />
          </label>
        )}
        <label className="flex items-center gap-1.5 text-xs font-mono">
          <span className="opacity-70">Main Row Thin(100):</span>
          <input type="text" value={customMainText} onChange={(e) => { setCustomMainText(e.target.value.toUpperCase());
            setIsVisibleOnStage(true); }} className={`w-56 px-2 py-1 rounded-lg border font-mono text-xs uppercase ${ isLight
            ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
            }`} />
        </label>
        <label className="flex items-center gap-1.5 text-xs font-mono">
          <span className="opacity-70">Bottom Capsule Footer (Leave Blank if Unused):</span>
          <input type="text" value={customSubText} placeholder="Default blank if hidden" onChange={(e) => {
            setCustomSubText(e.target.value.toUpperCase()); setIsVisibleOnStage(true); }}
            className={`w-44 px-2 py-1 rounded-lg border font-mono text-xs uppercase ${ isLight
            ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-neutral-900 border-neutral-700 text-neutral-100'
            }`} />
        </label>
      </div>
    </div>
  );
};
