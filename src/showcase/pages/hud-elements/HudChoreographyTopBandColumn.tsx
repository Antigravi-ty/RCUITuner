import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { useHudChoreographySandbox } from './HudChoreographySandboxContext';

export type FlipSimMode = 'auto-drain' | 'grounded' | 'multi-flip' | 'unlimited' | 'expired';
export type JumpPlacementOption = 'top-left' | 'center-bottom-right' | 'center-bottom-left';

export const HudChoreographyTopBandColumn: React.FC = () => {
  const {
    layoutStrategy,
    setLayoutStrategy,
    showTelemetryTopLeft,
    setShowTelemetryTopLeft,
    flipSimMode,
    onFlipSimModeChange,
    jumpPlacement,
    setJumpPlacement,
    showBallCam,
    setShowBallCam,
  } = useHudChoreographySandbox();

  return (
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
  );
};
