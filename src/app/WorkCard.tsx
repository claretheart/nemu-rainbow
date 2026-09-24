import Image from "next/image";
import type { works } from "./data";

type Work = (typeof works)[number];

// 制作実績のカード（トップの抜粋と /works の一覧で共用）
export default function WorkCard({ work }: { work: Work }) {
  // 行き先：href 指定があればそこ、なければ YouTube の動画ページ
  const href = work.href ?? (work.youtubeId ? `https://www.youtube.com/watch?v=${work.youtubeId}` : undefined);
  // サムネ：image 指定があればそれを優先（YouTube 側に高解像度サムネが無い動画用）、なければ YouTube のサムネ
  const thumb = work.image ?? (work.youtubeId ? `https://img.youtube.com/vi/${work.youtubeId}/maxresdefault.jpg` : undefined);
  // 公開URLの無い実績(社内システム・公開前の作品)はリンクにしない
  const Card: React.ElementType = href ? "a" : "div";
  const linkProps = href ? { href, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Card className="work-card" {...linkProps}>
      {thumb && (
        <div className="work-thumb">
          <Image src={thumb} alt="" fill />
          {work.youtubeId && (
            <div className="play-overlay">
              <span aria-hidden="true">▶</span>
            </div>
          )}
        </div>
      )}
      <div className="work-body">
        <p className="text-strong">{work.title}</p>
        {work.desc && <p className="text-sub">{work.desc}</p>}
      </div>
    </Card>
  );
}
