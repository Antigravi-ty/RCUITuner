#!/usr/bin/env node
/**
 * RCUITuner Architecture, TypeScript & Slot-Boundary Radar (`npm run radar`)
 *
 * Adapted from RocketCompanion's `scripts/radar.mjs` for the UI Tuner & UI Core
 * architecture, with dedicated detection for:
 *   1. TypeScript Strict Compilation (`tsc --noEmit`)
 *   2. 9-Layer Unidirectional Dependency Hierarchy (L1 Tokens -> L8 Showcase)
 *   3. Circular Dependency Detection (DFS cycle scan across all TS/TSX modules)
 *   4. File Volume Waterlines (Warn >= 550 lines, Error >= 600 lines)
 *   5. Slot-Boundary & Anti-"Gut-Sharing / Funnel Prop-Drilling" Audit:
 *      - Flags wide React Props interfaces (Warn >= 18 props, Error >= 22 props)
 *        that indicate a parent container is acting as a "middleman" prop-drilling
 *        dozens of state/setter pairs into a child Slot instead of letting the
 *        child Slot bind directly to its store/context.
 *      - Flags arbitrary file-halving (`*Part1.tsx`, `*Part2.tsx`, `*Half.tsx`,
 *        `*Stepper.ts`, `*Helper2.tsx`) that splits a file by line count rather
 *        than semantic UI Slot boundaries (`header` / `content` / `footer` /
 *        `Tab` / `Section` / `Card`).
 *      - Flags "gut-sharing" helper functions that accept a mutable controller/host
 *        instance (`ctrl`, `self`, `host`, `instance`) and read/mutate >= 8 internal
 *        fields on it.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const args = new Set(process.argv.slice(2));
const JSON_MODE = args.has('--json');

// ---------------------------------------------------------------------------
// 1. Thresholds & Architectural Layer Definitions
// ---------------------------------------------------------------------------
const LINE_WARN_THRESHOLD = 550;
const LINE_ERROR_THRESHOLD = 600;

const PROPS_WARN_THRESHOLD = 18;
const PROPS_ERROR_THRESHOLD = 22;

const GUT_SHARING_PROP_ACCESS_THRESHOLD = 8;

/**
 * 9-Layer Unidirectional Hierarchy for RCUITuner + RCUIModule (`src/ui-core`)
 * Lower rank cannot import from higher rank.
 * Same-rank imports are allowed within a layer (or across peer sub-packages where documented).
 */
const LAYER_RULES = [
  { prefix: 'src/ui-core/tokens/', rank: 1, name: 'L1:Tokens' },
  { prefix: 'src/ui-core/config/', rank: 1, name: 'L1:Config' },
  { prefix: 'src/ui-core/stores/', rank: 1, name: 'L1:Stores' },
  { prefix: 'src/ui-core/utils/', rank: 1, name: 'L1:Utils' },
  { prefix: 'src/ui-core/primitives/', rank: 2, name: 'L2:Primitives' },
  { prefix: 'src/ui-core/layout/', rank: 2, name: 'L2:Layout' },
  { prefix: 'src/ui-core/compounds/', rank: 3, name: 'L3:Compounds' },
  { prefix: 'src/ui-core/charts/', rank: 3, name: 'L3:Charts' },
  { prefix: 'src/ui-core/viewport/', rank: 4, name: 'L4:Viewport' },
  { prefix: 'src/ui-core/hud/', rank: 5, name: 'L5:HUD' },
  { prefix: 'src/ui-core/loading/', rank: 6, name: 'L6:Loading' },
  { prefix: 'src/ui-core/recipes/', rank: 6, name: 'L6:Recipes' },
  { prefix: 'src/ui-core/panels/', rank: 6, name: 'L6:Panels' },
  { prefix: 'src/ui-core/navigation/', rank: 7, name: 'L7:Navigation' },
  { prefix: 'src/ui-core/index.ts', rank: 7, name: 'L7:UICoreBarrel' },
  { prefix: 'src/showcase/', rank: 8, name: 'L8:Showcase' },
  { prefix: 'src/', rank: 9, name: 'L9:AppRoot' },
];

const ARBITRARY_SPLIT_FILENAME_RE =
  /(Part[1-9]|Half[1-9]|Chunk[1-9]|Split[1-9]|Section[1-9]$|Tab[1-9]$|Helper[1-9]|PlaybackStepper)/i;

// ---------------------------------------------------------------------------
// 2. File Discovery & Helpers
// ---------------------------------------------------------------------------
function walkSourceFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSourceFiles(fullPath, acc);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function toRelPath(absPath) {
  return path.relative(ROOT_DIR, absPath).split(path.sep).join('/');
}

function getLayerInfo(relPath) {
  for (const rule of LAYER_RULES) {
    if (relPath.startsWith(rule.prefix) || relPath === rule.prefix) {
      return rule;
    }
  }
  return { prefix: 'src/', rank: 9, name: 'L9:AppRoot' };
}

function resolveImportTarget(fromFileAbs, importSpec) {
  if (!importSpec.startsWith('.')) return null;
  const baseAbs = path.resolve(path.dirname(fromFileAbs), importSpec);
  const candidates = [
    baseAbs,
    `${baseAbs}.ts`,
    `${baseAbs}.tsx`,
    path.join(baseAbs, 'index.ts'),
    path.join(baseAbs, 'index.tsx'),
  ];
  for (const cand of candidates) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      return cand;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 3. Static Analysis Passes
// ---------------------------------------------------------------------------

/**
 * Pass 1: TypeScript Compiler Check (`tsc --noEmit`)
 */
function runTypeScriptCheck() {
  try {
    execSync('npx tsc --noEmit', {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { ok: true, errors: [] };
  } catch (err) {
    const stdout = err.stdout ? String(err.stdout) : '';
    const stderr = err.stderr ? String(err.stderr) : '';
    const combined = `${stdout}\n${stderr}`.trim();
    const lines = combined
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    return { ok: false, errors: lines };
  }
}

/**
 * Pass 2: Extract runtime & type imports for Layer & Cycle checks
 */
function parseFileImports(content) {
  const imports = [];
  const importRegex =
    /\b(?:import|export)\s+(?:(type)\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const isTypeOnly = Boolean(match[1]);
    const spec = match[2];
    imports.push({ spec, isTypeOnly });
  }
  return imports;
}

/**
 * Pass 3: Detect Child Slot Funnel Prop-Drilling ("Wide-Waist" `*Props` interfaces)
 *
 * Distinguishes:
 * - Atomic/Compound primitives (`src/ui-core/primitives/`, `src/ui-core/compounds/`,
 *   `src/ui-core/hud/`, `src/ui-core/navigation/`) & Top-Level L6 Entry Shells
 *   (`Layer*Recipe.tsx`, `*FloatingWindow.tsx`) which expose optional `default*`
 *   snapshot overrides and `onNavigate*` routing callbacks for the Showcase matrix wall.
 * - Child UI Slots (tabs, cards, sections, decks, bars, columns, canvases) where passing
 *   >= 22 props (or >= 10 state-setter `set*` props) means state binding was left at the
 *   parent shell instead of pushed down into the Slot that owns those controls.
 */
function analyzePropsInterfaces(content, relPath) {
  // Atomic primitives, compounds, HUD display widgets, navigation shells, and
  // top-level L6 Recipe/FloatingWindow shells are root entry contracts, not child Slots.
  const isRootContractOrPrimitive =
    relPath.startsWith('src/ui-core/primitives/') ||
    relPath.startsWith('src/ui-core/compounds/') ||
    relPath.startsWith('src/ui-core/hud/') ||
    relPath.startsWith('src/ui-core/navigation/') ||
    /^src\/ui-core\/recipes\/Layer[1-5]\w+Recipe\.tsx$/.test(relPath) ||
    /^src\/ui-core\/recipes\/online\/\w+(RoomRecipe|SubView)\.tsx$/.test(relPath) ||
    /^src\/ui-core\/panels\/(user|dev)\/\w+FloatingWindow\.tsx$/.test(relPath);

  if (isRootContractOrPrimitive) {
    return [];
  }

  const findings = [];
  const interfaceRegex =
    /(?:export\s+)?interface\s+(\w*Props)\s*(?:extends\s+[^{]+)?\{([\s\S]*?)\n\}/g;
  let match;
  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const body = match[2];
    const lines = body
      .split(/\r?\n/)
      .map((l) => l.replace(/\/\/.*$/, '').trim())
      .filter((l) => l && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('*/'));

    // Count top-level property declarations at brace depth 0
    let braceDepth = 0;
    let propCount = 0;
    let setterCount = 0;
    for (const line of lines) {
      if (braceDepth === 0) {
        const propMatch = line.match(/^([a-zA-Z0-9_$]+)\??\s*:/);
        if (propMatch) {
          propCount += 1;
          const propName = propMatch[1];
          if (/^(set[A-Z]|on[A-Z]|handle[A-Z])/.test(propName)) {
            setterCount += 1;
          }
        }
      }
      for (const ch of line) {
        if (ch === '{') braceDepth += 1;
        else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
      }
    }

    if (propCount >= PROPS_WARN_THRESHOLD) {
      findings.push({
        file: relPath,
        interfaceName,
        propCount,
        setterCount,
        severity: propCount >= PROPS_ERROR_THRESHOLD ? 'error' : 'warn',
      });
    }
  }
  return findings;
}

/**
 * Pass 4: Detect "Gut-Sharing" functions (e.g. `stepControllerPlayback(ctrl, ...)`
 * reading/mutating >= 8 distinct properties on `ctrl` / `host` / `instance`).
 */
function analyzeGutSharingFunctions(content, relPath) {
  const findings = [];
  const fnRegex =
    /(?:export\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(\s*(ctrl|controller|host|instance|owner|self)\b[^)]*\)\s*\{/g;
  let match;
  while ((match = fnRegex.exec(content)) !== null) {
    const fnName = match[1];
    const paramName = match[2];
    const propRegex = new RegExp(`\\b${paramName}\\.([a-zA-Z0-9_$]+)`, 'g');
    const accessedProps = new Set();
    let pMatch;
    while ((pMatch = propRegex.exec(content)) !== null) {
      accessedProps.add(pMatch[1]);
    }
    if (accessedProps.size >= GUT_SHARING_PROP_ACCESS_THRESHOLD) {
      findings.push({
        file: relPath,
        fnName,
        paramName,
        accessedCount: accessedProps.size,
        sampleProps: Array.from(accessedProps).slice(0, 8),
      });
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// 4. Execute Full Scan
// ---------------------------------------------------------------------------
const allFiles = walkSourceFiles(SRC_DIR);

const lineViolations = [];
const lineWarnings = [];
const layerViolations = [];
const widePropsErrors = [];
const widePropsWarnings = [];
const arbitrarySplitErrors = [];
const gutSharingErrors = [];
const dependencyGraph = new Map();

for (const absFile of allFiles) {
  const relFile = toRelPath(absFile);
  const content = fs.readFileSync(absFile, 'utf8');
  const lineCount = content.split(/\r?\n/).length;

  // 4.1 Line count check
  if (lineCount >= LINE_ERROR_THRESHOLD) {
    lineViolations.push({ file: relFile, lines: lineCount });
  } else if (lineCount >= LINE_WARN_THRESHOLD) {
    lineWarnings.push({ file: relFile, lines: lineCount });
  }

  // 4.2 Arbitrary split filename check
  const baseName = path.basename(relFile, path.extname(relFile));
  if (ARBITRARY_SPLIT_FILENAME_RE.test(baseName)) {
    arbitrarySplitErrors.push({
      file: relFile,
      reason: `Filename "${baseName}" suggests arbitrary line-count halving or gut-sharing split instead of a semantic UI Slot boundary.`,
    });
  }

  // 4.3 Imports, Layer boundaries & Graph construction
  const fromLayer = getLayerInfo(relFile);
  const rawImports = parseFileImports(content);
  const resolvedDeps = [];

  for (const imp of rawImports) {
    const targetAbs = resolveImportTarget(absFile, imp.spec);
    if (!targetAbs) continue;
    const targetRel = toRelPath(targetAbs);
    if (!imp.isTypeOnly) {
      resolvedDeps.push(targetRel);
    }

    const toLayer = getLayerInfo(targetRel);
    // Enforce that src/ui-core never imports from src/showcase, and lower ranks
    // do not runtime-import higher ranks (allowing L6 <-> L7FloatingWindowRegistry bridge).
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
  dependencyGraph.set(relFile, resolvedDeps);

  // 4.4 Slot-Boundary Wide Props / Funnel Prop-Drilling check
  const propFindings = analyzePropsInterfaces(content, relFile);
  for (const finding of propFindings) {
    if (finding.severity === 'error') {
      widePropsErrors.push(finding);
    } else {
      widePropsWarnings.push(finding);
    }
  }

  // 4.5 Gut-Sharing Function check
  const gutFindings = analyzeGutSharingFunctions(content, relFile);
  gutSharingErrors.push(...gutFindings);
}

// 4.6 Circular Dependency Detection (DFS)
const cycles = [];
const visited = new Set();
const inStack = new Set();
const pathStack = [];

function dfsCycle(node) {
  visited.add(node);
  inStack.add(node);
  pathStack.push(node);

  const neighbors = dependencyGraph.get(node) || [];
  for (const next of neighbors) {
    if (!visited.has(next)) {
      dfsCycle(next);
    } else if (inStack.has(next)) {
      const idx = pathStack.indexOf(next);
      if (idx !== -1) {
        cycles.push([...pathStack.slice(idx), next]);
      }
    }
  }

  pathStack.pop();
  inStack.delete(node);
}

for (const node of dependencyGraph.keys()) {
  if (!visited.has(node)) {
    dfsCycle(node);
  }
}

// 4.7 TypeScript check
const tsResult = runTypeScriptCheck();

// ---------------------------------------------------------------------------
// 5. Report Output & Exit Code
// ---------------------------------------------------------------------------
const totalErrors =
  (tsResult.ok ? 0 : 1) +
  lineViolations.length +
  layerViolations.length +
  cycles.length +
  widePropsErrors.length +
  arbitrarySplitErrors.length +
  gutSharingErrors.length;

const summary = {
  scannedFiles: allFiles.length,
  typescriptOk: tsResult.ok,
  typescriptErrors: tsResult.errors,
  lineErrorThreshold: LINE_ERROR_THRESHOLD,
  lineWarnThreshold: LINE_WARN_THRESHOLD,
  lineViolations,
  lineWarnings,
  layerViolations,
  circularDependencies: cycles,
  slotBoundaryWidePropsErrors: widePropsErrors,
  slotBoundaryWidePropsWarnings: widePropsWarnings,
  arbitrarySplitErrors,
  gutSharingErrors,
  passed: totalErrors === 0,
};

if (JSON_MODE) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(totalErrors === 0 ? 0 : 1);
}

console.log('======================================================================');
console.log(' RCUITuner Architecture, TypeScript & Slot-Boundary Radar');
console.log('======================================================================');
console.log(`Scanned Source Files : ${allFiles.length}`);
console.log(
  `1. TypeScript Strict : ${
    tsResult.ok ? 'PASS (0 errors)' : `FAIL (${tsResult.errors.length} lines)`
  }`
);
console.log(
  `2. 9-Layer Hierarchy : ${
    layerViolations.length === 0 ? 'PASS (0 upward imports)' : `FAIL (${layerViolations.length})`
  }`
);
console.log(
  `3. Circular Deps     : ${
    cycles.length === 0 ? 'PASS (0 cycles)' : `FAIL (${cycles.length} cycles)`
  }`
);
console.log(
  `4. File Volume (<${LINE_ERROR_THRESHOLD}) : ${
    lineViolations.length === 0
      ? `PASS (0 files >= ${LINE_ERROR_THRESHOLD} lines, ${lineWarnings.length} warnings >= ${LINE_WARN_THRESHOLD})`
      : `FAIL (${lineViolations.length} files >= ${LINE_ERROR_THRESHOLD} lines)`
  }`
);
console.log(
  `5. Slot-Boundary Waist (<${PROPS_ERROR_THRESHOLD} props): ${
    widePropsErrors.length === 0 && arbitrarySplitErrors.length === 0 && gutSharingErrors.length === 0
      ? `PASS (0 wide-waist/gut-sharing splits, ${widePropsWarnings.length} warnings >= ${PROPS_WARN_THRESHOLD} props)`
      : `FAIL (${widePropsErrors.length} wide props, ${arbitrarySplitErrors.length} bad split names, ${gutSharingErrors.length} gut-sharing fns)`
  }`
);
console.log('----------------------------------------------------------------------');

if (!tsResult.ok) {
  console.error('\n[ERROR] TypeScript Compilation Failures:');
  for (const line of tsResult.errors.slice(0, 25)) {
    console.error(`  ${line}`);
  }
}

if (layerViolations.length > 0) {
  console.error('\n[ERROR] 9-Layer Upward Dependency Violations:');
  for (const v of layerViolations) {
    console.error(`  ${v.from} (${v.fromLayer}) -> ${v.to} (${v.toLayer})`);
  }
}

if (cycles.length > 0) {
  console.error('\n[ERROR] Circular Dependencies:');
  for (const c of cycles) {
    console.error(`  ${c.join(' -> ')}`);
  }
}

if (lineViolations.length > 0) {
  console.error(`\n[ERROR] Files Exceeding Hard Limit (${LINE_ERROR_THRESHOLD} lines):`);
  for (const f of lineViolations) {
    console.error(`  ${f.file} (${f.lines} lines)`);
  }
}

if (widePropsErrors.length > 0) {
  console.error(
    `\n[ERROR] Slot-Boundary Violation — Wide Props Interface (>= ${PROPS_ERROR_THRESHOLD} props):`
  );
  console.error(
    '  Hint: Do not prop-drill dozens of state/setter pairs through a parent container.'
  );
  console.error(
    '        Bind the child Slot directly to its store hook or a narrow React Context.'
  );
  for (const p of widePropsErrors) {
    console.error(
      `  ${p.file} :: ${p.interfaceName} (${p.propCount} props, ${p.setterCount} setters/callbacks)`
    );
  }
}

if (arbitrarySplitErrors.length > 0) {
  console.error('\n[ERROR] Arbitrary File-Halving / Gut-Sharing Split Filenames:');
  for (const a of arbitrarySplitErrors) {
    console.error(`  ${a.file} — ${a.reason}`);
  }
}

if (gutSharingErrors.length > 0) {
  console.error('\n[ERROR] Gut-Sharing Functions Reading/Mutating Host Internals:');
  for (const g of gutSharingErrors) {
    console.error(
      `  ${g.file} :: ${g.fnName}(${g.paramName}) accesses ${g.accessedCount} properties (${g.sampleProps.join(', ')}...)`
    );
  }
}

if (lineWarnings.length > 0) {
  console.log(`\n[WARN] Files Approaching Line Waterline (>= ${LINE_WARN_THRESHOLD} lines):`);
  for (const w of lineWarnings) {
    console.log(`  ${w.file} (${w.lines} lines)`);
  }
}

if (widePropsWarnings.length > 0) {
  console.log(`\n[WARN] Props Interfaces Approaching Waist Limit (>= ${PROPS_WARN_THRESHOLD} props):`);
  for (const w of widePropsWarnings) {
    console.log(
      `  ${w.file} :: ${w.interfaceName} (${w.propCount} props, ${w.setterCount} setters/callbacks)`
    );
  }
}

if (totalErrors > 0) {
  console.error(`\nRadar Result: FAILED with ${totalErrors} architectural error(s).`);
  process.exit(1);
} else {
  console.log('\nRadar Result: PASSED (All architectural & slot-boundary checks green).');
}
