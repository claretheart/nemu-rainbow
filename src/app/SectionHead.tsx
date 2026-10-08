// 区切りの見出しの型：虹の線＋「和名 — 英字」のラベル（h2）＋大きな一文
export default function SectionHead({
  ja,
  en,
  lead,
}: {
  ja: string;
  en: string;
  lead?: string;
}) {
  return (
    <div className="section-head">
      <h2 className="section-label">
        <span className="rainbow-line" aria-hidden="true" />
        {ja} — {en}
      </h2>
      {lead && <p className="section-lead">{lead}</p>}
    </div>
  );
}
