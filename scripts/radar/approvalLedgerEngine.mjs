import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './constants.mjs';
import {
  collectSurfaceSubtree,
  computeSizingAndConfigHash,
  computeTemplateHash,
  discoverSurfaceVariantUnits,
  normalizeVisualAstSource,
  sha256Hex16,
} from './semanticHashExtractor.mjs';

const LEDGER_REL_PATH = 'src/ui-core/manifest/uiApprovalLedger.json';
const CALIBRATION_REL_PATH = 'src/ui-core/manifest/surfaceCalibrationOverrides.json';

function loadJsonSafe(relPath, fallback) {
  const abs = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(abs)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch {
    return fallback;
  }
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

function classifyDriftBucket({ status, visualDrifted, configDrifted, templateDrifted }) {
  if (!status || status === 'unreviewed' || status === 'pending') {
    return { driftState: 'unreviewed', bucket: 'bucket-1-visual' };
  }
  if (status === 'rejected') {
    return { driftState: 'rejected', bucket: 'bucket-1-visual' };
  }
  if (visualDrifted) {
    return { driftState: 'visual-stale', bucket: 'bucket-1-visual' };
  }
  if (configDrifted) {
    return { driftState: 'config-stale', bucket: 'bucket-2-config' };
  }
  if (templateDrifted) {
    return { driftState: 'template-stale', bucket: 'bucket-3-template' };
  }
  return {
    driftState: status === 'deferred' ? 'deferred' : 'approved',
    bucket: 'clean',
  };
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

  const fileVisualHashCache = new Map();
  const getFileVisualHash = (uiRel) => {
    if (fileVisualHashCache.has(uiRel)) return fileVisualHashCache.get(uiRel);
    const uiAbs = path.join(ROOT_DIR, uiRel);
    const uiContent = fs.readFileSync(uiAbs, 'utf8');
    const h = sha256Hex16(normalizeVisualAstSource(uiContent));
    fileVisualHashCache.set(uiRel, h);
    return h;
  };

  const computedSurfaces = {};
  const driftedSurfaces = [];
  const driftedVariants = [];
  const bucketCounts = {
    'bucket-1-visual': 0,
    'bucket-2-config': 0,
    'bucket-3-template': 0,
    clean: 0,
  };

  let totalVariantUnits = 0;
  let approvedVariantUnits = 0;

  for (const entryFile of surfaceEntryFiles) {
    const surfaceId = deriveSurfaceId(entryFile);
    const surfaceKind = entryFile.includes('/panels/') ? 'floating-window' : 'menu-recipe';
    const absEntry = path.join(ROOT_DIR, entryFile);
    const entryContent = fs.readFileSync(absEntry, 'utf8');

    const { uiFiles, alphaDeps, alphaDependencies } = collectSurfaceSubtree(
      entryFile,
      dependencyGraph
    );
    const fileVisualHashes = {};
    for (const uiRel of uiFiles) {
      fileVisualHashes[uiRel] = getFileVisualHash(uiRel);
    }

    const visualAstHash = sha256Hex16(
      Object.entries(fileVisualHashes)
        .map(([k, v]) => `${k}:${v}`)
        .join('|')
    );
    const sizingAndConfigHash = computeSizingAndConfigHash(
      surfaceId,
      entryContent,
      calibrationOverrides,
      alphaDeps
    );

    const prevRecord = existingLedger.surfaces?.[surfaceId];
    const nowIso = new Date().toISOString();

    const variantDescriptors = discoverSurfaceVariantUnits(entryFile, dependencyGraph);
    const computedVariants = {};

    for (const vDesc of variantDescriptors) {
      totalVariantUnits += 1;
      const unitId = `${surfaceId}:${vDesc.variantId}`;
      const vSubtree = collectSurfaceSubtree(vDesc.entryFile, dependencyGraph);
      const vFileHashes = {};
      for (const vf of vSubtree.uiFiles) {
        vFileHashes[vf] = getFileVisualHash(vf);
      }
      const vVisualAstHash = sha256Hex16(
        Object.entries(vFileHashes)
          .map(([k, v]) => `${k}:${v}`)
          .join('|')
      );
      const prevUnit = prevRecord?.variants?.[vDesc.variantId];
      computedVariants[vDesc.variantId] = {
        unitId,
        variantId: vDesc.variantId,
        label: vDesc.label,
        entryFile: vDesc.entryFile,
        status: prevUnit?.status ?? prevRecord?.status ?? 'approved',
        visualAstHash: vVisualAstHash,
        fileVisualHashes: vFileHashes,
        alphaDependencies: vSubtree.alphaDependencies,
        approvedAt: prevUnit?.approvedAt || prevRecord?.approvedAt || nowIso,
      };

      if (!syncApproval && prevUnit && prevUnit.visualAstHash !== vVisualAstHash) {
        const changedSubFiles = Object.entries(vFileHashes)
          .filter(([fRel, fHash]) => prevUnit.fileVisualHashes?.[fRel] !== fHash)
          .map(([fRel]) => fRel);
        driftedVariants.push({
          unitId,
          surfaceId,
          variantId: vDesc.variantId,
          entryFile: vDesc.entryFile,
          changedFiles: changedSubFiles,
        });
      } else {
        approvedVariantUnits += 1;
      }
    }

    computedSurfaces[surfaceId] = {
      status: prevRecord?.status ?? 'approved',
      surfaceKind,
      entryFile,
      templateHash,
      sizingAndConfigHash,
      visualAstHash,
      fileVisualHashes,
      alphaDeps,
      alphaDependencies,
      ...(Object.keys(computedVariants).length > 0 ? { variants: computedVariants } : {}),
      approvedAt: prevRecord?.approvedAt || nowIso,
    };

    if (!syncApproval) {
      if (!prevRecord) {
        bucketCounts['bucket-1-visual'] += 1;
        driftedSurfaces.push({
          surfaceId,
          entryFile,
          driftState: 'unreviewed',
          bucket: 'bucket-1-visual',
          reason: 'Missing from uiApprovalLedger.json (new unreviewed surface)',
          changedFiles: [entryFile],
        });
      } else {
        const changedFiles = [];
        for (const [fRel, fHash] of Object.entries(fileVisualHashes)) {
          if (prevRecord.fileVisualHashes?.[fRel] !== fHash) {
            changedFiles.push(fRel);
          }
        }
        const visualDrifted = prevRecord.visualAstHash !== visualAstHash;
        const configDrifted = prevRecord.sizingAndConfigHash !== sizingAndConfigHash;
        const templateDrifted = prevRecord.templateHash !== templateHash;
        const { driftState, bucket } = classifyDriftBucket({
          status: prevRecord.status,
          visualDrifted,
          configDrifted,
          templateDrifted,
        });
        bucketCounts[bucket] += 1;

        if (bucket !== 'clean') {
          driftedSurfaces.push({
            surfaceId,
            entryFile,
            driftState,
            bucket,
            reason: visualDrifted
              ? `Visual AST subtree changed (${changedFiles.join(', ') || entryFile})`
              : configDrifted
              ? 'Sizing or DEFAULT_*_CONFIG values changed'
              : 'Template shell hash changed',
            changedFiles,
          });
        }
      }
    } else {
      bucketCounts.clean += 1;
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
    totalVariantUnits,
    approvedVariantUnits,
    bucketCounts,
    driftedSurfaces,
    driftedVariants,
    synced: syncApproval,
  };
}
