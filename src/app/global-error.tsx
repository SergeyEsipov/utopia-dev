"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#f9f5ea",
          color: "#161514",
        }}
      >
        <h2 style={{ margin: 0, fontWeight: 400 }}>Something went wrong</h2>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "16px",
            background: "#161514",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
