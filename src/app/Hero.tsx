import { hero, profile } from "./data";
import HeroMotion from "./HeroMotion";
import HeroVoice from "./HeroVoice";

// 最初の一画面：絵＋縦書きの題字＋大きな一文＋虹の弧
export default function Hero() {
  return (
    <section className="hero">
      {/* 幅700px以下は縦長の絵。差し替えは data.ts の hero.image だけ */}
      {/* 静止画は常に置く(JS無効・動きを減らす設定・動画の読み込み前はこれが見える)。
          透過動画は HeroMotion が同じ位置に重ねる。mask は .hero-media に掛かる */}
      <div className="hero-media">
        <picture className="hero-picture">
          <source media="(max-width: 700px)" srcSet={hero.image.tall} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.image.wide} alt="" fetchPriority="high" />
        </picture>
        <HeroMotion video={hero.video} />
      </div>

      {/* しるし：夜空にかかる細い虹の弧（左から右へ描かれる） */}
      <svg
        className="hero-arc"
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="hero-arc-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
            <stop offset="0" stopColor="#ff6b6b" />
            <stop offset="0.1667" stopColor="#ffa94d" />
            <stop offset="0.3333" stopColor="#ffd43b" />
            <stop offset="0.5" stopColor="#69db7c" />
            <stop offset="0.6667" stopColor="#4dabf7" />
            <stop offset="0.8333" stopColor="#748ffc" />
            <stop offset="1" stopColor="#da77f2" />
          </linearGradient>
          {/* 横長の絵では弧を人物の手前で消すので、7色をその範囲に収める */}
          <linearGradient id="hero-arc-grad-wide" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="640" y2="0">
            <stop offset="0" stopColor="#ff6b6b" />
            <stop offset="0.1667" stopColor="#ffa94d" />
            <stop offset="0.3333" stopColor="#ffd43b" />
            <stop offset="0.5" stopColor="#69db7c" />
            <stop offset="0.6667" stopColor="#4dabf7" />
            <stop offset="0.8333" stopColor="#748ffc" />
            <stop offset="1" stopColor="#da77f2" />
          </linearGradient>
        </defs>
        <path
          className="arc-tall"
          d="M 1040 190 Q 520 -10 -40 130"
          fill="none"
          stroke="url(#hero-arc-grad)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <path
          className="arc-wide"
          d="M 1040 190 Q 520 -10 -40 130"
          fill="none"
          stroke="url(#hero-arc-grad-wide)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* 音夢をタップするとしゃべる（当たり判定は見えないボタン。文字やリンクより下） */}
      <HeroVoice voices={hero.voices} hint={hero.voiceHint} label={hero.voiceLabel} />

      <div className="hero-inner">
        <div className="hero-title">
          <h1>{profile.name}</h1>
          <p className="hero-reading">{hero.reading}</p>
        </div>
        <div className="hero-foot">
          <p className="hero-catch">{hero.catch}</p>
          <a href={hero.cta.href} className="hero-link">
            {hero.cta.label}
            <span aria-hidden="true"> →</span>
          </a>
        </div>
      </div>

      <span className="hero-scroll" aria-hidden="true" />
    </section>
  );
}
