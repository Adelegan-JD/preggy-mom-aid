import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Preggy Mom Aid | Maternal health companion",
  description: "A supportive maternal health companion for blood pressure tracking, symptom awareness and continuity of care.",
  manifest: "/manifest.json",
  themeColor: "#f47f95"
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}