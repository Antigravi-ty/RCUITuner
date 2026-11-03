import React from 'react';
import { Layers } from 'lucide-react';
import {
  useFloatingThreeStageStore,
  type FloatingShellVariant,
} from '../../../ui-core/stores/floatingThreeStageStore';
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
