import React from 'react';
import { ShieldCheck, MoveDiagonal2, ArrowRight, Layers, } from 'lucide-react';
import {
  useFloatingThreeStageStore, type FloatingShellVariant, type FloatingHeaderLeftSlotMode, type FloatingResizeHandleStyle,
} from '../../../ui-core/stores/floatingThreeStageStore';
import { CornerCurvedDragger } from '../../../ui-core/navigation/FloatingThreeStageWindow';
import { resolvePanelHeaderBackBtnGeometry } from '../../../ui-core/stores/menuLayoutStore';
import { Button } from '../../../ui-core/primitives/Button';
import { Badge } from '../../../ui-core/primitives/Badge';
import { ToggleSwitch } from '../../../ui-core/primitives/ToggleSwitch';

export const FloatingWindowCornerDraggerStrip: React.FC<{ isLight: boolean }> = ({
  isLight,
}) => {
  const config = useFloatingThreeStageStore();
  const { setParam, updateParams } = config;

  return (
    <div className={`p-3.5 rounded-xl border flex flex-col gap-3 ${ isLight ? 'bg-amber-50/35 border-amber-200/80'
      : 'bg-amber-500/5 border-amber-500/20' }`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MoveDiagonal2 className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-bold">Bottom-right arc resize handle variant macro comparison (Bottom-Right Curved Corner Dragger Variations)</span>
          <span className="text-[11px] font-mono text-neutral-400">
            R_outer={config.outerRadius}px · R_arc=
            {config.cornerArcConcentric
              ? Math.max(3, config.outerRadius - config.cornerArcInset)
              : config.cornerArcRadius}
            px · Opening Angle={config.cornerArcSweepDeg}°
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ToggleSwitch checked={config.limitMaxSize} onCheckedChange={(v) => setParam('limitMaxSize', v)} label={
            config.limitMaxSize ? `Limit max size (${config.maxWidth}×${config.maxHeight}px)` : 'No max width/height limit (Infinite free zoom enabled)' }
            variant="neutral" isLight={isLight} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {(
          [
            { id: 'corner-arc' as FloatingResizeHandleStyle, title: 'Concentric arc (Corner Arc)',
              badge: 'default recommendation', desc: 'Along Bottom-Right 16px Draw a smooth arc handle concentrically inside the rounded corner, Naturally fits rounded corners' },
            { id: 'corner-arc-dots' as FloatingResizeHandleStyle, title: '3-Point Arc (Arc 3-Dots)',
              badge: '3-Point Arcing', desc: 'Replace the rigid right-angle three-dot icon with three dots arranged in an arc along the bottom-right corner' },
            { id: 'corner-double-arc' as FloatingResizeHandleStyle, title: 'Double concentric arc (Double Arc)',
              badge: 'Dual-Track Scale', desc: 'Outer Arc + Inner arc dual-layer concentric grip, Enhance precision instrument control with drag-to-resize' },
            { id: 'corner-pill-arc' as FloatingResizeHandleStyle, title: 'Capsule arc track (Pill Arc)',
              badge: 'High Prominence', desc: 'Concentric arc handle with soft capsule-shaped track backing, High visibility in both light and dark themes' },
            { id: 'corner-dots' as FloatingResizeHandleStyle, title: 'Right-angle triplet (Right-Angle)',
              badge: 'Original Comparison', desc: 'Bottom-right corner of previous version L Right-angle three-dot array, Compatible With Left 4 Arc grip direct comparison' },
          ] as const
        ).map((item) => {
          const isSelected = config.resizeHandleStyle === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                updateParams({
                  resizable: true,
                  resizeHandleStyle: item.id,
                  showFooter: true,
                  footerRightSlotMode: 'none',
                })
              }
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                isSelected
                  ? isLight
                    ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-2xs'
                    : 'bg-neutral-900 border-amber-500 ring-2 ring-amber-500/25'
                  : isLight
                  ? 'bg-white/80 hover:bg-white border-neutral-200/90'
                  : 'bg-neutral-950/70 hover:bg-neutral-900 border-neutral-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs">{item.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${ isSelected
                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                    : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20' }`}>
                    {item.badge}
                  </span>
                </div>
                <p className={`text-[11px] leading-snug ${ isLight ? 'text-neutral-600' : 'text-neutral-400' }`}>
                  {item.desc}
                </p>
              </div>

              {/* 1:1 & 1.6x Magnified Corner Preview */}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800/80">
                <span className="text-[10px] font-mono text-neutral-400">1:1 &amp; 1.6× Preview</span>
                <div className="flex items-center gap-1.5">
                  <div title="1:1 Original size bottom-right rounded preview"
                    className={`relative w-11 h-7 border-b border-r overflow-hidden flex items-end justify-end ${
                    isSelected ? 'border-amber-500' : isLight ? 'border-neutral-300 bg-neutral-50'
                    : 'border-neutral-700 bg-neutral-900' }`} style={{
                    borderBottomRightRadius: `${config.outerRadius}px`, }}>
                    <CornerCurvedDragger
                      styleVariant={item.id}
                      outerRadius={config.outerRadius}
                      concentric={config.cornerArcConcentric}
                      arcRadius={config.cornerArcRadius}
                      inset={config.cornerArcInset}
                      sweepDeg={config.cornerArcSweepDeg}
                      strokeWidth={config.cornerArcStrokeWidth}
                      idleOpacity={Math.max(config.cornerArcIdleOpacity, 75)}
                      colorMode={isSelected ? 'amber' : config.cornerArcColorMode}
                      isLight={isLight}
                      isActiveOrHovered={isSelected}
                    />
                  </div>

                  <div title="1.6× Macro zoom for bottom-right corner preview"
                    className={`relative w-12 h-8 border-b-2 border-r-2 overflow-hidden flex items-end justify-end ${
                    isSelected ? 'border-amber-500' : isLight ? 'border-neutral-300 bg-neutral-50'
                    : 'border-neutral-700 bg-neutral-900' }`} style={{
                    borderBottomRightRadius: `${Math.round(config.outerRadius * 1.5)}px`, }}>
                    <div style={{ transform: 'scale(1.5)', transformOrigin: 'bottom right', }}
                      className="w-6 h-6 flex items-end justify-end">
                      <CornerCurvedDragger
                        styleVariant={item.id}
                        outerRadius={config.outerRadius}
                        concentric={config.cornerArcConcentric}
                        arcRadius={config.cornerArcRadius}
                        inset={config.cornerArcInset}
                        sweepDeg={config.cornerArcSweepDeg}
                        strokeWidth={config.cornerArcStrokeWidth}
                        idleOpacity={90}
                        colorMode={isSelected ? 'amber' : config.cornerArcColorMode}
                        isLight={isLight}
                        isActiveOrHovered={isSelected}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const FloatingWindowCapabilityMatrixSection: React.FC<{ isLight: boolean }> = ({
  isLight,
}) => {
  const config = useFloatingThreeStageStore();
  const { setParam, updateParams } = config;

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
    <section id="fw-3stage-6d-2-matrix" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
      isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
            6D+.2
          </span>
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <h2 className="text-base font-bold">
            L2 3-Stage Combiner Import Floating Window Support and adaptation matrix (Capability &amp; Resize Coexistence Audit)
          </h2>
        </div>
        <span className="text-xs font-mono text-neutral-400">Click the bottom-right button of any card to display above 6D+.1 Experience this mechanism directly on canvas</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Stage 3 Footer + Hover Description */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm" isLight={isLight}>
                100% Native support · Stage 3 Footer
              </Badge>
              <span className="text-[11px] font-mono text-emerald-500 font-bold">Idle Gray ⇄ Hover High-Contrast</span>
            </div>
            <h3 className="font-bold text-xs mt-1">1. Bottom info bar and hover linkage (PanelFooter Hover Linkage)</h3>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Display gray default window description when idle (<code>defaultDescription</code>) ; Mouse hover over any slider in the floating window, When row or top bar button, Bottom bar immediately highlights detailed parameter explanations for the control (<code>hoveredDescription</code>) , Solves the issue of long descriptions not fitting in compact floating windows. 
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            isLight={isLight}
            onClick={() =>
              updateParams({
                variant: 'three-stage-split-footer-grip',
                showFooter: true,
                footerHoverLinkage: true,
              })
            }
          >
            Active Footer Hover link <ArrowRight className="h-3 w-3 ml-1 inline" />
          </Button>
        </div>

        {/* Card 2: Resize + Footer Coexistence (3 Solutions) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
          isLight ? 'bg-amber-50/40 border-amber-300/80' : 'bg-amber-500/5 border-amber-500/30' }`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm" isLight={isLight}>
                Core Breakthrough · Resize × Footer Coexist
              </Badge>
              <MoveDiagonal2 className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <h3 className="font-bold text-xs mt-1">2. Footer With bottom-right Resize Controller conflict resolution? </h3>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Classic Bottom-Right 16×16 Floating badge prone to occlusion Footer Right-Side Text. We verified three zero-conflict schemes: 
              <br />• <strong>scheme A (recommended)</strong>: Utilize <code>PanelFooter</code> Right-side independent partition (<code>border-l</code>) Engraving Exclusive <code>W×H + ◢</code> Drag Handle; 
              <br />• <strong>scheme B</strong>: Right Edge Resize (<code>ew-resize</code>) + Bottom Edge Resize (<code>ns-resize</code>) + Bottom-right diagonal resize; 
              <br />• <strong>scheme C</strong>: Classic bottom-right dot badge + Footer Automatic right-side padding. 
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() =>
                updateParams({
                  showFooter: true,
                  footerRightSlotMode: 'carved-resize-grip',
                  resizeHandleStyle: 'both-slot-and-edges',
                })
              }
              className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500 text-neutral-950 cursor-pointer"
            >
              Trial Scheme A (Engraved Slot)
            </button>
            <button
              type="button"
              onClick={() =>
                updateParams({
                  showFooter: true,
                  footerRightSlotMode: 'live-dimensions',
                  resizeHandleStyle: 'invisible-edges-and-corner',
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              Trial Scheme B (Invisible Edge)
            </button>
            <button
              type="button"
              onClick={() =>
                updateParams({
                  showFooter: true,
                  footerRightSlotMode: 'none',
                  resizeHandleStyle: 'corner-dots',
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              Trial Scheme C (Classic Badge)
            </button>
          </div>
        </div>

        {/* Card 3: Stage 1 Header Carved Buttons & Dragging */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm" isLight={isLight}>
                100% Compatible · Stage 1 Header
              </Badge>
              <span className="text-[11px] font-mono text-sky-500 font-bold">R={btnGeom.radiusSummary}</span>
            </div>
            <h3 className="font-bold text-xs mt-1">3. L2 Top bar geometry (Edge Divider / concentric outer corner) + Drag to Move</h3>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Direct Reuse L2 <code>resolvePanelHeaderBackBtnGeometry</code>: Top-right Minimize Button Supported <code>0x0 Edge Divider (42x32)</code> or <code>Outer corner concentric inset (30×26)</code>, The entire top bar, excluding buttons, supports zero-latency mouse dragging. 
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                updateParams({
                  headerPaddingX: 0,
                  headerPaddingY: 0,
                  headerBtnWidth: 42,
                  headerBtnHeight: 32,
                  headerBtnRadiusMode: 'asymmetric-tl',
                  headerBtnInnerRadius: 0,
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              Edge Split (42×32)
            </button>
            <button
              type="button"
              onClick={() =>
                updateParams({
                  headerPaddingX: 6,
                  headerPaddingY: 6,
                  headerBtnWidth: 30,
                  headerBtnHeight: 26,
                  headerBtnRadiusMode: 'asymmetric-tl',
                  headerBtnInnerRadius: 6,
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                isLight ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              Embedded Concentric (30×26)
            </button>
          </div>
        </div>

        {/* Card 4: Left Back Button vs Category Icon */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="info" size="sm" isLight={isLight}>
                Crop on Demand · Left Slot Strategy
              </Badge>
              <span className="text-[11px] font-mono text-neutral-400">Icon / Back / None</span>
            </div>
            <h3 className="font-bold text-xs mt-1">4. What Does Not Need Forced Imitation? -- Left Back Button</h3>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              L2 Modal menu must have left side <code>Back</code> Key to return to previous menu; While most tiled styles Floating Window None"Back to Parent", Left slot default changed to <strong>Category Icon (`category-icon`)</strong> or <strong>Empty (`none`)</strong>, Enabled only in complex floating windows containing secondary sub-pages <code>back-button</code>. 
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {(['category-icon', 'back-button', 'none'] as FloatingHeaderLeftSlotMode[]).map(
              (m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setParam('headerLeftSlotMode', m)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                    config.headerLeftSlotMode === m
                      ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                      : isLight
                      ? 'bg-white border-neutral-300'
                      : 'bg-neutral-900 border-neutral-700'
                  }`}
                >
                  {m}
                </button>
              )
            )}
          </div>
        </div>

        {/* Card 5: Stage 2 Scrollable vs Auto-Fit Height */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm" isLight={isLight}>
                Dual-Mode Toggle · Stage 2 Sizing
              </Badge>
              <span className="text-[11px] font-mono text-emerald-500 font-bold">Scroll-Y vs Auto-Fit</span>
            </div>
            <h3 className="font-bold text-xs mt-1">5. Free Height Scroll (`scroll-y`) vs Fit Content Height (`auto-fit-height`)</h3>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              • <code>scroll-y</code>: Freely resizable width and height, When Window Shrinks Stage 2 Content area automatically displays independent scrollbar, Footer Fixed rivet at bottom edge; 
              <br />• <code>auto-fit-height</code>: Resizable Width, Auto Height Tab Toggle auto-fit content height (Subject To <code>minHeight/maxHeight</code> Protect) . 
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setParam('contentOverflowMode', 'scroll-y')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                config.contentOverflowMode === 'scroll-y'
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                  : isLight
                  ? 'bg-white border-neutral-300'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              scroll-y (2D Free Resize)
            </button>
            <button
              type="button"
              onClick={() => setParam('contentOverflowMode', 'auto-fit-height')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                config.contentOverflowMode === 'auto-fit-height'
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                  : isLight
                  ? 'bg-white border-neutral-300'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              auto-fit-height (Adaptive Height)
            </button>
          </div>
        </div>

        {/* Card 6: Top-Right Action Adaptation (Live Preview -> Stack Minimize) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
          isLight ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="info" size="sm" isLight={isLight}>
                Semantic Mapping · Top-Right Action
              </Badge>
              <span className="text-[11px] font-mono text-sky-500 font-bold">Minimize to Stack</span>
            </div>
            <h3 className="font-bold text-xs mt-1">6. Top-right button semantic mapping: from Live Preview To Stack Collapse</h3>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
              L2 The top-right button of the menu collapses the modal panel to the side <code>Live Preview [TAB]</code>; Whereas Floating Window in, The same top-right concentric split slot maps naturally to<strong>Three-stage collapse to top-right corner Floating Stack Icon</strong>, Optional Add-on <code>Pin (Pin to Top)</code>. 
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                updateParams({
                  headerRightActionMode: 'minimize-only',
                  headerBtnExpandOnHover: true,
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                config.headerRightActionMode === 'minimize-only' && config.headerBtnExpandOnHover
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                  : isLight
                  ? 'bg-white border-neutral-300'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              Trial Hover expand STACK
            </button>
            <button
              type="button"
              onClick={() =>
                updateParams({
                  headerRightActionMode: 'minimize-and-pin',
                })
              }
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border cursor-pointer ${
                config.headerRightActionMode === 'minimize-and-pin'
                  ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold'
                  : isLight
                  ? 'bg-white border-neutral-300'
                  : 'bg-neutral-900 border-neutral-700'
              }`}
            >
              Trial Pin + Minimize Dual Button
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FloatingWindowShootoutSection: React.FC<{ isLight: boolean }> = ({ isLight }) => {
  const config = useFloatingThreeStageStore();
  const { applyPreset } = config;

  return (
    <section id="fw-3stage-6d-4-shootout" className={`scroll-mt-6 p-6 rounded-2xl border flex flex-col gap-5 ${
      isLight ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800' }`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-rose-500/15 text-rose-500 border border-rose-500/30">
            6D+.4
          </span>
          <Layers className="h-4 w-4 text-rose-500" />
          <h2 className="text-base font-bold">
            Three types of floating window shell structures side-by-side (Classic 6D vs 2-Stage L2 Header vs 3-Stage Full Combiner)
          </h2>
        </div>
        <span className="text-xs font-mono text-neutral-400">Intuitive comparison why 3-Stage Combiner + Footer Sculpted slots eliminate visual fragmentation at top-right and bottom-right corners</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {(
          [
            {
              code: 'A · Classic 6D Baseline',
              title: 'Current 6D Floating Window Shell',
              variant: 'classic-6d-baseline' as FloatingShellVariant,
              points: [
                'Header: Left-Aligned Icon+Title, right 20×20 Small Minus Button',
                'Content: Wrap Content, No Uniformity Stage 2 Optical padding contract',
                'Footer: No Bottom Bar, Control missing hover context description area',
                'Resize: Bottom-right floating three-dot badge, Occasional overlap with bottom content',
              ],
              presetId: 'var-classic-6d-baseline',
            },
            {
              code: 'B · 2-Stage L2 Header',
              title: 'L2 top bar + Elastic Content (none Footer)',
              variant: 'two-stage-l2-header' as FloatingShellVariant,
              points: [
                'Header: Upgrade To L2 Centered uppercase title + 42×32 Edge-aligned single divider button',
                'Content: Inherit L2 bodyPaddingX/Y, Internal Scrolling',
                'Footer: Remove Bottom Bar, Allocate full vertical height to high-frequency telemetry charts',
                'Resize: Right/Bottom Invisible Edge + Bottom-right dot matrix handle',
              ],
              presetId: 'var-two-stage-l2-header',
            },
            {
              code: 'C · 3-Stage Full Combiner (recommended)',
              title: 'Full 3-Stage + Footer Engrave Resize Slot',
              variant: 'three-stage-split-footer-grip' as FloatingShellVariant,
              points: [
                'Header: L2 Standard Center Title + Left Category Icon/Back + Right Concentric Minimize',
                'Content: flex-1 min-h-0 Independent Scroll, Prevent bottom bar overflow',
                'Footer: left Idle Gray Text / Hover Highlight Description, and L2–L4 menu 100% Uniform',
                'Resize: Right-side split pane exclusive container W×H + ◢ Handle, Eliminate badge occlusion! ',
              ],
              presetId: 'var-b-split-footer-grip',
            },
          ] as const
        ).map((col) => {
          const isSelected = config.variant === col.variant;
          return (
            <div key={col.code} className={`p-4 rounded-xl border flex flex-col justify-between gap-4 ${ isSelected
              ? isLight ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/25' : isLight
              ? 'bg-neutral-50/70 border-neutral-200' : 'bg-neutral-950/60 border-neutral-800' }`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    {col.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => applyPreset(col.presetId)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950'
                        : isLight
                        ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                        : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {isSelected ? 'Currently used by canvas' : 'Load on top canvas'}
                  </button>
                </div>
                <h3 className="font-bold text-sm">{col.title}</h3>
                <ul className={`text-xs space-y-1.5 list-disc list-inside ${
                  isLight ? 'text-neutral-600' : 'text-neutral-400' }`}>
                  {col.points.map((pt) => (
                    <li key={pt} className="leading-relaxed">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
