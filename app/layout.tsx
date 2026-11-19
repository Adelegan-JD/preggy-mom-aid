import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import AccessibilityPreferences from "@/components/accessibility-preferences";
import { LanguageProvider } from "@/components/language-provider";
import { normalizeLanguage } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "Preggy Mom Aid | Maternal health support",
  description: "A maternal health support platform being developed with privacy, trusted information and responsible care at its centre.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = { themeColor: "#f47f95" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get("pma-language")?.value);
  const htmlLanguage = language === "pcm" ? "en-NG" : language === "yo" ? "yo-NG" : language === "ha" ? "ha-NG" : language === "ig" ? "ig-NG" : "en-NG";
  return (
    <html lang={htmlLanguage} suppressHydrationWarning>
      <body>
        <a className="pma-skip-link" href="#main-content">Skip to main content</a>
        <LanguageProvider initialLanguage={language}>
          {children}
          <AccessibilityPreferences />
        </LanguageProvider>
      </body>
    </html>
  );
}
