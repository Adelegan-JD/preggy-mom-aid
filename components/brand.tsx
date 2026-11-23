import Link from "next/link";
import { HeartPulse } from "lucide-react";

/** The one Preggy Mom Aid logo lockup, used in every header and footer. */
export default function Brand({ href = "/", subtitle = "Maternal health support", hideSubtitle = false }: { href?: string; subtitle?: string; hideSubtitle?: boolean }) {
  return (
    <Link href={href} className="ds-brand">
      <span className="ds-brand-mark" aria-hidden="true"><HeartPulse size={18} /></span>
      <span className="ds-brand-name"><b>Preggy Mom Aid</b>{!hideSubtitle && <small>{subtitle}</small>}</span>
    </Link>
  );
}
