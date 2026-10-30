import React, { useState } from 'react';
import { Sliders, RotateCcw, Copy, Check, Code2, Link2, Unlink2, Sparkles, } from 'lucide-react';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { Badge } from '../../../ui-core/primitives/Badge';
import { Button } from '../../../ui-core/primitives/Button';
import { CodeBlock } from '../../CodeBlock';
import { useMenuLayoutStore, resolvePanelHeaderBackBtnGeometry, type PanelHeaderBackBtnIdleTone, type PanelHeaderBackBtnRadiusMode, type PanelHeaderBackBtnStyle, type PanelHeaderRightBtnTransform } from '../../../ui-core/stores/menuLayoutStore';
import { PanelShellStagesTwoThree } from './PanelShellStagesTwoThree';

export interface PanelShellTunerProps {
  isLight?: boolean;
  title?: string;
  codeBadge?: string;
}

/**
 * 3-Stage Compound Panel Shell Tuner (Layer 2+ Standard Container)
 * Allows real-time customization of Header (font-size, decoupled back button width/height,
 * 4-mode corner radius strategy, visual surface style, right action button with Minimize-2 transform, gap, padding X/Y),
 * Content Container (padding X/Y), and Footer (font-size, padding X/Y, split right slot).
 * Persists directly to `localStorage` via `useMenuLayoutStore` so changes in L2 (PanelsPage)
 * and L6 (RecipesPage) immediately propagate across all Layer 2–4 recipes and L7 sandboxes.
 */
export const PanelShellTuner: React.FC<PanelShellTunerProps> = React.memo(({
  isLight = false,
  title = 'Layer 2+ Universal three-segment panel shell tuner (3-Stage Compound Shell Tuner)',
  codeBadge = '6A.2S',
}) => {
  const {
    lockPanelPaddingX,
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderTitleFontSize,
    lockPanelHeaderBackBtnAspect,
    panelHeaderBackBtnWidth,
    panelHeaderBackBtnHeight,
    panelHeaderBackBtnShowArrow,
    panelHeaderBackBtnShowLabel,
    panelHeaderBackBtnIdleTone,
    panelHeaderBackBtnStyle,
    panelHeaderBackBtnRadiusMode,
    panelHeaderBackBtnRadius,
    panelHeaderBackBtnInnerRadius,
    panelHeaderBackBtnRadiusTL,
    panelHeaderBackBtnRadiusTR,
    panelHeaderBackBtnRadiusBR,
    panelHeaderBackBtnRadiusBL,
    panelHeaderShowRightBtn,
    panelHeaderRightBtnTransform,
    panelHeaderRightBtnExpandOnHover,
    panelOuterRadius,
    panelHeaderGap,
    panelBodyPaddingX,
    panelBodyPaddingY,
    panelFooterPaddingX,
    panelFooterPaddingY,
    panelFooterFontSize,
    panelFooterSplitRight,
    panelFooterRightDivider,
    panelFooterRightPaddingX,
    setToken,
    updateTokens,
    resetPanelShellTokens,
    exportPanelShellConfigCode,
  } = useMenuLayoutStore();

  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const btnGeom = resolvePanelHeaderBackBtnGeometry({
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderBackBtnWidth,
    panelHeaderBackBtnHeight,
    panelHeaderBackBtnRadiusMode,
    panelHeaderBackBtnRadius,
    panelHeaderBackBtnInnerRadius,
    panelHeaderBackBtnRadiusTL,
    panelHeaderBackBtnRadiusTR,
    panelHeaderBackBtnRadiusBR,
    panelHeaderBackBtnRadiusBL,
    panelOuterRadius,
  });

  const handleCopy = async () => {
    const code = exportPanelShellConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyBackBtnPreset = (preset: 'flush-divider' | 'asymmetric-rect' | 'apple-compact-rect' | 'concentric-square' | 'subtle-ghost') => {
    if (preset === 'flush-divider') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: false,
        panelHeaderPaddingX: 0,
        panelHeaderPaddingY: 0,
        panelHeaderBackBtnWidth: 42,
        panelHeaderBackBtnHeight: 32,
        panelHeaderGap: 10,
        panelHeaderBackBtnRadiusMode: 'asymmetric-tl',
        panelHeaderBackBtnInnerRadius: 0,
        panelHeaderBackBtnStyle: 'surface',
      });
    } else if (preset === 'asymmetric-rect') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: false,
        panelHeaderPaddingX: 6,
        panelHeaderPaddingY: 6,
        panelHeaderBackBtnWidth: 30,
        panelHeaderBackBtnHeight: 26,
        panelHeaderGap: 6,
        panelHeaderBackBtnRadiusMode: 'asymmetric-tl',
        panelHeaderBackBtnInnerRadius: 6,
        panelHeaderBackBtnStyle: 'surface',
      });
    } else if (preset === 'apple-compact-rect') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: false,
        panelHeaderPaddingX: 6,
        panelHeaderPaddingY: 6,
        panelHeaderBackBtnWidth: 30,
        panelHeaderBackBtnHeight: 24,
        panelHeaderGap: 6,
        panelHeaderBackBtnRadiusMode: 'custom',
        panelHeaderBackBtnRadius: 7,
        panelHeaderBackBtnStyle: 'surface',
      });
    } else if (preset === 'concentric-square') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: true,
        panelHeaderPaddingX: 6,
        panelHeaderPaddingY: 6,
        panelHeaderBackBtnWidth: 26,
        panelHeaderBackBtnHeight: 26,
        panelHeaderGap: 6,
        panelHeaderBackBtnRadiusMode: 'auto',
        panelHeaderBackBtnStyle: 'surface',
      });
    } else if (preset === 'subtle-ghost') {
      updateTokens({
        lockPanelHeaderBackBtnAspect: false,
        panelHeaderPaddingX: 6,
        panelHeaderPaddingY: 6,
        panelHeaderBackBtnWidth: 28,
        panelHeaderBackBtnHeight: 24,
        panelHeaderGap: 6,
        panelHeaderBackBtnRadiusMode: 'asymmetric-tl',
        panelHeaderBackBtnInnerRadius: 6,
        panelHeaderBackBtnStyle: 'subtle',
      });
    }
  };

  return (
    <div id="panel-shell-tuner"
      className={`scroll-mt-6 p-5 md:p-6 rounded-2xl border flex flex-col gap-5 w-full transition-colors ${ isLight
      ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800' }`}>
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/70 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          {codeBadge && (
            <span className="px-2 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold font-mono text-xs shrink-0">
              {codeBadge}
            </span>
          )}
          <Sliders className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold">{title}</span>
          <Badge variant="amber" size="sm" isLight={isLight}>
            L2 ⇄ L6 ⇄ L7 Global Sync
          </Badge>
          <span className={`text-[11px] font-mono ${ isLight ? 'text-neutral-500' : 'text-neutral-400' }`}>
            Header: {panelHeaderPaddingX}×{panelHeaderPaddingY}px ({panelHeaderTitleFontSize}px · Btn {btnGeom.width}×{btnGeom.height}px · R={btnGeom.radiusSummary}) · Body: {panelBodyPaddingX}×{panelBodyPaddingY}px · Footer: {panelFooterPaddingX}×{panelFooterPaddingY}px ({panelFooterFontSize}px)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            icon={<Code2 className="h-3.5 w-3.5" />}
            onClick={() => setShowCode((v) => !v)}
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
            {copied ? 'Copied Shell config!' : 'Copy Shell Config'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isLight={isLight}
            icon={<RotateCcw className="h-3 w-3" />}
            onClick={resetPanelShellTokens}
          >
            reset to default
          </Button>
        </div>
      </div>

      {/* Horizontal Alignment Lock Toggle */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border ${ isLight
        ? 'bg-neutral-50 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800/80' }`}>
        <div className="flex items-center gap-2">
          {lockPanelPaddingX ? (
            <Link2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          ) : (
            <Unlink2 className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          )}
          <ToggleSwitch checked={lockPanelPaddingX} onCheckedChange={(v) => setToken('lockPanelPaddingX', v)}
            label="Lock horizontal margin alignment (Lock Header / Tabs / Content / Footer Padding X)" variant="neutral" isLight={isLight} />
        </div>
        <span className={`text-[11px] font-mono ${ isLight ? 'text-neutral-500' : 'text-neutral-400' }`}>
          {lockPanelPaddingX
            ? `Unified left-align baseline locked (${panelHeaderPaddingX}px)`
            : 'Unlocked: Allow Header / Content / Footer Independently set different levels Padding'}
        </span>
      </div>

      {/* Stage 1: Header Typography, Back Button W×H & Paddings */}
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            Stage 1 · Header Centered Title, Back Button Left & Top-right Minimize-2 (Hover Change Live Preview)
          </span>
          <div className="flex items-center gap-4 flex-wrap">
            <ToggleSwitch checked={panelHeaderBackBtnShowArrow}
              onCheckedChange={(v) => setToken('panelHeaderBackBtnShowArrow', v)} label="Show Arrow (Show Arrow)"
              variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={panelHeaderBackBtnShowLabel}
              onCheckedChange={(v) => setToken('panelHeaderBackBtnShowLabel', v)} label="show BACK (Show Back)"
              variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={lockPanelHeaderBackBtnAspect}
              onCheckedChange={(v) => setToken('lockPanelHeaderBackBtnAspect', v)} label="Lock 1:1 square (Lock W=H)"
              variant="neutral" isLight={isLight} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <SliderControl label="title font size (titleFontSize)" value={panelHeaderTitleFontSize} min={8} max={28} step={1}
            unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
            onChange={(v) => setToken('panelHeaderTitleFontSize', v)} isLight={isLight} />
          <SliderControl label="Back Button Width (backBtnWidth)" value={panelHeaderBackBtnWidth} min={12} max={56} step={1}
            unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
            onChange={(v) => setToken('panelHeaderBackBtnWidth', v)} isLight={isLight} />
          <SliderControl label="Back Button Height (backBtnHeight)" value={panelHeaderBackBtnHeight} min={12} max={44} step={1}
            unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
            onChange={(v) => setToken('panelHeaderBackBtnHeight', v)} isLight={isLight} />
          <SliderControl label="Button to title spacing (headerGap)" value={panelHeaderGap} min={0} max={24} step={1} unit="px"
            editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
            onChange={(v) => setToken('panelHeaderGap', v)} isLight={isLight} />
          <SliderControl label="Header horizontal padding (padX)" value={panelHeaderPaddingX} min={0} max={36} step={1} unit="px"
            editable={true} allowOutOfBoundsInput={true} colorScheme="sky"
            onChange={(v) => setToken('panelHeaderPaddingX', v)} isLight={isLight} />
          <SliderControl label="Header vertical padding (padY)" value={panelHeaderPaddingY} min={0} max={28} step={1} unit="px"
            editable={true} allowOutOfBoundsInput={true} colorScheme="emerald"
            onChange={(v) => setToken('panelHeaderPaddingY', v)} isLight={isLight} />
        </div>

        {/* Back Button & Mirrored Top-Right Action Button Lab */}
        <div className={`p-4 rounded-xl border flex flex-col gap-3.5 ${ isLight
          ? 'bg-neutral-50/80 border-neutral-200/80' : 'bg-neutral-950/40 border-neutral-800/80' }`}>
          {/* Row 1: Semantic Idle Tone + Border/Surface Style Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold">Default background color and border texture for top bar buttons (Idle Tone & Border Style)</span>
              <span className={`text-[11px] font-mono ${ isLight ? 'text-neutral-500' : 'text-neutral-400' }`}>
                L: <strong className="text-amber-500">{btnGeom.borderRadiusCss}</strong> · R: <strong className="text-sky-500">{btnGeom.rightBorderRadiusCss}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <SegmentedSwitch size="sm" isLight={isLight} value={panelHeaderBackBtnIdleTone}
                onValueChange={(val) => setToken('panelHeaderBackBtnIdleTone', val as PanelHeaderBackBtnIdleTone) }
                options={[ { value: 'match-header', label: 'Match top bar color (Match Header)' },
                { value: 'muted-gray', label: 'Default dark gray (Muted Gray)' },
                { value: 'elevated', label: 'Raised light background (Elevated)' }, ]} />
              <SegmentedSwitch size="sm" isLight={isLight} value={panelHeaderBackBtnStyle} onValueChange={(val) =>
                setToken('panelHeaderBackBtnStyle', val as PanelHeaderBackBtnStyle) } options={[
                { value: 'surface', label: 'Surface Border' }, { value: 'subtle', label: 'Subtle Borderless' },
                { value: 'ghost', label: 'Ghost Floating' }, ]} />
            </div>
          </div>

          {/* Row 1.5: Top-Right Minimize-2 Action Button Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex items-center gap-3 flex-wrap">
              <ToggleSwitch checked={panelHeaderShowRightBtn}
                onCheckedChange={(v) => setToken('panelHeaderShowRightBtn', v)}
                label="Enable top-right icon button (Minimize-2 / Custom Icon)" variant="neutral" isLight={isLight} />
              <ToggleSwitch checked={panelHeaderRightBtnExpandOnHover}
                onCheckedChange={(v) => setToken('panelHeaderRightBtnExpandOnHover', v)}
                label="Hover expand Live Preview Text" variant="neutral" isLight={isLight} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-neutral-400">Top-right icon orientation:</span>
              <SegmentedSwitch size="sm" isLight={isLight} value={panelHeaderRightBtnTransform}
                onValueChange={(val) =>
                setToken('panelHeaderRightBtnTransform', val as PanelHeaderRightBtnTransform) } options={[
                { value: 'flip-x', label: 'Flip Horizontal (Flip X)' }, { value: 'rotate-90', label: 'Rotate 90° (Rotate 90°)' },
                { value: 'none', label: 'Original Orientation (None)' }, ]} />
            </div>
          </div>

          {/* Row 2: 4-Mode Corner Strategy Switcher + Quick Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <SegmentedSwitch size="sm" isLight={isLight} value={panelHeaderBackBtnRadiusMode}
              onValueChange={(val) => setToken('panelHeaderBackBtnRadiusMode', val as PanelHeaderBackBtnRadiusMode)
              } options={[ { value: 'asymmetric-tl',
              label: `concentric outer corner+Tri-Corner Convergence (${btnGeom.concentricRadius}/${btnGeom.innerRadius}px)`, }, { value: 'auto',
              label: `Quad-Corner Concentric (${btnGeom.concentricRadius}px)`, }, { value: 'custom',
              label: `Uniform manual corners (${panelHeaderBackBtnRadius}px)`, }, { value: 'per-corner',
              label: `Four corners fully independent (TL/TR/BR/BL)`, }, ]} />

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Recommended Preset:
              </span>
              <button
                type="button"
                onClick={() => applyBackBtnPreset('flush-divider')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="0×0 Full Height Edge + 42×32px Keep only inner single divider + concentric outer corner 16/0/0/0"
              >
                ① Edge Divider (42×32 · Pad 0 · 16/0/0/0)
              </button>
              <button
                type="button"
                onClick={() => applyBackBtnPreset('asymmetric-rect')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="30×26px Wide Rect + Outer corner adaptive concentric(10px) + Remaining Three Corners 6px Small Radius"
              >
                ② Outer corner concentric wide (30×26 · 10/6/6/6)
              </button>
              <button
                type="button"
                onClick={() => applyBackBtnPreset('apple-compact-rect')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="Apple macOS Toolbar Style: 30×24px Compact Wide Rectangle + 7px Uniform Corner Radius"
              >
                ③ macOS Compact Wide Rectangle (30×24 · R=7)
              </button>
              <button
                type="button"
                onClick={() => applyBackBtnPreset('subtle-ghost')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title="Borderless translucent base + Outer corner concentric inset, Reduce expansion effect of rounded corners on static borders"
              >
                ④ Translucent Frameless Inset (28×24 · Subtle)
              </button>
            </div>
          </div>

          {/* Row 3: Dynamic Radius Sliders based on active mode */}
          {panelHeaderBackBtnRadiusMode === 'per-corner' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <SliderControl label="Panel Corner Radius (panelOuterRadius)" value={panelOuterRadius} min={0} max={36} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
                onChange={(v) => setToken('panelOuterRadius', v)} isLight={isLight} />
              <SliderControl label="Top Left Radius (Radius TL)" value={panelHeaderBackBtnRadiusTL} min={0} max={24} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
                onChange={(v) => setToken('panelHeaderBackBtnRadiusTL', v)} isLight={isLight} />
              <SliderControl label="Top Right Radius (Radius TR)" value={panelHeaderBackBtnRadiusTR} min={0} max={24} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="sky"
                onChange={(v) => setToken('panelHeaderBackBtnRadiusTR', v)} isLight={isLight} />
              <SliderControl label="Bottom Right Radius (Radius BR)" value={panelHeaderBackBtnRadiusBR} min={0} max={24} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="sky"
                onChange={(v) => setToken('panelHeaderBackBtnRadiusBR', v)} isLight={isLight} />
              <SliderControl label="Bottom Left Radius (Radius BL)" value={panelHeaderBackBtnRadiusBL} min={0} max={24} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="sky"
                onChange={(v) => setToken('panelHeaderBackBtnRadiusBL', v)} isLight={isLight} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <SliderControl label="Panel Corner Radius (panelOuterRadius)" value={panelOuterRadius} min={0} max={36} step={1}
                unit="px" editable={true} allowOutOfBoundsInput={true} colorScheme="amber"
                onChange={(v) => setToken('panelOuterRadius', v)} isLight={isLight} />
              <SliderControl label={ panelHeaderBackBtnRadiusMode === 'asymmetric-tl'
                ? `Remaining three inner corner radii (TR/BR/BL · Outer Corner=${btnGeom.concentricRadius}px)` : 'Inner three small corner radii (backBtnInnerRadius)' }
                value={panelHeaderBackBtnInnerRadius} min={0} max={24} step={1} unit="px" editable={true}
                allowOutOfBoundsInput={true} colorScheme="sky" onChange={(v) => {
                if (panelHeaderBackBtnRadiusMode !== 'asymmetric-tl') {
                setToken('panelHeaderBackBtnRadiusMode', 'asymmetric-tl'); }
                setToken('panelHeaderBackBtnInnerRadius', v); }} isLight={isLight} />
              <SliderControl label={ panelHeaderBackBtnRadiusMode === 'custom' ? 'Uniform corner radius (backBtnRadius)'
                : `Toggle uniform corner radius (current ${btnGeom.radiusSummary})` } value={ panelHeaderBackBtnRadiusMode === 'auto'
                ? btnGeom.concentricRadius : panelHeaderBackBtnRadius } min={0} max={24} step={1} unit="px"
                editable={true} allowOutOfBoundsInput={true} colorScheme="amber" onChange={(v) => {
                setToken('panelHeaderBackBtnRadiusMode', 'custom'); setToken('panelHeaderBackBtnRadius', v); }}
                isLight={isLight} />
            </div>
          )}
        </div>
      </div>

      <PanelShellStagesTwoThree isLight={isLight} showCode={showCode} />
    </div>
  );
});

PanelShellTuner.displayName = 'PanelShellTuner';

