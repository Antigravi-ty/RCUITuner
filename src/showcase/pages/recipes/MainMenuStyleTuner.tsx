import React, { useState } from 'react';
import {
  Sliders, RotateCcw, Copy, Check,
  Code2, Type, Box, Palette,
  Layers, LayoutTemplate, Sparkles, Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { Badge } from '../../../ui-core/primitives/Badge';
import { Button } from '../../../ui-core/primitives/Button';
import { CodeBlock } from '../../CodeBlock';
import {
  Layer1MainMenuRecipe, Layer1ContextGroupedSelector, resolveLayer1ContextSpec, type Layer1ContextVariation,
} from '../../../ui-core/recipes/Layer1MainMenuRecipe';
import {
  useMainMenuStyleStore, MAIN_MENU_STYLE_PRESETS, MAIN_MENU_ITEM_SLOTS, MAIN_MENU_ICON_COLOR_OPTIONS,
  JETBRAINS_MONO_WEIGHT_OPTIONS, isCustomMainMenuColor, resolveMainMenuIconHex, resolveMainMenuTitleTypography,
  detectIsAppleDevice, hexToRgbTuple, rgbTupleToHex, type MainMenuStyleVariant,
  type MainMenuFontFamilyMode, type MainMenuRowAlignMode, type MainMenuResumeHighlightStyle, type MainMenuItemSlotId,
  type MainMenuPlatformPreviewMode,
} from '../../../ui-core/stores/mainMenuStyleStore';
import { MainMenuStyleGroupsCDE } from './MainMenuStyleGroupsCDE';
import { MainMenuStylePreviewShootout } from './MainMenuStylePreviewShootout';

export interface MainMenuStyleTunerProps {
  isLight?: boolean;
  codeBadge?: string;
  title?: string;
  /** Compact mode when embedded inside 7A inline tuner drawer */
  compact?: boolean;
  /** Whether to render the dedicated 1:1 full-scale active preview inside the tuner (default: !compact) */
  showLivePreview?: boolean;
  /** Active Layer 1 context mode for preview (defaults to synced store.previewContextMode) */
  contextMode?: Layer1ContextVariation;
  onChangeContextMode?: (ctx: Layer1ContextVariation) => void;
}

export const MainMenuStyleTuner: React.FC<MainMenuStyleTunerProps> = React.memo(({
  isLight = false,
  codeBadge = '6A.1M',
  title = 'Layer 1 MENU Minimalist large-text menu full-parameter tuning workbench (Row Border · icon · Font Size · 8 Font Weight Level · Header/Content/Footer padding)',
  compact = false,
  showLivePreview: propShowLivePreview,
  contextMode: propContextMode,
  onChangeContextMode,
}) => {
  const store = useMainMenuStyleStore();
  const {
    variant,
    previewContextMode,
    setPreviewContextMode,
    setVariant,
    setParam,
    setItemIconColor,
    applyPreset,
    resetParams,
    exportConfigCode,
  } = store;

  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showLivePanel, setShowLivePanel] = useState(propShowLivePreview ?? !compact);
  const [showShootout, setShowShootout] = useState(!compact);

  const activeCtxMeta = resolveLayer1ContextSpec(
    propContextMode ?? (previewContextMode as Layer1ContextVariation) ?? 'freeplay'
  );
  const activeCtx = activeCtxMeta.id;

  const handleSelectCtx = (ctx: Layer1ContextVariation) => {
    setPreviewContextMode(ctx);
    onChangeContextMode?.(ctx);
  };

  const handleCopy = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="main-menu-style-tuner"
      className={`scroll-mt-6 p-5 rounded-2xl border flex flex-col gap-5 transition-colors ${ isLight
      ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
      {/* Top Header & Copy / Export / Reset Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
            {codeBadge}
          </span>
          <Sliders className="h-4 w-4 text-amber-500 shrink-0" />
          <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          <Badge variant="primary" size="sm" isLight={isLight}>
            6A.1 ⇄ 6A.1M ⇄ 7A Multi-screen real-time sync
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {!compact && (
            <>
              <Button
                size="sm"
                variant={showLivePanel ? 'primary' : 'secondary'}
                isLight={isLight}
                icon={<Eye className="h-3.5 w-3.5" />}
                onClick={() => setShowLivePanel((prev) => !prev)}
              >
                {showLivePanel ? 'collapse 1:1 Full menu preview' : 'expand 1:1 Full menu preview'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                isLight={isLight}
                icon={<Layers className="h-3.5 w-3.5" />}
                onClick={() => setShowShootout((prev) => !prev)}
              >
                {showShootout ? 'Collapse three-way comparison' : 'Expand three-way comparison'}
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            icon={<Code2 className="h-3.5 w-3.5" />}
            onClick={() => setShowCode((prev) => !prev)}
          >
            {showCode ? 'hide config code' : 'view config code'}
          </Button>
          <Button
            size="sm"
            variant="primary"
            isLight={isLight}
            icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            onClick={handleCopy}
          >
            {copied ? 'Parameters copied!' : 'Copy parameter config'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isLight={isLight}
            icon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={resetParams}
          >
            reset to default
          </Button>
        </div>
      </div>

      {showCode && (
        <CodeBlock isLight={isLight}
          title="current Layer 1 Main Menu Export full parameter config (Direct copy or solidify to src/tokens/mainMenuStyleStore.ts)"
          code={exportConfigCode()} />
      )}

      {/* Quick Core Hypothesis Bar: Concise "Resume", No Description, Bare/Boxed Icon, Font Family */}
      <div className={`p-3.5 rounded-xl border flex flex-col gap-3 ${ isLight
        ? 'bg-amber-50/40 border-amber-200/80' : 'bg-amber-500/5 border-amber-500/30' }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Sparkles className="h-4 w-4" />
            <span>Core minimalist visual toggle (Experimental Priority: Keep Only [border + icon + Large Title], Remove Bottom Description)</span>
          </div>

          {/* 3 Style Archetype Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'large-clean-row', label: 'style 1 (default): Minimalist Large Single Line' },
                { id: 'mono-watermark-row', label: 'style 2: Mono Large Text + Background Watermark Icon' },
                { id: 'classic-descriptive-row', label: 'Style 3: Include Below Description' },
              ] as { id: MainMenuStyleVariant; label: string }[]
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  variant === v.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-1">
          <ToggleSwitch checked={store.conciseResumeLabel}
            onCheckedChange={(v) => setParam('conciseResumeLabel', v)}
            label="Minimalist Resume Title (Resume Replace Resume Match)" isLight={isLight} />
          <ToggleSwitch checked={store.showDescription} onCheckedChange={(v) => setParam('showDescription', v)}
            label="Display Below Description subtitle" isLight={isLight} />
          <ToggleSwitch checked={store.showIconBox} onCheckedChange={(v) => setParam('showIconBox', v)}
            label="Display icon with inner frame (Icon Box)" isLight={isLight} />
          <ToggleSwitch checked={store.showIcon} onCheckedChange={(v) => setParam('showIcon', v)}
            label="Show Left Icon (Icon)" isLight={isLight} />
          <ToggleSwitch checked={store.showShortcutBadge} onCheckedChange={(v) => setParam('showShortcutBadge', v)}
            label="show ESC Keycap" isLight={isLight} />
          <ToggleSwitch checked={store.showRightArrow} onCheckedChange={(v) => setParam('showRightArrow', v)}
            label="Show Right Arrow (>)" isLight={isLight} />
          <ToggleSwitch checked={store.showDividers} onCheckedChange={(v) => setParam('showDividers', v)}
            label="Show group divider" isLight={isLight} />
        </div>
      </div>

      {/* 6 Curated Quick Presets Bar */}
      <div className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${ isLight
        ? 'bg-neutral-50/80 border-neutral-200/80' : 'bg-neutral-950/60 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-amber-500" />
            <span>6 Featured Group MENU One-click visual scheme loading (Curated Menu Style Presets)</span>
          </span>
          <span className="text-[11px] font-mono text-neutral-400">Click any preset to view below A–E Continue fine-tuning parameter groups and copy configuration with one click</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {MAIN_MENU_STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.params)}
              className={`p-2.5 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-amber-50/50 border-neutral-200 hover:border-amber-400'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 hover:border-amber-500/60'
              }`}
            >
              <span className="text-xs font-bold text-amber-500">{preset.label}</span>
              <span className={`text-[11px] leading-snug ${ isLight ? 'text-neutral-600' : 'text-neutral-400' }`}>
                {preset.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Group A: Row Outer Box & List Spacing Geometry */}
      <div className={`p-4 rounded-xl border flex flex-col gap-3.5 ${ isLight
        ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800' }`}>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
          <Box className="h-4 w-4" />
          <span>A. Row outer frame geometry, Liner and list spacing (Row Outer Frame &amp; List Spacing)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SliderControl label="Horizontal Row Padding (itemPadX)" value={store.itemPaddingXPx} min={6} max={36} step={1} unit="px"
            editable allowOutOfBoundsInput colorScheme="amber" onChange={(v) => setParam('itemPaddingXPx', v)}
            isLight={isLight} />
          <SliderControl label="Row Padding (itemPadY)" value={store.itemPaddingYPx} min={4} max={32} step={1} unit="px"
            editable allowOutOfBoundsInput colorScheme="amber" onChange={(v) => setParam('itemPaddingYPx', v)}
            isLight={isLight} />
          <SliderControl label="Min Row Height (itemMinH)" value={store.itemMinHeightPx} min={36} max={100} step={1}
            unit="px" editable allowOutOfBoundsInput colorScheme="amber"
            onChange={(v) => setParam('itemMinHeightPx', v)} isLight={isLight} />
          <SliderControl label="Row Corner Radius (itemRadius)" value={store.itemRadiusPx} min={0} max={28} step={1} unit="px"
            editable allowOutOfBoundsInput colorScheme="sky" onChange={(v) => setParam('itemRadiusPx', v)}
            isLight={isLight} />
          <SliderControl label="Vertical row-to-row spacing (itemGap)" value={store.itemGapPx} min={0} max={24} step={1} unit="px"
            editable allowOutOfBoundsInput colorScheme="emerald" onChange={(v) => setParam('itemGapPx', v)}
            isLight={isLight} />
          <SliderControl label="Divider vertical margins (dividerMarginY)" value={store.dividerMarginYPx} min={-12} max={16}
            step={1} unit="px" editable allowOutOfBoundsInput colorScheme="emerald"
            onChange={(v) => setParam('dividerMarginYPx', v)} isLight={isLight} />
          <SliderControl label="Menu frame buffer padding (containerPad)" value={store.menuContainerPaddingPx} min={0} max={16}
            step={1} unit="px" editable allowOutOfBoundsInput colorScheme="sky"
            onChange={(v) => setParam('menuContainerPaddingPx', v)} isLight={isLight} />
          <SliderControl label="Row Border Width (borderWidth)" value={store.itemBorderWidthPx} min={0} max={3} step={1}
            unit="px" editable allowOutOfBoundsInput colorScheme="sky"
            onChange={(v) => setParam('itemBorderWidthPx', v)} isLight={isLight} />
        </div>
      </div>

      {/* Group B: Title Typography & 8 Official Font Weights */}
      <div className={`p-4 rounded-xl border flex flex-col gap-4 ${ isLight
        ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Type className="h-4 w-4" />
            <span>B. Header Font, font size, Official Spacing 8 Font Weight Level (Title Typography &amp; Font Weight)</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">Title Font (Font Family):</span>
              {(
                [
                  { id: 'sans', label: 'Apple Sans (Non Apple Auto Fallback To JetBrains Mono)' },
                  { id: 'mono', label: 'JetBrains Mono (Full-platform forced monospace)' },
                ] as { id: MainMenuFontFamilyMode; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setParam('titleFontFamily', f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                    store.titleFontFamily === f.id
                      ? 'bg-amber-500 text-white border-amber-500 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-700'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <ToggleSwitch checked={store.titleUppercase} onCheckedChange={(v) => setParam('titleUppercase', v)}
              label="All Caps Title (UPPERCASE)" isLight={isLight} />
          </div>
        </div>

        {/* Cross-Platform Font & Weight Fallback Bar (Apple Sans 800 -> Non-Apple JetBrains Mono Regular 400) */}
        {store.titleFontFamily === 'sans' && (
          <div
            className={`px-3 py-2 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
            isLight ? 'bg-amber-50/50 border-amber-200/80 text-neutral-700'
            : 'bg-amber-500/5 border-amber-500/25 text-neutral-300' }`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-500">Cross-platform font and weight auto-scaling Fallback Strategy:</span>
              <span>
                Apple Device Usage <strong className="text-amber-500">Apple Sans ({store.titleFontWeight})</strong>
                {' · '}Non Apple Device Auto Fallback To{' '}
                <strong className="text-emerald-500">JetBrains Mono Regular (400)</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Preview Simulation:</span>
              {(
                [
                  {
                    id: 'auto',
                    label: `Auto Detect (${detectIsAppleDevice() ? 'current Apple' : 'Currently Not Apple'})`,
                  },
                  { id: 'apple', label: `Apple Sans (${store.titleFontWeight})` },
                  { id: 'non-apple-fallback', label: 'Non Apple Fallback (Mono Regular 400)' },
                ] as { id: MainMenuPlatformPreviewMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => store.setPlatformPreviewMode(m.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-all ${
                    store.platformPreviewMode === m.id
                      ? 'bg-amber-500 text-white border-amber-500 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SliderControl label="Header Font Size (titleFontSize)" value={store.titleFontSizePx} min={12} max={34} step={1}
            unit="px" editable allowOutOfBoundsInput colorScheme="amber"
            onChange={(v) => setParam('titleFontSizePx', v)} isLight={isLight} />
          <SliderControl label="Title Letter Spacing (letterSpacing)" value={store.titleLetterSpacingEm} min={-0.08} max={0.18}
            step={0.01} unit="em" editable allowOutOfBoundsInput colorScheme="amber"
            onChange={(v) => setParam('titleLetterSpacingEm', v)} isLight={isLight} />
          <SliderControl label="Title Line Height (lineHeight · Descender not clipped)" value={store.titleLineHeight} min={0.95} max={1.6}
            step={0.05} editable allowOutOfBoundsInput colorScheme="amber"
            onChange={(v) => setParam('titleLineHeight', v)} isLight={isLight} />
          <SliderControl label="Vertical title visual fine-tuning (titleOffsetY)" value={store.titleOffsetYPx} min={-6} max={6} step={0.5}
            unit="px" editable allowOutOfBoundsInput colorScheme="emerald"
            onChange={(v) => store.setTitleOffsetYPx(v)} isLight={isLight} />
        </div>

        {/* 8 Font Weights */}
        <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              Title Font Weight (100 Thin ~ 800 Extra Bold · Non Apple Device Fallback To JetBrains Mono Auto Fallback to 400 Regular):
            </span>
            {resolveMainMenuTitleTypography(
              store.titleFontFamily,
              store.titleFontWeight,
              store.platformPreviewMode
            ).isUsingMonoFallback && (
              <span className="text-[11px] font-mono text-emerald-500 font-bold">
                Currently Active: JetBrains Mono Regular (400) Fallback
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {JETBRAINS_MONO_WEIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.weight}
                type="button"
                onClick={() => setParam('titleFontWeight', opt.weight)}
                style={{
                  fontFamily:
                    store.titleFontFamily === 'mono'
                      ? 'var(--font-jetbrains)'
                      : 'var(--font-apple)',
                  fontWeight: opt.weight,
                }}
                className={`py-1.5 px-2 rounded-lg text-xs border cursor-pointer transition-all ${
                  store.titleFontWeight === opt.weight
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : isLight
                    ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {opt.label} ({opt.weight})
              </button>
            ))}
          </div>
        </div>

        {/* Optional Description Sliders when showDescription is enabled */}
        {store.showDescription && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/70">
            <SliderControl label="Description font size (descSize)" value={store.descFontSizePx} min={10} max={16}
              step={1} unit="px" editable allowOutOfBoundsInput colorScheme="sky"
              onChange={(v) => setParam('descFontSizePx', v)} isLight={isLight} />
            <SliderControl label="Description Line Height (descLineHeight)" value={store.descLineHeight} min={1.0} max={1.8}
              step={0.05} editable allowOutOfBoundsInput colorScheme="sky"
              onChange={(v) => setParam('descLineHeight', v)} isLight={isLight} />
            <SliderControl label="Title and Description spacing" value={store.titleDescGapPx} min={0} max={12} step={1}
              unit="px" editable allowOutOfBoundsInput colorScheme="sky"
              onChange={(v) => setParam('titleDescGapPx', v)} isLight={isLight} />
          </div>
        )}
      </div>

      <MainMenuStyleGroupsCDE isLight={isLight} />

      <MainMenuStylePreviewShootout
        isLight={isLight}
        activeCtx={activeCtx}
        activeCtxMeta={activeCtxMeta}
        handleSelectCtx={handleSelectCtx}
        showLivePanel={showLivePanel}
        showShootout={showShootout}
      />
    </div>
  );
});

MainMenuStyleTuner.displayName = 'MainMenuStyleTuner';
