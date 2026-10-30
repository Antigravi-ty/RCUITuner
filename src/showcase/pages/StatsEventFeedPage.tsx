import React from 'react';
import { Activity, Sparkles, Play, Layers, Sliders, Plus, } from 'lucide-react';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { Badge } from '../../ui-core/primitives/Badge';
import { PackagedSvgIcon, PackagedSvgId, PACKAGED_SVG_CATALOG, } from '../../ui-core/primitives/packagedSvgIcons';
import {
  StatsEventSvgPackagerSection, ACCENT_SWATCHES, STAT_EVENT_PRESETS, type StatPresetDefinition,
} from './stats-event-feed/StatsEventSvgPackagerSection';
import { HudAnchorStage, HudZone } from '../../ui-core/layout/HudAnchorStage';
import { ArenaBackdrop } from '../ArenaBackdrop';
import { StepperScoreboardHUD } from '../../ui-core/hud/StepperScoreboardHUD';
import {
  StatsEventFeedHUD, StatsEventFeedItem, StatsEventLayoutVariant, StatsEventCapsuleStyle,
} from '../../ui-core/hud/StatsEventFeedHUD';

const useState = createScopedSyncedState('hud-5f-stats-event-page');

export const StatsEventFeedPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  // Active preset & custom overrides
  const [selectedPresetId, setSelectedPresetId] = useState<string>('crossbar-outline');
  const [customIconName, setCustomIconName] = useState<PackagedSvgId>('crossbar-outline');
  const [kickerText, setKickerText] = useState<string>('ZEN_MASTER_RL · SHOT TELEMETRY');
  const [titleText, setTitleText] = useState<string>('CROSSBAR PING');
  const [capsuleText, setCapsuleText] = useState<string>('118 KM/H');
  const [footnoteText, setFootnoteText] = useState<string>(
    'UPPER 90 IRON DEFLECTION · 0.42M FROM GOAL LINE'
  );
  const [footnoteTag, setFootnoteTag] = useState<string>('+15 PTS');
  const [accentColor, setAccentColor] = useState<string>('#F59E0B');

  // Structure & Style toggles
  const [showIcon, setShowIcon] = useState<boolean>(true);
  const [showIconBox, setShowIconBox] = useState<boolean>(true);
  const [iconSizePx, setIconSizePx] = useState<number>(28);
  const [showKicker, setShowKicker] = useState<boolean>(true);
  const [showCapsule, setShowCapsule] = useState<boolean>(true);
  const [capsuleStyle, setCapsuleStyle] = useState<StatsEventCapsuleStyle>('tinted');
  const [showFootnote, setShowFootnote] = useState<boolean>(true);
  const [layoutVariant, setLayoutVariant] = useState<StatsEventLayoutVariant>('card');
  const [glowBlurPx, setGlowBlurPx] = useState<number>(8);
  const [glowIntensityPct, setGlowIntensityPct] = useState<number>(85);
  const [titleFontSizePx, setTitleFontSizePx] = useState<number>(15);
  const [hudLightMode, setHudLightMode] = useState<boolean>(false);
  const [backdropBright, setBackdropBright] = useState<number>(36);

  // Stacked Feed Queue Mode vs Single Stat Mode
  const [feedMode, setFeedMode] = useState<'single' | 'stacked'>('single');
  const [stackedIds, setStackedIds] = useState<string[]>([
    'crossbar-outline',
    'bounce-solid',
    'high-five',
  ]);
  const [triggerKey, setTriggerKey] = useState<number>(1);
  const [autoLifecycle, setAutoLifecycle] = useState<boolean>(false);

  // Packaged SVG Variation Toggles (shared across Stage & Section 5F-3 Preview Configurator)
  const [highFiveShowSparks, setHighFiveShowSparks] = useState<boolean>(true);
  const [highFiveFillLeft, setHighFiveFillLeft] = useState<boolean>(false);
  const [highFiveFillRight, setHighFiveFillRight] = useState<boolean>(false);

  const [strategyTopLeftCircle, setStrategyTopLeftCircle] = useState<boolean>(false);
  const [strategyBottomRightCircle, setStrategyBottomRightCircle] = useState<boolean>(false);

  const [bounceSolidLine, setBounceSolidLine] = useState<boolean>(true);
  const [tacticsSquareMode, setTacticsSquareMode] = useState<boolean>(true);
  const [crossbarSolidMode, setCrossbarSolidMode] = useState<boolean>(false);
  const [bombStrokeWidth, setBombStrokeWidth] = useState<number>(1.9);

  // Preview Configurator global style controls
  const [previewSizePx, setPreviewSizePx] = useState<number>(48);
  const [previewColor, setPreviewColor] = useState<string>('#F59E0B');
  const [previewGlowBlur, setPreviewGlowBlur] = useState<number>(8);
  const [previewGlowIntensity, setPreviewGlowIntensity] = useState<number>(80);

  const handleSelectPreset = (preset: StatPresetDefinition) => {
    setSelectedPresetId(preset.id);
    setCustomIconName(preset.iconName as PackagedSvgId);
    setKickerText(preset.kickerText ?? '');
    setTitleText(preset.titleText);
    setCapsuleText(preset.capsuleText ?? '');
    setFootnoteText(preset.footnoteText ?? '');
    setFootnoteTag(preset.footnoteTag ?? '');
    setAccentColor(preset.accentColor ?? '#F59E0B');
    setPreviewColor(preset.accentColor ?? '#F59E0B');
    setTriggerKey((k) => k + 1);
  };

  const handlePushToFeed = (presetId: string) => {
    setFeedMode('stacked');
    setStackedIds((prev) => {
      const next = [presetId, ...prev.filter((id) => id !== presetId)].slice(0, 3);
      return next;
    });
    setTriggerKey((k) => k + 1);
  };

  const activeSingleItem: StatsEventFeedItem = {
    id: selectedPresetId,
    iconName: customIconName,
    kickerText,
    titleText,
    capsuleText,
    footnoteText,
    footnoteTag,
    accentColor,
    svgVariations: {
      highFiveShowSparks,
      highFiveFillLeftHand: highFiveFillLeft,
      highFiveFillRightHand: highFiveFillRight,
      strategyTopLeftCircle,
      strategyBottomRightCircle,
      bombStrokeWidth,
    },
  };

  const stackedFeedItems: StatsEventFeedItem[] = stackedIds.map((id) => {
    const found = STAT_EVENT_PRESETS.find((p) => p.id === id) ?? STAT_EVENT_PRESETS[0];
    return {
      ...found,
      svgVariations: {
        highFiveShowSparks,
        highFiveFillLeftHand: highFiveFillLeft,
        highFiveFillRightHand: highFiveFillRight,
        strategyTopLeftCircle,
        strategyBottomRightCircle,
        bombStrokeWidth,
      },
    };
  });

  // Compute High-Five 3-bit code (0..7)
  const highFiveBitCode =
    (highFiveShowSparks ? 4 : 0) + (highFiveFillLeft ? 2 : 0) + (highFiveFillRight ? 1 : 0);

  // Compute Strategy 2-bit code (0..3)
  const strategyBitCode = (strategyTopLeftCircle ? 2 : 0) + (strategyBottomRightCircle ? 1 : 0);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Page Title & 5E vs 5F Distinction Banner */}
      <div className="flex flex-col gap-3 border-b pb-5 border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-500 font-mono font-extrabold text-xs border border-amber-500/30">
              5F · Five Foxtrot
            </span>
            <h1 className="text-xl font-extrabold tracking-tight">
              Center-Upper Stats Event / Status Feed · Statistical event stream and packaging SVG Variant system
            </h1>
            <Badge variant="amber" size="sm" isLight={isLight}>
              Icon + Text + Capsule + Footnote
            </Badge>
            <Badge variant="primary" size="sm" isLight={isLight}>
              Decoupled Packaged SVGs (`packagedSvgIcons.tsx`)
            </Badge>
          </div>
        </div>

        <p className="text-xs opacity-80 leading-relaxed max-w-4xl">
          Different from <strong>5E · Center-Upper Signal Event (Global match status signal banner)</strong>, This module{' '}
          <strong>5F · Five Foxtrot (`StatsEventFeedHUD`)</strong> Designed for upper-mid area (`anchor=&quot;upper-center&quot;`) of{' '}
          <strong>Stats Event / Status Feed (Technical stats and status feedback flow)</strong> Design: Native support{' '}
          <strong>icon (Icon) + text (Kicker & Title) + capsule (Capsule/Pill) + Footnote (Footnote)</strong> Quaternary decoupled structure, Built-in custom non- Lucide Vector SVG Independent packaging and multi-dimensional variant switch. 
        </p>
      </div>

      {/* =====================================================================
          SECTION 5F-1: LIVE CENTER-UPPER STATS EVENT / STATUS FEED STAGE
         ===================================================================== */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-xs font-mono">
              5F.1
            </div>
            <h2 className="text-sm font-bold tracking-tight">
              Center-Upper (`anchor=&quot;upper-center&quot;`) Live stage · Single card view and multiple Status Feed Stacked Flow
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <button
              type="button"
              onClick={() => setFeedMode('single')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                feedMode === 'single'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40 opacity-80'
              }`}
            >
              Single-item fine-tuning mode (Single Stat)
            </button>
            <button
              type="button"
              onClick={() => setFeedMode('stacked')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                feedMode === 'stacked'
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'border border-neutral-400/40 opacity-80'
              }`}
            >
              Status Feed Stacked Flow ({stackedIds.length} Bar)
            </button>
            <button
              type="button"
              onClick={() => setTriggerKey((k) => k + 1)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 font-bold cursor-pointer flex items-center gap-1 hover:bg-emerald-500/25"
            >
              <Play className="h-3 w-3" />
              <span>Replay entrance animation</span>
            </button>
            <button
              type="button"
              onClick={() => setHudLightMode((v) => !v)}
              className="px-2.5 py-1 rounded-lg border border-neutral-400/40 cursor-pointer"
            >
              HUD Card: {hudLightMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Preset Selector Bar */}
        <div className={`p-3 rounded-2xl border flex flex-col gap-2.5 ${ isLight
          ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-900/70 border-neutral-800' }`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Preset Stats Event Selector (Click to switch current card, Click right `+` Push Status Feed Stacked Flow):</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {STAT_EVENT_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 shadow-xs'
                      : isLight
                      ? 'bg-white hover:bg-neutral-100 border-neutral-200/90'
                      : 'bg-neutral-950/80 hover:bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border" style={{
                      backgroundColor: `${preset.accentColor}18`, borderColor: `${preset.accentColor}45`, }}>
                      <PackagedSvgIcon icon={preset.iconName as PackagedSvgId} size={22} color={preset.accentColor}
                        glowColor={preset.accentColor} glowBlurPx={4} glowIntensityPct={70}
                        strokeWidth={bombStrokeWidth} highFiveOptions={{ showSparks: highFiveShowSparks,
                        fillLeftHand: highFiveFillLeft, fillRightHand: highFiveFillRight, }} strategyOptions={{
                        topLeftCircle: strategyTopLeftCircle, bottomRightCircle: strategyBottomRightCircle, }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-mono font-bold truncate">{preset.badgeLabel}</span>
                      <span className="text-[10px] opacity-70 truncate">{preset.titleText}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePushToFeed(preset.id);
                    }}
                    title="Push Status Feed Stacked queue"
                    className="p-1.5 rounded-lg border border-neutral-400/30 hover:bg-amber-500 hover:text-black hover:border-amber-500 cursor-pointer shrink-0 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 16:9 Live HUD Stage */}
        <div className="relative w-full h-[380px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl bg-black">
          <ArenaBackdrop
            preset={backdropBright > 55 ? 'daylight' : 'night'}
            brightness={backdropBright}
          />

          <HudAnchorStage>
            {/* Top-Center: 5A Scorebug Landmark */}
            <HudZone anchor="top-center" flush zIndexClassName="z-30">
              <StepperScoreboardHUD isLight={hudLightMode} leftScore={3} rightScore={2} seconds={118} bestOf={5}
                leftSeriesWins={2} rightSeriesWins={1} />
            </HudZone>

            {/* Upper-Center: 5F Stats Event / Status Feed */}
            <HudZone anchor="upper-center" zIndexClassName="z-40">
              <div className="mt-4">
                <StatsEventFeedHUD item={activeSingleItem}
                  feedItems={feedMode === 'stacked' ? stackedFeedItems : undefined} showIcon={showIcon}
                  showIconBox={showIconBox} iconSizePx={iconSizePx} showKicker={showKicker}
                  showCapsule={showCapsule} capsuleStyle={capsuleStyle} showFootnote={showFootnote}
                  layoutVariant={layoutVariant} glowBlurPx={glowBlurPx} glowIntensityPct={glowIntensityPct}
                  titleFontSizePx={titleFontSizePx} triggerKey={triggerKey} autoLifecycle={autoLifecycle}
                  isLight={hudLightMode} />
              </div>
            </HudZone>
          </HudAnchorStage>
        </div>
      </section>

      {/* =====================================================================
          SECTION 5F-2: FOUR-PART ANATOMY CONFIGURATOR (ICON / TEXT / CAPSULE / FOOTNOTE)
         ===================================================================== */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold text-xs font-mono">
            5F.2
          </div>
          <h2 className="text-sm font-bold tracking-tight">
            Quaternary structure tuning desk · icon (Icon) · text (Text) · capsule (Capsule) · Footnote (Footnote)
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: Icon & Layout Variant */}
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 text-xs font-mono ${ isLight
            ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-900/70 border-neutral-800' }`}>
            <span className="font-bold text-sky-500 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>1. icon (Icon) & Container shape (`layoutVariant`)</span>
            </span>

            <div className="flex items-center justify-between gap-2">
              <span className="opacity-75">Container shape:</span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: 'card', label: 'Standard card' },
                    { key: 'compact-pill', label: 'Compact pill' },
                    { key: 'minimal-hud', label: 'Floating no-fill' },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setLayoutVariant(v.key)}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                      layoutVariant === v.key
                        ? 'bg-sky-500 text-neutral-950 font-bold'
                        : 'border border-neutral-400/40 opacity-80'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="opacity-75">Package SVG icon:</span>
              <select
                value={customIconName}
                onChange={(e) => setCustomIconName(e.target.value as PackagedSvgId)}
                className="px-2 py-1 rounded-lg border border-neutral-400/40 bg-transparent text-xs font-mono"
              >
                {PACKAGED_SVG_CATALOG.map((item) => (
                  <option key={item.id} value={item.id} className="bg-neutral-900 text-white">
                    {item.title} ({item.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showIcon} onChange={(e) => setShowIcon(e.target.checked)}
                  className="accent-sky-500" />
                <span>Show icon (`showIcon`)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showIconBox} onChange={(e) => setShowIconBox(e.target.checked)}
                  className="accent-sky-500" />
                <span>Icon border (`showIconBox`)</span>
              </label>
            </div>

            <label className="flex items-center justify-between gap-2">
              <span className="opacity-75">icon size (`iconSizePx`):</span>
              <div className="flex items-center gap-2">
                <input type="range" min={16} max={44} value={iconSizePx}
                  onChange={(e) => setIconSizePx(Number(e.target.value))} className="w-28 accent-sky-500" />
                <span className="w-9 text-right font-bold">{iconSizePx}px</span>
              </div>
            </label>

            <label className="flex items-center justify-between gap-2">
              <span className="opacity-75">Glow radius (`glowBlurPx`):</span>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={20} value={glowBlurPx}
                  onChange={(e) => setGlowBlurPx(Number(e.target.value))} className="w-28 accent-sky-500" />
                <span className="w-9 text-right font-bold">{glowBlurPx}px</span>
              </div>
            </label>

            <div className="flex items-center justify-between gap-2">
              <span className="opacity-75">Theme color (`accentColor`):</span>
              <div className="flex items-center gap-1.5">
                {ACCENT_SWATCHES.map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => setAccentColor(sw.hex)}
                    className={`w-4 h-4 rounded-full cursor-pointer border transition-transform ${
                      accentColor.toUpperCase() === sw.hex
                        ? 'scale-125 border-white ring-2 ring-sky-500'
                        : 'border-black/30 opacity-80'
                    }`}
                    style={{ backgroundColor: sw.hex }}
                    title={sw.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Text (Kicker + Title) & Capsule (Pill) */}
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 text-xs font-mono ${ isLight
            ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-900/70 border-neutral-800' }`}>
            <span className="font-bold text-amber-500 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" />
              <span>2. text (Text) & capsule (Capsule / Pill)</span>
            </span>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showKicker} onChange={(e) => setShowKicker(e.target.checked)}
                  className="accent-amber-500" />
                <span>Superscript intro (`showKicker`)</span>
              </label>
              <input type="text" value={kickerText} onChange={(e) => setKickerText(e.target.value)}
                className="px-2 py-1 rounded border border-neutral-400/40 bg-transparent text-[11px] w-44" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="opacity-75">Main text (`titleText`):</span>
              <input type="text" value={titleText} onChange={(e) => setTitleText(e.target.value)}
                className="px-2 py-1 rounded border border-neutral-400/40 bg-transparent text-[11px] font-bold w-44" />
            </div>

            <label className="flex items-center justify-between gap-2">
              <span className="opacity-75">Base font size (`titleFontSizePx`):</span>
              <div className="flex items-center gap-2">
                <input type="range" min={12} max={22} value={titleFontSizePx}
                  onChange={(e) => setTitleFontSizePx(Number(e.target.value))} className="w-28 accent-amber-500" />
                <span className="w-9 text-right font-bold">{titleFontSizePx}px</span>
              </div>
            </label>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showCapsule} onChange={(e) => setShowCapsule(e.target.checked)}
                  className="accent-amber-500" />
                <span>Right pill (`showCapsule`)</span>
              </label>
              <input type="text" value={capsuleText} onChange={(e) => setCapsuleText(e.target.value)}
                className="px-2 py-1 rounded border border-neutral-400/40 bg-transparent text-[11px] font-bold w-32" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="opacity-75">Pill style (`capsuleStyle`):</span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: 'tinted', label: 'Translucent tint' },
                    { key: 'solid', label: 'Solid highlight' },
                    { key: 'outline', label: 'Outlined frame' },
                  ] as const
                ).map((cs) => (
                  <button
                    key={cs.key}
                    type="button"
                    onClick={() => setCapsuleStyle(cs.key)}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                      capsuleStyle === cs.key
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'border border-neutral-400/40 opacity-80'
                    }`}
                  >
                    {cs.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Footnote & Status Feed Queue Management */}
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 text-xs font-mono ${ isLight
            ? 'bg-neutral-50/90 border-neutral-200' : 'bg-neutral-900/70 border-neutral-800' }`}>
            <span className="font-bold text-emerald-500 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              <span>3. Footnote (Footnote) & Stage background/Cycle</span>
            </span>

            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showFootnote} onChange={(e) => setShowFootnote(e.target.checked)}
                  className="accent-emerald-500" />
                <span>Show footer (`showFootnote`)</span>
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <span className="opacity-75 text-[11px]">Footer body (`footnoteText`):</span>
              <input type="text" value={footnoteText} onChange={(e) => setFootnoteText(e.target.value)}
                className="px-2 py-1 rounded border border-neutral-400/40 bg-transparent text-[11px] w-full" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="opacity-75">Footer suffix (`footnoteTag`):</span>
              <input type="text" value={footnoteTag} onChange={(e) => setFootnoteTag(e.target.value)}
                className="px-2 py-1 rounded border border-neutral-400/40 bg-transparent text-[11px] font-bold w-36" />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={autoLifecycle} onChange={(e) => {
                  setAutoLifecycle(e.target.checked); setTriggerKey((k) => k + 1); }}
                  className="accent-emerald-500" />
                <span>Auto entrance/Hover/Exit disappear</span>
              </label>

              <label className="flex items-center gap-1.5">
                <span className="opacity-75">Field brightness:</span>
                <input type="range" min={15} max={85} value={backdropBright}
                  onChange={(e) => setBackdropBright(Number(e.target.value))} className="w-20 accent-emerald-500" />
              </label>
            </div>
          </div>
        </div>
      </section>

      <StatsEventSvgPackagerSection isLight={isLight} previewSizePx={previewSizePx}
        setPreviewSizePx={setPreviewSizePx} previewGlowBlur={previewGlowBlur}
        setPreviewGlowBlur={setPreviewGlowBlur} previewGlowIntensity={previewGlowIntensity}
        previewColor={previewColor} setPreviewColor={setPreviewColor} highFiveShowSparks={highFiveShowSparks}
        setHighFiveShowSparks={setHighFiveShowSparks} highFiveFillLeft={highFiveFillLeft}
        setHighFiveFillLeft={setHighFiveFillLeft} highFiveFillRight={highFiveFillRight}
        setHighFiveFillRight={setHighFiveFillRight} highFiveBitCode={highFiveBitCode}
        strategyTopLeftCircle={strategyTopLeftCircle} setStrategyTopLeftCircle={setStrategyTopLeftCircle}
        strategyBottomRightCircle={strategyBottomRightCircle}
        setStrategyBottomRightCircle={setStrategyBottomRightCircle} strategyBitCode={strategyBitCode}
        setBounceSolidLine={setBounceSolidLine} setTacticsSquareMode={setTacticsSquareMode}
        setCrossbarSolidMode={setCrossbarSolidMode} bombStrokeWidth={bombStrokeWidth}
        setBombStrokeWidth={setBombStrokeWidth} customIconName={customIconName}
        setCustomIconName={setCustomIconName} />
    </div>
  );
};

export default StatsEventFeedPage;
