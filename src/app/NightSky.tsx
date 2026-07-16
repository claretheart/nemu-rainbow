"use client";

import { useEffect, useRef } from "react";

// 再現性のある乱数（シード付き）— リサイズしても星の配置が変わらない
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// 星の色：基本は青白。まれに「虹のかけら」のパステル色
const STAR_TINTS = [
  "220, 230, 255",
  "255, 244, 214",
  "255, 214, 224",
  "214, 255, 231",
  "214, 228, 255",
  "236, 214, 255",
];

type Star = {
  x: number;
  y: number;
  r: number;
  tint: string;
  base: number;
  amp: number;
  speed: number;
  phase: number;
};

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
};

export default function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let stars: Star[] = [];
    let moon: HTMLCanvasElement | null = null;
    const shots: ShootingStar[] = [];
    let raf = 0;
    let last = performance.now();
    let nextShotIn = 2.5 + Math.random() * 4;

    // 三日月はオフスクリーンで一度だけ描く（切り抜きが本体の星を消さないように）
    const makeMoon = (size: number) => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const mctx = c.getContext("2d");
      if (!mctx) return c;
      const r = size / 2;
      mctx.beginPath();
      mctx.arc(r, r, r * 0.62, 0, Math.PI * 2);
      mctx.fillStyle = "rgba(233, 237, 255, 0.95)";
      mctx.fill();
      mctx.globalCompositeOperation = "destination-out";
      mctx.beginPath();
      mctx.arc(r - size * 0.17, r - size * 0.1, r * 0.58, 0, Math.PI * 2);
      mctx.fill();
      return c;
    };

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rand = seededRandom(42);
      const count = Math.min(Math.round((W * H) / 5200), 320);
      stars = Array.from({ length: count }, () => {
        const tintRoll = rand();
        return {
          x: rand() * W,
          y: rand() * H,
          r: rand() * 1.2 + 0.3,
          tint: tintRoll < 0.72 ? STAR_TINTS[0] : STAR_TINTS[1 + Math.floor(rand() * (STAR_TINTS.length - 1))],
          base: rand() * 0.35 + 0.35,
          amp: rand() * 0.3 + 0.12,
          speed: rand() * 1.6 + 0.4,
          phase: rand() * Math.PI * 2,
        };
      });
      moon = makeMoon(Math.round(Math.min(W, H) * 0.18));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);

      // 月あかり＋三日月
      const mx = W * 0.8;
      const my = H * 0.14;
      const glow = ctx.createRadialGradient(mx, my, 0, mx, my, Math.min(W, H) * 0.34);
      glow.addColorStop(0, "rgba(205, 215, 255, 0.11)");
      glow.addColorStop(1, "rgba(205, 215, 255, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      if (moon) {
        ctx.drawImage(moon, mx - moon.width / 2, my - moon.height / 2);
      }

      // またたく星
      for (const s of stars) {
        const a = reduceMotion
          ? s.base + s.amp * 0.5
          : s.base + s.amp * Math.sin(t * s.speed + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.tint}, ${Math.max(a, 0.05).toFixed(3)})`;
        ctx.fill();
      }

      // 流れ星（淡いグロー＋本体の二重ストローク）
      for (let i = shots.length - 1; i >= 0; i--) {
        const sh = shots[i];
        const k = Math.max(1 - sh.age / sh.life, 0);
        const tailX = sh.x - sh.vx * 0.15;
        const tailY = sh.y - sh.vy * 0.15;
        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * k})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.lineCap = "round";
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        if (sh.age >= sh.life) shots.splice(i, 1);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      nextShotIn -= dt;
      if (nextShotIn <= 0) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const speed = 520 + Math.random() * 320;
        shots.push({
          x: W * (0.15 + Math.random() * 0.7),
          y: H * (0.05 + Math.random() * 0.3),
          vx: dir * speed,
          vy: speed * (0.35 + Math.random() * 0.25),
          age: 0,
          life: 0.7 + Math.random() * 0.5,
        });
        nextShotIn = 4 + Math.random() * 7;
      }
      for (const sh of shots) {
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        sh.age += dt;
      }

      draw(now / 1000);
      raf = requestAnimationFrame(tick);
    };

    setup();
    if (reduceMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(tick);
    }

    const onResize = () => {
      setup();
      if (reduceMotion) draw(0);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="night-sky" aria-hidden="true">
      <div className="aurora" />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
