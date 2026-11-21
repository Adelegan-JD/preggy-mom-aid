"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Enables calm motion when the user allows it, and reveals [data-reveal] content
 * as it scrolls into view. Content that is already on screen (or when JS is slow)
 * is never hidden: only elements that start below the fold are deferred.
 */
export default function MotionProvider() {
  const pathname = usePathname();

  // Decide whether motion is allowed (display preference + device setting).
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const pref = root.dataset.motion ?? "system";
      const allowed = pref === "allow" || (pref !== "reduce" && !media.matches);
      root.dataset.anim = allowed ? "on" : "off";
    };
    apply();
    media.addEventListener("change", apply);
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
    return () => { media.removeEventListener("change", apply); observer.disconnect(); };
  }, []);

  // Scroll reveals, re-run on each route change.
  useEffect(() => {
    if (document.documentElement.dataset.anim !== "on" || !("IntersectionObserver" in window)) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"));
    const viewport = window.innerHeight;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove("is-pending");
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    for (const el of targets) {
      if (el.dataset.revealStagger !== undefined) {
        Array.from(el.children).forEach((child, index) => (child as HTMLElement).style.setProperty("--reveal-i", String(index)));
      }
      if (el.getBoundingClientRect().top > viewport * 0.92) {
        el.classList.add("is-pending");
        io.observe(el);
      } else {
        el.classList.add("is-revealed");
      }
    }
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
