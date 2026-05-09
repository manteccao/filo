import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background:
              "radial-gradient(ellipse 800px 500px at 50% 120%, rgba(13,148,136,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: "#0D9488",
            letterSpacing: "-2px",
            lineHeight: "1",
          }}
        >
          Filo
        </div>

        {/* Tagline or profile name */}
        <div
          style={{
            marginTop: "24px",
            fontSize: name ? "36px" : "28px",
            fontWeight: name ? "700" : "400",
            color: name ? "#ffffff" : "#9ca3af",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          {name ? name : "Il passaparola digitale"}
        </div>

        {name && (
          <div
            style={{
              marginTop: "12px",
              fontSize: "20px",
              color: "#9ca3af",
            }}
          >
            su Filo
          </div>
        )}

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            color: "#4b5563",
            letterSpacing: "1px",
          }}
        >
          filo.network
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
