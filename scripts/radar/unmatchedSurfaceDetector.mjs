import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './constants.mjs';

const LEDGER_REL_PATH = 'src/ui-core/manifest/uiApprovalLedger.json';
const CALIBRATION_REL_PATH = 'src/ui-core/manifest/surfaceCalibrationOverrides.json';
const PANEL_SIZING_REL_PATH = 'src/ui-core/tokens/menuPanelSizingPresets.ts';
const USER_FLOATING_PRESETS_REL_PATH = 'src/ui-core/stores/floatingPresets.ts';
const DEV_FLOATING_PRESETS_REL_PATH = 'src/ui-core/stores/devFloatingPresets.ts';
const LOCAL_SIZING_TUNER_REL_PATH = 'src/showcase/pages/recipes/LocalPanelSizingTuner.tsx';
const MENU_ROUTE_CONFIG_REL_PATH = 'src/showcase/pages/menu-layer/menuLayerRouteConfig.ts';
const MENU_PLAYLISTS_REL_PATH = 'src/showcase/pages/menu-layer/menuLayerLinearPlaylists.ts';

function readTextSafe(relPath) {
  const abs = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(abs)) return '';
  try {
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return '';
  }
}

function readJsonSafe(relPath, fallback) {
  const raw = readTextSafe(relPath);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function deriveKebabFloatingId(fileStem) {
  const stem = fileStem.replace(/FloatingWindow$/, '');
  return stem.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function parseSurfaceMetaFromSource(content) {
  const blockMatch = content.match(
    /export\s+const\s+SURFACE_META\s*(?::\s*SurfaceMeta)?\s*=\s*\{([\s\S]*?)\n\};/
  );
  if (!blockMatch) {
    return {
      hasSurfaceMeta: false,
      metaId: null,
      title: null,
      layer: null,
      menuGroup: null,
      hasDefaultSizing: false,
      declaredVariantIds: [],
    };
  }
  const body = blockMatch[1];
  const idMatch = body.match(/\bid\s*:\s*['"]([^'"]+)['"]/);
  const titleMatch = body.match(/\btitle\s*:\s*['"]([^'"]+)['"]/);
  const layerMatch = body.match(/\blayer\s*:\s*['"]([^'"]+)['"]/);
  const groupMatch = body.match(/\bmenuGroup\s*:\s*['"]([^'"]+)['"]/);
  const hasDefaultSizing = /\bdefaultSizing\s*:\s*\{/.test(body);

  const declaredVariantIds = [];
  const variantsBlockMatch = body.match(/\bvariants\s*:\s*\[([\s\S]*?)\]/);
  if (variantsBlockMatch) {
    const vRe = /\bvariantId\s*:\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = vRe.exec(variantsBlockMatch[1])) !== null) {
      declaredVariantIds.push(m[1]);
    }
  }

  return {
    hasSurfaceMeta: true,
    metaId: idMatch ? idMatch[1] : null,
    title: titleMatch ? titleMatch[1] : null,
    layer: layerMatch ? layerMatch[1] : null,
    menuGroup: groupMatch ? groupMatch[1] : null,
    hasDefaultSizing,
    declaredVariantIds,
  };
}

function collectRecipeStageReferences(allRelFiles) {
  const recipeStageFiles = allRelFiles.filter(
    (f) =>
      f.startsWith('src/showcase/pages/recipes/') &&
      f !== LOCAL_SIZING_TUNER_REL_PATH
  );
  return recipeStageFiles.map((f) => readTextSafe(f)).join('\n');
}

function collectMenuLayerStageReferences(allRelFiles) {
  const menuLayerFiles = allRelFiles.filter(
    (f) =>
      f.startsWith('src/showcase/pages/menu-layer/') ||
      f === 'src/showcase/pages/MenuLayerSimulationPage.tsx'
  );
  return menuLayerFiles.map((f) => readTextSafe(f)).join('\n');
}

function deriveKebabPanelId(fileStem) {
  return fileStem
    .replace(/Recipe$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/(Layer[1-5])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function parseRouteConfigMappings(routeConfigText) {
  const componentToRoutes = new Map();
  const panelIdToRoutes = new Map();
  const routeToPanelId = new Map();

  const jumpRe =
    /makeJumpItem\(\s*['"][^'"]+['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"][^'"]*['"]\s*,\s*['"][^'"]*['"]\s*,\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = jumpRe.exec(routeConfigText)) !== null) {
    const comp = m[1].replace(/\s*\(.*\)$/, '').trim();
    const route = m[2].trim();
    if (!componentToRoutes.has(comp)) componentToRoutes.set(comp, new Set());
    componentToRoutes.get(comp).add(route);
  }

  const routeMapMatch = routeConfigText.match(
    /ROUTE_TO_PANEL_ID[\s\S]*?=\s*\{([\s\S]*?)\};/
  );
  if (routeMapMatch) {
    const pairRe = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
    while ((m = pairRe.exec(routeMapMatch[1])) !== null) {
      const route = m[1].trim();
      const panelId = m[2].trim();
      routeToPanelId.set(route, panelId);
      if (!panelIdToRoutes.has(panelId)) panelIdToRoutes.set(panelId, new Set());
      panelIdToRoutes.get(panelId).add(route);
    }
  }

  return { componentToRoutes, panelIdToRoutes, routeToPanelId };
}

function parsePlaylistRoutes(playlistText) {
  const routes = new Set();
  const routeRe = /\broute\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = routeRe.exec(playlistText)) !== null) {
    routes.add(m[1].trim());
  }
  return routes;
}

function parseCurated6ARecipeNames(tunerText) {
  const names = new Set();
  const blockMatch = tunerText.match(
    /CURATED_RECIPES_JUMP_ITEMS[\s\S]*?=\s*\[([\s\S]*?)\];/
  );
  const target = blockMatch ? blockMatch[1] : tunerText;
  const nameRe = /\bname\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = nameRe.exec(target)) !== null) {
    names.add(m[1].replace(/\s*\(.*\)$/, '').trim());
  }
  return names;
}

function parseCanonicalPanelSizingIds(sizingText) {
  const ids = new Set();
  const blockMatch = sizingText.match(
    /CANONICAL_PANEL_SIZING[\s\S]*?=\s*\{([\s\S]*?)\n\};/
  );
  const target = blockMatch ? blockMatch[1] : sizingText;
  const keyRe = /^\s*['"]([a-z0-9-]+)['"]\s*:\s*\{/gm;
  let m;
  while ((m = keyRe.exec(target)) !== null) {
    ids.add(m[1].trim());
  }
  return ids;
}

function parseFloatingPresetIdsAndComponents(userPresetsText, devPresetsText) {
  const presetIds = new Set();
  const presetComponents = new Set();
  const combined = `${userPresetsText}\n${devPresetsText}`;
  const idRe = /\bid\s*:\s*['"]([^'"]+)['"]/g;
  const compRe = /\bcomponent\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = idRe.exec(combined)) !== null) {
    presetIds.add(m[1].trim());
  }
  while ((m = compRe.exec(combined)) !== null) {
    presetComponents.add(m[1].trim());
  }
  return { presetIds, presetComponents };
}

/**
 * Automatically detects newly merged RC surfaces in `src/ui-core/recipes` and
 * `src/ui-core/panels/{user,dev}` that have not yet been fully matched or calibrated
 * across RCUITuner's 6A/6D Tuners, 7A Sandbox Playlists, Sizing Tokens, or Approval Ledger.
 */
export function detectUnmatchedAndUncalibratedSurfaces({ allRelFiles }) {
  const ledger = readJsonSafe(LEDGER_REL_PATH, { surfaces: {} });
  const calibrationOverrides = readJsonSafe(CALIBRATION_REL_PATH, {});
  const sizingText = readTextSafe(PANEL_SIZING_REL_PATH);
  const userPresetsText = readTextSafe(USER_FLOATING_PRESETS_REL_PATH);
  const devPresetsText = readTextSafe(DEV_FLOATING_PRESETS_REL_PATH);
  const localTunerText = readTextSafe(LOCAL_SIZING_TUNER_REL_PATH);
  const routeConfigText = readTextSafe(MENU_ROUTE_CONFIG_REL_PATH);
  const playlistsText = [
    readTextSafe(MENU_PLAYLISTS_REL_PATH),
    readTextSafe('src/showcase/pages/menu-layer/menuLayerOnlineRoomSteps.ts'),
  ].join('\n');

  const recipeStageCombined = collectRecipeStageReferences(allRelFiles);
  const menuLayerStageCombined = collectMenuLayerStageReferences(allRelFiles);
  const canonicalPanelIds = parseCanonicalPanelSizingIds(sizingText);
  const curated6ANames = parseCurated6ARecipeNames(localTunerText);
  const { componentToRoutes, panelIdToRoutes, routeToPanelId } =
    parseRouteConfigMappings(routeConfigText);
  const playlistRoutes = parsePlaylistRoutes(playlistsText);
  const { presetIds, presetComponents } = parseFloatingPresetIdsAndComponents(
    userPresetsText,
    devPresetsText
  );

  const candidateFiles = allRelFiles
    .filter((relFile) => {
      if (/^src\/ui-core\/recipes\/[^/]+\.tsx$/.test(relFile)) {
        const base = path.basename(relFile, '.tsx');
        return base.endsWith('Recipe') || base.endsWith('Drawer');
      }
      if (/^src\/ui-core\/panels\/(user|dev)\/[^/]+\.tsx$/.test(relFile)) {
        const base = path.basename(relFile, '.tsx');
        if (base.endsWith('FloatingWindow')) return true;
        const content = readTextSafe(relFile);
        return /export\s+const\s+SURFACE_META\b/.test(content);
      }
      return false;
    })
    .sort();

  const items = [];
  const issueCounts = {
    'missing-surface-meta': 0,
    'missing-6a-curated-tuner': 0,
    'missing-6a-stage-mount': 0,
    'missing-7a-route': 0,
    'missing-7a-playlist': 0,
    'missing-6d-preset': 0,
    'uncalibrated-sizing': 0,
    'missing-approval-ledger': 0,
  };

  for (const entryFile of candidateFiles) {
    const fileStem = path.basename(entryFile, '.tsx');
    const isFloating = entryFile.includes('/panels/');
    const surfaceKind = isFloating ? 'floating-window' : 'menu-recipe';
    const content = readTextSafe(entryFile);
    const parsedMeta = parseSurfaceMetaFromSource(content);

    const derivedId = isFloating
      ? deriveKebabFloatingId(fileStem)
      : deriveKebabPanelId(fileStem);
    const effectiveMetaId = parsedMeta.metaId || derivedId;
    const ledgerSurfaceId = isFloating
      ? `floating:${effectiveMetaId}`
      : `recipe:${fileStem}`;

    const ledgerRecord = ledger.surfaces?.[ledgerSurfaceId];
    const hasCalibrationOverride = Boolean(
      calibrationOverrides[ledgerSurfaceId] ||
        calibrationOverrides[effectiveMetaId] ||
        calibrationOverrides[derivedId]
    );

    const issues = [];
    const followUpTargets = [];

    if (!parsedMeta.hasSurfaceMeta || !parsedMeta.metaId || !parsedMeta.hasDefaultSizing) {
      issues.push('missing-surface-meta');
      issueCounts['missing-surface-meta'] += 1;
      followUpTargets.push(`${entryFile} (declare export const SURFACE_META)`);
    }

    if (!ledgerRecord || ledgerRecord.status === 'unreviewed' || ledgerRecord.status === 'pending') {
      issues.push('missing-approval-ledger');
      issueCounts['missing-approval-ledger'] += 1;
      followUpTargets.push(`${LEDGER_REL_PATH} (run radar --sync-approval)`);
    }

    if (isFloating) {
      const inPresets =
        presetIds.has(effectiveMetaId) || presetComponents.has(fileStem);
      if (!inPresets) {
        issues.push('missing-6d-preset');
        issueCounts['missing-6d-preset'] += 1;
        const targetPresetFile = entryFile.includes('/user/')
          ? USER_FLOATING_PRESETS_REL_PATH
          : DEV_FLOATING_PRESETS_REL_PATH;
        followUpTargets.push(`${targetPresetFile} (register PresetConfig for ${effectiveMetaId})`);
      }
      if (!inPresets && !hasCalibrationOverride) {
        issues.push('uncalibrated-sizing');
        issueCounts['uncalibrated-sizing'] += 1;
      }
    } else {
      const isDrawer = fileStem.endsWith('Drawer');
      const mappedRoutes = new Set([
        ...(componentToRoutes.get(fileStem) || []),
        ...(panelIdToRoutes.get(effectiveMetaId) || []),
        ...(panelIdToRoutes.get(derivedId) || []),
      ]);
      const mappedPanelIds = Array.from(mappedRoutes)
        .map((r) => routeToPanelId.get(r))
        .filter(Boolean);

      const resolvedPanelId =
        [effectiveMetaId, derivedId, ...mappedPanelIds].find((id) =>
          canonicalPanelIds.has(id)
        ) || null;

      const hasPanelSizing =
        Boolean(resolvedPanelId) ||
        hasCalibrationOverride ||
        (isDrawer && parsedMeta.hasDefaultSizing);
      if (!hasPanelSizing) {
        issues.push('uncalibrated-sizing');
        issueCounts['uncalibrated-sizing'] += 1;
        followUpTargets.push(
          `${PANEL_SIZING_REL_PATH} (add ${derivedId} to CANONICAL_PANEL_SIZING)`
        );
      }

      const in6ACurated =
        curated6ANames.has(fileStem) || curated6ANames.has(effectiveMetaId);
      if (!in6ACurated) {
        issues.push('missing-6a-curated-tuner');
        issueCounts['missing-6a-curated-tuner'] += 1;
        followUpTargets.push(
          `${LOCAL_SIZING_TUNER_REL_PATH} (add ${fileStem} to CURATED_RECIPES_JUMP_ITEMS)`
        );
      }

      const in6AStage = recipeStageCombined.includes(fileStem);
      if (!in6AStage) {
        issues.push('missing-6a-stage-mount');
        issueCounts['missing-6a-stage-mount'] += 1;
        followUpTargets.push(
          `src/showcase/pages/recipes/deepLayerRecipeSpecs.tsx (wire ${fileStem} preview spec)`
        );
      }

      const mountedIn7AStage = menuLayerStageCombined.includes(fileStem);

      const in7ARoute = mappedRoutes.size > 0 || (isDrawer && mountedIn7AStage);
      if (!in7ARoute) {
        issues.push('missing-7a-route');
        issueCounts['missing-7a-route'] += 1;
        followUpTargets.push(
          `${MENU_ROUTE_CONFIG_REL_PATH} (add ${fileStem} route & MENU_SANDBOX_JUMP_ITEMS entry)`
        );
      }

      const in7APlaylist =
        Array.from(mappedRoutes).some((r) => playlistRoutes.has(r)) ||
        (isDrawer && mountedIn7AStage);
      if (!in7APlaylist) {
        issues.push('missing-7a-playlist');
        issueCounts['missing-7a-playlist'] += 1;
        followUpTargets.push(
          `${MENU_PLAYLISTS_REL_PATH} (append ${
            mappedRoutes.size > 0 ? Array.from(mappedRoutes).join('/') : fileStem
          } step to linear playlist)`
        );
      }
    }

    const hasUnmatchedRouteOrPlaylist = issues.some((code) =>
      [
        'missing-surface-meta',
        'missing-6a-curated-tuner',
        'missing-6a-stage-mount',
        'missing-7a-route',
        'missing-7a-playlist',
        'missing-6d-preset',
      ].includes(code)
    );
    const hasUncalibratedOrUnreviewed = issues.some((code) =>
      [
        'uncalibrated-sizing',
        'missing-approval-ledger',
        'untracked-variant-tabs',
      ].includes(code)
    );

    const status = hasUnmatchedRouteOrPlaylist
      ? 'unmatched'
      : hasUncalibratedOrUnreviewed
      ? 'uncalibrated'
      : 'matched';

    items.push({
      surfaceId: ledgerSurfaceId,
      metaId: effectiveMetaId,
      componentName: fileStem,
      surfaceKind,
      entryFile,
      layer: parsedMeta.layer || (isFloating ? 'floating' : 'menu'),
      status,
      issues,
      followUpTargets,
    });
  }

  const unmatchedItems = items.filter((it) => it.status !== 'matched');
  const unmatchedCount = items.filter((it) => it.status === 'unmatched').length;
  const uncalibratedCount = items.filter((it) => it.status === 'uncalibrated').length;

  return {
    totalCandidates: items.length,
    matchedAndCalibratedCount: items.length - unmatchedItems.length,
    unmatchedOrUncalibratedCount: unmatchedItems.length,
    unmatchedCount,
    uncalibratedCount,
    issueCounts,
    unmatchedItems,
    items,
  };
}
