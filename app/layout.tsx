import type { Metadata, Viewport } from "next";
import "./globals.css";
import AccessibilityPreferences from "@/components/accessibility-preferences";

export const metadata: Metadata = {
  title: "Preggy Mom Aid | Maternal health support",
  description: "A maternal health support platform being developed with privacy, trusted information and responsible care at its centre.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#f47f95"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="pma-skip-link" href="#main-content">Skip to main content</a>
        {children}
        <AccessibilityPreferences />
      </body>
    </html>
  );
}
