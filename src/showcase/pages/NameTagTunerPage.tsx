import React, { useCallback, useEffect, useState } from 'react';
import { NameTagTunerFloatingWindow } from '../../ui-core/panels/dev/NameTagTunerFloatingWindow';
import {
  getNameTagConfig,
  setNameTagRuntimeState,
  subscribeNameTagConfig,
  updateNameTagConfig,
} from '../../ui-core/stores/nameTagTunerStore';
import type { ArenaLightingPreset } from '../ArenaBackdrop';
import { PageJumpDirectory, type JumpDirectoryItem } from '../PageJumpDirectory';
import { NameTagModeShootoutSection } from './name-tag-tuner/NameTagModeShootoutSection';
import {
  buildKickoffCars,
  KICKOFF_SLOT_PAIRS,
  NameTagStageCanvas,
} from './name-tag-tuner/NameTagStageCanvas';

const JUMP_ITEMS: JumpDirectoryItem[] = [
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
  const [config, setConfig] = useState(getNameTagConfig);
  const [arenaPreset, setArenaPreset] = useState<ArenaLightingPreset>('night');
  const [stageHeight, setStageHeight] = useState(330);
  const [comboIndex, setComboIndex] = useState(0);
  const [focusedCarIndex, setFocusedCarIndex] = useState<number | null>(0);
  const [cameraFovDeg, setCameraFovDeg] = useState(110);
  const [ballHeightOffset, setBallHeightOffset] = useState(14);
  const [animateBoostWave, setAnimateBoostWave] = useState(false);
  const [customNameOverride, setCustomNameOverride] = useState('');
  const [slotLayoutMode, setSlotLayoutMode] = useState<'grid' | 'floating-width'>('grid');

  useEffect(() => subscribeNameTagConfig(() => setConfig(getNameTagConfig())), []);

  const cars = React.useMemo(
    () => buildKickoffCars(KICKOFF_COMBINATIONS[comboIndex % KICKOFF_COMBINATIONS.length]),
    [comboIndex],
  );

  const handleReshuffleKickoff = useCallback(() => {
    setComboIndex((prev) => (prev + 1) % KICKOFF_COMBINATIONS.length);
  }, []);

  const handleSelectPovCar = useCallback((carIndex: number) => {
    setFocusedCarIndex(carIndex);
  }, []);

  const handleFocusFreeCam = useCallback(() => {
    setFocusedCarIndex(null);
  }, []);

  // Wire shared NameTagTunerStore runtime callbacks so the embedded NameTagTunerFloatingWindow buttons work directly
  useEffect(() => {
    setNameTagRuntimeState({
      isTunerArenaActive: true,
      isMultiplayerOrMultiCarMode: true,
      kickoffPermutationIndex: comboIndex,
      activeCameraMode: focusedCarIndex !== null ? 'pov' : 'free',
      focusedCarIndex: focusedCarIndex ?? 0,
      onEnterTunerArena: () => setFocusedCarIndex(0),
      onExitTunerArena: () => setFocusedCarIndex(null),
      onReshuffleKickoffPositions: handleReshuffleKickoff,
      onSelectPovCar: handleSelectPovCar,
      onFocusFreeCamOverview: handleFocusFreeCam,
    });
  }, [comboIndex, focusedCarIndex, handleReshuffleKickoff, handleSelectPovCar, handleFocusFreeCam]);

  // Keyboard shortcuts [0] for FreeCam and [1..6] for POV car switching
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.key === '0') {
        setFocusedCarIndex(null);
      } else if (e.key >= '1' && e.key <= '6') {
        setFocusedCarIndex(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const slotCombo = KICKOFF_COMBINATIONS[comboIndex % KICKOFF_COMBINATIONS.length];
  const slotSummary = slotCombo.map((idx) => KICKOFF_SLOT_PAIRS[idx].name).join(' + ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Pinned Top Arena Stage */}
      <div
        style={{
          position: 'sticky',
          top: -28,
          zIndex: 40,
          margin: '-28px -32px 0 -32px',
          background: 'rgba(6, 9, 15, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 14px 36px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Top Stage Control Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#5eead4',
                fontFamily: 'var(--font-mono)',
              }}
            >
              5H · MULTIPLAYER NAME TAG & BOOST TUNER
            </span>

            {/* POV Selector Pills */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleFocusFreeCam}
                style={{
                  padding: '3px 8px',
                  borderRadius: 5,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  border:
                    focusedCarIndex === null
                      ? '1px solid rgba(94, 234, 212, 0.65)'
                      : '1px solid rgba(255, 255, 255, 0.14)',
                  background:
                    focusedCarIndex === null
                      ? 'rgba(94, 234, 212, 0.18)'
                      : 'rgba(255, 255, 255, 0.04)',
                  color: focusedCarIndex === null ? '#5eead4' : '#cbd5e1',
                }}
              >
                [0] FreeCam
              </button>
              {cars.map((car) => {
                const isSelected = focusedCarIndex === car.carIndex;
                const accent = car.team === 0 ? '#60a5fa' : '#fb923c';
                return (
                  <button
                    key={car.carIndex}
                    type="button"
                    onClick={() => handleSelectPovCar(car.carIndex)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 5,
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      border: isSelected ? `1px solid ${accent}` : '1px solid rgba(255, 255, 255, 0.12)',
                      background: isSelected ? `${accent}28` : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? accent : '#cbd5e1',
                    }}
                  >
                    [{car.carIndex + 1}] {car.slotCode}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleReshuffleKickoff}
                style={{
                  padding: '3px 9px',
                  borderRadius: 5,
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#f8fafc',
                }}
                title={`Active Slots: ${slotSummary}`}
              >
                Reshuffle Kickoff
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Ball Kickoff Elevation Slider to inspect partial vs center occlusion */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#94a3b8' }}>
              <span>Ball Z-Offset</span>
              <input
                type="range"
                min={-25}
                max={140}
                value={ballHeightOffset}
                onChange={(e) => setBallHeightOffset(Number(e.target.value))}
                style={{ width: 68, accentColor: '#5eead4' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', width: 42 }}>{ballHeightOffset} UU</span>
            </div>

            {/* Camera FOV Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#94a3b8' }}>
              <span>Cam FOV</span>
              <input
                type="range"
                min={70}
                max={125}
                value={cameraFovDeg}
                onChange={(e) => setCameraFovDeg(Number(e.target.value))}
                style={{ width: 64, accentColor: '#5eead4' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', width: 34 }}>{cameraFovDeg} deg</span>
            </div>

            {/* Animate Boost Wave Toggle */}
            <button
              type="button"
              onClick={() => setAnimateBoostWave((v) => !v)}
              style={{
                padding: '3px 8px',
                borderRadius: 5,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                border: animateBoostWave
                  ? '1px solid rgba(94, 234, 212, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.14)',
                background: animateBoostWave ? 'rgba(94, 234, 212, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                color: animateBoostWave ? '#5eead4' : '#cbd5e1',
              }}
            >
              {animateBoostWave ? 'Boost Wave: LIVE' : 'Boost Wave: Static'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: '#94a3b8' }}>
              <span>Stage H</span>
              <input
                type="range"
                min={240}
                max={460}
                value={stageHeight}
                onChange={(e) => setStageHeight(Number(e.target.value))}
                style={{ width: 64, accentColor: '#5eead4' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {ARENA_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setArenaPreset(preset)}
                  style={{
                    padding: '3px 7px',
                    borderRadius: 5,
                    fontSize: 9.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    border:
                      arenaPreset === preset
                        ? '1px solid rgba(94, 234, 212, 0.6)'
                        : '1px solid rgba(255, 255, 255, 0.12)',
                    background:
                      arenaPreset === preset ? 'rgba(94, 234, 212, 0.16)' : 'rgba(255, 255, 255, 0.04)',
                    color: arenaPreset === preset ? '#5eead4' : '#94a3b8',
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive 3D Kickoff + 2D Name Tag Overlay Stage */}
        <NameTagStageCanvas
          config={config}
          cars={cars}
          focusedCarIndex={focusedCarIndex}
          cameraFovDeg={cameraFovDeg}
          ballHeightOffset={ballHeightOffset}
          animateBoostWave={animateBoostWave}
          customNameOverride={customNameOverride}
          arenaPreset={arenaPreset}
          stageHeight={stageHeight}
        />
      </div>

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
        className={`rounded-2xl border p-6 flex flex-col gap-4 ${
          isLight ? 'bg-neutral-900 text-neutral-100 border-neutral-800' : 'bg-neutral-900/75 border-neutral-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <div className="text-xs font-mono font-bold text-teal-400">5H.1 · VISUAL SHOOTOUT</div>
            <h2 className="text-base font-bold text-white">
              4 Boost Indicator Modes & Kickoff Ball Entity Occlusion
            </h2>
            <p className="text-xs text-neutral-400">
              Compare all 4 boost progress designs across short ("K") vs long ("AlphaStriker") names, and inspect analytical 2D destination-out ball occlusion (default OFF).
            </p>
          </div>
        </div>

        <NameTagModeShootoutSection
          config={config}
          onSelectMode={(mode) => updateNameTagConfig({ boostIndicatorMode: mode })}
          onUpdateConfig={(patch) => updateNameTagConfig(patch)}
        />
      </section>

      {/* Section 02: Directly Reused NameTagTunerFloatingWindow Content Slot */}
      <section
        id="sec-nametag-shared-slot"
        className={`rounded-2xl border p-6 flex flex-col gap-4 ${
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
              Mounts <code className="font-mono">src/ui-core/panels/dev/NameTagTunerFloatingWindow.tsx</code> directly. Any adjustment updates both this standalone workbench and the 6D floating window in real time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Custom name override..."
              value={customNameOverride}
              onChange={(e) => setCustomNameOverride(e.target.value)}
              style={{
                padding: '4px 9px',
                borderRadius: 6,
                fontSize: 11,
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#f8fafc',
                width: 165,
              }}
            />
            <button
              type="button"
              onClick={() => setSlotLayoutMode('grid')}
              style={{
                padding: '4px 9px',
                borderRadius: 6,
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
                border:
                  slotLayoutMode === 'grid'
                    ? '1px solid rgba(20, 184, 166, 0.65)'
                    : '1px solid rgba(148, 163, 184, 0.3)',
                background:
                  slotLayoutMode === 'grid' ? 'rgba(20, 184, 166, 0.16)' : 'rgba(148, 163, 184, 0.08)',
                color: slotLayoutMode === 'grid' ? '#14b8a6' : 'inherit',
              }}
            >
              2-Column Workbench
            </button>
            <button
              type="button"
              onClick={() => setSlotLayoutMode('floating-width')}
              style={{
                padding: '4px 9px',
                borderRadius: 6,
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
                border:
                  slotLayoutMode === 'floating-width'
                    ? '1px solid rgba(20, 184, 166, 0.65)'
                    : '1px solid rgba(148, 163, 184, 0.3)',
                background:
                  slotLayoutMode === 'floating-width'
                    ? 'rgba(20, 184, 166, 0.16)'
                    : 'rgba(148, 163, 184, 0.08)',
                color: slotLayoutMode === 'floating-width' ? '#14b8a6' : 'inherit',
              }}
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
