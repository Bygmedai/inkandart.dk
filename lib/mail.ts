/**
 * Husets eneste vej til at sende en mail.
 *
 * Bygget til samtykke-flowet (S578). Der var ingen mail-kode i repoet
 * foer denne fil — QA'en 1/9 maalte 0 traef paa nodemailer, resend,
 * postmark og sendgrid. Kunden fik derfor aldrig noget, og huset heller
 * ikke.
 *
 * FAIL-CLOSED, som resten af huset. Mangler noeglen, er svaret en FEJL —
 * aldrig et stille ja. Det var praecis den fejl der kostede Stevens egen
 * erklaering 1/9: ruten svarede 200 uden at have skrevet noget.
 *
 * CREDENTIALS: noeglen kommer fra miljoeet og staar aldrig i repoet, i en
 * commit eller i en log. CLAUDE.md: 0 credentials, nogensinde. Den saettes
 * i Vercel af Steven — ikke i en chat, ikke i en fil.
 *
 * LEVERANDOEREN kan skiftes ét sted: `send()` herunder. Alt andet i huset
 * kalder `sendMail()` og roerer aldrig en HTTP-detalje.
 */

const TIMEOUT_MS = 8_000;

export type MailFejl =
  | "ingen-noegle"
  | "ingen-afsender"
  | "afvist"
  | "timeout";

export type MailSvar = { ok: true } | { ok: false; grund: MailFejl; detalje?: string };

function env(...navne: string[]): string | undefined {
  for (const n of navne) if (process.env[n]) return process.env[n];
  return undefined;
}

/** Husets egen postkasse. Kan overstyres, men har en fornuftig standard. */
export function husAdresse(): string {
  return env("SAMTYKKE_TIL") ?? "booking@inkandart.dk";
}

/**
 * Sender én mail som ren tekst.
 *
 * Ren tekst med vilje: ingen HTML, ingen billeder, ingen sporingspixel.
 * Et brev der indeholder oplysninger om en persons krop, skal ikke hente
 * noget fra internettet naar det aabnes.
 */
export async function sendMail(til: string, emne: string, tekst: string): Promise<MailSvar> {
  const noegle = env("RESEND_API_KEY", "MAIL_API_KEY");
  if (!noegle) return { ok: false, grund: "ingen-noegle" };

  const fra = env("MAIL_FRA");
  if (!fra) return { ok: false, grund: "ingen-afsender" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${noegle}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fra, to: [til], subject: emne, text: tekst }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      // Statuskoden logges. Kroppen goer IKKE: den kan baere modtagerens
      // adresse, og en fejllog er ikke et sted for kundedata.
      return { ok: false, grund: "afvist", detalje: String(res.status) };
    }
    return { ok: true };
  } catch {
    return { ok: false, grund: "timeout" };
  }
}
