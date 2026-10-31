import React, { useEffect, useRef } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:hud-elements');
import { Crosshair, Sparkles, Zap, Play, Pause, } from 'lucide-react';
import { StepperScoreboardHUD } from '../../ui-core/hud/StepperScoreboardHUD';
import { EdgePlayerHudStrip } from '../../ui-core/hud/EdgePlayerHudStrip';
import {
  createHudTransientChannel,
  DEFAULT_SKIP_INDICATOR_CONFIG,
  EdgeSkipIndicatorConfig,
  resolveSkipIndicatorConfig,
} from '../../ui-core/stores/hudTransientChannel';
import { Badge } from '../../ui-core/primitives/Badge';
import { SectionErrorBoundary } from '../../ui-core/primitives/SectionErrorBoundary';
import { PageJumpDirectory, JumpDirectoryItem } from '../PageJumpDirectory';
import { HudSpatialChoreographySandbox } from './hud-elements/HudSpatialChoreographySandbox';
import { EdgeDemoInspectorSection } from './hud-elements/EdgeDemoInspectorSection';
import { EdgeSkipReplayInspectorSection } from './hud-elements/EdgeSkipReplayInspectorSection';
import { HudCoreTriadInspectorSection } from './hud-elements/HudCoreTriadInspectorSection';
import { HudStageAndFollowupSection, type SlotLayoutPreset } from './hud-elements/HudStageAndFollowupSection';

export { type SlotLayoutPreset };

const HUD_5A_DIRECTORY_ITEMS: JumpDirectoryItem[] = [
  { id: 'hud-5a-sandbox', code: '5A.S',
    name: 'HudSpatialChoreographySandbox', label: 'High-density full-screen layout and transient animation sandbox (Top Edge Docking + Anti-glitch Double Chin)' },
  { id: 'hud-5a-1-scoreboard', code: '5A.1', name: 'StepperScoreboardHUD', label: 'Top flush right angle·Bottom rounded scoreboard + Anti-glitch Single/Double Chin' },
  { id: 'hud-5a-2-edge-strip', code: '5A.2',
    name: 'EdgePlayerHudStrip', label: '3v3 Strictly axis-symmetric single-sided rounded bar (Live/Replay/Spectator)' },
  { id: 'hud-5a-2-demo-inspector', code: '5A.2+',
    name: 'EdgeDemoInspectorSection', label: 'Explosion status persistent preview Bomb SVG size/weight/Outer glow workbench' },
  { id: 'hud-5a-2-skip-inspector', code: '5A.2++',
    name: 'EdgeSkipReplayInspectorSection', label: 'Skip Replay & Slot Extension Card under-card border, push/retract choreography & icon workbench' },
  { id: 'hud-5a-3-ball-cam', code: '5A.3',
    name: 'BallCameraIndicator', label: 'Low-frequency discrete sphere view indicator (React.memo + subscribeBallCam)' },
  { id: 'hud-5a-4-velocity-bar', code: '5A.4',
    name: 'VelocityProgressBar', label: '120Hz Zero-radius supersonic progress bar (subscribeSpeed DOM Ref)' },
  { id: 'hud-5a-5-boost-gauge', code: '5A.5',
    name: 'CircularBoostGauge', label: '120Hz Fully parametric circular progress gauge (subscribeBoost SVG Ref)' },
  { id: 'hud-5a-5s-triad-stage', code: '5A.5S',
    name: 'Decoupled 3-Widget Stage', label: 'high frequency Speed/Boost + low frequency BallCam Zero-coupling slot layout test bench' },
  { id: 'hud-5a-6-telemetry-flip', code: '5A.6 & 5A.7',
    name: 'CompactTelemetryBarHUD & FlipIndicatorPillHUD', label: 'Top-Left 4 Metric Micro-capsule + Double-jump countdown status light' },
  { id: 'hud-5a-8-replay-banner', code: '5A.8',
    name: 'ReplayControlBannerHUD', label: 'Goal Replay Top Bar + 120Hz Progress bar Scrubber Ref' },
  { id: 'hud-5a-9-kickoff-rhythm', code: '5A.9',
    name: 'KickoffRhythmOverlayHUD', label: '120Hz Zero Allocation Canvas Kickoff Rhythm Track + 9Key Hit Row' },
];

export const HudElementsPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [ballCamActive, setBallCamActive] = useState<boolean>(true, 'ballCamActive');
  const [ballCamShortcut, setBallCamShortcut] = useState<string | null>('SPACE', 'ballCamShortcut');
  const [ballCamLabel, setBallCamLabel] = useState<string>('BALL CAM', 'ballCamLabel');
  const [speed, setSpeed] = useState<number>(1410, 'speed');
  const [barWidth, setBarWidth] = useState<string>('100%', 'barWidth');
  const [barHeight, setBarHeight] = useState<number>(20, 'barHeight');
  const [boostAmount, setBoostAmount] = useState<number>(35, 'boostAmount');
  const [isUnlimitedBoost, setIsUnlimitedBoost] = useState<boolean>(false, 'isUnlimitedBoost');
  const [gaugeSize, setGaugeSize] = useState<number>(148, 'gaugeSize');
  const [is120HzLive, setIs120HzLive] = useState<boolean>(true, 'is120HzLive');
  const [slotPreset, setSlotPreset] = useState<SlotLayoutPreset>('classic-triad', 'slotPreset');
  const [edgeSkipReady, setEdgeSkipReady] = useState<Record<1 | 2 | 3 | 4 | 5 | 6, boolean>>(
    { 1: true, 2: false, 3: true, 4: true, 5: false, 6: false },
    'edgeSkipReady'
  );
  const [rawEdgeSkipConfig, setEdgeSkipConfig] = useState<EdgeSkipIndicatorConfig>(
    { ...DEFAULT_SKIP_INDICATOR_CONFIG },
    'edgeSkipConfigV2'
  );
  const edgeSkipConfig = resolveSkipIndicatorConfig(rawEdgeSkipConfig);

  const transientChannelRef = useRef(
    createHudTransientChannel({
      speed: 1410,
      boostAmount: 85,
      isUnlimitedBoost: false,
    })
  );

  const toggleEdgeSkipReady = (slot: 1 | 2 | 3 | 4 | 5 | 6) => {
    setEdgeSkipReady((prev) => {
      const nextVal = !prev[slot];
      transientChannelRef.current.updatePlayerSlot(slot, { replaySkipReady: nextVal });
      return { ...prev, [slot]: nextVal };
    });
  };

  useEffect(() => {
    const ch = transientChannelRef.current;
    ch.setRoster({ viewMode: 'spectator', skipIndicatorConfig: edgeSkipConfig });
    ([1, 2, 3, 4, 5, 6] as const).forEach((k) => {
      ch.updatePlayerSlot(k, { replaySkipReady: Boolean(edgeSkipReady?.[k]) });
    });
  }, [edgeSkipReady, edgeSkipConfig]);

  // Track React render count to prove 120Hz updates cause 0 React re-renders
  const reactRenderCountRef = useRef<number>(0);
  reactRenderCountRef.current += 1;
  const liveSpeedReadoutRef = useRef<HTMLSpanElement | null>(null);
  const liveBoostReadoutRef = useRef<HTMLSpanElement | null>(null);
  const liveHzReadoutRef = useRef<HTMLSpanElement | null>(null);
  const liveRenderRateRef = useRef<HTMLSpanElement | null>(null);

  // Keep unlimited flag synced to transient channel when toggled manually
  useEffect(() => {
    const ch = transientChannelRef.current;
    ch.setBoost(ch.getBoost().amount, isUnlimitedBoost);
  }, [isUnlimitedBoost]);

  // 120Hz Physics Telemetry Stream Simulator (VSync rAF with clamped dt - Zero React setState!)
  useEffect(() => {
    if (!is120HzLive) return;

    const channel = transientChannelRef.current;
    let rafId = 0;
    let tickCount = 0;
    let ticksThisWindow = 0;
    let lastTime = performance.now();
    let lastWindowMark = lastTime;
    let accumulatorMs = 0;
    let lastRenderSnap = reactRenderCountRef.current;
    let scrollCooldownUntil = 0;
    const stepMs = 1000 / 120;

    const onScrollCapture = () => {
      scrollCooldownUntil = performance.now() + 90;
    };
    window.addEventListener('scroll', onScrollCapture, { capture: true, passive: true });

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      if (now < scrollCooldownUntil || document.hidden) {
        lastTime = now;
        return;
      }

      const dt = Math.min(34, Math.max(0, now - lastTime));
      lastTime = now;
      accumulatorMs += dt;

      let steps = 0;
      let latestSpeed = channel.getSpeed();
      let latestBoost = channel.getBoost().amount;

      while (accumulatorMs >= stepMs && steps < 4) {
        accumulatorMs -= stepMs;
        steps++;
        tickCount += 1;
        ticksThisWindow += 1;

        // Simulate realistic Rocket League acceleration -> supersonic surge -> braking cycle (6s period at 120Hz)
        const t = (tickCount % 720) / 720;
        let simSpeed = 1410;
        let simBoost = 85;

        if (t < 0.25) {
          const p = t / 0.25;
          simSpeed = p * 1410;
          simBoost = Math.max(12, 55 - p * 35);
        } else if (t < 0.6) {
          const p = (t - 0.25) / 0.35;
          simSpeed = 1410 + Math.min(1, p * 1.25) * 885;
          simBoost = p < 0.45 ? 100 - p * 90 : Math.max(4, 60 - (p - 0.45) * 100);
        } else if (t < 0.8) {
          const p = (t - 0.6) / 0.2;
          simSpeed = 2240 + Math.sin(p * Math.PI * 4) * 45;
          simBoost = p > 0.3 ? 100 : 12;
        } else {
          const p = (t - 0.8) / 0.2;
          simSpeed = 2240 - p * 1620;
          simBoost = 100 - p * 45;
        }

        latestSpeed = simSpeed;
        latestBoost = simBoost;
        channel.setSpeed(simSpeed);
        channel.setBoost(simBoost, isUnlimitedBoost);
        channel.setFlipState({
          hasFlip: t < 0.72,
          status: t < 0.15 ? 'grounded' : t < 0.72 ? 'countdown' : 'expired',
          remainingSeconds: t < 0.72 ? Math.max(0, 1.25 * (1 - t / 0.72)) : 0,
        });
        channel.setTelemetrySnapshot({
          fps: 120,
          refreshHz: 120,
          renderScalePct: 100,
          physicsRateHz: 120.0,
          baseLatencyMs: 18 + Math.round(Math.sin(tickCount * 0.05) * 3),
          extraLatencyMs: 0,
        });
        channel.setKickoffFrame({
          episodeTick: tickCount % 240,
        });
      }

      if (steps > 0 && tickCount % 6 === 0) {
        if (liveSpeedReadoutRef.current) {
          liveSpeedReadoutRef.current.textContent = `${Math.round(latestSpeed)} uu/s`;
        }
        if (liveBoostReadoutRef.current) {
          liveBoostReadoutRef.current.textContent = isUnlimitedBoost
            ? '-- (∞)'
            : `${Math.round(latestBoost)}%`;
        }
      }

      if (now - lastWindowMark >= 600) {
        const elapsedSec = (now - lastWindowMark) / 1000;
        const hz = Math.round(ticksThisWindow / elapsedSec);
        const renderDelta = reactRenderCountRef.current - lastRenderSnap;
        const rendersPerSec = Math.round(renderDelta / elapsedSec);

        if (liveHzReadoutRef.current) {
          liveHzReadoutRef.current.textContent = `${hz} Hz`;
        }
        if (liveRenderRateRef.current) {
          liveRenderRateRef.current.textContent = `${rendersPerSec} / sec`;
        }
        ticksThisWindow = 0;
        lastWindowMark = now;
        lastRenderSnap = reactRenderCountRef.current;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScrollCapture, { capture: true });
    };
  }, [is120HzLive, isUnlimitedBoost]);

  // Toast / Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null, 'toastMsg');
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  };

  // Quick context-linked presets
  const applyScenarioPreset = (preset: 'kickoff' | 'defense' | 'supersonic-rush' | 'empty-clutch') => {
    setIs120HzLive(false);
    switch (preset) {
      case 'kickoff':
        setBallCamActive(true);
        setSpeed(1410);
        setBoostAmount(33);
        showToast('preset loaded: Kickoff sprint (Kickoff Rush · manual mode)');
        break;
      case 'defense':
        setBallCamActive(true);
        setSpeed(750);
        setBoostAmount(12);
        showToast('preset loaded: Goal-line defense (Goal Line Defense · manual mode)');
        break;
      case 'supersonic-rush':
        setBallCamActive(true);
        setSpeed(2280);
        setBoostAmount(99);
        showToast('preset loaded: Supersonic dash (Supersonic Surge · manual mode)');
        break;
      case 'empty-clutch':
        setBallCamActive(false);
        setSpeed(2300);
        setBoostAmount(0);
        showToast('preset loaded: Zero-G speed (Empty Boost Max Speed · manual mode)');
        break;
    }
  };

  const subscribeSpeedFn = is120HzLive ? transientChannelRef.current.subscribeSpeed : undefined;
  const subscribeBoostFn = is120HzLive ? transientChannelRef.current.subscribeBoost : undefined;
  const subscribeBallCamFn = is120HzLive ? transientChannelRef.current.subscribeBallCam : undefined;
  const handleToggleBallCam = () => {
    if (is120HzLive) {
      transientChannelRef.current.toggleBallCam();
    } else {
      setBallCamActive((prev) => !prev);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-6xl w-full">
      {/* Top Jump Directory */}
      <PageJumpDirectory layerTag="Layer 5A · High-Frequency Match HUD Elements" title="HUD Elements Independent gauge and spatial layout directory"
        subtitle="all 5A Components uniformly integrated hudTransientChannel 120Hz Transient Channel (0 React Re-render) And Full Support Light/Dark Mode Switch. "
        items={HUD_5A_DIRECTORY_ITEMS} isLight={isLight} />

      {/* Top Title Area */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Crosshair className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">HUD Elements Independent Gauge Component</h1>
          <Badge variant="primary" size="sm" isLight={isLight}>
            Standalone · Zero Position Coupling
          </Badge>
          <Badge variant="amber" size="sm" isLight={isLight}>
            120Hz Transient Ref + Low-Freq Memo
          </Badge>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Each component is 100% Layout-agnostic presentation block (Internal never hardcoded <code className="font-mono">position: absolute</code>) . Low-frequency discrete component (<code className="font-mono text-red-500">BallCameraIndicator</code>) Adopt <code className="font-mono">React.memo</code> Isolation; High-frequency Continuous Component (<code className="font-mono text-emerald-500">VelocityProgressBar</code> and <code className="font-mono text-sky-500">CircularBoostGauge</code>) Support via <code className="font-mono">subscribeSpeed / subscribeBoost</code> or <code className="font-mono">ref</code> Transient Channel Direct Drive DOM/SVG, in <strong>0 React Re-renders at 120Hz</strong>. 
        </p>

        {/* Top 120Hz Transient Engine Toggle + Contextual linkage test bar */}
        <div className={`mt-2 p-3.5 rounded-2xl border flex flex-col gap-3 ${ isLight
          ? 'bg-neutral-50/90 border-neutral-200/90 text-neutral-800'
          : 'bg-neutral-900/70 border-neutral-800 text-neutral-200' }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIs120HzLive((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                  is120HzLive
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-xs'
                    : isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
              >
                {is120HzLive ? (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>[Boost] 120Hz Transient physics stream running (Click to switch back to manual slider)</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start 120Hz Zero-redraw transient physics stream (Start 120Hz Stream)</span>
                  </>
                )}
              </button>

              {is120HzLive && (
                <div className={`flex items-center gap-3 px-3 py-1 rounded-xl border font-mono text-[11px] ${
                  isLight ? 'bg-white border-neutral-200 text-neutral-700'
                  : 'bg-neutral-950/80 border-neutral-800 text-neutral-300' }`}>
                  <span>
                    Stream: <strong ref={liveHzReadoutRef} className="text-sky-500">120 Hz</strong>
                  </span>
                  <span className="opacity-30">|</span>
                  <span>
                    React Re-renders:{' '}
                    <strong ref={liveRenderRateRef} className="text-emerald-500">0 / sec</strong>
                  </span>
                  <span className="opacity-30">|</span>
                  <span>
                    Speed: <strong ref={liveSpeedReadoutRef} className="text-amber-500">1410 uu/s</strong>
                  </span>
                  <span className="opacity-30">|</span>
                  <span>
                    Boost: <strong ref={liveBoostReadoutRef} className="text-sky-500">85%</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1 mr-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Static Preset:</span>
              </span>
              <button
                type="button"
                onClick={() => applyScenarioPreset('kickoff')}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                Kickoff sprint (Kickoff)
              </button>
              <button
                type="button"
                onClick={() => applyScenarioPreset('defense')}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                Goal-line defense (Defense)
              </button>
              <button
                type="button"
                onClick={() => applyScenarioPreset('supersonic-rush')}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                  isLight
                    ? 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-900'
                    : 'bg-sky-950/40 hover:bg-sky-900/50 border-sky-700/60 text-sky-300'
                }`}
              >
                Supersonic dash (Supersonic)
              </button>
              <button
                type="button"
                onClick={() => applyScenarioPreset('empty-clutch')}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium border cursor-pointer transition-all ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
                }`}
              >
                Zero-G speed (Empty Boost)
              </button>
            </div>
          </div>
        </div>

        {/* Toast Tooltip Bar */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 text-white font-mono text-xs shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5A.S: HUD v2 FULL-VIEWPORT SPATIAL LAYOUT & CHOREOGRAPHY SANDBOX */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div id="hud-5a-sandbox" className="scroll-mt-24">
        <SectionErrorBoundary title="5A.S HudSpatialChoreographySandbox" scopePrefix="hud-spatial-sandbox"
          isLight={isLight}>
          <HudSpatialChoreographySandbox isLight={isLight} />
        </SectionErrorBoundary>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5A.1 & 5A.2: STEPPER SCOREBOARD HUD & EDGE PLAYER HUD STRIP */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionErrorBoundary title="5A.1 StepperScoreboardHUD" isLight={isLight}>
          <section id="hud-5a-1-scoreboard" className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${
            isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="amber" size="sm" isLight={isLight}>
                  5A.1
                </Badge>
                <h2 className="text-sm font-bold font-mono">StepperScoreboardHUD (`top-0` Snap to Top · Top square bottom round)</h2>
              </div>
              <Badge variant="primary" size="sm" isLight={isLight}>
                Double Chin `-mt-[6px] pt-[9px]` Anti-glitch
              </Badge>
            </div>
            <p className="text-xs opacity-75">
              Main scoreboard and score blocks are pinned to the top edge (<code className="font-mono">rounded-t-none border-t-0</code>), Bottom Rounded Corner (<code className="font-mono">rounded-b-[6px]</code>); Single Chin (<code className="font-mono">z-20</code>) and OVERTIME Double Chin (<code className="font-mono">z-10</code>) Reserve extra hidden space at the top to fit the top rounded corners, Eliminate rounded corner seam artifacts. 
            </p>
            <div
              className={`relative h-[156px] rounded-2xl border overflow-hidden flex flex-col items-center justify-start ${
              isLight ? 'bg-slate-200/80 border-neutral-300' : 'bg-neutral-950 border-neutral-800' }`}>
              <StepperScoreboardHUD
                isLight={isLight}
                leftScore={2}
                rightScore={2}
                seconds={0}
                isOvertime={true}
                overtimeChinOpen={true}
                bestOf={5}
                leftSeriesWins={2}
                rightSeriesWins={1}
              />
            </div>
          </section>
        </SectionErrorBoundary>

        <SectionErrorBoundary title="5A.2 EdgePlayerHudStrip" isLight={isLight}>
          <section id="hud-5a-2-edge-strip" className={`p-5 rounded-3xl border flex flex-col gap-4 scroll-mt-24 ${
            isLight ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-lg' }`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="amber" size="sm" isLight={isLight}>
                  5A.2
                </Badge>
                <h2 className="text-sm font-bold font-mono">EdgePlayerHudStrip (Symmetric single-side rounded bar)</h2>
              </div>
              <Badge variant="primary" size="sm" isLight={isLight}>
                subscribeRoster · 120Hz Ref
              </Badge>
            </div>
            <p className="text-xs opacity-75">
              Left-pinned right-rounded corner (<code className="font-mono">rounded-r-[9px]</code>), Right-aligned left-rounded corner (<code className="font-mono">rounded-l-[9px]</code>), with under-card tucked Skip Replay drawer (slides out from beneath player card · see <a href="#hud-5a-2-skip-inspector" className="text-emerald-500 underline">5A.2++ Workbench</a> below).
            </p>
            <div className="flex flex-col gap-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-emerald-500">Skip Replay / Ready (Under-Card Push Drawer):</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {([1, 2, 3, 4, 5, 6] as const).map((k) => (
                    <label key={k} className="inline-flex items-center gap-1 cursor-pointer select-none px-1.5 py-0.5 rounded border border-neutral-400/30">
                      <input type="checkbox" checked={Boolean(edgeSkipReady[k])} onChange={() => toggleEdgeSkipReady(k)} className="accent-emerald-500 cursor-pointer" />
                      <span>#{k}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
                <label className="flex items-center gap-1">
                  <span className="opacity-75">size:</span>
                  <input type="range" min={10} max={32} step={1} value={edgeSkipConfig.sizePx}
                    onChange={(e) => setEdgeSkipConfig((p) => ({ ...resolveSkipIndicatorConfig(p), sizePx: Number(e.target.value) }))}
                    className="w-11 accent-emerald-500 cursor-pointer" />
                  <span className="tabular-nums font-bold">{edgeSkipConfig.sizePx}px</span>
                </label>
                <label className="flex items-center gap-1">
                  <span className="opacity-75">weight:</span>
                  <input type="range" min={1.0} max={3.8} step={0.1} value={edgeSkipConfig.strokeWidth}
                    onChange={(e) => setEdgeSkipConfig((p) => ({ ...resolveSkipIndicatorConfig(p), strokeWidth: Number(e.target.value) }))}
                    className="w-11 accent-emerald-500 cursor-pointer" />
                  <span className="tabular-nums font-bold">{edgeSkipConfig.strokeWidth.toFixed(1)}</span>
                </label>
                <label className="flex items-center gap-1">
                  <span className="opacity-75">Glow:</span>
                  <input type="range" min={0} max={16} step={1} value={edgeSkipConfig.glowBlurPx}
                    onChange={(e) => setEdgeSkipConfig((p) => ({ ...resolveSkipIndicatorConfig(p), glowBlurPx: Number(e.target.value) }))}
                    className="w-10 accent-emerald-500 cursor-pointer" />
                  <span className="tabular-nums font-bold">{edgeSkipConfig.glowBlurPx}px</span>
                </label>
                <label className="flex items-center gap-1" title="Protrude length past player card">
                  <span className="opacity-75">ext:</span>
                  <input type="range" min={24} max={64} step={1} value={edgeSkipConfig.protrudeWidthPx}
                    onChange={(e) => setEdgeSkipConfig((p) => ({ ...resolveSkipIndicatorConfig(p), protrudeWidthPx: Number(e.target.value) }))}
                    className="w-10 accent-emerald-500 cursor-pointer" />
                  <span className="tabular-nums font-bold">{edgeSkipConfig.protrudeWidthPx}px</span>
                </label>
                <div className="flex items-center gap-1">
                  {(['#22C55E', '#10B981', '#84CC16', '#38BDF8', '#FFFFFF'] as const).map((hex, i) => (
                    <button key={hex} type="button" onClick={() => setEdgeSkipConfig((p) => ({ ...resolveSkipIndicatorConfig(p), color: hex, glowColor: hex }))}
                      title={`#${i + 1} Color: ${hex}`}
                      className={`w-3.5 h-3.5 rounded-full cursor-pointer border transition-transform ${
                        edgeSkipConfig.color.toUpperCase() === hex ? 'scale-125 border-white ring-1 ring-emerald-500' : 'border-black/30 opacity-80 hover:opacity-100'
                      }`} style={{ backgroundColor: hex }} />
                  ))}
                </div>
              </div>
            </div>
            <div
              className={`relative h-[156px] rounded-2xl border overflow-hidden flex items-center justify-between ${
              isLight ? 'bg-slate-200/80 border-neutral-300' : 'bg-neutral-950 border-neutral-800' }`}>
              <EdgePlayerHudStrip side="left" teamColor="#2563EB" barColor="#3B82F6" isLight={isLight}
                viewMode="spectator" skipIndicatorConfig={edgeSkipConfig} onSelectSlot={toggleEdgeSkipReady}
                players={transientChannelRef.current.getRoster().leftPlayers}
                subscribeRoster={transientChannelRef.current.subscribeRoster} />
              <EdgePlayerHudStrip side="right" teamColor="#EA580C" barColor="#F97316" isLight={isLight}
                viewMode="spectator" skipIndicatorConfig={edgeSkipConfig} onSelectSlot={toggleEdgeSkipReady}
                players={transientChannelRef.current.getRoster().rightPlayers}
                subscribeRoster={transientChannelRef.current.subscribeRoster} />
            </div>
          </section>
        </SectionErrorBoundary>
      </div>

      {/* 5A.2+: Dedicated Persistent Demolished Slot & Bomb SVG Size/Style Inspector */}
      <SectionErrorBoundary title="5A.2+ EdgeDemoInspectorSection" scopePrefix="hud-5a-2-demo-inspector" isLight={isLight}>
        <EdgeDemoInspectorSection isLight={isLight} />
      </SectionErrorBoundary>

      {/* 5A.2++: Dedicated Skip Replay & Slot Extension Card Workbench */}
      <SectionErrorBoundary title="5A.2++ EdgeSkipReplayInspectorSection" scopePrefix="hud-5a-2-skip-inspector" isLight={isLight}>
        <EdgeSkipReplayInspectorSection isLight={isLight} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="5A.3 ~ 5A.5 HudCoreTriadInspectorSection" scopePrefix="hud-5a-5-boost-config" isLight={isLight}>
        <HudCoreTriadInspectorSection isLight={isLight} is120HzLive={is120HzLive} setIs120HzLive={setIs120HzLive}
          ballCamActive={ballCamActive} setBallCamActive={setBallCamActive} ballCamShortcut={ballCamShortcut}
          setBallCamShortcut={setBallCamShortcut} ballCamLabel={ballCamLabel} setBallCamLabel={setBallCamLabel}
          handleToggleBallCam={handleToggleBallCam} subscribeBallCamFn={subscribeBallCamFn}
          speed={speed} setSpeed={setSpeed} barWidth={barWidth} setBarWidth={setBarWidth}
          barHeight={barHeight} setBarHeight={setBarHeight} subscribeSpeedFn={subscribeSpeedFn}
          boostAmount={boostAmount} setBoostAmount={setBoostAmount} isUnlimitedBoost={isUnlimitedBoost}
          setIsUnlimitedBoost={setIsUnlimitedBoost} gaugeSize={gaugeSize} setGaugeSize={setGaugeSize}
          subscribeBoostFn={subscribeBoostFn} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="5A.6 ~ 5A.9 HudStageAndFollowupSection" isLight={isLight}>
        <HudStageAndFollowupSection isLight={isLight} is120HzLive={is120HzLive} slotPreset={slotPreset}
          setSlotPreset={setSlotPreset} ballCamActive={ballCamActive} subscribeBallCamFn={subscribeBallCamFn}
          ballCamShortcut={ballCamShortcut} ballCamLabel={ballCamLabel} handleToggleBallCam={handleToggleBallCam}
          speed={speed} subscribeSpeedFn={subscribeSpeedFn} boostAmount={boostAmount}
          isUnlimitedBoost={isUnlimitedBoost} subscribeBoostFn={subscribeBoostFn}
          transientChannel={transientChannelRef.current} />
      </SectionErrorBoundary>
    </div>
  );
};
