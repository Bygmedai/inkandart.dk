import type { Metadata } from "next";
import { aftercare } from "@/lib/aftercare";
import { site } from "@/lib/site";
import { RummetShell } from "@/components/rummet/Shell";

export const metadata: Metadata = {
  alternates: { canonical: "/aftercare" },
  title: "Aftercare · Ink & Art",
  description: aftercare.lead,
};

export default function AftercarePage() {
  return (
    <RummetShell>
      <main id="main" className="rum-legal">
        <p className="rum-label">{aftercare.file}</p>
        <h1 className="rum-poster">{aftercare.title}</h1>
        <p className="rum-body-copy rum-room__note">{aftercare.lead}</p>

        <section>
          <h2 className="rum-poster">{aftercare.tattooTitle}</h2>
          <ol>
            {aftercare.tattoo.map((step, i) => (
              <li key={step.t}>
                <span className="rum-label">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.t}</h3>
                  <p className="rum-body-copy">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="rum-poster">{aftercare.piercingTitle}</h2>
          <ol>
            {aftercare.piercing.map((step, i) => (
              <li key={step.t}>
                <span className="rum-label">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.t}</h3>
                  <p className="rum-body-copy">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="rum-empty" style={{ marginTop: 48 }}>
          <p className="rum-label">{aftercare.reassureLabel}</p>
          <p className="rum-body-copy" style={{ marginTop: 12 }}>
            {aftercare.reassure}
          </p>
          <a
            className="rum-book"
            style={{ marginTop: 20 }}
            href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {aftercare.writeCta}
          </a>
        </aside>
      </main>
    </RummetShell>
  );
}
