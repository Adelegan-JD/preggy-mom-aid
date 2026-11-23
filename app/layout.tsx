import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import "./design-system.css";
import AccessibilityPreferences from "@/components/accessibility-preferences";
import MotionProvider from "@/components/motion-provider";
import { LanguageProvider } from "@/components/language-provider";
import ConfirmationsProvider from "@/contexts/confirmations-provider";
import { normalizeLanguage } from "@/lib/i18n/translations";
import { isMockMode } from "@/lib/mock/mode";

export const metadata: Metadata = {
  title: "Preggy Mom Aid | Maternal health support",
  description: "A maternal health support platform being developed with privacy, trusted information and responsible care at its centre.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = { themeColor: "#ee8a9c" };

// Applies saved display preferences before first paint so there is no light/dark flash.
// "system" is resolved to a concrete light/dark value so one dark theme serves both
// the explicit Dark option and devices set to dark mode.
const displayPreferenceScript = `(function(){try{var d=document.documentElement,p=JSON.parse(localStorage.getItem("pma-display-preferences-v1")||"{}");var t=p.theme==="light"||p.theme==="dark"?p.theme:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.setAttribute("data-theme",t);["accent","textSize","contrast","motion","layout"].forEach(function(k){if(typeof p[k]==="string"&&/^[a-z]+$/.test(p[k]))d.dataset[k]=p[k];});}catch(e){}})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  const htmlLanguage = language === "pcm" ? "en-NG" : language === "yo" ? "yo-NG" : language === "ha" ? "ha-NG" : language === "ig" ? "ig-NG" : "en-NG";
  return (
    <html lang={htmlLanguage} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: displayPreferenceScript }} />
      </head>
      <body>
        <a className="pma-skip-link" href="#main-content">Skip to main content</a>
        {isMockMode && <p className="ds-demo-badge" role="note">Demo mode · fake data stored only on this computer · <code>npm run mock:reset</code> to start over</p>}
        <LanguageProvider initialLanguage={language}>
          <ConfirmationsProvider>
          {children}
          </ConfirmationsProvider>
          <AccessibilityPreferences />
          <MotionProvider />
        </LanguageProvider>
      </body>
    </html>
  );
}
