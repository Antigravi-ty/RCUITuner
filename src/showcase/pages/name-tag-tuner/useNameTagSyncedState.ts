import { useCallback } from 'react';
import type { ArenaLightingPreset } from '../../ArenaBackdrop';
import { crossClientSync, useSyncedState } from '../../stores/crossClientSync';
import { setNameTagRuntimeState } from '../../../ui-core/stores/nameTagTunerStore';

export type NameTagSlotLayoutMode = 'grid' | 'floating-width';

export function useNameTagSyncedState() {
  const [arenaPreset, setArenaPreset] = useSyncedState<ArenaLightingPreset>(
    '5h:arenaPreset',
    'night'
  );
  const [stageHeight, setStageHeight] = useSyncedState<number>('5h:stageHeight', 360);
  const [cameraFovDeg, setCameraFovDeg] = useSyncedState<number>('5h:cameraFovDeg', 110);
  const [ballHeightOffset, setBallHeightOffset] = useSyncedState<number>(
    '5h:ballHeightOffset',
    14
  );
  const [animateBoostWave, setAnimateBoostWave] = useSyncedState<boolean>(
    '5h:animateBoostWave',
    false
  );
  const [customNameOverride, setCustomNameOverride] = useSyncedState<string>(
    '5h:customNameOverride',
    ''
  );
  const [slotLayoutMode, setSlotLayoutMode] = useSyncedState<NameTagSlotLayoutMode>(
    '5h:slotLayoutMode',
    'grid'
  );

  const resetStageControls = useCallback(() => {
    crossClientSync.resetAll({ scopePrefix: '5h:' });
    setNameTagRuntimeState({
      isTunerArenaActive: true,
      kickoffPermutationIndex: 0,
      activeCameraMode: 'pov',
      focusedCarIndex: 0,
    });
  }, []);

  return {
    arenaPreset,
    setArenaPreset,
    stageHeight,
    setStageHeight,
    cameraFovDeg,
    setCameraFovDeg,
    ballHeightOffset,
    setBallHeightOffset,
    animateBoostWave,
    setAnimateBoostWave,
    customNameOverride,
    setCustomNameOverride,
    slotLayoutMode,
    setSlotLayoutMode,
    resetStageControls,
  };
}
