import React, { useState } from 'react';
import {
  Sparkles, Layers, Sliders, RotateCcw,
  Copy, Check, Code2, ArrowUpRight,
  Box, CheckCircle2, Palette,
} from 'lucide-react';
import { PlayModeCard } from '../../ui-core/layout/PlayModeCard';
import { PLAY_MODES } from '../../ui-core/recipes/Layer2PlayRecipe';
import { Badge } from '../../ui-core/primitives/Badge';
import { Button } from '../../ui-core/primitives/Button';
import { SliderControl } from '../../ui-core/primitives/SliderControl';
import { CodeBlock } from '../CodeBlock';
import { PageJumpDirectory, type JumpDirectoryItem } from '../PageJumpDirectory';
import {
  usePlayCardStyleStore, PLAY_CARD_STYLE_PRESETS, PLAY_CARD_ICON_COLOR_OPTIONS, isCustomPlayCardColor,
  resolvePlayCardIconHex, hexToRgbTuple, rgbTupleToHex, type PlayCardStyleVariant,
  type PlayModeCardId,
} from '../../ui-core/stores/playCardStyleStore';
import { PlayCardTunerGroupsCD, PlayCardLivePreviewAndMatrix, } from './play-card/PlayCardTunerGroupsCDAndPreview';

export interface PlayCardPageProps {
  isLight?: boolean;
  onNavigateToSandboxPlay?: () => void;
}

const PLAY_CARD_JUMP_ITEMS: JumpDirectoryItem[] = [
  {
    code: '2B.1',
    componentName: 'PlayModeCardSingleComparison',
    label: 'Single-card three-style side-by-side inspection and preset switching (Style 1 vs Style 2 vs Style 3)',
    targetId: 'play-card-2b-1-single',
    tag: 'L2 · Single Card',
  },
  {
    code: '2B.2',
    componentName: 'PlayModeCardParameterTuner',
    label: 'Full-parameter fine-tuning workbench (8 Official font weight + 30% Large Watermark Icon + 6 Individual card icon tinting)',
    targetId: 'play-card-2b-2-tuner',
    tag: 'L0–L2 · Parameters',
  },
  { code: '2B.3', componentName: 'Layer2PlayRecipeLivePreview', label: 'L2 Play menu 2×3 Full panel real-time preview (and 7A Sandbox 100% real-time sync)',
    targetId: 'play-card-2b-3-panel', tag: 'L6/L7 · Live Panel' },
  {
    code: '2B.4',
    componentName: 'PlayModeCardTriadMatrix',
    label: 'Three styles complete 2×3 Menu panel side-by-side matrix (Full Panel 3-Way Shootout)',
    targetId: 'play-card-2b-4-matrix',
    tag: 'Shootout Matrix',
  },
];

const VARIANT_META: {
  id: PlayCardStyleVariant;
  code: string;
  title: string;
  formula: string;
  desc: string;
}[] = [
  {
    id: 'icon-badge-top',
    code: 'Style 1',
    title: 'style 1 · Classic Four-part Layout (left Icon + Right Badge → Title → Desc)',
    formula: 'Row 1: [Icon | Badge] → Row 2: Title → Row 3: Description',
    desc: 'Four-part Structure: First row left framed placement/Borderless Icon, Place capsule on right Badge; Below Is Title, Multiline at bottom Description. ',
  },
  {
    id: 'icon-title-inline',
    code: 'Style 2',
    title: 'style 2 · Compact inline none Badge Style (left Icon + Right Title → Desc)',
    formula: 'Row 1: [Icon + Title] (No Badge) → Row 2: Description',
    desc: 'Removed top-right corner Badge Visual noise: Left side of first row Icon, Immediately to the right (Or justified) Title, Display directly below Description, Vertically more compact and clean. ',
  },
  {
    id: 'mono-giant-watermark',
    code: 'Style 3',
    title: 'Style 3 (Current default) · JetBrains Mono Large heading + 30% extra large background Icon',
    formula: 'FG: JetBrains Mono Giant Title + BG: 30% Opacity Oversized Icon',
    desc: 'Industrial telemetry aesthetic: Use large font for foreground JetBrains Mono Heading text (support Thin ~ Extra Bold All 8 Official font weight) , Default background overlay 30% Large-scale opacity vector Icon watermark. ',
  },
];

export const PlayCardPage: React.FC<PlayCardPageProps> = ({
  isLight = true,
  onNavigateToSandboxPlay,
}) => {
  const store = usePlayCardStyleStore();
  const {
    variant,
    setVariant,
    setParam,
    setCardIconColor,
    applyPreset,
    resetParams,
    exportConfigCode,
  } = store;

  const [specimenId, setSpecimenId] = useState<string>('exhibition');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeBlock, setShowCodeBlock] = useState(false);

  const specimenMode =
    PLAY_MODES.find((m) => m.id === specimenId) || PLAY_MODES[0];

  const handleCopyCode = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl">
      {/* Top Hero & Layer Location Notice */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>L2 Layout & Shells · Decoupled PlayModeCard Preview & Tuner</span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">2B · PlayCard Mode card three-style preview and parameter tuning workbench</h1>
              <Badge variant="primary" size="sm" isLight={isLight}>
                L2 Native decoupling · real-time sync 7A Play menu
              </Badge>
            </div>
            <p className={`text-xs leading-relaxed max-w-3xl ${ isLight ? 'text-neutral-600' : 'text-neutral-400' }`}>
              Designed for <strong>L2 Play menu (`Layer2PlayRecipe`)</strong> Decoupled zero-coupling independent card component{' '}
              <code className="font-mono">PlayModeCard</code> (Located at pyramid{' '}
              <strong>L2. Layout &amp; Shells Hierarchy</strong>) . 
              Supports one-click switching between three visual structures, JetBrains Mono Official 8 Font weight selection, Each card Icon Independent color adjustment (Host Match Default gray) , All parameters synced to{' '}
              <strong>7A · Menu Layer full-link sandbox</strong> of <code className="font-mono">Play</code> In menu. 
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {onNavigateToSandboxPlay && (
              <Button
                size="sm"
                variant="primary"
                isLight={isLight}
                icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                onClick={onNavigateToSandboxPlay}
              >
                Go to 7A View in sandbox Play menu
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={<Code2 className="h-3.5 w-3.5" />}
              onClick={() => setShowCodeBlock((prev) => !prev)}
            >
              {showCodeBlock ? 'hide config code' : 'view config code'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isLight={isLight}
              icon={copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={handleCopyCode}
            >
              {copiedCode ? 'Parameters copied!' : 'Copy parameter config'}
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

        {showCodeBlock && (
          <CodeBlock isLight={isLight}
            title="current PlayModeCard Export full parameter config (Includes independent per-card Icon color · Directly embeddable to src/tokens/playCardStyleStore.ts)"
            code={exportConfigCode()} />
        )}

        <PageJumpDirectory title="2B · Play Menu card three-style page quick-jump directory (PlayModeCard Jump Index)"
          subtitle="Click items to quickly locate the three-style card comparison, Parameter tuning workbench, 2×3 Real-time panel or three-style full-size comparison matrix" items={PLAY_CARD_JUMP_ITEMS} isLight={isLight} />
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
          Section 1 (2B.1): Single Card 3-Style Side-by-Side Inspector + Presets
         ────────────────────────────────────────────────────────────────────── */}
      <section id="play-card-2b-1-single" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
        isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-amber-500/15 text-amber-500 border border-amber-500/30">
              2B.1
            </span>
            <h2 className="text-base font-bold">Side-by-side comparison of three card styles with one-click activation (Single Card 3-Style Inspector)</h2>
          </div>

          {/* Specimen Mode Picker */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-neutral-400 mr-1">Inspect sample card:</span>
            {PLAY_MODES.map((m) => {
              const active = m.id === specimenId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSpecimenId(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {m.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Side-by-Side Single Card Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          {VARIANT_META.map((v) => {
            const isSelected = variant === v.id;
            return (
              <div key={v.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all ${ isSelected
                ? isLight ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/25'
                : 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30' : isLight
                ? 'bg-neutral-50/60 border-neutral-200/80' : 'bg-neutral-950/60 border-neutral-800' }`}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      {v.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVariant(v.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : isLight
                          ? 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active style</span>
                        </>
                      ) : (
                        <span>Set as current style</span>
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-xs mt-1">{v.title}</h3>
                  <code className={`text-[10px] font-mono px-2 py-1 rounded border ${ isLight
                    ? 'bg-white border-neutral-200 text-neutral-600'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400' }`}>
                    {v.formula}
                  </code>
                  <p className={`text-[11px] leading-relaxed ${ isLight ? 'text-neutral-600' : 'text-neutral-400' }`}>
                    {v.desc}
                  </p>
                </div>

                {/* Live Rendered Specimen Card */}
                <div className={`p-4 rounded-xl border flex items-center justify-center ${ isLight
                  ? 'bg-neutral-100/80 border-neutral-200/80' : 'bg-neutral-900/90 border-neutral-800' }`}>
                  <div className="w-full max-w-[240px]">
                    <PlayModeCard
                      id={specimenMode.id}
                      title={specimenMode.title}
                      subtitle={specimenMode.subtitle}
                      badge={specimenMode.badge}
                      badgeVariant={specimenMode.category === 'Match' ? 'primary' : 'warning'}
                      icon={specimenMode.icon}
                      isLight={isLight}
                      variant={v.id}
                      styleParams={store}
                      onClick={() => setVariant(v.id)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Curated Quick Presets Bar */}
        <div className={`p-3.5 rounded-xl border flex flex-col gap-2.5 ${ isLight
          ? 'bg-neutral-50/80 border-neutral-200/80' : 'bg-neutral-950/60 border-neutral-800' }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-500" />
              <span>6 One-click load for selected preset group (Curated Style Presets)</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">Click any preset to view below 2B.2 Continue fine-tuning any slider</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {PLAY_CARD_STYLE_PRESETS.map((preset) => (
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
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          Section 2 (2B.2): Comprehensive Parameter Tuner
         ────────────────────────────────────────────────────────────────────── */}
      <section id="play-card-2b-2-tuner" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-6 ${
        isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              2B.2
            </span>
            <Sliders className="h-4 w-4 text-amber-500" />
            <h2 className="text-base font-bold">Full-parameter fine-tuning workbench (All-In Parameter Inspector)</h2>
          </div>

          <div className="flex items-center gap-1.5">
            {(['icon-badge-top', 'icon-title-inline', 'mono-giant-watermark'] as const).map(
              (v, idx) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                    variant === v
                      ? 'bg-amber-500 text-white border-amber-500'
                      : isLight
                      ? 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  Style {idx + 1}: {v}
                </button>
              )
            )}
          </div>
        </div>

        {/* Group A: Shared Card Container Geometry */}
        <div className={`p-4 rounded-xl border flex flex-col gap-3.5 ${ isLight
          ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800' }`}>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
            <Box className="h-4 w-4" />
            <span>A. Card container geometry and grid spacing (Card Container &amp; Grid Geometry)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SliderControl label="Card horizontal padding (padX)" value={store.cardPaddingXPx} min={6} max={32} step={1} unit="px"
              editable allowOutOfBoundsInput colorScheme="amber" onChange={(v) => setParam('cardPaddingXPx', v)}
              isLight={isLight} />
            <SliderControl label="Card vertical padding (padY)" value={store.cardPaddingYPx} min={6} max={32} step={1} unit="px"
              editable allowOutOfBoundsInput colorScheme="amber" onChange={(v) => setParam('cardPaddingYPx', v)}
              isLight={isLight} />
            <SliderControl label="Card minimum height (minH)" value={store.cardMinHeightPx} min={64} max={200} step={2}
              unit="px" editable allowOutOfBoundsInput colorScheme="amber"
              onChange={(v) => setParam('cardMinHeightPx', v)} isLight={isLight} />
            <SliderControl label="Card border radius (radius)" value={store.cardRadiusPx} min={0} max={28} step={1} unit="px"
              editable allowOutOfBoundsInput colorScheme="sky" onChange={(v) => setParam('cardRadiusPx', v)}
              isLight={isLight} />
            <SliderControl label="2×3 Grid spacing (gridGap)" value={store.gridGapPx} min={4} max={28} step={1} unit="px"
              editable allowOutOfBoundsInput colorScheme="emerald" onChange={(v) => setParam('gridGapPx', v)}
              isLight={isLight} />
          </div>
        </div>

        {/* Group B: Per-Option Independent Icon Colors */}
        <div className={`p-4 rounded-xl border flex flex-col gap-3.5 ${ isLight
          ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800' }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <Palette className="h-4 w-4" />
              <span>B. 6 Options are independent Icon Color configuration (Per-Card Independent Icon Color · Host Match Default gray)</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">For each option Icon Color can be adjusted individually, Applies to all three card styles and exports with the configuration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLAY_MODES.map((mode) => {
              const cardId = mode.id as PlayModeCardId;
              const currentColor = store.cardIconColors?.[cardId] || 'amber';
              const isCustom = isCustomPlayCardColor(currentColor);
              const resolvedHex = resolvePlayCardIconHex(currentColor, isLight);
              const rgb = hexToRgbTuple(resolvedHex);
              const presetLabel = PLAY_CARD_ICON_COLOR_OPTIONS.find(
                (c) => c.id === currentColor
              )?.label;

              return (
                <div key={mode.id} className={`p-3 rounded-xl border flex flex-col gap-2.5 ${ isLight
                  ? 'bg-white border-neutral-200/90' : 'bg-neutral-900 border-neutral-800' }`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono">{mode.title}</span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {presetLabel || `Custom RGB (${rgb.r}, ${rgb.g}, ${rgb.b})`}
                    </span>
                  </div>

                  {/* Preset Color Swatches */}
                  <div className="flex flex-wrap items-center gap-1">
                    {PLAY_CARD_ICON_COLOR_OPTIONS.map((opt) => {
                      const isSelected = currentColor === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCardIconColor(cardId, opt.id)}
                          title={opt.label}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                            isSelected
                              ? isLight
                                ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-2xs'
                                : 'bg-white text-neutral-950 border-white font-bold shadow-2xs'
                              : isLight
                              ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                              : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/80 text-neutral-300'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full shrink-0 ${opt.dotClass}`} />
                          <span>{opt.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom RGB / Color Picker Row */}
                  <div className={`pt-2 border-t flex items-center justify-between gap-1.5 text-[10px] font-mono ${
                    isLight ? 'border-neutral-100' : 'border-neutral-800/80' }`}>
                    <label
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer transition-all shrink-0 ${
                      isCustom ? isLight ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                      : 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold' : isLight
                      ? 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                      : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700 text-neutral-300' }`}
                      title="Click to open color picker (Custom RGB Picker)">
                      <input type="color" value={resolvedHex}
                        onChange={(e) => setCardIconColor(cardId, e.target.value)}
                        className="h-3.5 w-3.5 rounded border-0 p-0 bg-transparent cursor-pointer" />
                      <span>Custom RGB</span>
                    </label>

                    <div className="flex items-center gap-1">
                      {(['r', 'g', 'b'] as const).map((ch) => (
                        <label key={ch} className="flex items-center gap-0.5" title={`${ch.toUpperCase()} (0-255)`}>
                          <span className="text-neutral-400 uppercase">{ch}</span>
                          <input type="number" min={0} max={255} value={rgb[ch]} onChange={(e) => {
                            const nextVal = Number(e.target.value); const nextRgb = { ...rgb, [ch]: nextVal };
                            setCardIconColor( cardId, rgbTupleToHex(nextRgb.r, nextRgb.g, nextRgb.b) ); }}
                            className={`w-10 px-1 py-0.5 rounded border text-center text-[10px] font-mono outline-none ${
                            isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800 focus:border-amber-500'
                            : 'bg-neutral-950 border-neutral-700 text-neutral-200 focus:border-amber-500' }`} />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <PlayCardTunerGroupsCD isLight={isLight} />
      </section>

      <PlayCardLivePreviewAndMatrix
        isLight={isLight}
        variant={variant}
        setVariant={setVariant}
        variantMeta={VARIANT_META}
        onNavigateToSandboxPlay={onNavigateToSandboxPlay}
      />
    </div>
  );
};
