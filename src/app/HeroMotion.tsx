"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroVideoSrc } from "./data";

// 静止画から動画へ切り替えるときのフェード時間(ms)。globals.css の .is-intro のアニメーション時間と合わせる
const FADE_MS = 400;
// 繰り返しの切り替えを、最後のコマの何秒手前(以内)で始めるか。24fpsの1コマ=約0.042秒より少し長い
const SWITCH_LEAD_S = 0.06;
// requestVideoFrameCallback が無いブラウザ用：残りがこの秒数を切ったら、終わり間際にタイマーで切り替える
const FALLBACK_NEAR_S = 0.35;
// 縦長用に切り替える幅（Hero.tsx の <source media> と同じ）
const TALL_QUERY = "(max-width: 700px)";

// Safari / iOS は WebKit（HEVC+アルファ）、それ以外は webm（VP9+アルファ）。
// Chrome は hvc1 を再生できてもアルファを捨てて黒地になり、Safari は webm のアルファを扱えないため、
// <source> の並びに任せずここで決める
function prefersHevc(): boolean {
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) || (/Safari/.test(ua) && !/Chrome|Chromium|Android|CriOS|FxiOS|Edg/.test(ua));
}

// 使う動画のURLを決める。無い・再生できない形式なら null（静止画のまま）
function chooseSrc(v: HeroVideoSrc | null): string | null {
  if (!v) return null;
  const hevc = prefersHevc();
  const type = hevc ? 'video/mp4; codecs="hvc1"' : 'video/webm; codecs="vp9"';
  if (!document.createElement("video").canPlayType(type)) return null;
  return hevc ? v.hevc : v.webm;
}

// 最初の一画面の透過動画。静止画(Hero.tsx の <picture>)の上に同じ位置・同じ切り取りで重なる。
// 繰り返しは loop 属性に頼らず、同じ動画2本(A・B)を交互に再生して継ぎ目をなくす。
// 表に出ている側が終わる間際に、先頭の1コマで待機していた側を再生して表に出し、出ていた側は先頭へ戻して待機させる。
// 失敗したら2本とも外し、静止画のまま
export default function HeroMotion({ video }: { video: { wide: HeroVideoSrc | null; tall: HeroVideoSrc | null } }) {
  const refA = useRef<HTMLVideoElement>(null);
  const refB = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const fail = () => {
    setPlaying(false);
    setSrc(null);
  };

  // 1) 形式と縦横の選択（動きを減らす設定なら何もしない。700pxの境をまたいだら選び直す）
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mq = window.matchMedia(TALL_QUERY);
    const pick = () => {
      setPlaying(false);
      setSrc(chooseSrc(mq.matches ? video.tall : video.wide));
    };
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, [video]);

  // 2) 再生制御：2本の交互再生／タブが隠れたら止め、ヒーローが画面外の間も止める（止めるのは表に出ている側だけ）
  useEffect(() => {
    const a = refA.current;
    const b = refB.current;
    if (!a || !b || !src) return;
    const vids = [a, b];
    let front = 0; // 表に出ている側
    let inView = true;
    let swapping = false; // 1周に1回だけ切り替える
    let pendingSwap = false; // 止まっている間に切り替え時刻が来た
    let rvfcId = 0;
    let rvfcTarget: HTMLVideoElement | null = null;
    let timer = 0;
    const hasRvfc = "requestVideoFrameCallback" in a;
    const stopped = () => document.hidden || !inView;

    const onPlayError = (e: unknown) => {
      // pause との競合(AbortError)は失敗ではない。自動再生の拒否などは静止画に戻す
      if (!(e instanceof DOMException && e.name === "AbortError")) fail();
    };

    // 表に出ている側の終わり間際を見張る
    const arm = (v: HTMLVideoElement) => {
      swapping = false;
      window.clearTimeout(timer);
      timer = 0;
      if (!hasRvfc) return;
      rvfcTarget = v;
      const cb: VideoFrameRequestCallback = (_now, meta) => {
        if (v !== vids[front]) return;
        if (v.duration - meta.mediaTime <= SWITCH_LEAD_S) swap();
        else rvfcId = v.requestVideoFrameCallback(cb);
      };
      rvfcId = v.requestVideoFrameCallback(cb);
    };

    // 待機側を同じ瞬間に再生して表に出し、出ていた側は先頭へ戻して待機させる（フェードなしの即時切り替え）
    const swap = () => {
      if (swapping) return;
      if (stopped()) {
        pendingSwap = true;
        return;
      }
      swapping = true;
      const cur = vids[front];
      const next = vids[1 - front];
      if (next.readyState < 2) {
        // 待機側がまだ先頭のコマを出せない：出ている側を頭へ戻して続ける（loop 相当の保険）
        cur.currentTime = 0;
        cur.play().catch(onPlayError);
        arm(cur);
        return;
      }
      next.classList.add("is-active");
      cur.classList.remove("is-active");
      next.play().catch(onPlayError);
      front = 1 - front;
      cur.pause();
      cur.currentTime = 0;
      arm(next);
    };

    const sync = () => {
      const v = vids[front];
      if (stopped()) {
        v.pause();
        return;
      }
      if (pendingSwap) {
        pendingSwap = false;
        swap();
        return;
      }
      v.play().catch(onPlayError);
    };

    const onEnded = (e: Event) => {
      if (e.currentTarget === vids[front]) swap();
    };
    // rVFC が無いブラウザ：終わり間際に timeupdate で気づき、残り時間ぶんタイマーで待って切り替える
    const onTimeUpdate = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      if (hasRvfc || v !== vids[front] || timer) return;
      const remain = v.duration - v.currentTime;
      if (remain < FALLBACK_NEAR_S) timer = window.setTimeout(swap, Math.max(0, remain * 1000 - 30));
    };
    // 最初の再生が始まったら表に出す（フェードイン）
    const onFirstPlaying = () => {
      a.classList.add("is-active", "is-intro");
      setPlaying(true);
    };
    // 待機側は先頭の1コマで止めておく（display:none にはしない＝opacity:0 で隠す）
    const onBackLoaded = () => {
      b.pause();
      b.currentTime = 0;
    };

    a.addEventListener("playing", onFirstPlaying, { once: true });
    b.addEventListener("loadeddata", onBackLoaded, { once: true });
    vids.forEach((v) => {
      v.addEventListener("ended", onEnded);
      v.addEventListener("timeupdate", onTimeUpdate);
    });
    const io = new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    });
    io.observe(a.closest(".hero") ?? a);
    document.addEventListener("visibilitychange", sync);
    arm(a);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      a.removeEventListener("playing", onFirstPlaying);
      b.removeEventListener("loadeddata", onBackLoaded);
      vids.forEach((v) => {
        v.removeEventListener("ended", onEnded);
        v.removeEventListener("timeupdate", onTimeUpdate);
      });
      window.clearTimeout(timer);
      if (hasRvfc && rvfcTarget) rvfcTarget.cancelVideoFrameCallback(rvfcId);
    };
  }, [src]);

  // 3) フェードインが終わったら、下の静止画を隠す（透過どうしが二重に見えるのを避ける）
  useEffect(() => {
    const media = refA.current?.parentElement;
    if (!playing || !media) return;
    const id = window.setTimeout(() => {
      media.classList.add("is-video-done");
      media.querySelectorAll(".is-intro").forEach((el) => el.classList.remove("is-intro"));
    }, FADE_MS);
    return () => {
      window.clearTimeout(id);
      media.classList.remove("is-video-done");
    };
  }, [playing]);

  if (!src) return null;
  // どちらも loop なし。A は自動再生、B は先頭で待機。表に出す/隠すは is-active を付け外しして行う
  const common = {
    src,
    muted: true,
    playsInline: true,
    preload: "auto" as const,
    "aria-hidden": true as const,
    tabIndex: -1,
    disablePictureInPicture: true,
    onError: fail,
  };
  return (
    <>
      <video key={`${src}-a`} ref={refA} className="hero-video" autoPlay {...common} />
      <video key={`${src}-b`} ref={refB} className="hero-video" {...common} />
    </>
  );
}
