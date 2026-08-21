import { ImageResponse } from "next/og";

export const alt = "Giv blæk videre — gavekort til Ink & Art Copenhagen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#e8e0d5",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 980,
            height: 470,
            padding: "48px 56px",
            border: "1px solid rgba(201,162,39,0.55)",
            background:
              "linear-gradient(165deg, #261814 0%, #120e0c 70%, #0c0908 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 18,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(232,224,213,0.55)",
            }}
          >
            <span>Ink & Art · Copenhagen</span>
            <span
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #8b1e1e",
                color: "#c45a5a",
                fontSize: 22,
                fontStyle: "italic",
              }}
            >
              13
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 500,
                letterSpacing: "0.12em",
                lineHeight: 0.95,
              }}
            >
              INK & ART
            </div>
            <div
              style={{
                marginTop: 14,
                fontStyle: "italic",
                fontSize: 42,
                color: "#c9a227",
              }}
            >
              Giv blæk videre
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "rgba(232,224,213,0.55)",
            }}
          >
            Larsbjørnsstræde 13 · Pisserenden
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
