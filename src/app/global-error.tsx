"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

const GlobalErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    posthog.capture("global_error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="tl">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b7280" }}>
            An unexpected error occurred. Please refresh the page.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#9ca3af",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1.5rem",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalErrorPage;
