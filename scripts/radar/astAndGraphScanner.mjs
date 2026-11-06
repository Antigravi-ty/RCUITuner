import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  FRAGMENT_EXEMPT_FILENAME_RE,
  LAYER_RULES,
  MIN_FRAGMENT_LINE_THRESHOLD,
  ROOT_DIR,
  SINGLE_LINE_CHAR_WARN_THRESHOLD,
} from './constants.mjs';

export function walkSourceFiles(dir, acc = []) {
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
  for (const forbiddenLock of ['package-lock.json', 'yarn.lock']) {
    const absLock = path.join(ROOT_DIR, forbiddenLock);
    if (fs.existsSync(absLock)) {
      violations.push(
        `[DUPLICATE LOCKFILE VIOLATION] Found "${forbiddenLock}" alongside "pnpm-lock.yaml". Delete "${forbiddenLock}".`
      );
    }
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
    if (/Version\s+5\./.test(versionOut)) {
      return 'tsc --noEmit';
    }
  } catch {
    // Fall through
  }
  return 'npx --no-install tsc --noEmit';
}

export function runTypeScriptCheck() {
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

export function parseFileImports(content) {
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
