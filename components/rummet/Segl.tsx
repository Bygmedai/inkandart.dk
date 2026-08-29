/**
 * Husets segl — størrelse og placering som props, så Claudia kan
 * flytte mærket uden at åbne sidens markup.
 *
 * size: grafisk mål i px (default 220). CSS cap'er til 72vw på smal flade.
 * placement:
 *   above    — over / på værkpladen (Huset-masthead, default)
 *   beside   — ved siden af pladen
 *   masthead — samme familie, til sidetop hvis den skal ud
 */
export function Segl({
  size = 220,
  placement = "above",
  className,
}: {
  size?: number;
  placement?: "above" | "beside" | "masthead";
  className?: string;
}) {
  const cls = ["rum-segl", `rum-segl--${placement}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span
      className={cls}
      style={{ ["--rum-segl-size" as string]: `${size}px` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-segl.svg"
        alt="Ink & Art Copenhagen"
        width={376}
        height={376}
      />
    </span>
  );
}
