"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Brand from "@/components/brand";

/** The one public navigation bar. Every public and account page uses this. */
export const siteLinks = [
  { label: "Learn", href: "/learn" },
  { label: "Hospital directory", href: "/hospitals" },
  { label: "Emergency help", href: "/emergency" },
  { label: "For professionals", href: "/#professionals" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className="ds-site-header"
      onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); toggleRef.current?.focus(); } }}
    >
      <div className="ds-site-header-inner">
        <Brand />
        <nav id="primary-navigation" className={open ? "ds-site-nav is-open" : "ds-site-nav"} aria-label="Main navigation">
          {siteLinks.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          <Link className="ds-nav-extra" href="/login" aria-current={pathname === "/login" ? "page" : undefined}>Sign in</Link>
          <Link className="ds-nav-extra ds-nav-extra-primary" href="/signup" aria-current={pathname === "/signup" ? "page" : undefined}>Create account</Link>
        </nav>
        <div className="ds-site-actions">
          <Link className="ds-btn ds-btn-ghost ds-hide-sm" href="/login">Sign in</Link>
          <Link className="ds-btn ds-btn-primary ds-hide-sm" href="/signup">Create account</Link>
          <button
            ref={toggleRef}
            type="button"
            className="ds-icon-btn ds-menu-toggle"
            aria-controls="primary-navigation"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
