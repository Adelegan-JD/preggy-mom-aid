import type { ReactNode } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";

/** Shared frame for sign in, sign up, password recovery and other single-task account pages. */
export default function AuthLayout({ title, lede, children, footer }: { title: ReactNode; lede?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="ds-site ds-auth-page">
      <SiteHeader />
      <div className="ds-auth">
        <div className="ds-auth-main">
          <main id="main-content" tabIndex={-1} className="ds-auth-form">
            <div>
              <h1 className="ds-h1-lg">{title}</h1>
              {lede && <p className="ds-lede">{lede}</p>}
            </div>
            {children}
            {footer && <div className="ds-auth-foot">{footer}</div>}
          </main>
          <footer>
            <span>Educational information only · Not an emergency service</span>
            <Link href="/feedback">Feedback</Link>
          </footer>
        </div>
        <aside className="ds-auth-aside" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1752240880737-128cc8cbf65c?auto=format&fit=crop&w=1200&q=80" alt="" />
          <div className="ds-auth-aside-copy">
            <p>Care, knowledge and support for every step.</p>
            <small>Photo: Arturo Añez / Unsplash</small>
          </div>
        </aside>
      </div>
    </div>
  );
}
