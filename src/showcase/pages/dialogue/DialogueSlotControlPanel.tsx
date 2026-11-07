import React from 'react';
import { Sliders, Type, Box, Sparkles, CheckCircle2, Trash2, Plus } from 'lucide-react';
import type {
  DialogueTone,
  DialogueButtonConfig,
  DialogueButtonVariant,
} from '../../../ui-core/compounds/dialogue/dialogueTypes';
import { Button } from '../../../ui-core/primitives/Button';
import { Badge } from '../../../ui-core/primitives/Badge';

const PRESET_ICONS = [
  'octagon-alert',
  'triangle-alert',
  'flame',
  'info',
  'bell',
  'shield-alert',
  'check-circle',
];

export interface DialogueSlotState {
  title: string;
  setTitle: (val: string) => void;
  tone: DialogueTone;
  setTone: (val: DialogueTone) => void;
  iconName: string;
  setIconName: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  buttons: DialogueButtonConfig[];
  newButtonLabel: string;
  setNewButtonLabel: (val: string) => void;
  newButtonVariant: DialogueButtonVariant;
  setNewButtonVariant: (val: DialogueButtonVariant) => void;
  newButtonDisabled: boolean;
  setNewButtonDisabled: (val: boolean) => void;
}

export interface DialogueSlotActions {
  handleAddButton: () => void;
  handleRemoveButton: (index: number) => void;
  handleUpdateButtonLabel: (index: number, newLabel: string) => void;
  handleUpdateButtonVariant: (index: number, newVariant: DialogueButtonVariant) => void;
  handleToggleButtonDisabled: (index: number) => void;
}

export interface DialogueSlotControlPanelProps {
  isLight: boolean;
  slotState: DialogueSlotState;
  slotActions: DialogueSlotActions;
}

export const DialogueSlotControlPanel: React.FC<DialogueSlotControlPanelProps> = React.memo(
  ({ isLight, slotState, slotActions }) => {
    const {
      title,
      setTitle,
      tone,
      setTone,
      iconName,
      setIconName,
      content,
      setContent,
      buttons,
      newButtonLabel,
      setNewButtonLabel,
      newButtonVariant,
      setNewButtonVariant,
      newButtonDisabled,
      setNewButtonDisabled,
    } = slotState;

    const {
      handleAddButton,
      handleRemoveButton,
      handleUpdateButtonLabel,
      handleUpdateButtonVariant,
      handleToggleButtonDisabled,
    } = slotActions;

    return (
      <div
        className={`p-6 rounded-2xl border flex flex-col gap-6 shadow-sm ${
          isLight
            ? 'bg-neutral-50/90 border-neutral-200/90 text-neutral-900'
            : 'bg-neutral-900/60 border-neutral-800 text-neutral-100'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-neutral-200/70 dark:border-neutral-800/70">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-sm tracking-tight">
              Dialogue standard Slots Parameter input
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm" isLight={isLight}>
              Plain 46px · Zero Mask · Stackable
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Title & Tone */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Type className="h-3.5 w-3.5" />
              <span>Title & Tone</span>
            </div>

            {/* Title Text Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Title (Headline text)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ALERT"
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />
            </div>

            {/* Tone Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">
                Color Level (4Level tonality: Gray Yellow Orange Red)
              </label>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                {(
                  [
                    { key: 'error', label: 'Error (red)', dot: 'bg-red-500' },
                    { key: 'warning', label: 'Warn (Yellow)', dot: 'bg-yellow-400' },
                    { key: 'orange', label: 'Alert (Orange)', dot: 'bg-orange-500' },
                    { key: 'info', label: 'Info (Gray)', dot: 'bg-neutral-400' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTone(item.key)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[10px] font-medium transition-all cursor-pointer ${
                      tone === item.key
                        ? isLight
                          ? 'bg-white border-neutral-900 shadow-xs text-neutral-900 font-bold'
                          : 'bg-neutral-800 border-white shadow-xs text-white font-bold'
                        : isLight
                        ? 'bg-white/70 hover:bg-white border-neutral-200 text-neutral-600'
                        : 'bg-neutral-950/70 hover:bg-neutral-950 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Solidified Specification Badge Card */}
            <div
              className={`p-3 rounded-xl border text-[11px] font-mono flex flex-col gap-1.5 ${
                isLight
                  ? 'bg-white border-neutral-200 text-neutral-600'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Standardized Specs (Standardized)</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] leading-relaxed">
                <div>
                  • Icon Variation: <strong>Plain</strong>
                </div>
                <div>
                  • Icon Size: <strong>46px</strong>
                </div>
                <div>
                  • Title Size: <strong>32px</strong>
                </div>
                <div>
                  • Letter Spacing: <strong>10px</strong>
                </div>
                <div>
                  • Title Weight: <strong>Regular 400</strong>
                </div>
                <div>
                  • Title Color: <strong>Content Sync</strong>
                </div>
                <div>
                  • Padding: <strong>10×16×32px</strong>
                </div>
                <div>
                  • Background Mask: <strong>None (0% Dim)</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Icon Name & Content */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Icon (46px Plain) & Content</span>
            </div>

            {/* Icon Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span>Lucide Icon Name (Pass icon name directly)</span>
                <span className="text-[10px] font-mono text-neutral-400">{iconName} (46px)</span>
              </label>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="octagon-alert"
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />
              {/* Quick Pick Icon Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_ICONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setIconName(preset)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition-all cursor-pointer ${
                      iconName === preset
                        ? isLight
                          ? 'bg-neutral-900 text-white border-neutral-900 font-bold'
                          : 'bg-white text-neutral-900 border-white font-bold'
                        : isLight
                        ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-600'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Content (Body content)</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type informative English content..."
                style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                className={`w-full px-3 py-2 rounded-xl text-xs border outline-none transition-colors resize-none leading-relaxed ${
                  isLight
                    ? 'bg-white border-neutral-300 focus:border-amber-500 text-neutral-900'
                    : 'bg-neutral-950 border-neutral-700/80 focus:border-amber-500 text-neutral-100'
                }`}
              />
            </div>
          </div>

          {/* Column 3: Button Manager with Disabled Support */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Box className="h-3.5 w-3.5" />
              <span>Button Manager (with disabled support)</span>
            </div>

            {/* Active Buttons List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Active Buttons (Compact centered)</span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {buttons.length} items
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {buttons.map((btn, index) => (
                  <div
                    key={btn.key ?? index}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-colors ${
                      btn.disabled ? 'opacity-65' : ''
                    } ${
                      isLight ? 'bg-white border-neutral-200' : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        isLight ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => handleUpdateButtonLabel(index, e.target.value)}
                      placeholder="Button text"
                      style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                      className={`flex-1 min-w-0 px-2 py-1 rounded-lg border text-xs outline-none ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300'
                          : 'bg-neutral-900 border-neutral-700'
                      }`}
                    />
                    <select
                      value={btn.variant ?? 'outline'}
                      onChange={(e) =>
                        handleUpdateButtonVariant(index, e.target.value as DialogueButtonVariant)
                      }
                      className={`px-1.5 py-1 rounded-lg border text-[11px] font-mono outline-none cursor-pointer shrink-0 ${
                        isLight
                          ? 'bg-neutral-50 border-neutral-300 text-neutral-800'
                          : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                      }`}
                    >
                      <option value="primary">primary</option>
                      <option value="outline">outline</option>
                      <option value="danger">danger</option>
                    </select>
                    {/* Disabled Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleButtonDisabled(index)}
                      className={`px-1.5 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer shrink-0 ${
                        btn.disabled
                          ? 'bg-rose-500/15 border-rose-500 text-rose-500 font-bold'
                          : isLight
                          ? 'bg-neutral-100 border-neutral-300 text-neutral-500'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                      }`}
                      title={btn.disabled ? 'Button is disabled' : 'Click to disable button'}
                    >
                      {btn.disabled ? 'Disabled' : 'Enabled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveButton(index)}
                      className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                      title="Remove button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {buttons.length === 0 && (
                  <div
                    className={`p-4 rounded-xl border border-dashed text-xs text-center ${
                      isLight
                        ? 'border-neutral-300 text-neutral-500'
                        : 'border-neutral-700 text-neutral-400'
                    }`}
                  >
                    No buttons. Add one below.
                  </div>
                )}
              </div>

              {/* Add Button Input */}
              <div
                className={`flex items-center gap-2 p-2 rounded-xl border border-dashed mt-1 ${
                  isLight
                    ? 'bg-neutral-100/60 border-neutral-300'
                    : 'bg-neutral-950/60 border-neutral-700'
                }`}
              >
                <input
                  type="text"
                  value={newButtonLabel}
                  onChange={(e) => setNewButtonLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddButton();
                    }
                  }}
                  placeholder="Primary"
                  style={{ fontFamily: "'SF Mono', 'JetBrains Mono', monospace" }}
                  className={`flex-1 min-w-0 px-2 py-1 rounded-lg border text-xs outline-none ${
                    isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                  }`}
                />
                <select
                  value={newButtonVariant}
                  onChange={(e) => setNewButtonVariant(e.target.value as DialogueButtonVariant)}
                  className={`px-1.5 py-1 rounded-lg border text-[11px] font-mono outline-none cursor-pointer shrink-0 ${
                    isLight
                      ? 'bg-white border-neutral-300 text-neutral-800'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                  }`}
                >
                  <option value="primary">primary</option>
                  <option value="outline">outline</option>
                  <option value="danger">danger</option>
                </select>
                <label className="flex items-center gap-1 text-[10px] font-mono cursor-pointer shrink-0 select-none">
                  <input
                    type="checkbox"
                    checked={newButtonDisabled}
                    onChange={(e) => setNewButtonDisabled(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span>Disabled</span>
                </label>
                <Button
                  variant="primary"
                  size="sm"
                  isLight={isLight}
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={handleAddButton}
                  className="shrink-0 cursor-pointer"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DialogueSlotControlPanel.displayName = 'DialogueSlotControlPanel';
