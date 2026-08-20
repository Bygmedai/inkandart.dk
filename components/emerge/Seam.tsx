import Image from "next/image";

/**
 * Søm: overgang som indhold (Medicine-princippet — rødderne der bliver til muld).
 *
 * Et blæk-lag der ligger HEN OVER grænsen mellem to zoner og opløses i begge
 * retninger via maske, så nabosektionerne trækkes ind i hinanden i stedet for
 * at støde sammen. Ren markup + CSS — kræver ingen JS (progressive enhancement),
 * og negative margener stjæler ikke plads i dokumentflowet fra naboerne.
 */
const ART = {
  ink: { src: "/mood/drip.jpg", width: 864, height: 1152 },
  bloom: { src: "/mood/bloom.jpg", width: 1280, height: 720 },
  skin: { src: "/mood/skin.jpg", width: 1280, height: 720 },
} as const;

export function Seam({
  art = "ink",
  flip = false,
  height = "clamp(180px, 34svh, 380px)",
  overlap = "clamp(-190px, -17svh, -90px)",
  opacity = 0.5,
}: {
  art?: keyof typeof ART;
  flip?: boolean;
  height?: string;
  overlap?: string;
  opacity?: number;
}) {
  const shot = ART[art];
  return (
    <div
      aria-hidden="true"
      className="seam"
      style={{ height, marginTop: overlap, marginBottom: overlap }}
    >
      <div className={`seam-art absolute inset-0 overflow-hidden ${flip ? "-scale-x-100" : ""}`} style={{ opacity }}>
        <Image
          src={shot.src}
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover mix-blend-screen"
        />
      </div>
    </div>
  );
}
