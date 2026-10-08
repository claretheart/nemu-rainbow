"use client";

import { useEffect, useRef, useState } from "react";
import { createHeroLog, type HeroLog } from "./heroDebug";

type Voice = { src: string; text: string };

const VOLUME = 0.9;
const HIDE_DELAY_MS = 800; // 音が終わってから吹き出しを消すまで
const FADE_MS = 200; // globals.css の .hero-bubble の transition と合わせる
const FAILED_SHOW_MS = 2500; // 音が出せなかったとき、吹き出しだけを見せる時間
const HINT_DELAY_MS = 3000; // 合図を出すまで（弧が描き終わる頃）
const HINT_SHOW_MS = 5000; // 合図を見せる時間

// 順番をシャッフルして一巡する（一巡のつなぎ目で同じ台詞が続かないようにする）
function shuffled(n: number, last: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (n > 1 && order[0] === last) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

// 音夢をタップするとしゃべる。見えないボタン（当たり判定）＋台詞の吹き出し＋最初の合図。
// 音声は最初のタップまで読み込まない
export default function HeroVoice({ voices, hint, label }: { voices: Voice[]; hint: string; label: string }) {
  const [text, setText] = useState(""); // 吹き出しの台詞（消えたら空に戻す＝同じ台詞でも読み上げ直される）
  const [shown, setShown] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const orderRef = useRef<number[]>([]);
  const lastRef = useRef(-1);
  const tappedRef = useRef(false);
  const hideTimer = useRef(0);
  const fadeTimer = useRef(0);
  const logRef = useRef<HeroLog>(() => {});

  useEffect(() => {
    logRef.current = createHeroLog();
    // 初回だけの合図：一度でもタップしていたら出さない
    let hideHint = 0;
    const show = window.setTimeout(() => {
      if (tappedRef.current) return;
      setHintShown(true);
      hideHint = window.setTimeout(() => setHintShown(false), HINT_SHOW_MS);
    }, HINT_DELAY_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hideHint);
      window.clearTimeout(hideTimer.current);
      window.clearTimeout(fadeTimer.current);
      audioRef.current?.pause();
    };
  }, []);

  // 吹き出しを delay 後にフェードアウトして、台詞を空に戻す
  const scheduleHide = (delay: number) => {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(fadeTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setShown(false);
      fadeTimer.current = window.setTimeout(() => setText(""), FADE_MS);
    }, delay);
  };

  const onTap = () => {
    const log = logRef.current;
    tappedRef.current = true;
    setHintShown(false);
    if (voices.length === 0) return;

    // いま鳴っている音を止めて、次の台詞へ
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(fadeTimer.current);
    const prev = audioRef.current;
    audioRef.current = null;
    prev?.pause();

    if (orderRef.current.length === 0) orderRef.current = shuffled(voices.length, lastRef.current);
    const index = orderRef.current.shift() as number;
    lastRef.current = index;
    const voice = voices[index];

    setText(voice.text);
    setShown(true);

    // 音声はこのタップで初めて作る（preload しない）
    const audio = new Audio();
    audio.volume = VOLUME;
    audio.src = voice.src;
    audioRef.current = audio;
    audio.addEventListener("ended", () => {
      if (audioRef.current !== audio) return;
      log(`音声 終了 ${voice.src}`);
      scheduleHide(HIDE_DELAY_MS);
    });
    audio.addEventListener("error", () => {
      if (audioRef.current !== audio) return;
      log(`音声 error code=${audio.error?.code} ${voice.src}`);
      scheduleHide(FAILED_SHOW_MS);
    });
    audio.play().then(
      () => log(`音声 再生開始 ${voice.src}`),
      (e: unknown) => {
        if (audioRef.current !== audio) return;
        // 再生できなくても何も壊さない（吹き出しだけ見せる）
        log(`音声 失敗 ${e instanceof DOMException ? e.name : "?"}: ${e instanceof Error ? e.message : ""}`);
        scheduleHide(FAILED_SHOW_MS);
      },
    );
  };

  return (
    <>
      <button type="button" className="hero-voice" aria-label={label} onClick={onTap} />
      <p className={`hero-bubble${shown ? " is-shown" : ""}`} aria-live="polite">{text}</p>
      <p className={`hero-hint${hintShown ? " is-shown" : ""}`} aria-hidden="true">{hint}</p>
    </>
  );
}
