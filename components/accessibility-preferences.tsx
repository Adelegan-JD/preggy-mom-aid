"use client";

import { useEffect, useId, useState } from "react";
import { Languages, SlidersHorizontal, RotateCcw } from "lucide-react";
import LanguageSwitcher from "@/components/language-switcher";
import { ComboBox } from "@/components/combo-box";

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
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      root.dataset.theme = preferences.theme === "system" ? (media?.matches ? "dark" : "light") : preferences.theme;
    };
    applyTheme();
    if (preferences.theme === "system") media?.addEventListener?.("change", applyTheme);
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
    return () => media?.removeEventListener?.("change", applyTheme);
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
        <Languages size={18} aria-hidden="true" />
        <span className="pma-preferences-label">Language &amp; display</span>
      </summary>
      <section className="pma-preferences-panel" id={`pma-preferences-${ids}`} aria-label="Display and accessibility preferences">
        <div className="pma-preferences-heading">
          <div>
            <span className="pma-preferences-kicker">MAKE IT COMFORTABLE</span>
            <h2>Language and display</h2>
          </div>
          <span className="pma-preferences-icon" aria-hidden="true"><SlidersHorizontal size={19} /></span>
        </div>

        <div className="pma-preference-field"><LanguageSwitcher /></div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-theme-${ids}`}>Colour theme</label>
          <ComboBox id={`pma-theme-${ids}`} value={preferences.theme} onValueChange={(value) => update("theme", value as Preferences["theme"], "Colour theme")} options={[{ value: "system", label: "Use my device setting" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-accent-${ids}`}>Accent colour</label>
          <ComboBox id={`pma-accent-${ids}`} value={preferences.accent} onValueChange={(value) => update("accent", value as Preferences["accent"], "Accent colour")} options={[{ value: "rose", label: "Rose" }, { value: "teal", label: "Teal" }, { value: "blue", label: "Blue" }, { value: "plum", label: "Plum" }]} />
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-text-${ids}`}>Text size</label>
          <ComboBox id={`pma-text-${ids}`} value={preferences.textSize} onValueChange={(value) => update("textSize", value as Preferences["textSize"], "Text size")} options={[{ value: "default", label: "Default" }, { value: "large", label: "Large" }, { value: "largest", label: "Extra large" }]} />
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-contrast-${ids}`}>Contrast</label>
          <ComboBox id={`pma-contrast-${ids}`} value={preferences.contrast} onValueChange={(value) => update("contrast", value as Preferences["contrast"], "Contrast")} options={[{ value: "standard", label: "Standard" }, { value: "high", label: "High contrast" }]} />
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-motion-${ids}`}>Motion</label>
          <ComboBox id={`pma-motion-${ids}`} value={preferences.motion} onValueChange={(value) => update("motion", value as Preferences["motion"], "Motion")} options={[{ value: "system", label: "Use my device setting" }, { value: "reduce", label: "Reduce motion" }, { value: "allow", label: "Allow motion" }]} />
        </div>

        <div className="pma-preference-field">
          <label htmlFor={`pma-layout-${ids}`}>Content width</label>
          <ComboBox id={`pma-layout-${ids}`} value={preferences.layout} onValueChange={(value) => update("layout", value as Preferences["layout"], "Content width")} options={[{ value: "standard", label: "Comfortable reading width" }, { value: "wide", label: "Wider layout" }]} />
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
