import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kösto · Kelimeler yakın, biri farklı.",
  description: "Aynı bahçede farklı kelimeler. Arkadaşlarınla 3–16 kişilik, sıralı konuşmalı gizli kelime oyunu.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
