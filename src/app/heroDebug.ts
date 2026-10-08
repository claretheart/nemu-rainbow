// HeroMotion の診断表示。URL に ?debug=1 または #debug が付いているときだけ、
// 画面左下に小さな固定パネルを出して経過を1行ずつ追記する。付いていなければ何もしない（処理も増やさない）
const MAX_LINES = 12;
// HeroMotion と HeroVoice が同じパネルに書くので、行は共有する
const lines: string[] = [];

export type HeroLog = (msg: string) => void;

const noop: HeroLog = () => {};

export function createHeroLog(): HeroLog {
  if (typeof window === "undefined") return noop;
  if (!/[?&]debug=1(&|$)/.test(window.location.search) && window.location.hash !== "#debug") return noop;

  let panel = document.getElementById("hero-debug");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "hero-debug";
    panel.setAttribute("aria-hidden", "true");
    panel.style.cssText =
      "position:fixed;left:0;bottom:0;z-index:2147483647;max-width:100vw;padding:4px 6px;" +
      "background:#000;color:#9f9;font:11px/1.35 ui-monospace,Menlo,monospace;" +
      "white-space:pre-wrap;word-break:break-all;pointer-events:none;";
    document.body.appendChild(panel);
  }
  const el = panel;
  return (msg) => {
    lines.push(`${Math.round(performance.now())}ms ${msg}`);
    if (lines.length > MAX_LINES) lines.shift();
    el.textContent = lines.join("\n");
  };
}
