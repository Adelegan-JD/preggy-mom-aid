"use client";

import { Instagram } from "lucide-react";

type SocialLinksProps = {
  compact?: boolean;
  className?: string;
};

function TikTokMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M19.6 7.2a6.1 6.1 0 0 1-4.1-1.6v8.1a5.8 5.8 0 1 1-5-5.7v3.1a2.8 2.8 0 1 0 2 2.7V2.5h3a6.1 6.1 0 0 0 4.1 3.9v.8Z"/>
    </svg>
  );
}

export default function SocialLinks({ compact = false, className = "" }: SocialLinksProps) {
  return (
    <div className={["pma-social-links", compact ? "is-compact" : "", className].filter(Boolean).join(" " )} aria-label="Preggy Mom Aid social media">
      {!compact && <span className="pma-social-label">Follow our community</span>}
      <a href="https://www.tiktok.com/@preggymum_aid" target="_blank" rel="noopener noreferrer" aria-label="Preggy Mom Aid on TikTok">
        <TikTokMark /><span className="pma-social-name">TikTok</span>
      </a>
      <a href="https://www.instagram.com/preggymom_aid/" target="_blank" rel="noopener noreferrer" aria-label="Preggy Mom Aid on Instagram">
        <Instagram aria-hidden="true" /><span className="pma-social-name">Instagram</span>
      </a>
    </div>
  );
}
