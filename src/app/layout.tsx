import type { Metadata, Viewport } from "next";
import { Zen_Old_Mincho } from "next/font/google";
import BgmPlayer from "./BgmPlayer";
import SiteHeader from "./SiteHeader";
import StarField from "./StarField";
import "./globals.css";

// 見出し・題字用の明朝。日本語フォントは大きいので preload せず、CSS変数で渡す
const mincho = Zen_Old_Mincho({
  weight: ["500", "700", "900"],
  display: "swap",
  preload: false,
  variable: "--font-zen-old-mincho",
});

export const metadata: Metadata = {
  // OG画像などの相対パスを公開URLで解決するための基点
  metadataBase: new URL("https://nemu-rainbow.vercel.app"),
  title: "音夢 | Nemu Rainbow",
  description: "音夢(ねむ)のサイト。夜の作業アプリ『よるじかん with ねむ』発売中。HP・LP・ゲーム・MVなどの制作も。",
  openGraph: {
    title: "音夢 | Nemu Rainbow",
    description: "音夢(ねむ)のサイト。夜の作業アプリ『よるじかん with ねむ』発売中。HP・LP・ゲーム・MVなどの制作も。",
    images: "/yorujikan/key.webp",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F24",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={mincho.variable}>
      <body>
        <StarField />
        <SiteHeader />
        <BgmPlayer />
        {children}
      </body>
    </html>
  );
}
