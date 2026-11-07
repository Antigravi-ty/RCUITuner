import { UI_APPROVAL_LEDGER } from '../../../ui-core/manifest/surfaceCalibration';
import type {
  AlphaRootCauseCluster,
  ReviewBundleExportPayload,
  RuntimeReviewDecision,
  SurfaceVariantReviewUnit,
} from './reviewTypes';

function classifyAlphaDepCategory(
  depPath: string
): AlphaRootCauseCluster['category'] {
  if (depPath.startsWith('src/ui-core/layout/')) return 'alpha-shell';
  if (depPath.startsWith('src/ui-core/primitives/')) return 'alpha-primitive';
  if (depPath.startsWith('src/ui-core/compounds/')) return 'alpha-compound';
  if (depPath.startsWith('src/ui-core/charts/')) return 'alpha-chart';
  return 'alpha-store-config';
}

function formatAlphaShortName(depPath: string): string {
  const file = depPath.split('/').pop() || depPath;
  const stem = file.replace(/\.(tsx|ts)$/, '');
  if (depPath.startsWith('src/ui-core/layout/')) return `Alpha:Shell(${stem})`;
  if (depPath.startsWith('src/ui-core/primitives/')) return `Alpha:Primitive(${stem})`;
  if (depPath.startsWith('src/ui-core/compounds/')) return `Alpha:Compound(${stem})`;
  if (depPath.startsWith('src/ui-core/charts/')) return `Alpha:Chart(${stem})`;
  return `Alpha:StoreConfig(${stem})`;
}

/**
 * Computes Alpha <-> Bravo Root-Cause Clustering & Attribution across all review units.
 *
 * Rules:
 * - If multiple rejected surfaces co-occur on the same shared Alpha dependency (`>= 2` rejected
 *   surfaces, or `>= 35%` rejection ratio when at least 2 surfaces use it), classify as
 *   `fix-alpha-mother` ("Inspect & fix shared Workspace Alpha mother component first; do not
 *   hard-patch individual business surfaces").
 * - Otherwise, if an Alpha dependency is shared by many approved surfaces and only 1 surface
 *   is rejected, classify as `fix-bravo-surface-locally` ("Underlying Alpha mother is healthy;
 *   apply localized fix to the rejected surface and `surfaceCalibrationOverrides.json`").
 */
export function computeAlphaBravoRootCauseClusters(
  units: SurfaceVariantReviewUnit[]
): AlphaRootCauseCluster[] {
  const rejectedUnits = units.filter((u) => u.status === 'rejected');
  if (rejectedUnits.length === 0) {
    return [];
  }

  const depMap = new Map<
    string,
    {
      rejected: Set<string>;
      approved: Set<string>;
      all: Set<string>;
    }
  >();

  for (const unit of units) {
    for (const dep of unit.alphaMotherDeps) {
      if (!depMap.has(dep)) {
        depMap.set(dep, {
          rejected: new Set(),
          approved: new Set(),
          all: new Set(),
        });
      }
      const entry = depMap.get(dep)!;
      entry.all.add(unit.unitKey);
      if (unit.status === 'rejected') {
        entry.rejected.add(unit.unitKey);
      } else if (unit.status === 'approved') {
        entry.approved.add(unit.unitKey);
      }
    }
  }

  const clusters: AlphaRootCauseCluster[] = [];

  for (const [alphaDep, stats] of depMap.entries()) {
    if (stats.rejected.size === 0) continue;
    // Skip universal shell unless >= 3 surfaces are rejected, so more specific primitives rank higher
    if (
      alphaDep === 'src/ui-core/layout/UniversalThreeStageShell.tsx' &&
      stats.rejected.size < 3 &&
      rejectedUnits.length < 3
    ) {
      continue;
    }

    const rejectedList = Array.from(stats.rejected).sort();
    const approvedList = Array.from(stats.approved).sort();
    const totalCount = stats.all.size;
    const shortName = formatAlphaShortName(alphaDep);
    const category = classifyAlphaDepCategory(alphaDep);

    const isSystemicAlphaIssue =
      rejectedList.length >= 2 &&
      (rejectedList.length >= 3 || rejectedList.length / Math.max(1, totalCount) >= 0.25);

    const verdict: AlphaRootCauseCluster['verdict'] = isSystemicAlphaIssue
      ? 'fix-alpha-mother'
      : 'fix-bravo-surface-locally';

    const recommendation = isSystemicAlphaIssue
      ? `[Alpha Root-Cause Warning] ${rejectedList.length} rejected surfaces co-depend on ` +
        `\`${shortName}\` (\`${alphaDep}\`). Inspect and fix the shared Workspace Alpha ` +
        `mother component first — DO NOT hard-patch individual business surfaces one by one.`
      : `[Bravo Local Attribution] \`${shortName}\` (\`${alphaDep}\`) is healthy across ` +
        `${approvedList.length} approved surface(s) and only rejected on ${rejectedList.join(', ')}. ` +
        `Keep the Alpha mother untouched and apply a localized fix to the target surface TSX or ` +
        `\`surfaceCalibrationOverrides.json\`.`;

    clusters.push({
      alphaDep,
      shortName,
      category,
      rejectedUnits: rejectedList,
      approvedUnits: approvedList,
      totalUnitsUsingDep: totalCount,
      verdict,
      recommendation,
    });
  }

  return clusters.sort((a, b) => {
    if (a.verdict !== b.verdict) {
      return a.verdict === 'fix-alpha-mother' ? -1 : 1;
    }
    return b.rejectedUnits.length - a.rejectedUnits.length;
  });
}

export function buildReviewBundlePayload(params: {
  units: SurfaceVariantReviewUnit[];
  decisionsMap: Record<string, RuntimeReviewDecision>;
}): ReviewBundleExportPayload {
  const { units, decisionsMap } = params;
  const nowIso = new Date().toISOString();

  const approvedCount = units.filter((u) => u.status === 'approved').length;
  const rejectedCount = units.filter((u) => u.status === 'rejected').length;
  const deferredCount = units.filter((u) => u.status === 'deferred').length;
  const pendingCount = units.filter((u) => u.status === 'pending').length;

  const bucket1VisualCount = units.filter((u) => u.bucket === 'bucket-1-visual').length;
  const bucket2ConfigCount = units.filter((u) => u.bucket === 'bucket-2-config').length;
  const bucket3TemplateCount = units.filter((u) => u.bucket === 'bucket-3-template').length;

  const rootCauseRecommendations = computeAlphaBravoRootCauseClusters(units);
  const decisions = Object.values(decisionsMap).sort((a, b) =>
    a.unitKey.localeCompare(b.unitKey)
  );

  const surfacePatch: ReviewBundleExportPayload['ledgerPatch']['surfaces'] = {};
  for (const unit of units) {
    const baseLedger = UI_APPROVAL_LEDGER.surfaces[unit.surfaceId];
    const hasChangedStatus = !baseLedger || baseLedger.status !== unit.status;
    const hasNote = Boolean(unit.note && unit.note.trim().length > 0);
    if (hasChangedStatus || hasNote || decisionsMap[unit.unitKey]) {
      surfacePatch[unit.surfaceId] = {
        status: unit.status,
        approvedAt: unit.updatedAt || nowIso,
        ...(hasNote ? { note: unit.note.trim() } : {}),
      };
    }
  }

  return {
    schemaVersion: 1,
    exportedAt: nowIso,
    summary: {
      totalUnits: units.length,
      approvedCount,
      rejectedCount,
      deferredCount,
      pendingCount,
      bucket1VisualCount,
      bucket2ConfigCount,
      bucket3TemplateCount,
    },
    rootCauseRecommendations,
    decisions,
    ledgerPatch: {
      updatedAt: nowIso,
      surfaces: surfacePatch,
    },
  };
}

export function formatReviewBundleMarkdown(
  payload: ReviewBundleExportPayload,
  units: SurfaceVariantReviewUnit[]
): string {
  const rejected = units.filter((u) => u.status === 'rejected');
  const deferred = units.filter((u) => u.status === 'deferred');
  const withNotes = units.filter(
    (u) => u.note.trim().length > 0 && u.status !== 'rejected' && u.status !== 'deferred'
  );

  const alphaFixes = payload.rootCauseRecommendations.filter(
    (c) => c.verdict === 'fix-alpha-mother'
  );
  const bravoLocalFixes = payload.rootCauseRecommendations.filter(
    (c) => c.verdict === 'fix-bravo-surface-locally'
  );

  const lines: string[] = [
    '# [RCUITuner Workspace Bravo · Rapid Review & Triage Bundle]',
    `- **Exported At**: \`${payload.exportedAt}\``,
    `- **Summary**: **${payload.summary.approvedCount}** Approved · ` +
      `**${payload.summary.rejectedCount}** Rejected · ` +
      `**${payload.summary.deferredCount}** Deferred · ` +
      `**${payload.summary.pendingCount}** Pending (Total ${payload.summary.totalUnits} units)`,
    `- **3-Bucket Queue Snapshot**: [B1] Bucket 1 (Visual/New): \`${payload.summary.bucket1VisualCount}\` · ` +
      `[B2] Bucket 2 (Config/Sizing): \`${payload.summary.bucket2ConfigCount}\` · ` +
      `[B3] Bucket 3 (Template-Stale): \`${payload.summary.bucket3TemplateCount}\``,
    '',
    '## 1. [Root-Cause Triage Recommendation] (Alpha ⇄ Bravo Attribution)',
  ];

  if (payload.rootCauseRecommendations.length === 0) {
    lines.push(
      '- All inspected surfaces are Approved or Deferred. Zero rejected surface root-cause conflicts detected.'
    );
  } else {
    if (alphaFixes.length > 0) {
      lines.push('### [ALERT] Systemic Workspace Alpha Mother Component Findings (Fix First)');
      for (const c of alphaFixes.slice(0, 8)) {
        lines.push(
          `- **${c.shortName}** (\`${c.alphaDep}\`): Co-occurs across **${c.rejectedUnits.length}** rejected units (\`${c.rejectedUnits.join('`, `')}\`).`,
          `  - **Action**: ${c.recommendation}`
        );
      }
    }
    if (bravoLocalFixes.length > 0) {
      lines.push('### [LOCAL] Localized Workspace Bravo Surface Findings (Alpha Mother Healthy)');
      for (const c of bravoLocalFixes.slice(0, 8)) {
        lines.push(`- **${c.shortName}**: ${c.recommendation}`);
      }
    }
  }

  lines.push('', '## 2. Rejected Units Requiring Rework');
  if (rejected.length === 0) {
    lines.push('- None');
  } else {
    for (const u of rejected) {
      lines.push(
        `- [REJECTED] **[${u.referenceCode}] ${u.label}** (\`${u.unitKey}\`)`,
        `  - **Source**: \`${u.sourceFile}\`${u.subViewFile ? ` → \`${u.subViewFile}\`` : ''}`,
        `  - **Bucket / Reason**: \`${u.bucket}\` (\`${u.staleReason}\`)`,
        `  - **Reviewer Note**: ${u.note.trim() || '*(Instant Reject via R shortcut — no note required)*'}`
      );
    }
  }

  if (deferred.length > 0) {
    lines.push('', '## 3. Deferred Units (Hold Queue)');
    for (const u of deferred) {
      lines.push(
        `- [DEFERRED] **[${u.referenceCode}] ${u.label}** (\`${u.unitKey}\`) — \`${u.sourceFile}\`${
          u.note.trim() ? ` · Note: ${u.note.trim()}` : ''
        }`
      );
    }
  }

  if (withNotes.length > 0) {
    lines.push('', '## 4. Approved Units With Reviewer Notes');
    for (const u of withNotes) {
      lines.push(
        `- [APPROVED] **[${u.referenceCode}] ${u.label}** (\`${u.unitKey}\`): ${u.note.trim()}`
      );
    }
  }

  lines.push(
    '',
    '## 5. `manifest/uiApprovalLedger.json` Delta Patch',
    '```json',
    JSON.stringify(payload.ledgerPatch, null, 2),
    '```',
    ''
  );

  return lines.join('\n');
}
