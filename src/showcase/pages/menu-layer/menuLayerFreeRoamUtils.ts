import {
  LAYER1_CONTEXT_VARIATIONS,
  resolveLayer1ContextSpec,
  type CanonicalLayer1ContextVariation,
  type Layer1MenuContextMode,
} from '../../../ui-core/recipes/layer1MenuContextSpecs';
import {
  MENU_ROUTE_CONFIG,
  normalizeMenuRoute,
  type ActiveMenuRoute,
  type LinearPlaylistStep,
} from './menuLayerRouteConfig';
import type { Layer3StepOverrideState } from './MenuLayerSandboxContext';
import { matchesOnlineRoomPlaylistStep } from './menuLayerOnlineRoomSteps';

export interface ActiveViewStateSummary {
  route: ActiveMenuRoute;
  contextMode: CanonicalLayer1ContextVariation;
  settingsTab: string;
  garageTab: string;
  layer3StepOverride: Layer3StepOverrideState;
}

/**
 * Checks whether the current active view state on the stage matches a specific playlist step.
 */
export function doesViewMatchPlaylistStep(
  step: LinearPlaylistStep | undefined,
  view: ActiveViewStateSummary
): boolean {
  if (!step) return false;
  const canonicalStepRoute = normalizeMenuRoute(step.route) ?? step.route;
  const canonicalViewRoute = normalizeMenuRoute(view.route) ?? view.route;
  if (canonicalStepRoute !== canonicalViewRoute) return false;

  if (
    (canonicalViewRoute === 'main-menu' || canonicalViewRoute === 'manage-room') &&
    step.contextMode
  ) {
    return (
      resolveLayer1ContextSpec(step.contextMode).id === view.contextMode &&
      matchesOnlineRoomPlaylistStep(
        step,
        canonicalViewRoute,
        view.contextMode,
        view.layer3StepOverride
      )
    );
  }

  if (canonicalViewRoute === 'settings' && step.subtab) {
    return step.subtab === view.settingsTab;
  }

  if (canonicalViewRoute === 'garage' && step.subtab) {
    return step.subtab === view.garageTab;
  }

  if (
    (canonicalViewRoute === 'host-match' ||
      canonicalViewRoute === 'host-training' ||
      canonicalViewRoute === 'join-room') &&
    step.progressStatus
  ) {
    return matchesOnlineRoomPlaylistStep(
      step,
      canonicalViewRoute,
      view.contextMode,
      view.layer3StepOverride
    );
  }

  return true;
}

/**
 * Formats a concise human-readable label for the current active view on stage
 * when the user is in Free Roam mode (diverged from the approval anchor step).
 */
export function formatActiveViewRoamLabel(view: ActiveViewStateSummary): string {
  const canonicalRoute = normalizeMenuRoute(view.route) ?? view.route;
  if (canonicalRoute === 'main-menu') {
    const spec = resolveLayer1ContextSpec(view.contextMode);
    return `Main Menu (${spec.shortLabel})`;
  }
  if (canonicalRoute === 'garage') {
    const tabTitle = view.garageTab.charAt(0).toUpperCase() + view.garageTab.slice(1);
    return `Garage · ${tabTitle}`;
  }
  if (canonicalRoute === 'settings') {
    const tabTitle = view.settingsTab.charAt(0).toUpperCase() + view.settingsTab.slice(1);
    return `Settings · ${tabTitle}`;
  }
  if (canonicalRoute === 'manage-room') {
    const spec = resolveLayer1ContextSpec(view.contextMode);
    const slots = view.layer3StepOverride.memberSlots ?? 3;
    return `Room Control (${spec.shortLabel} · ${slots}S)`;
  }
  return MENU_ROUTE_CONFIG[canonicalRoute]?.label || canonicalRoute;
}

/**
 * Returns the canonical sticky session context options available for the active tier,
 * always keeping 'freeplay' at the top so reviewers can reset with one click.
 */
export function getStickySessionContextOptions(tier: 'user' | 'developer') {
  const tierVariations = LAYER1_CONTEXT_VARIATIONS.filter((v) => v.tier === tier);
  if (tier === 'user') {
    return tierVariations;
  }
  const freeplaySpec = LAYER1_CONTEXT_VARIATIONS[0];
  return [freeplaySpec, ...tierVariations];
}
