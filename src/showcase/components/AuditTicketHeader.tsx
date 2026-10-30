import React, { useState } from 'react';
import { Flag, Check, Copy } from 'lucide-react';
import { quickNotification } from '../../ui-core/stores/quickNotificationStore';

export interface AuditTicketHeaderProps {
  index?: number;
  label: string;
  description?: string;
  referenceCode: string;
  componentName: string;
  sourceFile: string;
  subViewFile?: string;
  stateId: string;
  activeProps?: Record<string, unknown>;
  badgeColor?: 'amber' | 'emerald' | 'rose' | 'sky' | 'indigo' | 'purple';
  tunerStatus?: 'dedicated-tuner' | 'direct-store' | 'unreviewed';
  isLight?: boolean;
}

const COLOR_STYLES: Record<
  NonNullable<AuditTicketHeaderProps['badgeColor']>,
  string
> = {
  amber: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
  emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25',
  rose: 'text-rose-500 bg-rose-500/10 border-rose-500/25',
  sky: 'text-sky-500 bg-sky-500/10 border-sky-500/25',
  indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/25',
  purple: 'text-purple-500 bg-purple-500/10 border-purple-500/25',
};

/**
 * Compact header bar rendered above audit stages and flat matrix cards.
 * Displays the state index/title, source path, tuner coverage status, and
 * one-click "Copy Path" / "Copy Ticket" buttons for rapid issue reporting.
 */
export const AuditTicketHeader: React.FC<AuditTicketHeaderProps> = React.memo(
  ({
    index,
    label,
    description,
    referenceCode,
    componentName,
    sourceFile,
    subViewFile,
    stateId,
    activeProps,
    badgeColor = 'amber',
    tunerStatus,
    isLight = false,
  }) => {
    const [copiedTicket, setCopiedTicket] = useState(false);
    const [copiedPath, setCopiedPath] = useState(false);

    const handleCopyPath = (e: React.MouseEvent) => {
      e.stopPropagation();
      const targetPath = subViewFile
        ? `${sourceFile} -> ${subViewFile} [${stateId}]`
        : `${sourceFile} :: ${componentName} [${stateId}]`;
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(targetPath).catch(() => {});
      }
      setCopiedPath(true);
      window.setTimeout(() => setCopiedPath(false), 1800);
      quickNotification.success(`Copied path: ${targetPath}`);
    };

    const handleCopyTicket = (e: React.MouseEvent) => {
      e.stopPropagation();
      const lines = [
        '### [UI Audit Ticket]',
        `- **Reference Code**: \`[${referenceCode}]\``,
        `- **Target Component**: \`${componentName}\``,
        `- **Source File**: \`${sourceFile}\``,
        ...(subViewFile ? [`- **Sub-View File**: \`${subViewFile}\``] : []),
        `- **State ID**: \`${stateId}\``,
        `- **State Label**: ${label}`,
        ...(description ? [`- **State Condition**: ${description}`] : []),
        `- **Active Props / Override**: \`${JSON.stringify(activeProps ?? {})}\``,
        `- **Theme Mode**: \`${isLight ? 'light' : 'dark'}\``,
        '- **Issue Description**: ',
        '',
      ];
      const text = lines.join('\n');
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      setCopiedTicket(true);
      window.setTimeout(() => setCopiedTicket(false), 1800);
      quickNotification.success(
        `Copied UI Audit Ticket for [${referenceCode}] ${componentName} (${stateId})`
      );
    };

    return (
      <div className="flex flex-wrap items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded border truncate ${COLOR_STYLES[badgeColor]}`}
            title={description || label}
          >
            {index !== undefined ? `${index}. ` : ''}
            [{referenceCode}] {label}
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border truncate max-w-[320px] ${
              isLight
                ? 'bg-neutral-100 border-neutral-200 text-neutral-600'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
            title={subViewFile ? `${sourceFile} -> ${subViewFile}` : sourceFile}
          >
            {subViewFile || sourceFile}
          </span>
          {tunerStatus && (
            <span
              className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                tunerStatus === 'dedicated-tuner'
                  ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25'
                  : 'text-sky-500 bg-sky-500/10 border-sky-500/25'
              }`}
            >
              {tunerStatus === 'dedicated-tuner'
                ? 'Dedicated Tuner'
                : 'Direct Store Binding'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyPath}
            title="Copy exact file path and state ID"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
              copiedPath
                ? 'bg-emerald-500 text-neutral-950 border-emerald-500 font-bold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
          >
            {copiedPath ? (
              <>
                <Check className="h-3 w-3" />
                <span>Path Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-sky-500" />
                <span>Copy Path</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyTicket}
            title="Copy structured UI Audit Ticket with exact file path and state props"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold cursor-pointer transition-colors ${
              copiedTicket
                ? 'bg-emerald-500 text-neutral-950 border-emerald-500 font-bold'
                : isLight
                ? 'bg-white hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
          >
            {copiedTicket ? (
              <>
                <Check className="h-3 w-3" />
                <span>Ticket Copied</span>
              </>
            ) : (
              <>
                <Flag className="h-3 w-3 text-amber-500" />
                <span>Copy Ticket</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
);

AuditTicketHeader.displayName = 'AuditTicketHeader';

