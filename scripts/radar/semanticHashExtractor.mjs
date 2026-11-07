import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './constants.mjs';

export function sha256Hex16(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 16);
}

/**
 * Strips comments and normalizes Beta visual structure of a UI `.tsx`/`.ts` file
 * while ignoring Alpha store-internal logic changes.
 */
export function normalizeVisualAstSource(content) {
  const withoutComments = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  const visualTokens = [];
  const jsxTagRe =
    /<\/?[A-Za-z0-9_.]+(?:\s+[A-Za-z0-9_:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*\s*\/?>/g;
  let match;
  while ((match = jsxTagRe.exec(withoutComments)) !== null) {
    visualTokens.push(match[0].replace(/\s+/g, ' ').trim());
  }

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

export function computeTemplateHash() {
  const shellFiles = [
    'src/ui-core/layout/Panel.tsx',
    'src/ui-core/layout/PanelFooter.tsx',
    'src/ui-core/layout/UniversalThreeStageShell.tsx',
    'src/ui-core/navigation/FloatingWindowInstance.tsx',
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

export function mapFileToSemanticAlphaId(relFile) {
  if (
    relFile === 'src/ui-core/layout/Panel.tsx' ||
    relFile === 'src/ui-core/layout/PanelFooter.tsx' ||
    relFile === 'src/ui-core/layout/UniversalThreeStageShell.tsx' ||
    relFile === 'src/ui-core/navigation/FloatingWindowInstance.tsx'
  ) {
    return 'Alpha:3StagePanelShell';
  }
  if (
    relFile.startsWith('src/ui-core/primitives/') ||
    relFile.startsWith('src/ui-core/compounds/') ||
    relFile.startsWith('src/ui-core/charts/') ||
    relFile.startsWith('src/ui-core/layout/') ||
    relFile.startsWith('src/ui-core/hud/')
  ) {
    const base = path.basename(relFile, path.extname(relFile));
    if (/^[A-Z]/.test(base)) {
      return `Alpha:${base}`;
    }
  }
  return null;
}

/**
 * Recursively collects the UI subtree closure (`uiFiles`) and Alpha dependencies
 * (`alphaDeps` file paths + `alphaDependencies` semantic `Alpha:*` component IDs).
 */
export function collectSurfaceSubtree(entryRel, dependencyGraph) {
  const uiFiles = new Set([entryRel]);
  const alphaDeps = new Set();
  const alphaComponentIds = new Set();
  const queue = [entryRel];

  while (queue.length > 0) {
    const curr = queue.shift();
    const deps = dependencyGraph.get(curr) || [];
    for (const dep of deps) {
      const semanticAlpha = mapFileToSemanticAlphaId(dep);
      if (semanticAlpha) {
        alphaComponentIds.add(semanticAlpha);
      }

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
        dep.startsWith('src/ui-core/charts/') ||
        dep.startsWith('src/ui-core/hud/')
      ) {
        if (!uiFiles.has(dep)) {
          uiFiles.add(dep);
          queue.push(dep);
        }
      }
    }
  }

  const sortedAlphaDeps = Array.from(alphaDeps).sort();
  const sortedSemanticAlpha = Array.from(alphaComponentIds).sort();
  return {
    uiFiles: Array.from(uiFiles).sort(),
    alphaDeps: sortedAlphaDeps,
    alphaDependencies: [...sortedSemanticAlpha, ...sortedAlphaDeps],
  };
}

function extractPresetSnippetById(fileRel, id) {
  const abs = path.join(ROOT_DIR, fileRel);
  if (!fs.existsSync(abs)) return '';
  const content = fs.readFileSync(abs, 'utf8');
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`id:\\s*['"]${escapedId}['"][\\s\\S]*?\\n\\s*\\}`, 'm');
  const m = content.match(re);
  return m ? m[0].replace(/\s+/g, ' ').trim() : '';
}

function extractDefaultConfigSnippets(alphaDeps) {
  const snippets = [];
  for (const dep of alphaDeps) {
    if (!dep.startsWith('src/ui-core/config/')) continue;
    const abs = path.join(ROOT_DIR, dep);
    if (!fs.existsSync(abs)) continue;
    const content = fs.readFileSync(abs, 'utf8');
    const re = /export\s+const\s+(DEFAULT_[A-Z0-9_]+)\s*(?::[^=]+)?=\s*([\s\S]*?);\n/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      snippets.push(`${dep}#${m[1]}:${m[2].replace(/\s+/g, ' ').trim()}`);
    }
  }
  return snippets;
}

export function computeSizingAndConfigHash(
  surfaceId,
  entryContent,
  calibrationOverrides,
  alphaDeps = []
) {
  const metaMatch = entryContent.match(/export\s+const\s+SURFACE_META[\s\S]*?\};/);
  const metaSnippet = metaMatch ? metaMatch[0].replace(/\s+/g, ' ').trim() : '';
  const overrideObj = calibrationOverrides[surfaceId] ?? null;

  let presetSnippet = '';
  if (surfaceId.startsWith('floating:')) {
    const rawId = surfaceId.slice('floating:'.length);
    presetSnippet =
      extractPresetSnippetById('src/ui-core/stores/floatingPresets.ts', rawId) ||
      extractPresetSnippetById('src/ui-core/stores/devFloatingPresets.ts', rawId);
  } else if (surfaceId.startsWith('recipe:')) {
    const rawName = surfaceId.slice('recipe:'.length);
    const kebab = rawName
      .replace(/Recipe$/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/(Layer[1-5])([A-Z])/g, '$1-$2')
      .toLowerCase();
    const absTokens = path.join(ROOT_DIR, 'src/ui-core/tokens/menuLayoutTokens.ts');
    if (fs.existsSync(absTokens)) {
      const tokensContent = fs.readFileSync(absTokens, 'utf8');
      const escaped = kebab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`['"]${escaped}['"]\\s*:\\s*\\{[\\s\\S]*?\\}`, 'm');
      const m = tokensContent.match(re);
      if (m) presetSnippet = m[0].replace(/\s+/g, ' ').trim();
    }
  }

  const defaultConfigSnippets = extractDefaultConfigSnippets(alphaDeps);

  return sha256Hex16(
    JSON.stringify({
      surfaceId,
      metaSnippet,
      presetSnippet,
      defaultConfigSnippets,
      overrideObj,
    })
  );
}

/**
 * Discovers sub-variant / Tab entry files (`SurfaceVariantApprovalUnit`) for multi-tab surfaces
 * (such as `Layer2SettingsRecipe`, `Layer2GarageRecipe`, `BoostPadTunerFloatingWindow`, etc.).
 */
export function discoverSurfaceVariantUnits(entryRel, dependencyGraph) {
  const directDeps = dependencyGraph.get(entryRel) || [];
  const tabDeps = directDeps.filter((dep) => {
    if (!dep.startsWith('src/ui-core/panels/') && !dep.startsWith('src/ui-core/recipes/')) {
      return false;
    }
    const base = path.basename(dep, path.extname(dep));
    return base.endsWith('Tab') || base.endsWith('BenchPanel') || dep.includes('/tabs/');
  });

  if (tabDeps.length < 2) {
    return [];
  }

  return tabDeps.map((depRel) => {
    const base = path.basename(depRel, path.extname(depRel));
    const stem = base
      .replace(/(Tab|BenchPanel)$/, '')
      .replace(/^(BoostPad|Driftwoods|Garage)/, '');
    const variantId = stem.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    const label = stem.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    return {
      variantId,
      label,
      entryFile: depRel,
    };
  });
}
