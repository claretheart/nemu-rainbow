import Image from "next/image";
import { profile, links, gallery, yorujikan, LINE_FRIEND_URL } from "./data";

export default function Home() {
  // LINE公式アカウントの友だち追加URLが未設定のあいだは「じゅんびちゅう」表示にする
  const lineReady = LINE_FRIEND_URL.startsWith("https://");

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "56px 20px 48px" }}>

      {/* ===== プロフィール ===== */}
      <div className="fade-up" style={{ textAlign: "center", marginBottom: "44px" }}>
        {/* アバター */}
        <div className="avatar-ring" style={{ marginBottom: "20px" }}>
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={108}
            height={108}
            style={{ borderRadius: "50%", display: "block", width: "100%", height: "100%" }}
            priority
          />
        </div>

        {/* 名前 */}
        <h1 style={{ marginBottom: "8px" }}>
          <span className="name-gradient">{profile.name}</span>
          <span style={{ fontSize: "0.45em", fontWeight: 600, color: "#9fb0dd", marginLeft: "6px" }}>【{profile.reading}】</span>
        </h1>
        <p style={{ fontSize: "13px", color: "#8b93bd", marginBottom: "14px" }}>
          {profile.handle}
        </p>
        <div style={{ fontSize: "15px", lineHeight: 1.9, color: "var(--text)", maxWidth: "400px", margin: "0 auto 24px" }}>
          {profile.bio.map((line, i) => <p key={i}>{line}</p>)}
        </div>
        <div className="rainbow-line" style={{ maxWidth: "120px", margin: "0 auto" }} />
      </div>

      {/* ===== よるじかん with ねむ（事前登録） ===== */}
      <section id="yorujikan" style={{ marginBottom: "48px", scrollMarginTop: "24px" }}>
        <p className="section-title fade-up" style={{ animationDelay: "0.12s" }}>{yorujikan.sectionLabel}</p>

        <div className="yorujikan-card fade-up" style={{ animationDelay: "0.18s" }}>
          <h2 style={{ fontSize: "19px", fontWeight: 700, lineHeight: 1.7, marginBottom: "14px", color: "#fff" }}>
            <span className="rainbow-text">{yorujikan.titleApp}</span>{yorujikan.titleTail}
          </h2>

          <p style={{ fontSize: "15px", lineHeight: 2, color: "var(--text)" }}>
            {yorujikan.body}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", margin: "20px 0 18px" }}>
            <span className="yorujikan-price">{yorujikan.price}</span>
            <a
              href={yorujikan.progressUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="yorujikan-note"
            >
              <span aria-hidden="true">𝕏</span>{yorujikan.progressLabel}
            </a>
          </div>

          <div className="rainbow-line" style={{ opacity: 0.45, marginBottom: "18px" }} />

          <p style={{ fontSize: "14px", color: "#b0c4e8", marginBottom: "12px", textAlign: "center" }}>
            {yorujikan.ctaLead}
          </p>

          {lineReady ? (
            <a
              href={LINE_FRIEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="line-button"
            >
              <span aria-hidden="true">💬</span>{yorujikan.ctaLabel}
            </a>
          ) : (
            <button type="button" className="line-button is-pending" disabled>
              <span aria-hidden="true">💬</span>{yorujikan.ctaLabel}
              <span className="line-button-note">{yorujikan.ctaPendingNote}</span>
            </button>
          )}
        </div>
      </section>

      {/* ===== リンク一覧 ===== */}
      <section style={{ marginBottom: "48px" }}>
        <p className="section-title fade-up" style={{ animationDelay: "0.15s" }}>Links</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {links.map((link, i) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card fade-up"
              style={{
                animationDelay: `${0.2 + i * 0.08}s`,
                background: `linear-gradient(0deg, ${link.color}12, ${link.color}12), var(--surface)`,
                "--card-color": link.color,
                "--card-glow": `${link.color}59`,
              } as React.CSSProperties}
            >
              <div className="link-icon" style={{ background: `${link.color}33`, color: link.color }}>{link.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: link.desc ? "2px" : 0, color: "#fff" }}>{link.label}</div>
                {link.desc && <div style={{ fontSize: "13px", color: "#b0c4e8" }}>{link.desc}</div>}
              </div>
              <div className="link-arrow">→</div>
            </a>
          ))}
        </div>
      </section>

      {/* ===== ギャラリー ===== */}
      {gallery.length > 0 && (
        <section className="fade-up" style={{ animationDelay: "0.4s" }}>
          <p className="section-title">Gallery</p>
          <div className="gallery-grid">
            {gallery.map((src, i) => (
              <div key={i} className="gallery-item">
                <Image src={src} alt={`gallery-${i}`} width={300} height={300} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== フッター ===== */}
      <footer className="site-footer fade-up" style={{ animationDelay: "0.55s" }}>
        <p>© 2026 音夢 · Nemu Rainbow</p>
      </footer>

    </div>
  );
}
