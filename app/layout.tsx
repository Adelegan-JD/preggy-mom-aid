import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preggy Mom Aid | Maternal health support",
  description: "A maternal health support platform being developed with privacy, trusted information and responsible care at its centre.",
  manifest: "/manifest.json",
  themeColor: "#f47f95"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
