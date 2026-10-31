import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { TakeoverSignalControlDeck } from './takeover/TakeoverSignalControlDeck';
import { TakeoverTunerSection } from './takeover/TakeoverTunerSection';
import type { StageBgMode } from './center-upper-info/CenterUpperArchetypesAndBackdrop';

export const TakeoverPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [stageBgMode, setStageBgMode] = useSyncedState<StageBgMode>('5g-v2:stageBgMode', 'arena');
  const [stageBgColor, setStageBgColor] = useSyncedState<string>('5g-v2:stageBgColor', '#090D16');
  const [stageBgSecondaryColor, setStageBgSecondaryColor] = useSyncedState<string>(
    '5g-v2:stageBgSecondaryColor',
    '#1E293B'
  );
  const [arenaPreset, setArenaPreset] = useSyncedState<ArenaLightingPreset>(
    '5g-v4:arenaPreset',
    'flow'
  );
  const [stageBrightness, setStageBrightness] = useSyncedState<number>('5g-v2:stageBrightness', 100);
  const [showPitchLines, setShowPitchLines] = useSyncedState<boolean>('5g-v2:showPitchLines', true);
  const [showAnchorGuides, setShowAnchorGuides] = useSyncedState<boolean>(
    '5g-v2:showAnchorGuides',
    true
  );

  // Upward offset relative to bottom-center (NOT global center)
  const [bottomOffsetPx, setBottomOffsetPx] = useSyncedState<number>(
    '5g-v4:bottomOffsetPx',
    DEFAULT_TAKEOVER_LAYOUT.bottomOffsetPx
  );

  // Team roster & Scoreboard configuration ('blue' vs 'orange' also drives Top Regular team color)
  const [myTeamSide, setMyTeamSide] = useSyncedState<'blue' | 'orange'>('5g-v2:myTeamSide', 'blue');

  // Takeover signal ('replacing-in' retracts BallCam, Speedometer, FlipIndicator, BoostMeter; 'takeover-complete' deploys them)
  const [activeSignal, setActiveSignal] = useSyncedState<TakeoverSignal>(
    '5g-v2:activeSignal',
    'replacing-in'
  );
  const [countdownStep, setCountdownStep] = useSyncedState<'3' | '2' | '1'>(
    '5g-v2:countdownStep',
    '3'
  );
  const [topLabelText, setTopLabelText] = useSyncedState<string>(
    '5g-v2:topLabelText',
    'Takeover in...'
  );
  const [subCaptionText, setSubCaptionText] = useSyncedState<string>('5g-v2:subCaptionText', '');
  const [countdownIntervalMs, setCountdownIntervalMs] = useSyncedState<number>(
    '5g-v2:countdownIntervalMs',
    1000
  );
  const [isSequencePlaying, setIsSequencePlaying] = useSyncedState<boolean>(
    '5g-v2:isSequencePlaying',
    false
  );
  const [loopSequence, setLoopSequence] = useSyncedState<boolean>('5g-v2:loopSequence', false);
  const sequenceTimerRef = useRef<number | null>(null);

  // Glow, Typography (uppercase: false by default), Timing, and Seamless Rounded-Rect 4-Edge Vignette
  const [glowConfig, setGlowConfig] = useSyncedState<TakeoverGlowConfig>('5g-v4:glowConfig', {
    ...DEFAULT_TAKEOVER_GLOW,
  });
  const [syncGlowWithText, setSyncGlowWithText] = useSyncedState<boolean>(
    '5g-v2:syncGlowWithText',
    true
  );
  const [typoConfig, setTypoConfig] = useSyncedState<CenterUpperTypographyConfig>(
    '5g-v4:typoConfig',
    {
      ...DEFAULT_TAKEOVER_TYPOGRAPHY,
    }
  );
  const [timingConfig, setTimingConfig] = useSyncedState<CenterUpperTimingConfig>(
    '5g-v4:timingConfig',
    {
      ...DEFAULT_TAKEOVER_TIMING,
      persistentInspect: true,
    }
  );
  const [rawVignetteConfig, setVignetteConfig] = useSyncedState<TakeoverVignetteConfig>(
    '5g-v4:vignetteConfig',
    {
      ...DEFAULT_TAKEOVER_VIGNETTE,
    }
  );
  const vignetteConfig = useMemo<TakeoverVignetteConfig>(
    () => ({
      ...DEFAULT_TAKEOVER_VIGNETTE,
      ...rawVignetteConfig,
      curve: {
        ...DEFAULT_TAKEOVER_VIGNETTE.curve,
        ...(rawVignetteConfig?.curve ?? {}),
      },
    }),
    [rawVignetteConfig]
  );

  const [alwaysPreviewVignette, setAlwaysPreviewVignette] = useSyncedState<boolean>(
    '5g-v2:alwaysPreviewVignette',
    false
  );

  const [triggerNonce, setTriggerNonce] = useSyncedState<number>('5g-v2:triggerNonce', 1);
  const [isVisibleOnStage, setIsVisibleOnStage] = useSyncedState<boolean>(
    '5g-v2:isVisibleOnStage',
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
    crossClientSync.resetAll({ scopePrefix: '5g-v2:' });
    crossClientSync.resetAll({ scopePrefix: '5g-v3:' });
    crossClientSync.resetAll({ scopePrefix: '5g-v4:' });
  }, []);

  const handleSetVisibleOnStage = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) => {
      setIsVisibleOnStage((prev) => {
        const next = typeof val === 'function' ? val(prev) : val;
        if (next) {
          setActiveSignal('replacing-in');
        }
        return next;
      });
    },
    [setIsVisibleOnStage, setActiveSignal]
  );

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
          sequenceTimerRef.current = window.setTimeout(() => {
            setActiveSignal('takeover-complete');
            setIsVisibleOnStage(false);

            if (loopSequence) {
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
      setIsVisibleOnStage(false);
    }
  };

  const handleSelectScenario = (preset: TakeoverScenarioPreset) => {
    setTopLabelText(preset.topText);
    setSubCaptionText(preset.subText);
    setMyTeamSide(preset.teamSide);
    startTakeoverSequence();
  };

  const isCockpitVisible = activeSignal === 'takeover-complete';
  const vignettePreviewActive =
    activeSignal === 'replacing-in' || alwaysPreviewVignette;

  const shouldRenderTakeoverBanner =
    activeSignal === 'replacing-in' &&
    (isVisibleOnStage || Boolean(timingConfig.persistentInspect));

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
        backgroundImage: `radial-gradient(circle at 50% 55%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,${Math.max(
          0,
          1 - brightFactor * 0.85
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
        layerTag="Layer 5G - HUD Bottom-Center Upward Takeover & Seamless Rounded-Rect Vignette"
        title="Takeover - Player Handoff & Reconnect Countdown System"
        subtitle="Cloned and evolved from 5E (Five Echo) for bot takeover and disconnect-reconnect handoffs: keeps Scoreboard and Team Roster visible, hides Cockpit HUD (BallCam, Speedometer, Flip Indicator, Boost Gauge) on replacing-in signal with a seamless rounded-rectangle 4-edge vignette mask underneath the UI layer, anchors relative to bottom-center with upward offset, renders Top Regular (Takeover in...) in Team Color (Blue vs Orange) + Glowing Stroke while Bottom Thin (3 -> 2 -> 1) pops, and slides all Cockpit HUD gauges back in upon completion."
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
        <TakeoverSignalControlDeck
          isLight={isLight}
          myTeamSide={myTeamSide}
          setMyTeamSide={setMyTeamSide}
          showAnchorGuides={showAnchorGuides}
          setShowAnchorGuides={setShowAnchorGuides}
          timingConfig={timingConfig}
          setTimingConfig={setTimingConfig}
          activeSignal={activeSignal}
          handleDispatchSignal={handleDispatchSignal}
          isSequencePlaying={isSequencePlaying}
          stopTakeoverSequence={stopTakeoverSequence}
          startTakeoverSequence={startTakeoverSequence}
          loopSequence={loopSequence}
          setLoopSequence={setLoopSequence}
          countdownStep={countdownStep}
          setCountdownStep={setCountdownStep}
          setActiveSignal={setActiveSignal}
          setIsVisibleOnStage={handleSetVisibleOnStage}
          setTriggerNonce={setTriggerNonce}
          topLabelText={topLabelText}
          setTopLabelText={setTopLabelText}
          subCaptionText={subCaptionText}
          setSubCaptionText={setSubCaptionText}
        />

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
        setIsVisibleOnStage={handleSetVisibleOnStage}
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
