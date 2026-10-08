"use client";

import { useEffect, useRef, useState } from "react";
import { bgm } from "./data";
import { VOICE_END, VOICE_START } from "./bgmEvents";
import { createHeroLog, type HeroLog } from "./heroDebug";

const FADE_IN_MS = 1200; // 押してから通常音量になるまで
const FADE_OUT_MS = 400; // 止めるときのフェードアウト
const DUCK_MS = 200; // 声が始まったとき、音量を下げるまで
const RESTORE_MS = 600; // 声が終わったとき、音量を戻すまで

// 音量は GainNode で操作する（iOS は audio.volume を無視するため）。使えない環境では audio.volume にフォールバック
type AudioCtor = typeof AudioContext;

// サイトのBGM。利用者が押して初めて鳴る（勝手には鳴らさない）。layout に置くので、ページを移っても鳴り続ける
export default function BgmPlayer() {
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const wantedRef = useRef(false); // 利用者が「流す」状態にしている
  const voiceRef = useRef(false); // 音夢の声が鳴っている
  const stopTimer = useRef(0);
  const logRef = useRef<HeroLog>(() => {});

  // 目標音量へ ms かけて移る
  const rampTo = (target: number, ms: number) => {
    const gain = gainRef.current;
    const ctx = ctxRef.current;
    if (gain && ctx) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(target, now + ms / 1000);
    } else if (audioRef.current) {
      audioRef.current.volume = target;
    }
  };
  const levelNow = () => (voiceRef.current ? bgm.duckVolume : bgm.volume);

  // 再生を始める（失敗したら止まっている表示に戻すだけ）
  const startPlayback = (fadeMs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    window.clearTimeout(stopTimer.current);
    void ctxRef.current?.resume();
    audio.play().then(
      () => logRef.current(`BGM 再生開始 目標音量=${levelNow()}`),
      (e: unknown) => {
        logRef.current(`BGM 再生失敗 ${e instanceof DOMException ? e.name : "?"}: ${e instanceof Error ? e.message : ""}`);
        wantedRef.current = false;
        setPlaying(false);
      },
    );
    rampTo(levelNow(), fadeMs);
  };

  const toggle = () => {
    const log = logRef.current;
    if (wantedRef.current) {
      // 止める：フェードアウトしてから pause（位置は保持され、次は続きから）
      wantedRef.current = false;
      setPlaying(false);
      rampTo(0, FADE_OUT_MS);
      window.clearTimeout(stopTimer.current);
      stopTimer.current = window.setTimeout(() => {
        if (wantedRef.current) return;
        audioRef.current?.pause();
        log("BGM 停止");
      }, FADE_OUT_MS + 50);
      return;
    }

    // 最初に押されたときに初めて Audio を作る（それまで読み込まない）
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.src = bgm.src;
      audio.addEventListener("error", () => {
        log(`BGM error code=${audio.error?.code} ${audio.error?.message ?? ""}`);
        wantedRef.current = false;
        setPlaying(false);
      });
      audioRef.current = audio;
      const Ctor: AudioCtor | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext;
      if (Ctor) {
        try {
          const ctx = new Ctor();
          const gain = ctx.createGain();
          gain.gain.value = 0;
          ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
          ctxRef.current = ctx;
          gainRef.current = gain;
        } catch {
          log("BGM GainNode を作れない → audio.volume で代用");
          audio.volume = 0;
        }
      } else {
        audio.volume = 0;
      }
    }
    wantedRef.current = true;
    setPlaying(true);
    startPlayback(FADE_IN_MS);
  };

  useEffect(() => {
    logRef.current = createHeroLog();

    // 声の間は BGM を下げ、終わったら戻す
    const onVoiceStart = () => {
      voiceRef.current = true;
      if (!wantedRef.current) return;
      logRef.current(`BGM 音量を下げる → ${bgm.duckVolume}`);
      rampTo(bgm.duckVolume, DUCK_MS);
    };
    const onVoiceEnd = () => {
      voiceRef.current = false;
      if (!wantedRef.current) return;
      logRef.current(`BGM 音量を戻す → ${bgm.volume}`);
      rampTo(bgm.volume, RESTORE_MS);
    };
    // タブが隠れたら一時停止、戻ったら（鳴らしていた場合だけ）再開
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio || !wantedRef.current) return;
      if (document.hidden) {
        audio.pause();
        logRef.current("BGM タブが隠れて一時停止");
      } else {
        logRef.current("BGM タブに戻って再開");
        startPlayback(RESTORE_MS);
      }
    };
    window.addEventListener(VOICE_START, onVoiceStart);
    window.addEventListener(VOICE_END, onVoiceEnd);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener(VOICE_START, onVoiceStart);
      window.removeEventListener(VOICE_END, onVoiceEnd);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(stopTimer.current);
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bgm">
      <button type="button" className="bgm-button" aria-pressed={playing} onClick={toggle}>
        {playing && (
          <span className="bgm-bars" aria-hidden="true">
            <i /><i /><i />
          </span>
        )}
        <span aria-hidden="true">♪</span>
        {playing ? bgm.labelStop : bgm.labelPlay}
      </button>
    </div>
  );
}
