import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldCheck } from "lucide-react";

/** Page title block used at the top of every app page. */
export function PageHeader({ title, lede, actions }: { title: ReactNode; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="ds-page-header">
      <div>
        <h1 className="ds-h1">{title}</h1>
        {lede && <p className="ds-lede">{lede}</p>}
      </div>
      {actions && <div className="ds-page-actions">{actions}</div>}
    </header>
  );
}

type Tone = "info" | "danger" | "success" | "warning" | "neutral";
const icons = { info: ShieldCheck, danger: AlertTriangle, success: CheckCircle2, warning: AlertTriangle, neutral: Info };

/** Inline notice. Use "danger" only for urgent health guidance. */
export function Callout({ tone = "info", title, children, action, className = "" }: { tone?: Tone; title?: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
  const Icon = icons[tone];
  return (
    <div className={`ds-callout ${tone === "info" ? "" : `ds-callout-${tone}`} ${className}`} role={tone === "danger" ? "note" : undefined}>
      <Icon size={18} aria-hidden="true" />
      <div>
        {title && <b>{title}</b>}
        {children && <p>{children}</p>}
      </div>
      {action && <div className="ds-callout-action">{action}</div>}
    </div>
  );
}

/** Shown when account services are not configured for this deployment. */
export function UnavailablePage({ title, message }: { title: string; message: string }) {
  return (
    <div className="ds-page ds-page-narrow">
      <PageHeader title={title} lede={message} />
    </div>
  );
}
