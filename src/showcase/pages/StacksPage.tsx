import React, { useCallback } from 'react';
import { Columns, Crosshair, Layers, Rows } from 'lucide-react';
import {
  HudAnchorStage,
  HudRelativeAnchor,
  HudSlot,
  type HudSlotMode,
  HudZone,
} from '../../ui-core/layout/HudAnchorStage';
import { SegmentedSwitch } from '../../ui-core/primitives/SegmentedSwitch';
import { ToggleSwitch } from '../../ui-core/primitives/ToggleSwitch';
import { CodeBlock } from '../CodeBlock';
import { TunerConfigExporterBar } from '../components/tuner/TunerConfigExporterBar';
import { PageJumpDirectory, type JumpDirectoryItem } from '../PageJumpDirectory';
import { crossClientSync, useSyncedState } from '../stores/crossClientSync';

type StackGap = 'sm' | 'md' | 'lg';
const GAP_CLASS_MAP: Record<StackGap, string> = { sm: 'gap-2', md: 'gap-3.5', lg: 'gap-5' };

const STACKS_JUMP_ITEMS: JumpDirectoryItem[] = [
  {
    id: 'l2-stacks-1-vstack',
    code: 'L2.1',
    name: 'VStack (Vertical Stack Flow)',
    label: 'Vertical flex stack with configurable sm/md/lg spacing and divider',
  },
  {
    id: 'l2-stacks-2-hstack',
    code: 'L2.2',
    name: 'HStack (Horizontal Stack Flow)',
    label: 'Horizontal flex row with proportional gap tokens',
  },
  {
    id: 'l2-stacks-3-gridstack',
    code: 'L2.3',
    name: 'GridStack (Responsive Grid Array)',
    label: '2 / 3 / 4 column uniform grid container',
  },
  {
    id: 'l2-stacks-4-hud-anchor-stage',
    code: 'L2.4',
    name: 'HudAnchorStage / HudZone / HudSlot / HudRelativeAnchor',
    label: '3x3 spatial HUD anchor grid with 56px Top Split Band & reserve/collapse slot strategy',
  },
];

export const StacksPage: React.FC<{ isLight?: boolean }> = ({ isLight = true }) => {
  const [vGap, setVGap] = useSyncedState<StackGap>('page:stacks:vGap', 'md');
  const [hGap, setHGap] = useSyncedState<StackGap>('page:stacks:hGap', 'md');
  const [showDivider, setShowDivider] = useSyncedState<boolean>('page:stacks:showDivider', true);
  const [cols, setCols] = useSyncedState<2 | 3 | 4>('page:stacks:cols', 3);

  const [slotMode, setSlotMode] = useSyncedState<HudSlotMode>('page:stacks:slotMode', 'reserve');
  const [showTopBand, setShowTopBand] = useSyncedState<boolean>('page:stacks:showTopBand', true);
  const [showBoostSlot, setShowBoostSlot] = useSyncedState<boolean>(
    'page:stacks:showBoostSlot',
    true
  );
  const [showTopBandGuide, setShowTopBandGuide] = useSyncedState<boolean>(
    'page:stacks:showTopBandGuide',
    true
  );

  const stageStrategy = slotMode === 'reserve' ? 'reserve' : 'collapse-symmetric';

  const handleResetDefaults = useCallback(() => {
    crossClientSync.resetAll({ scopePrefix: 'page:stacks:' });
  }, []);

  const buildExportCode = useCallback(() => {
    const snapshot = {
      vStack: { gap: vGap, className: GAP_CLASS_MAP[vGap], showDivider },
      hStack: { gap: hGap, className: GAP_CLASS_MAP[hGap] },
      gridStack: { columns: cols },
      hudAnchorStage: {
        strategy: stageStrategy,
        slotMode,
        topSplitBandReservedHeightPx: 56,
        showTopBand,
        showBoostSlot,
        showTopBandGuide,
      },
    };
    return `// L2 Stacks & HudAnchorStage Layout Calibrated Default Snapshot\nexport const DEFAULT_L2_STACKS_AND_HUD_STAGE_SNAPSHOT = ${JSON.stringify(snapshot, null, 2)};`;
  }, [
    vGap,
    showDivider,
    hGap,
    cols,
    stageStrategy,
    slotMode,
    showTopBand,
    showBoostSlot,
    showTopBandGuide,
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <PageJumpDirectory
        layerTag="Layer 2 · Structural Layout Skeleton"
        title="L2 Stack & HudAnchorStage Layout Directory"
        subtitle="Zero L3–L7 business coupling · Covers VStack / HStack / GridStack & 3x3 HudAnchorStage spatial skeleton"
        items={STACKS_JUMP_ITEMS}
        isLight={isLight}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          L2 Layout container (HStack / VStack / GridStack / HudAnchorStage)
        </h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Pure structural skeleton layer (zero L3–L7 Business dependency) . Covers standard stream
          stack (VStack/HStack/GridStack) And dedicated to competitive HUD Nine-grid equal-height
          split stage (HudAnchorStage / HudTopSplitBand / HudZone / HudSlot / HudRelativeAnchor) .
        </p>
      </div>

      <TunerConfigExporterBar
        badge="L2-STACKS-EXPORT"
        title="L2 Stack & HudAnchorStage Parameter Tuner & One-Click Config Exporter"
        subtitle="Exports VStack/HStack gap tokens, GridStack columns & HudAnchorStage reserve/collapse slot strategy"
        copyLabel="Copy L2 Layout Config (Export Snapshot)"
        codeTitle="Current L2 Stack & HudAnchorStage Parameter Snapshot (Paste directly into DEFAULT_L2_STACKS_AND_HUD_STAGE_SNAPSHOT)"
        actionId="export-l2-stacks-config"
        isLight={isLight}
        buildExportCode={buildExportCode}
        onResetDefaults={handleResetDefaults}
      />

      {/* 1. VStack */}
      <div
        id="l2-stacks-1-vstack"
        className={`scroll-mt-24 p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm flex items-center gap-2">
            <Rows className="h-4 w-4 text-amber-500" />
            <span>1. Vertical stack flow (VStack)</span>
          </span>
          <div className="flex items-center gap-3">
            <ToggleSwitch
              label="Divider"
              checked={showDivider}
              onCheckedChange={setShowDivider}
              isLight={isLight}
            />
            <SegmentedSwitch
              size="sm"
              value={vGap}
              onValueChange={(v) => setVGap(v as StackGap)}
              isLight={isLight}
              options={[
                { value: 'sm', label: 'Small (sm / 1.0%)' },
                { value: 'md', label: 'in (md / 1.8%)' },
                { value: 'lg', label: 'Large (lg / 2.8%)' },
              ]}
            />
          </div>
        </div>

        <div
          className={`flex flex-col ${GAP_CLASS_MAP[vGap]} ${
            showDivider
              ? isLight
                ? 'divide-y divide-neutral-200'
                : 'divide-y divide-neutral-800'
              : ''
          } p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <div
            className={`p-3 rounded-lg text-xs font-medium border transition-colors ${
              isLight
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
            }`}
          >
            VStack Element A (Top Section)
          </div>
          <div
            className={`p-3 rounded-lg text-xs font-medium border transition-colors ${
              isLight
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
            }`}
          >
            VStack Element B (Middle Section)
          </div>
          <div
            className={`p-3 rounded-lg text-xs font-medium border transition-colors ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}
          >
            VStack Element C (Bottom Section)
          </div>
        </div>
      </div>

      {/* 2. HStack */}
      <div
        id="l2-stacks-2-hstack"
        className={`scroll-mt-24 p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm flex items-center gap-2">
            <Columns className="h-4 w-4 text-emerald-500" />
            <span>2. Horizontal stack flow (HStack)</span>
          </span>
          <SegmentedSwitch
            size="sm"
            value={hGap}
            onValueChange={(v) => setHGap(v as StackGap)}
            isLight={isLight}
            options={[
              { value: 'sm', label: 'Small (sm / 1.0%)' },
              { value: 'md', label: 'in (md / 1.8%)' },
              { value: 'lg', label: 'Large (lg / 2.8%)' },
            ]}
          />
        </div>

        <div
          className={`flex items-center ${GAP_CLASS_MAP[hGap]} p-4 rounded-xl border transition-colors ${
            isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/40 border-neutral-800'
          }`}
        >
          <div
            className={`flex-1 p-3 rounded-lg text-xs font-medium text-center border transition-colors ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs'
                : 'bg-neutral-800 border-neutral-700 text-neutral-200'
            }`}
          >
            Item 1
          </div>
          <div
            className={`flex-1 p-3 rounded-lg text-xs font-medium text-center border transition-colors ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs'
                : 'bg-neutral-800 border-neutral-700 text-neutral-200'
            }`}
          >
            Item 2
          </div>
          <div
            className={`flex-1 p-3 rounded-lg text-xs font-medium text-center border transition-colors ${
              isLight
                ? 'bg-white border-neutral-200 text-neutral-800 shadow-2xs'
                : 'bg-neutral-800 border-neutral-700 text-neutral-200'
            }`}
          >
            Item 3
          </div>
        </div>
      </div>

      {/* 3. GridStack */}
      <div
        id="l2-stacks-3-gridstack"
        className={`scroll-mt-24 p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-bold text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-500" />
            <span>3. Responsive grid array (GridStack)</span>
          </span>
          <SegmentedSwitch
            size="sm"
            value={String(cols)}
            onValueChange={(v) => setCols(Number(v) as 2 | 3 | 4)}
            isLight={isLight}
            options={[
              { value: '2', label: '2 Cols' },
              { value: '3', label: '3 Cols' },
              { value: '4', label: '4 Cols' },
            ]}
          />
        </div>

        <div
          className={`grid ${
            cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-4'
          } gap-3.5`}
        >
          {Array.from({ length: cols * 2 }).map((_, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border text-center text-xs font-mono transition-colors ${
                isLight
                  ? 'bg-white border-neutral-200 text-neutral-700 shadow-2xs'
                  : 'bg-neutral-950/40 border-neutral-800 text-neutral-300'
              }`}
            >
              Grid Item #{i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 4. HudAnchorStage + HudTopSplitBand + HudZone + HudSlot + HudRelativeAnchor */}
      <div
        id="l2-stacks-4-hud-anchor-stage"
        className={`scroll-mt-24 p-6 rounded-2xl border flex flex-col gap-4 transition-colors ${
          isLight ? 'bg-white border-neutral-200 shadow-xs' : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-indigo-500" />
              <span>
                4. 3x3 grid anchor points and top bar height-aligned tripartite space
                (HudAnchorStage / HudTopSplitBand / HudZone / HudSlot / HudRelativeAnchor)
              </span>
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              pure L2 Geometric skeleton: top bar 56px Shared height (left Telemetry With right
              40×40 Stack Icon + Bubble Vertically centered, in Scorebug Stick to top top-0) ,
              Eliminate magic coordinate coupling
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <SegmentedSwitch
              size="sm"
              value={slotMode}
              onValueChange={(v) => setSlotMode(v as HudSlotMode)}
              isLight={isLight}
              options={[
                { value: 'reserve', label: 'reserve (Fixed Placeholder)' },
                { value: 'collapse', label: 'collapse (Flow fill)' },
              ]}
            />
            <ToggleSwitch
              label="show 56px Top bar guide"
              checked={showTopBandGuide}
              onCheckedChange={setShowTopBandGuide}
              isLight={isLight}
            />
            <ToggleSwitch
              label="Toggle top bar"
              checked={showTopBand}
              onCheckedChange={setShowTopBand}
              isLight={isLight}
            />
            <ToggleSwitch
              label="Boost Toggle dashboard"
              checked={showBoostSlot}
              onCheckedChange={setShowBoostSlot}
              isLight={isLight}
            />
          </div>
        </div>

        {/* Interactive Wireframe Stage */}
        <div
          className={`relative w-full h-[340px] rounded-2xl border overflow-hidden font-mono text-xs ${
            isLight
              ? 'bg-neutral-100/90 border-neutral-300 text-neutral-800'
              : 'bg-neutral-950 border-neutral-800 text-neutral-200'
          }`}
        >
          {showTopBandGuide && (
            <div className="absolute top-0 inset-x-0 h-[56px] border-b border-dashed border-indigo-500/40 bg-indigo-500/5 pointer-events-none z-10 flex items-end justify-center pb-0.5">
              <span className="text-[9px] text-indigo-500 font-bold tracking-widest uppercase">
                HudTopSplitBand (56px Shared Vertical Space · items-center)
              </span>
            </div>
          )}

          <HudAnchorStage strategy={stageStrategy}>
            <HudZone anchor="top-left" flush>
              <HudSlot
                visible={showTopBand}
                mode={slotMode}
                reservedHeight={56}
                innerClassName="h-[56px] flex items-center pl-3"
              >
                <div className="h-[26px] px-2.5 rounded-md border border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center text-[10px] font-bold">
                  [Left Container] Telemetry (26px · Centered in 56px)
                </div>
              </HudSlot>

              <div className="px-3 py-3 rounded-r-lg border-y border-r border-blue-500/50 bg-blue-500/15 text-blue-600 dark:text-blue-300 text-[10px] font-bold">
                [Left Landmark] Team 1-3 Strip (Starts at y=56px)
              </div>
            </HudZone>

            <HudZone anchor="top-center" flush>
              <div className="px-4 py-1.5 rounded-b-md border-x border-b border-neutral-400 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[10px] font-bold shadow-xs">
                [Center Container · top-0] Scorebug
              </div>
              <div className="-mt-[4px] pt-[6px] pb-1 px-3 rounded-b-md border-x border-b border-neutral-400 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 text-[9px]">
                Series Pips Banner (Tier 1)
              </div>
              <div className="-mt-[4px] pt-[6px] pb-1 px-3 rounded-b-md bg-red-600 text-white text-[9px] font-bold">
                Phase Drop-Banner (Tier 2 · OVERTIME)
              </div>
            </HudZone>

            <HudZone anchor="top-right" flush>
              <HudSlot
                visible={showTopBand}
                mode={slotMode}
                reservedHeight={56}
                innerClassName="h-[56px] flex items-center justify-end pr-3"
              >
                <div className="relative w-10 h-10 rounded-xl border border-amber-500/60 bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center text-[10px] font-bold">
                  Stack
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[9px] flex items-center justify-center font-extrabold">
                    4
                  </span>
                </div>
              </HudSlot>

              <div className="px-3 py-3 rounded-l-lg border-y border-l border-orange-500/50 bg-orange-500/15 text-orange-600 dark:text-orange-300 text-[10px] font-bold">
                [Right Landmark] Team 4-6 Strip (Starts at y=56px)
              </div>
            </HudZone>

            <HudZone anchor="bottom-left">
              <div className="px-3 py-1.5 rounded-lg border border-neutral-400/50 bg-neutral-500/10 text-[10px] font-bold">
                [Bottom-Left] BallCam
              </div>
            </HudZone>

            <HudZone anchor="bottom-center">
              <HudRelativeAnchor
                placement="top"
                align="start"
                gap={8}
                floating
                attachment={
                  <div className="relative overflow-hidden px-2.5 py-1 rounded-md border border-emerald-500/60 bg-neutral-900/80 text-white text-[10px] font-bold">
                    <div className="absolute inset-y-0 left-0 w-[72%] bg-emerald-500/40" />
                    <span className="relative z-10">
                      FlipPill (top + align=start · 160-step fill)
                    </span>
                  </div>
                }
              >
                <div className="w-[260px] py-1.5 px-3 rounded-md border border-sky-500/50 bg-sky-500/15 text-sky-600 dark:text-sky-300 text-center text-[10px] font-bold">
                  [Bottom-Center] VelocityProgressBar
                </div>
              </HudRelativeAnchor>
            </HudZone>

            <HudZone anchor="bottom-right" flush className="pb-3">
              <div className="mb-2 px-3 py-1.5 rounded-l-md border-y border-l border-sky-500/50 bg-sky-500/15 text-sky-600 dark:text-sky-300 text-[10px] font-bold">
                [Notification] Above Reserved Boost Slot
              </div>
              <HudSlot visible={showBoostSlot} mode="reserve" innerClassName="pr-4">
                <div className="w-20 h-20 rounded-full border-2 border-amber-500/60 bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center text-center text-[10px] font-bold p-2">
                  Boost Slot (reserve)
                </div>
              </HudSlot>
            </HudZone>
          </HudAnchorStage>
        </div>
      </div>

      {/* Dynamic Code Snippet */}
      <CodeBlock
        isLight={isLight}
        title="Agent code recipe (Stack & HudAnchorStage Layout Recipe · Reflects Current Parameters)"
        code={`import {
  HudAnchorStage,
  HudZone,
  HudSlot,
  HudRelativeAnchor,
} from '@/ui-core/layout/HudAnchorStage';

// 1. Active HudAnchorStage Strategy: "${stageStrategy}" (slotMode="${slotMode}", showTopBand=${showTopBand}, showBoostSlot=${showBoostSlot})
<HudAnchorStage strategy="${stageStrategy}">
  <HudZone anchor="top-left" flush>
    <HudSlot visible={${showTopBand}} mode="${slotMode}" reservedHeight={56} innerClassName="h-[56px] flex items-center pl-3">
      <CompactTelemetryBarHUD />
    </HudSlot>
    <EdgePlayerHudStrip side="left" />
  </HudZone>

  <HudZone anchor="bottom-center">
    <HudRelativeAnchor
      placement="top"
      align="start"
      gap={8}
      floating
      attachment={<FlipIndicatorPillHUD />}
    >
      <VelocityProgressBar />
    </HudRelativeAnchor>
  </HudZone>

  <HudZone anchor="bottom-right" flush className="pb-3">
    <HudSlot visible={${showBoostSlot}} mode="reserve" innerClassName="pr-4">
      <CircularBoostGauge />
    </HudSlot>
  </HudZone>
</HudAnchorStage>`}
      />
    </div>
  );
};
