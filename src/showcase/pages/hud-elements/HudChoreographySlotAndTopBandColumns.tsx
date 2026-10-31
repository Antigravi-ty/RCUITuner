import React from 'react';
import {
  Tv, UserCheck, Play, Video,
  EyeOff, ShieldAlert, LayoutGrid, ArrowLeftRight,
  CheckSquare, Square,
} from 'lucide-react';
import type { EdgeDemoIndicatorConfig, EdgeSkipIndicatorConfig, HudRosterViewMode } from '../../../ui-core/stores/hudTransientTypes';
import { BombEmojiSvg, ReplaySkipCheckSvg } from '../../../ui-core/primitives/packagedSvgIcons';
import type { HudLayoutStrategy } from '../../../ui-core/layout/HudAnchorStage';

export type FlipSimMode = 'auto-drain' | 'grounded' | 'multi-flip' | 'unlimited' | 'expired';
export type JumpPlacementOption = 'top-left' | 'center-bottom-right' | 'center-bottom-left';

export interface HudChoreographySlotAndTopBandColumnsProps {
  isMyTeamOrange: boolean;
  handleToggleTeamSide: () => void;
  viewMode: HudRosterViewMode;
  handleModeChange: (mode: HudRosterViewMode) => void;
  slotExists: Record<1 | 2 | 3 | 4 | 5 | 6, boolean>;
  handleToggleSlotExists: (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => void;
  replaySkipReady?: Record<1 | 2 | 3 | 4 | 5 | 6, boolean>;
  handleToggleReplaySkipReady?: (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => void;
  skipIndicatorConfig?: EdgeSkipIndicatorConfig;
  onUpdateSkipIndicatorConfig?: (patch: Partial<EdgeSkipIndicatorConfig>) => void;
  handleApplyTeamSizePreset: (leftCount: 1 | 2 | 3, rightCount: 1 | 2 | 3) => void;
  focusedSlot: 1 | 2 | 3 | 4 | 5 | 6 | null;
  handleSelectPov: (slot: 1 | 2 | 3 | 4 | 5 | 6 | null) => void;
  handleTriggerDemo: (slotKey: 1 | 2 | 3 | 4 | 5 | 6) => void;
  opponentDemoCompact: boolean;
  handleToggleOpponentDemoCompact: () => void;
  persistentDemo: boolean;
  onTogglePersistentDemo?: () => void;
  demoIndicatorConfig: EdgeDemoIndicatorConfig;
  onUpdateDemoIndicatorConfig?: (patch: Partial<EdgeDemoIndicatorConfig>) => void;
  layoutStrategy: HudLayoutStrategy;
  setLayoutStrategy: React.Dispatch<React.SetStateAction<HudLayoutStrategy>>;
  showTelemetryTopLeft: boolean;
  setShowTelemetryTopLeft: React.Dispatch<React.SetStateAction<boolean>>;
  flipSimMode: FlipSimMode;
  onFlipSimModeChange: (mode: FlipSimMode) => void;
  jumpPlacement: JumpPlacementOption;
  setJumpPlacement: React.Dispatch<React.SetStateAction<JumpPlacementOption>>;
  showBallCam: boolean;
  setShowBallCam: React.Dispatch<React.SetStateAction<boolean>>;
}

export const HudChoreographySlotAndTopBandColumns: React.FC<
  HudChoreographySlotAndTopBandColumnsProps
> = ({
  isMyTeamOrange, handleToggleTeamSide, viewMode, handleModeChange,
  slotExists, handleToggleSlotExists, replaySkipReady, handleToggleReplaySkipReady,
  skipIndicatorConfig, onUpdateSkipIndicatorConfig,
  handleApplyTeamSizePreset, focusedSlot, handleSelectPov, handleTriggerDemo,
  opponentDemoCompact, handleToggleOpponentDemoCompact, persistentDemo,
  onTogglePersistentDemo, demoIndicatorConfig, onUpdateDemoIndicatorConfig,
  layoutStrategy, setLayoutStrategy, showTelemetryTopLeft, setShowTelemetryTopLeft,
  flipSimMode, onFlipSimModeChange, jumpPlacement, setJumpPlacement,
  showBallCam, setShowBallCam,
}) => {
  return (
    <>
      {/* Column 2: 3v3 Edge Strips, Switch Side, 6 Player Exist Checkboxes & Demo Controls */}
      <div className="flex flex-col gap-2 pr-0 lg:pr-3 lg:border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="text-xs font-bold font-mono flex items-center gap-1.5">
            <Tv className="h-3.5 w-3.5 text-sky-500" />
            <span>2. Player Bar (internal1-3 / Peer4-6) &amp; Faction/Player Count</span>
          </span>

          {/* Switch Side Button */}
          <button type="button" onClick={handleToggleTeamSide}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold cursor-pointer flex items-center gap-1 transition-all shadow-2xs ${
            isMyTeamOrange ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white' }`}
            title="Toggle friendly team color (Switch Side): Player always on the left 1-2-3, Opponent always on the right 4-5-6">
            <ArrowLeftRight className="h-3 w-3" />
            <span>Switch Side: internal{isMyTeamOrange ? 'Orange Team(1-3)' : 'Blue Team(1-3)'}</span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleModeChange('player-live')}
            className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
              viewMode === 'player-live'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'border border-neutral-400/40 hover:bg-neutral-500/10'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5 inline mr-1" />
            Player Live (hidden1-3Key Hint &amp; 4-6)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('goal-replay')}
            className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
              viewMode === 'goal-replay'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-xs'
                : 'border border-neutral-400/40 hover:bg-neutral-500/10'
            }`}
          >
            <Play className="h-3.5 w-3.5 inline mr-1" />
            Goal Replay (Visible1-6)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('spectator')}
            className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
              viewMode === 'spectator'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'border border-neutral-400/40 hover:bg-neutral-500/10'
            }`}
          >
            <Video className="h-3.5 w-3.5 inline mr-1" />
            Spectator (Spectate1-6)
          </button>
        </div>

        {/* 6 Checkboxes for Player Exist (My Team 1-2-3 & Opponent Team 4-5-6) + Quick Format Presets */}
        <div className="flex flex-col gap-1.5 p-2 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/40 text-xs font-mono">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <span className="text-[10px] opacity-75">Player Exist (Home (Left) 1-3 · Away (Right) 4-6):</span>
            <div className="flex items-center gap-1">
              {(
                [
                  { label: '1v1', l: 1, r: 1 },
                  { label: '2v2', l: 2, r: 2 },
                  { label: '1v3', l: 1, r: 3 },
                  { label: '2v1', l: 2, r: 1 },
                  { label: '3v3', l: 3, r: 3 },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyTeamSizePreset(preset.l, preset.r)}
                  className="px-1.5 py-0.2 rounded text-[10px] border border-neutral-400/40 hover:bg-neutral-500/15 cursor-pointer"
                  title={`Quick match player count ${preset.label}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* My Team 1-3 Checkboxes */}
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold px-1 rounded ${
                isMyTeamOrange ? 'text-orange-500' : 'text-blue-500' }`}>
                internal:
              </span>
              {([1, 2, 3] as const).map((k) => {
                const checked = slotExists[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleToggleSlotExists(k)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer border transition-all ${
                      checked
                        ? isMyTeamOrange
                          ? 'bg-orange-500/15 border-orange-500/60 text-orange-600 dark:text-orange-400'
                          : 'bg-blue-500/15 border-blue-500/60 text-blue-600 dark:text-blue-400'
                        : 'border-neutral-400/30 opacity-45'
                    }`}
                  >
                    {checked ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                    <span>#{k}</span>
                  </button>
                );
              })}
            </div>

            {/* Opponent Team 4-6 Checkboxes */}
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold px-1 rounded ${
                isMyTeamOrange ? 'text-blue-500' : 'text-orange-500' }`}>
                Peer:
              </span>
              {([4, 5, 6] as const).map((k) => {
                const checked = slotExists[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleToggleSlotExists(k)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer border transition-all ${
                      checked
                        ? isMyTeamOrange
                          ? 'bg-blue-500/15 border-blue-500/60 text-blue-600 dark:text-blue-400'
                          : 'bg-orange-500/15 border-orange-500/60 text-orange-600 dark:text-orange-400'
                        : 'border-neutral-400/30 opacity-45'
                    }`}
                  >
                    {checked ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                    <span>#{k}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Checkboxes for Skip Replay / Ready (Half-Rounded Check Card) */}
          {handleToggleReplaySkipReady && (
            <div className="flex flex-col gap-1.5 pt-1 border-t border-neutral-200/70 dark:border-neutral-800">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  {skipIndicatorConfig && (
                    <ReplaySkipCheckSvg
                      size={Math.min(16, Math.max(11, skipIndicatorConfig.sizePx || 16))}
                      color={skipIndicatorConfig.color}
                      strokeWidth={skipIndicatorConfig.strokeWidth}
                      glowColor={skipIndicatorConfig.glowColor}
                      glowBlurPx={skipIndicatorConfig.glowBlurPx}
                      glowIntensityPct={skipIndicatorConfig.glowIntensityPct}
                    />
                  )}
                  <span>Skip Replay / Ready (Half-Rounded Check Card):</span>
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {([1, 2, 3, 4, 5, 6] as const).map((k) => {
                    const checked = Boolean(replaySkipReady?.[k]);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleToggleReplaySkipReady(k)}
                        title={`Toggle Skip Goal Replay / Ready indicator for Player #${k}`}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer border transition-all ${
                          checked
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-2xs'
                            : 'border-neutral-400/30 opacity-55 hover:opacity-100'
                        }`}
                      >
                        {checked ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                        <span>#{k}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {skipIndicatorConfig && onUpdateSkipIndicatorConfig && (
                <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
                  <label className="flex items-center gap-1" title="Adjust Skip Checkmark SVG size (10px ~ 24px)">
                    <span className="opacity-75">size:</span>
                    <input type="range" min={10} max={24} step={1} value={skipIndicatorConfig.sizePx}
                      onChange={(e) => onUpdateSkipIndicatorConfig({ sizePx: Number(e.target.value) })}
                      className="w-12 accent-emerald-500 cursor-pointer" />
                    <span className="tabular-nums font-bold">{skipIndicatorConfig.sizePx}px</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="opacity-75">weight:</span>
                    <input type="range" min={1.5} max={3.8} step={0.1} value={skipIndicatorConfig.strokeWidth}
                      onChange={(e) => onUpdateSkipIndicatorConfig({ strokeWidth: Number(e.target.value) })}
                      className="w-12 accent-emerald-500 cursor-pointer" />
                    <span className="tabular-nums font-bold">{skipIndicatorConfig.strokeWidth.toFixed(1)}</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="opacity-75">Glow:</span>
                    <input type="range" min={0} max={14} step={1} value={skipIndicatorConfig.glowBlurPx}
                      onChange={(e) => onUpdateSkipIndicatorConfig({ glowBlurPx: Number(e.target.value) })}
                      className="w-12 accent-emerald-500 cursor-pointer" />
                    <span className="tabular-nums font-bold">{skipIndicatorConfig.glowBlurPx}px</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {(['#22C55E', '#10B981', '#84CC16', '#38BDF8', '#FFFFFF'] as const).map((hex) => (
                      <button key={hex} type="button" onClick={() => onUpdateSkipIndicatorConfig({ color: hex, glowColor: hex })}
                        title={`Check SVG Color & Glow: ${hex}`}
                        className={`w-3.5 h-3.5 rounded-full cursor-pointer border transition-transform ${
                          skipIndicatorConfig.color.toUpperCase() === hex ? 'scale-125 border-white ring-1 ring-emerald-500' : 'border-black/30 opacity-80 hover:opacity-100'
                        }`} style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* POV & All 1-6 Demolish Triggers + Opponent Demo Auto-Reorder */}
        <div className="flex items-center justify-between gap-1 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="text-[11px] opacity-70">POV:</span>
            {([1, 2, 3, 4, 5, 6] as const).map((k) => {
              if (!slotExists[k]) return null;
              const isSelected = focusedSlot === k;
              const activeColor =
                k <= 3
                  ? isMyTeamOrange
                    ? 'bg-orange-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isMyTeamOrange
                  ? 'bg-blue-600 text-white'
                  : 'bg-orange-600 text-white';
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleSelectPov(k)}
                  className={`w-5 h-5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                    isSelected
                      ? activeColor
                      : 'border border-neutral-400/40 opacity-75 hover:opacity-100'
                  }`}
                >
                  {k}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleSelectPov(null)}
              title="Empty POV (Free Cam): in Spectator Apply Instantly(0ms)Hide bottom dashboard, Immediately when reselecting player(0ms)restore"
              className={`px-1.5 h-5 rounded text-[11px] font-bold cursor-pointer transition-all flex items-center gap-0.5 ${
                focusedSlot === null
                  ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-950'
                  : 'border border-neutral-400/40 opacity-75 hover:opacity-100'
              }`}
            >
              <EyeOff className="h-3 w-3" />
              <span>Empty(0ms hidden)</span>
            </button>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-red-500 font-semibold flex items-center gap-0.5">
              <ShieldAlert className="h-3 w-3" />
              Explosion:
            </span>
            {([1, 2, 3, 4, 5, 6] as const).map((k) => {
              if (!slotExists[k]) return null;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleTriggerDemo(k)}
                  className="px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer text-[10px]"
                  title={`trigger #${k} Blasted (3.0s Progress Bar)`}
                >
                  #{k}
                </button>
              );
            })}
            <button type="button" onClick={handleToggleOpponentDemoCompact}
              className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer border transition-colors ${
              opponentDemoCompact ? 'bg-red-500 text-white border-red-500 font-bold'
              : 'border-neutral-400/40 opacity-75' }`}
              title="Player Live On Opponent(4-6)Auto-spawn from right side after explosion1Compact vertical row arrangement (FIFO Auto-Reorder)">
              Top Enemy Blast:{opponentDemoCompact ? 'On' : 'Original Position'}
            </button>
            {onTogglePersistentDemo && (
              <button type="button" onClick={onTogglePersistentDemo}
                className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer border transition-colors ${
                persistentDemo ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold shadow-2xs'
                : 'border-neutral-400/40 opacity-75 hover:opacity-100' }`}
                title="Enable explosion persistence (Permanent Blasted State) : Blown-up slot will not 3.0s Auto-hide After, Facilitate continuous observation and tuning (Click Again #1~#6 Independent Toggle) ">
                Permanent Explosion:{persistentDemo ? 'On(Persistent)' : 'Off(3s)'}
              </button>
            )}
          </div>
        </div>

        {/* Demolish Effect / Icon Selector */}
        {onUpdateDemoIndicatorConfig && (
          <div className="flex flex-col gap-1.5 p-2 rounded-xl border border-red-500/25 bg-red-500/5 text-xs font-mono">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold flex items-center gap-1 text-red-500">
                <BombEmojiSvg
                  size={Math.min(18, Math.max(11, demoIndicatorConfig.sizePx || 16))}
                  color={demoIndicatorConfig.color}
                  strokeWidth={demoIndicatorConfig.strokeWidth}
                  glowColor={demoIndicatorConfig.glowColor}
                  glowBlurPx={demoIndicatorConfig.glowBlurPx}
                  glowIntensityPct={demoIndicatorConfig.glowIntensityPct}
                />
                <span>Blown-up gray indicator (`#3F3F46`):</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateDemoIndicatorConfig({ variant: 'bomb-svg' })}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer flex items-center gap-1 transition-all ${
                    demoIndicatorConfig.variant === 'bomb-svg'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'border border-neutral-400/40 opacity-80'
                  }`}
                >
                  <BombEmojiSvg size={11} color="currentColor" strokeWidth={2} />
                  <span>Bomb SVG</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateDemoIndicatorConfig({ variant: 'cross' })}
                  className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-all ${
                    demoIndicatorConfig.variant === 'cross'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'border border-neutral-400/40 opacity-80'
                  }`}
                >
                  x Classic Red X
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
              <label className="flex items-center gap-1" title="Adjust Explosion SVG / Pixel size of red cross (10px ~ 28px)">
                <span className="opacity-75">size:</span>
                <input type="range" min={10} max={28} step={1} value={demoIndicatorConfig.sizePx || 16}
                  onChange={(e) => onUpdateDemoIndicatorConfig({ sizePx: Number(e.target.value) }) }
                  className="w-14 accent-red-500 cursor-pointer" />
                <input type="number" min={8} max={32} step={1} value={demoIndicatorConfig.sizePx || 16}
                  onChange={(e) => { const v = Number(e.target.value); if (!Number.isNaN(v) && v >= 8 && v <= 36) {
                  onUpdateDemoIndicatorConfig({ sizePx: v }); } }}
                  className="w-10 px-1 py-0.2 rounded border border-red-500/30 bg-transparent text-center font-bold tabular-nums" />
                <span className="opacity-70">px</span>
              </label>

              <label className="flex items-center gap-1">
                <span className="opacity-75">weight:</span>
                <input type="range" min={1.0} max={3.0} step={0.1} value={demoIndicatorConfig.strokeWidth}
                  onChange={(e) => onUpdateDemoIndicatorConfig({ strokeWidth: Number(e.target.value) }) }
                  className="w-12 accent-red-500 cursor-pointer" />
                <span className="tabular-nums font-bold">{demoIndicatorConfig.strokeWidth.toFixed(1)}</span>
              </label>

              <label className="flex items-center gap-1">
                <span className="opacity-75">Glow:</span>
                <input type="range" min={0} max={14} step={1} value={demoIndicatorConfig.glowBlurPx}
                  onChange={(e) => onUpdateDemoIndicatorConfig({ glowBlurPx: Number(e.target.value) }) }
                  className="w-12 accent-red-500 cursor-pointer" />
                <span className="tabular-nums font-bold">{demoIndicatorConfig.glowBlurPx}px</span>
              </label>

              <div className="flex items-center gap-1">
                {(
                  [
                    { hex: '#EF4444', label: 'red' },
                    { hex: '#F97316', label: 'Orange' },
                    { hex: '#FACC15', label: 'Yellow' },
                    { hex: '#38BDF8', label: 'Cyan' },
                    { hex: '#FFFFFF', label: 'White' },
                  ] as const
                ).map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() =>
                      onUpdateDemoIndicatorConfig({ color: sw.hex, glowColor: sw.hex })
                    }
                    title={`color & Glow: ${sw.label} (${sw.hex})`}
                    className={`w-3.5 h-3.5 rounded-full cursor-pointer border transition-transform ${
                      demoIndicatorConfig.color.toUpperCase() === sw.hex
                        ? 'scale-125 border-white ring-1 ring-red-500'
                        : 'border-black/30 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: sw.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column 3: Top Split Band (Telemetry), Second Flip & Slot Reflow Strategy */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold font-mono flex items-center gap-1.5">
          <LayoutGrid className="h-3.5 w-3.5 text-emerald-500" />
          <span>3. Top bar equal three-way split (`HudTopSplitBand`) &amp; Bottom Gauge</span>
        </span>

        {/* Layout Strategy Switcher */}
        <div className="flex items-center justify-between gap-1 flex-wrap text-xs font-mono">
          <span className="text-[11px] opacity-75">Top bar hidden placeholder strategy:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setLayoutStrategy('reserve')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                layoutStrategy === 'reserve'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40 opacity-85 hover:opacity-100'
              }`}
              title="Fixed Placeholder (Reserved): top bar 56px Always Keep, 1-3 and 4-6 Position locked"
            >
              Fixed Placeholder (recommended)
            </button>
            <button
              type="button"
              onClick={() => setLayoutStrategy('collapse-local')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                layoutStrategy === 'collapse-local'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40 opacity-85 hover:opacity-100'
              }`}
              title="Partial Flow: Hide Top-Left Telemetry Left Column Only 1-3 Auto-move Up"
            >
              Partial Flow
            </button>
            <button
              type="button"
              onClick={() => setLayoutStrategy('collapse-symmetric')}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                layoutStrategy === 'collapse-symmetric'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40 opacity-85 hover:opacity-100'
              }`}
              title="Symmetrical Flow: When Top-Left Telemetry Hidden, 1-3 and 4-6 Sync Move Up"
            >
              Symmetrical Flow
            </button>
          </div>
        </div>

        {/* Top Split Band Controls: Telemetry (Left) */}
        <div className="flex items-center justify-between text-xs font-mono gap-1 flex-wrap">
          <span className="text-[11px] opacity-75">top bar 56px Diagnostic Area:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setShowTelemetryTopLeft((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer transition-colors ${
                showTelemetryTopLeft
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40'
              }`}
            >
              top left Telemetry:{showTelemetryTopLeft ? 'Show' : 'hidden'}
            </button>
          </div>
        </div>

        {/* Second Flip Indicator 150-Step (120Hz) State Controls */}
        <div className="flex items-center justify-between gap-1 flex-wrap text-xs font-mono">
          <span className="text-[11px] opacity-75">Second Flip (1.25s/150Step):</span>
          <div className="flex items-center gap-1 flex-wrap">
            {(
              [
                { key: 'auto-drain', label: '150Step Decrement' },
                { key: 'grounded', label: 'Ground Fill' },
                { key: 'multi-flip', label: 'Multi(×2)' },
                { key: 'unlimited', label: 'Unlimited(∞)' },
                { key: 'expired', label: 'No Flip(0)' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onFlipSimModeChange(item.key)}
                className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                  flipSimMode === item.key
                    ? 'bg-emerald-500 text-neutral-950 font-bold'
                    : 'border border-neutral-400/40 opacity-80 hover:opacity-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flip Placement & BallCam */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[11px] opacity-75">Flip Align / BallCam:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() =>
                setJumpPlacement((p) =>
                  p === 'top-left'
                    ? 'center-bottom-right'
                    : p === 'center-bottom-right'
                    ? 'center-bottom-left'
                    : 'top-left'
                )
              }
              className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer"
              title="Toggle FlipIndicator Docking orientation relative to bottom speedometer (default: Left-aligned above speedometer) "
            >
              Flip:{jumpPlacement === 'top-left' ? 'Top-Left Aligned' : jumpPlacement === 'center-bottom-right' ? 'right' : 'left'}
            </button>
            <button
              type="button"
              onClick={() => setShowBallCam((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                showBallCam ? 'bg-red-500 text-white font-bold' : 'border border-neutral-400/40'
              }`}
            >
              BallCam:{showBallCam ? 'Show' : 'hidden'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
