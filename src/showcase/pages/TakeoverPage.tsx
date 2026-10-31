import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  Timer,
  Repeat,
  Radio,
  Users,
} from 'lucide-react';
import {
  CenterUpperTypographyConfig,
  CenterUpperTimingConfig,
} from '../../ui-core/hud/CenterUpperInfoHUD';
import {
  TakeoverHudPayload,
  TakeoverVignetteConfig,
  TakeoverGlowConfig,
  TakeoverSignal,
  DEFAULT_TAKEOVER_GLOW,
  DEFAULT_TAKEOVER_TYPOGRAPHY,
  DEFAULT_TAKEOVER_TIMING,
  DEFAULT_TAKEOVER_VIGNETTE,
  DEFAULT_TAKEOVER_LAYOUT,
} from '../../ui-core/hud/TakeoverCountdownHUD';
import { ArenaLightingPreset } from '../ArenaBackdrop';
import { Badge } from '../../ui-core/primitives/Badge';
import { SegmentedSwitch } from '../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../ui-core/primitives/ToggleSwitch';
import { PageJumpDirectory } from '../PageJumpDirectory';
import { useSyncedState, crossClientSync } from '../stores/crossClientSync';
import {
  createHudTransientChannel,
  DEFAULT_INITIAL_ROSTER,
} from '../../ui-core/stores/hudTransientChannel';
import { FLIP_WINDOW_SECONDS } from '../../ui-core/hud/FlipIndicatorPillHUD';
import {
  TAKEOVER_DIRECTORY_ITEMS,
  TakeoverStageCanvas,
  TakeoverStageBackdropBar,
  TakeoverArchetypesSection,
  type TakeoverScenarioPreset,
} from './takeover/TakeoverStageAndBackdrop';
import { TakeoverTunerSection } from './takeover/TakeoverTunerSection';
import type { StageBgMode } from './center-upper-info/CenterUpperArchetypesAndBackdrop';

export const TakeoverPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [stageBgMode, setStageBgMode] = useSyncedState<StageBgMode>('5g:stageBgMode', 'arena');
  const [stageBgColor, setStageBgColor] = useSyncedState<string>('5g:stageBgColor', '#090D16');
  const [stageBgSecondaryColor, setStageBgSecondaryColor] = useSyncedState<string>(
    '5g:stageBgSecondaryColor',
    '#1E293B'
  );
  const [arenaPreset, setArenaPreset] = useSyncedState<ArenaLightingPreset>(
    '5g:arenaPreset',
    'daylight'
  );
  const [stageBrightness, setStageBrightness] = useSyncedState<number>('5g:stageBrightness', 100);
  const [showPitchLines, setShowPitchLines] = useSyncedState<boolean>('5g:showPitchLines', true);
  const [showAnchorGuides, setShowAnchorGuides] = useSyncedState<boolean>(
    '5g:showAnchorGuides',
    true
  );

  // Upward offset relative to bottom-center (NOT global center)
  const [bottomOffsetPx, setBottomOffsetPx] = useSyncedState<number>(
    '5g:bottomOffsetPx',
    DEFAULT_TAKEOVER_LAYOUT.bottomOffsetPx
  );

  // Team roster & Scoreboard configuration ('blue' vs 'orange' also drives Top Regular team color)
  const [myTeamSide, setMyTeamSide] = useSyncedState<'blue' | 'orange'>('5g:myTeamSide', 'blue');

  // Takeover signal ('replacing-in' retracts BallCam, Speedometer, FlipIndicator, BoostMeter; 'takeover-complete' deploys them)
  const [activeSignal, setActiveSignal] = useSyncedState<TakeoverSignal>(
    '5g:activeSignal',
    'replacing-in'
  );
  const [countdownStep, setCountdownStep] = useSyncedState<'3' | '2' | '1'>(
    '5g:countdownStep',
    '3'
  );
  const [topLabelText, setTopLabelText] = useSyncedState<string>(
    '5g:topLabelText',
    'Takeover in...'
  );
  const [subCaptionText, setSubCaptionText] = useSyncedState<string>('5g:subCaptionText', '');
  const [countdownIntervalMs, setCountdownIntervalMs] = useSyncedState<number>(
    '5g:countdownIntervalMs',
    1000
  );
  const [isSequencePlaying, setIsSequencePlaying] = useSyncedState<boolean>(
    '5g:isSequencePlaying',
    false
  );
  const [loopSequence, setLoopSequence] = useSyncedState<boolean>('5g:loopSequence', false);
  const sequenceTimerRef = useRef<number | null>(null);

  // Glow, Typography (`uppercase: false` by default), Timing, and Rounded-Rect 4-Edge Vignette
  const [glowConfig, setGlowConfig] = useSyncedState<TakeoverGlowConfig>('5g:glowConfig', {
    ...DEFAULT_TAKEOVER_GLOW,
  });
  const [syncGlowWithText, setSyncGlowWithText] = useSyncedState<boolean>(
    '5g:syncGlowWithText',
    false
  );
  const [typoConfig, setTypoConfig] = useSyncedState<CenterUpperTypographyConfig>(
    '5g:typoConfig',
    {
      ...DEFAULT_TAKEOVER_TYPOGRAPHY,
    }
  );
  const [timingConfig, setTimingConfig] = useSyncedState<CenterUpperTimingConfig>(
    '5g:timingConfig',
    {
      ...DEFAULT_TAKEOVER_TIMING,
    }
  );
  const [vignetteConfig, setVignetteConfig] = useSyncedState<TakeoverVignetteConfig>(
    '5g:vignetteConfig',
    {
      ...DEFAULT_TAKEOVER_VIGNETTE,
    }
  );
  const [alwaysPreviewVignette, setAlwaysPreviewVignette] = useSyncedState<boolean>(
    '5g:alwaysPreviewVignette',
    false
  );

  const [triggerNonce, setTriggerNonce] = useSyncedState<number>('5g:triggerNonce', 1);
  const [isVisibleOnStage, setIsVisibleOnStage] = useSyncedState<boolean>(
    '5g:isVisibleOnStage',
    true
  );

  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [showExportedCode, setShowExportedCode] = useState<boolean>(false);

  // Live 120Hz Transient Channel driving Scoreboard, Team Roster, Speed, Flip, and Boost
  const channelRef = useRef(
    createHudTransientChannel({
      speed: 1580,
      boostAmount: 85,
      ballCamActive: true,
      scoreboard: {
        leftScore: 2,
        rightScore: 1,
        scoreDigits: 2,
        seconds: 134,
        isOvertime: false,
        overtimeChinOpen: false,
        bestOf: 5,
        leftSeriesWins: 2,
        rightSeriesWins: 1,
        seriesResults: ['left', 'right', 'left', 'none', 'none'],
      },
      roster: DEFAULT_INITIAL_ROSTER,
    })
  );

  useEffect(() => {
    const ch = channelRef.current;
    let rafId = 0;
    let lastSecTick = performance.now();

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (document.hidden) return;

      const phase = now * 0.0014;
      const simSpeed = 1420 + Math.sin(phase) * 680;
      const simBoost = Math.round(58 + Math.sin(phase * 0.85) * 38);
      ch.setSpeed(Math.max(240, Math.min(2300, simSpeed)));
      ch.setBoost(simBoost, false);
      ch.updatePlayerSlot(1, { boostAmount: simBoost });

      const cycleSec = (now / 1000) % 2.4;
      if (cycleSec < 0.5) {
        ch.setFlip({
          hasFlip: true,
          status: 'grounded',
          remainingSeconds: FLIP_WINDOW_SECONDS,
          maxSeconds: FLIP_WINDOW_SECONDS,
        });
      } else if (cycleSec < 0.5 + FLIP_WINDOW_SECONDS) {
        const rem = Math.max(0, FLIP_WINDOW_SECONDS - (cycleSec - 0.5));
        ch.setFlip({
          hasFlip: true,
          status: 'countdown',
          remainingSeconds: rem,
          maxSeconds: FLIP_WINDOW_SECONDS,
        });
      } else {
        ch.setFlip({
          hasFlip: false,
          status: 'expired',
          remainingSeconds: 0,
          maxSeconds: FLIP_WINDOW_SECONDS,
        });
      }

      if (now - lastSecTick >= 1000) {
        lastSecTick = now;
        const sb = ch.getScoreboard();
        ch.setScoreboard({ seconds: Math.max(0, sb.seconds - 1) });
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const buildExportCode = useCallback(() => {
    const snapshot = {
      bottomOffsetPx,
      topLabelText,
      subCaptionText,
      countdownIntervalMs,
      vignetteConfig,
      glowConfig,
      timingConfig,
      typoConfig,
      stageBackdrop: {
        stageBgMode,
        stageBgColor,
        stageBgSecondaryColor,
        arenaPreset,
        stageBrightness,
      },
    };
    return `// 5G Takeover Default Parameters Snapshot
export const DEFAULT_5G_TAKEOVER_CONFIG = ${JSON.stringify(snapshot, null, 2)};`;
  }, [
    bottomOffsetPx,
    topLabelText,
    subCaptionText,
    countdownIntervalMs,
    vignetteConfig,
    glowConfig,
    timingConfig,
    typoConfig,
    stageBgMode,
    stageBgColor,
    stageBgSecondaryColor,
    arenaPreset,
    stageBrightness,
  ]);

  const handleCopyConfig = useCallback(() => {
    const code = buildExportCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedConfig(true);
    window.setTimeout(() => setCopiedConfig(false), 1800);
  }, [buildExportCode]);

  const handleResetDefaults = useCallback(() => {
    crossClientSync.resetAll({ scopePrefix: '5g:' });
  }, []);

  const stopTakeoverSequence = useCallback(() => {
    if (sequenceTimerRef.current !== null) {
      window.clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
    setIsSequencePlaying(false);
  }, [setIsSequencePlaying]);

  useEffect(() => {
    if (!isSequencePlaying && sequenceTimerRef.current !== null) {
      window.clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  }, [isSequencePlaying]);

  useEffect(() => {
    return () => {
      if (sequenceTimerRef.current !== null) {
        window.clearTimeout(sequenceTimerRef.current);
        sequenceTimerRef.current = null;
      }
    };
  }, []);

  const startTakeoverSequence = useCallback(
    (stepIntervalOverride?: number) => {
      stopTakeoverSequence();
      const stepMs = Math.max(250, stepIntervalOverride ?? countdownIntervalMs);
      const steps: ('3' | '2' | '1')[] = ['3', '2', '1'];

      // Phase 1: Dispatch 'replacing-in' signal -> retract BallCam, Speedometer, Flip, Boost + fade in rounded-rect vignette
      setActiveSignal('replacing-in');
      setIsSequencePlaying(true);
      setIsVisibleOnStage(true);

      let idx = 0;
      const runStep = () => {
        const current = steps[idx];
        setCountdownStep(current);
        setActiveSignal('replacing-in');
        setIsVisibleOnStage(true);
        setTriggerNonce((n) => n + 1);
        idx += 1;

        if (idx < steps.length) {
          sequenceTimerRef.current = window.setTimeout(runStep, stepMs);
        } else {
          // Wait for the '1' step to finish, then transition to 'takeover-complete' so Cockpit HUD slides in
          sequenceTimerRef.current = window.setTimeout(() => {
            setActiveSignal('takeover-complete');
            if (!timingConfig.persistentInspect) {
              setIsVisibleOnStage(false);
            }

            if (loopSequence) {
              // Hold the deployed Cockpit HUD for 1.8s so the user can observe the slide-in return before looping
              sequenceTimerRef.current = window.setTimeout(() => {
                idx = 0;
                runStep();
              }, 1800);
            } else {
              setIsSequencePlaying(false);
            }
          }, stepMs);
        }
      };

      runStep();
    },
    [
      stopTakeoverSequence,
      countdownIntervalMs,
      timingConfig.persistentInspect,
      loopSequence,
      setActiveSignal,
      setIsSequencePlaying,
      setIsVisibleOnStage,
      setCountdownStep,
      setTriggerNonce,
    ]
  );

  const handleDispatchSignal = (signal: TakeoverSignal) => {
    stopTakeoverSequence();
    setActiveSignal(signal);
    if (signal === 'replacing-in') {
      setIsVisibleOnStage(true);
      setTriggerNonce((n) => n + 1);
    } else {
      if (!timingConfig.persistentInspect) {
        setIsVisibleOnStage(false);
      }
    }
  };

  const handleSelectScenario = (preset: TakeoverScenarioPreset) => {
    setTopLabelText(preset.topText);
    setSubCaptionText(preset.subText);
    setMyTeamSide(preset.teamSide);
    startTakeoverSequence();
  };

  // Cockpit HUD (BallCam, Speedometer, Flip Indicator, Boost Gauge) is hidden during 'replacing-in' and slides in on 'takeover-complete'
  const isCockpitVisible = activeSignal === 'takeover-complete';
  const vignettePreviewActive =
    activeSignal === 'replacing-in' || alwaysPreviewVignette || Boolean(timingConfig.persistentInspect);

  const shouldRenderTakeoverBanner =
    isVisibleOnStage && (activeSignal === 'replacing-in' || Boolean(timingConfig.persistentInspect));

  const activePayload: TakeoverHudPayload | null = shouldRenderTakeoverBanner
    ? {
        topText: topLabelText,
        mainText: countdownStep,
        subText: subCaptionText,
        teamSide: myTeamSide,
        glow: glowConfig,
        typography: typoConfig,
        timing: {
          ...timingConfig,
          durationMs: isSequencePlaying ? countdownIntervalMs : timingConfig.durationMs,
          persistentInspect: isSequencePlaying ? false : timingConfig.persistentInspect,
        },
        triggerKey: triggerNonce,
      }
    : null;

  const getStageBackgroundStyle = (): React.CSSProperties => {
    const brightFactor = stageBrightness / 100;
    if (stageBgMode === 'solid') {
      return {
        backgroundColor: stageBgColor,
        backgroundImage: `radial-gradient(circle at 50% 55%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,${(
          1 -
          brightFactor * 0.85
        ).toFixed(2)}) 85%)`,
      };
    }
    if (stageBgMode === 'gradient') {
      return {
        backgroundColor: stageBgColor,
        backgroundImage: `radial-gradient(ellipse at 50% 55%, ${stageBgSecondaryColor} 0%, ${stageBgColor} 78%)`,
        filter: `brightness(${(0.45 + brightFactor * 0.7).toFixed(2)})`,
      };
    }
    return {
      backgroundColor: stageBgColor,
    };
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      <PageJumpDirectory
        layerTag="Layer 5G · HUD Bottom-Center Upward Takeover & Rounded-Rect Vignette"
        title="Takeover · Player Handoff & Reconnect Countdown System"
        subtitle="Cloned and evolved from 5E (Five Echo) for bot takeover and disconnect-reconnect handoffs: keeps Scoreboard and Team Roster visible, hides Cockpit HUD (BallCam, Speedometer, Flip Indicator, Boost Gauge) on `replacing-in` signal with a rounded-rectangle 4-edge vignette mask underneath the UI layer, anchors relative to `bottom-center` with upward offset, renders Top Regular (`Takeover in...`) in Team Color (Blue vs Orange) + White Glowing Stroke while Bottom Thin (`3 -> 2 -> 1`) pops, and slides all Cockpit HUD gauges back in upon completion."
        items={TAKEOVER_DIRECTORY_ITEMS}
        isLight={isLight}
      />

      {/* SECTION 1: LIVE TAKEOVER STAGE & SIGNAL CHOREOGRAPHY */}
      <section
        id="takeover-stage"
        className={`p-5 rounded-3xl border flex flex-col gap-5 scroll-mt-24 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-xl'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="amber" size="sm" isLight={isLight}>
              5G-1
            </Badge>
            <h2 className="text-base font-bold tracking-tight">
              Takeover Stage (`anchor=&quot;bottom-center&quot;` + Upward Offset) · `replacing-in` Signal &amp; Rounded-Rect Vignette
            </h2>
            <Badge variant="primary" size="sm" isLight={isLight}>
              Top Regular: Team Color + White Glowing Stroke
            </Badge>
            <Badge variant="success" size="sm" isLight={isLight}>
              No Force Uppercase (`Takeover in...`)
            </Badge>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setMyTeamSide((prev) => (prev === 'blue' ? 'orange' : 'blue'))}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                myTeamSide === 'blue'
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-orange-600 text-white border-orange-500'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Team Side: {myTeamSide === 'blue' ? 'Blue Team [1-3]' : 'Orange Team [1-3]'}</span>
            </button>
            <ToggleSwitch
              label="Anchor Guide Crosshair"
              checked={showAnchorGuides}
              onCheckedChange={setShowAnchorGuides}
              isLight={isLight}
            />
            <ToggleSwitch
              label="Persistent Tuning (Do Not Auto-Dismiss)"
              checked={timingConfig.persistentInspect ?? false}
              onCheckedChange={(v) => {
                setTimingConfig((prev) => ({ ...prev, persistentInspect: v }));
                setIsVisibleOnStage(true);
                setTriggerNonce((n) => n + 1);
              }}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Signal Bus & Sequence Control Deck */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col gap-3.5 ${
            isLight
              ? 'bg-neutral-50/90 border-neutral-200/90'
              : 'bg-neutral-950/70 border-neutral-800'
          }`}
        >
          {/* Row 1: Signal Bus Switcher & Sequence Play Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-rose-500 flex items-center gap-1">
                <Radio className="h-3.5 w-3.5" />
                <span>Takeover Signal Bus:</span>
              </span>
              <SegmentedSwitch
                size="sm"
                isLight={isLight}
                value={activeSignal}
                onValueChange={(v) => handleDispatchSignal(v as TakeoverSignal)}
                options={[
                  {
                    value: 'replacing-in',
                    label: '① Signal: replacing-in (Hide Cockpit HUD + Vignette + 3-2-1)',
                  },
                  {
                    value: 'takeover-complete',
                    label: '② Signal: takeover-complete (Slide In BallCam / Speed / Flip / Boost)',
                  },
                ]}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  isSequencePlaying ? stopTakeoverSequence() : startTakeoverSequence()
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                  isSequencePlaying
                    ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                    : 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-sm hover:bg-emerald-400'
                }`}
              >
                {isSequencePlaying ? (
                  <>
                    <Square className="h-3.5 w-3.5 fill-current" />
                    <span>Stop Takeover Sequence</span>
                  </>
                ) : (
                  <>
                    <Timer className="h-3.5 w-3.5" />
                    <span>
                      Play Full Takeover: replacing-in (3 -&gt; 2 -&gt; 1) -&gt; Deploy Cockpit HUD
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLoopSequence((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                  loopSequence
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-500 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-300 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400'
                }`}
              >
                <Repeat className="h-3.5 w-3.5" />
                <span>Loop: {loopSequence ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Single-step digit inspection & Top Regular text input */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono opacity-75">
                Single-step bottom digit trigger (Top Regular stays motionless):
              </span>
              {(['3', '2', '1'] as const).map((step) => {
                const active = countdownStep === step && activeSignal === 'replacing-in';
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      stopTakeoverSequence();
                      setActiveSignal('replacing-in');
                      setCountdownStep(step);
                      setIsVisibleOnStage(true);
                      setTriggerNonce((n) => n + 1);
                    }}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-xs'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                    }`}
                  >
                    Step {step}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setActiveSignal('replacing-in');
                  setIsVisibleOnStage(true);
                  setTriggerNonce((n) => n + 1);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/40 cursor-pointer transition-all"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Re-Trigger Bottom Scale ({timingConfig.entryScale.toFixed(2)}x)</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <label className="flex items-center gap-1.5 text-xs font-mono">
                <span className="opacity-70">Top Regular (400, Stationary):</span>
                <input
                  type="text"
                  value={topLabelText}
                  onChange={(e) => {
                    setTopLabelText(e.target.value);
                    setIsVisibleOnStage(true);
                  }}
                  className={`w-36 px-2 py-1 rounded-lg border font-mono text-xs ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-900'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                  }`}
                />
              </label>

              <label className="flex items-center gap-1.5 text-xs font-mono">
                <span className="opacity-70">Sub-caption (Optional):</span>
                <input
                  type="text"
                  value={subCaptionText}
                  placeholder="Optional pill"
                  onChange={(e) => {
                    setSubCaptionText(e.target.value);
                    setIsVisibleOnStage(true);
                  }}
                  className={`w-36 px-2 py-1 rounded-lg border font-mono text-xs ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-900'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-100'
                  }`}
                />
              </label>
            </div>
          </div>
        </div>

        {/* 16:9 HUD ANCHOR STAGE PREVIEW CANVAS */}
        <TakeoverStageCanvas
          stageBgMode={stageBgMode}
          arenaPreset={arenaPreset}
          stageBrightness={stageBrightness}
          showPitchLines={showPitchLines}
          showAnchorGuides={showAnchorGuides}
          bottomOffsetPx={bottomOffsetPx}
          activeSignal={activeSignal}
          isCockpitVisible={isCockpitVisible}
          myTeamSide={myTeamSide}
          activePayload={activePayload}
          glowConfig={glowConfig}
          typoConfig={typoConfig}
          timingConfig={timingConfig}
          vignetteConfig={vignetteConfig}
          vignettePreviewActive={vignettePreviewActive}
          isSequencePlaying={isSequencePlaying}
          setIsVisibleOnStage={setIsVisibleOnStage}
          getStageBackgroundStyle={getStageBackgroundStyle}
          channel={channelRef.current}
        />

        <TakeoverStageBackdropBar
          isLight={isLight}
          stageBgMode={stageBgMode}
          setStageBgMode={setStageBgMode}
          arenaPreset={arenaPreset}
          setArenaPreset={setArenaPreset}
          stageBgColor={stageBgColor}
          setStageBgColor={setStageBgColor}
          stageBgSecondaryColor={stageBgSecondaryColor}
          setStageBgSecondaryColor={setStageBgSecondaryColor}
          stageBrightness={stageBrightness}
          setStageBrightness={setStageBrightness}
          showPitchLines={showPitchLines}
          setShowPitchLines={setShowPitchLines}
        />
      </section>

      {/* SECTION 2: VIGNETTE, OFFSET, MOTION, GLOW & TYPOGRAPHY TUNER */}
      <TakeoverTunerSection
        isLight={isLight}
        showExportedCode={showExportedCode}
        setShowExportedCode={setShowExportedCode}
        copiedConfig={copiedConfig}
        handleCopyConfig={handleCopyConfig}
        handleResetDefaults={handleResetDefaults}
        buildExportCode={buildExportCode}
        myTeamSide={myTeamSide}
        setMyTeamSide={setMyTeamSide}
        vignetteConfig={vignetteConfig}
        setVignetteConfig={setVignetteConfig}
        alwaysPreviewVignette={alwaysPreviewVignette}
        setAlwaysPreviewVignette={setAlwaysPreviewVignette}
        glowConfig={glowConfig}
        setGlowConfig={setGlowConfig}
        syncGlowWithText={syncGlowWithText}
        setSyncGlowWithText={setSyncGlowWithText}
        timingConfig={timingConfig}
        setTimingConfig={setTimingConfig}
        typoConfig={typoConfig}
        setTypoConfig={setTypoConfig}
        countdownIntervalMs={countdownIntervalMs}
        setCountdownIntervalMs={setCountdownIntervalMs}
        bottomOffsetPx={bottomOffsetPx}
        setBottomOffsetPx={setBottomOffsetPx}
        setIsVisibleOnStage={setIsVisibleOnStage}
        setTriggerNonce={setTriggerNonce}
      />

      {/* SECTION 3: SCENARIO PRESETS & CODE RECIPE */}
      <TakeoverArchetypesSection
        isLight={isLight}
        stageBgColor={stageBgColor}
        bottomOffsetPx={bottomOffsetPx}
        topLabelText={topLabelText}
        myTeamSide={myTeamSide}
        glowConfig={glowConfig}
        typoConfig={typoConfig}
        timingConfig={timingConfig}
        vignetteConfig={vignetteConfig}
        onSelectScenario={handleSelectScenario}
      />
    </div>
  );
};

export default TakeoverPage;

