import React from 'react';
import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '../../ui-core/layout/Panel';
import { useMenuLayoutStore } from '../../ui-core/stores/menuLayoutStore';
import { createScopedSyncedState } from '../stores/crossClientSync';
import { CodeBlock } from '../CodeBlock';
import { PanelShellTuner } from './panels/PanelShellTuner';

const useState = createScopedSyncedState('page:panels');

export const PanelsPage: React.FC<{ isLight?: boolean }> = ({ isLight = false }) => {
  const {
    panelHeaderPaddingX,
    panelHeaderPaddingY,
    panelHeaderTitleFontSize,
    panelBodyPaddingX,
    panelBodyPaddingY,
    panelFooterPaddingX,
    panelFooterPaddingY,
    panelFooterFontSize,
  } = useMenuLayoutStore();

  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 max-w-6xl w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">3-Stage Compound Panel</h1>
        <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`}>
          Standard three-part elastic panel specification: top bar (Header · shrink-0) Top-down height calculation, bottom bar (Footer · shrink-0 mt-auto) Anchor to bottom from bottom up, Middle Content (Content · flex-1 min-h-0) Elastic layout fills all remaining vertical space with independent scrolling. 
          Adjusted here<strong>Header style, Back button size and section Padding parameters</strong> persist to <code className="font-mono">localStorage</code> and sync to <strong>all 6A Layer 2-4 panels</strong> and <strong>7A full-link sandbox</strong>. 
        </p>
      </div>

      {/* Live 3-Stage Compound Shell Tuner */}
      <PanelShellTuner isLight={isLight} />

      {/* Anatomy Diagram */}
      <div className={`p-6 rounded-2xl border flex flex-col gap-4 ${
        isLight ? 'bg-white border-neutral-200 shadow-2xs' : 'bg-neutral-900/60 border-neutral-800'
      }`}>
        <span className="font-bold text-sm">Panel structure anatomy and real-time size preview (Live Panel Anatomy)</span>

        <PanelContainer isLight={isLight} className="max-w-[520px] self-center my-2">
          {/* Header */}
          <div className="relative">
            <PanelHeader
              title="TITLE"
              onBack={() => {}}
              onRightAction={() => {}}
              rightActionLabel="Live Preview"
              onRightActionHoverChange={(hovered) =>
                setHoveredDesc(
                  hovered
                    ? 'Live Preview [TAB]: Collapse panel to side dock and inspect live 3D arena.'
                    : null
                )
              }
              isLight={isLight}
            />
          </div>

          {/* Body */}
          <div className="relative border-b border-dashed border-amber-500/40">
            <PanelContent scrollable={false} className="bg-amber-500/5">
              <div
                onMouseEnter={() =>
                  setHoveredDesc('Hovering content item: Footer switches to high-contrast description.')
                }
                onMouseLeave={() => setHoveredDesc(null)}
                className="p-4 rounded-xl border border-amber-500/30 text-xs text-center flex flex-col gap-1 cursor-pointer transition-colors hover:border-amber-500"
              >
                <span className="font-bold text-amber-500">
                  STAGE 2: CONTENT BODY (Padding: {panelBodyPaddingX}px × {panelBodyPaddingY}px)
                </span>
                <span className="text-[11px] opacity-75">
                  All internal controls and cards breathe within this container (Mouse hover here or top-right corner Minimize-2 Button Previewable Live Preview and Footer Linkage) . 
                </span>
              </div>
            </PanelContent>
          </div>

          {/* Footer */}
          <PanelFooter
            isLight={isLight}
            defaultDescription={`STAGE 3: FOOTER (${panelFooterFontSize}px · Padding: ${panelFooterPaddingX}×${panelFooterPaddingY}px · Idle Gray / Hover High-Contrast)`}
            hoveredDescription={hoveredDesc}
            rightLabel="Live Preview"
            rightShortcut="TAB"
            onRightClick={() => {}}
          />
        </PanelContainer>
      </div>

      {/* Code Snippet */}
      <CodeBlock
        isLight={isLight}
        title="Agent code recipe (Compound Panel Recipe)"
        code={`import { PanelContainer, PanelHeader, PanelContent, PanelFooter } from '@/ui-core/layout/Panel';

<PanelContainer isLight={isLight} className="w-full max-w-[520px]">
  <PanelHeader
    title="PANEL TITLE"
    onBack={handleBack}
    isLight={isLight}
  />
  <PanelContent scrollable>
    {/* Internal business controls automatically inherit global settings panelBodyPaddingX (${panelBodyPaddingX}px) × panelBodyPaddingY (${panelBodyPaddingY}px) */}
  </PanelContent>
  <PanelFooter
    isLight={isLight}
    defaultDescription="Default page description when nothing is hovered."
    hoveredDescription={hoveredDesc}
  />
</PanelContainer>`}
      />
    </div>
  );
};
