import React, { useMemo } from 'react';
import { createScopedSyncedState } from '../../stores/crossClientSync';
import {
  CheckCircle2,
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Play,
  SkipForward,
} from 'lucide-react';
import { EdgePlayerHudStrip } from '../../../ui-core/hud/EdgePlayerHudStrip';
import {
  DEFAULT_SKIP_INDICATOR_CONFIG,
  resolveSkipIndicatorConfig,
  type EdgeSkipIndicatorConfig,
  type EdgeSkipIndicatorVariant,
  type EdgePlayerSlotState,
  type HudRosterViewMode,
} from '../../../ui-core/stores/hudTransientChannel';
import { ReplaySkipCheckSvg } from '../../../ui-core/primitives/packagedSvgIcons';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { Badge } from '../../../ui-core/primitives/Badge';

const useState = createScopedSyncedState('hud-5a-2-skip-inspector');

export interface EdgeSkipReplayInspectorSectionProps {
  isLight: boolean;
}

const SKIP_COLOR_SWATCHES = [
  { index: 1, hex: '#22C55E', label: '#1 Green' },
  { index: 2, hex: '#10B981', label: '#2 Emerald (Default)' },
  { index: 3, hex: '#84CC16', label: '#3 Lime' },
  { index: 4, hex: '#38BDF8', label: '#4 Sky Cyan' },
  { index: 5, hex: '#F59E0B', label: '#5 Amber Warn' },
  { index: 6, hex: '#EF4444', label: '#6 Crimson Alert' },
  { index: 7, hex: '#FFFFFF', label: '#7 Pure White' },
] as const;

const VARIANT_OPTIONS: {
  id: EdgeSkipIndicatorVariant;
  label: string;
  defaultHex: string;
  tag: string;
}[] = [
  { id: 'check', label: 'Skip Replay Check', defaultHex: '#10B981', tag: 'READY' },
  { id: 'disconnect', label: 'Disconnect (WiFi-Off)', defaultHex: '#EF4444', tag: 'OFFLINE' },
  { id: 'packet-loss', label: 'Packet Loss Cubes', defaultHex: '#F97316', tag: 'PKT LOSS' },
  { id: 'latency', label: 'High Ping / Latency', defaultHex: '#F59E0B', tag: 'HIGH PING' },
  { id: 'waiting', label: 'Sync / Waiting Clock', defaultHex: '#38BDF8', tag: 'WAITING' },
];

const MIXED_SLOT_AUX_MAP: Record<
  1 | 2 | 3 | 4 | 5 | 6,
  { variant: EdgeSkipIndicatorVariant; color: string }
> = {
  1: { variant: 'check', color: '#10B981' },
  2: { variant: 'disconnect', color: '#EF4444' },
  3: { variant: 'packet-loss', color: '#F97316' },
  4: { variant: 'check', color: '#10B981' },
  5: { variant: 'latency', color: '#F59E0B' },
  6: { variant: 'waiting', color: '#38BDF8' },
};

export const EdgeSkipReplayInspectorSection: React.FC<EdgeSkipReplayInspectorSectionProps> =
  React.memo(({ isLight }) => {
    const [rawSkipCfg, setSkipCfg] = useState<EdgeSkipIndicatorConfig>(
      { ...DEFAULT_SKIP_INDICATOR_CONFIG },
      'skipCfgV2'
    );
    const skipCfg = resolveSkipIndicatorConfig(rawSkipCfg);
    const [viewMode, setViewMode] = useState<HudRosterViewMode>('goal-replay', 'viewMode');
    const [mixedAuxSlots, setMixedAuxSlots] = useState<boolean>(false, 'mixedAuxSlots');
    const [copiedJson, setCopiedJson] = useState<boolean>(false, 'copiedJson');
    const [skipSlots, setSkipSlots] = useState<Record<1 | 2 | 3 | 4 | 5 | 6, boolean>>(
      {
        1: true,
        2: false,
        3: true,
        4: true,
        5: true,
        6: false,
      },
      'skipSlots'
    );

    const updateSkipCfg = (patch: Partial<EdgeSkipIndicatorConfig>) => {
      setSkipCfg((prev) => resolveSkipIndicatorConfig(patch, resolveSkipIndicatorConfig(prev)));
    };

    const toggleSlotSkip = (k: 1 | 2 | 3 | 4 | 5 | 6) => {
      setSkipSlots((prev) => ({ ...prev, [k]: !prev[k] }));
    };

    const setAllSlotsSkip = (active: boolean) => {
      setSkipSlots({
        1: active,
        2: active,
        3: active,
        4: active,
        5: active,
        6: active,
      });
    };

    const handleSimulateGoalReplayStart = () => {
      setViewMode('goal-replay');
      setSkipSlots({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: false });
    };

    const handleSimulateKickoffWillStart = () => {
      setViewMode('player-live');
      if (skipCfg.autoResetOnKickoff) {
        setAllSlotsSkip(false);
      }
    };

    const configJsonString = useMemo(
      () =>
        JSON.stringify(
          {
            variant: skipCfg.variant,
            color: skipCfg.color,
            sizePx: skipCfg.sizePx,
            strokeWidth: skipCfg.strokeWidth,
            glowBlurPx: skipCfg.glowBlurPx,
            glowIntensityPct: skipCfg.glowIntensityPct,
            protrudeWidthPx: skipCfg.protrudeWidthPx,
            underlapPx: skipCfg.underlapPx,
            cardRadiusPx: skipCfg.cardRadiusPx,
            iconOffsetXPx: skipCfg.iconOffsetXPx,
            enterDurationMs: skipCfg.enterDurationMs,
            exitDurationMs: skipCfg.exitDurationMs,
            autoResetOnKickoff: skipCfg.autoResetOnKickoff,
          },
          null,
          2
        ),
      [skipCfg]
    );

    const handleCopyConfigJson = () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(configJsonString).catch(() => {});
      }
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 1800);
    };

    const leftPlayers = useMemo<EdgePlayerSlotState[]>(
      () => [
        {
          slotKey: 1,
          team: 'left',
          name: 'You (Octane_99)',
          boostAmount: 85,
          exists: true,
          isSelf: true,
          isFocusedPov: true,
          isDemolished: false,
          replaySkipReady: Boolean(skipSlots[1]),
          skipIndicatorVariant: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[1].variant : undefined,
          skipIndicatorColor: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[1].color : undefined,
        },
        {
          slotKey: 2,
          team: 'left',
          name: 'Zen_Master_RL',
          boostAmount: 42,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: false,
          replaySkipReady: Boolean(skipSlots[2]),
          skipIndicatorVariant: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[2].variant : undefined,
          skipIndicatorColor: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[2].color : undefined,
        },
        {
          slotKey: 3,
          team: 'left',
          name: 'Vatira_KC',
          boostAmount: 100,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: false,
          replaySkipReady: Boolean(skipSlots[3]),
          skipIndicatorVariant: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[3].variant : undefined,
          skipIndicatorColor: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[3].color : undefined,
        },
      ],
      [skipSlots, mixedAuxSlots]
    );

    const rightPlayers = useMemo<EdgePlayerSlotState[]>(
      () => [
        {
          slotKey: 4,
          team: 'right',
          name: 'Firstkiller_NA',
          boostAmount: 64,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: false,
          replaySkipReady: Boolean(skipSlots[4]),
          skipIndicatorVariant: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[4].variant : undefined,
          skipIndicatorColor: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[4].color : undefined,
        },
        {
          slotKey: 5,
          team: 'right',
          name: 'BeastMode_Fennec',
          boostAmount: 18,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: false,
          replaySkipReady: Boolean(skipSlots[5]),
          skipIndicatorVariant: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[5].variant : undefined,
          skipIndicatorColor: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[5].color : undefined,
        },
        {
          slotKey: 6,
          team: 'right',
          name: 'Daniel_SSG',
          boostAmount: 90,
          exists: true,
          isSelf: false,
          isFocusedPov: false,
          isDemolished: false,
          replaySkipReady: Boolean(skipSlots[6]),
          skipIndicatorVariant: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[6].variant : undefined,
          skipIndicatorColor: mixedAuxSlots ? MIXED_SLOT_AUX_MAP[6].color : undefined,
        },
      ],
      [skipSlots, mixedAuxSlots]
    );

    const innerLine = isLight ? 'rgba(0, 0, 0, 0.14)' : 'rgba(255, 255, 255, 0.14)';
    const outerRing = isLight ? 'rgba(115, 115, 115, 0.32)' : 'rgba(113, 113, 122, 0.55)';

    return (
      <section
        id="hud-5a-2-skip-inspector"
        data-tuner-label="Skip Replay Config JSON"
        data-tuner-value={configJsonString}
        className="flex flex-col gap-4 scroll-mt-24"
      >
        <div className="flex items-center gap-2 border-b pb-2 border-neutral-200 dark:border-neutral-800 flex-wrap">
          <div className="h-6 px-1.5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs font-mono">
            5A.2++
          </div>
          <h2 className="text-base font-bold tracking-tight">
            EdgePlayerHudStrip · Skip Replay & Slot Extension Card Dedicated Workbench
          </h2>
          <Badge variant="emerald" size="sm" isLight={isLight}>
            Under-Card Border Tuck · Push/Retract Choreography · Multi-Icon
          </Badge>
          <span className="text-xs font-mono text-neutral-500">
            Default: #2 Emerald (#10B981) · 24px · weight 2.0 · Glow 6px · Exit {skipCfg.exitDurationMs}ms vs 300ms 1-3 Retract
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Interactive Preview Stage, Choreography Simulator, 1:1 & 2x Specimen, and Copyable Config */}
          <div
            className={`lg:col-span-5 p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
              isLight
                ? 'bg-slate-200/80 border-neutral-300 shadow-inner'
                : 'bg-neutral-950 border-neutral-800/90 shadow-inner'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono flex-wrap gap-2">
              <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Extension Drawer Stage ({viewMode})</span>
              </span>
              <span className="opacity-75">
                protrude: <strong>{skipCfg.protrudeWidthPx}px</strong> · tuck: <strong>-{skipCfg.underlapPx}px</strong> · exit: <strong>{skipCfg.exitDurationMs}ms</strong>
              </span>
            </div>

            {/* Quick Choreography Transition & Batch Action Bar */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap font-mono text-[10px]">
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleSimulateGoalReplayStart}
                  title="Switch to goal-replay (1-3 extend 28px inward) and activate Skip Replay cards"
                  className={`px-2 py-1 rounded-lg border cursor-pointer flex items-center gap-1 font-bold transition-all ${
                    viewMode === 'goal-replay'
                      ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-2xs'
                      : isLight
                      ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <Play className="h-3 w-3" />
                  <span>1. Goal Replay (Extend)</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateKickoffWillStart}
                  title="Dispatch kickoff-will-start: 1-3 retract 28px (300ms) while Skip cards retract faster & reset"
                  className={`px-2 py-1 rounded-lg border cursor-pointer flex items-center gap-1 font-bold transition-all ${
                    viewMode === 'player-live'
                      ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow-2xs'
                      : isLight
                      ? 'bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <SkipForward className="h-3 w-3" />
                  <span>2. Kickoff Start (Retract + Reset)</span>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAllSlotsSkip(true)}
                  className="px-2 py-1 rounded-lg border border-emerald-500/50 text-emerald-500 font-bold cursor-pointer hover:bg-emerald-500/10"
                >
                  Push All Out
                </button>
                <button
                  type="button"
                  onClick={() => setAllSlotsSkip(false)}
                  className="px-2 py-1 rounded-lg border border-neutral-400/40 opacity-80 hover:opacity-100 cursor-pointer"
                >
                  Retract All
                </button>
              </div>
            </div>

            {/* Dual-side Strip Preview Stage */}
            <div className="relative h-[168px] rounded-2xl border border-black/15 dark:border-white/10 bg-black/20 overflow-hidden flex items-center justify-between py-2">
              <EdgePlayerHudStrip
                side="left"
                teamColor="#2563EB"
                barColor="#3B82F6"
                isLight={isLight}
                viewMode={viewMode}
                players={leftPlayers}
                skipIndicatorConfig={skipCfg}
                onSelectSlot={toggleSlotSkip}
              />
              <EdgePlayerHudStrip
                side="right"
                teamColor="#EA580C"
                barColor="#F97316"
                isLight={isLight}
                viewMode={viewMode}
                players={rightPlayers}
                skipIndicatorConfig={skipCfg}
                onSelectSlot={toggleSlotSkip}
              />
            </div>

            {/* Close-up Isolated Under-Card Seam & 2x Icon Specimen */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 flex-wrap ${
                isLight
                  ? 'bg-white/90 border-neutral-200/90 text-neutral-800'
                  : 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-mono font-bold">
                  Under-Card Border Tuck & Icon Close-up (1:1 & 1.4x)
                </span>
                <span className="text-[10px] font-mono opacity-65">
                  Left border extends {skipCfg.underlapPx}px beneath player card (z-10 under z-20)
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* 1:1 Actual Seam Specimen */}
                <div className="flex items-center">
                  <div
                    className="relative z-20 h-[37px] px-3 rounded-r-[9px] flex items-center font-mono text-[11px] text-white font-semibold select-none"
                    style={{
                      backgroundColor: '#2563EB',
                      boxShadow:
                        '0 0 0 2px rgba(37, 99, 235, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.32)',
                    }}
                  >
                    Card
                  </div>
                  <div
                    className="relative z-10 flex items-center"
                    style={{
                      marginLeft: `-${skipCfg.underlapPx}px`,
                      clipPath: 'inset(-4px -18px -4px 0px)',
                    }}
                  >
                    <div
                      className="h-[37px] flex items-center justify-center"
                      style={{
                        width: `${skipCfg.underlapPx + skipCfg.protrudeWidthPx}px`,
                        paddingLeft: `${skipCfg.underlapPx}px`,
                        borderRadius: `0px ${skipCfg.cardRadiusPx}px ${skipCfg.cardRadiusPx}px 0px`,
                        backgroundColor: isLight
                          ? 'rgba(255, 255, 255, 0.98)'
                          : 'rgba(20, 20, 25, 0.98)',
                        boxShadow: `0 0 0 1.5px ${outerRing}, inset -1px 0 0 0 ${innerLine}, inset 0 1px 0 0 ${innerLine}, inset 0 -1px 0 0 ${innerLine}`,
                      }}
                    >
                      <ReplaySkipCheckSvg
                        variant={skipCfg.variant}
                        size={skipCfg.sizePx}
                        color={skipCfg.color}
                        strokeWidth={skipCfg.strokeWidth}
                        glowColor={skipCfg.glowColor}
                        glowBlurPx={skipCfg.glowBlurPx}
                        glowIntensityPct={skipCfg.glowIntensityPct}
                        style={{
                          transform:
                            skipCfg.iconOffsetXPx !== 0
                              ? `translate3d(${skipCfg.iconOffsetXPx}px, 0, 0)`
                              : undefined,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Zoomed Specimen */}
                <div
                  className="w-11 h-11 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center shrink-0"
                  title="Zoomed SVG Icon Inspection"
                >
                  <ReplaySkipCheckSvg
                    variant={skipCfg.variant}
                    size={Math.min(34, Math.round(skipCfg.sizePx * 1.25))}
                    color={skipCfg.color}
                    strokeWidth={skipCfg.strokeWidth}
                    glowColor={skipCfg.glowColor}
                    glowBlurPx={skipCfg.glowBlurPx}
                    glowIntensityPct={skipCfg.glowIntensityPct}
                  />
                </div>
              </div>
            </div>

            {/* Copyable Parameter Readout Box */}
            <div
              className={`p-3 rounded-2xl border font-mono text-[10px] flex flex-col gap-1.5 ${
                isLight
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-emerald-500">
                  Export / Copy Current Parameters:
                </span>
                <button
                  type="button"
                  onClick={handleCopyConfigJson}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-neutral-950 font-bold cursor-pointer hover:bg-emerald-400 flex items-center gap-1 transition-colors"
                >
                  {copiedJson ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedJson ? 'Copied JSON!' : 'Copy Parameters JSON'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all leading-relaxed opacity-85 select-all">
                {`color: "${skipCfg.color}" | sizePx: ${skipCfg.sizePx} | weight: ${skipCfg.strokeWidth.toFixed(1)} | glow: ${skipCfg.glowBlurPx}px (${skipCfg.glowIntensityPct}%) | protrude: ${skipCfg.protrudeWidthPx}px | underlap: ${skipCfg.underlapPx}px | radius: ${skipCfg.cardRadiusPx}px | enter: ${skipCfg.enterDurationMs}ms | exit: ${skipCfg.exitDurationMs}ms | variant: "${skipCfg.variant}"`}
              </pre>
            </div>
          </div>

          {/* Right Column: Comprehensive Configuration Panel */}
          <div
            className={`lg:col-span-7 p-6 rounded-3xl border flex flex-col justify-between gap-4 transition-colors shadow-2xs ${
              isLight
                ? 'bg-white border-neutral-200/90 text-neutral-800'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-200'
            }`}
          >
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b pb-2.5 border-neutral-100 dark:border-neutral-800/70 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold font-mono tracking-wide">
                    CONFIGURATION PANEL: SKIP REPLAY & AUXILIARY EXTENSION CARD
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyConfigJson}
                    className="px-2 py-0.5 rounded-lg border border-emerald-500/50 text-emerald-500 text-[11px] font-mono font-bold cursor-pointer hover:bg-emerald-500/10 flex items-center gap-1"
                  >
                    {copiedJson ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkipCfg({ ...DEFAULT_SKIP_INDICATOR_CONFIG })}
                    className="px-2 py-0.5 rounded-lg border border-neutral-400/40 text-[11px] font-mono cursor-pointer hover:bg-neutral-500/10 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset to Default</span>
                  </button>
                </div>
              </div>

              {/* Row 1: Slot Switches + View Mode + Auto-Reset on Kickoff + Mixed Per-Slot Preview */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 py-1">
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-[11px] font-semibold">Slot Active:</span>
                  {([1, 2, 3, 4, 5, 6] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleSlotSkip(k)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                        skipSlots[k]
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-2xs'
                          : 'border-neutral-400/40 opacity-65 hover:opacity-100'
                      }`}
                    >
                      #{k}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 font-mono text-xs">
                  {(['player-live', 'goal-replay', 'spectator'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setViewMode(m)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] border cursor-pointer transition-all ${
                        viewMode === m
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                          : 'border-neutral-400/40 opacity-75'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono opacity-80">Reset on Kickoff:</span>
                    <ToggleSwitch
                      checked={skipCfg.autoResetOnKickoff}
                      onCheckedChange={(v) => updateSkipCfg({ autoResetOnKickoff: v })}
                      isLight={isLight}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[11px] font-mono opacity-80"
                      title="Preview per-slot mixed icons (Check, Disconnect, Packet Loss, High Ping, Waiting)"
                    >
                      Mixed Aux Demo:
                    </span>
                    <ToggleSwitch
                      checked={mixedAuxSlots}
                      onCheckedChange={setMixedAuxSlots}
                      isLight={isLight}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Icon Variant Selector */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-xs font-semibold">
                    Extension Card Icon Variant (`variant` · Supports Skip Replay & Network Telemetry)
                  </span>
                  <span className="text-[10px] font-mono opacity-65">
                    Click to switch icon or Shift+Click to also apply recommended semantic color
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
                  {VARIANT_OPTIONS.map((opt) => {
                    const active = skipCfg.variant === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={(e) => {
                          if (e.shiftKey) {
                            updateSkipCfg({
                              variant: opt.id,
                              color: opt.defaultHex,
                              glowColor: opt.defaultHex,
                            });
                          } else {
                            updateSkipCfg({ variant: opt.id });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-xl border cursor-pointer flex items-center gap-1.5 transition-all ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-2xs'
                            : 'border-neutral-400/40 opacity-85 hover:opacity-100'
                        }`}
                      >
                        <ReplaySkipCheckSvg
                          variant={opt.id}
                          size={14}
                          color="currentColor"
                          strokeWidth={2.0}
                          glowBlurPx={0}
                          glowIntensityPct={0}
                        />
                        <span>{opt.label}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-black/20 opacity-80">
                          {opt.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Icon Size (sizePx) & SVG Stroke Weight (strokeWidth) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex flex-col gap-1.5">
                  <SliderControl
                    label="Skip Icon Size (sizePx)"
                    value={skipCfg.sizePx}
                    min={10}
                    max={32}
                    step={1}
                    defaultValue={24}
                    unit="px"
                    colorScheme="emerald"
                    isLight={isLight}
                    onChange={(v) => updateSkipCfg({ sizePx: v })}
                  />
                  <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                    {[16, 18, 20, 22, 24, 26, 28, 30].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateSkipCfg({ sizePx: sz })}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer transition-all ${
                          skipCfg.sizePx === sz
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'border-neutral-400/40 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {sz}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <SliderControl
                    label="Skip Icon Weight (strokeWidth)"
                    value={skipCfg.strokeWidth}
                    min={1.0}
                    max={3.8}
                    step={0.1}
                    defaultValue={2.0}
                    unit=""
                    colorScheme="emerald"
                    isLight={isLight}
                    onChange={(v) => updateSkipCfg({ strokeWidth: v })}
                  />
                  <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                    {[1.5, 1.8, 2.0, 2.2, 2.5, 3.0].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => updateSkipCfg({ strokeWidth: w })}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer transition-all ${
                          Math.abs(skipCfg.strokeWidth - w) < 0.05
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'border-neutral-400/40 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {w.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Card Protrude Length, Under-Card Tuck, Corner Radius, Icon X Offset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <SliderControl
                  label="Card Protrude Length (protrudeWidthPx)"
                  value={skipCfg.protrudeWidthPx}
                  min={24}
                  max={72}
                  step={1}
                  defaultValue={38}
                  unit="px"
                  colorScheme="emerald"
                  isLight={isLight}
                  onChange={(v) => updateSkipCfg({ protrudeWidthPx: v })}
                />

                <SliderControl
                  label="Under-Card Border Tuck (underlapPx)"
                  value={skipCfg.underlapPx}
                  min={0}
                  max={28}
                  step={1}
                  defaultValue={12}
                  unit="px"
                  colorScheme="emerald"
                  isLight={isLight}
                  onChange={(v) => updateSkipCfg({ underlapPx: v })}
                />

                <SliderControl
                  label="Outer Corner Radius (cardRadiusPx)"
                  value={skipCfg.cardRadiusPx}
                  min={0}
                  max={18}
                  step={1}
                  defaultValue={9}
                  unit="px"
                  colorScheme="neutral"
                  isLight={isLight}
                  onChange={(v) => updateSkipCfg({ cardRadiusPx: v })}
                />

                <SliderControl
                  label="Icon Horizontal Offset (iconOffsetXPx)"
                  value={skipCfg.iconOffsetXPx}
                  min={-12}
                  max={12}
                  step={1}
                   origin={0}
                  variation="centered"
                  unit="px"
                  colorScheme="neutral"
                  isLight={isLight}
                  onChange={(v) => updateSkipCfg({ iconOffsetXPx: v })}
                />
              </div>

              {/* Row 5: Push-Out Enter Duration, Retract Exit Duration, and SVG Glow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <SliderControl
                  label="Push-Out Enter Speed (enterDurationMs)"
                  value={skipCfg.enterDurationMs}
                  min={0}
                  max={500}
                  step={10}
                  defaultValue={220}
                  unit="ms"
                  colorScheme="sky"
                  isLight={isLight}
                  onChange={(v) => updateSkipCfg({ enterDurationMs: v })}
                />

                <div className="flex flex-col gap-1.5">
                  <SliderControl
                    label="Retract Exit Speed (exitDurationMs · 1-3 is 300ms)"
                    value={skipCfg.exitDurationMs}
                    min={0}
                    max={500}
                    step={10}
                    defaultValue={160}
                    unit="ms"
                    colorScheme="sky"
                    isLight={isLight}
                    onChange={(v) => updateSkipCfg({ exitDurationMs: v })}
                  />
                  <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                    {[
                      { ms: 120, label: '120ms Fast' },
                      { ms: 160, label: '160ms Default' },
                      { ms: 220, label: '220ms Medium' },
                      { ms: 300, label: '300ms (= 1-3)' },
                    ].map((p) => (
                      <button
                        key={p.ms}
                        type="button"
                        onClick={() => updateSkipCfg({ exitDurationMs: p.ms })}
                        className={`px-1.5 py-0.5 rounded border cursor-pointer transition-all ${
                          skipCfg.exitDurationMs === p.ms
                            ? 'bg-sky-500 text-neutral-950 border-sky-500 font-bold'
                            : 'border-neutral-400/40 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <SliderControl
                  label="SVG Glow Blur (glowBlurPx)"
                  value={skipCfg.glowBlurPx}
                  min={0}
                  max={20}
                  step={1}
                  defaultValue={6}
                  unit="px"
                  colorScheme="emerald"
                  isLight={isLight}
                  onChange={(v) => updateSkipCfg({ glowBlurPx: v })}
                />

                <SliderControl
                  label="SVG Glow Intensity (glowIntensityPct)"
                  value={skipCfg.glowIntensityPct}
                  min={0}
                  max={200}
                  step={5}
                  defaultValue={110}
                  unit="%"
                  colorScheme="emerald"
                  isLight={isLight}
                  onChange={(v) => updateSkipCfg({ glowIntensityPct: v })}
                />
              </div>

              {/* Row 6: Numbered Color Swatches + Custom Color Picker */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex-wrap">
                <span className="text-xs font-semibold">
                  Icon & Glow Color Scheme (Default = #2 Emerald `#10B981`):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {SKIP_COLOR_SWATCHES.map((sw) => (
                    <button
                      key={sw.hex}
                      type="button"
                      onClick={() => updateSkipCfg({ color: sw.hex, glowColor: sw.hex })}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-mono border cursor-pointer flex items-center gap-1.5 transition-all ${
                        skipCfg.color.toUpperCase() === sw.hex
                          ? 'ring-2 ring-emerald-500 font-bold'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ borderColor: `${sw.hex}88` }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: sw.hex }}
                      />
                      <span>{sw.label}</span>
                    </button>
                  ))}
                  <input
                    type="color"
                    value={skipCfg.color}
                    onChange={(e) =>
                      updateSkipCfg({ color: e.target.value, glowColor: e.target.value })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    title="Custom Color"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  });

EdgeSkipReplayInspectorSection.displayName = 'EdgeSkipReplayInspectorSection';
