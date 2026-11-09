import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  FRAGMENT_EXEMPT_FILENAME_RE,
  LAYER_RULES,
  MAX_ANY_PER_FILE,
  MIN_FRAGMENT_LINE_THRESHOLD,
  ROOT_DIR,
  ROOT_ENTRY_FILES,
  SINGLE_LINE_CHAR_WARN_THRESHOLD,
} from './constants.mjs';

export function walkSourceFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === 'scripts' ||
      entry.name.startsWith('.')
    ) {
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

export function toRelPath(absPath) {
  return path.relative(ROOT_DIR, absPath).split(path.sep).join('/');
}

export function getLayerInfo(relPath) {
  for (const rule of LAYER_RULES) {
    if (relPath.startsWith(rule.prefix) || relPath === rule.prefix) {
      return rule;
    }
  }
  return { prefix: 'src/', rank: 9, name: 'L9:AppRoot' };
}

export function resolveImportTarget(fromFileAbs, importSpec) {
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

export function checkLockfileInvariants() {
  const violations = [];
  for (const forbiddenLock of ['package-lock.json', 'yarn.lock', 'bun.lockb', 'bun.lock']) {
    const absLock = path.join(ROOT_DIR, forbiddenLock);
    if (fs.existsSync(absLock)) {
      violations.push(
        `[DUPLICATE LOCKFILE VIOLATION] Found "${forbiddenLock}" alongside "pnpm-lock.yaml". Delete "${forbiddenLock}".`
      );
    }
  }
  if (!fs.existsSync(path.join(ROOT_DIR, 'pnpm-lock.yaml'))) {
    violations.push(
      '[LOCKFILE HYGIENE VIOLATION] Missing "pnpm-lock.yaml" in repository root.'
    );
  }
  return violations;
}

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
    if (/Version\s+[57]\./.test(versionOut)) {
      return 'tsc --noEmit';
    }
  } catch {
    // Fall through
  }
  return null;
}

export function runTypeScriptCheck() {
  const cmd = resolveTscCommand();
  if (!cmd) {
    return {
      ok: false,
      command: 'tsc --noEmit (missing local node_modules/.bin/tsc)',
      errors: [
        'Local TypeScript 7.x compiler not found in node_modules/.bin/tsc. Run "npm install -g pnpm --force && pnpm install" first.',
      ],
    };
  }
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

export function parseFileImports(content, fromFileAbs = null) {
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
  if (fromFileAbs) {
    const globRegex =
      /\b(?:import\.meta\.glob|importMetaGlob)\s*(?:<[\s\S]*?>)?\s*\(\s*['"]([^'"]+)['"]/g;
    while ((match = globRegex.exec(content)) !== null) {
      const pattern = match[1];
      for (const expanded of expandRelativeGlobPattern(fromFileAbs, pattern)) {
        imports.push({ spec: expanded, isTypeOnly: false });
      }
    }
  }
  return imports;
}

function expandRelativeGlobPattern(fromFileAbs, pattern) {
  if (!pattern.startsWith('.')) return [];
  const fromDir = path.dirname(fromFileAbs);
  const braceMatch = pattern.match(/^(.*)\{([^}]+)\}(.*)$/);
  const subPatterns = braceMatch
    ? braceMatch[2].split(',').map((opt) => `${braceMatch[1]}${opt.trim()}${braceMatch[3]}`)
    : [pattern];

  const results = [];
  for (const sub of subPatterns) {
    const targetDir = path.resolve(fromDir, path.posix.dirname(sub));
    const filePattern = path.posix.basename(sub);
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) continue;
    const regexStr =
      '^' +
      filePattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*') +
      '$';
    const fileRe = new RegExp(regexStr);
    for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
      if (entry.isFile() && fileRe.test(entry.name)) {
        const absMatch = path.join(targetDir, entry.name);
        let relSpec = path.relative(fromDir, absMatch).split(path.sep).join('/');
        if (!relSpec.startsWith('.')) relSpec = `./${relSpec}`;
        results.push(relSpec);
      }
    }
  }
  return results;
}

export function analyzeConfigPurity(content, relPath) {
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

export function analyzeLineLengthAndCasts(content, relPath) {
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

export function analyzeFragmentationWarnings(fileStatsList) {
  const smallFilesByDir = new Map();
  for (const stat of fileStatsList) {
    if (stat.lines >= MIN_FRAGMENT_LINE_THRESHOLD) continue;
    if (FRAGMENT_EXEMPT_FILENAME_RE.test(stat.file)) continue;
    if (stat.file.startsWith('src/ui-core/manifest/')) continue;
    const dir = path.posix.dirname(stat.file);
    if (!smallFilesByDir.has(dir)) {
      smallFilesByDir.set(dir, []);
    }
    smallFilesByDir.get(dir).push(stat);
  }

  const fragmentationWarnings = [];
  for (const [dir, items] of smallFilesByDir.entries()) {
    if (items.length >= 2) {
      for (const item of items) {
        fragmentationWarnings.push({
          file: item.file,
          lines: item.lines,
          dir,
          siblingSmallCount: items.length,
        });
      }
    }
  }
  return fragmentationWarnings;
}

export function detectCircularDependencies(dependencyGraph) {
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
  return cycles;
}

function stripCommentsForScan(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/**
 * Root-Cause Zero Value Re-Export Gate:
 * Catches BOTH direct (`export { x } from './y'`, `export * from './y'`)
 * AND indirect two-step bypasses (`import { x } from './y'; export { x };`).
 * Only `export type { ... }` is permitted outside `src/ui-core/index.ts`.
 */
export function analyzeValueReExports(content, relPath) {
  if (relPath === 'src/ui-core/index.ts') return [];
  const violations = [];
  const cleaned = stripCommentsForScan(content);

  // 1. Direct `export * from '...'`
  const starExportRe = /(?:^|\n)\s*export\s+(?!type\b)\*\s*(?:as\s+\w+\s+)?from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = starExportRe.exec(cleaned)) !== null) {
    violations.push({
      file: relPath,
      kind: 'direct-star-reexport',
      target: m[1],
      reason: `Direct value star re-export (\`export * from '${m[1]}'\`) is forbidden.`,
    });
  }

  // 2. Direct `export { a, b } from '...'`
  const namedFromRe = /(?:^|\n)\s*export\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
  while ((m = namedFromRe.exec(cleaned)) !== null) {
    if (m[1]) continue; // `export type { ... } from '...'`
    const specs = m[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const valueSpecs = specs.filter((s) => !/^type\s+/.test(s));
    if (valueSpecs.length > 0) {
      violations.push({
        file: relPath,
        kind: 'direct-named-reexport',
        target: m[3],
        symbols: valueSpecs,
        reason: `Direct value re-export (\`export { ${valueSpecs.join(', ')} } from '${m[3]}'\`) is forbidden. Import from canonical source instead.`,
      });
    }
  }

  // 3. Indirect two-step value re-export (`import { x } from './y'; export { x };`)
  const importedValueLocals = new Map();
  const importStmtRe = /(?:^|\n)\s*import\s+(type\s+)?([\s\S]*?)\s+from\s*['"]([^'"]+)['"]/g;
  while ((m = importStmtRe.exec(cleaned)) !== null) {
    if (m[1]) continue;
    const clause = m[2].trim();
    const fromSpec = m[3];
    const braceMatch = clause.match(/\{([^}]*)\}/);
    if (braceMatch) {
      for (const rawSpec of braceMatch[1].split(',').map((s) => s.trim()).filter(Boolean)) {
        if (/^type\s+/.test(rawSpec)) continue;
        const asParts = rawSpec.split(/\s+as\s+/);
        const localName = (asParts[1] || asParts[0]).trim();
        if (localName) importedValueLocals.set(localName, fromSpec);
      }
    }
    const beforeBrace = clause.replace(/\{[\s\S]*?\}/, '').replace(/,/g, '').trim();
    if (beforeBrace && !beforeBrace.startsWith('*')) {
      importedValueLocals.set(beforeBrace, fromSpec);
    }
  }

  const localExportRe = /(?:^|\n)\s*export\s+(type\s+)?\{([^}]*)\}(?!\s*from\b)/g;
  while ((m = localExportRe.exec(cleaned)) !== null) {
    if (m[1]) continue;
    const specs = m[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const reexported = [];
    for (const rawSpec of specs) {
      if (/^type\s+/.test(rawSpec)) continue;
      const asParts = rawSpec.split(/\s+as\s+/);
      const localName = asParts[0].trim();
      if (importedValueLocals.has(localName)) {
        reexported.push(`${localName} (from ${importedValueLocals.get(localName)})`);
      }
    }
    if (reexported.length > 0) {
      violations.push({
        file: relPath,
        kind: 'indirect-two-step-reexport',
        symbols: reexported,
        reason: `Indirect two-step value re-export (\`import + export { ... }\`) is forbidden: ${reexported.join(', ')}.`,
      });
    }
  }

  return violations;
}

/**
 * Single-Reference Micro-Fragment Gate (<65L with <= 1 incoming reference):
 * Matches RocketCompanion's `MIN_NON_TRIVIAL_LINES = 65` check.
 */
export function analyzeMicroFragments(fileStatsList, incomingRefCounts) {
  const microFragmentErrors = [];
  for (const stat of fileStatsList) {
    if (stat.lines >= MIN_FRAGMENT_LINE_THRESHOLD) continue;
    if (ROOT_ENTRY_FILES.has(stat.file)) continue;
    const totalRefs = incomingRefCounts.get(stat.file) || 0;
    if (totalRefs <= 1) {
      microFragmentErrors.push({
        file: stat.file,
        lines: stat.lines,
        incomingRefs: totalRefs,
        reason: `File is only ${stat.lines} lines (< ${MIN_FRAGMENT_LINE_THRESHOLD}L) and has ${totalRefs} incoming reference(s). Inline into its caller.`,
      });
    }
  }
  return microFragmentErrors;
}

const CJK_RE = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const FORBIDDEN_SOCCER_RE = /\bsocc(?:er|ar)\b/i;
const FORBIDDEN_SECRET_URL_RE = /wss:\/\/[a-z0-9.-]*ngrok|https:\/\/[a-z0-9.-]*supabase\.co\/storage\/v1\/object\/sign/i;

export function analyzeHygieneInvariants(content, relPath) {
  const cjkViolations = [];
  const emojiViolations = [];
  const domainViolations = [];
  const anyViolations = [];

  const lines = content.split(/\r?\n/);
  let fileAnyCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (CJK_RE.test(line)) {
      cjkViolations.push({ file: relPath, line: i + 1 });
    }
    if (EMOJI_RE.test(line)) {
      emojiViolations.push({ file: relPath, line: i + 1 });
    }
    const stripped = line.replace(/\/\/.*$/, '');
    if (FORBIDDEN_SOCCER_RE.test(stripped)) {
      domainViolations.push({
        file: relPath,
        line: i + 1,
        kind: 'non-neutral-ball-term',
        reason: 'Use neutral "ball" terminology instead of "soccer"/"soccar".',
      });
    }
    if (FORBIDDEN_SECRET_URL_RE.test(stripped)) {
      domainViolations.push({
        file: relPath,
        line: i + 1,
        kind: 'hardcoded-broker-or-secret-url',
        reason: 'Hardcoded private broker/signed URL detected.',
      });
    }
    const anyMatches = stripped.match(/(?::\s*any\b|\bas\s+any\b|<\s*any\s*>)/g);
    if (anyMatches) {
      fileAnyCount += anyMatches.length;
      if (/^\s*export\b/.test(stripped)) {
        anyViolations.push({
          file: relPath,
          line: i + 1,
          kind: 'boundary-any',
          reason: 'Exported module boundary must not use `any`.',
        });
      }
    }
  }

  if (fileAnyCount > MAX_ANY_PER_FILE) {
    anyViolations.push({
      file: relPath,
      line: 1,
      kind: 'excessive-any',
      reason: `File contains ${fileAnyCount} \`any\` usages (max ${MAX_ANY_PER_FILE}).`,
    });
  }

  return { cjkViolations, emojiViolations, domainViolations, anyViolations, fileAnyCount };
}

