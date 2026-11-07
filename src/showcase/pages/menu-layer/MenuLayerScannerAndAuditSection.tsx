import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MENU_ROUTE_CONFIG } from './menuLayerRouteConfig';
import {
  USER_LINEAR_PLAYLIST,
  DEV_LINEAR_PLAYLIST,
} from './menuLayerLinearPlaylists';
import { AuditTicketHeader } from '../../components/AuditTicketHeader';
import { StageTrackpadScrubResizer } from '../../components/StageTrackpadScrubResizer';
import { MenuLayerStageActionToolbar } from './MenuLayerStageActionToolbar';
import { useMenuLayerSandbox } from './MenuLayerSandboxContext';

export interface MenuLayerScannerAndAuditSectionProps {
  isLight: boolean;
}

export const MenuLayerScannerAndAuditSection: React.FC<
  MenuLayerScannerAndAuditSectionProps
> = ({ isLight }) => {
  const {
    visibilityTier,
    handleChangeVisibilityTier,
    stepPlaylistBy,
    activePlaylistIdx,
    activePlaylist,
    activePlaylistStep,
    currentRoute,
    containerPreset,
    setContainerPreset,
    boundaryLocked,
    effectiveStageW,
    effectiveStageH,
    handleChangeManualBoundarySize,
    handleToggleBoundaryLock,
    transitionMode,
    setTransitionMode,
    showToast,
    auditInfo,
    layer1ContextMode,
    settingsTab,
    garageTab,
    layer3StepOverride,
  } = useMenuLayerSandbox();
  return (
    <>
      <div
        className={`flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl border text-xs font-mono ${
          isLight
            ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs'
            : 'bg-neutral-900/90 border-neutral-800 text-neutral-200'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`inline-flex items-center p-0.5 rounded-lg border ${
              isLight ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}
          >
            <button
              type="button"
              onClick={() => handleChangeVisibilityTier('user')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                visibilityTier === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              User ({USER_LINEAR_PLAYLIST.length})
            </button>
            <button
              type="button"
              onClick={() => handleChangeVisibilityTier('developer')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                visibilityTier === 'developer'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Dev ({DEV_LINEAR_PLAYLIST.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => stepPlaylistBy(-1)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border font-bold cursor-pointer transition-all active:scale-95 ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
            }`}
            title="Previous page in linear inspection playlist (ArrowLeft ←)"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev (←)</span>
          </button>

          <button
            type="button"
            onClick={() => stepPlaylistBy(1)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border font-bold cursor-pointer transition-all active:scale-95 ${
              isLight
                ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-100'
            }`}
            title="Next page in linear inspection playlist (ArrowRight →)"
          >
            <span>Next (→)</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
            [{activePlaylistIdx + 1}/{activePlaylist.length}] {activePlaylistStep?.label || currentRoute}
          </span>
        </div>

        {/* Quick Canvas Boundary Manual / Scrub / Lock W×H */}
        <StageTrackpadScrubResizer
          isLight={isLight}
          compact={true}
          containerPreset={containerPreset}
          onSelectPreset={setContainerPreset}
          boundaryLocked={boundaryLocked}
          onToggleLock={handleToggleBoundaryLock}
          width={effectiveStageW}
          height={effectiveStageH}
          onChangeSize={handleChangeManualBoundarySize}
        />
      </div>

      <MenuLayerStageActionToolbar
        isLight={isLight}
        currentRoute={currentRoute}
        transitionMode={transitionMode}
        setTransitionMode={setTransitionMode}
        showToast={showToast}
      />

      <div
        className={`px-3.5 py-2.5 rounded-xl border ${
          isLight
            ? 'bg-white border-neutral-200 shadow-2xs'
            : 'bg-neutral-900/80 border-neutral-800'
        }`}
      >
        <AuditTicketHeader
          index={activePlaylistIdx + 1}
          label={
            activePlaylistStep?.label ||
            MENU_ROUTE_CONFIG[currentRoute]?.label ||
            currentRoute
          }
          description={activePlaylistStep?.breadcrumb}
          referenceCode={auditInfo.referenceCode}
          componentName={auditInfo.componentName}
          sourceFile={auditInfo.sourceFile}
          stateId={activePlaylistStep?.id || currentRoute}
          activeProps={{
            route: currentRoute,
            tier: visibilityTier,
            ...(currentRoute === 'main-menu' || currentRoute === 'manage-room'
              ? { contextMode: layer1ContextMode }
              : {}),
            ...(currentRoute === 'settings' ? { activeTab: settingsTab } : {}),
            ...(currentRoute === 'garage' ? { activeTab: garageTab } : {}),
            ...(currentRoute === 'host-match' ||
            currentRoute === 'host-training' ||
            currentRoute === 'join-room'
              ? {
                  progressStatus: layer3StepOverride.progressStatus ?? 'idle',
                  currentStep: layer3StepOverride.currentStep ?? 1,
                  ...(currentRoute === 'host-match'
                    ? {
                        defaultEditingConfig: Boolean(
                          layer3StepOverride.defaultEditingConfig
                        ),
                      }
                    : {}),
                }
              : {}),
          }}
          badgeColor={visibilityTier === 'user' ? 'emerald' : 'amber'}
          tunerStatus={auditInfo.tunerStatus}
          isLight={isLight}
        />
      </div>
    </>
  );
};
