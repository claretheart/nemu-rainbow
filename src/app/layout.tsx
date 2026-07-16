import type { Metadata, Viewport } from "next";
import "./globals.css";
import NightSky from "./NightSky";

export const metadata: Metadata = {
  title: "音夢 | Nemu Rainbow",
  description: "音夢のポートフォリオ・リンクまとめサイト",
};

export const viewport: Viewport = {
  themeColor: "#05060f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <NightSky />
        {children}
      </body>
    </html>
  );
}
