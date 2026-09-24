export const profile = {
  name: "音夢",
  reading: "ねむ",
  handle: "@nemu_rainbow",
  bio: [
    "夜の作業アプリ『よるじかん with ねむ』、発売中🌈",
    "イラスト・HP・LP・ゲーム・アニメ・アプリ・MVなど、だいたいなんでもつくります。",
    "得意は After Effects。ご依頼は X のDMへ。",
  ],
  avatar: "/avatar.png",
};

export const links = [
  { label: "X（旧Twitter）", desc: "おしごとのご相談はDMへ", url: "https://x.com/nemu_rainbow", icon: "𝕏", color: "#4dabf7" },
  { label: "ネムの夜日記", desc: "音夢の日常4コマ漫画", url: "https://nemu-night-diary.vercel.app", icon: "📖", color: "#9775fa" },
];

// LINE公式アカウントの友だち追加URL（差し替えはここ1箇所だけ）
export const LINE_FRIEND_URL = "https://lin.ee/n47BCvw";

// BOOTHの商品ページ（トップ・制作実績・手順ページで共用）
const YORUJIKAN_BOOTH_URL = "https://nemu-rainbow.booth.pm/items/8866390";

// 「よるじかん with ねむ」販売セクションの掲載コピー
// 価格表記は「980円(税込)」のみ（割引・期間限定を思わせる言葉は書かない）
export const yorujikan = {
  sectionLabel: "Now on Sale",
  title: "よるじかん with ねむ",
  catch: "夜の作業、いっしょにがんばろ？",
  status: "2026.09.20 発売",
  body: "PCで作業をするひとのためのデスクトップアプリです。",
  features: [
    "作業用BGM 150曲(Lo-fi 100曲+音夢の歌50曲)　自曲の取り込みも可",
    "ポモドーロタイマー/ToDo/統計/ノート",
    "オフラインで動きます",
  ],
  price: "980円(税込)",
  platform: "Mac(Apple Silicon)/Windows 10・11",
  boothUrl: YORUJIKAN_BOOTH_URL,
  boothLabel: "BOOTHで見る",
  lineLead: "アップデートのお知らせは LINE で",
  lineLabel: "LINEで友だち追加",
  linePendingNote: "(じゅんびちゅう)",
  guideLabel: "はじめて開くときの手順",
  guideHref: "/yorujikan/guide",
  images: {
    key: { src: "/yorujikan/key.webp", alt: "よるじかん with ねむ のキービジュアル。夜の窓辺でパソコンに向かう音夢" },
    // 機能紹介のサムネ（クリックで原寸を開く）
    shots: [
      { src: "/yorujikan/story.webp", alt: "おはなし85話、ぜんぶボイス付き。音夢が友だちの話をしてくれる画面" },
      { src: "/yorujikan/timer.webp", alt: "作業をはじめると音夢が声をかけてくれる。ポモドーロタイマーの画面" },
      { src: "/yorujikan/music.webp", alt: "作業用BGM 150曲。Lo-fiと音夢の歌の音楽ライブラリ画面" },
    ],
  },
};

// おしごと（制作のご依頼）
export const services = {
  sectionLabel: "おしごと",
  lead: "だいたいなんでもつくります。",
  items: ["イラスト", "HP・LP", "ゲーム", "アニメ", "アプリ", "MV・各種動画"],
  strength: "得意は After Effects",
  note: "個人サークルのため、お返事までお時間をいただく場合があります。",
  ctaLabel: "XのDMで相談する",
  ctaUrl: "https://x.com/nemu_rainbow",
};

// 制作実績（youtubeId があれば YouTube サムネ、image があればその画像を表示）
export const works: { title: string; desc?: string; youtubeId?: string; href?: string; image?: string }[] = [
  { title: "よるじかん with ねむ", desc: "デスクトップアプリ/2026.09 発売", href: YORUJIKAN_BOOTH_URL, image: "/yorujikan/key.webp" },
  { title: "アイネ・クライネ・ナハト・ムジーク", desc: "MV/2026.09 制作(公開準備中)", image: "/works/aine-kleine.webp" },
  { title: "Bet My Existence", youtubeId: "nRiuS6JsQfI", desc: "2026.05" },
  { title: "ニンジャ犯科帳「チュロスの商人」", youtubeId: "qKrRWRvHeeE", image: "/works/churros.webp", desc: "シーン6のアニメーションを担当" },
  { title: "ニンジャ犯科帳「野生の証明」", youtubeId: "U4Xhf8YvPps", desc: "シーン11(ラストシーン)のアニメーションを担当" },
  { title: "harukaze", desc: "ホームページ/京都の小さなお店向けデジタルパートナー", href: "https://harukaze-kyoto.jp", image: "/works/harukaze.webp" },
  { title: "音のかたづけ", desc: "LP・記事サイト/楽器・オーディオの手放し方ガイド", href: "https://oto-katazuke.com", image: "/works/oto-katazuke.webp" },
  { title: "CN学園ADV(仮題)", desc: "ブラウザゲーム/CryptoNinja二次創作の学園育成×恋愛アドベンチャー、制作中", image: "/works/cn-gakuen-pool.webp" },
  { title: "学習塾向け SNSショート動画の自動生成システム", desc: "Webアプリ/クイズ動画の一括生成から承認・投稿までを1画面で", image: "/works/juku-sns.webp" },
];

// 「はじめて開くときの手順」ページ（/yorujikan/guide）
// caution は強調表示、note は補足として小さく表示
type GuideStep = { text: string; caution?: string; note?: string };

export const guide = {
  title: "はじめて開くときの手順",
  lead: "はじめて開くときだけ、確認の画面が出ることがあります。下の手順どおりに進めれば開けます。",
  mac: {
    heading: "Mac",
    image: {
      src: "/yorujikan/mac-first-launch.webp",
      alt: "Macではじめて開くときの図解。STEP1で「完了」を押して閉じ、STEP2でシステム設定の「このまま開く」を押す",
    },
    steps: [
      { text: "「よるじかん with ねむ」を、アプリケーションフォルダへコピーします。" },
      {
        text: "「“よるじかん with ねむ”は開いていません」と出たら、「完了」を押します。(古いmacOSでは「開発元を確認できないため開けません」と表示されます)",
        caution: "青い「ゴミ箱に入れる」は押さないでください。",
      },
      { text: "「システム設定」→「プライバシーとセキュリティ」を開き、下のほうにある「このまま開く」を押します。" },
      {
        text: "2回目からは、ふつうに開けます。",
        note: "まちがえてゴミ箱に入れてしまったときは、もう一度アプリケーションフォルダへコピーしてください。",
      },
    ] as GuideStep[],
  },
  windows: {
    heading: "Windows",
    steps: [
      { text: "セットアップ(.exe)をダブルクリックします。" },
      { text: "青い画面「WindowsによってPCが保護されました」が出たら、「詳細情報」を押してから「実行」を押します。" },
    ] as GuideStep[],
  },
  notesHeading: "補足",
  notes: [
    "個人サークル制作のため、署名証明書を使っていません。そのため、はじめて開くときだけ確認の画面が出ます。",
    "セーブデータは、お使いのPCの中にだけ保存されます。",
    "わからないことがあれば、X(@nemu_rainbow)のDMまたはリプライでお問い合わせください。",
  ],
  contactLabel: "Xで問い合わせる",
  contactUrl: "https://x.com/nemu_rainbow",
};

export const gallery: string[] = [
  // "/gallery/01.png",
  // 画像を追加する場合はここに追記
];
