import React from 'react';
import { LayoutGrid, Zap, Layers } from 'lucide-react';
import { BallCameraIndicator } from '../../../ui-core/hud/BallCameraIndicator';
import { VelocityProgressBar } from '../../../ui-core/hud/VelocityProgressBar';
import { CircularBoostGauge } from '../../../ui-core/hud/CircularBoostGauge';
import { CompactTelemetryBarHUD } from '../../../ui-core/hud/CompactTelemetryBarHUD';
import { FlipIndicatorPillHUD } from '../../../ui-core/hud/FlipIndicatorPillHUD';
import { ReplayControlBannerHUD } from '../../../ui-core/hud/ReplayControlBannerHUD';
import { KickoffRhythmOverlayHUD } from '../../../ui-core/hud/KickoffRhythmOverlayHUD';
import { StaticTrainingPackHUD } from '../../../ui-core/hud/StaticTrainingPackHUD';
import { ArenaBackdrop } from '../../ArenaBackdrop';
import { type HudTransientChannel } from '../../../ui-core/stores/hudTransientChannel';
import { type HudSpeedListener, type HudBoostListener, type HudBallCamListener, type EditSubMode } from '../../../ui-core/stores/hudTransientTypes';
import { GameViewport } from '../../../ui-core/viewport/GameViewport';
import { Badge } from '../../../ui-core/primitives/Badge';
import { SectionErrorBoundary } from '../../../ui-core/primitives/SectionErrorBoundary';
import { CodeBlock } from '../../CodeBlock';

export type SlotLayoutPreset = 'classic-triad' | 'bottom-cluster' | 'edge-flush';

export interface HudStageAndFollowupSectionProps {
  isLight: boolean;
  is120HzLive: boolean;
  slotPreset: SlotLayoutPreset;
  setSlotPreset: (preset: SlotLayoutPreset) => void;
  ballCamActive: boolean;
  subscribeBallCamFn?: (listener: HudBallCamListener) => () => void;
  ballCamShortcut: string | null;
  ballCamLabel: string;
  handleToggleBallCam: () => void;
  speed: number;
  subscribeSpeedFn?: (listener: HudSpeedListener) => () => void;
  boostAmount: number;
  isUnlimitedBoost: boolean;
  subscribeBoostFn?: (listener: HudBoostListener) => () => void;
  transientChannel: HudTransientChannel;
}

export const HudStageAndFollowupSection = React.memo<HudStageAndFollowupSectionProps>(({
  isLight,
  is120HzLive,
  slotPreset,
  setSlotPreset,
  ballCamActive,
  subscribeBallCamFn,
  ballCamShortcut,
  ballCamLabel,
  handleToggleBallCam,
  speed,
  subscribeSpeedFn,
  boostAmount,
  isUnlimitedBoost,
  subscribeBoostFn,
  transientChannel,
}) => {
  return (
    <>
      {/* SECTION 5A.5S: DECOUPLED 3-WIDGET STAGE SANDBOX */}
      <SectionErrorBoundary title="5A.5S Decoupled 3-Widget Stage" isLight={isLight}>
        <section id="hud-5a-5s-triad-stage" className="flex flex-col gap-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b pb-2 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="px-2 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs font-mono">
                5A.5S
              </div>
              <h2 className="text-base font-bold tracking-tight">
                Decoupled 3-Widget Stage (high frequency Speed/Boost + low frequency BallCam Zero-coupling slot test bench)
              </h2>
              <Badge variant="amber" size="sm" isLight={isLight}>
                Layout-Agnostic Widgets
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
              <LayoutGrid className="h-3.5 w-3.5 text-amber-500 mr-1" />
              <span className="text-neutral-400 text-[11px]">Slot Layout Experiment:</span>
              {(
                [
                  { id: 'classic-triad', label: 'A. Classic Three-Point Anchor' },
                  { id: 'bottom-cluster', label: 'B. Bottom Compact Cluster' },
                  { id: 'edge-flush', label: 'C. Bottom edge full-width bar' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSlotPreset(p.id)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-all ${
                    slotPreset === p.id
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
            Mount only the finalized version in this sandbox 3 Components (low frequency <code className="font-mono">BallCameraIndicator</code> + 120Hz high frequency <code className="font-mono">VelocityProgressBar</code> + 120Hz high frequency <code className="font-mono">CircularBoostGauge</code>) . When switching top-right layout presets, <strong>No changes needed to internal component code</strong>, Position determined entirely by outer slot: 
          </p>

          <div className="relative w-full h-[380px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-xl bg-black">
            <ArenaBackdrop preset={isLight ? 'daylight' : 'night'} brightness={isLight ? 80 : 30} />

            <div className="relative z-20 w-full h-full">
              <GameViewport isLight={isLight} className="w-full h-full">
                <div className="relative w-full h-full pointer-events-none select-none p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 rounded-xl border bg-neutral-950/75 border-neutral-800 text-[11px] font-mono text-neutral-300 flex items-center gap-2 backdrop-blur-md">
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>
                        Slot Preset: <strong className="text-amber-400 uppercase">{slotPreset}</strong>
                      </span>
                      <span className="text-neutral-600">|</span>
                      <span>
                        Drive: <strong className="text-emerald-400">{is120HzLive ? '120Hz Transient Ref' : 'Manual Props'}</strong>
                      </span>
                    </div>
                  </div>

                  {slotPreset === 'classic-triad' && (
                    <div className="w-full flex items-end justify-between gap-4">
                      <div className="w-1/4 flex justify-start">
                        <BallCameraIndicator
                          active={ballCamActive}
                          subscribeBallCam={subscribeBallCamFn}
                          shortcut={ballCamShortcut}
                          label={ballCamLabel}
                          isLight={isLight}
                          onToggle={handleToggleBallCam}
                        />
                      </div>

                      <div className="flex-1 max-w-[440px] flex flex-col items-center pb-1">
                        <VelocityProgressBar
                          speed={speed}
                          subscribeSpeed={subscribeSpeedFn}
                          width="100%"
                          height={16}
                        />
                      </div>

                      <div className="w-1/4 flex justify-end">
                        <CircularBoostGauge
                          amount={boostAmount}
                          isUnlimited={isUnlimitedBoost}
                          subscribeBoost={subscribeBoostFn}
                          isLight={isLight}
                        />
                      </div>
                    </div>
                  )}

                  {slotPreset === 'bottom-cluster' && (
                    <div className="w-full flex items-end justify-center gap-8">
                      <div className="flex flex-col items-start gap-2.5 w-[380px]">
                        <BallCameraIndicator
                          active={ballCamActive}
                          subscribeBallCam={subscribeBallCamFn}
                          shortcut={ballCamShortcut}
                          label={ballCamLabel}
                          isLight={isLight}
                          onToggle={handleToggleBallCam}
                        />
                        <VelocityProgressBar
                          speed={speed}
                          subscribeSpeed={subscribeSpeedFn}
                          width="100%"
                          height={14}
                        />
                      </div>

                      <CircularBoostGauge
                        amount={boostAmount}
                        isUnlimited={isUnlimitedBoost}
                        subscribeBoost={subscribeBoostFn}
                        isLight={isLight}
                      />
                    </div>
                  )}

                  {slotPreset === 'edge-flush' && (
                    <div className="w-full flex flex-col gap-3">
                      <div className="w-full flex items-end justify-between">
                        <BallCameraIndicator
                          active={ballCamActive}
                          subscribeBallCam={subscribeBallCamFn}
                          shortcut={ballCamShortcut}
                          label={ballCamLabel}
                          isLight={isLight}
                          onToggle={handleToggleBallCam}
                        />
                        <CircularBoostGauge
                          amount={boostAmount}
                          isUnlimited={isUnlimitedBoost}
                          subscribeBoost={subscribeBoostFn}
                          isLight={isLight}
                        />
                      </div>
                      <VelocityProgressBar
                        speed={speed}
                        subscribeSpeed={subscribeSpeedFn}
                        width="100%"
                        height={10}
                      />
                    </div>
                  )}
                </div>
              </GameViewport>
            </div>
          </div>
        </section>
      </SectionErrorBoundary>

      {/* SECTION 5A.6 ~ 5A.9: ROCKETCOMPANION FOLLOW-UP 120HZ HUD OVERLAYS */}
      <section className="flex flex-col gap-5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="px-2 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs font-mono">
              5A.6 ~ 5A.9
            </div>
            <h2 className="text-base font-bold tracking-tight">
              RocketCompanion 120Hz HUD Specialized Storage (`5A.6` ~ `5A.9` · Light/Dark Dual-mode adaptive)
            </h2>
            <Badge variant="amber" size="sm" isLight={isLight}>
              Zero React Re-render · Cached 2D Canvas + DOM Ref
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <SectionErrorBoundary title="5A.6 & 5A.7 CompactTelemetryBarHUD & FlipIndicatorPillHUD" isLight={isLight}>
            <div
              id="hud-5a-6-telemetry-flip"
              className={`p-6 rounded-3xl border flex flex-col justify-between gap-5 scroll-mt-24 ${
                isLight
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-900 shadow-xs'
                  : 'bg-neutral-950 border-neutral-800/90 text-neutral-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold font-mono uppercase tracking-wider ${
                    isLight ? 'text-amber-600' : 'text-amber-400'
                  }`}
                >
                  [5A.6 & 5A.7] CompactTelemetryBarHUD & FlipIndicatorPillHUD
                </span>
                <span className="text-[11px] font-mono text-emerald-500 font-bold">0 VDOM Diff</span>
              </div>

              <div className="flex flex-col gap-4 py-2">
                <CompactTelemetryBarHUD
                  isLight={isLight}
                  subscribeTelemetry={
                    is120HzLive ? transientChannel.subscribeTelemetry : undefined
                  }
                />
                <div className="flex items-center gap-4">
                  <FlipIndicatorPillHUD
                    isLight={isLight}
                    subscribeFlip={is120HzLive ? transientChannel.subscribeFlip : undefined}
                  />
                </div>
              </div>

              <p className={`text-[11px] font-mono ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
                Top 4 Metric micro-capsules and bottom-left double-jump countdown status light: via{' '}
                <code className="font-mono text-amber-500">subscribeTelemetry</code> and{' '}
                <code className="font-mono text-amber-500">subscribeFlip</code> Direct Modification DOM Node text and progress bar width. 
              </p>
            </div>
          </SectionErrorBoundary>

          <SectionErrorBoundary title="5A.8 ReplayControlBannerHUD" isLight={isLight}>
            <div
              id="hud-5a-8-replay-banner"
              className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 scroll-mt-24 ${
                isLight
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-900 shadow-xs'
                  : 'bg-neutral-950 border-neutral-800/90 text-neutral-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold font-mono uppercase tracking-wider ${
                    isLight ? 'text-amber-600' : 'text-amber-400'
                  }`}
                >
                  [5A.8] ReplayControlBannerHUD (Goal Scorer Pill + Scrubber)
                </span>
                <span className="text-[11px] font-mono text-sky-500 font-bold">
                  subscribeReplayBanner Ref
                </span>
              </div>

              <ReplayControlBannerHUD
                isLight={isLight}
                subscribeReplayBanner={
                  is120HzLive ? transientChannel.subscribeReplayBanner : undefined
                }
              />
            </div>
          </SectionErrorBoundary>
        </div>

        <SectionErrorBoundary title="5A.9 KickoffRhythmOverlayHUD" isLight={isLight}>
          <div
            id="hud-5a-9-kickoff-rhythm"
            className={`p-6 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${
              isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-900 shadow-xs'
                : 'bg-neutral-950 border-neutral-800/90 text-neutral-100'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={`text-xs font-bold font-mono uppercase tracking-wider ${
                  isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                [5A.9] KickoffRhythmOverlayHUD (120Hz Cached 2D Canvas Falling Note Highway + 9-Key Receptor Row)
              </span>
              <span className="text-[11px] font-mono text-emerald-500 font-bold">
                subscribeKickoffFrame Connected · Zero Heap Alloc
              </span>
            </div>
            <KickoffRhythmOverlayHUD
              isLight={isLight}
              subscribeKickoffFrame={
                is120HzLive ? transientChannel.subscribeKickoffFrame : undefined
              }
            />
          </div>
        </SectionErrorBoundary>
        <SectionErrorBoundary title="5A.10 StaticTrainingPackHUD" isLight={isLight}>
          <div
            id="hud-5a-10-static-training-pack"
            className={`p-6 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${
              isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-900 shadow-xs'
                : 'bg-neutral-950 border-neutral-800/90 text-neutral-100'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span
                className={`text-xs font-bold font-mono uppercase tracking-wider ${
                  isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                [5A.10] StaticTrainingPackHUD (Top-Center Shot Banner & Sub-Mode Selector)
              </span>
              <span className="text-[11px] font-mono text-sky-500 font-bold">
                Pure Props Memo · Shared with 6E Edge Inspector
              </span>
            </div>
            <div className="relative min-h-[110px] rounded-2xl border border-neutral-500/20 flex items-center justify-center overflow-hidden">
              <StaticTrainingPackHUD
                isLight={isLight}
                shotIndex={0}
                editSubMode={'car-heading' as EditSubMode}
                shot={{
                  car: {
                    unlimitedBoost: isUnlimitedBoost,
                    initialBoost: boostAmount,
                    snapToGround: true,
                    hasFlip: true,
                    speedFollowsHeading: false,
                  },
                }}
                className="!static !translate-x-0"
              />
            </div>
          </div>
        </SectionErrorBoundary>
      </section>

      {/* Agent Code Recipe Snippet */}
      <section className="flex flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-bold">Agent Copy call recipe (120Hz Transient & Memo HUD Recipe)</h3>
        </div>
        <CodeBlock
          isLight={isLight}
          title="120Hz Transient Zero-Repaint HUD + low frequency BallCam Decoupled Call Example"
          code={`import { BallCameraIndicator } from '@/ui-core/hud/BallCameraIndicator';
import { VelocityProgressBar } from '@/ui-core/hud/VelocityProgressBar';
import { CircularBoostGauge } from '@/ui-core/hud/CircularBoostGauge';
import { createHudTransientChannel } from '@/ui-core/stores/hudTransientChannel';

const hudChannel = createHudTransientChannel({ speed: 0, boostAmount: 100 });

<BallCameraIndicator
  active={isBallCamActive}
  shortcut="SPACE"
  onToggle={() => setBallCamActive((v) => !v)}
/>

<VelocityProgressBar
  subscribeSpeed={hudChannel.subscribeSpeed}
  width="100%"
  height={20}
/>

<CircularBoostGauge
  subscribeBoost={hudChannel.subscribeBoost}
  size={148}
  isLight={isLight}
/>`}
        />
      </section>
    </>
  );
});

HudStageAndFollowupSection.displayName = 'HudStageAndFollowupSection';
