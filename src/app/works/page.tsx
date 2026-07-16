import Image from "next/image";
import Link from "next/link";
import { works } from "../data";

export default function WorksPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px 80px" }}>

      {/* ヘッダー */}
      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <Link href="/" className="back-pill">
          ← 戻る
        </Link>
        <h1 style={{ fontSize: "22px", fontWeight: 700 }}>制作実績</h1>
      </div>

      <div className="rainbow-line fade-up" style={{ marginBottom: "32px", animationDelay: "0.1s" }} />

      {/* 作品グリッド */}
      {works.length === 0 ? (
        <p style={{ color: "#8b93bd", textAlign: "center", padding: "48px 0" }}>
          準備中です
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}>
          {works.map((work, i) => (
            <a
              key={work.youtubeId}
              href={`https://www.youtube.com/watch?v=${work.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="work-card fade-up"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <div style={{ position: "relative", aspectRatio: "16/9" }}>
                <Image
                  src={`https://img.youtube.com/vi/${work.youtubeId}/maxresdefault.jpg`}
                  alt={work.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div className="play-overlay" style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.3)",
                }}>
                  <span style={{ fontSize: "36px" }}>▶</span>
                </div>
              </div>
              <div style={{ padding: "12px" }}>
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#fff", marginBottom: "4px" }}>{work.title}</p>
                {work.desc && <p style={{ fontSize: "12px", color: "#8b93bd" }}>{work.desc}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
