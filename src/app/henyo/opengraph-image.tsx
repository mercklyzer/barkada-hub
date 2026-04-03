import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pinoy Henyo — Barkada Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const Image = () =>
  new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
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
        <div style={{ fontSize: 90, marginBottom: 20 }}>🤔</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "white",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Pinoy Henyo
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          Hold the phone to your forehead!
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["Oo", "Hindi", "Pwede"].map((word) => (
            <div
              key={word}
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "12px 28px",
                color: "white",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {word}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 20,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          barkadahub.com
        </div>
      </div>
    ),
    { ...size }
  );

export default Image;
