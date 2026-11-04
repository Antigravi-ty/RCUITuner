#!/usr/bin/env node
/**
 * RCUITuner Architecture, TypeScript & Slot-Boundary Radar v2 (`npm run radar`)
 *
 * Enforces architectural invariants across RCUITuner and RCUIModule (`src/ui-core`):
 *   1. TypeScript Strict Compilation (resolves local `node_modules/.bin/tsc` or global TS 5.x)
 *   2. 9-Layer Unidirectional Dependency Hierarchy (L1 Tokens/Config -> L8 Showcase)
 *   3. L1 `src/ui-core/config/` Purity Check (forbids `export let`, direct `localStorage`
 *      calls outside `storageHelpers.ts`, and `new Set()` subscriber/listener sets)
 *   4. Circular Dependency Detection (DFS cycle scan across all TS/TSX modules)
 *   5. Dead File / Unused Module Scan (flags isolated files in `src/` with 0 incoming refs)
 *   6. File Volume Waterlines (Warn >= 550 lines, Error >= 600 lines) & Single-Line Length
 *      Waterline (Warn >= 240 chars on non-SVG lines) + `as any` cast tracking
 *   7. Hardened Slot-Boundary & Anti-"Gut-Sharing / Wide-Waist" Audit:
 *      - Scans `*Props`, `*Params`, `*Refs`, `*Slice`, `*Options` interfaces and inline
 *        destructured/object function parameters `{ a, b, c, ... }`
 *        (Child slots & helpers: Warn >= 12 fields, Error >= 16 fields;
 *         Top-level `Layer*RecipeProps`: Warn >= 18 fields, Error > 20 fields, enforcing
 *         structured `stateOverride` over flat prop-drilling).
 *      - Parameter-name-agnostic Gut-Sharing detection: flags external helper functions
 *        that read/mutate >= 8 distinct properties on an object parameter or accept
 *        `(set, get)` store slice closures.
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

const SINGLE_LINE_CHAR_WARN_THRESHOLD = 240;

const WAIST_WARN_THRESHOLD = 12;
const WAIST_ERROR_THRESHOLD = 16;

const RECIPE_PROPS_WARN_THRESHOLD = 18;
const RECIPE_PROPS_ERROR_THRESHOLD = 21; // > 20 flat props is an error

const GUT_SHARING_PROP_ACCESS_THRESHOLD = 8;

const ROOT_ENTRY_FILES = new Set([
  'src/main.tsx',
  'src/ui-core/index.ts',
  'src/ui-core/hud/InGameHUD.tsx',
]);

// Stream B Guard: Forbidden orphan / showcase-only files inside src/ui-core/
const FORBIDDEN_UI_CORE_PATHS = new Set([
  'src/ui-core/layout/VStack.tsx',
  'src/ui-core/layout/HStack.tsx',
  'src/ui-core/layout/GridStack.tsx',
  'src/ui-core/compounds/MenuItem.tsx',
  'src/ui-core/compounds/PeerRosterCard.tsx',
  'src/ui-core/compounds/tuner/ColorSwatchInput.tsx',
  'src/ui-core/compounds/tuner/UVTransformControl.tsx',
  'src/ui-core/loading/LoadingScreen.tsx',
  'src/ui-core/loading/DualProgressBar.tsx',
  'src/ui-core/loading/types.ts',
  'src/ui-core/panels/FloatingWindowToolbar.tsx',
  'src/ui-core/primitives/SectionErrorBoundary.tsx',
  'src/ui-core/recipes/Layer1ContextGroupedSelector.tsx',
  'src/ui-core/recipes/recipeStateMatrixSpecs.ts',
  'src/ui-core/stores/livePreviewStore.ts',
  'src/ui-core/stores/themeStore.ts',
  'src/ui-core/viewport/GameViewport.tsx',
]);

// Pure L1 domain/style state schema interfaces that end in *Params but represent
// persisted configuration payloads rather than function/component parameter bags.
const L1_STATE_SCHEMA_INTERFACES = new Set([
  'ClockPacingParams',
  'PacingControllerParams',
  'MainMenuStyleParams',
  'PlayCardStyleParams',
]);

/**
 * 9-Layer Unidirectional Hierarchy for RCUITuner + RCUIModule (`src/ui-core`)
 * Lower rank cannot import from higher rank.
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
 * Resolves local `node_modules/.bin/tsc` first or global TypeScript 5.x to avoid
 * `npx tsc` downloading legacy `tsc@2.0.4`.
 */
function resolveTscCommand() {
  const binName = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
  const localTsc = path.join(ROOT_DIR, 'node_modules', '.bin', binName);
  if (fs.existsSync(localTsc)) {
    return `"${localTsc}" --noEmit`;
  }
  try {
    const versionOut = execSync('tsc --version', {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      encoding: 'utf8',
    }).trim();
    if (/Version\s+5\./.test(versionOut)) {
      return 'tsc --noEmit';
    }
  } catch {
    // Fall through
  }
  return 'npx --no-install tsc --noEmit';
}

function runTypeScriptCheck() {
  const cmd = resolveTscCommand();
  try {
    execSync(cmd, {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      encoding: 'utf8',
    });
    return { ok: true, command: cmd, errors: [] };
  } catch (err) {
    const stdout = err.stdout ? String(err.stdout) : '';
    const stderr = err.stderr ? String(err.stderr) : '';
    const combined = `${stdout}\n${stderr}`.trim();
    const lines = combined
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    return { ok: false, command: cmd, errors: lines };
  }
}

/**
 * Pass 2: Extract static & dynamic imports for Layer, Cycle, and Dead-File checks
 */
function parseFileImports(content) {
  const imports = [];
  const staticRegex =
    /\b(?:import|export)\s+(?:(type)\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = staticRegex.exec(content)) !== null) {
    const isTypeOnly = Boolean(match[1]);
    const spec = match[2];
    imports.push({ spec, isTypeOnly });
  }
  const dynamicRegex = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicRegex.exec(content)) !== null) {
    imports.push({ spec: match[1], isTypeOnly: false });
  }
  return imports;
}

/**
 * Pass 3: L1 `src/ui-core/config/` Purity Check
 * Forbids:
 *   - Mutable exported variables (`export let`)
 *   - Direct `localStorage` calls (except inside `storageHelpers.ts`)
 *   - `new Set()` subscriber/listener sets
 */
function analyzeConfigPurity(content, relPath) {
  if (!relPath.startsWith('src/ui-core/config/')) {
    return [];
  }
  const violations = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.replace(/\/\/.*$/, '').trim();
    if (!line || line.startsWith('*') || line.startsWith('/*')) continue;

    if (/\bexport\s+let\b/.test(line)) {
      violations.push({
        file: relPath,
        line: i + 1,
        kind: 'export-let',
        reason: 'Mutable exported variable (`export let`) is forbidden in L1 config/.',
      });
    }

    if (
      relPath !== 'src/ui-core/config/storageHelpers.ts' &&
      /\blocalStorage\b/.test(line)
    ) {
      violations.push({
        file: relPath,
        line: i + 1,
        kind: 'localStorage',
        reason: 'Direct `localStorage` access is forbidden in L1 config/; sink persistence to stores/.',
      });
    }

    if (
      /(?:listeners|subscribers|appliers)\s*=\s*new\s+Set\b/i.test(line) ||
      /new\s+Set\s*<\s*[^>]*(?:Listener|Subscriber|Callback|Applier)/i.test(line) ||
      /new\s+Set\s*<\s*\([^)]*\)\s*=>/.test(line)
    ) {
      violations.push({
        file: relPath,
        line: i + 1,
        kind: 'subscriber-set',
        reason: 'Subscriber `new Set()` is forbidden in L1 config/; sink reactive subscriptions to stores/.',
      });
    }
  }

  return violations;
}

/**
 * Helper: Count top-level fields in an interface body `{ ... }`
 */
function countInterfaceFields(body) {
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.replace(/\/\/.*$/, '').trim())
    .filter((l) => l && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('*/'));

  let braceDepth = 0;
  let parenDepth = 0;
  let propCount = 0;
  let setterCount = 0;
  for (const line of lines) {
    if (braceDepth === 0 && parenDepth === 0) {
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
      else if (ch === '(') parenDepth += 1;
      else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);
    }
  }
  return { propCount, setterCount };
}

/**
 * Helper: Count top-level comma-separated fields in a destructured object parameter `{ a, b: { c }, d = 1 }`
 */
function countTopLevelDestructuredFields(inner) {
  let depth = 0;
  let current = '';
  const fields = [];
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '{' || ch === '[' || ch === '(') depth += 1;
    else if (ch === '}' || ch === ']' || ch === ')') depth = Math.max(0, depth - 1);
    else if (ch === ',' && depth === 0) {
      const cleaned = current.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (cleaned && !cleaned.startsWith('...')) fields.push(cleaned);
      current = '';
      continue;
    }
    current += ch;
  }
  const tail = current.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (tail && !tail.startsWith('...')) fields.push(tail);
  return fields.length;
}

/**
 * Pass 4: Hardened Wide-Waist Detection
 * - Scans `*Props`, `*Params`, `*Refs`, `*Slice`, `*Options` interfaces
 * - Scans inline object parameters `{ a, b, c, ... }` in functions/components
 * - Tightens `Layer*RecipeProps` exemption (max 20 top-level fields, enforcing `stateOverride`)
 * - Child slots / helper functions: warn >= 12 fields, error >= 16 fields
 */
function analyzeWideWaist(content, relPath) {
  const isAtomicOrHudOrPanelContract =
    relPath.startsWith('src/ui-core/primitives/') ||
    relPath.startsWith('src/ui-core/compounds/') ||
    relPath.startsWith('src/ui-core/hud/') ||
    relPath.startsWith('src/ui-core/navigation/') ||
    /^src\/ui-core\/panels\/(user|dev)\/\w+FloatingWindow\.tsx$/.test(relPath);

  const isTopLevelRecipeFile = /^src\/ui-core\/recipes\/Layer[1-5]\w+Recipe\.tsx$/.test(relPath);

  const findings = [];
  const reportedNames = new Set();

  // 1. Scan *Props, *Params, *Refs, *Slice, *Options interfaces
  const interfaceRegex =
    /(?:export\s+)?interface\s+(\w*(?:Props|Params|Refs|Slice|Options))\s*(?:extends\s+[^{]+)?\{([\s\S]*?)\n\}/g;
  let match;
  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const body = match[2];

    if (L1_STATE_SCHEMA_INTERFACES.has(interfaceName)) {
      continue;
    }

    const { propCount, setterCount } = countInterfaceFields(body);
    const isLayerRecipeProps = /^Layer[1-5]\w+RecipeProps$/.test(interfaceName);

    if (isLayerRecipeProps) {
      if (propCount >= RECIPE_PROPS_WARN_THRESHOLD) {
        reportedNames.add(interfaceName);
        findings.push({
          file: relPath,
          interfaceName,
          propCount,
          setterCount,
          kind: 'recipe-props',
          severity: propCount >= RECIPE_PROPS_ERROR_THRESHOLD ? 'error' : 'warn',
        });
      }
      continue;
    }

    if (isAtomicOrHudOrPanelContract && interfaceName.endsWith('Props')) {
      continue;
    }

    if (propCount >= WAIST_WARN_THRESHOLD) {
      reportedNames.add(interfaceName);
      findings.push({
        file: relPath,
        interfaceName,
        propCount,
        setterCount,
        kind: 'interface',
        severity: propCount >= WAIST_ERROR_THRESHOLD ? 'error' : 'warn',
      });
    }
  }

  // 2. Scan inline destructured object parameters in functions & arrow components
  if (!isAtomicOrHudOrPanelContract && !isTopLevelRecipeFile) {
    const fnHeaderRegex =
      /(?:(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*(?:<[^>]*>)?\s*\(\s*\{|(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*(?::\s*[^=]+)?=\s*(?:React\.(?:memo|forwardRef)\s*\(\s*)*\s*(?:async\s*)?\(\s*\{)/g;

    while ((match = fnHeaderRegex.exec(content)) !== null) {
      const fnName = match[1] || match[2];
      if (!fnName || reportedNames.has(`${fnName}Props`) || reportedNames.has(`${fnName}Params`)) {
        continue;
      }
      // Find matching closing brace of the destructured parameter object
      const openBraceIdx = match.index + match[0].length - 1;
      let depth = 0;
      let closeBraceIdx = -1;
      for (let i = openBraceIdx; i < content.length; i++) {
        if (content[i] === '{') depth += 1;
        else if (content[i] === '}') {
          depth -= 1;
          if (depth === 0) {
            closeBraceIdx = i;
            break;
          }
        }
      }
      if (closeBraceIdx === -1) continue;
      const inner = content.slice(openBraceIdx + 1, closeBraceIdx);
      const fieldCount = countTopLevelDestructuredFields(inner);
      if (fieldCount >= WAIST_WARN_THRESHOLD) {
        findings.push({
          file: relPath,
          interfaceName: `${fnName}({...})`,
          propCount: fieldCount,
          setterCount: 0,
          kind: 'inline-param',
          severity: fieldCount >= WAIST_ERROR_THRESHOLD ? 'error' : 'warn',
        });
      }
    }
  }

  return findings;
}

/**
 * Pass 5: Hardened Gut-Sharing Detection (Parameter-Name-Agnostic)
 * Flags:
 *   1. External helper functions accepting `(set, get)` store slice closures
 *      (outside `src/ui-core/stores/slices/`).
 *   2. External helper functions that read/mutate >= 8 distinct properties on any
 *      passed controller/host/DOM-ref/state object parameter (excluding pure L1 math/evaluator
 *      modules such as `pacingControllerEvaluator.ts` and Canvas 2D context `ctx`).
 */
function analyzeGutSharingFunctions(content, relPath) {
  const findings = [];

  // 1. Check for (set, get) store slice closure gut-sharing outside canonical slices/
  if (!relPath.startsWith('src/ui-core/stores/slices/')) {
    const setGetRegex =
      /(?:export\s+)?(?:function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=)\s*(?:<[^>]*>)?\s*\(\s*set\s*(?::[^,)]+)?,\s*get\b/g;
    let sgMatch;
    while ((sgMatch = setGetRegex.exec(content)) !== null) {
      const fnName = sgMatch[1] || sgMatch[2] || 'anonymous';
      findings.push({
        file: relPath,
        fnName,
        paramName: 'set, get',
        accessedCount: 2,
        sampleProps: ['set', 'get'],
        reason: 'Store `(set, get)` closure passed to external helper (gut-sharing split).',
      });
    }
  }

  // Pure mathematical/physics evaluator in L1 config is an algorithmic operator, not UI/store gut-sharing
  if (relPath === 'src/ui-core/config/pacingControllerEvaluator.ts') {
    return findings;
  }

  // 2. Parameter-name-agnostic object property access & mutation check
  const fnRegex =
    /(?:export\s+)?function\s+([a-zA-Z0-9_$]+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\{/g;
  let match;
  while ((match = fnRegex.exec(content)) !== null) {
    const fnName = match[1];
    // Skip React PascalCase components
    if (/^[A-Z]/.test(fnName)) continue;

    const paramsRaw = match[2];
    const paramNames = paramsRaw
      .split(',')
      .map((p) => p.trim().match(/^([a-zA-Z0-9_$]+)\s*(?:\?|:|=|$)/)?.[1])
      .filter(Boolean);

    if (paramNames.length === 0) continue;

    const bodyStartIdx = match.index + match[0].length - 1;
    let depth = 0;
    let bodyEndIdx = content.length;
    for (let i = bodyStartIdx; i < content.length; i++) {
      if (content[i] === '{') depth += 1;
      else if (content[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          bodyEndIdx = i;
          break;
        }
      }
    }
    const body = content.slice(bodyStartIdx, bodyEndIdx);

    for (const paramName of paramNames) {
      if (
        ['e', 'event', 'ctx', 'canvas', 'doc', 'win', 'window', 'document', 'math', 'console'].includes(
          paramName
        )
      ) {
        continue;
      }

      const propRegex = new RegExp(`\\b${paramName}\\.([a-zA-Z0-9_$]+)`, 'g');
      const accessedProps = new Set();
      let pMatch;
      while ((pMatch = propRegex.exec(body)) !== null) {
        accessedProps.add(pMatch[1]);
      }

      if (accessedProps.size < GUT_SHARING_PROP_ACCESS_THRESHOLD) {
        continue;
      }

      // Check if the function mutates properties on the parameter OR if the parameter is a host/controller/refs instance
      const mutRegex = new RegExp(
        `\\b${paramName}\\.([a-zA-Z0-9_$]+)(?:\\.[a-zA-Z0-9_$]+)*\\s*(?:(?<![=!<>])=(?!=)|\\+=|-=|\\*=)`,
        'g'
      );
      const mutatedProps = new Set();
      while ((pMatch = mutRegex.exec(body)) !== null) {
        mutatedProps.add(pMatch[1]);
      }

      const isHostOrRefsParam =
        /^(ctrl|controller|host|instance|owner|self|refs|domRefs)$/i.test(paramName);

      if (isHostOrRefsParam || mutatedProps.size >= 2) {
        findings.push({
          file: relPath,
          fnName,
          paramName,
          accessedCount: accessedProps.size,
          mutatedCount: mutatedProps.size,
          sampleProps: Array.from(accessedProps).slice(0, 8),
        });
      }
    }
  }

  return findings;
}

/**
 * Pass 6: Single-Line Character Length Waterline & `as any` Count
 */
function analyzeLineLengthAndCasts(content, relPath) {
  const longLines = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length < SINGLE_LINE_CHAR_WARN_THRESHOLD) continue;
    const isSvgLine = /<path\b|\bd=["']|<svg\b|<polyline\b|<polygon\b|<circle\b/i.test(line);
    if (!isSvgLine) {
      longLines.push({
        file: relPath,
        line: i + 1,
        length: line.length,
      });
    }
  }
  const asAnyMatches = content.match(/\bas\s+any\b/g);
  const asAnyCount = asAnyMatches ? asAnyMatches.length : 0;
  return { longLines, asAnyCount };
}

// ---------------------------------------------------------------------------
// 4. Execute Full Scan
// ---------------------------------------------------------------------------
const allFiles = walkSourceFiles(SRC_DIR);
const allRelFiles = allFiles.map(toRelPath);

const lineViolations = [];
const lineWarnings = [];
const longLineWarnings = [];
let totalAsAnyCount = 0;
const asAnyByFile = [];
const configPurityErrors = [];
const layerViolations = [];
const widePropsErrors = [];
const widePropsWarnings = [];
const arbitrarySplitErrors = [];
const gutSharingErrors = [];
const dependencyGraph = new Map();
const incomingRefCounts = new Map(allRelFiles.map((f) => [f, 0]));

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

  // 4.2 Single-line character waterline & `as any` count
  const { longLines, asAnyCount } = analyzeLineLengthAndCasts(content, relFile);
  longLineWarnings.push(...longLines);
  if (asAnyCount > 0) {
    totalAsAnyCount += asAnyCount;
    asAnyByFile.push({ file: relFile, count: asAnyCount });
  }

  // 4.3 L1 config/ purity check
  const purityFindings = analyzeConfigPurity(content, relFile);
  configPurityErrors.push(...purityFindings);

  // 4.4 Arbitrary split filename check
  const baseName = path.basename(relFile, path.extname(relFile));
  if (ARBITRARY_SPLIT_FILENAME_RE.test(baseName)) {
    arbitrarySplitErrors.push({
      file: relFile,
      reason: `Filename "${baseName}" suggests arbitrary line-count halving or gut-sharing split instead of a semantic UI Slot boundary.`,
    });
  }

  // 4.5 Imports, Layer boundaries, Cycle graph & Incoming Reference counts
  const fromLayer = getLayerInfo(relFile);
  const rawImports = parseFileImports(content);
  const resolvedDeps = [];

  for (const imp of rawImports) {
    const targetAbs = resolveImportTarget(absFile, imp.spec);
    if (!targetAbs) continue;
    const targetRel = toRelPath(targetAbs);

    if (targetRel !== relFile && incomingRefCounts.has(targetRel)) {
      incomingRefCounts.set(targetRel, incomingRefCounts.get(targetRel) + 1);
    }

    if (!imp.isTypeOnly) {
      resolvedDeps.push(targetRel);
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
  dependencyGraph.set(relFile, resolvedDeps);

  // 4.6 Hardened Wide-Waist check (*Props, *Params, *Refs, *Slice, *Options & inline object params)
  const waistFindings = analyzeWideWaist(content, relFile);
  for (const finding of waistFindings) {
    if (finding.severity === 'error') {
      widePropsErrors.push(finding);
    } else {
      widePropsWarnings.push(finding);
    }
  }

  // 4.7 Hardened Gut-Sharing Function check
  const gutFindings = analyzeGutSharingFunctions(content, relFile);
  gutSharingErrors.push(...gutFindings);
}

// 4.8 Dead File / Unused Module & Forbidden UI-Core Orphan Detection
const deadFiles = [];
for (const [relFile, refCount] of incomingRefCounts.entries()) {
  if ((refCount === 0 && !ROOT_ENTRY_FILES.has(relFile)) || FORBIDDEN_UI_CORE_PATHS.has(relFile)) {
    deadFiles.push(relFile);
  }
}

// 4.9 Circular Dependency Detection (DFS)
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

// 4.10 TypeScript check
const tsResult = runTypeScriptCheck();

// ---------------------------------------------------------------------------
// 5. Report Output & Exit Code
// ---------------------------------------------------------------------------
const totalErrors =
  (tsResult.ok ? 0 : 1) +
  lineViolations.length +
  configPurityErrors.length +
  layerViolations.length +
  cycles.length +
  deadFiles.length +
  widePropsErrors.length +
  arbitrarySplitErrors.length +
  gutSharingErrors.length;

const summary = {
  scannedFiles: allFiles.length,
  typescriptOk: tsResult.ok,
  typescriptCommand: tsResult.command,
  typescriptErrors: tsResult.errors,
  lineErrorThreshold: LINE_ERROR_THRESHOLD,
  lineWarnThreshold: LINE_WARN_THRESHOLD,
  lineViolations,
  lineWarnings,
  singleLineCharWarnThreshold: SINGLE_LINE_CHAR_WARN_THRESHOLD,
  longLineWarnings,
  asAnyCount: totalAsAnyCount,
  asAnyByFile,
  configPurityErrors,
  layerViolations,
  circularDependencies: cycles,
  deadFiles,
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
console.log(' RCUITuner Architecture, TypeScript & Slot-Boundary Radar v2');
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
  `3. L1 config/ Purity : ${
    configPurityErrors.length === 0
      ? 'PASS (0 export let / localStorage / subscriber Sets)'
      : `FAIL (${configPurityErrors.length} violations)`
  }`
);
console.log(
  `4. Circular Deps     : ${
    cycles.length === 0 ? 'PASS (0 cycles)' : `FAIL (${cycles.length} cycles)`
  }`
);
console.log(
  `5. Dead File Scan    : ${
    deadFiles.length === 0 ? 'PASS (0 isolated files)' : `FAIL (${deadFiles.length} unused files)`
  }`
);
console.log(
  `6. File Volume (<${LINE_ERROR_THRESHOLD}) : ${
    lineViolations.length === 0
      ? `PASS (0 files >= ${LINE_ERROR_THRESHOLD} lines, ${lineWarnings.length} warnings >= ${LINE_WARN_THRESHOLD})`
      : `FAIL (${lineViolations.length} files >= ${LINE_ERROR_THRESHOLD} lines)`
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
  `8. Hygiene Metrics   : ${longLineWarnings.length} lines >= ${SINGLE_LINE_CHAR_WARN_THRESHOLD} chars (warn), ${totalAsAnyCount} \`as any\` casts`
);
console.log('----------------------------------------------------------------------');

if (!tsResult.ok) {
  console.error('\n[ERROR] TypeScript Compilation Failures:');
  for (const line of tsResult.errors.slice(0, 25)) {
    console.error(`  ${line}`);
  }
}

if (configPurityErrors.length > 0) {
  console.error('\n[ERROR] L1 config/ Purity Violations:');
  for (const v of configPurityErrors) {
    console.error(`  ${v.file}:${v.line} [${v.kind}] — ${v.reason}`);
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

if (deadFiles.length > 0) {
  console.error('\n[ERROR] Dead / Unreferenced Source Files (0 incoming imports):');
  for (const f of deadFiles) {
    console.error(`  ${f}`);
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
    `\n[ERROR] Wide-Waist Violation (>= ${WAIST_ERROR_THRESHOLD} child/helper fields or > 20 Recipe flat props):`
  );
  console.error(
    '  Hint: Group related fields into structured domain slices (`stateOverride`, `backdrop`, `geometry`)'
  );
  console.error(
    '        or bind child Slots directly to their store/context instead of prop-drilling.'
  );
  for (const p of widePropsErrors) {
    console.error(
      `  ${p.file} -> ${p.interfaceName} (${p.propCount} fields, ${p.setterCount} callbacks/setters)`
    );
  }
}

if (arbitrarySplitErrors.length > 0) {
  console.error('\n[ERROR] Arbitrary File-Halving / Non-Slot Filename Violations:');
  for (const a of arbitrarySplitErrors) {
    console.error(`  ${a.file}: ${a.reason}`);
  }
}

if (gutSharingErrors.length > 0) {
  console.error('\n[ERROR] Gut-Sharing Helper Function Violations:');
  for (const g of gutSharingErrors) {
    console.error(
      `  ${g.file} -> ${g.fnName}(${g.paramName}) accesses ${g.accessedCount} props (${g.sampleProps.join(', ')})`
    );
  }
}

if (lineWarnings.length > 0) {
  console.warn(`\n[WARN] Files Approaching Line Limit (>= ${LINE_WARN_THRESHOLD} lines):`);
  for (const f of lineWarnings) {
    console.warn(`  ${f.file} (${f.lines} lines)`);
  }
}

if (widePropsWarnings.length > 0) {
  console.warn(
    `\n[WARN] Wide Waist Interfaces / Params (>= ${WAIST_WARN_THRESHOLD} fields):`
  );
  for (const p of widePropsWarnings) {
    console.warn(
      `  ${p.file} -> ${p.interfaceName} (${p.propCount} fields, ${p.setterCount} callbacks/setters)`
    );
  }
}

if (totalErrors > 0) {
  console.error(`\nRADAR RESULT: FAILED with ${totalErrors} architectural/compile error(s).`);
  process.exit(1);
} else {
  console.log('\nRADAR RESULT: PASSED (0 architectural or TypeScript errors).');
  process.exit(0);
}
