import { SkipLink } from "@/components/i18n/SkipLink";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { Door } from "./Door";
import "./rummet.css";

export function RummetShell({
  children,
  door = true,
  tone = "nat",
}: {
  children: React.ReactNode;
  door?: boolean;
  tone?: "nat" | "salg";
}) {
  return (
    <div data-house="rummet" data-rummet="" data-tone={tone}>
      <SkipLink lang="da" />
      <Nav />
      <div className="rum-main">{children}</div>
      {door ? <Door /> : null}
      <Footer />
    </div>
  );
}
