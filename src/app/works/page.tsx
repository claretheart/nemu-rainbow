import Image from "next/image";
import Link from "next/link";
import { works } from "../data";

export default function WorksPage() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 20px 80px" }}>

      {/* ヘッダー */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <Link href="/" style={{
          fontSize: "13px",
          color: "#94a3c8",
          padding: "6px 14px",
          border: "1px solid #ffffff22",
          borderRadius: "20px",
          whiteSpace: "nowrap",
        }}>
          ← 戻る
        </Link>
        <h1 style={{ fontSize: "22px", fontWeight: 700 }}>制作実績</h1>
      </div>

      <div className="rainbow-line" style={{ marginBottom: "32px" }} />

      {/* 作品グリッド */}
      {works.length === 0 ? (
        <p style={{ color: "#94a3c8", textAlign: "center", padding: "48px 0" }}>
          準備中です
        </p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}>
          {works.map((work) => (
            <a
              key={work.youtubeId}
              href={`https://www.youtube.com/watch?v=${work.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="work-card"
            >
              <div style={{ position: "relative", aspectRatio: "16/9" }}>
                <Image
                  src={`https://img.youtube.com/vi/${work.youtubeId}/maxresdefault.jpg`}
                  alt={work.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,0,0,0.3)",
                  opacity: 0,
                  transition: "opacity 0.2s",
                }} className="play-overlay">
                  <span style={{ fontSize: "36px" }}>▶</span>
                </div>
              </div>
              <div style={{ padding: "12px" }}>
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#fff", marginBottom: "4px" }}>{work.title}</p>
                {work.desc && <p style={{ fontSize: "12px", color: "#94a3c8" }}>{work.desc}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
