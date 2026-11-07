#!/usr/bin/env node
/**
 * RCUITuner Architecture, TypeScript, Slot-Boundary & 3-Layer Semantic Approval Radar v3
 *
 * Modularized under `scripts/radar/`:
 *   - `constants.mjs`: Layer hierarchy rules, volume & narrow-waist thresholds
 *   - `astAndGraphScanner.mjs`: Lockfile guard, TypeScript check, 9-layer graph, L1 purity, cycles, dead files, fragmentation
 *   - `waistAndGutScanner.mjs`: Narrow-waist (<16) & parameter-name-agnostic gut-sharing checks
 *   - `approvalLedgerEngine.mjs`: 3-Layer Semantic Hash (`templateHash`, `sizingAndConfigHash`, `visualAstHash`) + `alphaDeps`
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ARBITRARY_SPLIT_FILENAME_RE,
  BYTE_ERROR_THRESHOLD,
  BYTE_WARN_THRESHOLD,
  FORBIDDEN_UI_CORE_PATHS,
  LINE_ERROR_THRESHOLD,
  LINE_WARN_THRESHOLD,
  ROOT_ENTRY_FILES,
  SINGLE_LINE_CHAR_WARN_THRESHOLD,
  SRC_DIR,
  WAIST_ERROR_THRESHOLD,
  WAIST_WARN_THRESHOLD,
} from './radar/constants.mjs';
import {
  analyzeConfigPurity,
  analyzeFragmentationWarnings,
  analyzeHygieneInvariants,
  analyzeLineLengthAndCasts,
  analyzeMicroFragments,
  analyzeValueReExports,
  checkLockfileInvariants,
  detectCircularDependencies,
  getLayerInfo,
  parseFileImports,
  resolveImportTarget,
  runTypeScriptCheck,
  toRelPath,
  walkSourceFiles,
} from './radar/astAndGraphScanner.mjs';
import {
  analyzeGutSharingFunctions,
  analyzeWideWaist,
} from './radar/waistAndGutScanner.mjs';
import { checkAndSyncApprovalLedger } from './radar/approvalLedgerEngine.mjs';

const args = new Set(process.argv.slice(2));
const JSON_MODE = args.has('--json');
const SYNC_APPROVAL = args.has('--sync-approval');

const lockfileViolations = checkLockfileInvariants();
const allFiles = walkSourceFiles(SRC_DIR);
const allRelFiles = allFiles.map(toRelPath);

const lineViolations = [];
const lineWarnings = [];
const byteViolations = [];
const byteWarnings = [];
const fileStatsList = [];
const longLineWarnings = [];
let totalAsAnyCount = 0;
const asAnyByFile = [];
const configPurityErrors = [];
const layerViolations = [];
const brokenImportErrors = [];
const valueReExportErrors = [];
const cjkErrors = [];
const emojiErrors = [];
const domainHygieneErrors = [];
const anyHygieneErrors = [];
const widePropsErrors = [];
const widePropsWarnings = [];
const arbitrarySplitErrors = [];
const gutSharingErrors = [];
const dependencyGraph = new Map();
const runtimeDependencyGraph = new Map();
const incomingRefCounts = new Map(allRelFiles.map((f) => [f, 0]));

for (const absFile of allFiles) {
  const relFile = toRelPath(absFile);
  const content = fs.readFileSync(absFile, 'utf8');
  const byteSize = Buffer.byteLength(content, 'utf8');
  const lineCount = content.split(/\r?\n/).length;

  fileStatsList.push({ file: relFile, lines: lineCount, bytes: byteSize });

  if (lineCount >= LINE_ERROR_THRESHOLD) {
    lineViolations.push({ file: relFile, lines: lineCount, bytes: byteSize });
  } else if (lineCount >= LINE_WARN_THRESHOLD) {
    lineWarnings.push({ file: relFile, lines: lineCount, bytes: byteSize });
  }

  if (byteSize >= BYTE_ERROR_THRESHOLD) {
    byteViolations.push({ file: relFile, bytes: byteSize, lines: lineCount });
  } else if (byteSize >= BYTE_WARN_THRESHOLD) {
    byteWarnings.push({ file: relFile, bytes: byteSize, lines: lineCount });
  }

  const { longLines, asAnyCount } = analyzeLineLengthAndCasts(content, relFile);
  longLineWarnings.push(...longLines);
  if (asAnyCount > 0) {
    totalAsAnyCount += asAnyCount;
    asAnyByFile.push({ file: relFile, count: asAnyCount });
  }

  configPurityErrors.push(...analyzeConfigPurity(content, relFile));
  valueReExportErrors.push(...analyzeValueReExports(content, relFile));

  const hygiene = analyzeHygieneInvariants(content, relFile);
  cjkErrors.push(...hygiene.cjkViolations);
  emojiErrors.push(...hygiene.emojiViolations);
  domainHygieneErrors.push(...hygiene.domainViolations);
  anyHygieneErrors.push(...hygiene.anyViolations);

  const baseName = path.basename(relFile, path.extname(relFile));
  if (ARBITRARY_SPLIT_FILENAME_RE.test(baseName)) {
    arbitrarySplitErrors.push({
      file: relFile,
      reason: `Filename "${baseName}" suggests arbitrary line-count halving instead of a semantic UI Slot boundary.`,
    });
  }

  const fromLayer = getLayerInfo(relFile);
  const rawImports = parseFileImports(content, absFile);
  const allResolvedDeps = [];
  const runtimeResolvedDeps = [];

  for (const imp of rawImports) {
    const targetAbs = resolveImportTarget(absFile, imp.spec);
    if (!targetAbs) {
      if (imp.spec.startsWith('.')) {
        brokenImportErrors.push({ from: relFile, spec: imp.spec });
      }
      continue;
    }
    const targetRel = toRelPath(targetAbs);

    if (targetRel !== relFile && incomingRefCounts.has(targetRel)) {
      incomingRefCounts.set(targetRel, incomingRefCounts.get(targetRel) + 1);
    }
    allResolvedDeps.push(targetRel);
    if (!imp.isTypeOnly) {
      runtimeResolvedDeps.push(targetRel);
    }

    const toLayer = getLayerInfo(targetRel);
    if (!imp.isTypeOnly && fromLayer.rank < toLayer.rank) {
      const isAllowedPanelRegistryBridge =
        relFile.startsWith('src/ui-core/panels/') &&
        targetRel.startsWith('src/ui-core/navigation/');
      if (!isAllowedPanelRegistryBridge) {
        layerViolations.push({
          from: relFile,
          fromLayer: fromLayer.name,
          to: targetRel,
          toLayer: toLayer.name,
        });
      }
    }
  }
  dependencyGraph.set(relFile, allResolvedDeps);
  runtimeDependencyGraph.set(relFile, runtimeResolvedDeps);

  for (const finding of analyzeWideWaist(content, relFile)) {
    if (finding.severity === 'error') widePropsErrors.push(finding);
    else widePropsWarnings.push(finding);
  }

  gutSharingErrors.push(...analyzeGutSharingFunctions(content, relFile));
}

const fragmentationWarnings = analyzeFragmentationWarnings(fileStatsList);
const microFragmentErrors = analyzeMicroFragments(fileStatsList, incomingRefCounts);

const deadFiles = [];
for (const [relFile, refCount] of incomingRefCounts.entries()) {
  if ((refCount === 0 && !ROOT_ENTRY_FILES.has(relFile)) || FORBIDDEN_UI_CORE_PATHS.has(relFile)) {
    deadFiles.push(relFile);
  }
}

// Full import graph (including `import type`) used for cycle detection — 100% aligned with RocketCompanion
const cycles = detectCircularDependencies(dependencyGraph);
const tsResult = runTypeScriptCheck();
const approvalReport = checkAndSyncApprovalLedger({
  allRelFiles,
  dependencyGraph: runtimeDependencyGraph,
  syncApproval: SYNC_APPROVAL,
});

const totalErrors =
  lockfileViolations.length +
  (tsResult.ok ? 0 : 1) +
  brokenImportErrors.length +
  lineViolations.length +
  byteViolations.length +
  configPurityErrors.length +
  valueReExportErrors.length +
  microFragmentErrors.length +
  cjkErrors.length +
  emojiErrors.length +
  domainHygieneErrors.length +
  anyHygieneErrors.length +
  layerViolations.length +
  cycles.length +
  deadFiles.length +
  widePropsErrors.length +
  arbitrarySplitErrors.length +
  gutSharingErrors.length;

const summary = {
  scannedFiles: allFiles.length,
  lockfileViolations,
  typescriptOk: tsResult.ok,
  typescriptErrors: tsResult.errors,
  brokenImportErrors,
  lineViolations,
  lineWarnings,
  byteViolations,
  byteWarnings,
  microFragmentErrors,
  fragmentationWarnings,
  configPurityErrors,
  valueReExportErrors,
  cjkErrors,
  emojiErrors,
  domainHygieneErrors,
  anyHygieneErrors,
  layerViolations,
  circularDependencies: cycles,
  deadFiles,
  slotBoundaryWidePropsErrors: widePropsErrors,
  slotBoundaryWidePropsWarnings: widePropsWarnings,
  arbitrarySplitErrors,
  gutSharingErrors,
  approvalLedger: approvalReport,
  asAnyCount: totalAsAnyCount,
  passed: totalErrors === 0,
};

if (JSON_MODE) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(totalErrors === 0 ? 0 : 1);
}

console.log('======================================================================');
console.log(' RCUITuner Architecture, TypeScript & 3-Layer Semantic Radar v4');
console.log('======================================================================');
console.log(`Scanned Source Files : ${allFiles.length}`);
console.log(
  `0. Lockfile Guard    : ${
    lockfileViolations.length === 0 ? 'PASS (pnpm-lock.yaml only)' : `FAIL (${lockfileViolations.length})`
  }`
);
console.log(
  `1. TypeScript Strict : ${
    tsResult.ok && brokenImportErrors.length === 0
      ? 'PASS (0 errors, 0 broken imports)'
      : `FAIL (${tsResult.errors.length} tsc lines, ${brokenImportErrors.length} broken imports)`
  }`
);
console.log(
  `2. 9-Layer Hierarchy : ${
    layerViolations.length === 0 ? 'PASS (0 upward imports)' : `FAIL (${layerViolations.length})`
  }`
);
console.log(
  `3. L1 Purity & 0-ReExport : ${
    configPurityErrors.length === 0 && valueReExportErrors.length === 0
      ? 'PASS (0 config leaks, 0 direct/indirect value re-exports)'
      : `FAIL (${configPurityErrors.length} config leaks, ${valueReExportErrors.length} value re-exports)`
  }`
);
console.log(
  `4. Circular Deps (all): ${
    cycles.length === 0 ? 'PASS (0 runtime/type cycles)' : `FAIL (${cycles.length} cycles)`
  }`
);
console.log(
  `5. Dead & Micro-Frag : ${
    deadFiles.length === 0 && microFragmentErrors.length === 0
      ? 'PASS (0 dead files, 0 single-ref <65L micro-fragments)'
      : `FAIL (${deadFiles.length} dead files, ${microFragmentErrors.length} <65L micro-fragments)`
  }`
);
console.log(
  `6. Dual-Cap Volume   : ${
    lineViolations.length === 0 && byteViolations.length === 0
      ? `PASS (0 >= ${LINE_ERROR_THRESHOLD}L, 0 >= ${BYTE_ERROR_THRESHOLD}B | Warn: ${lineWarnings.length} >= ${LINE_WARN_THRESHOLD}L, ${byteWarnings.length} >= ${BYTE_WARN_THRESHOLD}B)`
      : `FAIL (${lineViolations.length} >= ${LINE_ERROR_THRESHOLD}L, ${byteViolations.length} >= ${BYTE_ERROR_THRESHOLD}B)`
  }`
);
console.log(
  `7. Narrow Waist (<${WAIST_ERROR_THRESHOLD}) : ${
    widePropsErrors.length === 0 && arbitrarySplitErrors.length === 0 && gutSharingErrors.length === 0
      ? `PASS (0 wide-waist/gut-sharing splits, ${widePropsWarnings.length} warnings >= ${WAIST_WARN_THRESHOLD} fields)`
      : `FAIL (${widePropsErrors.length} wide waist, ${arbitrarySplitErrors.length} bad split names, ${gutSharingErrors.length} gut-sharing fns)`
  }`
);
console.log(
  `8. 3-Layer Approval  : ${
    approvalReport.driftedSurfaces.length === 0
      ? `PASS (${approvalReport.approvedCount}/${approvalReport.totalSurfaces} surfaces, ${approvalReport.approvedVariantUnits}/${approvalReport.totalVariantUnits} variant units verified${
          SYNC_APPROVAL ? ' · synced uiApprovalLedger.json' : ''
        })`
      : `DRIFT (${approvalReport.approvedCount}/${approvalReport.totalSurfaces} surfaces, B1:${approvalReport.bucketCounts['bucket-1-visual']} B2:${approvalReport.bucketCounts['bucket-2-config']} B3:${approvalReport.bucketCounts['bucket-3-template']})`
  }`
);
console.log(
  `9. Hygiene & Domain  : ${
    cjkErrors.length === 0 &&
    emojiErrors.length === 0 &&
    domainHygieneErrors.length === 0 &&
    anyHygieneErrors.length === 0
      ? `PASS (0 CJK, 0 Emoji, 0 Domain leaks, 0 Any-cap breaches | ${longLineWarnings.length} long lines, ${totalAsAnyCount} total \`as any\`)`
      : `FAIL (${cjkErrors.length} CJK, ${emojiErrors.length} Emoji, ${domainHygieneErrors.length} Domain, ${anyHygieneErrors.length} Any)`
  }`
);
console.log('----------------------------------------------------------------------');

for (const msg of lockfileViolations) console.error(`\n[ERROR] ${msg}`);
if (!tsResult.ok) {
  console.error('\n[ERROR] TypeScript Compilation Failures:');
  for (const line of tsResult.errors.slice(0, 25)) console.error(`  ${line}`);
}
for (const b of brokenImportErrors) console.error(`  [Broken Import] ${b.from} -> ${b.spec}`);
for (const v of layerViolations) {
  console.error(`  [Layer Violation] ${v.from} (${v.fromLayer}) -> ${v.to} (${v.toLayer})`);
}
for (const c of cycles) console.error(`  [Circular Dependency] ${c.join(' -> ')}`);
for (const r of valueReExportErrors) console.error(`  [Re-Export Violation] ${r.file}: ${r.reason}`);
for (const m of microFragmentErrors) console.error(`  [Micro-Fragment] ${m.file}: ${m.reason}`);
for (const f of deadFiles) console.error(`  [Dead File] ${f}`);
for (const f of lineViolations) console.error(`  [Line Cap] ${f.file} (${f.lines} lines)`);
for (const f of byteViolations) console.error(`  [Byte Cap] ${f.file} (${f.bytes} bytes)`);
for (const c of cjkErrors) console.error(`  [CJK Violation] ${c.file}:${c.line}`);
for (const e of emojiErrors) console.error(`  [Emoji Violation] ${e.file}:${e.line}`);
for (const d of domainHygieneErrors) console.error(`  [Domain Violation] ${d.file}:${d.line} (${d.reason})`);
for (const a of anyHygieneErrors) console.error(`  [Any Violation] ${a.file}:${a.line} (${a.reason})`);
for (const p of widePropsErrors) {
  console.error(`  [Wide Waist] ${p.file} -> ${p.interfaceName} (${p.propCount} fields)`);
}

if (totalErrors > 0) {
  console.error(`\nRADAR RESULT: FAILED with ${totalErrors} architectural/compile error(s).`);
  process.exit(1);
}
console.log('\nRADAR RESULT: PASSED (0 architectural or TypeScript errors).');
process.exit(0);
