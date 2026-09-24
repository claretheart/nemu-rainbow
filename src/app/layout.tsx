import type { Metadata, Viewport } from "next";
import "./globals.css";
import NightSky from "./NightSky";

export const metadata: Metadata = {
  // OG画像などの相対パスを公開URLで解決するための基点
  metadataBase: new URL("https://nemu-rainbow.vercel.app"),
  title: "音夢 | Nemu Rainbow",
  description: "音夢(ねむ)のサイト。夜の作業アプリ『よるじかん with ねむ』発売中。イラスト・HP・ゲーム・MVなどの制作も。",
  openGraph: {
    title: "音夢 | Nemu Rainbow",
    description: "音夢(ねむ)のサイト。夜の作業アプリ『よるじかん with ねむ』発売中。イラスト・HP・ゲーム・MVなどの制作も。",
    images: "/yorujikan/key.webp",
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F9FF",
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
