"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroVideoSrc } from "./data";
import { createHeroLog, type HeroLog } from "./heroDebug";

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
// HEVC(iOS/Safari)は canPlayType が空でも試す（WebKit は再生できるのに空を返す場合があるため。失敗したら error で静止画に戻る）
function chooseSrc(v: HeroVideoSrc | null, log: HeroLog): string | null {
  const probe = document.createElement("video");
  const hevcMp4 = probe.canPlayType('video/mp4; codecs="hvc1"');
  const hevcMov = probe.canPlayType('video/quicktime; codecs="hvc1"');
  const webm = probe.canPlayType('video/webm; codecs="vp9"');
  const ua = navigator.userAgent;
  const hevc = prefersHevc();
  log(`UA iPhone/iPad=${/iP(hone|ad|od)/.test(ua)} Safari=${/Safari/.test(ua)} Chrome系=${/Chrome|Chromium|CriOS|FxiOS|Edg/.test(ua)} Android=${/Android/.test(ua)} → ${hevc ? "hevc" : "webm"}`);
  log(`canPlayType hevc(mp4)="${hevcMp4}" hevc(quicktime)="${hevcMov}" webm="${webm}"`);
  if (!v) {
    log("この幅用の動画が data.ts に無い → 静止画のまま");
    return null;
  }
  if (!hevc && !webm) {
    log("webm を再生できない → 静止画のまま");
    return null;
  }
  const src = hevc ? v.hevc : v.webm;
  log(`src=${src}`);
  return src;
}

// 最初の一画面の透過動画。静止画(Hero.tsx の <picture>)の上に同じ位置・同じ切り取りで重なる。
// 繰り返しは loop 属性に頼らず、同じ動画2本(A・B)を交互に再生して継ぎ目をなくす。
// 表に出ている側が終わる間際に、先頭の1コマで待機していた側を再生して表に出し、出ていた側は先頭へ戻して待機させる。
// 失敗したら2本とも外し、静止画のまま
export default function HeroMotion({ video }: { video: { wide: HeroVideoSrc | null; tall: HeroVideoSrc | null } }) {
  const refA = useRef<HTMLVideoElement | null>(null);
  const refB = useRef<HTMLVideoElement | null>(null);
  const logRef = useRef<HeroLog>(() => {});
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const fail = (reason: string) => {
    logRef.current(`静止画へ戻す: ${reason}`);
    setPlaying(false);
    setSrc(null);
  };

  // iOS 対策：muted / playsinline を「属性として」play() の前に確実に付ける（React の muted は属性にならないことがある）
  const prep = (el: HTMLVideoElement | null) => {
    if (!el) return;
    el.defaultMuted = true;
    el.muted = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");
  };
  const setA = useCallback((el: HTMLVideoElement | null) => {
    refA.current = el;
    prep(el);
  }, []);
  const setB = useCallback((el: HTMLVideoElement | null) => {
    refB.current = el;
    prep(el);
  }, []);

  // 1) 形式と縦横の選択（動きを減らす設定なら何もしない。700pxの境をまたいだら選び直す）
  useEffect(() => {
    const log = createHeroLog();
    logRef.current = log;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    log(`prefers-reduced-motion=${reduced} 画面幅=${window.innerWidth}`);
    if (reduced) {
      log("動きを減らす設定 → 静止画のまま");
      return;
    }
    const mq = window.matchMedia(TALL_QUERY);
    const pick = () => {
      log(`選択: ${mq.matches ? "tall" : "wide"}`);
      setPlaying(false);
      setSrc(chooseSrc(mq.matches ? video.tall : video.wide, log));
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
    const log = logRef.current;
    const vids = [a, b];
    const nameOf = (v: HTMLVideoElement) => (v === a ? "A" : "B");
    let front = 0; // 表に出ている側
    let inView = true;
    let swapping = false; // 1周に1回だけ切り替える
    let pendingSwap = false; // 止まっている間に切り替え時刻が来た
    let rvfcId = 0;
    let rvfcTarget: HTMLVideoElement | null = null;
    let timer = 0;
    const hasRvfc = "requestVideoFrameCallback" in a;
    const stopped = () => document.hidden || !inView;
    log(`再生準備 requestVideoFrameCallback=${hasRvfc}`);
    // 視差の transform（StarField が静止画に書いている）を、いま出た動画にも揃える
    const stillImg = a.closest(".hero")?.querySelector<HTMLElement>(".hero-picture img");
    if (stillImg) vids.forEach((v) => (v.style.transform = stillImg.style.transform));

    // 自動再生が拒否されたら、すぐ静止画に戻さず、最初のユーザー操作で一度だけ再試行する
    const GESTURES = ["touchstart", "pointerdown", "scroll", "click"] as const;
    let gestureArmed = false;
    const disarmGesture = () => {
      GESTURES.forEach((t) => window.removeEventListener(t, onGesture));
      gestureArmed = false;
    };
    const onGesture = () => {
      disarmGesture();
      const v = vids[front];
      log("ユーザー操作 → play() を再試行");
      v.play().then(
        () => log(`${nameOf(v)} 再試行 play() resolve`),
        (e: unknown) => {
          log(`${nameOf(v)} 再試行 play() reject ${e instanceof DOMException ? e.name : "?"}`);
          fail("再試行も拒否された（省電力モードや自動再生禁止の設定）");
        },
      );
    };
    const armGesture = () => {
      if (gestureArmed) return;
      gestureArmed = true;
      GESTURES.forEach((t) => window.addEventListener(t, onGesture, { passive: true }));
      log("自動再生が拒否された → 最初の操作で再試行する");
    };

    const onPlayError = (e: unknown) => {
      const name = e instanceof DOMException ? e.name : "";
      if (name === "AbortError") return; // pause との競合は失敗ではない
      if (name === "NotAllowedError") {
        armGesture();
        return;
      }
      fail(`play() が失敗 ${name}`);
    };
    const tryPlay = (v: HTMLVideoElement, why: string) => {
      v.play().then(
        () => log(`${nameOf(v)} play() resolve (${why})`),
        (e: unknown) => {
          log(`${nameOf(v)} play() reject ${e instanceof DOMException ? e.name : "?"}: ${e instanceof Error ? e.message : ""}`);
          onPlayError(e);
        },
      );
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
        // 待機側がまだ先頭のコマを出せない（iOS は play() まで読み込まないことがある）：
        // 全体は失敗扱いにせず、出ている側を頭へ戻して続ける（loop 相当の保険）
        log(`待機側 ${nameOf(next)} が未準備(readyState=${next.readyState}) → ${nameOf(cur)} を頭へ戻して続ける`);
        cur.currentTime = 0;
        tryPlay(cur, "頭へ戻して続ける");
        arm(cur);
        return;
      }
      log(`切り替え ${nameOf(cur)}→${nameOf(next)}`);
      next.classList.add("is-active");
      cur.classList.remove("is-active");
      tryPlay(next, "切り替え");
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
      tryPlay(v, "表示中・タブ復帰");
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
    // 最初の再生が始まったら表に出す（フェードイン）。待機側 B の読み込みはここで促す
    // （iOS は preload を無視する。B の play()→pause() は A を止めることがあるのでしない）
    const onFirstPlaying = () => {
      a.classList.add("is-active", "is-intro");
      setPlaying(true);
      log("B.load() を呼ぶ");
      b.load();
    };
    // 待機側は先頭の1コマで止めておく（display:none にはしない＝opacity:0 で隠す）
    const onBackLoaded = () => {
      if (vids[front] === b) return;
      b.pause();
      if (b.currentTime !== 0) b.currentTime = 0;
    };

    // 診断ログ用：各 video のイベントを記録する（?debug=1 のときだけ表示される）
    const logEvents = ["loadedmetadata", "canplay", "playing", "pause", "stalled", "waiting"] as const;
    const onLogEvent = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      if (e.type === "loadedmetadata") log(`${nameOf(v)} loadedmetadata ${v.videoWidth}x${v.videoHeight} ${v.duration.toFixed(2)}s`);
      else log(`${nameOf(v)} ${e.type}`);
    };
    const onError = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      log(`${nameOf(v)} error code=${v.error?.code} message=${v.error?.message ?? ""}`);
      fail(`${nameOf(v)} の読み込み・再生エラー`);
    };

    a.addEventListener("playing", onFirstPlaying, { once: true });
    b.addEventListener("loadeddata", onBackLoaded);
    vids.forEach((v) => {
      v.addEventListener("ended", onEnded);
      v.addEventListener("timeupdate", onTimeUpdate);
      v.addEventListener("error", onError);
      logEvents.forEach((t) => v.addEventListener(t, onLogEvent));
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
      disarmGesture();
      a.removeEventListener("playing", onFirstPlaying);
      b.removeEventListener("loadeddata", onBackLoaded);
      vids.forEach((v) => {
        v.removeEventListener("ended", onEnded);
        v.removeEventListener("timeupdate", onTimeUpdate);
        v.removeEventListener("error", onError);
        logEvents.forEach((t) => v.removeEventListener(t, onLogEvent));
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
  // どちらも loop なし。A は自動再生、B は先頭で待機（autoplay は付けない＝A と同時に走らないように）。
  // muted / playsinline は ref の prep() でも属性として付ける。表に出す/隠すは is-active を付け外しして行う
  const common = {
    src,
    muted: true,
    playsInline: true,
    "webkit-playsinline": "",
    preload: "auto" as const,
    "aria-hidden": true as const,
    tabIndex: -1,
    disablePictureInPicture: true,
  };
  return (
    <>
      <video key={`${src}-a`} ref={setA} className="hero-video" autoPlay {...common} />
      <video key={`${src}-b`} ref={setB} className="hero-video" {...common} />
    </>
  );
}
