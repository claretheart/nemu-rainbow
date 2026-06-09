export const profile = {
  name: "音夢",
  title: "虹の歌師",
  handle: "@nemu_rainbow",
  bio: ["Xで毎日ショート歌動画を投稿中。", "AI×音楽で新しい表現を届けます。"],
  avatar: "/avatar.png",
};

export const links = [
  { label: "X（旧Twitter）", desc: "毎日ショート歌動画と時々イラスト", url: "https://x.com/nemu_rainbow", icon: "𝕏", color: "#4dabf7" },
  { label: "ネムの夜日記", desc: "音夢の日常４コマ漫画", url: "https://nemu-night-diary.vercel.app", icon: "📖", color: "#9775fa" },
  { label: "YouTube", desc: "", url: "https://www.youtube.com/channel/UCUpEepsmE6wvRlY1zGh_wHw", icon: "▶", color: "#20c997" },
  { label: "制作実績", desc: "MV・楽曲クレジット", url: "/works", icon: "🎬", color: "#f783ac" },
];

export const works: { title: string; youtubeId: string; desc?: string }[] = [
  { title: "Bet My Existence", youtubeId: "nRiuS6JsQfI", desc: "2026.05" },
];

export const gallery: string[] = [
  // "/gallery/01.png",
  // 画像を追加する場合はここに追記
];
