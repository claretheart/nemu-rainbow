import Image from "next/image";
import { links, gallery, yorujikan, contact, works, sections } from "./data";
import Hero from "./Hero";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import WorksBrowser from "./WorksBrowser";

export default function Home() {

  return (
    <main>

      {/* ===== 最初の一画面 ===== */}
      <Hero />

      {/* ===== よるじかん with ねむ（発売中） ===== */}
      <section id="yorujikan" className="section">
        <div className="section-inner">
          <Reveal>
            <SectionHead {...sections.yorujikan} />
          </Reveal>

          {/* 左にキービジュアル、右に本文。700px以下は縦積み */}
          <Reveal className="yorujikan-main">
            <Image
              src={yorujikan.images.key.src}
              alt={yorujikan.images.key.alt}
              width={1000}
              height={1000}
              sizes="(max-width: 700px) 100vw, 45vw"
              className="yorujikan-key"
            />
            <div className="yorujikan-body">
              <p className="text-sub">{yorujikan.status}</p>
              <p>{yorujikan.body}</p>

              <ul className="yorujikan-features">
                {yorujikan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>

              <div className="yorujikan-price-row">
                <span className="price">{yorujikan.price}</span>
                <span className="text-sub">{yorujikan.platform}</span>
              </div>

              {/* 主役：BOOTHの商品ページへ */}
              <a
                href={yorujikan.boothUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-primary"
              >
                {yorujikan.boothLabel}
              </a>
            </div>
          </Reveal>

          {/* 機能紹介のサムネ（クリックで原寸を新しいタブで開く） */}
          <Reveal className="yorujikan-shots">
            {yorujikan.images.shots.map((shot) => (
              <a
                key={shot.src}
                href={shot.src}
                target="_blank"
                rel="noopener noreferrer"
                className="yorujikan-shot"
              >
                <Image src={shot.src} alt={shot.alt} width={800} height={800} sizes="(max-width: 700px) 33vw, 360px" />
              </a>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ===== 制作実績（全件。よるじかんは上に出ているので除く） ===== */}
      <section id="works" className="section">
        <div className="section-inner">
          <Reveal>
            <SectionHead {...sections.works} />
            <WorksBrowser items={works.filter((w) => w.title !== yorujikan.title)} compact />
          </Reveal>
        </div>
      </section>

      {/* ===== ご依頼 ===== */}
      <section id="contact" className="section">
        <div className="section-inner">
          <Reveal>
            <SectionHead {...sections.contact} />
            <div className="narrow">
              <p className="text-sub contact-note">{contact.note}</p>
              <a
                href={contact.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-outline"
              >
                {contact.ctaLabel}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== リンク一覧 ===== */}
      <section id="links" className="section">
        <div className="section-inner">
          <Reveal>
            <SectionHead {...sections.links} />
            <div className="link-list narrow">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  {...(link.url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="link-row"
                >
                  <div>
                    <p className="text-strong">{link.label}</p>
                    {link.desc && <p className="text-sub">{link.desc}</p>}
                  </div>
                  <span className="link-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== ギャラリー ===== */}
      {gallery.length > 0 && (
        <section className="section">
          <div className="section-inner">
            <SectionHead {...sections.gallery} />
            <div className="gallery-grid">
              {gallery.map((src, i) => (
                <div key={i} className="gallery-item">
                  <Image src={src} alt={`gallery-${i}`} width={300} height={300} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== フッター ===== */}
      <footer className="site-footer">
        <div className="section-inner text-sub">
          <p>© 2026 音夢 · Nemu Rainbow</p>
        </div>
      </footer>

    </main>
  );
}
