import React, { useEffect } from 'react';
import { createScopedSyncedState } from '../stores/crossClientSync';

const useState = createScopedSyncedState('page:edge-inspector');
import { PanelRightClose, PanelLeftClose, RotateCcw, Check, Maximize2, LogOut } from 'lucide-react';
import { EdgeInspectorDrawer, type EdgeDrawerSide } from '../../ui-core/navigation/EdgeInspectorDrawer';
import { MenuDivider } from '../../ui-core/layout/MenuContainer';
import {
  Layer5StaticTrainingPackEditRecipe, openStaticTrainingExitConfirmDialogue,
} from '../../ui-core/recipes/StaticTrainingShotInspectorDrawer';
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
import { Badge } from '../../ui-core/primitives/Badge';
import { Button } from '../../ui-core/primitives/Button';
import { KeycapBadge } from '../../ui-core/primitives/KeycapBadge';
import { useDialogueStack } from '../../ui-core/compounds/dialogue/dialogueStore';
import {
  EdgeInspectorSceneOverlayAndMenu,
  EdgeInspectorTunerControls,
} from './edge-inspector/EdgeInspectorTunerControls';
import { EdgeInspectorReferenceMatrix } from './edge-inspector/EdgeInspectorReferenceMatrix';

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
      {/* 1. Static Page Header (Nothing above the View Box ever changes) */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <PanelRightClose className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">6E · Edge Inspector Side Hover Inspection Drawer</h1>
              <Badge variant="amber" size="sm" isLight={isLight}>
                Zero-Backdrop · Right/Left Offset
              </Badge>
              <Badge variant="primary" size="sm" isLight={isLight}>
                TAB Independent Management Drawer · ESC Independent Management Menu
              </Badge>
            </div>
            <p className={`text-xs mt-0.5 ${ isLight ? 'text-neutral-500' : 'text-neutral-400' }`}>
              Static top-pinned View Box stage — all drawer state toggles, ESC menu triggers, and geometry/offset tuners operate below the View Box so nothing above it ever changes.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TOP-PINNED VIEW BOX STAGE: Interactive 3D Arena + HUD + EdgeInspectorDrawer + Independent ESC Main Menu Stage */}
      <div
        id="edge-inspector-simulation-stage"
        className="relative w-full h-[680px] rounded-3xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shadow-2xl bg-black select-none"
      >
        {/* Live 3D Arena Backdrop (100% un-darkened even when EdgeInspectorDrawer is expanded!) */}
        <ArenaBackdrop preset={isLight ? 'daylight' : 'night'} brightness={isLight ? 82 : 38} />
        {/* Top-Center StaticTrainingPackHUD */}
        <StaticTrainingPackHUD
          isLight={isLight}
          shotIndex={safeIndex}
          shot={activeShot}
          editSubMode={editSubMode}
          onSelectSubMode={setEditSubMode}
        />
        {/* Bottom-Center VelocityProgressBar (5A.4) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <VelocityProgressBar speed={activeShot.car.speed} width={280} height={20} />
        </div>

        {/* Bottom-Right Fixed 148×148px Circular Boost Gauge (at right: 24px, bottom: 20px - cleared by bottomOffset: 184px) */}
        <div
          className="absolute z-10 pointer-events-none flex flex-col items-end gap-1"
          style={{ right: 24, bottom: 20 }}
        >
          <CircularBoostGauge
            amount={activeShot.car.unlimitedBoost ? 100 : activeShot.car.initialBoost}
            size={148}
            isLight={isLight}
          />
        </div>

        {/* System A (Independent Edge Inspector Suite, z-30): Controlled exclusively by [TAB] */}
        <EdgeInspectorDrawer
          isExpanded={isDrawerExpanded}
          onExpandedChange={setIsDrawerExpanded}
          side={drawerSide}
          expandedWidth={expandedWidth}
          collapsedWidth={collapsedWidth}
          topOffset={topOffset}
          bottomOffset={bottomOffset}
          edgeMargin={16}
          shortcutKey="TAB"
          enableHotkey={true}
          positionMode="absolute"
          isLight={isLight}
        >
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

        <EdgeInspectorSceneOverlayAndMenu
          isLight={isLight}
          editSubMode={editSubMode}
          safeIndex={safeIndex}
          activeShot={activeShot}
          isDrawerExpanded={isDrawerExpanded}
          expandedWidth={expandedWidth}
          collapsedWidth={collapsedWidth}
          drawerSide={drawerSide}
          isEscMenuOpen={isEscMenuOpen}
          escMenuRoute={escMenuRoute}
          setEscMenuRoute={setEscMenuRoute}
          showToast={showToast}
        />
      </div>

      <EdgeInspectorTunerControls
        isLight={isLight}
        feedbackToast={feedbackToast}
        handleExportLayoutSnapshot={handleExportLayoutSnapshot}
        isInspectingShot={isInspectingShot}
        setIsInspectingShot={setIsInspectingShot}
        isDrawerExpanded={isDrawerExpanded}
        setIsDrawerExpanded={setIsDrawerExpanded}
        isEscMenuOpen={isEscMenuOpen}
        setEscMenuRoute={setEscMenuRoute}
        handleResetParams={handleResetParams}
        geometry={{
          drawerSide,
          setDrawerSide,
          expandedWidth,
          setExpandedWidth,
          collapsedWidth,
          setCollapsedWidth,
          topOffset,
          setTopOffset,
          bottomOffset,
          setBottomOffset,
        }}
      />

      <EdgeInspectorReferenceMatrix isLight={isLight} />
    </div>
  );
};
