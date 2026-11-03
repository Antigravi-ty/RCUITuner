import React, { Suspense, lazy } from 'react';
import { Badge } from '../../../ui-core/primitives/Badge';
import { AuditTicketHeader } from '../../components/AuditTicketHeader';
import { LocalPanelSizingTuner } from './LocalPanelSizingTuner';
import {
  LAYER3_HOST_MATCH_STATES,
  LAYER3_JOIN_ROOM_STATES,
} from '../../../ui-core/recipes/recipeStateMatrixSpecs';

const Layer3AudioEqRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3AudioEqRecipe').then((m) => ({
    default: m.Layer3AudioEqRecipe,
  }))
);
const Layer3HostMatchRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3HostMatchRecipe').then((m) => ({
    default: m.Layer3HostMatchRecipe,
  }))
);
const Layer3JoinRoomRecipe = lazy(() =>
  import('../../../ui-core/recipes/Layer3JoinRoomRecipe').then((m) => ({
    default: m.Layer3JoinRoomRecipe,
  }))
);

const noop = () => {};

export function renderLayer3CoreRecipeStage(
  itemId: string,
  isLight: boolean,
  previewWrapClass: string,
  suspenseFallback: React.ReactNode
): React.ReactNode | null {
  switch (itemId) {
    case 'recipe-6a-6a-host':
      return (
        <div id="recipe-6a-6a-host" className="scroll-mt-6 flex flex-col gap-4">
          <div
            className={`relative p-6 rounded-2xl border transition-colors overflow-hidden ${
              isLight
                ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
                : 'border-neutral-800 bg-neutral-950/60'
            }`}
          >
            <Suspense fallback={suspenseFallback}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
                {LAYER3_HOST_MATCH_STATES.map((st, idx) => (
                  <div key={st.id} className="flex flex-col gap-2 items-center w-full">
                    <Layer3HostMatchRecipe isLight={isLight} {...st.props} onBack={noop} />
                    <AuditTicketHeader
                      index={idx + 1}
                      label={st.label}
                      description={st.description}
                      referenceCode="6A.6A"
                      componentName={st.componentName || 'Layer3HostMatchRecipe'}
                      sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer3HostMatchRecipe.tsx'}
                      subViewFile={st.subViewFile}
                      stateId={st.id}
                      activeProps={st.props}
                      badgeColor="amber"
                      isLight={isLight}
                    />
                  </div>
                ))}
              </div>
            </Suspense>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.6A
            </span>
            <h2 className="text-base font-bold">
              Layer 3 Host Match (Flat 5-State Matrix · Idle Collapsed / Idle Expanded / Step 3 / Completed / Error Step 3)
            </h2>
            <Badge variant="amber" size="sm" isLight={isLight}>
              Host Room States
            </Badge>
          </div>
          <LocalPanelSizingTuner
            code="6A.6A"
            panelId="layer3-host-match"
            label="Layer 3 Host Match (Create Room Page)"
            recommendation="Auto-Fit: Renders all 5 lifecycle states side by side with per-card Audit Ticket copy buttons."
            isLight={isLight}
          />
        </div>
      );
    case 'recipe-6a-6b-join':
      return (
        <div id="recipe-6a-6b-join" className="scroll-mt-6 flex flex-col gap-4">
          <div
            className={`relative p-6 rounded-2xl border transition-colors overflow-hidden ${
              isLight
                ? 'bg-neutral-50/70 border-neutral-200/80 shadow-2xs'
                : 'border-neutral-800 bg-neutral-950/60'
            }`}
          >
            <Suspense fallback={suspenseFallback}>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full items-start">
                {LAYER3_JOIN_ROOM_STATES.map((st, idx) => (
                  <div key={st.id} className="flex flex-col gap-2 items-center w-full">
                    <Layer3JoinRoomRecipe isLight={isLight} {...st.props} onBack={noop} />
                    <AuditTicketHeader
                      index={idx + 1}
                      label={st.label}
                      description={st.description}
                      referenceCode="6A.6B"
                      componentName={st.componentName || 'Layer3JoinRoomRecipe'}
                      sourceFile={st.sourceFile || 'src/ui-core/recipes/Layer3JoinRoomRecipe.tsx'}
                      subViewFile={st.subViewFile}
                      stateId={st.id}
                      activeProps={st.props}
                      badgeColor="rose"
                      isLight={isLight}
                    />
                  </div>
                ))}
              </div>
            </Suspense>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.6B
            </span>
            <h2 className="text-base font-bold">
              Layer 3 Join Room (Flat 5-State Matrix · Idle / Handshake Step 2 / Step 4 / Connected / Error Step 3)
            </h2>
            <Badge variant="primary" size="sm" isLight={isLight}>
              Client Join States
            </Badge>
          </div>
          <LocalPanelSizingTuner
            code="6A.6B"
            panelId="layer3-join-room"
            label="Layer 3 Join Room (Client Join Page)"
            recommendation="Auto-Fit: Renders all client connection lifecycle states side by side with per-card Audit Ticket copy buttons."
            isLight={isLight}
          />
        </div>
      );
    case 'recipe-6a-7-audio':
      return (
        <div id="recipe-6a-7-audio" className="scroll-mt-6 flex flex-col gap-4">
          <div className={previewWrapClass}>
            <Suspense fallback={suspenseFallback}>
              <Layer3AudioEqRecipe isLight={isLight} onBack={noop} />
            </Suspense>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-500 flex items-center justify-center font-mono font-bold text-xs">
              6A.7
            </span>
            <h2 className="text-base font-bold">Layer 3 Advanced audio equalizer menu (Acoustics & EQ)</h2>
          </div>
          <LocalPanelSizingTuner
            code="6A.7"
            panelId="layer3-audio-eq"
            label="Layer 3 Acoustics & EQ"
            recommendation="recommended Fixed: Lock height and automatically compress internal card spacing on error"
            isLight={isLight}
          />
        </div>
      );
    default:
      return null;
  }
}
