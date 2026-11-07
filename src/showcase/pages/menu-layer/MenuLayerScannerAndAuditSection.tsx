import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
} from 'lucide-react';
import { MENU_ROUTE_CONFIG } from './menuLayerRouteConfig';
import {
  USER_LINEAR_PLAYLIST,
  DEV_LINEAR_PLAYLIST,
} from './menuLayerLinearPlaylists';
import { AuditTicketHeader } from '../../components/AuditTicketHeader';
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
    setManualBoundarySize,
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

        {/* Quick Canvas Boundary Manual / Lock W×H */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-neutral-400">Canvas Boundary:</span>
          {(
            [
              { id: 'full', label: 'Auto' },
              { id: '1080p-compact', label: '760×520' },
              { id: 'small-squeeze', label: '520×380' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setContainerPreset(preset.id);
                if (preset.id === '1080p-compact' && boundaryLocked) {
                  setManualBoundarySize({ width: 760, height: 520 });
                } else if (preset.id === 'small-squeeze' && boundaryLocked) {
                  setManualBoundarySize({ width: 520, height: 380 });
                }
              }}
              className={`px-2 py-0.5 rounded-lg border text-[11px] cursor-pointer transition-all ${
                containerPreset === preset.id && !boundaryLocked
                  ? 'bg-amber-500 text-white border-amber-500 font-bold'
                  : isLight
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {preset.label}
            </button>
          ))}

          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl border ${
              boundaryLocked
                ? 'border-sky-500/60 bg-sky-500/10 text-sky-500'
                : isLight
                ? 'border-neutral-200 bg-neutral-50 text-neutral-700'
                : 'border-neutral-800 bg-neutral-950 text-neutral-300'
            }`}
          >
            <input
              type="number"
              min={320}
              max={2560}
              step={10}
              value={Math.round(effectiveStageW)}
              onChange={(e) =>
                handleChangeManualBoundarySize({
                  width: Number(e.target.value) || effectiveStageW,
                  height: effectiveStageH,
                })
              }
              className={`w-14 px-1 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                isLight
                  ? 'bg-white border-neutral-300 text-neutral-900'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-100'
              }`}
              title="Canvas Boundary Width (px)"
            />
            <span className="opacity-60">×</span>
            <input
              type="number"
              min={260}
              max={1600}
              step={10}
              value={Math.round(effectiveStageH)}
              onChange={(e) =>
                handleChangeManualBoundarySize({
                  width: effectiveStageW,
                  height: Number(e.target.value) || effectiveStageH,
                })
              }
              className={`w-14 px-1 py-0.5 text-center rounded border font-mono text-[11px] font-bold ${
                isLight
                  ? 'bg-white border-neutral-300 text-neutral-900'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-100'
              }`}
              title="Canvas Boundary Height (px)"
            />
            <span className="text-[10px] opacity-60">px</span>
            <button
              type="button"
              onClick={handleToggleBoundaryLock}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                boundaryLocked
                  ? 'bg-sky-500 text-white border-sky-400 shadow-2xs'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
              title={
                boundaryLocked
                  ? 'Unlock Canvas Boundary (return to auto-adaptive stage size)'
                  : 'Lock current Canvas Boundary W×H so stepping through pages never jumps or resizes the stage'
              }
            >
              {boundaryLocked ? (
                <>
                  <Lock className="h-3 w-3" />
                  <span>Locked</span>
                </>
              ) : (
                <>
                  <Unlock className="h-3 w-3" />
                  <span>Lock W×H</span>
                </>
              )}
            </button>
          </div>
        </div>
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
