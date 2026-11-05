import React, { useCallback, useState } from 'react';
import { Check, Code2, Copy, RotateCcw } from 'lucide-react';
import { Badge } from '../../../ui-core/primitives/Badge';
import { CodeBlock } from '../../CodeBlock';

export interface NameTagConfigExporterBarProps {
  isLight?: boolean;
  buildExportCode: () => string;
  onResetDefaults: () => void;
}

export const NameTagConfigExporterBar: React.FC<NameTagConfigExporterBarProps> = ({
  isLight = false,
  buildExportCode,
  onResetDefaults,
}) => {
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
    <div
      className={`p-4 rounded-2xl border flex flex-col gap-3 ${
        isLight
          ? 'bg-white border-neutral-200 text-neutral-900 shadow-xs'
          : 'bg-neutral-900/80 border-neutral-800 text-neutral-100 shadow-md'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="amber" size="sm" isLight={isLight}>
            5H-EXPORT
          </Badge>
          <span className="text-sm font-bold font-mono">
            Name Tag &amp; Boost Parameter Tuner &amp; One-Click Config Exporter
          </span>
          <span className="text-xs font-mono opacity-65">
            Exports only 5H NameTagConfig (Boost fill/unfilled opacity, pure black boost colors, 100% solid ball occlusion &amp; pill geometry)
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
            data-ui-action="export-5h-config"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border cursor-pointer transition-all ${
              copiedConfig
                ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400'
            }`}
          >
            {copiedConfig ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied 5H Config (Copied!)</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy 5H Name Tag Config (Export Snapshot)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onResetDefaults}
            title="Reset all 5H Name Tag & Stage parameters to calibrated defaults"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border cursor-pointer transition-all ${
              isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset 5H Defaults</span>
          </button>
        </div>
      </div>

      {showExportedCode && (
        <CodeBlock
          title="Current 5H Name Tag Parameter Snapshot (Paste directly into DEFAULT_NAME_TAG_CONFIG)"
          language="typescript"
          isLight={isLight}
          code={buildExportCode()}
        />
      )}
    </div>
  );
};
