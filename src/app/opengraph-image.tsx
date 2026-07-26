import { ImageResponse } from "next/og";

export const alt = "Utopia — ultra-luxury private estates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Share card. Generated rather than shipped as a static asset so the wordmark
 * and copy stay in one place; the brand fonts are not loaded here (they would
 * have to be fetched per render), so it uses a serif stack that reads close to
 * the display face at this size.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#f9f5ea",
          color: "#161514",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 16,
            textTransform: "uppercase",
          }}
        >
          Utopia
        </div>
        <div
          style={{
            fontFamily: "serif",
            fontSize: 68,
            lineHeight: 1.15,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Ultra-luxury private estates
        </div>
        <div
          style={{
            fontSize: 28,
            opacity: 0.6,
            textAlign: "center",
            maxWidth: 760,
          }}
        >
          In the world&apos;s ultimate destinations for kitesurfing, surfing and
          skiing
        </div>
      </div>
    ),
    size,
  );
}
