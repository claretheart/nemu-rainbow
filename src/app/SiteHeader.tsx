"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteNav, yorujikan } from "./data";

// 上部メニュー（固定）。最初は透明、少しスクロールしたら地の色のベタ＋下罫線
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-ja">{siteNav.brand.ja}</span>
          <span className="brand-en">{siteNav.brand.en}</span>
        </Link>
        <nav className="site-nav" aria-label="ページ内の移動">
          <ul>
            {siteNav.items.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={yorujikan.boothUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button-outline is-small"
        >
          {yorujikan.boothLabel}
        </a>
      </div>
    </header>
  );
}
