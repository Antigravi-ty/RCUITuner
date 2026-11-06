import React from 'react';
import {
  type EdgeDemoIndicatorConfig,
  type EdgeSkipIndicatorConfig,
  type HudRosterViewMode,
  type MatchHudChoreographySignal,
} from '../../../ui-core/stores/hudTransientTypes';
import { FLIP_WINDOW_SECONDS } from '../../../ui-core/hud/FlipIndicatorPillHUD';
import type { HudSlotMode } from '../../../ui-core/layout/HudAnchorStage';
import { Badge } from '../../../ui-core/primitives/Badge';
import type { FlipSimMode } from './HudChoreographyTopBandColumn';
import { HudChoreographyControlDeck } from './HudChoreographyControlDeck';
import {
  HudChoreographySandboxProvider,
  type ScorePresetKey,
} from './HudChoreographySandboxContext';
import { HudSpatialChoreographyStageCanvas } from './HudSpatialChoreographyStageCanvas';
import { useHudSpatialChoreographySandboxState } from './useHudSpatialChoreographySandboxState';

export type { ScorePresetKey };

export const HudSpatialChoreographySandbox: React.FC<{ isLight?: boolean }> = React.memo(
  ({ isLight = true }) => {
    const {
      channelRef,
      viewMode,
      setViewMode,
      activeSignal,
      setActiveSignal,
      bottomHudRetracted,
      setBottomHudRetracted,
      instantCockpitTransition,
      setInstantCockpitTransition,
      myTeamSide,
      setMyTeamSide,
      slotExists,
      setSlotExists,
      replaySkipReady,
      setReplaySkipReady,
      opponentDemoCompact,
      setOpponentDemoCompact,
      persistentDemo,
      setPersistentDemo,
      persistentDemoRef,
      demoIndicatorConfig,
      setDemoIndicatorConfig,
      skipIndicatorConfig,
      setSkipIndicatorConfig,
      focusedSlot,
      setFocusedSlot,
      scorePreset,
      setScorePreset,
      overtimeChinOpen,
      setOvertimeChinOpen,
      bestOf,
      setBestOf,
      leftWins,
      setLeftWins,
      rightWins,
      setRightWins,
      hudThemeLight,
      setHudThemeLight,
      layoutStrategy,
      setLayoutStrategy,
      jumpPlacement,
      setJumpPlacement,
      flipSimMode,
      setFlipSimMode,
      flipSimModeRef,
      showTelemetryTopLeft,
      setShowTelemetryTopLeft,
      showBallCam,
      setShowBallCam,
      selfDemoActive,
      setSelfDemoActive,
      sandboxSectionRef,
      selfDemoPillTextRef,
      demoEndTimestampsRef,
    } = useHudSpatialChoreographySandboxState(isLight);

    const leftTeamColor = myTeamSide === 'blue' ? '#2563EB' : '#EA580C';
    const leftBarColor = myTeamSide === 'blue' ? '#3B82F6' : '#F97316';
    const rightTeamColor = myTeamSide === 'blue' ? '#EA580C' : '#2563EB';
    const rightBarColor = myTeamSide === 'blue' ? '#F97316' : '#3B82F6';

    const resetAllReplaySkipReady = () => {
      const emptySkip: Record<1 | 2 | 3 | 4 | 5 | 6, boolean> = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
      };
      setReplaySkipReady(emptySkip);
      ([1, 2, 3, 4, 5, 6] as const).forEach((k) => {
        channelRef.current.updatePlayerSlot(k, { replaySkipReady: false });
      });
    };

    const handleDispatchSignal = (signal: MatchHudChoreographySignal) => {
      setActiveSignal(signal);
      setInstantCockpitTransition(false);
      if (signal === 'goal-replay-will-start') {
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({ visible: false });
      } else if (signal === 'goal-replay-started') {
        setBottomHudRetracted(true);
        setViewMode('goal-replay');
        channelRef.current.setRoster({ viewMode: 'goal-replay' });
        channelRef.current.setReplayFooter({
          visible: true,
          teamAccentColor: focusedSlot && focusedSlot >= 4 ? rightBarColor : leftBarColor,
        });
      } else if (signal === 'goal-replay-will-end') {
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({ visible: false });
      } else if (signal === 'kickoff-will-start') {
        setBottomHudRetracted(false);
        setViewMode('player-live');
        if (skipIndicatorConfig.autoResetOnKickoff !== false) {
          resetAllReplaySkipReady();
        }
        if (focusedSlot === null) {
          setFocusedSlot(1);
          channelRef.current.setRoster({ viewMode: 'player-live', focusedSlotKey: 1 });
        } else {
          channelRef.current.setRoster({ viewMode: 'player-live' });
        }
        channelRef.current.setReplayFooter({ visible: false });
      }
    };

    const handleModeChange = (mode: HudRosterViewMode) => {
      setInstantCockpitTransition(false);
      setViewMode(mode);
      channelRef.current.setRoster({ viewMode: mode });
      if (mode === 'goal-replay') {
        setActiveSignal('goal-replay-started');
        setBottomHudRetracted(true);
        channelRef.current.setReplayFooter({
          visible: true,
          teamAccentColor: focusedSlot && focusedSlot >= 4 ? rightBarColor : leftBarColor,
        });
      } else {
        setActiveSignal('kickoff-will-start');
        setBottomHudRetracted(false);
        if (mode === 'player-live' && skipIndicatorConfig.autoResetOnKickoff !== false) {
          resetAllReplaySkipReady();
        }
        channelRef.current.setReplayFooter({ visible: false });
      }
    };

    const handleSelectPov = (slotKey: 1 | 2 | 3 | 4 | 5 | 6 | null) => {
      const isTransitioningNullInSpec =
        viewMode === 'spectator' && (slotKey === null || focusedSlot === null);
      setInstantCockpitTransition(isTransitioningNullInSpec);
      setFocusedSlot(slotKey);
      channelRef.current.setRoster({ focusedSlotKey: slotKey });
      channelRef.current.setReplayFooter({
        teamAccentColor: slotKey && slotKey >= 4 ? rightBarColor : leftBarColor,
      });
    };

    const handleToggleTeamSide = () => {
      setMyTeamSide((prev) => {
        const next = prev === 'blue' ? 'orange' : 'blue';
        const nextLeftBar = next === 'blue' ? '#3B82F6' : '#F97316';
        const nextRightBar = next === 'blue' ? '#F97316' : '#3B82F6';
        channelRef.current.setReplayFooter({
          teamAccentColor: focusedSlot && focusedSlot >= 4 ? nextRightBar : nextLeftBar,
        });
        return next;
      });
    };

    const handleToggleSlotExists = (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => {
      setSlotExists((prev) => {
        const nextVal = !prev[slotKey];
        const nextMap = { ...prev, [slotKey]: nextVal };
        channelRef.current.updatePlayerSlot(slotKey, { exists: nextVal });
        return nextMap;
      });
    };

    const handleToggleReplaySkipReady = (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => {
      setReplaySkipReady((prev) => {
        const nextVal = !prev[slotKey];
        const nextMap = { ...prev, [slotKey]: nextVal };
        channelRef.current.updatePlayerSlot(slotKey, { replaySkipReady: nextVal });
        return nextMap;
      });
    };

    const handleApplyTeamSizePreset = (leftCount: 1 | 2 | 3, rightCount: 1 | 2 | 3) => {
      const nextMap: Record<1 | 2 | 3 | 4 | 5 | 6, boolean> = {
        1: leftCount >= 1,
        2: leftCount >= 2,
        3: leftCount >= 3,
        4: rightCount >= 1,
        5: rightCount >= 2,
        6: rightCount >= 3,
      };
      setSlotExists(nextMap);
      ([1, 2, 3, 4, 5, 6] as const).forEach((k) => {
        channelRef.current.updatePlayerSlot(k, { exists: nextMap[k] });
      });
    };

    const handleToggleOpponentDemoCompact = () => {
      setOpponentDemoCompact((prev) => {
        const next = !prev;
        channelRef.current.setRoster({ opponentDemoCompact: next });
        return next;
      });
    };

    const handleUpdateDemoIndicatorConfig = (patch: Partial<EdgeDemoIndicatorConfig>) => {
      setDemoIndicatorConfig((prev) => {
        const next = { ...prev, ...patch };
        channelRef.current.setRoster({ demoIndicatorConfig: next });
        return next;
      });
    };

    const handleUpdateSkipIndicatorConfig = (patch: Partial<EdgeSkipIndicatorConfig>) => {
      setSkipIndicatorConfig((prev) => {
        const next = { ...prev, ...patch };
        channelRef.current.setRoster({ skipIndicatorConfig: next });
        return next;
      });
    };

    const handleTriggerDemo = (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => {
      const now = performance.now();
      const wasAlreadyDemo = Boolean(demoEndTimestampsRef.current[slotKey]);
      if (persistentDemoRef.current && wasAlreadyDemo) {
        delete demoEndTimestampsRef.current[slotKey];
        channelRef.current.updatePlayerSlot(slotKey, {
          isDemolished: false,
          demoRespawnRemainingSec: 0,
          demolishedAtMs: 0,
          boostAmount: 33,
        });
        if (slotKey === 1) {
          setSelfDemoActive(false);
          channelRef.current.setRespawnTimer({
            remainingSeconds: 0,
            totalSeconds: 3.0,
            active: false,
          });
        }
        return;
      }
      demoEndTimestampsRef.current[slotKey] = now + 3000;
      if (slotKey === 1) {
        setSelfDemoActive(true);
        channelRef.current.setRespawnTimer({
          remainingSeconds: 3.0,
          totalSeconds: 3.0,
          active: true,
        });
      }
      channelRef.current.updatePlayerSlot(slotKey, {
        isDemolished: true,
        demoRespawnRemainingSec: persistentDemoRef.current ? 1.8 : 3.0,
        ...(wasAlreadyDemo ? {} : { demolishedAtMs: now }),
      });
    };

    const handleTogglePersistentDemo = () => {
      setPersistentDemo((prev) => {
        const next = !prev;
        persistentDemoRef.current = next;
        const now = performance.now();
        if (next) {
          const activeKeys = Object.keys(demoEndTimestampsRef.current);
          if (activeKeys.length === 0) {
            ([2, 4] as const).forEach((k, idx) => {
              if (slotExists[k]) {
                demoEndTimestampsRef.current[k] = now + 3000;
                channelRef.current.updatePlayerSlot(k, {
                  isDemolished: true,
                  demoRespawnRemainingSec: 1.8,
                  demolishedAtMs: now + idx * 10,
                });
              }
            });
          }
        } else {
          for (const keyStr of Object.keys(demoEndTimestampsRef.current)) {
            const k = Number(keyStr) as 1 | 2 | 3 | 4 | 5 | 6;
            delete demoEndTimestampsRef.current[k];
            channelRef.current.updatePlayerSlot(k, {
              isDemolished: false,
              demoRespawnRemainingSec: 0,
              demolishedAtMs: 0,
              boostAmount: 33,
            });
          }
          setSelfDemoActive(false);
          channelRef.current.setRespawnTimer({
            remainingSeconds: 0,
            totalSeconds: 3.0,
            active: false,
          });
        }
        return next;
      });
    };

    const handleScorePresetChange = (preset: ScorePresetKey) => {
      setScorePreset(preset);
      if (preset === '1digit') {
        channelRef.current.setScoreboard({ leftScore: 2, rightScore: 2, scoreDigits: 2 });
      } else if (preset === '2digit') {
        channelRef.current.setScoreboard({ leftScore: 12, rightScore: 8, scoreDigits: 2 });
      } else {
        channelRef.current.setScoreboard({ leftScore: 104, rightScore: 99, scoreDigits: 3 });
      }
    };

    const handleTriggerOvertimeKickoff = () => {
      setOvertimeChinOpen(true);
      channelRef.current.setScoreboard({
        seconds: 0,
        isOvertime: true,
        overtimeChinOpen: true,
        overtimeChinText: 'OVERTIME',
      });
    };

    const handleToggleOvertimeChin = () => {
      const next = !overtimeChinOpen;
      setOvertimeChinOpen(next);
      channelRef.current.setScoreboard({ overtimeChinOpen: next });
    };

    const handleResetRegulation = () => {
      setOvertimeChinOpen(false);
      channelRef.current.setScoreboard({
        seconds: 164,
        isOvertime: false,
        overtimeChinOpen: false,
      });
    };

    const handleBestOfChange = (nextBo: 0 | 3 | 5 | 7) => {
      setBestOf(nextBo);
      const maxWins = nextBo > 0 ? Math.ceil(nextBo / 2) : 0;
      const clampedL = Math.min(leftWins, maxWins);
      const clampedR = Math.min(rightWins, maxWins);
      setLeftWins(clampedL);
      setRightWins(clampedR);
      channelRef.current.setScoreboard({
        bestOf: nextBo,
        leftSeriesWins: clampedL,
        rightSeriesWins: clampedR,
      });
    };

    const handleAddSeriesWin = (team: 'left' | 'right') => {
      const winsNeeded = bestOf > 0 ? Math.ceil(bestOf / 2) : 3;
      if (team === 'left') {
        const nextL = (leftWins + 1) % (winsNeeded + 1);
        setLeftWins(nextL);
        channelRef.current.setScoreboard({ leftSeriesWins: nextL });
      } else {
        const nextR = (rightWins + 1) % (winsNeeded + 1);
        setRightWins(nextR);
        channelRef.current.setScoreboard({ rightSeriesWins: nextR });
      }
    };

    const handleFlipSimModeChange = (nextMode: FlipSimMode) => {
      setFlipSimMode(nextMode);
      flipSimModeRef.current = nextMode;
      if (nextMode === 'grounded') {
        channelRef.current.setFlip({
          hasFlip: true,
          status: 'grounded',
          remainingSeconds: FLIP_WINDOW_SECONDS,
          maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 1,
        });
      } else if (nextMode === 'multi-flip') {
        channelRef.current.setFlip({
          hasFlip: true,
          status: 'grounded',
          remainingSeconds: FLIP_WINDOW_SECONDS,
          maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 2,
        });
      } else if (nextMode === 'unlimited') {
        channelRef.current.setFlip({
          hasFlip: true,
          status: 'unlimited',
          remainingSeconds: FLIP_WINDOW_SECONDS,
          maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 1,
        });
      } else if (nextMode === 'expired') {
        channelRef.current.setFlip({
          hasFlip: false,
          status: 'expired',
          remainingSeconds: 0,
          maxSeconds: FLIP_WINDOW_SECONDS,
          flipsRemaining: 0,
        });
      } else {
        channelRef.current.setFlip({ flipsRemaining: 1 });
      }
    };

    const handleCycleFlipSimMode = () => {
      const order: FlipSimMode[] = ['auto-drain', 'grounded', 'multi-flip', 'unlimited', 'expired'];
      const next = order[(order.indexOf(flipSimMode) + 1) % order.length];
      handleFlipSimModeChange(next);
    };

    const winsNeededForBo = bestOf > 0 ? Math.ceil(bestOf / 2) : 0;
    const leftTopBandVisible = showTelemetryTopLeft;
    const rightTopBandVisible =
      layoutStrategy === 'collapse-symmetric' ? showTelemetryTopLeft : false;
    const topBandSlotMode: HudSlotMode = layoutStrategy === 'reserve' ? 'reserve' : 'collapse';
    const isSpectatorFreeCam = viewMode === 'spectator' && focusedSlot === null;
    const isCockpitVisible = !bottomHudRetracted && !isSpectatorFreeCam;

    return (
      <HudChoreographySandboxProvider
        value={{
          isLight,
          hudThemeLight,
          setHudThemeLight,
          scorePreset,
          handleScorePresetChange,
          overtimeChinOpen,
          handleTriggerOvertimeKickoff,
          handleToggleOvertimeChin,
          handleResetRegulation,
          bestOf,
          handleBestOfChange,
          leftWins,
          rightWins,
          winsNeededForBo,
          handleAddSeriesWin,
          viewMode,
          handleModeChange,
          activeSignal,
          handleDispatchSignal,
          myTeamSide,
          handleToggleTeamSide,
          slotExists,
          handleToggleSlotExists,
          replaySkipReady,
          handleToggleReplaySkipReady,
          skipIndicatorConfig,
          onUpdateSkipIndicatorConfig: handleUpdateSkipIndicatorConfig,
          handleApplyTeamSizePreset,
          opponentDemoCompact,
          handleToggleOpponentDemoCompact,
          persistentDemo,
          onTogglePersistentDemo: handleTogglePersistentDemo,
          demoIndicatorConfig,
          onUpdateDemoIndicatorConfig: handleUpdateDemoIndicatorConfig,
          focusedSlot,
          handleSelectPov,
          handleTriggerDemo,
          layoutStrategy,
          setLayoutStrategy,
          showTelemetryTopLeft,
          setShowTelemetryTopLeft,
          flipSimMode,
          onFlipSimModeChange: handleFlipSimModeChange,
          handleCycleFlipSimMode,
          jumpPlacement,
          setJumpPlacement,
          showBallCam,
          setShowBallCam,
          leftTopBandVisible,
          rightTopBandVisible,
          topBandSlotMode,
          leftTeamColor,
          leftBarColor,
          rightTeamColor,
          rightBarColor,
          selfDemoActive,
          selfDemoPillTextRef,
          isCockpitVisible,
          instantCockpitTransition,
          channel: channelRef.current,
        }}
      >
        <section ref={sandboxSectionRef} className="flex flex-col gap-5">
          {/* Section Header */}
          <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-6 w-6 rounded-md bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold text-xs font-mono">
                5A.S
              </div>
              <h2 className="text-base font-bold tracking-tight">
                HudSpatialChoreographySandbox · Four Stages Signal Animation Bus · Swap Teams
                (`Switch Side`) · Enemy destroyed, top-fill slot
              </h2>
              <Badge variant="primary" size="sm" isLight={isLight}>
                Goal Replay / Kickoff Signals · GPU `translate3d`
              </Badge>
              <Badge variant="amber" size="sm" isLight={isLight}>
                persistent DOM Node · 0 React Re-render · 0 GC
              </Badge>
            </div>
          </div>
          {/* Interactive Control Deck */}
          <HudChoreographyControlDeck isLight={isLight} />
          {/* FULL-VIEWPORT 16:9 HUD SPATIAL STAGE */}
          <HudSpatialChoreographyStageCanvas />
        </section>
      </HudChoreographySandboxProvider>
    );
  }
);

HudSpatialChoreographySandbox.displayName = 'HudSpatialChoreographySandbox';
