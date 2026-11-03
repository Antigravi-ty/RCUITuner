import React, { useState, useCallback } from 'react';
import { RotateCcw, Copy, Check, Code2 } from 'lucide-react';
import { Badge } from '../../../ui-core/primitives/Badge';
import { CodeBlock } from '../../CodeBlock';
import { TakeoverVignetteTunerCard } from './TakeoverVignetteTunerCard';
import { TakeoverOffsetAndMotionCard } from './TakeoverOffsetAndMotionCard';
import { TakeoverGlowAndTypographyCards } from './TakeoverGlowAndTypographyCards';
import { useTakeoverSyncedState } from './useTakeoverSyncedState';

export interface TakeoverTunerSectionProps {
  isLight: boolean;
}

export const TakeoverTunerSection: React.FC<TakeoverTunerSectionProps> = ({
  isLight,
}) => {
  const {
    myTeamSide,
    setMyTeamSide,
    vignetteConfig,
    setVignetteConfig,
    alwaysPreviewVignette,
    setAlwaysPreviewVignette,
    glowConfig,
    setGlowConfig,
    syncGlowWithText,
    setSyncGlowWithText,
    timingConfig,
    setTimingConfig,
    typoConfig,
    setTypoConfig,
    countdownIntervalMs,
    setCountdownIntervalMs,
    bottomOffsetPx,
    setBottomOffsetPx,
    handleSetVisibleOnStage: setIsVisibleOnStage,
    setTriggerNonce,
    buildExportCode,
    handleResetDefaults,
  } = useTakeoverSyncedState();

  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [showExportedCode, setShowExportedCode] = useState<boolean>(false);

  const handleCopyConfig = useCallback(() => {
    const code = buildExportCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedConfig(true);
    window.setTimeout(() => setCopiedConfig(false), 1800);
  }, [buildExportCode]);
  return (
    <section id="takeover-tuner" className="grid grid-cols-1 lg:grid-cols-2 gap-5 scroll-mt-24">
      {/* Top Export & Solidify Default Parameters Bar across all columns */}
      <div
        className={`lg:col-span-2 p-4 rounded-2xl border flex flex-col gap-3 ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
            : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-md'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="amber" size="sm" isLight={isLight}>
              5G-2
            </Badge>
            <span className="text-sm font-bold font-mono">
              Takeover Parameter Tuner &amp; One-Click Config Exporter
            </span>
            <span className="text-xs font-mono opacity-65">
              Adjust seamless rounded-rect vignette (Independent X/Y depth, blur feather, corner radius, Bezier curve), team-colored `Takeover in...`, and bottom offset
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowExportedCode((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                showExportedCode
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-400 font-bold'
                  : isLight
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>{showExportedCode ? 'Collapse Parameter Code' : 'View Default Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyConfig}
              data-ui-action="export-takeover-config"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
                copiedConfig
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400'
              }`}
            >
              {copiedConfig ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied Takeover Config (Copied!)</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Takeover Config (Export Snapshot)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              title="Reset all Takeover parameters to calibrated defaults"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
                isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {showExportedCode && (
          <CodeBlock
            title="Current Takeover Parameter Snapshot (Seamless Rounded-Rect Vignette + Team Top Label + Bottom-Center Offset + Typography)"
            language="typescript"
            isLight={isLight}
            code={buildExportCode()}
          />
        )}
      </div>

      <TakeoverVignetteTunerCard
        isLight={isLight}
        vignetteConfig={vignetteConfig}
        setVignetteConfig={setVignetteConfig}
        alwaysPreviewVignette={alwaysPreviewVignette}
        setAlwaysPreviewVignette={setAlwaysPreviewVignette}
      />
      {/* Card 2: Bottom-Center Upward Offset + Motion Envelope Tuner */}
      <TakeoverOffsetAndMotionCard
        isLight={isLight}
        bottomOffsetPx={bottomOffsetPx}
        setBottomOffsetPx={setBottomOffsetPx}
        timingConfig={timingConfig}
        setTimingConfig={setTimingConfig}
        countdownIntervalMs={countdownIntervalMs}
        setCountdownIntervalMs={setCountdownIntervalMs}
        setIsVisibleOnStage={setIsVisibleOnStage}
        setTriggerNonce={setTriggerNonce}
      />

      {/* Cards 3 & 4: Team-Colored Top Label + Digit Glow + Typography Hierarchy */}
      <TakeoverGlowAndTypographyCards
        isLight={isLight}
        myTeamSide={myTeamSide}
        setMyTeamSide={setMyTeamSide}
        glowConfig={glowConfig}
        setGlowConfig={setGlowConfig}
        syncGlowWithText={syncGlowWithText}
        setSyncGlowWithText={setSyncGlowWithText}
        typoConfig={typoConfig}
        setTypoConfig={setTypoConfig}
        setIsVisibleOnStage={setIsVisibleOnStage}
      />
    </section>
  );
};
