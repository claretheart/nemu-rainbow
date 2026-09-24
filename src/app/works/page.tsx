import Link from "next/link";
import { works } from "../data";
import WorkCard from "../WorkCard";

export default function WorksPage() {
  return (
    <div className="page is-wide">

      {/* ヘッダー */}
      <div className="page-header">
        <Link href="/" className="back-pill">
          ← 戻る
        </Link>
        <h1>制作実績</h1>
      </div>

      <div className="rainbow-line" />

      {/* 作品グリッド */}
      {works.length === 0 ? (
        <p className="text-sub">
          準備中です
        </p>
      ) : (
        <div className="works-grid">
          {works.map((work) => <WorkCard key={work.title} work={work} />)}
        </div>
      )}
    </div>
  );
}
