import React, { useEffect } from 'react';
import { quickNotification } from '../../../ui-core/stores/quickNotificationStore';
import { floatingSandboxStore, useFloatingStore } from '../../../ui-core/stores/floatingStore';
import { createScopedSyncedState } from '../../stores/crossClientSync';
import {
  USER_PRESET_WINDOWS,
  type FloatingWindowVisibilityTier,
  type PresetConfig,
} from '../../../ui-core/stores/floatingPresets';
import { DEV_PRESET_WINDOWS } from '../../../ui-core/stores/devFloatingPresets';
import { getDiscoveredFloatingSurfaces } from '../../../ui-core/manifest/floatingSurfaceRegistry';
import { resolveCalibratedSurfaceSizing } from '../../../ui-core/manifest/surfaceCalibration';

const useSyncedState = createScopedSyncedState('page:floating-windows-v2');

export function buildMergedFloatingPresets(tier: FloatingWindowVisibilityTier): PresetConfig[] {
  const staticList = tier === 'user' ? USER_PRESET_WINDOWS : DEV_PRESET_WINDOWS;
  const byId = new Map<string, PresetConfig>();

  for (const preset of staticList) {
    const calibrated = resolveCalibratedSurfaceSizing(`floating:${preset.id}`, {
      width: preset.width,
      height: preset.height,
      minWidth: preset.minWidth,
      minHeight: preset.minHeight,
      maxHeight: preset.maxHeight,
      mode: preset.autoFitHeight ? 'adaptive' : 'fixed',
    });
    byId.set(preset.id, {
      ...preset,
      width: calibrated.width,
      height: typeof calibrated.height === 'number' ? calibrated.height : preset.height,
      minWidth: calibrated.minWidth,
      minHeight: calibrated.minHeight ?? preset.minHeight,
      maxHeight: calibrated.maxHeight,
      autoFitHeight: calibrated.mode === 'adaptive' ? true : preset.autoFitHeight,
    });
  }

  for (const entry of getDiscoveredFloatingSurfaces()) {
    const entryTier: FloatingWindowVisibilityTier =
      entry.meta.layer === 'floating-user' ? 'user' : 'developer';
    if (entryTier !== tier || byId.has(entry.meta.id)) continue;
    const calibrated = resolveCalibratedSurfaceSizing(
      `floating:${entry.meta.id}`,
      entry.meta.defaultSizing
    );
    byId.set(entry.meta.id, {
      id: entry.meta.id,
      title: entry.meta.title,
      category: entry.meta.menuGroup ?? 'Developer',
      width: calibrated.width,
      height: typeof calibrated.height === 'number' ? calibrated.height : 580,
      minWidth: calibrated.minWidth,
      minHeight: calibrated.minHeight ?? 200,
      maxHeight: calibrated.maxHeight,
      autoFitHeight: calibrated.mode === 'adaptive',
      resizable: true,
      singleton: true,
      tier: entryTier,
      summary: entry.meta.subtitle,
      tabs: entry.meta.variants?.map((v) => ({ id: v.variantId, label: v.label })),
    });
  }

  return Array.from(byId.values());
}

export function useFloatingWindowsCalibration(currentPreset?: PresetConfig) {
  const { windows, updateSize, updateMinWidth, updateMinHeight } =
    useFloatingStore(floatingSandboxStore);

  const [manualMinWidths, setManualMinWidths] = useSyncedState<Record<string, number>>(
    {},
    'manualMinWidths'
  );
  const [manualMinHeights, setManualMinHeights] = useSyncedState<Record<string, number>>(
    {},
    'manualMinHeights'
  );

  const [minWidthDraft, setMinWidthDraft] = React.useState<string>('');
  const [isEditingMinWidth, setIsEditingMinWidth] = React.useState<boolean>(false);
  const [minHeightDraft, setMinHeightDraft] = React.useState<string>('');
  const [isEditingMinHeight, setIsEditingMinHeight] = React.useState<boolean>(false);

  const activeWindowInstance = windows.find(
    (w) => w.id === currentPreset?.id || (currentPreset && w.id.startsWith(currentPreset.id))
  );
  const resolvedAutoMinW = Math.round(
    activeWindowInstance?.autoMinWidth ?? currentPreset?.minWidth ?? 340
  );
  const resolvedScrollbarReserve = Math.round(
    activeWindowInstance?.scrollbarReservePx ?? (currentPreset?.resizable ? 16 : 0)
  );
  const activeManualMinW =
    currentPreset && typeof manualMinWidths[currentPreset.id] === 'number'
      ? Math.round(manualMinWidths[currentPreset.id])
      : activeWindowInstance?.manualMinWidth;
  const resolvedEffectiveMinW = Math.round(activeManualMinW ?? resolvedAutoMinW);

  const resolvedPresetMinH = Math.round(
    currentPreset?.minHeight ?? activeWindowInstance?.minHeight ?? 115
  );
  const activeManualMinH =
    currentPreset && typeof manualMinHeights[currentPreset.id] === 'number'
      ? Math.round(manualMinHeights[currentPreset.id])
      : activeWindowInstance?.manualMinHeight;
  const resolvedEffectiveMinH = Math.round(activeManualMinH ?? resolvedPresetMinH);
  const resolvedIntrinsicMaxH = Math.round(
    activeWindowInstance?.intrinsicMaxHeight ?? currentPreset?.height ?? 360
  );

  useEffect(() => {
    if (!isEditingMinWidth) {
      setMinWidthDraft(String(resolvedEffectiveMinW));
    }
  }, [resolvedEffectiveMinW, isEditingMinWidth, currentPreset?.id]);

  useEffect(() => {
    if (!isEditingMinHeight) {
      setMinHeightDraft(String(resolvedEffectiveMinH));
    }
  }, [resolvedEffectiveMinH, isEditingMinHeight, currentPreset?.id]);

  const applyManualMinWidth = (nextRawPx: number) => {
    if (!currentPreset) return;
    const clampedPx = Math.max(240, Math.min(960, Math.round(nextRawPx)));
    setManualMinWidths((prev) => ({
      ...(prev && typeof prev === 'object' ? prev : {}),
      [currentPreset.id]: clampedPx,
    }));
    setMinWidthDraft(String(clampedPx));
    updateMinWidth(currentPreset.id, clampedPx);
    updateSize(
      currentPreset.id,
      { width: clampedPx, height: activeWindowInstance?.height ?? currentPreset.height },
      true
    );
  };

  const handleResetAutoMinWidth = () => {
    if (!currentPreset) return;
    setManualMinWidths((prev) => {
      const next = { ...(prev && typeof prev === 'object' ? prev : {}) };
      delete next[currentPreset.id];
      return next;
    });
    updateMinWidth(currentPreset.id, undefined);
    updateSize(
      currentPreset.id,
      {
        width: resolvedAutoMinW,
        height: Math.max(resolvedEffectiveMinH, resolvedIntrinsicMaxH),
      },
      false
    );
    quickNotification.info(
      `Reset ${currentPreset.title} minWidth to Auto-Detected ${resolvedAutoMinW}px (incl. ${resolvedScrollbarReserve}px scrollbar reserve).`
    );
  };

  const handleSnapToMinWidth = (withVerticalScrollbar: boolean) => {
    if (!currentPreset) return;
    const targetH = withVerticalScrollbar
      ? Math.round(resolvedEffectiveMinH)
      : Math.round(Math.max(resolvedEffectiveMinH, resolvedIntrinsicMaxH));
    updateSize(
      currentPreset.id,
      { width: resolvedEffectiveMinW, height: targetH },
      withVerticalScrollbar
    );
  };

  const applyManualMinHeight = (nextRawPx: number) => {
    if (!currentPreset) return;
    const upperCap = Math.max(110, resolvedIntrinsicMaxH);
    const clampedPx = Math.max(100, Math.min(upperCap, Math.round(nextRawPx)));
    setManualMinHeights((prev) => ({
      ...(prev && typeof prev === 'object' ? prev : {}),
      [currentPreset.id]: clampedPx,
    }));
    setMinHeightDraft(String(clampedPx));
    updateMinHeight(currentPreset.id, clampedPx);
    updateSize(
      currentPreset.id,
      { width: activeWindowInstance?.width ?? currentPreset.width, height: clampedPx },
      true
    );
  };

  const handleResetPresetMinHeight = () => {
    if (!currentPreset) return;
    setManualMinHeights((prev) => {
      const next = { ...(prev && typeof prev === 'object' ? prev : {}) };
      delete next[currentPreset.id];
      return next;
    });
    updateMinHeight(currentPreset.id, undefined);
    updateSize(
      currentPreset.id,
      {
        width: activeWindowInstance?.width ?? resolvedEffectiveMinW,
        height: Math.max(resolvedPresetMinH, resolvedIntrinsicMaxH),
      },
      false
    );
    quickNotification.info(
      `Reset ${currentPreset.title} minHeight to explicit preset ${resolvedPresetMinH}px.`
    );
  };

  const handleSnapToMinHeight = (snapToMin: boolean) => {
    if (!currentPreset) return;
    const targetH = snapToMin
      ? Math.round(resolvedEffectiveMinH)
      : Math.round(Math.max(resolvedEffectiveMinH, resolvedIntrinsicMaxH));
    updateSize(
      currentPreset.id,
      { width: activeWindowInstance?.width ?? currentPreset.width, height: targetH },
      snapToMin
    );
  };

  const handleCopyCalibratedParams = () => {
    if (!currentPreset) return;
    const payload = {
      id: currentPreset.id,
      title: currentPreset.title,
      minWidth: resolvedEffectiveMinW,
      autoMinWidth: resolvedAutoMinW,
      scrollbarReservePx: resolvedScrollbarReserve,
      minWidthMode: activeManualMinW !== undefined ? 'manual-calibrated' : 'auto-detected',
      minHeight: resolvedEffectiveMinH,
      presetMinHeight: resolvedPresetMinH,
      intrinsicMaxHeight: resolvedIntrinsicMaxH,
      minHeightMode: activeManualMinH !== undefined ? 'manual-calibrated' : 'explicit-preset',
      defaultWidth: resolvedEffectiveMinW,
      defaultHeight: Math.max(resolvedEffectiveMinH, resolvedIntrinsicMaxH),
      ...(Object.keys(manualMinWidths || {}).length > 0
        ? { allManualMinWidths: manualMinWidths }
        : {}),
      ...(Object.keys(manualMinHeights || {}).length > 0
        ? { allManualMinHeights: manualMinHeights }
        : {}),
    };
    const jsonText = JSON.stringify(payload, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonText).catch(() => {});
    }
    quickNotification.success(
      `Copied calibrated params for ${currentPreset.title}: minWidth=${resolvedEffectiveMinW}px, minHeight=${resolvedEffectiveMinH}px (MaxH=${resolvedIntrinsicMaxH}px).`
    );
  };

  return {
    manualMinWidths,
    manualMinHeights,
    activeWindowInstance,
    resolvedAutoMinW,
    resolvedScrollbarReserve,
    activeManualMinW,
    resolvedEffectiveMinW,
    resolvedPresetMinH,
    activeManualMinH,
    resolvedEffectiveMinH,
    resolvedIntrinsicMaxH,
    minWidthDraft,
    setMinWidthDraft,
    setIsEditingMinWidth,
    minHeightDraft,
    setMinHeightDraft,
    setIsEditingMinHeight,
    applyManualMinWidth,
    handleResetAutoMinWidth,
    handleSnapToMinWidth,
    applyManualMinHeight,
    handleResetPresetMinHeight,
    handleSnapToMinHeight,
    handleCopyCalibratedParams,
  };
}
