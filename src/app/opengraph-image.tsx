import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Barkada Hub — Free Filipino Party Games";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const Image = () =>
  new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 80,
            marginBottom: 24,
          }}
        >
          🎮
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "white",
            marginBottom: 16,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Barkada Hub
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Free Filipino Party Games
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["Pinoy Henyo", "Who's the Impostor?", "Werewolf"].map((game) => (
            <div
              key={game}
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "10px 20px",
                color: "white",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {game}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );

export default Image;
