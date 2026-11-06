import React, { useCallback, useEffect } from 'react';
import { RotateCcw, Shuffle, Eye, Activity } from 'lucide-react';
import { NameTagTunerFloatingWindow } from '../../ui-core/panels/dev/NameTagTunerFloatingWindow';
import { Badge } from '../../ui-core/primitives/Badge';
import { updateBallVisualConfig } from '../../ui-core/stores/ballVisualStore';
import {
  setNameTagRuntimeState,
  updateNameTagConfig,
  useNameTagTunerStore,
} from '../../ui-core/stores/nameTagTunerStore';
import type { ArenaLightingPreset } from '../ArenaBackdrop';
import { PageJumpDirectory, type JumpDirectoryItem } from '../PageJumpDirectory';
import { TunerConfigExporterBar } from '../components/tuner/TunerConfigExporterBar';
import { NameTagModeShootoutSection } from './name-tag-tuner/NameTagModeShootoutSection';
import {
  buildKickoffCars,
  KICKOFF_SLOT_PAIRS,
  NameTagStageCanvas,
} from './name-tag-tuner/NameTagStageCanvas';
import { useNameTagSyncedState } from './name-tag-tuner/useNameTagSyncedState';

const JUMP_ITEMS: JumpDirectoryItem[] = [
  {
    code: '5H.0',
    componentName: 'NameTagStageCanvas',
    label: 'Top-Pinned 6-Car Kickoff Arena Stage & Camera Deck',
    targetId: 'sec-nametag-stage',
    tag: '3D + 2D Pass',
  },
  {
    code: '5H.1',
    componentName: 'NameTagModeShootoutSection',
    label: '4 Boost Modes & Kickoff Ball Occlusion Shootout',
    targetId: 'sec-nametag-shootout',
    tag: '4 Modes + Ball Mask',
  },
  {
    code: '5H.2',
    componentName: 'NameTagTunerFloatingWindow',
    label: 'Shared NameTagTunerFloatingWindow Control Slot (Direct Reuse)',
    targetId: 'sec-nametag-shared-slot',
    tag: 'Zero Duplication',
  },
];

const KICKOFF_COMBINATIONS: Array<[number, number, number]> = [
  [0, 1, 4],
  [0, 2, 3],
  [1, 2, 4],
  [0, 3, 4],
  [1, 3, 2],
];

const ARENA_PRESETS: ArenaLightingPreset[] = ['night', 'twilight', 'daylight', 'flow'];

export const NameTagTunerPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  const {
    config,
    isTunerArenaActive,
    kickoffPermutationIndex,
    activeCameraMode,
    focusedCarIndex: storeFocusedCarIndex,
    boostBorderOverride,
    reshuffleKickoffPositions,
    selectPovCar,
    focusFreeCamOverview,
  } = useNameTagTunerStore();

  const {
    arenaPreset,
    setArenaPreset,
    stageHeight,
    setStageHeight,
    cameraFovDeg,
    setCameraFovDeg,
    ballHeightOffset,
    setBallHeightOffset,
    animateBoostWave,
    setAnimateBoostWave,
    customNameOverride,
    setCustomNameOverride,
    slotLayoutMode,
    setSlotLayoutMode,
    resetStageControls,
    handleReset5HDefaults,
    build5HExportCode,
  } = useNameTagSyncedState();

  // Ensure the 6-Car Kickoff Arena is marked active when viewing 5H
  useEffect(() => {
    if (!isTunerArenaActive) {
      setNameTagRuntimeState({
        isTunerArenaActive: true,
        isMultiplayerOrMultiCarMode: true,
      });
    } else {
      setNameTagRuntimeState({
        isMultiplayerOrMultiCarMode: true,
      });
    }
  }, [isTunerArenaActive]);

  const comboIndex =
    ((kickoffPermutationIndex % KICKOFF_COMBINATIONS.length) +
      KICKOFF_COMBINATIONS.length) %
    KICKOFF_COMBINATIONS.length;

  const effectiveFocusedCarIndex =
    activeCameraMode === 'free' ? null : storeFocusedCarIndex;

  const cars = React.useMemo(
    () => buildKickoffCars(KICKOFF_COMBINATIONS[comboIndex]),
    [comboIndex]
  );

  // Keyboard shortcuts [0] for FreeCam and [1..6] for POV car switching
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      if (e.key === '0') {
        focusFreeCamOverview();
      } else if (e.key >= '1' && e.key <= '6') {
        selectPovCar(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusFreeCamOverview, selectPovCar]);

  const handleUpdateConfigFromShootout = useCallback(
    (patch: Partial<typeof config>) => {
      updateNameTagConfig(patch);
      if (typeof patch.ballOcclusionOpacity === 'number') {
        updateBallVisualConfig({ opacity: patch.ballOcclusionOpacity });
      }
    },
    []
  );

  const slotCombo = KICKOFF_COMBINATIONS[comboIndex];
  const slotSummary = slotCombo.map((idx) => KICKOFF_SLOT_PAIRS[idx].name).join(' + ');

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      {/* Static Page Header (Nothing above the View Box ever changes) */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="amber" size="sm" isLight={isLight}>
            5H · Five Hotel
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">
            Multiplayer Name Tag &amp; Boost Progress Calibration System
          </h1>
          <Badge variant="primary" size="sm" isLight={isLight}>
            Analytical 2D Canvas + Ball Occlusion Pass
          </Badge>
        </div>
        <p className={`text-xs leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Static top-pinned View Box stage (non-sticky for comfortable dual-monitor workflows) — all
          camera POV selections, kickoff permutations, boost progress modes, ball occlusion masks,
          and per-car calibration overrides synchronize in real time across multiple browser windows
          and tabs.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1: TOP-PINNED VIEW BOX STAGE & CONTROLS BELOW               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section
        id="sec-nametag-stage"
        className={`p-5 rounded-3xl border flex flex-col gap-5 scroll-mt-24 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-xl'
        }`}
      >
        {/* 1. TOP-PINNED VIEW BOX: 3D KICKOFF + 2D NAME TAG OVERLAY STAGE */}
        <NameTagStageCanvas
          config={config}
          cars={cars}
          focusedCarIndex={effectiveFocusedCarIndex}
          boostBorderOverride={boostBorderOverride}
          cameraFovDeg={cameraFovDeg}
          ballHeightOffset={ballHeightOffset}
          animateBoostWave={animateBoostWave}
          customNameOverride={customNameOverride}
          arenaPreset={arenaPreset}
          stageHeight={stageHeight}
        />

        {/* 2. STAGE HEADER & CONTROLS (Placed BELOW the View Box) */}
        <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="amber" size="sm" isLight={isLight}>
              5H.0
            </Badge>
            <h2 className="text-base font-bold tracking-tight">
              6-Car Kickoff Arena Stage · Formation #{comboIndex + 1} ({slotSummary})
            </h2>
            <Badge variant="success" size="sm" isLight={isLight}>
              Multi-Window Synced
            </Badge>
          </div>

          <button
            type="button"
            onClick={resetStageControls}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                : 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Stage View</span>
          </button>
        </div>

        {/* Camera POV & Stage Environment Control Deck */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col gap-3.5 ${
            isLight
              ? 'bg-neutral-50/90 border-neutral-200/90'
              : 'bg-neutral-950/70 border-neutral-800'
          }`}
        >
          {/* Row 1: Camera Mode & POV Switcher + Kickoff Reshuffle + Boost Wave */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-teal-500 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>Camera POV (Keys 0–6):</span>
              </span>

              <button
                type="button"
                onClick={focusFreeCamOverview}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                  effectiveFocusedCarIndex === null
                    ? 'bg-teal-500/20 border-teal-400 text-teal-400'
                    : isLight
                      ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                [0] FreeCam
              </button>

              {cars.map((car) => {
                const isSelected = effectiveFocusedCarIndex === car.carIndex;
                const isBlue = car.team === 0;
                return (
                  <button
                    key={car.carIndex}
                    type="button"
                    onClick={() => selectPovCar(car.carIndex)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                      isSelected
                        ? isBlue
                          ? 'bg-sky-500/20 border-sky-400 text-sky-400'
                          : 'bg-orange-500/20 border-orange-400 text-orange-400'
                        : isLight
                          ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    [{car.carIndex + 1}] {car.slotCode}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={reshuffleKickoffPositions}
                title={`Active Slots: ${slotSummary}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>Reshuffle Kickoff</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAnimateBoostWave((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                animateBoostWave
                  ? 'bg-teal-500/20 border-teal-400 text-teal-400'
                  : isLight
                    ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>{animateBoostWave ? 'Boost Wave: LIVE' : 'Boost Wave: Static'}</span>
            </button>
          </div>

          {/* Row 2: Ball Z-Offset, Cam FOV, Stage Height, Arena Lighting Presets */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-neutral-200/70 dark:border-neutral-800/80 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono opacity-75">Ball Z-Offset</span>
                <input
                  type="range"
                  min={-25}
                  max={140}
                  value={ballHeightOffset}
                  onChange={(e) => setBallHeightOffset(Number(e.target.value))}
                  className="w-24 accent-teal-400 cursor-pointer"
                />
                <span className="font-mono font-bold w-12">{ballHeightOffset} UU</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono opacity-75">Cam FOV</span>
                <input
                  type="range"
                  min={70}
                  max={125}
                  value={cameraFovDeg}
                  onChange={(e) => setCameraFovDeg(Number(e.target.value))}
                  className="w-24 accent-teal-400 cursor-pointer"
                />
                <span className="font-mono font-bold w-12">{cameraFovDeg} deg</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono opacity-75">Stage H</span>
                <input
                  type="range"
                  min={240}
                  max={480}
                  value={stageHeight}
                  onChange={(e) => setStageHeight(Number(e.target.value))}
                  className="w-24 accent-teal-400 cursor-pointer"
                />
                <span className="font-mono font-bold w-12">{stageHeight}px</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono opacity-75 mr-1">Backdrop:</span>
              {ARENA_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setArenaPreset(preset)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold uppercase cursor-pointer transition-colors ${
                    arenaPreset === preset
                      ? 'bg-teal-500/20 border-teal-400 text-teal-400'
                      : isLight
                        ? 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-100'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PageJumpDirectory
        layerTag="L5H · SPECIALS"
        title="5H · Multiplayer Name Tag & Boost Tuner"
        subtitle="Dedicated calibration workbench for 2D multiplayer name tags, 4 boost progress modes, and kickoff ball entity occlusion"
        items={JUMP_ITEMS}
        isLight={isLight}
      />

      {/* Section 01: 4 Boost Indicator Modes & Ball Occlusion Shootout */}
      <section
        id="sec-nametag-shootout"
        className={`rounded-2xl border p-6 flex flex-col gap-4 scroll-mt-24 ${
          isLight
            ? 'bg-neutral-900 text-neutral-100 border-neutral-800'
            : 'bg-neutral-900/75 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-teal-400">5H.1 · VISUAL SHOOTOUT</div>
            <h2 className="text-base font-bold text-white">
              4 Boost Indicator Modes &amp; Kickoff Ball Entity Occlusion
            </h2>
            <p className="text-xs text-neutral-400">
              Compare all 4 boost progress designs across short (&quot;K&quot;) vs long (&quot;AlphaStriker&quot;) names, and inspect analytical 2D destination-out ball occlusion (default 100% solid ball).
            </p>
          </div>
        </div>

        <NameTagModeShootoutSection
          config={config}
          onSelectMode={(mode) => updateNameTagConfig({ boostIndicatorMode: mode })}
          onUpdateConfig={handleUpdateConfigFromShootout}
        />
      </section>

      {/* Dedicated 5H One-Click Parameter Exporter Bar (Matching 5E / 5G Pattern) */}
      <TunerConfigExporterBar
        badge="5H-EXPORT"
        title="Name Tag & Boost Parameter Tuner & One-Click Config Exporter"
        subtitle="Exports only 5H NameTagConfig (Boost fill/unfilled opacity, pure black boost colors, 100% solid ball occlusion & pill geometry)"
        copyLabel="Copy 5H Name Tag Config (Export Snapshot)"
        codeTitle="Current 5H Name Tag Parameter Snapshot (Paste directly into DEFAULT_NAME_TAG_CONFIG)"
        actionId="export-5h-config"
        isLight={isLight}
        buildExportCode={build5HExportCode}
        onResetDefaults={handleReset5HDefaults}
      />

      {/* Section 02: Directly Reused NameTagTunerFloatingWindow Content Slot */}
      <section
        id="sec-nametag-shared-slot"
        className={`rounded-2xl border p-6 flex flex-col gap-4 scroll-mt-24 ${
          isLight ? 'bg-white border-neutral-200/90 shadow-xs' : 'bg-neutral-900/75 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-500/20 pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-teal-500">
              5H.2 · DIRECT COMPONENT SLOT REUSE
            </div>
            <h2 className="text-base font-bold">
              Shared NameTagTunerFloatingWindow Control Slot (Zero Code Duplication)
            </h2>
            <p className="text-xs opacity-70">
              Mounts <code className="font-mono">src/ui-core/panels/dev/NameTagTunerFloatingWindow.tsx</code> directly. Any adjustment updates both this standalone workbench and the 6D floating window in real time across all open tabs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Custom name override..."
              value={customNameOverride}
              onChange={(e) => setCustomNameOverride(e.target.value)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono outline-none w-44 ${
                isLight
                  ? 'bg-white border-neutral-300 text-neutral-800 focus:border-teal-500'
                  : 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-teal-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setSlotLayoutMode('grid')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                slotLayoutMode === 'grid'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-500'
                  : isLight
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
            >
              2-Column Workbench
            </button>
            <button
              type="button"
              onClick={() => setSlotLayoutMode('floating-width')}
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-colors ${
                slotLayoutMode === 'floating-width'
                  ? 'bg-teal-500/20 border-teal-500 text-teal-500'
                  : isLight
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
            >
              480px Floating Slot Width
            </button>
          </div>
        </div>

        <div
          style={{
            maxWidth: slotLayoutMode === 'floating-width' ? 480 : '100%',
            margin: slotLayoutMode === 'floating-width' ? '0 auto' : undefined,
            padding: slotLayoutMode === 'floating-width' ? 14 : 4,
            borderRadius: 12,
            border:
              slotLayoutMode === 'floating-width'
                ? '1px dashed rgba(20, 184, 166, 0.45)'
                : 'none',
            transition: 'max-width 180ms ease',
          }}
        >
          <NameTagTunerFloatingWindow
            isLight={isLight}
            layout={slotLayoutMode === 'grid' ? 'grid' : 'column'}
          />
        </div>
      </section>
    </div>
  );
};
