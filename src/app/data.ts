export const profile = {
  name: "音夢",
  reading: "ねむ",
  handle: "@nemu_rainbow",
  bio: ["七色の感情を、夜に歌っています。", "あなたのひとりの時間に、そっと寄り添えたら。"],
  avatar: "/avatar.png",
};

export const links = [
  { label: "X（旧Twitter）", desc: "毎日ショート歌動画と時々イラスト", url: "https://x.com/nemu_rainbow", icon: "𝕏", color: "#4dabf7" },
  { label: "ネムの夜日記", desc: "音夢の日常４コマ漫画", url: "https://nemu-night-diary.vercel.app", icon: "📖", color: "#9775fa" },
  { label: "YouTube", desc: "", url: "https://www.youtube.com/channel/UCUpEepsmE6wvRlY1zGh_wHw", icon: "▶", color: "#20c997" },
  { label: "制作実績", desc: "MV・楽曲クレジット", url: "/works", icon: "🎬", color: "#f783ac" },
];

// LINE公式アカウントの友だち追加URL（差し替えはここ1箇所だけ）
export const LINE_FRIEND_URL = "https://lin.ee/n47BCvw";

// 「よるじかん with ねむ」事前登録セクションの掲載コピー
export const yorujikan = {
  sectionLabel: "Now Making",
  titleApp: "【よるじかん with ねむ】",
  titleTail: "つくっています",
  body: "夜のさぎょうの おともに、わたしが そばにいる——そんなデスクトップアプリを つくっています。うたと、ポモドーロタイマーと、ちいさな おしゃべり。あなたの ひとりの時間に、そっと寄り添えたら。",
  price: "980円(税込・予定)",
  progressLabel: "制作のようすは #ネムの開発日記 で",
  progressUrl: "https://x.com/nemu_rainbow",
  ctaLead: "できあがったら、いちばんに お知らせします",
  ctaLabel: "LINEで友だち追加",
  ctaPendingNote: "(じゅんびちゅう)",
};

export const works: { title: string; youtubeId: string; desc?: string }[] = [
  { title: "Bet My Existence", youtubeId: "nRiuS6JsQfI", desc: "2026.05" },
];

export const gallery: string[] = [
  // "/gallery/01.png",
  // 画像を追加する場合はここに追記
];
