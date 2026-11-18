"use client";

import { useEffect, useId, useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

type Preferences = {
  theme: "system" | "light" | "dark";
  accent: "rose" | "teal" | "blue" | "plum";
  textSize: "default" | "large" | "largest";
  contrast: "standard" | "high";
  motion: "system" | "reduce" | "allow";
  layout: "standard" | "wide";
};

const STORAGE_KEY = "pma-display-preferences-v1";
const DEFAULTS: Preferences = {
  theme: "system",
  accent: "rose",
  textSize: "default",
  contrast: "standard",
  motion: "system",
  layout: "standard",
};

function choice<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T) ? value as T : fallback;
}

function parsePreferences(raw: string | null): Preferences {
  if (!raw) return DEFAULTS;
  try {
    const saved = JSON.parse(raw) as Partial<Preferences>;
    return {
      theme: choice(saved.theme, ["system", "light", "dark"], DEFAULTS.theme),
      accent: choice(saved.accent, ["rose", "teal", "blue", "plum"], DEFAULTS.accent),
      textSize: choice(saved.textSize, ["default", "large", "largest"], DEFAULTS.textSize),
      contrast: choice(saved.contrast, ["standard", "high"], DEFAULTS.contrast),
      motion: choice(saved.motion, ["system", "reduce", "allow"], DEFAULTS.motion),
      layout: choice(saved.layout, ["standard", "wide"], DEFAULTS.layout),
    };
  } catch {
    return DEFAULTS;
  }
}

export default function AccessibilityPreferences() {
  const ids = useId();
  const [preferences, setPreferences] = useState<Preferences>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    try {
      setPreferences(parsePreferences(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
      setPreferences(DEFAULTS);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.theme = preferences.theme;
    root.dataset.accent = preferences.accent;
    root.dataset.textSize = preferences.textSize;
    root.dataset.contrast = preferences.contrast;
    root.dataset.motion = preferences.motion;
    root.dataset.layout = preferences.layout;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      setAnnouncement("Your browser does not allow preferences to be saved on this device.");
    }
  }, [preferences, ready]);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K], label: string) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setAnnouncement(`${label} preference updated.`);
  }

  function reset() {
    setPreferences(DEFAULTS);
    setAnnouncement("Display preferences restored to their defaults.");
  }

  return (
    <details className="pma-preferences">
      <summary aria-controls={`pma-preferences-${ids}`}>
        <SlidersHorizontal size={18} aria-hidden="true" />
        <span>Display settings</span>
      </summary>
      <section className="pma-preferences-panel" id={`pma-preferences-${ids}`} aria-label="Display and accessibility preferences">
        <div className="pma-preferences-heading">
          <div>
            <span className="pma-preferences-kicker">MAKE IT COMFORTABLE</span>
            <h2>Display preferences</h2>
          </div>
          <span className="pma-preferences-icon" aria-hidden="true"><SlidersHorizontal size={19} /></span>
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-theme-${ids}`}>Colour theme</label>
          <select id={`pma-theme-${ids}`} value={preferences.theme} onChange={(event) => update("theme", event.currentTarget.value as Preferences["theme"], "Colour theme")}>
            <option value="system">Use my device setting</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-accent-${ids}`}>Accent colour</label>
          <select id={`pma-accent-${ids}`} value={preferences.accent} onChange={(event) => update("accent", event.currentTarget.value as Preferences["accent"], "Accent colour")}>
            <option value="rose">Rose</option>
            <option value="teal">Teal</option>
            <option value="blue">Blue</option>
            <option value="plum">Plum</option>
          </select>
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-text-${ids}`}>Text size</label>
          <select id={`pma-text-${ids}`} value={preferences.textSize} onChange={(event) => update("textSize", event.currentTarget.value as Preferences["textSize"], "Text size")}>
            <option value="default">Default</option>
            <option value="large">Large</option>
            <option value="largest">Extra large</option>
          </select>
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-contrast-${ids}`}>Contrast</label>
          <select id={`pma-contrast-${ids}`} value={preferences.contrast} onChange={(event) => update("contrast", event.currentTarget.value as Preferences["contrast"], "Contrast")}>
            <option value="standard">Standard</option>
            <option value="high">High contrast</option>
          </select>
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-motion-${ids}`}>Motion</label>
          <select id={`pma-motion-${ids}`} value={preferences.motion} onChange={(event) => update("motion", event.currentTarget.value as Preferences["motion"], "Motion")}>
            <option value="system">Use my device setting</option>
            <option value="reduce">Reduce motion</option>
            <option value="allow">Allow motion</option>
          </select>
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-layout-${ids}`}>Content width</label>
          <select id={`pma-layout-${ids}`} value={preferences.layout} onChange={(event) => update("layout", event.currentTarget.value as Preferences["layout"], "Content width")}>
            <option value="standard">Comfortable reading width</option>
            <option value="wide">Wider layout</option>
          </select>
        </div>

        <button className="pma-preferences-reset" type="button" onClick={reset}>
          <RotateCcw size={15} aria-hidden="true" /> Restore defaults
        </button>
        <p className="pma-preferences-note">
          These choices are saved on this device only. They change how the site
          looks; they do not change health information or your medical records.
        </p>
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      </section>
    </details>
  );
}
