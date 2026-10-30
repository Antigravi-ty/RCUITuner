import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Sparkles,
  Gamepad2,
  Volume2,
  Monitor,
  Terminal,
  Car,
  Palette,
  Music,
  CloudSync,
} from 'lucide-react';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { Badge } from '../../../ui-core/primitives/Badge';
import { Button } from '../../../ui-core/primitives/Button';
import { UnderlineTabs, TabItem } from '../../../ui-core/primitives/UnderlineTabs';
import { CodeBlock } from '../../CodeBlock';
import { useUnderlineTabsStore, type UnderlineTabsFontFamily, type UnderlineTabsFontWeight } from '../../../ui-core/stores/underlineTabsStore';

export interface UnderlineTabsTunerProps {
  isLight?: boolean;
  title?: string;
  codeBadge?: string;
  /** Whether to render the standalone Settings & Garage dual-bar live preview inside the tuner card */
  showStandalonePreview?: boolean;
}

const FONT_WEIGHT_OPTIONS: { value: UnderlineTabsFontWeight; label: string }[] = [
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'SemiBold (600)' },
  { value: '700', label: 'Bold (700)' },
];

/**
 * [Decoupled Tuner] UnderlineTabsTuner (L1.1)
 * Standalone visual inspector for `UnderlineTabs` (used by Settings 4/5-Tab bar, Garage 5-Tab bar, and Dev floating windows).
 * Syncs across L1.1 (`TabsPage` `#l1-underline-tabs`), L6 (`RecipesPage`), and L7 (`7A Menu Layer Sandbox`).
 */
export const UnderlineTabsTuner: React.FC<UnderlineTabsTunerProps> = React.memo(({
  isLight = false,
  title = 'L1.1 · UnderlineTabs Sliding underline tab bar tuner (font size · icon size · spacing · Font Family · Font Weight)',
  codeBadge = '6A.4T',
  showStandalonePreview = false,
}) => {
  const {
    fontSize,
    iconSize,
    iconGap,
    paddingX,
    paddingY,
    indicatorHeight,
    showIcons,
    fullWidth,
    fontFamily,
    activeFontWeight,
    inactiveFontWeight,
    setToken,
    updateTokens,
    resetTokens,
    exportConfigCode,
  } = useUnderlineTabsStore();

  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [previewSettingsTab, setPreviewSettingsTab] = useState('gameplay');
  const [previewGarageTab, setPreviewGarageTab] = useState('car');

  const handleCopy = async () => {
    const code = exportConfigCode();
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyPreset = (
    preset: 'standard-balanced' | 'large-18px-match' | 'compact-dense' | 'text-only'
  ) => {
    if (preset === 'standard-balanced') {
      updateTokens({
        fontSize: 14,
        iconSize: 16,
        iconGap: 7,
        paddingX: 12,
        paddingY: 8,
        indicatorHeight: 2,
        showIcons: true,
        fullWidth: true,
        fontFamily: 'sans',
        activeFontWeight: '600',
        inactiveFontWeight: '500',
      });
    } else if (preset === 'large-18px-match') {
      updateTokens({
        fontSize: 16,
        iconSize: 20,
        iconGap: 9,
        paddingX: 12,
        paddingY: 9,
        indicatorHeight: 2,
        showIcons: true,
        fullWidth: true,
        fontFamily: 'sans',
        activeFontWeight: '600',
        inactiveFontWeight: '500',
      });
    } else if (preset === 'compact-dense') {
      updateTokens({
        fontSize: 12,
        iconSize: 14,
        iconGap: 6,
        paddingX: 10,
        paddingY: 6,
        indicatorHeight: 2,
        showIcons: true,
        fullWidth: true,
        fontFamily: 'sans',
        activeFontWeight: '600',
        inactiveFontWeight: '500',
      });
    } else if (preset === 'text-only') {
      updateTokens({
        fontSize: 15,
        iconSize: 16,
        iconGap: 6,
        paddingX: 12,
        paddingY: 8,
        indicatorHeight: 2,
        showIcons: false,
        fullWidth: true,
      });
    }
  };

  const settingsDemoTabs: TabItem[] = [
    { id: 'gameplay', label: 'Gameplay', icon: <Gamepad2 className="h-4 w-4" /> },
    { id: 'audio', label: 'Audio', icon: <Volume2 className="h-4 w-4" /> },
    { id: 'display', label: 'Display', icon: <Monitor className="h-4 w-4" /> },
    { id: 'advanced', label: 'Advanced', icon: <Sliders className="h-4 w-4" /> },
    { id: 'developer', label: 'Developer', icon: <Terminal className="h-4 w-4" /> },
  ];

  const garageDemoTabs: TabItem[] = [
    { id: 'car', label: 'Car', icon: <Car className="h-4 w-4" /> },
    { id: 'colour', label: 'Paint', icon: <Palette className="h-4 w-4" /> },
    { id: 'materials', label: 'Loadout', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'anthem', label: 'Anthem', icon: <Music className="h-4 w-4" /> },
    { id: 'sync', label: 'Sync', icon: <CloudSync className="h-4 w-4" /> },
  ];

  return (
    <div
      id="underline-tabs-tuner"
      className={`scroll-mt-6 p-5 md:p-6 rounded-2xl border flex flex-col gap-5 w-full transition-colors ${
        isLight
          ? 'bg-white border-neutral-200/90 shadow-2xs'
          : 'bg-neutral-900/70 border-neutral-800'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/70 dark:border-neutral-800">
        <div className="flex items-center gap-2 flex-wrap">
          {codeBadge && (
            <span className="px-2 h-6 rounded-md bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold font-mono text-xs shrink-0">
              {codeBadge}
            </span>
          )}
          <Sliders className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold">{title}</span>
          <Badge variant="amber" size="sm" isLight={isLight}>
            L1.1 ⇄ L6 ⇄ L7 Real-time Sync
          </Badge>
          <span
            className={`text-[11px] font-mono ${
              isLight ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            Font {fontSize}px ({fontFamily === 'mono' ? 'JetBrains Mono' : 'Inter Sans'} · {activeFontWeight}/{inactiveFontWeight}) · Icon {showIcons ? `${iconSize}px (gap ${iconGap}px)` : 'Hide'} · Pad {paddingX}×{paddingY}px · Line {indicatorHeight}px
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
            {copied ? 'Copied Tabs config!' : 'Copy Tabs config'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isLight={isLight}
            icon={<RotateCcw className="h-3 w-3" />}
            onClick={resetTokens}
          >
            reset to default
          </Button>
        </div>
      </div>

      {/* Quick Presets + Toggles + Font Family & Font Weight Switchers */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
          isLight
            ? 'bg-neutral-50/80 border-neutral-200/80'
            : 'bg-neutral-950/50 border-neutral-800/80'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-semibold">
              <Sparkles className="h-3 w-3 text-amber-500" /> One-click shape preset:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('standard-balanced')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                showIcons && fontSize === 14 && iconSize === 16
                  ? 'bg-amber-500 text-white border-amber-500'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              ① Standard Balanced (14px font size + 16px icon)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('large-18px-match')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                showIcons && fontSize >= 16 && iconSize >= 20
                  ? 'bg-amber-500 text-white border-amber-500'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              ② Match 18px Large Font Row (16px font size + 20px icon)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('compact-dense')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                showIcons && fontSize <= 12
                  ? 'bg-amber-500 text-white border-amber-500'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              ③ Compact High Density (12px font size + 14px icon)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('text-only')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                !showIcons
                  ? 'bg-amber-500 text-white border-amber-500'
                  : isLight
                  ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}
            >
              ④ Text Only (showIcons=false)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center gap-5 flex-wrap">
            <ToggleSwitch
              checked={showIcons}
              onCheckedChange={(v) => setToken('showIcons', v)}
              label="Show Left of Label SVG icon (showIcons)"
              variant="neutral"
              isLight={isLight}
            />
            <ToggleSwitch
              checked={fullWidth}
              onCheckedChange={(v) => setToken('fullWidth', v)}
              label="Full-width equidistant distribution (fullWidth)"
              variant="neutral"
              isLight={isLight}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Font Family Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-neutral-400">Font Family:</span>
              {(
                [
                  { id: 'sans', label: 'Inter Sans' },
                  { id: 'mono', label: 'JetBrains Mono' },
                ] as { id: UnderlineTabsFontFamily; label: string }[]
              ).map((f) => {
                const active = fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setToken('fontFamily', f.id)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                        : isLight
                        ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Active Font Weight Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-neutral-400">Active Font Weight:</span>
              {FONT_WEIGHT_OPTIONS.map((w) => {
                const active = activeFontWeight === w.value;
                return (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setToken('activeFontWeight', w.value)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border cursor-pointer transition-all ${
                      active
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                        : isLight
                        ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Non-Truncated Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SliderControl
          label="Label Font Size (fontSize)"
          value={fontSize}
          min={11}
          max={22}
          step={1}
          unit="px"
          editable={true}
          allowOutOfBoundsInput={true}
          colorScheme="amber"
          onChange={(v) => setToken('fontSize', v)}
          isLight={isLight}
        />
        <SliderControl
          label="Label SVG icon size (iconSize)"
          value={iconSize}
          min={12}
          max={32}
          step={1}
          unit="px"
          editable={true}
          allowOutOfBoundsInput={true}
          colorScheme="amber"
          onChange={(v) => setToken('iconSize', v)}
          isLight={isLight}
        />
        <SliderControl
          label="Icon and text spacing (iconGap)"
          value={iconGap}
          min={2}
          max={20}
          step={1}
          unit="px"
          editable={true}
          allowOutOfBoundsInput={true}
          colorScheme="amber"
          onChange={(v) => setToken('iconGap', v)}
          isLight={isLight}
        />
        <SliderControl
          label="Label Horizontal Padding (paddingX)"
          value={paddingX}
          min={0}
          max={32}
          step={1}
          unit="px"
          editable={true}
          allowOutOfBoundsInput={true}
          colorScheme="sky"
          onChange={(v) => setToken('paddingX', v)}
          isLight={isLight}
        />
        <SliderControl
          label="Label Vertical Padding (paddingY)"
          value={paddingY}
          min={0}
          max={24}
          step={1}
          unit="px"
          editable={true}
          allowOutOfBoundsInput={true}
          colorScheme="emerald"
          onChange={(v) => setToken('paddingY', v)}
          isLight={isLight}
        />
        <SliderControl
          label="Bottom underline thickness (indicatorHeight)"
          value={indicatorHeight}
          min={1}
          max={6}
          step={1}
          unit="px"
          editable={true}
          allowOutOfBoundsInput={true}
          colorScheme="amber"
          onChange={(v) => setToken('indicatorHeight', v)}
          isLight={isLight}
        />
      </div>

      {/* Standalone Dual Live Preview (Settings 5-Tab & Garage 5-Tab) */}
      {showStandalonePreview && (
        <div
          className={`p-4 rounded-xl border flex flex-col gap-4 ${
            isLight
              ? 'bg-neutral-100/60 border-neutral-200/80'
              : 'bg-neutral-950/70 border-neutral-800'
          }`}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-amber-500">
                live preview A · Settings Panel Header Label (Gameplay / Audio / Display / Advanced / Developer)
              </span>
              <span className="text-neutral-400">active: {previewSettingsTab}</span>
            </div>
            <UnderlineTabs
              items={settingsDemoTabs}
              activeId={previewSettingsTab}
              onChange={setPreviewSettingsTab}
              isLight={isLight}
            />
          </div>

          <div className="flex flex-col gap-2 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-sky-400">
                live preview B · Garage Garage Header Label (Car / Colour / Materials / Anthem / Sync)
              </span>
              <span className="text-neutral-400">active: {previewGarageTab}</span>
            </div>
            <UnderlineTabs
              items={garageDemoTabs}
              activeId={previewGarageTab}
              onChange={setPreviewGarageTab}
              isLight={isLight}
            />
          </div>
        </div>
      )}

      {showCode && (
        <CodeBlock
          isLight={isLight}
          title="src/tokens/underlineTabsStore.ts & UnderlineTabs Config Export"
          code={`${exportConfigCode()}

// Use Default Directly <UnderlineTabs /> Auto-sync font size (${fontSize}px) Match Icon Size (${iconSize}px)
<UnderlineTabs
  items={tabs}
  activeId={activeTab}
  onChange={setActiveTab}
  isLight={isLight}
/>`}
        />
      )}
    </div>
  );
});

UnderlineTabsTuner.displayName = 'UnderlineTabsTuner';
