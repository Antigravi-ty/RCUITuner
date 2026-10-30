import React from 'react';
import { createScopedSyncedState } from '../../stores/crossClientSync';

const useState = createScopedSyncedState('page:quick-notification-ctrl');
import { Sliders, Eye, Type, ThumbsDown, MinusCircle, Ban, Hand, Plus, X, } from 'lucide-react';
import type {
  QuickNotificationGlowLevel, QuickNotificationType, QuickNotificationButtonConfig, QuickNotificationButtonVariant,
  QuickNotificationButtonFormat,
} from '../../../ui-core/compounds/QuickNotification';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';

const PRESET_ICONS = [
  'bell',
  'loader-2',
  'download',
  'octagon-alert',
  'triangle-alert',
  'info',
  'flame',
  'sparkles',
  'check-circle',
  'shield-alert',
  'activity',
];

const PRESET_TONES: { key: QuickNotificationGlowLevel; label: string; dotClass: string }[] = [
  { key: 'none', label: 'none (No Glow)', dotClass: 'bg-neutral-400' },
  { key: 'info', label: 'info (Grey)', dotClass: 'bg-neutral-300' },
  { key: 'warning', label: 'warning (Yellow)', dotClass: 'bg-yellow-500' },
  { key: 'orange', label: 'orange (Orange)', dotClass: 'bg-orange-500' },
  { key: 'error', label: 'error (Red)', dotClass: 'bg-red-500' },
];

const BUTTON_COLOR_SWATCHES: {
  key: QuickNotificationButtonVariant;
  label: string;
  dotClass: string;
}[] = [
  { key: 'green', label: 'green (Accept)', dotClass: 'bg-emerald-500' },
  { key: 'red', label: 'red (Reject)', dotClass: 'bg-red-500' },
  { key: 'amber', label: 'Amber (Retry)', dotClass: 'bg-amber-500' },
  { key: 'neutral', label: 'Neutral Monochrome', dotClass: 'bg-neutral-900 dark:bg-neutral-100' },
  { key: 'sky', label: 'Classic Blue', dotClass: 'bg-sky-500' },
  { key: 'purple', label: 'Special Purple', dotClass: 'bg-purple-500' },
];

const REJECT_ICON_OPTIONS = [
  { key: 'thumbs-down', label: 'Thumbs Down (recommended)', icon: <ThumbsDown className="h-3 w-3" /> },
  { key: 'minus-circle', label: 'Minus Circle', icon: <MinusCircle className="h-3 w-3" /> },
  { key: 'ban', label: 'Ban Circle', icon: <Ban className="h-3 w-3" /> },
  { key: 'hand', label: 'Hand Stop', icon: <Hand className="h-3 w-3" /> },
];

export interface QuickNotificationControlPanelProps {
  isLight: boolean;
  showStackIcon: boolean;
  setShowStackIcon: (val: boolean) => void;
  liveMode: boolean;
  setLiveMode: (val: boolean) => void;
  totalChars: number;
  chineseChars: number;
  asciiChars: number;
  estimatedContentWidthPx: number;
  temporalType: QuickNotificationType;
  setTemporalType: (val: QuickNotificationType) => void;
  effectiveDuration: number;
  durationPreset: '3000' | '5000' | 'custom';
  setDurationPreset: (val: '3000' | '5000' | 'custom') => void;
  customDurationMs: number;
  setCustomDurationMs: (val: number) => void;
  ongoingProgressMode: 'determinate' | 'indeterminate' | 'none';
  setOngoingProgressMode: (val: 'determinate' | 'indeterminate' | 'none') => void;
  ongoingProgressPct: number;
  setOngoingProgressPct: (val: number) => void;
  isSpinningIcon: boolean;
  setIsSpinningIcon: (val: boolean) => void;
  tone: QuickNotificationGlowLevel;
  setTone: (val: QuickNotificationGlowLevel) => void;
  iconName: string;
  setIconName: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  buttons: QuickNotificationButtonConfig[];
  setButtons: React.Dispatch<React.SetStateAction<QuickNotificationButtonConfig[]>>;
}

export const QuickNotificationControlPanel: React.FC<QuickNotificationControlPanelProps> = React.memo(
  ({
    isLight,
    showStackIcon,
    setShowStackIcon,
    liveMode,
    setLiveMode,
    totalChars,
    chineseChars,
    asciiChars,
    estimatedContentWidthPx,
    temporalType,
    setTemporalType,
    effectiveDuration,
    durationPreset,
    setDurationPreset,
    customDurationMs,
    setCustomDurationMs,
    ongoingProgressMode,
    setOngoingProgressMode,
    ongoingProgressPct,
    setOngoingProgressPct,
    isSpinningIcon,
    setIsSpinningIcon,
    tone,
    setTone,
    iconName,
    setIconName,
    content,
    setContent,
    buttons,
    setButtons,
  }) => {
    const [newBtnLabel, setNewBtnLabel] = useState<string>('Retry');
    const [newBtnIcon, setNewBtnIcon] = useState<string>('rotate-ccw');
    const [newBtnFormat, setNewBtnFormat] = useState<QuickNotificationButtonFormat>('icon-text');
    const [newBtnColor, setNewBtnColor] = useState<QuickNotificationButtonVariant>('amber');

    const handleAddButton = () => {
      const trimmed = newBtnLabel.trim();
      const btn: QuickNotificationButtonConfig = {
        key: `btn-${Date.now()}`,
        label: trimmed || undefined,
        icon: newBtnIcon.trim() || undefined,
        format: newBtnFormat,
        color: newBtnColor,
      };
      setButtons((prev) => [...prev, btn]);
    };

    const handleRemoveButton = (index: number) => {
      setButtons((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <div className={`lg:col-span-7 flex flex-col gap-5 p-5 rounded-2xl border ${
        isLight ? 'bg-white border-neutral-200' : 'bg-neutral-900/60 border-neutral-800' }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-bold tracking-tight">Parameter control panel (Control Panel)</h2>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-neutral-500">Slot 1 (Right):</span>
            <input type="checkbox" checked={showStackIcon} onChange={(e) => setShowStackIcon(e.target.checked)}
              className="rounded cursor-pointer accent-neutral-900 dark:accent-neutral-100" />
          </div>
        </div>

        {/* Mode Switch: Live Mode Toggle */}
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          liveMode ? isLight ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : 'bg-amber-950/30 border-amber-800/80 text-amber-200' : isLight
          ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
          : 'bg-neutral-850 border-neutral-800 text-neutral-300' }`}>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Eye className="h-3.5 w-3.5 text-amber-500" />
              <span>Live Real-time debug mode (Live Mode)</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Real-time Text, icon, Style and button changes projected to top-right drawer, Convenient for testing layout and character limits. </p>
          </div>

          <ToggleSwitch checked={liveMode} onCheckedChange={setLiveMode} variant="amber" isLight={isLight} />
        </div>

        {/* Real-time Character Counter */}
        <div className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
          isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-850/60 border-neutral-800' }`}>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5" />
              <span>Real-time character count (Live Character Telemetry)</span>
            </span>
            <span className="text-[11px] text-neutral-500">Unit: Character / Estimated Width</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
            <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-400">Total Characters</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{totalChars}</div>
            </div>
            <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-400">Chinese Characters</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{chineseChars}</div>
            </div>
            <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-400">English/Digits/Symbols</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{asciiChars}</div>
            </div>
            <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-900 border border-neutral-300/40 dark:border-neutral-800">
              <div className="text-[10px] text-neutral-400">Estimated Text Width</div>
              <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">~{estimatedContentWidthPx}px</div>
            </div>
          </div>
        </div>

        {/* Temporal Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>1. Validity and notification type (Temporal & Task Spec)</span>
            <span className="text-[11px] lowercase text-neutral-400 font-normal">
              {temporalType === 'temporary'
                ? 'Auto-collapse and count on timeout'
                : temporalType === 'persistent'
                ? 'Persistent Notification (Force collapse right-most black key)'
                : 'Background Companion/Task (Lowest Priority · Non-dismissible · Auto-yield and restore)'}
            </span>
          </div>

          <SegmentedSwitch value={temporalType}
            onValueChange={(val) => setTemporalType(val as QuickNotificationType)} options={[
            { value: 'temporary', label: 'Temporary (Temporary)' }, { value: 'persistent', label: 'Persistent (persistent)' },
            { value: 'ongoing', label: 'Ongoing (Background Task)' }, ]} isLight={isLight} distribution="equal" />

          {/* Temporary Duration Controls */}
          {temporalType === 'temporary' && (
            <div className="flex flex-col gap-2 mt-1 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Time Parameters (Native Milliseconds ms)</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  current: {effectiveDuration}ms ({(effectiveDuration / 1000).toFixed(1)}s)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['3000', '5000', 'custom'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDurationPreset(preset)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      durationPreset === preset
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    {preset === '3000'
                      ? '3000ms (3sec)'
                      : preset === '5000'
                      ? '5000ms (5sec)'
                      : 'Custom (Custom)'}
                  </button>
                ))}
              </div>

              {durationPreset === 'custom' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-neutral-400">Millisecond Value:</span>
                  <input type="number" step={500} min={500} max={60000} value={customDurationMs}
                    onChange={(e) => setCustomDurationMs(Number(e.target.value))}
                    className="w-32 px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono" />
                  <span className="text-[11px] text-neutral-400">ms</span>
                </div>
              )}
            </div>
          )}

          {/* Ongoing Task Controls */}
          {temporalType === 'ongoing' && (
            <div className="flex flex-col gap-2.5 mt-1 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40">
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Progress Bar Parameters (Progress Spec)</span>
                <span className="text-[10px] text-amber-500 font-bold">Lowest Priority · Non-dismissible · Remote Driven</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['determinate', 'indeterminate', 'none'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setOngoingProgressMode(mode)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      ongoingProgressMode === mode
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-950 border-white font-bold'
                        : isLight
                        ? 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    {mode === 'determinate'
                      ? `Determinate Progress (${ongoingProgressPct}%)`
                      : mode === 'indeterminate'
                      ? 'Streaming Pulse (Shimmer)'
                      : 'No Progress Bar (Text Only)'}
                  </button>
                ))}
              </div>

              {ongoingProgressMode === 'determinate' && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-neutral-400 w-16">Progress adjustment:</span>
                  <input type="range" min={0} max={100} value={ongoingProgressPct}
                    onChange={(e) => setOngoingProgressPct(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer" />
                  <span className="text-xs font-mono font-bold w-12 text-right">{ongoingProgressPct}%</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60 text-[11px]">
                <span className="text-neutral-400">Icon rotation animation (animate-spin):</span>
                <ToggleSwitch checked={isSpinningIcon} onCheckedChange={setIsSpinningIcon} variant="amber"
                  isLight={isLight} />
              </div>
            </div>
          )}
        </div>

        {/* Tone / Inner Glow Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>2. Visual style and inner glow (Tone & Inner Glow Level)</span>
            <span className="text-[11px] text-neutral-500 lowercase font-normal">4 Glow Level + 1 Level 0 non-glowing base plate</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {PRESET_TONES.map((t) => {
              const isSelected = tone === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTone(t.key)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-2xs'
                        : 'bg-white text-neutral-950 border-white font-bold shadow-2xs'
                      : isLight
                      ? 'bg-neutral-100/60 hover:bg-neutral-100 border-neutral-300 text-neutral-700'
                      : 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${t.dotClass} shrink-0`} />
                  <span className="truncate">{t.key}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Leading Icon Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>3. Leading Icon (Leading Lucide Icon)</span>
            <span className="text-[11px] text-neutral-500 lowercase font-normal">benchmark Dialogue Spec</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_ICONS.map((icon) => {
              const isSelected = iconName === icon;
              return (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setIconName(icon)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? isLight
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                        : 'bg-white text-neutral-950 border-white font-bold'
                      : isLight
                      ? 'bg-neutral-100/60 border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                      : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <span>{icon}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-neutral-400">Custom Icon Name:</span>
            <input type="text" value={iconName} onChange={(e) => setIconName(e.target.value)}
              placeholder="e.g. bell, flame, activity"
              className="flex-1 px-2.5 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono" />
          </div>
        </div>

        {/* Content Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>4. Notification Body (Notification Content)</span>
            <span className="text-[11px] text-neutral-400 font-normal">{totalChars} Character</span>
          </div>

          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Input notification prompt text..."
          />
        </div>

        {/* Dynamic Business Action Buttons */}
        <div className="flex flex-col gap-3 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <span>5. Action button (Business Buttons Slot)</span>
            <span className="text-[11px] text-neutral-400 lowercase font-normal">{buttons.length} Configurations · Exclude from unread count after trigger</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-neutral-500">Quick Presets:</span>
            <button
              type="button"
              onClick={() =>
                setButtons([
                  { key: 'accept', label: 'Accept', icon: 'check', format: 'icon-text', color: 'green' },
                  { key: 'reject', label: 'Reject', icon: 'thumbs-down', format: 'icon-only', color: 'red' },
                ])
              }
              className="px-2 py-0.5 rounded text-[11px] bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              Accept(green) + Reject(red ThumbsDown)
            </button>
            <button
              type="button"
              onClick={() =>
                setButtons([
                  { key: 'accept', label: 'Accept', icon: 'check', format: 'icon-text', color: 'green' },
                ])
              }
              className="px-2 py-0.5 rounded text-[11px] bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              Single Button: Accept
            </button>
            <button
              type="button"
              onClick={() =>
                setButtons([
                  { key: 'retry', label: 'Retry', icon: 'rotate-ccw', format: 'icon-text', color: 'amber' },
                ])
              }
              className="px-2 py-0.5 rounded text-[11px] bg-neutral-200/60 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              Retry(Orange RotateCcw)
            </button>
            <button
              type="button"
              onClick={() => setButtons([])}
              className="px-2 py-0.5 rounded text-[11px] text-red-500 bg-red-100/40 dark:bg-red-950/40 hover:bg-red-100 cursor-pointer"
            >
              Clear Button
            </button>
          </div>

          {buttons.length > 0 && (
            <div className="flex flex-col gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
              {buttons.map((b, idx) => (
                <div key={b.key || idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-850">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${BUTTON_COLOR_SWATCHES.find((c) => c.key === b.color)?.dotClass || 'bg-neutral-400'}`} />
                    <span className="font-bold text-xs">{b.label || '(No Text)'}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">[{b.format}]</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{b.icon}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveButton(idx)}
                    title="Delete Button"
                    className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new button form */}
          <div className="p-3 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col gap-2.5 bg-neutral-50/30 dark:bg-neutral-900/20">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400">
              <span>Add new business button</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 w-12">text:</span>
                <input type="text" value={newBtnLabel} onChange={(e) => setNewBtnLabel(e.target.value)}
                  placeholder="Button Label"
                  className="flex-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400 w-12">Icon name:</span>
                <input type="text" value={newBtnIcon} onChange={(e) => setNewBtnIcon(e.target.value)}
                  placeholder="check, thumbs-down..."
                  className="flex-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-mono" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 w-12">Display Mode:</span>
              <div className="flex items-center gap-1.5 flex-1">
                {(['icon-text', 'icon-only', 'text-only'] as QuickNotificationButtonFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setNewBtnFormat(fmt)}
                    className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                      newBtnFormat === fmt
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-950 border-white'
                        : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {fmt === 'icon-text' ? 'icon+text' : fmt === 'icon-only' ? 'Icon Only' : 'Text Only'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400 w-12">Color Palette:</span>
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {BUTTON_COLOR_SWATCHES.map((sw) => (
                  <button
                    key={sw.key}
                    type="button"
                    onClick={() => setNewBtnColor(sw.key)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border cursor-pointer transition-all ${
                      newBtnColor === sw.key
                        ? 'border-neutral-900 dark:border-white font-bold ring-1 ring-neutral-400'
                        : 'border-neutral-300 dark:border-neutral-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${sw.dotClass}`} />
                    <span>{sw.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-neutral-400">
              <span>Recommended Reject Icon:</span>
              {REJECT_ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setNewBtnIcon(opt.key);
                    setNewBtnLabel('Reject');
                    setNewBtnColor('red');
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-800 hover:bg-neutral-300 cursor-pointer"
                >
                  {opt.icon}
                  <span>{opt.key}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button type="button" onClick={handleAddButton}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                <span>Add to Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
