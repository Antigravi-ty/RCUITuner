import React from 'react';
import { Sliders, Link2, Unlink2 } from 'lucide-react';
import {
  useFloatingThreeStageStore, type FloatingHeaderLeftSlotMode, type FloatingHeaderTitleAlign, type FloatingHeaderRightActionMode,
  type FloatingHeaderRightIconStyle, type FloatingFooterRightSlotMode, type FloatingResizeHandleStyle, type FloatingCornerArcColorMode,
  type FloatingContentOverflowMode,
} from '../../../ui-core/stores/floatingThreeStageStore';
import {
  resolvePanelHeaderBackBtnGeometry, type PanelHeaderBackBtnIdleTone, type PanelHeaderBackBtnRadiusMode, type PanelHeaderBackBtnStyle,
} from '../../../ui-core/stores/menuLayoutStore';
import { Button } from '../../../ui-core/primitives/Button';
import { SliderControl } from '../../../ui-core/primitives/SliderControl';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';
import { SegmentedSwitch } from '../../../ui-core/primitives/SegmentedSwitch';

export const FloatingWindowParameterTunerSection: React.FC<{ isLight: boolean }> = ({
  isLight,
}) => {
  const config = useFloatingThreeStageStore();
  const { setParam, updateParams, pullFromGlobalL2Shell } = config;

  const btnGeom = resolvePanelHeaderBackBtnGeometry({
    panelHeaderPaddingX: config.headerPaddingX,
    panelHeaderPaddingY: config.headerPaddingY,
    panelHeaderBackBtnWidth: config.headerBtnWidth,
    panelHeaderBackBtnHeight: config.headerBtnHeight,
    panelHeaderBackBtnRadiusMode: config.headerBtnRadiusMode,
    panelHeaderBackBtnRadius: config.headerBtnCustomRadius,
    panelHeaderBackBtnInnerRadius: config.headerBtnInnerRadius,
    panelHeaderBackBtnRadiusTL: config.headerBtnRadiusTL,
    panelHeaderBackBtnRadiusTR: config.headerBtnRadiusTR,
    panelHeaderBackBtnRadiusBR: config.headerBtnRadiusBR,
    panelHeaderBackBtnRadiusBL: config.headerBtnRadiusBL,
    panelOuterRadius: config.outerRadius,
  });

  return (
    <section id="fw-3stage-6d-3-tuner" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-6 ${
      isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-sky-500/15 text-sky-500 border border-sky-500/30">
            6D+.3
          </span>
          <Sliders className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-bold">3-Stage Floating window full-parameter tuning workbench (Decoupled 3-Stage Floating Shell Tuner)</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {config.syncWithGlobalL2Shell ? (
              <Link2 className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <Unlink2 className="h-3.5 w-3.5 text-neutral-400" />
            )}
            <ToggleSwitch checked={config.syncWithGlobalL2Shell}
              onCheckedChange={(v) => setParam('syncWithGlobalL2Shell', v)} label="Real-time global link L2 PanelShell Store"
              variant="neutral" isLight={isLight} />
          </div>
          <Button size="sm" variant="secondary" isLight={isLight} onClick={pullFromGlobalL2Shell}>
            Single pull current L2 Shell Parameters
          </Button>
        </div>
      </div>

      {/* Group 1: Stage 1 Header & Carved Buttons */}
      <div className={`p-4 rounded-xl border flex flex-col gap-4 ${
        isLight ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Stage 1 · Header Top bar geometry, Left/right slots and concentric corners (Header &amp; Carved Action Slots)
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <SegmentedSwitch size="sm" isLight={isLight} value={config.headerTitleAlign}
              onValueChange={(v) => setParam('headerTitleAlign', v as FloatingHeaderTitleAlign)} options={[
              { value: 'center', label: 'Title Centered (L2 Standard)' }, { value: 'left', label: 'Title Left-Aligned (Classic 6D)' }, ]} />
            <SegmentedSwitch size="sm" isLight={isLight} value={config.headerLeftSlotMode} onValueChange={(v) =>
              setParam('headerLeftSlotMode', v as FloatingHeaderLeftSlotMode) } options={[
              { value: 'category-icon', label: 'left: Category Icon' }, { value: 'back-button', label: 'left: Back Back Button' },
              { value: 'none', label: 'left: none' }, ]} />
            <SegmentedSwitch size="sm" isLight={isLight} value={config.headerRightActionMode} onValueChange={(v) =>
              setParam('headerRightActionMode', v as FloatingHeaderRightActionMode) } options={[
              { value: 'minimize-only', label: 'right: Only Minimize' },
              { value: 'minimize-and-pin', label: 'right: Pin + Minimize' },
              { value: 'minimize-and-close', label: 'right: Minimize + Close' }, ]} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SliderControl label="title font size (headerTitleFontSize)" value={config.headerTitleFontSize} min={10} max={22}
            step={1} unit="px" editable colorScheme="amber" onChange={(v) => setParam('headerTitleFontSize', v)}
            isLight={isLight} />
          <SliderControl label="Top Bar Button Width (headerBtnWidth)" value={config.headerBtnWidth} min={18} max={56} step={1}
            unit="px" editable colorScheme="amber" onChange={(v) => setParam('headerBtnWidth', v)}
            isLight={isLight} />
          <SliderControl label="Top Bar Button Height (headerBtnHeight)" value={config.headerBtnHeight} min={18} max={44} step={1}
            unit="px" editable colorScheme="amber" onChange={(v) => setParam('headerBtnHeight', v)}
            isLight={isLight} />
          <SliderControl label="Header horizontal padding (headerPaddingX)" value={config.headerPaddingX} min={0} max={24}
            step={1} unit="px" editable colorScheme="sky" onChange={(v) => setParam('headerPaddingX', v)}
            isLight={isLight} />
          <SliderControl label="Header vertical padding (headerPaddingY)" value={config.headerPaddingY} min={0} max={20}
            step={1} unit="px" editable colorScheme="emerald" onChange={(v) => setParam('headerPaddingY', v)}
            isLight={isLight} />
          <SliderControl label="Floating Window Corner Radius (outerRadius)" value={config.outerRadius} min={0} max={28} step={1}
            unit="px" editable colorScheme="amber" onChange={(v) => setParam('outerRadius', v)} isLight={isLight} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
          <div className="flex items-center gap-2 flex-wrap">
            <SegmentedSwitch size="sm" isLight={isLight} value={config.headerBtnRadiusMode} onValueChange={(v) =>
              setParam('headerBtnRadiusMode', v as PanelHeaderBackBtnRadiusMode) } options={[ {
              value: 'asymmetric-tl', label: `concentric outer corner+Inner Corner Convergence (${btnGeom.concentricRadius}/${btnGeom.innerRadius}px)`, },
              { value: 'auto', label: `Four-Corner Concentric (${btnGeom.concentricRadius}px)` },
              { value: 'custom', label: `Manual Four-Corner (${config.headerBtnCustomRadius}px)` }, ]} />
            <SegmentedSwitch size="sm" isLight={isLight} value={config.headerBtnIdleTone} onValueChange={(v) =>
              setParam('headerBtnIdleTone', v as PanelHeaderBackBtnIdleTone) } options={[
              { value: 'match-header', label: 'Match top bar color' }, { value: 'muted-gray', label: 'Default dark gray' },
              { value: 'elevated', label: 'Raised light background' }, ]} />
            <SegmentedSwitch size="sm" isLight={isLight} value={config.headerBtnStyle}
              onValueChange={(v) => setParam('headerBtnStyle', v as PanelHeaderBackBtnStyle)} options={[
              { value: 'surface', label: 'Surface Border' }, { value: 'subtle', label: 'Subtle Borderless' }, ]} />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <SegmentedSwitch size="sm" isLight={isLight} value={config.headerRightIconStyle} onValueChange={(v) =>
              setParam('headerRightIconStyle', v as FloatingHeaderRightIconStyle) } options={[
              { value: 'minus', label: 'icon: Minus (-)' }, { value: 'minimize-2', label: 'icon: Minimize2' }, ]} />
            <ToggleSwitch checked={config.headerBtnExpandOnHover}
              onCheckedChange={(v) => setParam('headerBtnExpandOnHover', v)} label="Hover expand STACK Text"
              variant="neutral" isLight={isLight} />
          </div>
        </div>
      </div>

      {/* Group 2: Stage 2 Content Body & Overflow */}
      <div className={`p-4 rounded-xl border flex flex-col gap-4 ${
        isLight ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
            Stage 2 · Content Body padding, Internal sub-tabs and height overflow strategy
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <ToggleSwitch checked={config.showSubTabsBar} onCheckedChange={(v) => setParam('showSubTabsBar', v)}
              label="show Stage 2 UnderlineTabs Sub-tab Bar" variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={config.showFloatingToolbar}
              onCheckedChange={(v) => setParam('showFloatingToolbar', v)} label="show FloatingWindowToolbar Precision Bar"
              variant="neutral" isLight={isLight} />
            <SegmentedSwitch size="sm" isLight={isLight} value={config.contentOverflowMode} onValueChange={(v) =>
              setParam('contentOverflowMode', v as FloatingContentOverflowMode) } options={[
              { value: 'scroll-y', label: 'Pin/Resizable Height + Vertical Scroll (scroll-y)' },
              { value: 'auto-fit-height', label: 'Content adaptive height (auto-fit-height)' }, ]} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SliderControl label="Content horizontal padding (bodyPaddingX)" value={config.bodyPaddingX} min={0} max={32} step={1}
            unit="px" editable colorScheme="sky" onChange={(v) => setParam('bodyPaddingX', v)} isLight={isLight} />
          <SliderControl label="Content vertical padding (bodyPaddingY)" value={config.bodyPaddingY} min={0} max={32} step={1}
            unit="px" editable colorScheme="emerald" onChange={(v) => setParam('bodyPaddingY', v)}
            isLight={isLight} />
        </div>
      </div>

      {/* Group 3: Stage 3 Footer & Split Right Slot */}
      <div className={`p-4 rounded-xl border flex flex-col gap-4 ${
        isLight ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-500">
            Stage 3 · Footer Footer Toggle, Hover Description linkage and right-side split pane (Footer &amp; Split Right Slot)
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <ToggleSwitch checked={config.showFooter} onCheckedChange={(v) => { updateParams({ showFooter: v,
              variant: v ? 'three-stage-split-footer-grip' : 'two-stage-l2-header', }); }}
              label="Enable Stage 3 Footer bottom bar" variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={config.footerHoverLinkage}
              onCheckedChange={(v) => setParam('footerHoverLinkage', v)} label="Enable Control Hover Highlight Sync"
              variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={config.footerRightDivider}
              onCheckedChange={(v) => setParam('footerRightDivider', v)} label="Right slot divider (border-l)"
              variant="neutral" isLight={isLight} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-neutral-400">Footer Right side independent slot mode (footerRightSlotMode):</span>
          <SegmentedSwitch size="sm" isLight={isLight} value={config.footerRightSlotMode} onValueChange={(v) =>
            setParam('footerRightSlotMode', v as FloatingFooterRightSlotMode) } options={[
            { value: 'carved-resize-grip', label: 'Engrave Resize Drag Slot (W×H + ◢)' },
            { value: 'live-dimensions', label: 'Raw size telemetry reading (W×Hpx)' },
            { value: 'shortcut-badge', label: 'Shortcut Slot (Stack [ESC])' }, { value: 'none', label: 'No Right Slot (Full-width Label)' }, ]} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SliderControl label="Footer font size (footerFontSize)" value={config.footerFontSize} min={9} max={16} step={1}
            unit="px" editable colorScheme="amber" onChange={(v) => setParam('footerFontSize', v)}
            isLight={isLight} />
          <SliderControl label="Footer horizontal padding (footerPaddingX)" value={config.footerPaddingX} min={0} max={28}
            step={1} unit="px" editable colorScheme="sky" onChange={(v) => setParam('footerPaddingX', v)}
            isLight={isLight} />
          <SliderControl label="Footer vertical padding (footerPaddingY)" value={config.footerPaddingY} min={0} max={18}
            step={1} unit="px" editable colorScheme="emerald" onChange={(v) => setParam('footerPaddingY', v)}
            isLight={isLight} />
        </div>
      </div>

      {/* Group 4: Resize Physics, Curved Corner Dragger & Min/Max Bounds */}
      <div className={`p-4 rounded-xl border flex flex-col gap-4 ${
        isLight ? 'bg-neutral-50/70 border-neutral-200/80' : 'bg-neutral-950/50 border-neutral-800' }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
            Stage 4 · Bottom-right arc scale handle geometry and physical boundary constraints (Curved Corner Dragger &amp; Bounds Physics)
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <ToggleSwitch checked={config.resizable} onCheckedChange={(v) => setParam('resizable', v)}
              label="Allow window resizing (Resizable)" variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={config.limitMaxSize} onCheckedChange={(v) => setParam('limitMaxSize', v)}
              label="Limit max size (Limit Max W×H)" variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={config.enableRightEdgeResize}
              onCheckedChange={(v) => setParam('enableRightEdgeResize', v)} label="Right edge unidirectional stretch (ew-resize)"
              variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={config.enableBottomEdgeResize}
              onCheckedChange={(v) => setParam('enableBottomEdgeResize', v)} label="Bottom edge unidirectional stretch (ns-resize)"
              variant="neutral" isLight={isLight} />
            <ToggleSwitch checked={config.showResizeHudOverlay}
              onCheckedChange={(v) => setParam('showResizeHudOverlay', v)} label="Show real-time dimensions while dragging HUD"
              variant="neutral" isLight={isLight} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-neutral-400">Bottom-right resize handle and hotspot strategy (resizeHandleStyle):</span>
          <SegmentedSwitch size="sm" isLight={isLight} value={config.resizeHandleStyle} onValueChange={(v) =>
            setParam('resizeHandleStyle', v as FloatingResizeHandleStyle) } options={[
            { value: 'corner-arc', label: 'Concentric arc (corner-arc · default)' },
            { value: 'corner-arc-dots', label: 'Concentric arc three-point (corner-arc-dots)' },
            { value: 'corner-double-arc', label: 'Double concentric arc (corner-double-arc)' },
            { value: 'corner-pill-arc', label: 'Capsule arc track (corner-pill-arc)' },
            { value: 'corner-dots', label: 'Right-angle triplet (corner-dots)' },
            { value: 'footer-carved-slot', label: 'Bottom bar right-side slot' }, ]} />
        </div>

        {/* Curved Corner Dragger Fine-Tuning Controls */}
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3 ${ isLight
          ? 'bg-amber-50/40 border-amber-200/80' : 'bg-amber-500/5 border-amber-500/20' }`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-500">Bottom-right concentric arc Dragger Geometry Fine-tune (Concentric Corner Arc Geometry)</span>
            <div className="flex items-center gap-3 flex-wrap">
              <ToggleSwitch checked={config.cornerArcConcentric}
                onCheckedChange={(v) => setParam('cornerArcConcentric', v)}
                label={`Automatic concentric with outer radius (R = ${config.outerRadius} - ${config.cornerArcInset} = ${Math.max(3, config.outerRadius - config.cornerArcInset)}px)`}
                variant="neutral" isLight={isLight} />
              <SegmentedSwitch size="sm" isLight={isLight} value={config.cornerArcColorMode} onValueChange={(v) =>
                setParam('cornerArcColorMode', v as FloatingCornerArcColorMode) } options={[
                { value: 'neutral', label: 'Idle Neutral Gray (Hover Illuminate)' }, { value: 'amber', label: 'Amber Gold (Amber)' },
                { value: 'sky', label: 'Sky Blue (Sky)' }, { value: 'emerald', label: 'Emerald Green (Emerald)' }, ]} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SliderControl label="Bottom-right inset margin (cornerArcInset)" value={config.cornerArcInset} min={1.5} max={10}
              step={0.5} unit="px" editable colorScheme="amber" onChange={(v) => setParam('cornerArcInset', v)}
              isLight={isLight} />
            <SliderControl label="Arc angle span (cornerArcSweepDeg)" value={config.cornerArcSweepDeg} min={32} max={88}
              step={2} unit="°" editable colorScheme="sky" onChange={(v) => setParam('cornerArcSweepDeg', v)}
              isLight={isLight} />
            <SliderControl label="Arc Line Width/Point Diameter (cornerArcStrokeWidth)" value={config.cornerArcStrokeWidth} min={1.4}
              max={4.2} step={0.1} unit="px" editable colorScheme="emerald"
              onChange={(v) => setParam('cornerArcStrokeWidth', v)} isLight={isLight} />
            <SliderControl label="Idle Opacity (cornerArcIdleOpacity)" value={config.cornerArcIdleOpacity} min={20}
              max={100} step={5} unit="%" editable colorScheme="amber"
              onChange={(v) => setParam('cornerArcIdleOpacity', v)} isLight={isLight} />
          </div>

          {!config.cornerArcConcentric && (
            <div className="max-w-xs">
              <SliderControl label="Manual Arc Radius (cornerArcRadius)" value={config.cornerArcRadius} min={4} max={24}
                step={1} unit="px" editable colorScheme="amber" onChange={(v) => setParam('cornerArcRadius', v)}
                isLight={isLight} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SliderControl label="Min Width (minWidth)" value={config.minWidth} min={220} max={480} step={10} unit="px"
            editable colorScheme="amber" onChange={(v) => setParam('minWidth', v)} isLight={isLight} />
          <SliderControl label="Min Height (minHeight)" value={config.minHeight} min={140} max={360} step={10} unit="px"
            editable colorScheme="amber" onChange={(v) => setParam('minHeight', v)} isLight={isLight} />
          {config.limitMaxSize ? (
            <>
              <SliderControl label="Max Width (maxWidth)" value={config.maxWidth} min={520} max={1400} step={20}
                unit="px" editable colorScheme="sky" onChange={(v) => setParam('maxWidth', v)} isLight={isLight} />
              <SliderControl label="Max Height (maxHeight)" value={config.maxHeight} min={360} max={1000} step={20}
                unit="px" editable colorScheme="emerald" onChange={(v) => setParam('maxHeight', v)}
                isLight={isLight} />
            </>
          ) : (
            <div className={`sm:col-span-2 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              isLight ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' }`}>
              <div>
                <div className="font-bold">Max width/height limit removed (Unrestricted Max W×H)</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Dragging the bottom-right arc handle is restricted only by minimum dimensions ({config.minWidth}×{config.minHeight}px) Protect, No longer clamp max width/height. 
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                isLight={isLight}
                onClick={() => setParam('limitMaxSize', true)}
              >
                Enable Max Clamp
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
