"use client";

import { useEffect, useRef } from "react";

// ===== 調整用の定数 =====

// --- 星（奥行き z=0 が奥、1 が手前）---
const STAR_COUNT = {
  desktop: { min: 300, max: 600, areaPerStar: 3400 }, // 画面面積÷areaPerStar 個（min〜max）
  mobile: { min: 150, max: 300, areaPerStar: 1800 }, // 幅700px以下
};
const STAR_RATE = [0.04, 0.22]; // スクロール量に対して上へ流れる割合（奥→手前）
const STAR_RADIUS = [0.4, 1.4]; // 半径px（奥→手前）。ごく一部だけ STAR_RADIUS_BIG まで
const STAR_RADIUS_BIG = 1.9;
const STAR_ALPHA = [0.25, 0.9]; // 不透明度（奥→手前）
const STAR_TWINKLE_RATE = 0.1; // またたく星の割合（ゆっくり）
const STAR_RAINBOW_CHANCE = 0.04; // 淡い虹色の星の割合（残りは青白）

// --- 光の粒（花びらの代わり。斜め下へ漂う）---
const MOTE_COUNT = { desktop: 50, mobile: 30 };
const MOTE_BOKEH = { desktop: 2, mobile: 1 }; // うち、大きくぼけた粒の数（人物・文字の手前に出る分は FRONT_* 側）
const MOTE_SIZE = [5, 20]; // 直径px（奥→手前）
const MOTE_BOKEH_SIZE = [70, 120];
const MOTE_FALL = [5, 26]; // 落ちる速さ px/秒（奥→手前）
const MOTE_ALPHA = [0.5, 0.35]; // 不透明度（奥→手前。大きいほど淡く）
const MOTE_BOKEH_ALPHA = 0.2;
const MOTE_SCROLL_RATE = [0.1, 0.35]; // スクロールで流れる割合（奥→手前）
const MOTE_STILL_COUNT = 8; // 動きを減らす設定のときに静止で出す数

// --- 手前の大きくぼけた光の粒（人物や文字より手前を横切る。専用の canvas に描く）---
// 動きを減らす設定では何も描かない。ぼけ玉スプライトの中心は約0.55倍の濃さなので、
// 実際の中心の不透明度は FRONT_ALPHA × 0.55 ≒ .10〜.16。通常合成
const FRONT_COUNT = { desktop: 5, mobile: 3 };
const FRONT_SIZE = [60, 140]; // 直径px
const FRONT_ALPHA = [0.18, 0.28];
const FRONT_FALL = [30, 50]; // 落ちる速さ px/秒（奥の粒より少し速い）
const FRONT_SCROLL_RATE = [0.35, 0.5]; // スクロールで流れる割合（奥の粒より大きい）

// --- 光の玉（区切りごとに色が変わる）---
const ORB_ALPHA = 0.3; // 中心の不透明度（本文のコントラストを落とさない上限）
const ORB_RADIUS = 0.36; // 半径 = 画面の長辺 × この値
const ORB_COLOR_TAU = 0.3; // 色が移る時間定数(秒)。約1秒でなめらかに移りきる
// 玉の置き場所（画面比。本文の真後ろを避けて端寄り）と漂い（幅・高さに対する振れ幅、周期秒）
const ORBS = [
  { x: 0.05, y: 0.3, ampX: 0.05, ampY: 0.06, period: 47, phase: 0 },
  { x: 0.96, y: 0.74, ampX: 0.04, ampY: 0.07, period: 61, phase: 2.1 },
];
// 区切りごとの玉の色 [玉1, 玉2]（虹の7色から）。キーは hero / section の id。無ければ DEFAULT_SECTION
const DEFAULT_SECTION = "hero";
const SECTION_COLORS: Record<string, [number[], number[]]> = {
  hero: [[150, 190, 255], [116, 143, 252]], // 青白
  yorujikan: [[255, 169, 77], [255, 107, 107]], // 琥珀寄りの橙
  works: [[90, 215, 190], [77, 171, 247]], // 緑〜水色
  contact: [[116, 143, 252], [218, 119, 242]], // 青紫
  links: [[218, 119, 242], [255, 107, 107]], // 紫
};

const DPR_MAX = 2;
const DPR_MAX_MOBILE = 1.5;
const MOBILE_WIDTH = 700;

// ===== 乱数・色 =====

// 種つき乱数
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// 星・光の粒の色：基本は青白。まれに「虹のかけら」のパステル色
const STAR_TINTS = [
  "220, 230, 255",
  "255, 244, 214",
  "255, 214, 224",
  "214, 255, 231",
  "214, 228, 255",
  "236, 214, 255",
];
// 光の粒の色：白＋パステル
const MOTE_TINTS = ["255, 255, 255", ...STAR_TINTS.slice(1)];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (v: number, m: number) => ((v % m) + m) % m;

// ===== 粒の定義 =====
type Star = { x: number; y: number; r: number; a: number; rate: number; tint: number; twSpeed: number; twPhase: number };
type Mote = {
  x: number; y: number; size: number; a: number; rate: number; tint: number; level: number;
  vx: number; vy: number; swayAmp: number; swayFreq: number; phase: number;
};

function makeStars(count: number): Star[] {
  const rand = seededRandom(42);
  return Array.from({ length: count }, () => {
    const z = Math.pow(rand(), 1.5); // 奥に多く、手前は少なめ
    const big = z > 0.9 && rand() < 0.25;
    const rainbow = rand() < STAR_RAINBOW_CHANCE;
    const star: Star = {
      x: rand(),
      y: rand(),
      r: big ? STAR_RADIUS_BIG : lerp(STAR_RADIUS[0], STAR_RADIUS[1], z),
      a: lerp(STAR_ALPHA[0], STAR_ALPHA[1], z) * (0.75 + rand() * 0.25),
      rate: lerp(STAR_RATE[0], STAR_RATE[1], z),
      tint: rainbow ? 1 + Math.floor(rand() * (STAR_TINTS.length - 1)) : 0,
      twSpeed: 0,
      twPhase: rand() * Math.PI * 2,
    };
    if (rand() < STAR_TWINKLE_RATE) star.twSpeed = 0.4 + rand() * 0.8;
    return star;
  });
}

function makeMotes(count: number, bokehCount: number): Mote[] {
  const rand = seededRandom(7);
  const motes = Array.from({ length: count }, (_, i): Mote => {
    const bokeh = i >= count - bokehCount;
    const z = bokeh ? 0.8 + rand() * 0.2 : rand();
    const fall = bokeh ? MOTE_FALL[1] * (1 + rand() * 0.4) : lerp(MOTE_FALL[0], MOTE_FALL[1], z);
    return {
      x: rand(),
      y: rand(),
      size: bokeh ? lerp(MOTE_BOKEH_SIZE[0], MOTE_BOKEH_SIZE[1], rand()) : lerp(MOTE_SIZE[0], MOTE_SIZE[1], z),
      a: bokeh ? MOTE_BOKEH_ALPHA : lerp(MOTE_ALPHA[0], MOTE_ALPHA[1], z),
      rate: lerp(MOTE_SCROLL_RATE[0], MOTE_SCROLL_RATE[1], z),
      tint: rand() < 0.4 ? 0 : 1 + Math.floor(rand() * (MOTE_TINTS.length - 1)),
      level: bokeh ? 2 : z < 0.4 ? 0 : z < 0.75 ? 1 : 2, // 手前ほどぼける
      vx: fall * 0.4,
      vy: fall,
      swayAmp: 6 + rand() * 10,
      swayFreq: 0.2 + rand() * 0.4,
      phase: rand() * Math.PI * 2,
    };
  });
  // 奥→手前の順に描く（ぼけ玉が最後）
  return motes.sort((a, b) => a.rate - b.rate);
}

// 手前用：大きくぼけた粒だけ。初期位置は縦横をばらして中央に集まらないようにする
function makeFrontMotes(count: number): Mote[] {
  const rand = seededRandom(19);
  return Array.from({ length: count }, (_, i): Mote => {
    const fall = lerp(FRONT_FALL[0], FRONT_FALL[1], rand());
    return {
      x: (i * 0.618 + rand() * 0.2) % 1,
      y: (i / count + rand() * 0.15) % 1,
      size: lerp(FRONT_SIZE[0], FRONT_SIZE[1], rand()),
      a: lerp(FRONT_ALPHA[0], FRONT_ALPHA[1], rand()),
      rate: lerp(FRONT_SCROLL_RATE[0], FRONT_SCROLL_RATE[1], rand()),
      tint: rand() < 0.4 ? 0 : 1 + Math.floor(rand() * (MOTE_TINTS.length - 1)),
      level: 2,
      vx: fall * (0.3 + rand() * 0.3),
      vy: fall,
      swayAmp: 10 + rand() * 16,
      swayFreq: 0.12 + rand() * 0.25,
      phase: rand() * Math.PI * 2,
    };
  });
}

// ぼけ玉のスプライト（色×ぼけ具合）。毎フレーム blur や shadowBlur は使わず、これを drawImage する
const SPRITE_SIZE = 64;
const SPRITE_STOPS: [number, number][][] = [
  [[0, 1], [0.45, 0.85], [1, 0]], // 0: くっきり
  [[0, 0.9], [0.3, 0.55], [1, 0]], // 1: ややぼけ
  [[0, 0.55], [0.4, 0.3], [1, 0]], // 2: 大きくぼけ
];
function makeSprites(): HTMLCanvasElement[][] {
  return MOTE_TINTS.map((tint) =>
    SPRITE_STOPS.map((stops) => {
      const c = document.createElement("canvas");
      c.width = c.height = SPRITE_SIZE;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(SPRITE_SIZE / 2, SPRITE_SIZE / 2, 0, SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2);
      stops.forEach(([o, a]) => grad.addColorStop(o, `rgba(${tint}, ${a})`));
      g.fillStyle = grad;
      g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      return c;
    }),
  );
}

// 全ページ共通の「動く夜空」。canvas 1枚を中身より奥に固定。
// 星（奥行き）＋漂う光の粒＋区切りごとに色が変わる光の玉。サーバーでは canvas 要素だけ出す
export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const frontCanvas = frontRef.current;
    const fctx = frontCanvas?.getContext("2d");
    if (!canvas || !ctx || !frontCanvas || !fctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const allStars = makeStars(STAR_COUNT.desktop.max);
    const allMotes = makeMotes(MOTE_COUNT.desktop, MOTE_BOKEH.desktop);
    const sprites = makeSprites();

    let W = 0;
    let H = 0;
    let stars = allStars;
    let motes = allMotes;
    let frontMotes: Mote[] = [];
    let scroll = window.scrollY;
    let raf = 0;
    let heroMoveQueued = false;
    // ヒーローの絵・動画の視差：--scroll-y を全体に書くと毎フレーム全体の再計算になるので、対象に直接 transform を書く
    const heroParallax = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hero-parallax")) || 0.3;
    let heroEl: HTMLElement | null = null;
    let heroH = 0;
    let sectionDirty = true;
    let frame = 0;
    let lastT = 0;

    // 光の玉の現在色（目標へなめらかに移る）
    const targetOf = (id: string) => SECTION_COLORS[id] ?? SECTION_COLORS[DEFAULT_SECTION];
    let target = targetOf(DEFAULT_SECTION);
    const cur = target.map((c) => c.slice());

    // 画面中央にかかっている区切り（hero / section[id]）を調べる。無ければ既定色
    const detectSection = () => {
      sectionDirty = false;
      const mid = window.innerHeight / 2;
      let id = DEFAULT_SECTION;
      document.querySelectorAll<HTMLElement>(".hero, section[id]").forEach((el) => {
        if (el.getBoundingClientRect().top <= mid) id = el.classList.contains("hero") ? "hero" : el.id;
      });
      target = targetOf(id);
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      heroEl = null; // ヒーローの高さを測り直す
      // モバイルのアドレスバー出入りでの高さの小変動では作り直さない
      if (w === W && Math.abs(h - H) < 150) return;
      W = w;
      H = h;
      const mobile = W <= MOBILE_WIDTH;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? DPR_MAX_MOBILE : DPR_MAX);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 以降は CSS px で描く
      if (!reduced) {
        frontCanvas.width = canvas.width;
        frontCanvas.height = canvas.height;
        fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        frontMotes = makeFrontMotes(mobile ? FRONT_COUNT.mobile : FRONT_COUNT.desktop);
      }

      const sc = mobile ? STAR_COUNT.mobile : STAR_COUNT.desktop;
      const starN = Math.min(sc.max, Math.max(sc.min, Math.round((W * H) / sc.areaPerStar)));
      stars = allStars.slice(0, starN);
      if (reduced) {
        motes = allMotes.slice(0, MOTE_STILL_COUNT);
      } else {
        const n = mobile ? MOTE_COUNT.mobile : MOTE_COUNT.desktop;
        const bokeh = mobile ? MOTE_BOKEH.mobile : MOTE_BOKEH.desktop;
        motes = makeMotes(n, bokeh);
      }
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;

      // 光の玉の色を目標へ寄せる
      const k = reduced ? 0 : 1 - Math.exp(-dt / ORB_COLOR_TAU);
      cur.forEach((c, i) => {
        for (let j = 0; j < 3; j++) c[j] += (target[i][j] - c[j]) * k;
      });

      // 1. 光の玉（いちばん奥）
      const R = Math.max(W, H) * ORB_RADIUS;
      ORBS.forEach((o, i) => {
        const ang = reduced ? o.phase : (t / o.period) * Math.PI * 2 + o.phase;
        const cx = (o.x + Math.sin(ang) * o.ampX) * W;
        const cy = (o.y + Math.cos(ang * 0.8) * o.ampY) * H;
        const rgb = `${Math.round(cur[i][0])}, ${Math.round(cur[i][1])}, ${Math.round(cur[i][2])}`;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        grad.addColorStop(0, `rgba(${rgb}, ${ORB_ALPHA})`);
        grad.addColorStop(0.45, `rgba(${rgb}, ${ORB_ALPHA * 0.35})`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      });

      // 2. 星（奥行きに応じてスクロールで流れる）
      const sy = reduced ? 0 : scroll;
      let lastTint = -1;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (s.tint !== lastTint) {
          ctx.fillStyle = `rgb(${STAR_TINTS[s.tint]})`;
          lastTint = s.tint;
        }
        const x = s.x * W;
        const y = mod(s.y * H - sy * s.rate, H);
        let a = s.a;
        if (s.twSpeed && !reduced) a *= 0.7 + 0.3 * Math.sin(t * s.twSpeed + s.twPhase);
        ctx.globalAlpha = a;
        if (s.r < 1.1) {
          ctx.fillRect(x - s.r, y - s.r, s.r * 2, s.r * 2);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. 光の粒（斜め下へ漂う。手前ほど大きくぼけて速い。画面外に出たら反対側から戻る）
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        const padX = W + m.size * 2;
        const padY = H + m.size * 2;
        const tt = reduced ? 0 : t;
        const sway = Math.sin(tt * m.swayFreq + m.phase) * m.swayAmp;
        const x = mod(m.x * padX + tt * m.vx + sway, padX) - m.size;
        const y = mod(m.y * padY + tt * m.vy - sy * m.rate, padY) - m.size;
        ctx.globalAlpha = m.a;
        ctx.drawImage(sprites[m.tint][m.level], x - m.size / 2, y - m.size / 2, m.size, m.size);
      }
      ctx.globalAlpha = 1;

      // 4. 手前の canvas：人物や文字より手前を横切る、大きくぼけた粒だけ（動きを減らす設定では描かない）
      if (reduced) return;
      fctx.clearRect(0, 0, W, H);
      for (let i = 0; i < frontMotes.length; i++) {
        const m = frontMotes[i];
        const padX = W + m.size * 2;
        const padY = H + m.size * 2;
        const sway = Math.sin(t * m.swayFreq + m.phase) * m.swayAmp;
        const x = mod(m.x * padX + t * m.vx + sway, padX) - m.size;
        const y = mod(m.y * padY + t * m.vy - sy * m.rate, padY) - m.size;
        fctx.globalAlpha = m.a;
        fctx.drawImage(sprites[m.tint][m.level], x - m.size / 2, y - m.size / 2, m.size, m.size);
      }
      fctx.globalAlpha = 1;
    };

    // 動きを減らす設定：1回だけ静止画として描く（リサイズ時のみ描き直す）
    if (reduced) {
      resize();
      draw(0, 0);
      const onResizeStill = () => {
        resize();
        draw(0, 0);
      };
      window.addEventListener("resize", onResizeStill);
      return () => window.removeEventListener("resize", onResizeStill);
    }

    const loop = (now: number) => {
      const t = now / 1000;
      const dt = Math.min(t - lastT, 0.1);
      lastT = t;
      // 区切りの検出は、スクロール後と約0.5秒おき（ページ移動で区切りが入れ替わるため）
      if (sectionDirty || frame++ % 30 === 0) detectSection();
      draw(t, dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      lastT = performance.now() / 1000;
      raf = requestAnimationFrame(loop);
    };

    const moveHero = () => {
      heroMoveQueued = false;
      const el = document.querySelector<HTMLElement>(".hero");
      if (el !== heroEl) {
        heroEl = el;
        heroH = el ? el.offsetHeight : 0;
      }
      // ヒーローが画面の外に出てからは何もしない
      if (!el || scroll > heroH) return;
      const y = `translate3d(0, ${scroll * heroParallax}px, 0)`;
      el.querySelectorAll<HTMLElement>(".hero-picture img, .hero-video").forEach((t) => {
        t.style.transform = y;
      });
    };
    // スクロール量は passive リスナーで受ける（rAF で間引く）
    const onScroll = () => {
      scroll = window.scrollY;
      sectionDirty = true;
      if (heroMoveQueued) return;
      heroMoveQueued = true;
      requestAnimationFrame(moveHero);
    };
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    };

    resize();
    onScroll();
    start();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="star-field" aria-hidden="true" />
      <canvas ref={frontRef} className="star-field is-front" aria-hidden="true" />
    </>
  );
}
