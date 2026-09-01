import { notFound } from "next/navigation";

/**
 * Husets 404 har brug for en dør at komme ind ad.
 *
 * Da sproget fik sit eget rod-layout ((da) og (en)), holdt Next op med at
 * kunne wrappe en `not-found.tsx` der ligger frit i `app/` — der er ikke
 * længere ét rod-layout at pakke den i, og en forkert adresse landede på
 * Next's egen grå «404: This page could not be found.» i stedet for husets.
 *
 * Denne rute er den laveste prioritet i træet: den fanger kun det ingen
 * anden rute ville have taget, og kalder `notFound()`, så `(da)/not-found.tsx`
 * bliver renderet med dansk rod og korrekt 404-status.
 *
 * `/en/*` rammer den ikke — den flade har sin egen catch-all, der svarer 410.
 */
export default function IkkeFundet() {
  notFound();
}
