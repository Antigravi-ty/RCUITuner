import React, { useEffect } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:edge-inspector');
import { PanelRightClose, PanelLeftClose, RotateCcw, Check, Maximize2, Compass, Ruler, LogOut, } from 'lucide-react';
import { EdgeInspectorDrawer, type EdgeDrawerSide } from '../../ui-core/navigation/EdgeInspectorDrawer';
import { MenuDivider } from '../../ui-core/layout/MenuContainer';
import { MenuItem } from '../../ui-core/compounds/MenuItem';
import {
  Layer5StaticTrainingPackEditRecipe, openStaticTrainingExitConfirmDialogue,
} from '../../ui-core/recipes/Layer5StaticTrainingPackEditRecipe';
import { Layer1MainMenuRecipe } from '../../ui-core/recipes/Layer1MainMenuRecipe';
import { Layer2PlayRecipe } from '../../ui-core/recipes/Layer2PlayRecipe';
import { Layer2GarageRecipe } from '../../ui-core/recipes/Layer2GarageRecipe';
import { Layer2SettingsRecipe } from '../../ui-core/recipes/Layer2SettingsRecipe';
import {
  INITIAL_TRAINING_SHOTS, type EditSubMode, type StaticTrainingShotItem,
} from '../../ui-core/recipes/static-training/staticTrainingTypes';
import { StaticTrainingPackHUD } from '../../ui-core/hud/StaticTrainingPackHUD';
import { CircularBoostGauge } from '../../ui-core/hud/CircularBoostGauge';
import { VelocityProgressBar } from '../../ui-core/hud/VelocityProgressBar';
import { ArenaBackdrop } from '../ArenaBackdrop';
import { SliderControl } from '../../ui-core/primitives/SliderControl';
import { SegmentedSwitch } from '../../ui-core/primitives/SegmentedSwitch';
import { Badge } from '../../ui-core/primitives/Badge';
import { Button } from '../../ui-core/primitives/Button';
import { KeycapBadge } from '../../ui-core/primitives/KeycapBadge';
import { useDialogueStack } from '../../ui-core/compounds/dialogue/dialogueStore';
import { CodeBlock } from '../CodeBlock';

export interface EdgeInspectorSimulationPageProps {
  isLight?: boolean;
}

export type ActiveEscMenuRoute = 'none' | 'main-menu' | 'play' | 'garage' | 'settings';

/**
 * [L6 Pattern Showcase] 6E · Edge Inspector Side hover inspection drawer + Collapsible numbered track list (Static Training Pack Editor)
 *
 * Demonstrates:
 * 1. Two Orthogonal & Decoupled Systems (`[TAB]` Edge Inspector vs. `[ESC]` Main Menu):
 *    - Unlike `LivePreviewDock` (which belongs to a Layer 3 Settings sub-panel), `EdgeInspectorDrawer` is an independent
 *      in-game 3D inspector suite (`z-30`) controlled exclusively by `[TAB]`.
 *    - Pressing `[ESC]` toggles the independent `Main Menu` (`z-50`) in the center of the stage without mutating or coupling
 *      with the `EdgeInspectorDrawer` state.
 *    - Exiting Edit Mode is performed via the `ESC` Main Menu (`Exit Edit Mode`), so the Edge Inspector top-right header
 *      only needs a single `Collapse [TAB]` button.
 * 2. Decoupled `CollapsibleNumberedRailList` + `Layer5StaticTrainingPackEditRecipe`:
 *    - Clicking any shot item compresses the list container horizontally from right to left into a narrow `60px` `#01..#99` rail.
 *    - The 4 top buttons (`New Shot` on left + right-aligned `Duplicate`, `Import .JSON`, `Show Help`) smoothly morph into a compact
 *      black `+` (New Shot) on the left and orange `?` (Show Help) on the right of Row 1 without mount/unmount flicker.
 */
export const EdgeInspectorSimulationPage: React.FC<EdgeInspectorSimulationPageProps> = ({
  isLight = false,
}) => {
  const [isDrawerExpanded, setIsDrawerExpanded] = useState<boolean>(true);
  const [escMenuRoute, setEscMenuRoute] = useState<ActiveEscMenuRoute>('none');
  const [drawerSide, setDrawerSide] = useState<EdgeDrawerSide>('right');
  const [expandedWidth, setExpandedWidth] = useState<number>(520);
  const [collapsedWidth, setCollapsedWidth] = useState<number>(88);
  const [topOffset, setTopOffset] = useState<number>(72);
  const [bottomOffset, setBottomOffset] = useState<number>(184);

  const [shots, setShots] = useState<StaticTrainingShotItem[]>(INITIAL_TRAINING_SHOTS);
  const [selectedShotIndex, setSelectedShotIndex] = useState<number>(0);
  const [isInspectingShot, setIsInspectingShot] = useState<boolean>(false);
  const [editSubMode, setEditSubMode] = useState<EditSubMode>('car-heading');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const { stack: dialogueStack } = useDialogueStack();

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2600);
  };

  const safeIndex = Math.max(0, Math.min(Math.max(0, shots.length - 1), selectedShotIndex));
  const activeShot = shots[safeIndex] || shots[0];
  const isEscMenuOpen = escMenuRoute !== 'none';

  // Keyboard shortcuts:
  // - [ESC]: Toggle Main Menu (or navigate back from Layer 2 to Layer 1 Main Menu) when no modal Dialogue is open
  // - [9] / [0]: Cycle 3D Edit Sub-Mode when Main Menu is closed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (dialogueStack.length > 0) return;
        e.preventDefault();
        if (escMenuRoute === 'none') {
          setEscMenuRoute('main-menu');
          showToast('ESC: Call independent main menu (Main Menu)');
        } else if (escMenuRoute === 'main-menu') {
          setEscMenuRoute('none');
          showToast('ESC: Close Main Menu, Back 3D Edit scene');
        } else {
          setEscMenuRoute('main-menu');
        }
        return;
      }

      if (!isEscMenuOpen && (e.key === '9' || e.key === '0')) {
        e.preventDefault();
        const delta = e.key === '0' ? 1 : -1;
        const speedFollowsHeading = activeShot?.car.speedFollowsHeading !== false;
        const order: EditSubMode[] = speedFollowsHeading
          ? ['car-heading', 'ball-speed', 'free-cam']
          : ['car-heading', 'car-speed', 'ball-speed', 'free-cam'];
        const curIdx = Math.max(0, order.indexOf(editSubMode));
        const nextMode = order[(curIdx + delta + order.length) % order.length];
        setEditSubMode(nextMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeShot, editSubMode, escMenuRoute, isEscMenuOpen, dialogueStack.length]);

  const handleResetParams = () => {
    setDrawerSide('right');
    setExpandedWidth(520);
    setCollapsedWidth(88);
    setTopOffset(72);
    setBottomOffset(184);
    setIsDrawerExpanded(true);
    setEscMenuRoute('none');
    showToast('[ok] Reset EdgeInspectorDrawer Default geometry and offset parameters');
  };

  const handleExportLayoutSnapshot = async () => {
    const stageEl = document.getElementById('edge-inspector-simulation-stage');
    if (!stageEl) return;

    const r1 = (n: number) => Math.round(n * 10) / 10;
    const fmtRect = (r: DOMRect) =>
      `${r1(r.width)}px × ${r1(r.height)}px (x: ${r1(r.x)}, y: ${r1(r.y)})`;
    const fmtPad = (cs: CSSStyleDeclaration) =>
      `top=${cs.paddingTop} right=${cs.paddingRight} bottom=${cs.paddingBottom} left=${cs.paddingLeft}`;

    const drawerEl = stageEl.querySelector<HTMLElement>('[data-ui-element="edge-inspector-drawer"]');
    const headerEl = stageEl.querySelector<HTMLElement>('[data-ui-element="panel-header"]');
    const contentEl = stageEl.querySelector<HTMLElement>('[data-ui-element="panel-content"]');
    const footerEl = stageEl.querySelector<HTMLElement>('[data-ui-element="panel-footer"]');
    const railContainerEl = stageEl.querySelector<HTMLElement>('[data-rail-section="left-container"]');
    const topToolbarEl = stageEl.querySelector<HTMLElement>('[data-rail-section="top-toolbar"]');
    const plusBtnEl = stageEl.querySelector<HTMLElement>('[data-rail-button="new-shot"]');
    const helpBtnEl = stageEl.querySelector<HTMLElement>('[data-rail-button="show-help"]');
    const scrollListEl = stageEl.querySelector<HTMLElement>('[data-rail-section="scroll-list"]');
    const firstItemEl = stageEl.querySelector<HTMLElement>('[data-rail-item="0"]');
    const firstBadgeEl = stageEl.querySelector<HTMLElement>('[data-rail-badge="0"]');
    const detailWrapperEl = stageEl.querySelector<HTMLElement>('[data-rail-section="detail-wrapper"]');
    const detailScrollEl = stageEl.querySelector<HTMLElement>('[data-rail-section="detail-scroll"]');

    const lines: string[] = [];
    lines.push('========================================================================');
    lines.push(
      ` [EDGE INSPECTOR SNAPSHOT] STATE: [DRAWER=${isDrawerExpanded ? 'EXPANDED' : 'COLLAPSED'}] [VIEW=${isInspectingShot ? 'RAIL_EDIT_SHOT' : 'FULL_SHOT_LIST'}]`
    );
    lines.push('========================================================================');

    if (drawerEl) {
      const dRect = drawerEl.getBoundingClientRect();
      const dCs = window.getComputedStyle(drawerEl);
      lines.push('\n[1. EDGE INSPECTOR DRAWER (OUTER SHELL)]');
      lines.push(`  • Size:          ${fmtRect(dRect)}`);
      lines.push(`  • Side / ZIndex: side=${drawerSide} | zIndex=${dCs.zIndex}`);
      lines.push(`  • Offsets:       topOffset=${topOffset}px | bottomOffset=${bottomOffset}px`);
    }

    if (headerEl) {
      const hRect = headerEl.getBoundingClientRect();
      const hCs = window.getComputedStyle(headerEl);
      const collapseBtn = headerEl.querySelector<HTMLButtonElement>('[data-header-button="collapse-tab"]');
      lines.push('\n[2. PANEL HEADER]');
      lines.push(`  • Size:          ${fmtRect(hRect)}`);
      lines.push(`  • Padding:       ${fmtPad(hCs)}`);
      if (collapseBtn) {
        const cbRect = collapseBtn.getBoundingClientRect();
        const topGap = r1(cbRect.top - hRect.top);
        const rightGap = r1(hRect.right - cbRect.right);
        const bottomGap = r1(hRect.bottom - cbRect.bottom);
        lines.push(
          `  • Collapse Btn:  ${fmtRect(cbRect)} | Header Insets: top=${topGap}px right=${rightGap}px bottom=${bottomGap}px`
        );
        const tabKbd = collapseBtn.querySelector<HTMLElement>('[data-component="keycap-badge"]');
        if (tabKbd) {
          const kRect = tabKbd.getBoundingClientRect();
          const kTop = r1(kRect.top - cbRect.top);
          const kRight = r1(cbRect.right - kRect.right);
          const kBottom = r1(cbRect.bottom - kRect.bottom);
          lines.push(
            `  • TAB Keycap:    ${fmtRect(kRect)} | 3-Side Gap (Btn Border -> TAB Border): top=${kTop}px right=${kRight}px bottom=${kBottom}px`
          );
        }
      }
    }

    if (contentEl && drawerEl) {
      const cRect = contentEl.getBoundingClientRect();
      const dRect = drawerEl.getBoundingClientRect();
      const cCs = window.getComputedStyle(contentEl);
      lines.push('\n[3. PANEL CONTENT]');
      lines.push(`  • Size:          ${fmtRect(cRect)}`);
      lines.push(`  • Padding:       ${fmtPad(cCs)}`);
      if (railContainerEl) {
        const rRect = railContainerEl.getBoundingClientRect();
        const leftOuterGap = r1(rRect.left - dRect.left);
        const rightTargetEl = isInspectingShot && detailWrapperEl ? detailWrapperEl : railContainerEl;
        const rtRect = rightTargetEl.getBoundingClientRect();
        const rightOuterGap = r1(dRect.right - rtRect.right);
        lines.push(
          `  • Outer Insets:  leftEdgeToContent=${leftOuterGap}px | rightContentToRightEdge=${rightOuterGap}px`
        );
      }
    }

    if (railContainerEl) {
      const rRect = railContainerEl.getBoundingClientRect();
      lines.push('\n[4. LEFT RAIL / SHOT LIST CONTAINER]');
      lines.push(`  • Container:     ${fmtRect(rRect)}`);
      if (scrollListEl) {
        lines.push(
          `  • Scroll List:   clientWidth=${scrollListEl.clientWidth}px | offsetWidth=${scrollListEl.offsetWidth}px | scrollbarWidth=${scrollListEl.offsetWidth - scrollListEl.clientWidth}px`
        );
      }
      if (topToolbarEl && plusBtnEl && helpBtnEl) {
        const tRect = topToolbarEl.getBoundingClientRect();
        const pRect = plusBtnEl.getBoundingClientRect();
        const qRect = helpBtnEl.getBoundingClientRect();
        const pCs = window.getComputedStyle(plusBtnEl);
        const qCs = window.getComputedStyle(helpBtnEl);
        lines.push(
          `  • Row 1 Toolbar: ${fmtRect(tRect)} | Left(+)=${r1(pRect.width)}×${r1(pRect.height)}px (padX=${pCs.paddingLeft}/${pCs.paddingRight}) | Right(?)=${r1(qRect.width)}×${r1(qRect.height)}px (padX=${qCs.paddingLeft}/${qCs.paddingRight}) | Gap=${r1(qRect.left - pRect.right)}px`
        );
        lines.push(
          `  • Row 1 Align:   leftInset=${r1(pRect.left - rRect.left)}px | rightInset=${r1(rRect.right - qRect.right)}px`
        );
      }
      if (firstItemEl && firstBadgeEl) {
        const cardRect = firstItemEl.getBoundingClientRect();
        const badgeRect = firstBadgeEl.getBoundingClientRect();
        const topGap = r1(badgeRect.top - cardRect.top);
        const bottomGap = r1(cardRect.bottom - badgeRect.bottom);
        const leftGap = r1(badgeRect.left - cardRect.left);
        const rightGap = r1(cardRect.right - badgeRect.right);
        lines.push(`  • Row #01 Card:  ${fmtRect(cardRect)}`);
        lines.push(`  • #01 Badge:     ${fmtRect(badgeRect)}`);
        lines.push(
          `  • #01 4-Side Gap (Card Border -> Badge Border): top=${topGap}px | right=${rightGap}px | bottom=${bottomGap}px | left=${leftGap}px`
        );
      }
    }

    if (detailWrapperEl && detailScrollEl) {
      const dwRect = detailWrapperEl.getBoundingClientRect();
      lines.push('\n[5. RIGHT DETAIL INSPECTOR PANE]');
      lines.push(`  • Wrapper Size:  ${fmtRect(dwRect)}`);
      lines.push(
        `  • Detail Scroll: clientWidth=${detailScrollEl.clientWidth}px | offsetWidth=${detailScrollEl.offsetWidth}px | scrollbarWidth=${detailScrollEl.offsetWidth - detailScrollEl.clientWidth}px`
      );
    }

    if (footerEl) {
      const fRect = footerEl.getBoundingClientRect();
      lines.push(
        `\n[6. PANEL FOOTER] Size: ${fmtRect(fRect)} | Text: "${footerEl.textContent?.replace(/\s+/g, ' ').trim() || ''}"`
      );
    }

    lines.push('========================================================================\n');
    const report = lines.join('\n');
    console.log(report);
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(report);
        showToast('[ok] Preview layout properties exported to console and copied to clipboard');
      } catch (_) {
        showToast('[ok] Preview layout properties output to console');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
            {drawerSide === 'right' ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">6E · Edge Inspector Side hover inspection drawer</h1>
              <Badge variant="amber" size="sm" isLight={isLight}>
                Zero-Backdrop · Right/Left Offset
              </Badge>
              <Badge variant="primary" size="sm" isLight={isLight}>
                TAB Independent Management Drawer · ESC Independent Management Menu
              </Badge>
            </div>
            <p className={`text-xs mt-0.5 ${ isLight ? 'text-neutral-500' : 'text-neutral-400' }`}>
              Designed for <strong>Static Training Pack Edit Mode</strong> and other real-time 3D Scene construction. And regular centered{' '}
              <code className="font-mono">LivePreviewDock</code> (Belongs to Settings) Different, <strong>Edge Inspector Independent suite orthogonal to the main menu</strong>: 
              Keep only top-right <code className="font-mono">Collapse [TAB]</code>, Press <code className="font-mono">TAB</code> Independent control side inspection drawer, Press <code className="font-mono">ESC</code> Independent main menu call (Exit via main menu) . 
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button type="button" onClick={handleExportLayoutSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all active:scale-95 cursor-pointer bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 shadow-2xs"
            title="Print and copy current Edge Inspector Size of drawer and left numbering track, Padding, Four-side symmetry data">
            <Ruler className="h-3.5 w-3.5 text-amber-500" />
            <span>Export current preview layout data</span>
          </button>
          <Button size="sm" variant={isInspectingShot ? 'secondary' : 'primary'} isLight={isLight}
            onClick={() => setIsInspectingShot((v) => !v)} >
            {isInspectingShot ? 'Switch to full list state (Shot List)' : 'Switch to track view mode (Edit Shot)'} </Button> <Button size="sm"
            variant="outline" isLight={isLight} onClick={() => setIsDrawerExpanded((v) => !v)} >
            {isDrawerExpanded ? 'Store in edge pill [TAB]' : 'Expand side inspection panel [TAB]'} </Button> <Button size="sm"
            variant={isEscMenuOpen ? 'primary' : 'outline'} isLight={isLight} onClick={() =>
            setEscMenuRoute((prev) => (prev === 'none' ? 'main-menu' : 'none')) } >
            {isEscMenuOpen ? 'Close Main Menu [ESC]' : 'Open Main Menu [ESC]'} </Button> </div> </div>
            {/* 2. Co-located EdgeInspectorDrawer Geometry & Offset Tuner */} <div
            className={`p-4 rounded-2xl border flex flex-col gap-3.5 transition-colors ${ isLight
            ? 'bg-white border-neutral-200/90 shadow-2xs' : 'bg-neutral-900/70 border-neutral-800' }`} >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-200/70 dark:border-neutral-800">
            <div className="flex items-center gap-2 flex-wrap">
            <Maximize2 className="h-3.5 w-3.5 text-amber-500 shrink-0" /> <span className="text-xs font-bold">
            EdgeInspectorDrawer Geometry and HUD Avoidance parameter tuner </span>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            Bottom-right CircularBoostGauge Fixed size 148×148px (bottom: 20px, right: 24px) → default bottomOffset = 184px </span>
            </div> <div className="flex items-center gap-2"> {feedbackToast && (
            <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> {feedbackToast} </span> )} <Button size="sm" variant="ghost"
            isLight={isLight} icon={<RotateCcw className="h-3 w-3" />} onClick={handleResetParams} > Reset to Defaults
            </Button> </div> </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            {/* Dock Side Switcher */} <div className="flex flex-col gap-1"> <span
            className={`text-[11px] font-semibold ${ isLight ? 'text-neutral-600' : 'text-neutral-400' }`} >
            Dock to Edge (side) </span>
            <SegmentedSwitch value={drawerSide} onValueChange={(v) => setDrawerSide(v as EdgeDrawerSide)}
            isLight={isLight} options={[ { value: 'right', label: 'Right (Default Right)' },
            { value: 'left', label: 'Left (left)' }, ]} /> </div>
            <SliderControl label="Expanded Width (expandedW)" value={expandedWidth} min={440} max={620} step={10} unit="px"
            colorScheme="amber" onChange={setExpandedWidth} isLight={isLight} />
            <SliderControl label="Collapsed Width (collapsedW)" value={collapsedWidth} min={72} max={130} step={4} unit="px"
            colorScheme="amber" onChange={setCollapsedWidth} isLight={isLight} />
            <SliderControl label="Top Offset (topOffset)" value={topOffset} min={16} max={140} step={4} unit="px"
            colorScheme="sky" onChange={setTopOffset} isLight={isLight} />
            <SliderControl label="Bottom Offset (bottomOffset)" value={bottomOffset} min={24} max={240} step={4} unit="px"
            colorScheme="emerald" onChange={setBottomOffset} isLight={isLight} /> </div> </div>
            {/* 3. Interactive 3D Arena + HUD + EdgeInspectorDrawer + Independent ESC Main Menu Stage */} <div
            id="edge-inspector-simulation-stage"
            className="relative w-full h-[680px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl bg-black select-none"
            > {/* Live 3D Arena Backdrop (100% un-darkened even when EdgeInspectorDrawer is expanded!) */}
            <ArenaBackdrop preset={isLight ? 'daylight' : 'night'} brightness={isLight ? 82 : 38} />
            {/* Simulated 3D Car & Ball Aiming Gizmo Indicator in Center-Left of Arena */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pr-0 lg:pr-48">
            <div
            className={`px-4 py-3 rounded-2xl border backdrop-blur-md flex flex-col items-center gap-1.5 transition-all ${
            isLight ? 'bg-white/80 border-neutral-300 text-neutral-900 shadow-lg'
            : 'bg-neutral-950/75 border-neutral-800 text-neutral-100 shadow-xl' }`} >
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500">
            <Compass className="h-4 w-4 animate-spin" style={{ animationDuration: '9s' }} /> <span>
            [3D Arena Live Scene · Sub-Mode: {editSubMode.toUpperCase()}] </span> </div>
            <div className="text-xs font-bold">
            Active Shot #{String(safeIndex + 1).padStart(2, '0')}: {activeShot.name} </div>
            <div className="text-[11px] font-mono opacity-75">
            Car Pos: [{Math.round(activeShot.car.location[0])}, {Math.round(activeShot.car.location[1])}, {Math.round(activeShot.car.location[2])}] • Speed: {Math.round(activeShot.car.speed)} UU/s • Ball: {activeShot.ball.kickoffState ? 'FREEZE' : `${Math.round(activeShot.ball.speed)} UU/s`}
            </div> <div className="text-[10px] text-emerald-500 font-mono mt-0.5">
            [*] [TAB] Independent Control Edge Inspector Drawer · [ESC] Independent central main menu (Menu and Inspector Two systems do not conflict) </div> </div> </div>
            {/* Top-Center StaticTrainingPackHUD */} <StaticTrainingPackHUD isLight={isLight} shotIndex={safeIndex}
            shot={activeShot} editSubMode={editSubMode} onSelectSubMode={setEditSubMode} />
            {/* Bottom-Center VelocityProgressBar (5A.4) */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <VelocityProgressBar speed={activeShot.car.speed} width={280} height={20} />
        </div>

        {/* Bottom-Right Fixed 148×148px Circular Boost Gauge (at right: 24px, bottom: 20px - cleared by bottomOffset: 184px) */}
        <div className="absolute z-10 pointer-events-none flex flex-col items-end gap-1"
          style={{ right: 24, bottom: 20 }}>
          <CircularBoostGauge
            amount={activeShot.car.unlimitedBoost ? 100 : activeShot.car.initialBoost}
            size={148}
            isLight={isLight}
          />
        </div>

        {/* System A (Independent Edge Inspector Suite, z-30): Controlled exclusively by [TAB] */}
        <EdgeInspectorDrawer isExpanded={isDrawerExpanded} onExpandedChange={setIsDrawerExpanded} side={drawerSide}
          expandedWidth={expandedWidth} collapsedWidth={collapsedWidth} topOffset={topOffset}
          bottomOffset={bottomOffset} edgeMargin={16} shortcutKey="TAB" enableHotkey={true} positionMode="absolute"
          isLight={isLight}>
          <Layer5StaticTrainingPackEditRecipe
            isLight={isLight}
            transparent={true}
            packTitle="Aerial Striker Pack"
            shots={shots}
            onShotsChange={setShots}
            selectedShotIndex={selectedShotIndex}
            onSelectedShotIndexChange={setSelectedShotIndex}
            isInspectingShot={isInspectingShot}
            onInspectingShotChange={setIsInspectingShot}
            editSubMode={editSubMode}
            onEditSubModeChange={setEditSubMode}
            onCollapseDrawer={() => setIsDrawerExpanded(false)}
          />
        </EdgeInspectorDrawer>

        {/* System B (Independent ESC Main Menu Overlay, z-50): Controlled by [ESC], completely decoupled from EdgeInspectorDrawer */}
        {isEscMenuOpen && (
          <div
            data-ui-element="esc-main-menu-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEscMenuRoute('none');
              }
            }}
            style={{
              backgroundColor:
                escMenuRoute === 'main-menu' ? 'transparent' : 'rgba(0, 0, 0, 0.55)',
              transition: 'background-color 220ms cubic-bezier(0.2, 0.8, 0.25, 1)',
            }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 pointer-events-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full flex items-center justify-center"
            >
              {escMenuRoute === 'main-menu' && (
                <Layer1MainMenuRecipe
                  isLight={isLight}
                  showAdditionalPreviews={false}
                  onResume={() => {
                    setEscMenuRoute('none');
                    showToast('Resume: Back 3D Training pack edit scene');
                  }}
                  onNavigatePlay={() => setEscMenuRoute('play')}
                  onNavigateGarage={() => setEscMenuRoute('garage')}
                  onNavigateSettings={() => setEscMenuRoute('settings')}
                  extraBottomAction={
                    <>
                      <MenuDivider isLight={isLight} />
                      <MenuItem
                        icon={<LogOut className="h-5 w-5" />}
                        title="Exit Edit Mode"
                        subtitle="Save or discard training pack edits & leave editor"
                        variant="danger"
                        isLight={isLight}
                        onClick={() => {
                          openStaticTrainingExitConfirmDialogue((action) => {
                            setEscMenuRoute('none');
                            showToast(
                              action === 'save'
                                ? '[ok] Saved changes and exited via main menu Edit Mode'
                                : '[!] Unsaved changes ignored and exited via the main menu Edit Mode'
                            );
                          });
                        }}
                      />
                    </>
                  }
                />
              )}

              {escMenuRoute === 'play' && (
                <Layer2PlayRecipe
                  isLight={isLight}
                  onBack={() => setEscMenuRoute('main-menu')}
                  onSelectMode={(mode) => {
                    setEscMenuRoute('none');
                    showToast(`Switched play mode from main menu: ${mode}`);
                  }}
                />
              )}

              {escMenuRoute === 'garage' && (
                <Layer2GarageRecipe
                  isLight={isLight}
                  onBack={() => setEscMenuRoute('main-menu')}
                />
              )}

              {escMenuRoute === 'settings' && (
                <Layer2SettingsRecipe
                  isLight={isLight}
                  onBack={() => setEscMenuRoute('main-menu')}
                />
              )}
            </div>
          </div>
        )}

        {/* Bottom-Left Status Pill */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl border bg-black/65 text-neutral-200 backdrop-blur border-white/10">
          <span>Drawer:</span>
          <strong className={isDrawerExpanded ? 'text-amber-400' : 'text-emerald-400'}>
            {isDrawerExpanded
              ? `EXPANDED (${expandedWidth}px · ${drawerSide.toUpperCase()})`
              : `COLLAPSED (${collapsedWidth}px Pill)`}
          </strong>
          <span>|</span>
          <span>Menu:</span>
          <strong className={isEscMenuOpen ? 'text-rose-400' : 'text-neutral-400'}>
            {isEscMenuOpen ? escMenuRoute.toUpperCase() : 'CLOSED'}
          </strong>
          <span>|</span>
          <span className="flex items-center gap-1">
            Drawer: <KeycapBadge shortcut="TAB" size="sm" isLight={false} />
          </span>
          <span className="flex items-center gap-1">
            Menu: <KeycapBadge shortcut="ESC" size="sm" isLight={false} />
          </span>
        </div>
      </div>

      {/* 4. Architecture & Decoupling Reference Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeBlock
          isLight={isLight}
          title="1. EdgeInspectorDrawer (TAB) and Main Menu (ESC) Two orthogonal independent systems"
          code={`// 1. EdgeInspectorDrawer: Independent resident side inspection suite (z-30), Keep only top-right Collapse [TAB]
<EdgeInspectorDrawer
  isExpanded={isDrawerExpanded}
  onExpandedChange={setIsDrawerExpanded}
  shortcutKey="TAB" // TAB Dedicated key for controlling side inspection drawer storage and expansion, 0% Dim Background
  topOffset={72}
  bottomOffset={184}
>
  <Layer5StaticTrainingPackEditRecipe
    onCollapseDrawer={() => setIsDrawerExpanded(false)}
  />
</EdgeInspectorDrawer>

// 2. Main Menu: Independent central menu system (z-50), ESC Key exclusive control call/Off, Assume Exit Session Exit
{isEscMenuOpen && (
  <Layer1MainMenuRecipe
    onResume={() => setEscMenuRoute('none')}
    extraBottomAction={<MenuItem title="Exit Edit Mode" variant="danger" ... />}
  />
)}`}
        />

        <CodeBlock
          isLight={isLight}
          title="2. CollapsibleNumberedRailList (click #04 Enter Detail Track · Click current again #04 Back to List · No top-bar back button needed)"
          code={`// src/primitives/CollapsibleNumberedRailList.tsx
<CollapsibleNumberedRailList
  isCollapsedToRail={isInspectingShot} // default false (Full list as initial state)
  items={railItems}
  selectedIndex={safeIndex}
  collapsedRailWidth={60} // #01 Capsule Pinning w-[50px], Outer container flattened left to 60px
  onSelectItem={(idx) => {
    if (!isInspectingShot) {
      setSelectedShotIndex(idx);
      setIsInspectingShot(true); // Click any item in list mode -> Morph into detail track state
    } else if (idx === safeIndex) {
      setIsInspectingShot(false); // Track state re-click on currently activated #number -> Morph back to full list state
    } else {
      setSelectedShotIndex(idx); // Track state click other #number -> Directly switch current edit target, No state transition trigger
    }
  }}
  onAddNew={handleAddNewShot}
  onShowHelp={handleShowHelp}
  onDuplicate={handleDuplicate}
  onHoverDescription={setHoveredDesc}
  detailContent={<StaticTrainingShotInspectorView ... />}
/>`}
        />
      </div>
    </div>
  );
};
