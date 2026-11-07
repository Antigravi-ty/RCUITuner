import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Layers,
  MessageSquare,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { quickNotification } from '../../../ui-core/stores/quickNotificationStore';
import {
  buildAllReviewUnits,
  pickRepresentativeTemplateStaleSamples,
} from './reviewLedgerAdapter';
import { ReviewBundleExporterModal } from './ReviewBundleExporterModal';
import { useReviewLedgerStore } from './reviewLedgerStore';
import type { ReviewTriageBucketId } from './reviewTypes';

export interface RapidReviewTriageBarProps {
  isLight?: boolean;
}

const BUCKET_META: Array<{
  id: 'all' | ReviewTriageBucketId;
  shortLabel: string;
  badgeDot: string;
  activeClass: string;
  title: string;
}> = [
  {
    id: 'all',
    shortLabel: 'All Units',
    badgeDot: '[ALL]',
    activeClass: 'bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 border-neutral-700',
    title: 'Show all discovered surface & variant review units',
  },
  {
    id: 'bucket-1-visual',
    shortLabel: 'Bucket 1 · Visual/New',
    badgeDot: '[B1]',
    activeClass: 'bg-rose-500 text-white border-rose-500',
    title: 'Bucket 1: Unreviewed new surfaces, visual-stale subtree AST changes, or rejected units needing rework',
  },
  {
    id: 'bucket-2-config',
    shortLabel: 'Bucket 2 · Config/Sizing',
    badgeDot: '[B2]',
    activeClass: 'bg-amber-500 text-neutral-950 border-amber-500',
    title: 'Bucket 2: Config/Sizing overrides or deferred hold items (JSX unchanged)',
  },
  {
    id: 'bucket-3-template',
    shortLabel: 'Bucket 3 · Template-Stale',
    badgeDot: '[B3]',
    activeClass: 'bg-purple-500 text-white border-purple-500',
    title: 'Bucket 3: Surfaces unchanged locally, flagged only because Workspace Alpha 3-Stage Shell template changed',
  },
];

export const RapidReviewTriageBar: React.FC<RapidReviewTriageBarProps> = React.memo(
  ({ isLight = false }) => {
    const {
      decisionsMap,
      registeredUnitsMap,
      activeUnitKey,
      activeBucketFilter,
      simulateTemplateStale,
      isExporterModalOpen,
      selectUnitByKey,
      setBucketFilter,
      setDecision,
      updateNote,
      stepQueue,
      batchApproveTemplateStale,
      setSimulateTemplateStale,
      setExporterModalOpen,
    } = useReviewLedgerStore();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const noteInputRef = useRef<HTMLInputElement | null>(null);

    const allUnits = useMemo(
      () =>
        buildAllReviewUnits({
          decisionsMap,
          registeredUnitsMap,
          globalTemplateStaleOverride: simulateTemplateStale,
        }),
      [decisionsMap, registeredUnitsMap, simulateTemplateStale]
    );

    const bucketCounts = useMemo(() => {
      const counts: Record<'all' | ReviewTriageBucketId, number> = {
        all: allUnits.length,
        'bucket-1-visual': 0,
        'bucket-2-config': 0,
        'bucket-3-template': 0,
        'reviewed-healthy': 0,
      };
      for (const u of allUnits) {
        counts[u.bucket] += 1;
      }
      return counts;
    }, [allUnits]);

    const filteredQueue = useMemo(() => {
      if (activeBucketFilter === 'all') return allUnits;
      return allUnits.filter((u) => u.bucket === activeBucketFilter);
    }, [allUnits, activeBucketFilter]);

    const activeUnit = useMemo(() => {
      return (
        allUnits.find((u) => u.unitKey === activeUnitKey) ||
        filteredQueue[0] ||
        allUnits[0]
      );
    }, [allUnits, filteredQueue, activeUnitKey]);

    const templateStaleSamples = useMemo(
      () => pickRepresentativeTemplateStaleSamples(allUnits),
      [allUnits]
    );

    // Keyboard shortcuts: A (Approve & next), R (Instant Reject & next), D (Defer & next), Space (Focus inline note)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)
        ) {
          if (e.key === 'Escape') {
            target.blur();
          }
          return;
        }

        if (!activeUnit) return;

        const keyLower = e.key.toLowerCase();
        if (keyLower === 'a') {
          e.preventDefault();
          const next = setDecision({
            unitKey: activeUnit.unitKey,
            status: 'approved',
            advanceToNext: true,
          });
          quickNotification.success(
            `Approved [${activeUnit.referenceCode}] ${activeUnit.label}${
              next ? ` → Next: ${next.label}` : ''
            }`
          );
        } else if (keyLower === 'r') {
          e.preventDefault();
          const next = setDecision({
            unitKey: activeUnit.unitKey,
            status: 'rejected',
            advanceToNext: true,
          });
          quickNotification.warning(
            `Rejected [${activeUnit.referenceCode}] ${activeUnit.label} (0-friction instant reject)${
              next ? ` → Next: ${next.label}` : ''
            }`
          );
        } else if (keyLower === 'd') {
          e.preventDefault();
          const next = setDecision({
            unitKey: activeUnit.unitKey,
            status: 'deferred',
            advanceToNext: true,
          });
          quickNotification.info(
            `Deferred [${activeUnit.referenceCode}] ${activeUnit.label}${
              next ? ` → Next: ${next.label}` : ''
            }`
          );
        } else if (e.key === ' ') {
          e.preventDefault();
          setIsCollapsed(false);
          window.setTimeout(() => {
            noteInputRef.current?.focus();
            noteInputRef.current?.select();
          }, 20);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeUnit, setDecision]);

    if (!activeUnit) return null;

    const currentQueueIdx = Math.max(
      0,
      filteredQueue.findIndex((u) => u.unitKey === activeUnit.unitKey)
    );

    return (
      <>
        <div
          className={`sticky bottom-0 z-30 border-t transition-all font-mono text-xs ${
            isLight
              ? 'bg-white/95 border-neutral-200 text-neutral-900 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]'
              : 'bg-neutral-950/95 border-neutral-800 text-neutral-100 shadow-[0_-4px_20px_rgba(0,0,0,0.45)]'
          } backdrop-blur-md`}
        >
          {/* Compact Top Strip (always visible) */}
          <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            {/* Left: 3-Bucket Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                BRAVO TRIAGE
              </span>

              {BUCKET_META.map((b) => {
                const isActive = activeBucketFilter === b.id;
                const count = bucketCounts[b.id];
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBucketFilter(b.id)}
                    title={b.title}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                      isActive
                        ? b.activeClass
                        : isLight
                        ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <span>{b.badgeDot}</span>
                    <span>{b.shortLabel}</span>
                    <span className="px-1 rounded text-[10px] bg-black/15 dark:bg-white/15">
                      {count}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSimulateTemplateStale(!simulateTemplateStale)}
                title="Simulate a Workspace Alpha 3-Stage Shell template edit to test Bucket 3 Spot-Check & 1-Click Batch Approve"
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] cursor-pointer transition-colors ${
                  simulateTemplateStale
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 font-bold'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="h-3 w-3 text-purple-400" />
                <span>
                  {simulateTemplateStale
                    ? 'Alpha Shell Drift: ON'
                    : 'Sim Alpha Shell Drift'}
                </span>
              </button>
            </div>

            {/* Right: Rapid Keyboard Actions (A / R / D) + Export Bundle + Collapse */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const next = setDecision({
                    unitKey: activeUnit.unitKey,
                    status: 'approved',
                    advanceToNext: true,
                  });
                  quickNotification.success(
                    `Approved [${activeUnit.referenceCode}] ${activeUnit.label}${
                      next ? ` → ${next.label}` : ''
                    }`
                  );
                }}
                title="Approve current unit & advance to next (Shortcut: A)"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${
                  activeUnit.status === 'approved'
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-500 border-emerald-500/35'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve [A]</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = setDecision({
                    unitKey: activeUnit.unitKey,
                    status: 'rejected',
                    advanceToNext: true,
                  });
                  quickNotification.warning(
                    `Rejected [${activeUnit.referenceCode}] ${activeUnit.label}${
                      next ? ` → ${next.label}` : ''
                    }`
                  );
                }}
                title="Instant Reject current unit & advance to next without mandatory note (Shortcut: R)"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${
                  activeUnit.status === 'rejected'
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border-rose-500/35'
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject [R]</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = setDecision({
                    unitKey: activeUnit.unitKey,
                    status: 'deferred',
                    advanceToNext: true,
                  });
                  quickNotification.info(
                    `Deferred [${activeUnit.referenceCode}] ${activeUnit.label}${
                      next ? ` → ${next.label}` : ''
                    }`
                  );
                }}
                title="Defer current unit to Hold queue & advance to next (Shortcut: D)"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${
                  activeUnit.status === 'deferred'
                    ? 'bg-amber-500 text-neutral-950 border-amber-400'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border-amber-500/35'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Defer [D]</span>
              </button>

              <button
                type="button"
                onClick={() => setExporterModalOpen(true)}
                title="Open Review Bundle Exporter with Alpha ⇄ Bravo Root-Cause Attribution"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 cursor-pointer transition-all active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Review Bundle</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCollapsed((v) => !v)}
                className={`p-1 rounded-lg border cursor-pointer ${
                  isLight
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                }`}
                title={isCollapsed ? 'Expand Triage Details' : 'Collapse Triage Details'}
              >
                {isCollapsed ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Second Row: Active Unit Stepper + Inline 1-Sentence Note + Bucket 3 Spot-Check Batch Approve */}
          {!isCollapsed && (
            <div
              className={`px-4 py-2 border-t flex flex-wrap items-center justify-between gap-2.5 ${
                isLight
                  ? 'bg-neutral-50/90 border-neutral-200/80'
                  : 'bg-neutral-900/60 border-neutral-800/80'
              }`}
            >
              {/* Active Unit Queue Stepper */}
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => stepQueue(-1)}
                  className={`p-1 rounded-lg border cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                      : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800'
                  }`}
                  title="Previous unit in active bucket"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => stepQueue(1)}
                  className={`p-1 rounded-lg border cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-200'
                      : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800'
                  }`}
                  title="Next unit in active bucket"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <span className="text-[11px] font-bold truncate max-w-[280px]">
                  [{currentQueueIdx + 1}/{Math.max(1, filteredQueue.length)}]{' '}
                  [{activeUnit.referenceCode}] {activeUnit.label}
                </span>

                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border truncate max-w-[220px] ${
                    isLight
                      ? 'bg-white border-neutral-200 text-neutral-600'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                  title={activeUnit.unitKey}
                >
                  {activeUnit.unitKey}
                </span>
              </div>

              {/* Inline 1-Sentence Comment Input (Shortcut: Space) */}
              <div className="flex items-center gap-1.5 flex-1 min-w-[240px] max-w-md">
                <MessageSquare className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <input
                  ref={noteInputRef}
                  type="text"
                  value={activeUnit.note}
                  onChange={(e) => updateNote(activeUnit.unitKey, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                      quickNotification.success(
                        `Saved note for [${activeUnit.referenceCode}] ${activeUnit.label}`
                      );
                    }
                  }}
                  placeholder="Press [Space] to type optional 1-line triage note (Enter to save)..."
                  className={`w-full px-2.5 py-1 rounded-lg border text-[11px] font-mono outline-none transition-colors ${
                    isLight
                      ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900 placeholder:text-neutral-400'
                      : 'bg-neutral-950 border-neutral-800 focus:border-amber-500 text-neutral-100 placeholder:text-neutral-500'
                  }`}
                />
              </div>

              {/* Bucket 3 Spot-Check 3 Representative Surfaces + 1-Click Batch Approve */}
              {bucketCounts['bucket-3-template'] > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-purple-400 font-bold">
                    Spot-Check 3 Samples (Simplest/Med/Dense):
                  </span>
                  {templateStaleSamples.map((sample, idx) => {
                    const rankTag =
                      idx === 0 ? 'Min' : idx === 1 ? 'Med' : 'Max';
                    return (
                      <button
                        key={sample.unitKey}
                        type="button"
                        onClick={() => selectUnitByKey(sample.unitKey)}
                        className={`px-1.5 py-0.5 rounded border text-[10px] cursor-pointer transition-colors ${
                          activeUnit.unitKey === sample.unitKey
                            ? 'bg-purple-500 text-white border-purple-400 font-bold'
                            : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}
                        title={`Inspect ${rankTag} density sample: ${sample.label} (${
                          Object.keys(sample.ledgerRecord?.fileVisualHashes || {}).length
                        } visual files)`}
                      >
                        {rankTag}:{sample.componentName.replace(/(FloatingWindow|Recipe)$/, '')}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      const count = batchApproveTemplateStale();
                      quickNotification.success(
                        `Batch Approved all ${count} template-stale surfaces after spot-check!`
                      );
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-[11px] font-bold cursor-pointer transition-all active:scale-95"
                    title="Batch Approve all Bucket 3 (template-stale) surfaces in 1 click"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      Batch Approve All {bucketCounts['bucket-3-template']} Template-Stale
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <ReviewBundleExporterModal
          isOpen={isExporterModalOpen}
          onClose={() => setExporterModalOpen(false)}
          units={allUnits}
          isLight={isLight}
        />
      </>
    );
  }
);

RapidReviewTriageBar.displayName = 'RapidReviewTriageBar';
