import Image from "next/image";
import { profile, links, gallery, yorujikan, services, works } from "./data";
import WorkCard from "./WorkCard";

export default function Home() {

  return (
    <div className="page">

      {/* ===== プロフィール ===== */}
      <header className="profile">
        <Image
          src={profile.avatar}
          alt={profile.name}
          width={144}
          height={144}
          className="profile-avatar"
          priority
        />
        <div>
          <div className="profile-name">
            <h1>{profile.name}</h1>
            <span className="text-sub">{profile.reading}</span>
          </div>
          <p className="text-sub">{profile.handle}</p>
          <div className="profile-bio">
            {profile.bio.map((line, i) => <p key={i}>{line}</p>)}
          </div>
        </div>
      </header>
      <div className="rainbow-line" />

      {/* ===== よるじかん with ねむ（発売中） ===== */}
      <section id="yorujikan" className="section">
        <h2>{yorujikan.title}</h2>

        {/* ページの中の夜の窓。タイトルとキャッチはキービジュアルに入っているので繰り返さない */}
        <div className="yorujikan-card">
          {/* PC幅では画像を左・文章を右に。狭い幅では画像を上に、4:3に切って小さく */}
          <Image
            src={yorujikan.images.key.src}
            alt={yorujikan.images.key.alt}
            width={1000}
            height={1000}
            className="yorujikan-key"
            priority
          />
          <div className="yorujikan-body">
          <p className="text-sub yorujikan-status">{yorujikan.status}</p>
          <p>{yorujikan.body}</p>

          <ul className="yorujikan-features">
            {yorujikan.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>

          {/* 機能紹介のサムネ（クリックで原寸を開く） */}

          <div className="yorujikan-price-row">
            <span className="text-strong">{yorujikan.price}</span>
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
        </div>
      </section>

      {/* ===== 制作実績（全件。よるじかんは上に出ているので除く） ===== */}
      <section id="works" className="section">
        <h2>制作実績</h2>
        <div className="works-grid is-compact">
          {works.filter((w) => w.title !== yorujikan.title).map((work) => (
            <WorkCard key={work.title} work={work} />
          ))}
        </div>
      </section>

      {/* ===== おしごと（制作のご依頼） ===== */}
      <section id="services" className="section">
        <h2>{services.sectionLabel}</h2>

        <p className="text-strong">{services.lead}</p>

        <ul className="service-chips">
          {services.items.map((item) => <li key={item} className="service-chip">{item}</li>)}
        </ul>

        <p>{services.strength}</p>
        <p className="text-sub service-note">{services.note}</p>

        <a
          href={services.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button-outline"
        >
          {services.ctaLabel}
        </a>
      </section>

      {/* ===== リンク一覧 ===== */}
      <section className="section">
        <h2>リンク</h2>
        <div className="link-list">
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
      </section>

      {/* ===== ギャラリー ===== */}
      {gallery.length > 0 && (
        <section className="section">
          <h2>ギャラリー</h2>
          <div className="gallery-grid">
            {gallery.map((src, i) => (
              <div key={i} className="gallery-item">
                <Image src={src} alt={`gallery-${i}`} width={300} height={300} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== フッター ===== */}
      <footer className="site-footer text-sub">
        <p>© 2026 音夢 · Nemu Rainbow</p>
      </footer>

    </div>
  );
}
