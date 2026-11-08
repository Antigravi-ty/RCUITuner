import {
  SURFACE_CALIBRATION_OVERRIDES,
  UI_APPROVAL_LEDGER,
} from '../../../ui-core/manifest/surfaceCalibration';
import type {
  SurfaceApprovalRecord,
  SurfaceApprovalStatus,
} from '../../../ui-core/manifest/surfaceMetaTypes';
import type {
  ReviewStaleReason,
  ReviewTriageBucketId,
  RuntimeReviewDecision,
  SurfaceVariantReviewUnit,
} from './reviewTypes';

/**
 * Resolves the canonical `uiApprovalLedger.json` surface ID from a component name,
 * source file path, or raw state ID.
 */
export function resolveCanonicalSurfaceId(params: {
  sourceFile?: string;
  componentName?: string;
  stateId?: string;
}): string {
  const { sourceFile = '', componentName = '', stateId = '' } = params;

  const fileStem = sourceFile
    .split('/')
    .pop()
    ?.replace(/\.(tsx|ts)$/, '');

  const candidateStem = fileStem || componentName;

  if (
    candidateStem === 'MenuLayerStageCanvas' ||
    candidateStem === 'StaticTrainingPackHUD' ||
    stateId === 'user-l0' ||
    stateId === 'user-l0-edge-inspector'
  ) {
    return 'recipe:StaticTrainingShotInspectorDrawer';
  }

  if (candidateStem.endsWith('FloatingWindow')) {
    const base = candidateStem.replace(/FloatingWindow$/, '');
    const kebab = base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return `floating:${kebab}`;
  }

  if (candidateStem.endsWith('Recipe') || candidateStem.endsWith('Drawer')) {
    return `recipe:${candidateStem}`;
  }

  const rawPrefix = stateId.split(':')[0];
  if (rawPrefix && UI_APPROVAL_LEDGER.surfaces[`floating:${rawPrefix}`]) {
    return `floating:${rawPrefix}`;
  }
  if (rawPrefix && UI_APPROVAL_LEDGER.surfaces[`recipe:${rawPrefix}`]) {
    return `recipe:${rawPrefix}`;
  }

  return candidateStem || stateId || 'unknown-surface';
}

export function buildUnitKey(surfaceId: string, variantId: string = 'default'): string {
  const cleanVariant = variantId.trim() || 'default';
  return `${surfaceId}::${cleanVariant}`;
}

/**
 * Extracts all shared Workspace Alpha foundation dependencies (Shells, Primitives,
 * Compounds, Charts, Tokens, Stores/Configs) for a surface record so Alpha <-> Bravo
 * root-cause attribution can cluster shared components across surfaces.
 */
export function extractAlphaMotherDeps(record?: SurfaceApprovalRecord): string[] {
  if (!record) return ['src/ui-core/layout/UniversalThreeStageShell.tsx'];
  const deps = new Set<string>(['src/ui-core/layout/UniversalThreeStageShell.tsx']);

  for (const fileRel of Object.keys(record.fileVisualHashes || {})) {
    if (
      fileRel.startsWith('src/ui-core/primitives/') ||
      fileRel.startsWith('src/ui-core/compounds/') ||
      fileRel.startsWith('src/ui-core/charts/') ||
      fileRel.startsWith('src/ui-core/layout/')
    ) {
      deps.add(fileRel);
    }
  }

  for (const alphaDep of record.alphaDeps || []) {
    deps.add(alphaDep);
  }

  return Array.from(deps).sort();
}

export function classifySurfaceBucket(params: {
  surfaceId: string;
  ledgerRecord?: SurfaceApprovalRecord;
  runtimeDecision?: RuntimeReviewDecision;
  globalTemplateStaleOverride?: boolean;
}): {
  status: SurfaceApprovalStatus;
  bucket: ReviewTriageBucketId;
  staleReason: ReviewStaleReason;
} {
  const { surfaceId, ledgerRecord, runtimeDecision, globalTemplateStaleOverride } = params;

  const status: SurfaceApprovalStatus =
    runtimeDecision?.status ?? ledgerRecord?.status ?? 'pending';

  if (runtimeDecision?.simulatedStaleReason) {
    const sim = runtimeDecision.simulatedStaleReason;
    if (sim === 'unreviewed' || sim === 'visual-stale' || sim === 'rejected-rework') {
      return { status, bucket: 'bucket-1-visual', staleReason: sim };
    }
    if (sim === 'config-stale') {
      return { status, bucket: 'bucket-2-config', staleReason: 'config-stale' };
    }
    if (sim === 'template-stale') {
      return { status, bucket: 'bucket-3-template', staleReason: 'template-stale' };
    }
  }

  if (!ledgerRecord) {
    return {
      status: status === 'approved' ? 'approved' : 'pending',
      bucket: status === 'approved' ? 'reviewed-healthy' : 'bucket-1-visual',
      staleReason: status === 'approved' ? 'up-to-date' : 'unreviewed',
    };
  }

  if (status === 'rejected') {
    return {
      status,
      bucket: 'bucket-1-visual',
      staleReason: 'rejected-rework',
    };
  }

  if (status === 'pending') {
    return {
      status,
      bucket: 'bucket-1-visual',
      staleReason: 'unreviewed',
    };
  }

  if (status === 'deferred') {
    return {
      status,
      bucket: 'bucket-2-config',
      staleReason: 'deferred-hold',
    };
  }

  // Check template hash drift or Workspace Alpha live shell preview override
  if (
    globalTemplateStaleOverride ||
    (UI_APPROVAL_LEDGER.templateHash &&
      ledgerRecord.templateHash !== UI_APPROVAL_LEDGER.templateHash)
  ) {
    return {
      status,
      bucket: 'bucket-3-template',
      staleReason: 'template-stale',
    };
  }

  // Check if calibration overrides exist for this surface
  if (SURFACE_CALIBRATION_OVERRIDES[surfaceId]) {
    return {
      status,
      bucket: 'bucket-2-config',
      staleReason: 'config-stale',
    };
  }

  return {
    status,
    bucket: 'reviewed-healthy',
    staleReason: 'up-to-date',
  };
}

const CANONICAL_RECIPE_SURFACE_ORDER: readonly string[] = [
  'recipe:StaticTrainingShotInspectorDrawer',
  'recipe:Layer1MainMenuRecipe',
  'recipe:Layer2PlayRecipe',
  'recipe:Layer2GarageRecipe',
  'recipe:Layer2SettingsRecipe',
  'recipe:Layer2ManageRoomRecipe',
  'recipe:Layer3HostMatchRecipe',
  'recipe:Layer3HostTrainingRecipe',
  'recipe:Layer3CustomPlayRecipe',
  'recipe:Layer3JoinRoomRecipe',
  'recipe:Layer3ExhibitionRecipe',
  'recipe:Layer3SelfTrainingRecipe',
  'recipe:Layer3KickoffTrainingRecipe',
  'recipe:Layer3TrainingConfigRecipe',
  'recipe:Layer3CameraRecipe',
  'recipe:Layer3KeybindingsRecipe',
  'recipe:Layer3BallTrajectoryRecipe',
  'recipe:Layer4StaticTrainingPackBrowseRecipe',
  'recipe:Layer4ControllerSettingsRecipe',
  'recipe:Layer3DevSandboxesRecipe',
  'recipe:Layer3ExpMultiBotsRecipe',
  'recipe:Layer3ExpBotPackRecipe',
  'recipe:Layer3DevActiveTunersRecipe',
  'recipe:Layer3DevCalibratedPresetsRecipe',
  'recipe:Layer3DevSelfTestRecipe',
  'recipe:Layer3DevRemoteProfileRecipe',
  'recipe:Layer3DevQuickActionsRecipe',
  'recipe:Layer3DevUnderDevelopmentRecipe',
  'recipe:Layer3AcousticsEqualizerRecipe',
  'recipe:Layer4AdvancedAudioRecipe',
  'recipe:Layer4EventTriggerRulesRecipe',
  'recipe:Layer4DevSignalingLabRecipe',
];

function resolveUnifiedSurfaceSortRank(surfaceId: string): number {
  const recipeIdx = CANONICAL_RECIPE_SURFACE_ORDER.indexOf(surfaceId);
  if (recipeIdx >= 0 && recipeIdx < 19) return recipeIdx;
  if (recipeIdx >= 19) return 100 + recipeIdx;
  if (surfaceId.startsWith('floating:')) return 200;
  return 500;
}

/**
 * Builds the canonical 64-surface review ledger list from `uiApprovalLedger.json`
 * merged with runtime variant registrations and reviewer decisions in Unified Stage order.
 */
export function buildAllReviewUnits(params: {
  decisionsMap: Record<string, RuntimeReviewDecision>;
  registeredUnitsMap: Record<
    string,
    Omit<SurfaceVariantReviewUnit, 'status' | 'bucket' | 'staleReason' | 'note' | 'updatedAt'>
  >;
  globalTemplateStaleOverride?: boolean;
  activeUnitKey?: string;
}): SurfaceVariantReviewUnit[] {
  const {
    decisionsMap,
    registeredUnitsMap,
    globalTemplateStaleOverride,
    activeUnitKey,
  } = params;

  const customKeysBySurface = new Map<string, string[]>();
  for (const rawKey of new Set([
    ...Object.keys(registeredUnitsMap),
    ...Object.keys(decisionsMap),
  ])) {
    const reg = registeredUnitsMap[rawKey];
    const dec = decisionsMap[rawKey];
    const rawSurface = reg?.surfaceId || dec?.surfaceId || rawKey.split('::')[0];
    const canonicalSurface = UI_APPROVAL_LEDGER.surfaces[rawSurface]
      ? rawSurface
      : resolveCanonicalSurfaceId({
          sourceFile: reg?.sourceFile || dec?.sourceFile,
          componentName: reg?.componentName || dec?.componentName || rawSurface,
          stateId: rawKey,
        });
    if (!UI_APPROVAL_LEDGER.surfaces[canonicalSurface]) continue;
    const list = customKeysBySurface.get(canonicalSurface) ?? [];
    list.push(rawKey);
    customKeysBySurface.set(canonicalSurface, list);
  }

  const units: SurfaceVariantReviewUnit[] = [];

  for (const [surfaceId, record] of Object.entries(UI_APPROVAL_LEDGER.surfaces)) {
    const defaultKey = buildUnitKey(surfaceId, 'default');
    const candidateKeys = customKeysBySurface.get(surfaceId) ?? [];
    const activeMatchKey =
      activeUnitKey &&
      (activeUnitKey.startsWith(`${surfaceId}::`) ||
        candidateKeys.includes(activeUnitKey))
        ? activeUnitKey
        : undefined;
    const decidedKey = candidateKeys.find((k) => Boolean(decisionsMap[k]));
    const latestRegisteredKey =
      candidateKeys.length > 0 ? candidateKeys[candidateKeys.length - 1] : undefined;

    const effectiveKey =
      activeMatchKey || decidedKey || latestRegisteredKey || defaultKey;
    const reg = registeredUnitsMap[effectiveKey];
    const decision =
      decisionsMap[effectiveKey] ??
      ( decidedKey ? decisionsMap[decidedKey] : undefined ) ??
      decisionsMap[defaultKey];

    const variantId =
      reg?.variantId ||
      decision?.variantId ||
      effectiveKey.split('::')[1] ||
      'default';

    const { status, bucket, staleReason } = classifySurfaceBucket({
      surfaceId,
      ledgerRecord: record,
      runtimeDecision: decision,
      globalTemplateStaleOverride,
    });

    const compName =
      record.entryFile
        .split('/')
        .pop()
        ?.replace(/\.(tsx|ts)$/, '') || surfaceId;

    units.push({
      unitKey: effectiveKey,
      surfaceId,
      variantId,
      label: reg?.label || decision?.label || compName,
      referenceCode:
        reg?.referenceCode ||
        decision?.referenceCode ||
        (record.surfaceKind === 'floating-window' ? 'Floating' : 'Menu'),
      componentName: reg?.componentName || decision?.componentName || compName,
      sourceFile: reg?.sourceFile || decision?.sourceFile || record.entryFile,
      subViewFile: reg?.subViewFile || decision?.subViewFile,
      status,
      bucket,
      staleReason,
      note: decision?.note ?? record.note ?? '',
      updatedAt: decision?.updatedAt ?? record.approvedAt,
      changedSubtreeFiles: reg?.changedSubtreeFiles ?? [],
      alphaMotherDeps: reg?.alphaMotherDeps ?? extractAlphaMotherDeps(record),
      ledgerRecord: record,
    });
  }

  return units.sort((a, b) => {
    const rankDiff =
      resolveUnifiedSurfaceSortRank(a.surfaceId) -
      resolveUnifiedSurfaceSortRank(b.surfaceId);
    if (rankDiff !== 0) return rankDiff;
    return a.surfaceId.localeCompare(b.surfaceId);
  });
}

/**
 * Selects up to 3 representative `template-stale` surfaces (Simplest / Medium / Most Dense
 * by visual subtree file count) for 1-click spot-check before Batch Approving Bucket 3.
 */
export function pickRepresentativeTemplateStaleSamples(
  units: SurfaceVariantReviewUnit[]
): SurfaceVariantReviewUnit[] {
  const templateUnits = units.filter((u) => u.bucket === 'bucket-3-template');
  if (templateUnits.length <= 3) return templateUnits;

  const sortedByDensity = [...templateUnits].sort((a, b) => {
    const countA = Object.keys(a.ledgerRecord?.fileVisualHashes || {}).length;
    const countB = Object.keys(b.ledgerRecord?.fileVisualHashes || {}).length;
    return countA - countB;
  });

  const simplest = sortedByDensity[0];
  const median = sortedByDensity[Math.floor(sortedByDensity.length / 2)];
  const densest = sortedByDensity[sortedByDensity.length - 1];

  return [simplest, median, densest];
}
