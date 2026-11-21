import Link from "next/link";
import Brand from "@/components/brand";
import SocialLinks from "@/components/social-links";

/** The one public footer. */
export default function SiteFooter() {
  return (
    <footer className="ds-site-footer">
      <div className="ds-site-footer-inner">
        <div className="ds-stack">
          <Brand subtitle="Care, knowledge and support through every step" />
          <SocialLinks compact />
        </div>
        <div><h2>Explore</h2><ul><li><Link href="/learn">Learning Centre</Link></li><li><Link href="/hospitals">Hospital directory</Link></li><li><Link href="/emergency">Emergency help</Link></li></ul></div>
        <div><h2>Your account</h2><ul><li><Link href="/signup">Create account</Link></li><li><Link href="/login">Sign in</Link></li><li><Link href="/feedback">Share feedback</Link></li></ul></div>
        <p className="ds-site-footer-legal">Educational information only. Not an emergency service and not a substitute for care from a qualified professional.</p>
      </div>
    </footer>
  );
}
