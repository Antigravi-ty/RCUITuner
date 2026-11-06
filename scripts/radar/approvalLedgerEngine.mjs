import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './constants.mjs';

const LEDGER_REL_PATH = 'src/ui-core/manifest/uiApprovalLedger.json';
const CALIBRATION_REL_PATH = 'src/ui-core/manifest/surfaceCalibrationOverrides.json';

function sha256Hex16(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 16);
}

/**
 * Strips comments and normalizes Beta visual structure of a UI `.tsx`/`.ts` file
 * while ignoring Alpha store-internal logic changes.
 */
function normalizeVisualAstSource(content) {
  const withoutComments = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  const visualTokens = [];
  // 1. Capture JSX tags and their attribute names/literals
  const jsxTagRe = /<\/?[A-Za-z0-9_.]+(?:\s+[A-Za-z0-9_:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*\s*\/?>/g;
  let match;
  while ((match = jsxTagRe.exec(withoutComments)) !== null) {
    visualTokens.push(match[0].replace(/\s+/g, ' ').trim());
  }

  // 2. Capture className / style / variant / size / layout literals
  const visualPropRe =
    /\b(?:className|style|variant|size|width|height|minWidth|minHeight|maxHeight|padding|gap|columns)\s*[:=]\s*(?:`[^`]*`|"[^"]*"|'[^']*'|\{[^{}]*\})/g;
  while ((match = visualPropRe.exec(withoutComments)) !== null) {
    visualTokens.push(match[0].replace(/\s+/g, ' ').trim());
  }

  if (visualTokens.length === 0) {
    return withoutComments.replace(/\s+/g, ' ').trim();
  }
  return visualTokens.join('\n');
}

function computeTemplateHash() {
  const shellFiles = [
    'src/ui-core/layout/Panel.tsx',
    'src/ui-core/layout/PanelFooter.tsx',
    'src/ui-core/layout/UniversalThreeStageShell.tsx',
  ];
  const parts = [];
  for (const rel of shellFiles) {
    const abs = path.join(ROOT_DIR, rel);
    if (fs.existsSync(abs)) {
      parts.push(`${rel}:${normalizeVisualAstSource(fs.readFileSync(abs, 'utf8'))}`);
    }
  }
  return sha256Hex16(parts.join('|'));
}

function loadJsonSafe(relPath, fallback) {
  const abs = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(abs)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch {
    return fallback;
  }
}

function collectSurfaceSubtree(entryRel, dependencyGraph) {
  const uiFiles = new Set([entryRel]);
  const alphaDeps = new Set();
  const queue = [entryRel];

  while (queue.length > 0) {
    const curr = queue.shift();
    const deps = dependencyGraph.get(curr) || [];
    for (const dep of deps) {
      if (
        dep.startsWith('src/ui-core/stores/') ||
        dep.startsWith('src/ui-core/config/') ||
        dep.startsWith('src/ui-core/tokens/') ||
        dep.startsWith('src/ui-core/utils/') ||
        dep.startsWith('src/ui-core/manifest/')
      ) {
        alphaDeps.add(dep);
        continue;
      }
      if (
        dep.startsWith('src/ui-core/panels/') ||
        dep.startsWith('src/ui-core/recipes/') ||
        dep.startsWith('src/ui-core/compounds/') ||
        dep.startsWith('src/ui-core/primitives/') ||
        dep.startsWith('src/ui-core/charts/')
      ) {
        if (!uiFiles.has(dep)) {
          uiFiles.add(dep);
          queue.push(dep);
        }
      }
    }
  }

  return {
    uiFiles: Array.from(uiFiles).sort(),
    alphaDeps: Array.from(alphaDeps).sort(),
  };
}

function computeSizingAndConfigHash(surfaceId, entryContent, calibrationOverrides) {
  const metaMatch = entryContent.match(/export\s+const\s+SURFACE_META[\s\S]*?\};/);
  const metaSnippet = metaMatch ? metaMatch[0].replace(/\s+/g, ' ').trim() : '';
  const overrideObj = calibrationOverrides[surfaceId] ?? null;
  return sha256Hex16(
    JSON.stringify({
      surfaceId,
      metaSnippet,
      overrideObj,
    })
  );
}

function deriveSurfaceId(relFile) {
  const base = path.basename(relFile, path.extname(relFile));
  if (base.endsWith('FloatingWindow')) {
    const stem = base.replace(/FloatingWindow$/, '');
    return `floating:${stem
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()}`;
  }
  if (base.endsWith('Recipe') || base.endsWith('Drawer')) {
    return `recipe:${base}`;
  }
  return base;
}

export function checkAndSyncApprovalLedger({
  allRelFiles,
  dependencyGraph,
  syncApproval = false,
}) {
  const templateHash = computeTemplateHash();
  const calibrationOverrides = loadJsonSafe(CALIBRATION_REL_PATH, {});
  const existingLedger = loadJsonSafe(LEDGER_REL_PATH, {
    schemaVersion: 1,
    updatedAt: '',
    templateHash: '',
    surfaces: {},
  });

  const surfaceEntryFiles = allRelFiles
    .filter(
      (f) =>
        /^src\/ui-core\/panels\/(user|dev)\/\w+FloatingWindow\.tsx$/.test(f) ||
        /^src\/ui-core\/recipes\/Layer[1-5]\w+Recipe\.tsx$/.test(f) ||
        f === 'src/ui-core/recipes/StaticTrainingShotInspectorDrawer.tsx'
    )
    .sort();

  const computedSurfaces = {};
  const driftedSurfaces = [];

  for (const entryFile of surfaceEntryFiles) {
    const surfaceId = deriveSurfaceId(entryFile);
    const surfaceKind = entryFile.includes('/panels/') ? 'floating-window' : 'menu-recipe';
    const absEntry = path.join(ROOT_DIR, entryFile);
    const entryContent = fs.readFileSync(absEntry, 'utf8');

    const { uiFiles, alphaDeps } = collectSurfaceSubtree(entryFile, dependencyGraph);
    const fileVisualHashes = {};
    for (const uiRel of uiFiles) {
      const uiAbs = path.join(ROOT_DIR, uiRel);
      const uiContent = fs.readFileSync(uiAbs, 'utf8');
      fileVisualHashes[uiRel] = sha256Hex16(normalizeVisualAstSource(uiContent));
    }

    const visualAstHash = sha256Hex16(
      Object.entries(fileVisualHashes)
        .map(([k, v]) => `${k}:${v}`)
        .join('|')
    );
    const sizingAndConfigHash = computeSizingAndConfigHash(
      surfaceId,
      entryContent,
      calibrationOverrides
    );

    const prevRecord = existingLedger.surfaces?.[surfaceId];
    const nowIso = new Date().toISOString();

    computedSurfaces[surfaceId] = {
      status: prevRecord?.status ?? 'approved',
      surfaceKind,
      entryFile,
      templateHash,
      sizingAndConfigHash,
      visualAstHash,
      fileVisualHashes,
      alphaDeps,
      approvedAt: prevRecord?.approvedAt || nowIso,
    };

    if (!syncApproval) {
      if (!prevRecord) {
        driftedSurfaces.push({
          surfaceId,
          entryFile,
          reason: 'Missing from uiApprovalLedger.json (new unapproved surface)',
          changedFiles: [entryFile],
        });
      } else {
        const changedFiles = [];
        for (const [fRel, fHash] of Object.entries(fileVisualHashes)) {
          if (prevRecord.fileVisualHashes?.[fRel] !== fHash) {
            changedFiles.push(fRel);
          }
        }
        if (
          prevRecord.templateHash !== templateHash ||
          prevRecord.sizingAndConfigHash !== sizingAndConfigHash ||
          prevRecord.visualAstHash !== visualAstHash
        ) {
          driftedSurfaces.push({
            surfaceId,
            entryFile,
            reason:
              prevRecord.visualAstHash !== visualAstHash
                ? 'Beta Visual AST hash drifted'
                : prevRecord.sizingAndConfigHash !== sizingAndConfigHash
                ? 'Sizing/Config hash drifted'
                : 'Template shell hash drifted',
            changedFiles,
          });
        }
      }
    }
  }

  if (syncApproval) {
    const nextLedger = {
      schemaVersion: 1,
      updatedAt: new Date().toISOString(),
      templateHash,
      surfaces: computedSurfaces,
    };
    const absLedger = path.join(ROOT_DIR, LEDGER_REL_PATH);
    fs.mkdirSync(path.dirname(absLedger), { recursive: true });
    fs.writeFileSync(absLedger, `${JSON.stringify(nextLedger, null, 2)}\n`, 'utf8');
  }

  return {
    totalSurfaces: surfaceEntryFiles.length,
    approvedCount: surfaceEntryFiles.length - driftedSurfaces.length,
    driftedSurfaces,
    synced: syncApproval,
  };
}
