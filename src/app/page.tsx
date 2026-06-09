import Image from "next/image";
import { profile, links, gallery } from "./data";

export default function Home() {
  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "48px 20px 80px" }}>

      {/* ===== プロフィール ===== */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        {/* アバター */}
        <div style={{ marginBottom: "16px" }}>
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={96}
            height={96}
            style={{ borderRadius: "50%", display: "block", margin: "0 auto" }}
            priority
          />
        </div>

        {/* 名前 */}
        <h1 style={{ marginBottom: "6px" }}>
          <span className="name-gradient">{profile.name}</span>
        </h1>
        <p style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.15em", color: "#94a3c8", marginBottom: "4px" }}>
          {profile.title}
        </p>
        <p style={{ fontSize: "13px", color: "#94a3c8", marginBottom: "12px" }}>
          {profile.handle}
        </p>
        <div style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--text)", maxWidth: "400px", margin: "0 auto 24px" }}>
          {profile.bio.map((line, i) => <p key={i}>{line}</p>)}
        </div>
        <div className="rainbow-line" style={{ maxWidth: "120px", margin: "0 auto" }} />
      </div>

      {/* ===== リンク一覧 ===== */}
      <section style={{ marginBottom: "48px" }}>
        <p className="section-title">Links</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {links.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="link-card" style={{ background: `${link.color}18`, borderColor: `${link.color}99` }}>
              <div className="link-icon" style={{ background: `${link.color}44`, color: link.color }}>{link.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: link.desc ? "2px" : 0, color: "#fff" }}>{link.label}</div>
                {link.desc && <div style={{ fontSize: "13px", color: "#b0c4e8" }}>{link.desc}</div>}
              </div>
              <div style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "18px" }}>→</div>
            </a>
          ))}
        </div>
      </section>

{/* ===== ギャラリー ===== */}
      {gallery.length > 0 && (
        <section>
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

    </div>
  );
}
