import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { guide, yorujikan } from "../../data";

export const metadata: Metadata = {
  title: `${guide.title} | ${yorujikan.title}`,
};

// 番号つき手順リスト（caution は強調、note は小さく補足）
function StepList({ steps }: { steps: typeof guide.mac.steps }) {
  return (
    <ol className="guide-steps">
      {steps.map((step) => (
        <li key={step.text}>
          <p>{step.text}</p>
          {step.caution && <p className="guide-caution">{step.caution}</p>}
          {step.note && <p className="guide-step-note text-sub">{step.note}</p>}
        </li>
      ))}
    </ol>
  );
}

export default function GuidePage() {
  return (
    <main className="page">

      {/* ヘッダー */}
      <div className="page-header">
        <Link href="/" className="back-pill">
          ← 戻る
        </Link>
        <h1>{guide.title}</h1>
      </div>

      <div className="rainbow-line" />

      <p className="guide-lead">
        {guide.lead}
      </p>

      {/* ===== Mac ===== */}
      <section className="guide-section">
        <h2>{guide.mac.heading}</h2>
        <Image
          src={guide.mac.image.src}
          alt={guide.mac.image.alt}
          width={1000}
          height={1000}
          className="guide-figure"
          priority
        />
        <StepList steps={guide.mac.steps} />
      </section>

      {/* ===== Windows ===== */}
      <section className="guide-section">
        <h2>{guide.windows.heading}</h2>
        <StepList steps={guide.windows.steps} />
      </section>

      {/* ===== 補足 ===== */}
      <section className="guide-section">
        <h2>{guide.notesHeading}</h2>
        <ul className="guide-notes text-sub">
          {guide.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </section>

      {/* ===== BOOTH・Xへ ===== */}
      <div className="guide-actions">
        <a
          href={yorujikan.boothUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button-primary"
        >
          {yorujikan.boothLabel}
        </a>
        <a
          href={guide.contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button-outline"
        >
          {guide.contactLabel}
        </a>
      </div>
    </main>
  );
}
