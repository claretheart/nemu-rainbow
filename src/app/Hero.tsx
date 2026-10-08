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
