import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "音夢 | Nemu Rainbow",
  description: "音夢のポートフォリオ・リンクまとめサイト",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
