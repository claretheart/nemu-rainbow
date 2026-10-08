"use client";

import { useEffect, useRef, useState } from "react";
import { workCategories, type works } from "./data";
import WorkCard from "./WorkCard";

type Work = (typeof works)[number];

// 切り替え時のフェード時間(ms)。globals.css の .works-grid の transition と合わせる
const FADE_MS = 200;

// 制作実績：分野の切り替え＋カードのグリッド。
// 全件をサーバー側で出力しておき、絞り込みはクライアントで隠すだけ（JS無効でも全件が見える）
export default function WorksBrowser({ items, compact = false }: { items: Work[]; compact?: boolean }) {
  const [active, setActive] = useState("all"); // 押されているボタン
  const [shown, setShown] = useState("all"); // 実際に絞り込んでいる分野
  const [switching, setSwitching] = useState(false);
  const [message, setMessage] = useState(""); // 読み上げ用（操作後だけ入る）
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const countOf = (id: string) => (id === "all" ? items.length : items.filter((w) => w.category === id).length);
  const categories = workCategories.filter((c) => countOf(c.id) > 0);

  const choose = (id: string, label: string) => {
    if (id === active) return;
    setActive(id);
    setMessage(`${label} ${countOf(id)}件`);
    window.clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(id);
      return;
    }
    // フェードアウト → 絞り込み → フェードイン
    setSwitching(true);
    timer.current = window.setTimeout(() => {
      setShown(id);
      setSwitching(false);
    }, FADE_MS);
  };

  return (
    <>
      <div className="works-filter" role="group" aria-label="分野で絞り込む">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={active === c.id}
            onClick={() => choose(c.id, c.label)}
          >
            {c.label}
            <span className="works-filter-count">{countOf(c.id)}</span>
          </button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">{message}</p>

      <div className={`works-grid${compact ? " is-compact" : ""}${switching ? " is-switching" : ""}`}>
        {items.map((work) => (
          <WorkCard key={work.title} work={work} hidden={shown !== "all" && work.category !== shown} />
        ))}
      </div>
    </>
  );
}
