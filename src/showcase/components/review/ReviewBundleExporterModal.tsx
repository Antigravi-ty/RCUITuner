import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileJson,
  FileText,
  Layers,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { CodeBlock } from '../../CodeBlock';
import { quickNotification } from '../../../ui-core/stores/quickNotificationStore';
import {
  buildReviewBundlePayload,
  formatReviewBundleMarkdown,
} from './alphaBravoRootCauseTriage';
import { useReviewLedgerStore } from './reviewLedgerStore';
import type { SurfaceVariantReviewUnit } from './reviewTypes';

export interface ReviewBundleExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: SurfaceVariantReviewUnit[];
  isLight?: boolean;
}

export const ReviewBundleExporterModal: React.FC<ReviewBundleExporterModalProps> = ({
  isOpen,
  onClose,
  units,
  isLight = false,
}) => {
  const { decisionsMap, resetRuntimeDecisions } = useReviewLedgerStore();
  const [formatMode, setFormatMode] = useState<'markdown' | 'json'>('markdown');
  const [copiedBundle, setCopiedBundle] = useState(false);

  const payload = useMemo(
    () => buildReviewBundlePayload({ units, decisionsMap }),
    [units, decisionsMap]
  );

  const exportText = useMemo(() => {
    if (formatMode === 'json') {
      return JSON.stringify(payload, null, 2);
    }
    return formatReviewBundleMarkdown(payload, units);
  }, [formatMode, payload, units]);

  if (!isOpen) return null;

  const handleCopyBundle = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(exportText).catch(() => {});
    }
    setCopiedBundle(true);
    window.setTimeout(() => setCopiedBundle(false), 2000);
    quickNotification.success(
      `Copied Review Bundle (${formatMode.toUpperCase()}) with Alpha ⇄ Bravo Root-Cause Diagnosis!`
    );
  };

  const alphaSystemicClusters = payload.rootCauseRecommendations.filter(
    (c) => c.verdict === 'fix-alpha-mother'
  );
  const bravoLocalClusters = payload.rootCauseRecommendations.filter(
    (c) => c.verdict === 'fix-bravo-surface-locally'
  );

  return (
    <div
      className="fixed inset-0 z-[650] flex items-center justify-center p-4 md:p-6 bg-black/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-4xl max-h-[86vh] rounded-2xl border flex flex-col overflow-hidden shadow-2xl ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-900'
            : 'bg-neutral-950 border-neutral-800 text-neutral-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 shrink-0 ${
            isLight
              ? 'bg-neutral-50 border-neutral-200'
              : 'bg-neutral-900/90 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              ALPHA ⇄ BRAVO TRIAGE EXPORTER
            </span>
            <h3 className="text-sm font-bold font-mono">
              Review Bundle &amp; Root-Cause Attribution Report
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
            title="Close Review Bundle Exporter (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 flex-1 min-h-0 text-xs font-mono">
          {/* Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${
                isLight
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              }`}
            >
              <span className="text-[10px] opacity-75">APPROVED</span>
              <span className="text-base font-bold">
                {payload.summary.approvedCount} / {payload.summary.totalUnits}
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${
                isLight
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
              }`}
            >
              <span className="text-[10px] opacity-75">REJECTED (REWORK)</span>
              <span className="text-base font-bold">{payload.summary.rejectedCount}</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${
                isLight
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
              }`}
            >
              <span className="text-[10px] opacity-75">DEFERRED (HOLD)</span>
              <span className="text-base font-bold">{payload.summary.deferredCount}</span>
            </div>
            <div
              className={`p-2.5 rounded-xl border flex flex-col gap-0.5 ${
                isLight
                  ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                  : 'bg-purple-500/10 border-purple-500/25 text-purple-300'
              }`}
            >
              <span className="text-[10px] opacity-75">3-BUCKET QUEUE</span>
              <span className="text-xs font-bold">
                B1:{payload.summary.bucket1VisualCount} · B2:{payload.summary.bucket2ConfigCount} · B3:{payload.summary.bucket3TemplateCount}
              </span>
            </div>
          </div>

          {/* Root-Cause Triage Recommendation Box */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${
              alphaSystemicClusters.length > 0
                ? isLight
                  ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                  : 'bg-rose-950/30 border-rose-500/35 text-rose-200'
                : isLight
                ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
                : 'bg-neutral-900/70 border-neutral-800 text-neutral-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold">
                {alphaSystemicClusters.length > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                ) : (
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                )}
                <span>[Root-Cause Triage Recommendation] (Alpha ⇄ Bravo Auto-Clustering)</span>
              </div>
              <span className="text-[10px] opacity-75">
                Computed from AST `alphaDeps` &amp; `fileVisualHashes` closure
              </span>
            </div>

            {payload.rootCauseRecommendations.length === 0 ? (
              <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>
                  All inspected units are healthy. No rejected surface dependencies require Alpha vs Bravo disambiguation.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {alphaSystemicClusters.map((cluster) => (
                  <div
                    key={cluster.alphaDep}
                    className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
                      isLight
                        ? 'bg-white border-rose-300'
                        : 'bg-neutral-950/90 border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-rose-500">
                        🚨 Fix Workspace Alpha Mother First: {cluster.shortName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500 font-bold">
                        {cluster.rejectedUnits.length} Rejected / {cluster.totalUnitsUsingDep} Total Surfaces
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {cluster.recommendation}
                    </p>
                  </div>
                ))}

                {bravoLocalClusters.slice(0, 4).map((cluster) => (
                  <div
                    key={cluster.alphaDep}
                    className={`p-2.5 rounded-lg border flex flex-col gap-1 ${
                      isLight
                        ? 'bg-white border-neutral-200'
                        : 'bg-neutral-950/80 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold text-sky-500">
                        🎯 Alpha Mother Healthy ({cluster.shortName}) → Fix Bravo Locally
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold">
                        {cluster.approvedUnits.length} Approved Sibling Surfaces
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      {cluster.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Format Switcher + Copy Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFormatMode('markdown')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                  formatMode === 'markdown'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Agent Diagnosis Markdown</span>
              </button>
              <button
                type="button"
                onClick={() => setFormatMode('json')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                  formatMode === 'json'
                    ? 'bg-amber-500 text-neutral-950 border-amber-500'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                }`}
              >
                <FileJson className="h-3.5 w-3.5" />
                <span>JSON Ledger Bundle</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetRuntimeDecisions();
                  quickNotification.info('Cleared runtime review session overrides.');
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Session Decisions</span>
              </button>

              <button
                type="button"
                onClick={handleCopyBundle}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                  copiedBundle
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                    : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400'
                }`}
              >
                {copiedBundle ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Bundle Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Review Bundle for Agent</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <CodeBlock
            title={
              formatMode === 'markdown'
                ? 'Workspace Bravo Review Bundle (Markdown with Alpha ⇄ Bravo Root-Cause Triage)'
                : 'Workspace Bravo Review Bundle (JSON Payload + uiApprovalLedger.json Patch)'
            }
            language={formatMode === 'markdown' ? 'markdown' : 'json'}
            isLight={isLight}
            code={exportText}
          />
        </div>
      </div>
    </div>
  );
};
